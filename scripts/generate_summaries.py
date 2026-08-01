#!/usr/bin/env python3
"""Generate AI summaries for Jekyll posts using the DeepSeek chat-completions API.

Incremental by design: a SHA-256 of each post file is stored next to its summary
in `_data/summaries.json`. Only posts whose content hash changed (new / edited)
are sent to the API; unchanged posts are skipped, so a CI run regenerates only
what actually changed.

The generated data file is picked up by the Jekyll site (`site.data.summaries`)
and rendered under the post title by the `_layouts/post.html` override.

Usage (from repo root):
    python3 scripts/generate_summaries.py [--repo-root PATH]

Environment:
    DEEPSEEK_API_KEY   DeepSeek API key (required for generation; when missing
                       the script prints a warning and exits 0 without touching
                       anything, so the site build is never blocked).
    DEEPSEEK_BASE_URL  Defaults to https://api.deepseek.com
    DEEPSEEK_MODEL     Model ID. Defaults to DEEPSEEK_CHAT_MODEL below.

Exit code is always 0: a failed generation must not block deployment. Failures
are logged, stale entries are kept (and retried on the next run).
"""

import argparse
import hashlib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

# Model used when DEEPSEEK_MODEL is not set. `deepseek-v4-flash` is the current
# DeepSeek V4 Flash model ID (see https://api-docs.deepseek.com/); `deepseek-v4-pro`
# is the larger variant. Override per-run via the DEEPSEEK_MODEL env var.
DEEPSEEK_CHAT_MODEL = "deepseek-v4-flash"

BASE_URL = (os.environ.get("DEEPSEEK_BASE_URL") or "https://api.deepseek.com").rstrip("/")
MODEL = os.environ.get("DEEPSEEK_MODEL") or DEEPSEEK_CHAT_MODEL
API_KEY = os.environ.get("DEEPSEEK_API_KEY", "").strip()

TIMEOUT = 60
MAX_RETRIES = 2
API_DELAY_SECONDS = 0.5  # gentle throttle between requests
MAX_CONTENT_CHARS = 4000  # prompt budget per post

# ---------------------------------------------------------------------------
# Text extraction (strip frontmatter & markdown noise before sending)
# ---------------------------------------------------------------------------

FRONTMATTER_RE = re.compile(r"\A---\s*\n.*?\n---\s*\n?", re.DOTALL)
CODE_FENCE_RE = re.compile(r"```.*?```", re.DOTALL)
IMAGE_RE = re.compile(r"!\[[^\]]*\]\([^)]*\)")
LINK_RE = re.compile(r"\[([^\]]*)\]\([^)]*\)")
HTML_TAG_RE = re.compile(r"<[^>]+>")
MARKDOWN_CHARS_RE = re.compile(r"[#*_`>|~\-+]+")
MULTISPACE_RE = re.compile(r"[ \t]{2,}")
MULTINEWLINE_RE = re.compile(r"\n{3,}")


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def extract_text(path: Path) -> tuple[str, str]:
    """Return (title, cleaned body) of a markdown post."""
    raw = path.read_text(encoding="utf-8", errors="replace")
    title = ""
    m = re.search(r"^title:\s*(.+?)\s*$", raw, re.MULTILINE)
    if m:
        title = m.group(1).strip().strip("'\"")
    body = FRONTMATTER_RE.sub("", raw)
    body = CODE_FENCE_RE.sub(" ", body)
    body = IMAGE_RE.sub(" ", body)
    body = LINK_RE.sub(r"\1", body)
    body = HTML_TAG_RE.sub(" ", body)
    body = MARKDOWN_CHARS_RE.sub(" ", body)
    body = MULTISPACE_RE.sub(" ", body)
    body = MULTINEWLINE_RE.sub("\n\n", body)
    return title, body.strip()


# ---------------------------------------------------------------------------
# DeepSeek API
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = (
    "你是博客文章的摘要生成助手。根据给定的文章标题和正文，生成一段简洁的中文摘要。"
    "要求：2-4 句话，120-180 字，客观概括文章的主题和核心内容；"
    "不要以\"本文\"\"这篇文章\"等套话开头；不要使用 Markdown 格式，直接输出纯文本。"
)


def call_api(title: str, content: str) -> str:
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"标题：{title}\n\n正文：\n{content}"},
        ],
        "temperature": 0.3,
        "max_tokens": 300,
        "stream": False,
    }
    req = urllib.request.Request(
        f"{BASE_URL}/chat/completions",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}",
        },
        method="POST",
    )

    last_err: Exception | None = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            text = data["choices"][0]["message"]["content"].strip()
            if not text:
                raise ValueError("empty completion")
            return text
        except urllib.error.HTTPError as e:
            last_err = e
            # 4xx (except 429) is a request/config error: retrying won't help.
            if 400 <= e.code < 500 and e.code != 429:
                raise
            time.sleep(2 * (attempt + 1))
        except (urllib.error.URLError, ValueError, KeyError, OSError) as e:
            last_err = e
            time.sleep(2 * (attempt + 1))
    raise last_err if last_err else RuntimeError("unknown API failure")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--repo-root",
        default=str(Path(__file__).resolve().parent.parent),
        help="Repository root containing _posts/ and _data/ (default: repo root)",
    )
    args = parser.parse_args()

    repo_root = Path(args.repo_root)
    posts_dir = repo_root / "_posts"
    data_file = repo_root / "_data" / "summaries.json"

    if not API_KEY:
        print(
            "::warning::DEEPSEEK_API_KEY is not set - skipping summary generation, "
            "existing summaries (if any) are preserved."
        )
        return 0

    posts = sorted(posts_dir.glob("*.md"))
    if not posts:
        print(f"No posts found in {posts_dir}")
        return 0

    data: dict = {}
    if data_file.exists():
        try:
            data = json.loads(data_file.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as e:
            print(f"::warning::Cannot read {data_file}: {e} - starting fresh")

    # Drop entries for deleted posts.
    known = {p.name for p in posts}
    removed = []
    for key in [k for k in data if k not in known]:
        removed.append(key)
        del data[key]
    for key in removed:
        print(f"Removing stale summary for deleted post: {key}")

    # Only changed/new posts need regeneration (content-hash based).
    pending = []
    for post in posts:
        digest = sha256_of(post)
        entry = data.get(post.name)
        if entry and entry.get("hash") == digest:
            continue
        pending.append((post, digest))

    if not pending and not removed:
        print(f"Up to date: {len(posts)} post(s), no content changes.")
        return 0

    print(
        f"Generating summaries for {len(pending)} changed/new post(s) "
        f"out of {len(posts)} total (model={MODEL}) ..."
    )

    failed = 0
    for i, (post, digest) in enumerate(pending, 1):
        title, body = extract_text(post)
        if not body:
            # Empty/draft post: record the hash so it is not retried on every
            # CI run; empty text means nothing is rendered on the page.
            data[post.name] = {
                "text": "",
                "hash": digest,
                "updated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            }
            print(f"  SKIP [{post.name}]: empty post (recorded, will retry if it gains content)")
            continue
        if len(body) > MAX_CONTENT_CHARS:
            body = body[:MAX_CONTENT_CHARS] + " ..."
        try:
            summary = call_api(title, body)
        except Exception as e:  # noqa: BLE001 - keep the pipeline alive
            failed += 1
            print(f"  FAILED [{post.name}]: {e}")
            continue  # keep old entry (if any); it will be retried next run
        data[post.name] = {
            "text": summary,
            "hash": digest,
            "updated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
        print(f"  OK [{i}/{len(pending)}] {post.name}: {summary[:50]}...")
        time.sleep(API_DELAY_SECONDS)

    data_file.parent.mkdir(parents=True, exist_ok=True)
    tmp = data_file.with_suffix(".json.tmp")
    tmp.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    os.replace(tmp, data_file)

    print(f"Wrote {data_file} ({len(data)} summary/s, {failed} failed).")
    if failed == len(pending):
        print(
            "::error::All summary generations failed - check DEEPSEEK_API_KEY "
            f"and DEEPSEEK_MODEL (current: {MODEL})."
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
