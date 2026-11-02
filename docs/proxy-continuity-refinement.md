# Continuous rim-to-disk contours

Status: historical contour and initial edge-veil record on `refactor/proxy-modernization`. The user rejected the previous glow-only junction at `5b737b7`. After the contour revision at `0b54fef`, the edge treatment at `bebefc8` still showed translucent strand tips and a dark trough against the halo. The [unified opaque veil](proxy-unified-veil.md) supersedes that treatment. No push, PR, deployment or production homepage replacement is included.

## Observed problem

The supplied 236 × 419 reference turns its curved light bands into the disk. The user's 170 × 107 crop of our implementation instead shows a near-vertical bright rim crossing shallow foreground lines. A structure-tensor analysis of that crop, using a two-pixel Gaussian window and coherent bright samples, measured median tangent angles of 93.61 degrees on the upper arc and 15.81 degrees on the foreground. These are sampled image directions, not physical lensing measurements.

The previous cubic ribbon added light around the intersection while leaving the two underlying contour fields independent. The old test followed the undeformed circular rim and checked brightness; it therefore allowed precisely the crossing the user rejected.

## Construction

- Remove the independent cubic glow ribbon. Blend the circular and foreground phase coordinates with a smooth maximum, so the lower rim and broad outer filaments turn into the disk.
- Preserve the upper crest, shoulder, falloff and palette. The lower tips follow the joined distance field. Direction-dependent emission weights hand the rim and veil over to the foreground instead of leaving a vertical tail.
- Limit the disk-side phase displacement to six phase units before tapering it over circular distances 0.25–0.85. The phase smoothing width is 24. This keeps the turn localized without folding the accepted outer disk strands.
- Near the critical ray boundary, obtain the unfiltered intersection radius for phase coordinates. `TraceRay` substitutes a midpoint radius for partial pixel coverage; that filtered radius remains appropriate for coverage but introduces a phase discontinuity if used for texture flow. Existing lookup tables and disk coverage remain in use.
- Bound derivative-based rim antialiasing to prevent a visibility-boundary derivative from drawing a bright streak through the dark core. Soften the disk's inner emission onset locally at the seam.

The disk frequency remains 31. The accepted travelling wave parameters, stable ray angles, B / Velvet drum controls, other scene and music metadata are unchanged. This is an art-directed continuation of emission coordinates, not a new physical geodesic model. The prior `optical` comparison keeps its original rendering path.

## Visual evidence

Compare the baseline `/tmp/proxy-wave-study/blend/horizon-1440x900.png` with `/tmp/proxy-continuity-study/final/horizon-1440x900.png`. Both use the same scene, viewport, seed, card state and background time of 12.

- The tracked left/right bright ridges turn inward by approximately 23/27 pixels relative to the original circular contour, compared with approximately -1/1 pixels before. Minimum sampled ridge luminance remains above 226/255.
- The sampled upper region (x=340–1099, y=40–349) has zero channel difference. The upper crest remains on row 124, with eight rows above 75% peak luminance.
- The central foreground strip still has 30 measured peaks. Its broader sampled region is effectively unchanged, with mean channel difference below 0.001/255.
- These observations establish structural change and preservation of the sampled regions. They do not establish aesthetic acceptance or pixel identity across every viewport and time.

Analysis, full traces, unsuccessful local experiments and final captures remain outside Git in `/tmp/proxy-continuity-study`. The review page at `http://127.0.0.1:6008/continuity/` includes equal-scale junction crops, full views, phone and short-screen views, and a normal-runtime recording. Its files are served from `/tmp/proxy-limb-study/final/continuity`.

## Reproduce and verify

Build Storybook, serve `proxy/storybook-static` on port 6006, then capture:

```sh
npm run proxy:storybook:build
node proxy/scripts/capture-limb.mjs /tmp/proxy-continuity-study/final
```

The stills use fixed time; the recording uses normal animation and real card wheel gestures. Artist media requests are disabled for visual recording, without a substitute recording.

Checks executed against the final implementation:

- `npm run proxy:check`: 78 files, zero Astro errors, warnings or hints; ESLint and Prettier passed.
- `npm run proxy:build` and `npm run proxy:storybook:build`: passed. Existing graphics chunk and bundler directive notices remain.
- `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 npm run proxy:e2e -- tests/e2e/limb-controls.spec.ts --grep 'thin upper crest'`: three cases passed in Chromium, Firefox and WebKit. The case covers desktop, portrait phone and normal animation. It now tracks a continuous bright ridge on both sides and requires inward displacement beyond the undeformed circle, alongside the crest, core, outer-band, central-cusp and bottom-emission checks.
- `npm run proxy:e2e -- tests/e2e/relativistic-horizon.spec.ts --project chromium --grep 'two disk images'`: one optical comparison case passed, including its inclination control.
- Actual WebGL captures cover both scenes at 1440 × 900, 390 × 844 and 390 × 400. The 1280 × 800 recording lasts 24.96 seconds at 25 encoded frames per second; full FFmpeg decoding passed.
- Chromium verified decoded review images, advancing video playback and no document overflow at 1280 pixels. `git diff --check` passed.

Logs use `/tmp/continuity-*.log`. WebKit uses the previously documented local Fedora compatibility environment; actual browser assertions ran. Browser emulation and encoded video frame rate do not establish physical-device GPU performance. No UI implementation changed, so earlier control interaction checks remain recorded in the limb and rotary documents rather than being reported as newly run.

## Follow-up: diffuse outer strand tips

The user's next 416 × 173 crop shows a row of exposed strand tips ending abruptly against black outside the main rim. Vertical samples through two tips rise by approximately 49 and 59 luminance units in one source-image pixel. This is a separate defect from the previous rim/disk crossing.

The follow-up fades strand contrast near this exposed boundary and adds a localized gold emission veil. Both use scene coordinates, so their scale follows the artwork through viewport changes. The side mask feathers over circular distances 0.3–0.9; the strand fade spans vertical coordinates -0.48–0.12 relative to a gently perturbed edge height. The Gaussian veil width is 0.30, with emission strength 0.12–0.18 and slow noise speed 0.045. The contour field, disk frequency, wave parameters and controls are unchanged. This is an artistic emission treatment, not a volumetric scattering simulation.

The same-size 1440 × 900 comparison samples both sides at 1.4–1.9 rendered radii from the center. At the exposed-tip row, the 10th–90th percentile luminance spread changes from approximately 98/78 on the left/right to 3/3. The dim gaps rise from approximately 4/2 to 70/73 out of 255. The 95th percentile vertical brightness step across the nearby band drops from approximately 10/18 to 2/2. These observations quantify a softer edge; they do not determine the preferred glow strength. The central foreground sample has zero channel difference, and the upper sample differs by at most one channel unit.

The focused rendering test now requires a lit, low-contrast edge, a return to dark sky above it, and distinct strands below it wherever the outer disk is visible. The earlier screenshot fails the new edge criteria. Fresh checks on this revision:

- `proxy:check`, `proxy:build` and `proxy:storybook:build` passed.
- The focused crest/core/foreground/normal-runtime case passed in Chromium, Firefox and WebKit (three cases), including the new edge assertions.
- The optical two-image and inclination-control case passed in Chromium (one case).
- Actual WebGL captures cover both scenes at 1440 × 900, 390 × 844 and 390 × 400. The 26-second normal-runtime recording at 1280 × 800 decoded fully with FFmpeg; its encoded rate is 25 frames per second.
- The review page's images decoded, its video advanced, and document width stayed within 1280- and 390-pixel viewports in Chromium.

Reproduce with the capture command above, using `/tmp/proxy-edge-study/final` as output. Analysis and equal-scale before/after details remain in `/tmp/proxy-edge-study`; the review copy is `/tmp/proxy-limb-study/final/edges`, served at `http://127.0.0.1:6008/edges/`. Logs use `/tmp/edge-*.log`. The same browser-emulation and audio limitations apply. No broad UI suite was rerun for this shader-only change.

## Superseded continuation prompt

Use the continuation prompt in the unified-veil record for further work.

```text
Continue the selected B / Velvet drum horizon study. Preserve the accepted upper
rim style, sparse foreground density, irregular travelling waves, dark core,
black/gold palette and compact controls. The user rejected extra glow over a
crossing: the rim and texture contours must actually turn into the disk. Refine
the shared contour junction using the user's next visual feedback. Retain the
unfiltered phase / filtered coverage distinction and the optical comparison.
Exposed outer strand tips should dissolve into a soft gold veil while lower
strands remain distinct. Adjust that veil only according to the user's feedback;
do not restore the abrupt tips or spread blur across the entire disk.
Show equal-scale actual WebGL details and normal-runtime motion. Keep previous
previews outside Git and separate measured structure from aesthetic acceptance.
Do not push, open a PR or replace the production homepage during this review.
```
