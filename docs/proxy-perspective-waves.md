# Foreground depth and travelling waves

Status: the preceding continuous junction was accepted. This refinement addresses
its equal ring intervals and insufficient surface movement. The updated spacing
and wave amplitude await visual feedback. Work remains local on
`refactor/proxy-modernization`; no push, PR, deployment, or homepage replacement.

## Geometry and material

The selected limb still uses the [shared ribbon construction](proxy-continuous-ribbon.md).
The upper rim, gold palette, dark core, bottom-reaching foreground, separate
optical treatment, two scenes, and selected B / Velvet drum interface remain.

Previously, a constant radial phase frequency produced almost equal foreground
intervals. A small phase perturbation moved individual strands too little to read
as waves. Two changes address those causes in `relativisticHorizon.glsl`:

1. The phase is now `140 * log(1 + (r - 3) / 7)` over the emitting radius range.
   Its derivative is `20 / (1 + (r - 3) / 7)`: frequency decreases continuously
   toward the viewer, so the local interval increases. The defensive lower clamp
   lies inside the non-emitting region. This does not independently offset rings
   or introduce piecewise spacing boundaries.
2. Three travelling height waves, with different directions, wavelengths, speeds,
   and phases, displace the shared surface before ribbon coordinates are solved.
   Inverse displacement uses `surface = screen - vec2(0, height)`. Strands,
   coordinate diagnostics, emission, and the inner contour read this same surface.
   The swells therefore bend the material rather than merely flickering its light.

A smooth near-field envelope raises wave amplitude toward the foreground and
reduces it to zero before the upper rim. The three nominal amplitudes are 0.15,
0.09, and 0.055 in scene coordinates; a low-inclination factor limits compression.
For the supported inclination scale, the sum of directional vertical slopes is
bounded by about 0.488. The envelope adds at most 0.213. The total remains below
0.701, keeping the inverse vertical map monotone and preventing foldover.

The logarithmic phase gives an increasing underlying spacing trend. Travelling
waves deliberately compress and expand neighboring gaps locally; every adjacent
visible interval is not required to increase strictly at every animation frame.
This remains a procedural artistic surface, not a hydrodynamics solver or a
physical general-relativistic simulation. No dependency or rendering loop was
added.

## Deterministic inspection

Orbit Storybook capture URLs now accept `sceneTime` alongside `capture=1`. Valid
finite values are clamped to 0–3600 seconds, with the previous time 12 as default.
The option is ignored in normal runtime. `window.__orbitScene.time` reports the
rendered time so captures can verify that the requested phase actually reached
the renderer. Examples use times 12, 16, and 20 with the same seed and camera.

The new browser oracle detects visible emission peaks from five-column median
brightness profiles, independently of the shader phase formula. Across three
columns and three times, the near/far median spacing ratio must exceed 1.5.
Ordered inner crests anchor correspondence across time; later crests must move
more than 12 pixels and show different displacements at different depths.

The existing connectivity oracle still follows at least three distinct observed
color regions through both junctions into the upper arc. Its wider capture and
expanded seed range retain complete groups after the intended spacing change.
Side bounds now follow viewport height, like the arc itself, instead of moving
outward with unrelated extra viewport width. Its deliberately severed-image
negative control remains in place.

## Observations and review

At 1440 by 900 and time 12, the central far and near median intervals measure
approximately 10 and 22 pixels; the previous capture measured approximately
8 pixels in both regions. Between times 12 and 16, central foreground crests
move up to 28 pixels, while the first inner crests move at most 2 pixels.
These are measurements of fixed captures, not universal values at every size.

Review artifacts are outside Git in `/tmp/proxy-depth-wave-study/final`, served
locally at `http://127.0.0.1:6008/depth-waves/`. The page includes normal-runtime
video, previous/current spacing, three fixed wave phases, device captures, both
diagnostic views, and the retained cube scene. `recipe.json` records the setup.
The recording has no artist audio and does not establish music availability.

## Executed verification

- `npm run proxy:check`: 80 files, zero Astro errors/warnings/hints; ESLint and
  Prettier passed.
- `npm run proxy:build` and `npm run proxy:storybook:build`: passed.
- Four focused rendering cases passed in Chromium, Firefox, and WebKit: increasing
  spacing and travelling crests, multi-band connectivity, unbloomed junctions
  across resize, and retained rim/core/bottom-emission/normal-motion checks
  (12 cases total).
- The existing reduced-motion/render-rest and graphics-failure navigation case
  passed in Chromium.
- Two isolated response mutations validated the new oracle without changing
  repository files: restoring constant frequency failed the spacing assertion
  (ratio 1.33); removing surface displacement failed the travel assertion
  (0 pixels). The unmodified shader passed in all three browsers.
- Captures cover both scenes at 1440 by 900, 390 by 844, 390 by 400, and 768 by
  1024, plus the horizon at 844 by 390. Diagnostic captures use 1440 by 900.
  The extra capture run reported no page errors.
- The 1280 by 800 normal-runtime video decodes all 528 frames, lasting 21.12
  seconds at an encoded 25 fps. This is not a GPU performance measurement.
- The review page loaded every image, switched both spacing views and all three
  phases, played its video, and had no overflow or page errors at widths 1280
  and 390 in Chromium.

WebKit uses the previously documented local compatibility setup and command-local
`PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1` on unsupported Fedora. Actual page
rendering was exercised; no system libraries were changed. Browser emulation is
not evidence of physical iOS/Android GPU performance.

Logs: `/tmp/proxy-depth-wave-{final-check,build,storybook,browsers,extra,review}.log`.
Negative controls: `/tmp/proxy-depth-wave-negative-{spacing,waves}.log`.
Motion policy: `/tmp/proxy-depth-wave-motion-policy.log`.
