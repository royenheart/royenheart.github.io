# Foreground waves and outer emission veil

Status: the user accepted B / Velvet drum, the first upper rim, the sparse foreground density, and this round's travelling waves and general second-layer treatment. The latest follow-up refines only the side junctions toward the supplied reference. That local refinement remains open to review. Work stays on `refactor/proxy-modernization`; no push, PR, deployment or production homepage replacement is included.

## Reference and terminology

The supplied 236 × 419 image contains a narrow inner rim, a wider filamentary curved band and bright, gradual junctions with a nearly vertical disk. The image's provenance and exact rendering algorithm are unconfirmed. Its rotated orientation and silver palette are not requirements for the established horizontal, black/gold composition.

Pixel analysis sampled the unobscured right inner arc at y=234–333. A robust circular fit gives center (114.88, 283.90), radius 58.27 pixels and median residual 0.14 pixels. At y=280 the wider band peaks around x=180 at 180.62/255 luminance, then falls to 78.35 at x=200 and 21.00 at x=225. These measurements support separate narrow and broad light structures; they do not identify a physical emission mechanism. The original image is embedded unchanged beneath an SVG annotation. The rendered annotation and samples remain outside Git in `/tmp/proxy-wave-study/reference-analysis.{png,html,json}`.

Useful descriptions, with their limits:

- **Gravitationally lensed accretion-disk image** describes disk light bent into curved structures around the shadow. A secondary disk image is one possible contribution, but its order cannot be established from this reference alone. A **photon ring** has a more specific multiple-light-path meaning and should not label the entire broad glow. [NASA's visualization explanation](https://www.nasa.gov/universe/nasa-visualization-shows-a-black-holes-warped-world/) supports that distinction.
- **Sfumato** describes gradual tonal transitions that soften outlines. It is a useful painting analogy for the outer blend, alongside soft/hard edge control. It does not establish that the supplied render was painted with that technique. See the [National Gallery glossary](https://www.nationalgallery.org.uk/paintings/glossary/sfumato) and [James Gurney on transitioning edges](https://gurneyjourney.blogspot.com/2011/08/transitioning-edges.html).
- **Bloom** describes light spreading around bright areas. Here a separate emission layer determines the broad band's silhouette and texture; the existing postprocessing bloom supplies highlight diffusion. See [Unity's bloom documentation](https://docs.unity3d.com/6000.0/Documentation/Manual/urp/post-processing-bloom.html).

## Construction

The original rim's capture radius, crest, shoulder, falloff and arc mask remain unchanged. A separate `limbVeil` function adds an outside-only band with antialiased filaments and slowly advected noise. Its radial width grows from 0.09 to 0.28 scene units near the side junctions. A broader low-intensity falloff spans the connection, and the layer is composited after the disk so it can soften the crossing. The dark core remains unfilled. This is an art-directed emission layer inspired by the lensed-disk silhouette, not an additional geodesic image or a black-hole atmosphere model.

The accepted radial filament frequency remains 31. `diskWave` replaces the previous strong high-frequency phase distortion with three independently travelling waves plus slow noise modulation. The amplitudes are 0.075, 0.052 and 0.034 scene units, with noise coefficient 0.026. Their direction vectors, speeds and phases differ. The displacement is bounded by 0.174 scene units; there is no frame-by-frame random jitter. The sum-of-waves construction is informed by [NVIDIA GPU Gems, Chapter 1](https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-1-effective-water-simulation-physical-models). It is a visual wave field for emission coordinates, not a fluid simulation.

After accepting those waves and the second layer, the user requested a more reference-like junction. The follow-up replaces the lower veil's straight crossing with a localized cubic ribbon on each side. Its initial tangent follows the outer arc downward; its final tangent turns outward along the disk. The light broadens from 0.11 to 0.24 scene units and fades before the curve endpoint. Sixteen segments approximate the cubic's distance field inside a bounded region; a feathered profile and slow intensity noise soften the merge. The underlying circular veil is attenuated locally to avoid two overlapping bright stems. The first rim and wave parameters are unchanged. This is a compositional light-flow adjustment, not a simulated lensing caustic.

## Central cusp diagnosis

Removing the old phase distortion alone did not remove the central cusp. A temporary browser-only shader diagnostic read intermediate values from the actual framebuffer. At the central ray near screen y=-0.49, the previous `acos(dot)` followed by `tan(delta)` path produced energy squared about 1.75, whereas the camera-plane relation gives approximately 4.16. The CPU integration and table lookup agreed closely for the corresponding ray, directing the fix to the angle computation rather than the table resolution.

For the `limb` branch, compute `delta = pi - atan(impact / cameraRadius)` and radial velocity directly as `1 / impact`. Compute the plane-crossing angle with two-argument `atan` of the cross-product length and dot product. These equivalent relations avoid the unstable near-axis inverse-cosine path. The original `optical` comparison retains its previous calculation. No lookup-table regeneration, dependency or GPU lifecycle change is included.

## Reproduce and assess

Build Storybook and serve `proxy/storybook-static` on port 6006, then run:

```sh
node proxy/scripts/capture-limb.mjs /tmp/proxy-wave-study/blend
```

The selected horizon story uses actual WebGL. Capture time is 12 for stills; the recording uses normal animation and real card wheel gestures. Artist audio requests are disabled for visual capture. No substitute artist recording is introduced.

Compare the accepted wave treatment in `/tmp/proxy-wave-study/final` against the earlier `/tmp/proxy-limb-study/join/horizon-1440x900.png`. Both captures have the same scene, viewport, seed, card state and background time. A central foreground strip contains 30 measured peaks versus 29 before the ray correction, while the fundamental density remains 31. The upper crest stays on row 124 with eight rows above 75% of its peak. At the sampled center, the innermost bright filament moves from row 506 to 542, eliminating the upward cusp relative to neighboring samples. The outer band at y=105 increases from 54.43 to 90.70/255. The follow-up side-junction capture is in `/tmp/proxy-wave-study/blend`; the accepted wave treatment and intermediate experiment remain available for comparison.

Acceptance criteria:

- Preserve the selected card design, controls, scene framing and first crisp upper rim.
- Keep the accepted sparse foreground density and a dark core.
- No isolated central spike or sharp high-frequency folds in the foreground filaments.
- The waves move continuously with different directions and phases, without synchronized uniform ripples or random flicker.
- A dimmer broad outer band remains distinguishable from the first rim and blends across the disk junctions.
- Verify desktop, portrait phone and short screens, normal motion and the prior optical comparison.

## Verification record

- `npm run proxy:check`: 78 files, zero Astro errors/warnings/hints; lint and formatting passed.
- `npm run proxy:build` and `npm run proxy:storybook:build`: passed. The existing graphics chunk-size notice remains.
- The focused limb pixel/normal-runtime case passed in Chromium, Firefox and WebKit (three cases). It now rejects the central cusp and requires a separate dimmer outer band, in addition to the narrow crest, dark core, continuous rim tips and bottom emission. The old capture fails both new image criteria. The case covers 960 × 640 and 390 × 844, plus animated frames at 640 × 480.
- The earlier optical two-image/inclination-control regression passed in Chromium (one case). The controls and DOM geometry are unchanged; earlier interaction coverage remains recorded in the limb and rotary documents.
- Actual WebGL screenshots cover both scenes at 1440 × 900, 390 × 844 and 390 × 400. The normal-runtime recording is 23.52 seconds at 1280 × 800 and 25 encoded frames/second. Full FFmpeg decoding passed; the review page's video metadata and advancing playback were checked in Chromium.
- The review is available at `http://127.0.0.1:6008/waves/`. It includes the annotated source, previous/current captures, phone views, animation and the current recipe. Artifacts remain in `/tmp/proxy-wave-study` and the review copy `/tmp/proxy-limb-study/final/waves`; logs are `/tmp/wave-*.log`.

WebKit uses the previously documented Fedora compatibility environment with command-local `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1`; actual browser assertions ran. Browser emulation does not establish physical-device GPU performance or artist-stream availability. The tests establish visual structure and continuous animation; acceptance of the wave treatment came separately from the user's feedback.

The subsequent junction-only revision passed the same three-browser rendering case again, plus fresh static/Storybook builds and `proxy:check`. Its six viewport captures and 25.56-second recording are in `/tmp/proxy-wave-study/blend`. The recording decoded fully and played after scrolling it into view; the initial offscreen autoplay probe had remained paused. A fixed-size review crop initially overflowed its grid; explicit zero-minimum tracks corrected the artifact page, which now measures 1280 CSS pixels wide in a 1280-pixel viewport. The actual application layout was not changed. The new review is `http://127.0.0.1:6008/waves/blend/`, with equal-scale before/after junction crops, full views and motion. The accepted wave version remains at the parent URL. Logs use `/tmp/wave-blend-*.log` and `/tmp/wave-join-story-build.log`.

## Continuation prompt

```text
Continue the selected B / Velvet drum horizon study. Preserve the user-approved
first crisp rim, sparse foreground density and travelling wave parameters, the black/gold palette, dark core,
compact corner controls and both scenes. Use the supplied reference only for its
layered outer emission and gradual disk junctions. Keep the corrected stable ray
angles. Refine only the broad layer's curved junction with the disk according to
the user's next feedback. Show actual WebGL stills and normal-runtime
motion on desktop, phone and short screens; distinguish physical light paths from
art-directed emission. Retain previous previews outside Git. Do not push, open a
PR or replace the production homepage during this review round.
```
