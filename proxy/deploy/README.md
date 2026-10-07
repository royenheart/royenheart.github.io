# Static deployment

Build with `npm ci && npm run proxy:build`. The only public artifact is `proxy/dist/`. It contains HTML, CSS, bundled JavaScript, and images. There is no production Node/Python service or Lua template renderer.

Merge `openresty.conf.example` into the current HTTPS server. Retain its certificates and unrelated upstream locations. Ensure the parent HTTP configuration includes `mime.types`; JavaScript must have a JavaScript content type. Retain gzip if configured. Test the actual configuration with the installed OpenResty/nginx binary before reloading it.

If an upstream is mandatory, serve the same files with an internal static server and use `upstream.conf.example` at the gateway. The application and data do not change. Never use the development server or preview server as the production service.

## Publish

Run the helper on a staging/deployment machine that can access the target filesystem:

```bash
node proxy/deploy/publish.mjs proxy/dist /srv/royenheart-home abcdef123456
```

The helper validates the artifact, refuses mutable hash collisions, preserves old hashed assets in `shared/_astro`, writes a release manifest outside the public root, and atomically replaces the `current` symlink. It also updates `previous`. Use a deployment account with the appropriate directory ownership and **serialize releases**; this helper does not coordinate concurrent publishers. Node is needed to run this deployment helper, not to serve the resulting site. It can also operate on a staging volume before files are transferred to the host.

Do not prune shared assets during a release. Old browser tabs can request old lazy chunks. After a chosen retention period, garbage collection may remove files unreferenced by retained manifests. Keep manifests and previous releases together.

For rollback, create a temporary symlink pointing at the release named by `previous`, then rename it over `current` on the same filesystem. Verify the target exists before switching. On Linux, for example:

```bash
cd /srv/royenheart-home
rollback_target=$(readlink previous)
test -f "$rollback_target/index.html" || exit 1
ln -s "$rollback_target" rollback-next
mv -Tf rollback-next current
```

Routine song-list updates only require a new build and release. No OpenResty content configuration or reload is needed. If the host uses `open_file_cache` or a proxy cache, account for its lifetime in deployment verification.

## HTTP verification

After a build, run `npm run proxy:deploy:test` with Docker available. The smoke test uses a digest-pinned OpenResty image and a temporary deployment directory. It checks the real example configuration, MIME types, cache headers, missing assets, two releases, old chunks, and rollback over loopback HTTP. It does not modify a production host or validate its TLS setup.

Check `/` returns HTML, an existing `/_astro/*.js` returns JavaScript with immutable caching, and a missing asset returns 404 without a long-lived cache header. Check `/` and non-hashed files revalidate. Verify the old release's lazy chunk is still reachable after switching releases, then exercise rollback. Verify navigation, both scenes, and the music fallback through the actual HTTPS gateway.

No production host credentials or domain configuration are stored in this repository. The release workflow creates a downloadable artifact; it does not connect to the VPC automatically.
