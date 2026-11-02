# Standalone Orbit preview and rendering audit

Date: 2026-10-06. Branch: `refactor/proxy-modernization`.

## Preview

The static Astro route `/` mounts the selected `OrbitStudy` directly.
It includes the current native player, rounded drum cards, arrivals, live B
forward capture and F7 reverse fracture. There is no Storybook manager or iframe.
The original homepage and comparison studies remain available.

Review address: `http://192.0.2.10:4321/`.
Supported query parameters:

- `scene=cubes` or `scene=horizon`: choose an initial scene; omission retains
  random entry.
- `skipIntro=1`: bypass the arrival gate for runtime measurements.
- `diagnostics=1`: local-only display of submitted frames per second, drawing
  buffer, draw calls, effective DPR and WebGL renderer string. This does not
  measure GPU completion and sends no telemetry.
- `graphics=poster`: still artwork with the same navigation and music controls.

The listener serves the production build on the requested LAN interface.
It does not publish the site to the Internet or change OpenResty. A computer
must be able to reach that private address to use this link.

## Findings and implementation

The application already uses Three.js WebGL through React Three Fiber, GPU
instancing for cubes, GPU shader animation and library-managed postprocessing.
Rendering happens on each visitor's device, not on the preview server's GPU.
`powerPreference: 'high-performance'` is a browser hint, not a guarantee of a
discrete GPU or hardware acceleration.

Three avoidable costs were found:

1. Transparent, fully absent scene content still submitted expensive draws.
   The selected cube view also ran the horizon's zero-contribution bloom pass.
   Fully absent geometry is now hidden after its preparation frame; bloom and
   tone-mapping effects stay mounted but their shared pass is disabled when
   their contribution is zero. The horizon's planar transparent source uses a
   single pass. Actual shader math and selected art direction are unchanged.
2. DPR scaled full-screen fragment work without a viewport pixel ceiling.
   `render-budget.ts` limits normal rendering to 1.3 million pixels, respecting
   native DPR and a 1.2 maximum. Low sustained frame cadence reduces that budget
   further. The canvas observer also reapplies the cap when R3F reconfiguration
   resets DPR. DOM text and controls retain their normal CSS resolution.
3. The previous Drei `PerformanceMonitor` counted every upward threshold event
   toward its fallback limit, so stable fast samples could force STASIS. The
   selected path now uses a small deterministic frame-budget controller
   (`render-health.ts`): sustained over-budget frames lower quality, only
   sustained severe frames at the floor latch STASIS, and healthy frames release
   it. Stable 60/90/120/144 Hz unit cases remain FULL.

The existing single canvas, shared material clock, prepared alternate material,
on-demand paused rendering and WebGL failure poster remain in place. No new
rendering engine, per-frame React state update or CPU particle simulation was
introduced. Fixed capture mode retains DPR 1.2 for reproducible visual studies;
normal runtime is the subject of the performance measurements.

The default framebuffer retains antialiasing. Disabling it reproduced a blank
first demand-rendered frame in this Linux WebKit environment, including when
pass skipping was disabled or cube visibility was restored. Keeping canvas
antialiasing restored the unchanged five-boundary pixel test. Postprocessing
render targets still use zero multisampling. The optimization therefore does
not rely on that incompatible canvas setting.

## Hardware measurements

Local system Chrome, headed on Wayland, isolated temporary profile. Renderer:
`ANGLE (AMD, AMD Radeon Graphics (radeonsi renoir ACO), OpenGL ES 3.2)`.
All dimensions below use device scale factor 1. A four-second warmup precedes
each six-second sample. GPU time comes from asynchronous
`EXT_disjoint_timer_query_webgl2` queries around submitted WebGL draws;
disjoint samples are excluded. No synchronous `finish()` or pixel readback is
used during sampling. These are short local measurements, not a device fleet
benchmark or thermal soak.

| Viewport and scene   |                  Before GPU p95 | After GPU p95 | After buffer | After draw calls |
| -------------------- | ------------------------------: | ------------: | ------------ | ---------------: |
| 1440 × 900, horizon  |                        16.27 ms |      11.48 ms | 1440 × 900   |               11 |
| 1920 × 1080, horizon |                        25.98 ms |      11.62 ms | 1520 × 855   |               11 |
| 1920 × 1080, cubes   | Not a stable quality comparison |       1.00 ms | 1520 × 855   |                3 |
| 390 × 844, horizon   |                         4.90 ms |       3.20 ms | 390 × 844    |               11 |

The old 1080p sample included its automatic DPR reduction from 1.2 to 0.9;
the new sample starts with the pixel cap. This comparison measures the whole
runtime policy, not shader throughput at equal resolution. The old cube runs
incorrectly reached minimum quality, so their GPU times are not presented as
an equal-quality baseline. Draw calls fell from 12 to 3 for settled cubes and
from 12 to 11 for the horizon. Final hardware frame intervals had p95 around
19.3–19.5 ms, approximately 56 submitted frames/s overall, with no long tasks during
the six steady sampling windows.

A separate 1920 × 1080 hardware run exercised the actual arrival and both
interactive transitions. The live B sampling window measured 14.20 ms GPU
p95 and the F7 window 13.90 ms, with no quality reductions. Live B included
one 65 ms main-thread long task; F7 included none. This residual isolated
spike means the measurements do not establish perfectly uniform frame pacing.
Maximum draw calls were 13 and 14 respectively. The renderer became ready
after about 1.9 seconds on this LAN run; the authored 4.8-second falling
arrival then completed at about 6.7 seconds. The arrival duration is deliberate
motion, not a stalled loading request.

Phone dimensions were rendered by the same desktop GPU. They do not establish
iPhone, Android, tablet, battery or integrated-GPU performance elsewhere.

## Software rendering and remote access

Default headless Chromium reports SwiftShader, not the AMD GPU. At 800 × 500,
the old software samples achieved about 5–6 submitted frames/s. After the
changes, cubes averaged about 56 frames/s at a 600 × 375 internal buffer and
the horizon about 18 frames/s at a 360 × 225 internal buffer. Software horizon rendering remains
visibly slow; resolution adaptation cannot substitute for hardware acceleration.
No GPU-completion numbers are attributed to this environment because timer
queries are unavailable.

The same HTML and assets are sent to local and remote browsers. Each visitor
gets its own pixel budget and measured quality adaptation. The diagnostics
query helps distinguish a software renderer from a hardware renderer on that
visitor's browser. The still-view query is available if that device cannot
render the scene acceptably.

Transfer cost is separate from frame cost. The production build's entire
emitted JavaScript, including both homepage entries and graphics chunks, is
457,017 bytes gzipped; CSS is 9,276 bytes gzipped. Both remain within the
existing 500 KiB / 30 KiB budgets. The optical lookup files additionally total
2,162,704 raw bytes, plus artwork and fonts. Those tables are still used for
the lensed sky in the selected treatment, so they were not removed as an
allegedly unused download. Astro's LAN preview is not evidence of deployed
compression or cache policy. The existing OpenResty example retains the site's
compression settings and immutable caching for hashed application assets.
NetEase audio is requested from its provider and is outside this static asset
budget; its availability and buffering are separate from GPU performance.
The measured cold LAN visit transferred approximately 2.53 MB of same-origin
subresources (3.92 MB decoded, 18 requests), excluding third-party audio and
artwork. This observation includes the preview server's actual compression;
it does not establish transfer speed or headers after deployment elsewhere.

## Evidence

Raw probe scripts, before/after JSON and screenshots are outside the repository
under `/tmp/proxy-performance/`. `baseline.json` and `final.json` contain hardware
samples; `baseline-software.json` and `final-software.json` contain software
samples. Screenshots are visual inspection aids, not identical-time diffs.

Relevant primary implementation references:

- [R3F scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)
- [R3F Canvas DPR and frame loop](https://r3f.docs.pmnd.rs/api/canvas)
- [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)

The installed Drei `PerformanceMonitor` and postprocessing `EffectGroup`
implementations were inspected to confirm their actual callback/pass behavior.

## Final verification

- `npm test`: type checking, lint, formatting and all 63 unit cases passed.
- `npm run proxy:build` and `npm run proxy:storybook:build`: passed.
- `npm run proxy:bundle`: passed the unchanged compressed asset budgets.
- `npm run proxy:storybook:test -- src/explorations/orbit/JourneyStudy.stories.tsx`:
  both selected-journey stories passed, including playback/pause/restart.
- The final targeted Playwright run passed all 13 cases across Chromium,
  Firefox and WebKit. It covered the standalone page at five width/height
  combinations, all selected cards, five image-continuity boundaries, arrival,
  real fixture-audio crossfades, B/F7 navigation, missing destination audio,
  resize, the actual drawing-buffer cap, hidden/reduced/paused suspension and
  bounded resources across repeated cycles. The unchanged boundary threshold
  remained below a mean absolute pixel difference of 2.
- The local WebKit run used
  `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1`, as in prior repository
  verification. Without it, the host preflight refused to launch because of
  its media/input package checks. Actual WebKit rendering and fixture
  audio were exercised after launch, rather than inferred from the skip flag.
- The diagnostics URL was opened independently and correctly identified the
  test browser's SwiftShader renderer. The LAN page returned HTTP 200, and
  `xdg-open` successfully dispatched the ordinary preview URL to the desktop.

Detailed final logs are `/tmp/proxy-performance/checks.log`,
`final-browser-checks.log`, `build-preview.log`, `build-storybook.log` and
`bundle.log`. The earlier failing diagnostic runs are retained separately;
they are not counted as final passing checks.

There was no push, pull request or production deployment.
