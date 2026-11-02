# Compact controls and the optical horizon

Implemented on `refactor/proxy-modernization`, following the user's request to interpret the sketch's relationships without copying its scale. The original Astro homepage and baseline renderer remain available; this iteration updates the interactive Orbit study. No deployment, push or PR is part of this work.

## Control scale

The wheel is 124 px on phones, 136 px on short landscape screens and at most 164 px on desktop. Its artwork is 76% of that diameter. Ribbons are 44–54 px high, with complete trapezoid outlines and the right seam occluded by the cover. Buttons retain 44 px targets. The sketch's measured 0.389 ratio is an observation, not a mandatory design token.

At 1440 × 900 the wheel is about 158.4 px and the ribbon 51.8 px; at 390 px wide they are 124 px and 44 px. Compared with the previous 230.4/168 px wheels, the controls are approximately 31% smaller on that desktop and 26% smaller on phone. Card travel scales with ribbon height so forward/reverse exchanges stay within the smaller artwork.

## Black hole

`RelativisticHorizon` replaces independently drawn halo/disk shapes in the Orbit study with precomputed Schwarzschild light paths. The foreground disk, bent upper image, lower secondary image and fine critical region come from the same disk intersections. A static observer's gravitational and orbital frequency shift influences brightness and temperature-informed gold grading.

The disk uses seeded differential rotation, advected density and derivative-filtered filaments. Storybook exposes `silk` and `turbulent` surfaces, inclination and bloom. The default turbulent surface preserves more visible structure. This default is an implementation choice for review, not an assertion that the user selected a final texture.

Bloom uses `@react-three/postprocessing` 3.1.3 and `postprocessing` 6.39.5, with four mip levels and one final ACES tone mapping. The library's adaptive monitor lowers pixel ratio after sustained slow frames. Bloom is light spill from HDR emission; the capture region stays dark. Tables are ordinary static assets, with no OpenResty rendering calculations.

The cube shaders decode their authored display colors only when targeting the linear postprocessing buffer. Tone mapping fades in with the optical scene, preserving the cube palette. A browser image comparison guards against applying the new tone curve to the entire scene sequence.

The first render had about 41% of pixels above normalized luminance 0.8, and a sampled center median around 0.27. Lower emission/bloom restored a black center while preserving the curved disk. These measurements helped detect overexposure; they do not establish aesthetic acceptance.

See the [optical module notes](../proxy/src/scenes/relativity/README.md) for pinned source, license, data layout, generation and validation. This is a Schwarzschild thin-disk optical model with artistic emission, not a fluid or rotating-Kerr simulation.

## Sequence and failure handling

The cube cloud first gathers into a ring with the same apparent capture radius and world-space center as the optical scene. The sky dims before the black-hole structure appears; cube opacity falls after gathering. Reverse traversal expands the same geometry. Native song completion and the final card remain the triggers; repeated input is gated and quiet entry has no scene timer.

Invalid/missing tables, unavailable HDR support and context loss retain the still view and deck. A loading deadline aborts pending work; late responses cannot replace the fallback. Resources are released on unmount. Baseline still images remain the graphics fallback and are not represented as live optical rendering.

Axolotl/Sanctuary metadata and source links remain configured. The tested public endpoints still do not provide usable browser CORS audio. Audio analysis and song-end tests use explicit local fixtures, never substituted artist recordings.

## Review and verification

With Storybook on port 6006, generate actual browser screenshots and video outside Git:

```sh
node proxy/scripts/capture-optical-study.mjs /tmp/proxy-optical-study/final
```

The review page compares baseline/silk/turbulent disks, desktop/phone/short-screen layouts, a live disk recording and both traversal directions. `recipe.json` records dimensions and rendering diagnostics. Fixed background time isolates the transition; the disk recording uses the normal clock.

The test environment uses Chromium's ANGLE SwiftShader software renderer. Its scheduler samples and recordings do not establish phone or desktop GPU frame rates. Actual device profiling remains necessary before claiming a 30/60 fps target.

Verification on 2026-10-05:

- `npm run proxy:check`: zero Astro diagnostics; ESLint and formatting checks passed.
- Unit suite: 37 passed, including five numerical/data-integrity tests. Storybook browser suite: 44 passed.
- `relativistic-horizon.spec.ts`: 15 passed across Chromium, Firefox and WebKit. These cover cube palette preservation, rendered optical structure, inclination, deterministic capture, live disk motion, bounded resize resources, invalid assets and late loading responses.
- The 17-size all-card geometry matrix and keyboard/scoped scrolling passed in all three engines. Selected-track ribbon animation passed for both themes, both directions and phone/desktop sizes.
- Chromium sequence races, resize during traversal, fixture-audio completion, reduced motion and graphics failure passed. The four original production scene scenarios also passed after the shared shader changes.
- Production Astro and standalone Storybook builds passed. The production bundle report measured 359,444 bytes of gzip JavaScript and 4,148 bytes of gzip CSS, within their existing budgets. The optical assets add about 2.06 MiB of uncompressed static data; the production JavaScript budget does not describe the separate Orbit Storybook bundle.
- Final browser artifacts are outside Git at `/tmp/proxy-optical-study/final`: nine screenshots, a comparison page, a 26.8-second forward/reverse recording and a 12.68-second live disk recording. Both videos decode successfully. Runtime diagnostics recorded 12 draw calls, 11 textures and adaptive DPR 0.9 on the software renderer; these counts are not frame-rate guarantees.

Local WebKit required compatible browser libraries and the command-local `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1` on the unsupported host distribution. Real WebKit page rendering and assertions still ran; this does not replace testing on Safari devices.
