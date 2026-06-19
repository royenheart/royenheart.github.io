# Proxy Performance Tests

These tests measure the static proxy page through Playwright Chromium.

## Local setup

```bash
npm install
npm run perf:install
npm run perf
```

The Playwright config starts `python3 proxy/dev_preview.py` automatically on
`127.0.0.1:4173`. If a local preview server is already running, it is reused
outside CI.

## Metrics

The tests write JSON results to `test-results/perf/`:

- navigation timing for `domContentLoaded`, load, response size
- first animation frame latency
- frame delta summary over 90 animation frames
- long task count and duration
- canvas/WebGL state, including `renderMode`
- second-scene frame timing after switching to the event-horizon scene
- resize response after two animation frames

The default page uses the GPU cube field when WebGL is available. The
`/no-music?renderer=canvas` route forces the Canvas fallback so changes can be
compared against the previous rendering path.

The second-scene test switches the page to the black-hole/event-horizon scene
and verifies it stays on the direct WebGL render path instead of the expensive
postprocessing composer path.

## GitHub Actions

Use Playwright's managed browser install rather than depending on a system
Chrome package:

```bash
npm install
npx playwright install --with-deps chromium
npm run perf
```
