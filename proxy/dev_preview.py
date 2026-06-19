#!/usr/bin/env python3
"""Local development preview for the OpenResty-rendered proxy page."""

from __future__ import annotations

import argparse
import os
import tomllib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit


PROXY_DIR = Path(__file__).resolve().parent
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 4173
STATIC_ASSETS = {
    "/avatar.svg": ("avatar.svg", "image/svg+xml"),
    "/favicon.ico": ("favicon.ico", "image/x-icon"),
}


def _read_config(config_path: Path) -> dict[str, Any]:
    with config_path.open("rb") as file:
        return tomllib.load(file)


def _replace_all(template: str, replacements: dict[str, str]) -> str:
    html = template
    for placeholder, value in replacements.items():
        html = html.replace(placeholder, value)
    return html


def static_asset_path(request_path: str) -> Path | None:
    path = urlsplit(request_path).path
    asset = STATIC_ASSETS.get(path)
    if asset is None:
        return None
    return PROXY_DIR / asset[0]


def render_template(
    config_path: Path = PROXY_DIR / "config.toml",
    template_path: Path = PROXY_DIR / "template.html",
    *,
    no_music: bool = False,
) -> str:
    """Render template.html with the same placeholders as the OpenResty Lua block."""
    config = _read_config(config_path)
    template = template_path.read_text(encoding="utf-8")

    music_iframe = "" if no_music else config["music"]["iframe"]
    replacements = {
        "{{TITLE}}": config["meta"]["title"],
        "{{BEIAN_ICP}}": config["meta"]["beian_icp"],
        "{{BEIAN_POLICE}}": config["meta"]["beian_police"],
        "{{LINK_BLOG}}": config["links"]["blog"],
        "{{LINK_TWITTER}}": config["links"].get("twitter", ""),
        "{{LINK_GITHUB}}": config["links"]["github"],
        "{{MUSIC_IFRAME}}": music_iframe,
        "{{COLOR_BG}}": config["visual"]["bg_color"],
        "{{COLOR_CUBE}}": config["visual"]["cube_color"],
        "{{COLOR_HIGHLIGHT}}": config["visual"]["highlight_color"],
        "{{COLOR_AMBIENT}}": config["visual"]["ambient_color"],
    }
    return _replace_all(template, replacements)


class PreviewHandler(SimpleHTTPRequestHandler):
    server_version = "ProxyPreview/1.0"

    def do_GET(self) -> None:
        self._handle_request(send_body=True)

    def do_HEAD(self) -> None:
        self._handle_request(send_body=False)

    def _handle_request(self, *, send_body: bool) -> None:
        asset_path = static_asset_path(self.path)
        if asset_path is not None:
            self._send_static_asset(asset_path, send_body=send_body)
            return

        no_music = self.path.startswith("/no-music")
        try:
            html = render_template(no_music=no_music)
        except Exception as exc:
            self.send_response(500)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            if send_body:
                self.wfile.write(
                    f"Failed to render proxy preview: {exc}\n".encode("utf-8")
                )
            return

        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if send_body:
            self.wfile.write(html.encode("utf-8"))

    def _send_static_asset(self, asset_path: Path, *, send_body: bool) -> None:
        path = urlsplit(self.path).path
        asset = STATIC_ASSETS.get(path)
        content_type = asset[1] if asset else "application/octet-stream"
        if not asset_path.exists():
            self.send_error(404, f"{asset_path.name} not found")
            return

        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", "public, max-age=86400")
        self.end_headers()
        if send_body:
            self.wfile.write(asset_path.read_bytes())

    def log_message(self, format: str, *args: object) -> None:
        print(f"{self.address_string()} - {format % args}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Preview proxy/template.html locally without OpenResty."
    )
    parser.add_argument("--host", default=os.environ.get("HOST", DEFAULT_HOST))
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.environ.get("PORT", DEFAULT_PORT)),
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    server = ThreadingHTTPServer((args.host, args.port), PreviewHandler)
    print(f"Proxy preview: http://{args.host}:{args.port}")
    print(f"No music iframe: http://{args.host}:{args.port}/no-music")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping proxy preview.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
