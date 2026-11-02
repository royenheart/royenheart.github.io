# Proxy migration verification

Date: 2026-09-28. Evidence below records local execution, not an executed GitHub Actions deployment.

## Results

| Check | Result |
| --- | --- |
| Clean locked install | `npm ci`: 653 packages installed successfully |
| Dependency compatibility | `npm ls --all`: successful, no peer-dependency error |
| Type/lint/format | `npm run proxy:check`: zero Astro diagnostics, lint and formatting pass |
| Unit tests | 8 passed: content contracts, reproducible seed, atomic publication, invalid artifacts, immutable assets |
| Storybook component tests | 16 passed, including interaction and accessibility checks |
| Static production build | Successful; two generated HTML routes and hashed assets |
| Standalone Storybook build | Successful |
| Three-engine production/Storybook run | 74 passed, 2 explicitly skipped |
| Additional touch/DPR run | 2 passed, 1 explicitly skipped |
| OpenResty container integration | Syntax, MIME, cache headers, 404s, prior chunks, publication and rollback passed |
| Skill provenance | 90 files verified against 3 pinned upstream revisions |
| Artifact budget | 358,805 bytes total gzip JavaScript; 3,970 bytes gzip CSS |

The main browser run covers Chromium, Firefox, and WebKit across the shared 13-dimension matrix, including the built Storybook iframe with default, empty, and long-content states. It also verifies pending-embed/timeout races, failed graphics, enlarged text, keyboard dismissal, no-JavaScript navigation, and geometric negative controls. The separate touch run uses 390x844 at DPR 3 and 768x1024 at DPR 2 in Chromium and WebKit.

The two main-run skips are the real GPU smoke in Firefox and WebKit. That smoke is deliberately Chromium-only. The touch skip is Firefox's unsupported Playwright `isMobile` context. There are no silently ignored failing tests.

Actual live WebGL screenshots were generated and visually reviewed for **both** scenes at 1440x900, 390x844, and 768x1024. The desktop render was compared with captures taken from the legacy page before removal. The composition, blue cubes, golden rim/dark core, and foreground bands were retained. Screenshots are review artifacts, not approved cross-platform pixel-diff baselines.

## Environment and reproducibility

Local execution used Fedora 43, Node 24.14.0, npm 11.9.0, and Playwright 1.61.0. Chromium GPU checks used the available headless/software rendering environment. WebKit's Ubuntu fallback binary needed `libicu74`, `libjpeg-turbo8`, and `libwoff1` compatibility libraries extracted into its local browser cache. No system libraries were replaced. After an actual WebKit launch/content probe succeeded, the local browser commands used `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1` to bypass the unsupported-distribution validator. This is a record of that environment workaround, not a general recommendation to bypass dependency checks.

The repository CI uses supported Ubuntu 24.04, Node 24, and `playwright install --with-deps`. It does **not** set that bypass. The attempted large Playwright container download was stopped; the WebKit results came from the successfully launched local browser. OpenResty verification used the digest-pinned container specified in `proxy/deploy/smoke.mjs`.

Main commands:

```bash
npm ci
npm run skills:check
npm test
npm run proxy:storybook:test
npm run proxy:build
npm run proxy:bundle
npm run proxy:storybook:build
npm run proxy:deploy:test
# Use this unmodified command on a supported host with installed dependencies.
CI=1 npm run proxy:e2e
```

After the main three-engine run, the added touch test was executed with `--grep 'touch input' --output test-results/touch --reporter=list`. The final suite contains 79 engine/test combinations: 76 runnable tests and 3 declared skips. The local 76-pass total combines the main run and this additional targeted run.

## Evidence locations

- `proxy/test-results/verification/`: captured install, unit/quality, Storybook, browser, touch, and OpenResty logs.
- `proxy/test-results/bundle.json`: per-asset raw/gzip sizes and total budgets.
- `proxy/test-results/browser/`: six live-scene screenshots and browser artifacts.
- `proxy/playwright-report/index.html`: main three-engine report, including the attached normal-runtime frame/resource sample.

Generated evidence is intentionally ignored by Git. The workflow uploads browser/bundle evidence and the verified static release separately. Use the reproducible commands to regenerate it.

## Limits

No real iPhone, iPad, Android device, external NetEase playback session, production HTTPS gateway, or VPC release was exercised. Browser emulation does not prove true-device GPU/audio performance. RAF samples are browser scheduling measurements, not GPU execution times, and no before/after speedup is claimed. The large graphics chunk produces Vite's uncompressed-size advisory; the measured total compressed assets pass the explicit budget. Production certificate/routes/cache settings still require host-specific verification using the deployment guide.
