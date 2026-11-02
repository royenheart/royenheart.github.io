# Proxy deployment privacy and release review

Date: 2026-11-02. This is the pre-deployment privacy gate for the static
Tencent-hosted proxy service. It records a separate GPT/Codex review of the
source tree and the deployable `proxy/dist` artifact; the review itself was
read-only.

## Verdict

**Safe to deploy the reviewed `proxy/dist` artifact. No blocking P0 finding.**

The reviewed artifact contained 69 files after the retired routes and test-build cleanup. A final fingerprint was computed by
sorting relative paths, hashing each file with SHA-256, joining
`<hash>  <relative-path>\n` lines, and hashing that manifest:

```text
a1d981d5d9314ade72216814da957643a68833c41396eedf2470ca9bfd6e5d06
```

The fingerprint must be recomputed after any rebuild; a changed artifact needs a
fresh review.

## Findings

- **No P0 leak in tracked/untracked source or `proxy/dist`:** no real machine
  IPv4 addresses, host-specific hostnames, SSH aliases, absolute home paths,
  credentials, private keys, environment files, source maps, build logs, or
  deployment manifests. The only literal addresses left in the working tree are
  the loopback/unspecified addresses and the documentation placeholder
  `192.0.2.10` (TEST-NET-1).
- **Publisher allowlist:** the previous expression accepted any file inside
  `_astro`, `optics`, and `licenses`, including `.env`, `.map`, `.log`, `.pem`,
  and `.ssh` paths. It now allows only expected public extensions, exact optics
  files, known license text files, the two preview HTML entries, and the root
  pages. Hidden files, maps, logs, keys, and environment files are rejected.
  The real 84-file artifact publishes successfully; a negative test covers
  `_astro/.env.production`, `optics/debug.log`, and `licenses/private.pem`.
- **Avatar metadata:** the original PNG had a `tEXt` chunk and the embedded PNG
  inside `proxy/avatar.svg` had `tEXt`/`zTXt` chunks containing generation
  parameters, sampler/model metadata, and seed. The chunks were removed without
  changing IDAT data; the deployed WebP has no EXIF/XMP.
- **Public identity (intentional):** name, avatar, GitHub, public domain, and
  the official registration identifiers are intentional public content and are
  preserved.
- **Residual P1 (owner decision):** the blog configuration still contains a
  personal contact email in `_config.yml` and an email entry in
  `_data/contact.yml`. It is **not** in the proxy artifact and does not block
  publishing the service. Whether the blog should expose that address remains a
  content decision for the owner.
- **Out of scope:** Git history, the uninitialized `assets/lib` submodule,
  production TLS/OpenResty configuration, and third-party provider behavior
  were not part of this artifact audit. The public origin was checked separately
  for reachability and headers after deployment.

## Related deployment changes

- The publisher now accepts the actual `/optics/` and `/licenses/` artifacts
  while rejecting sensitive-looking files. The retired `/preview/`,
  `/preview-covers/` and `/original/` routes are no longer published.
- The OpenResty example and the live server send
  `Cache-Control: no-cache, no-transform` for HTML. This disables Cloudflare
  Rocket Loader's script rewriting, which had delayed the client-only Astro
  entry by roughly 15 seconds in the tested public path. See
  [external performance directions](./proxy-external-performance.md).
- Release `20261102ae` was published and checked after switching; `/` returns 200
  while the retired `/original/` and `/preview/` routes return 404. The previous
  release remains available for rollback.
- The render fallback now uses the deterministic frame-budget controller in
  `proxy/src/explorations/orbit/render-health.ts`; no device, GPU, UA or refresh
  enumeration participates in degradation decisions.
