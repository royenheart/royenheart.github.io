# Connected halo and opaque strand coverage

Status: implemented for visual review on `refactor/proxy-modernization`. The user requested complete coverage of the outer strand tips and a continuous connection between the horizontal veil and curved halo. They explicitly requested procedural-method research before this refinement. This candidate remains open to aesthetic feedback; no push, PR, deployment or production homepage replacement is included.

## Diagnosis and previous construction

The original `materials/horizon.ts` study constructed separate radial Gaussian bands, angular shimmer and side-contact masks with additive blending. The subsequent optical study introduced Bruneton's precomputed Schwarzschild intersections. The selected `limb` treatment retains those optical tables for the disk but adds an art-directed narrow rim, wider filamentary veil and travelling foreground waves. The contour revision connected the rim and disk phase fields; the later edge treatment still added an independent horizontal Gaussian veil and merely reduced strand contrast.

Two separate defects survived that last treatment:

- At `bebefc8`, opacity was not complete through the entire exposed-tip region. Sampling only its uppermost row missed visible tips farther down.
- The horizontal veil faded out radially before the curved halo became strong, leaving a dark trough. In the user's 92 × 72 crop, one horizontal luminance profile drops from approximately 73 to 55 before rising to 149 out of 255. Template matching locates a similar area in the full baseline capture at (287, 390), with correlation 0.916; this is an approximate correspondence, not proof that the crop came from that exact frame.

## Research and method selection

| Method | Mechanism | Application here |
| --- | --- | --- |
| Precomputed curved light paths | Bruneton's beam-tracing method uses lookup tables to find intersections and filter light-source contributions. | Retain the existing tables and optical comparison; this defect is in the added emission treatment. |
| Distance-field combination | Implicit primitives are joined with rounded or smooth boolean operators before their surface or field is shaded. | Merge arc and disk bands into one continuous field instead of cross-fading independent shapes. |
| Emission and transmittance | A participating medium attenuates incoming radiance and contributes its own emission. | Separate coverage from brightness; use exact opaque coverage in the requested tip region. |
| Bloom | Filter visible bright sources and composite their spread back onto the scene. | Retain existing library postprocessing; Bloom alone cannot make the original line ends disappear. |

Primary references:

- [Eric Bruneton, A Real-time High-quality Black Hole Shader](https://ebruneton.github.io/black_hole_shader/) and the repository's pinned source/license record in `proxy/src/scenes/relativity/README.md`.
- [Mercury, hg_sdf](https://mercury.sexy/hg_sdf/): distance bounds and rounded shape combinations. No library code or new dependency is imported; the shader reuses its existing polynomial smooth-maximum operation.
- [Physically Based Rendering, Transmittance](https://pbr-book.org/4ed/Volume_Scattering/Transmittance): attenuation and optical thickness. This implementation uses an explicit artistic coverage plateau, not a physical density integration.
- [NVIDIA GPU Gems, Volume Rendering Techniques](https://developer.nvidia.com/gpugems/gpugems/part-vi-beyond-triangles/chapter-39-volume-rendering-techniques): emission/absorption and color/opacity composition.
- [NVIDIA GPU Gems, Real-Time Glow](https://developer.nvidia.com/gpugems/gpugems/part-iv-image-processing/chapter-21-real-time-glow): bright-source filtering and additive glow.

## Implemented field and composition

`limbVeil` now returns emission and coverage together. It constructs an arc-band distance from the existing joined contour, and a disk-band distance from the slowly perturbed edge height. The disk field is restricted outside the inner boundary. Their polynomial smooth union uses width 0.48, joining both the silhouette and the intermediate field values. The returned values are artistic distance bounds; their deformation is not a sphere-tracing guarantee.

The first local experiment used a clamped interior density and created a flat-colored strip. The final candidate maps the signed merged distance through a Gaussian with offset 0.28 and width 0.40, restoring a continuous interior brightness profile. Existing arc filaments and the new density combine through a smooth emission maximum. The upper glow returns to its original calculation outside the local junction region.

Coverage reaches exactly one over the exposed tips. Its lower margin feathers from -0.85 to -0.45 in scene coordinates and its upper margin from 0.24 to 0.65, relative to the perturbed edge height. A further 0.12–0.50 feather in the merged distance bounds coverage to the shared field. The narrow inner rim is excluded. Composition is `base * (1 - coverage) + emission`, so the fully covered region contains no underlying strand contribution. Lower strands reappear outside the veil. Bloom follows this composition through the existing rendering library.

The corrected contour field, accepted disk frequency and wave parameters, upper crest, dark core, scene framing, optical lookup tables and UI remain in place. This is a procedural emission/coverage model for the established view, not a fluid solver, volumetric ray marcher or additional physical lensing image.

## Evidence and reproduction

Baseline: `/tmp/proxy-cover-study/before.png`, captured from `bebefc8`. Candidate: `/tmp/proxy-cover-study/final/horizon-1440x900.png`. Both use fixed time 12, the same seed, viewport and card state.

- Across four rows through the exposed tips, the previous 10th–90th percentile luminance spread reaches approximately 151/146 on the left/right. The current spread is below two units in the sampled region. Below it, the strands retain strong contrast.
- Across three rows approaching each side of the halo, the previous profile falls 11–22 units below its starting veil luminance. The current sampled profiles have no such trough.
- The upper crest remains on row 124 with eight rows above 75% peak. The central foreground sample has zero channel difference. A larger upper-region sample has a maximum difference of nine units near the localized blend; the whole upper image is not claimed to be pixel-identical.

With built Storybook served on port 6006, reproduce using:

```sh
npm run proxy:storybook:build
node proxy/scripts/capture-limb.mjs /tmp/proxy-cover-study/final
```

The review is `http://127.0.0.1:6008/veil/`, served from `/tmp/proxy-limb-study/final/veil`. Source analysis, intermediate experiments, comparisons and measurements remain outside Git in `/tmp/proxy-cover-study`.

Fresh verification:

- `proxy:check`: 78 files, zero Astro errors/warnings/hints; ESLint and Prettier passed.
- `proxy:build` and `proxy:storybook:build`: passed, with existing bundler notices.
- The focused limb rendering case passed in Chromium, Firefox and WebKit (three cases). It now checks four rows for complete tip coverage and three halo-approach profiles for troughs, in addition to crest, core, continuous turning ridge, clear lower strands and normal animation. The previous capture violates the new coverage and trough criteria.
- The optical two-image/inclination-control case passed in Chromium (one case).
- Actual WebGL captures cover both scenes at 1440 × 900, 390 × 844 and 390 × 400. The 1280 × 800 normal-runtime recording lasts 25.32 seconds, encoded at 25 frames per second; full FFmpeg decoding passed.
- The review page decoded its images, played its video and fit 1280- and 390-pixel viewport widths in Chromium.

Logs use `/tmp/cover-*.log`. Artist media requests are disabled for visual recording. Browser emulation is not physical-device GPU evidence; the encoded rate is not a rendering-performance measurement. Tests establish the measured structure, not aesthetic acceptance.

## Continuation prompt

```text
Continue the selected B / Velvet drum study. Retain the upper thin rim, connected
turning contours, sparse irregular foreground waves, dark core and existing UI.
The exposed outer strand tips must be completely covered, not translucent.
Keep the horizontal veil and curved halo as one connected procedural field;
do not restore their dark trough or hide it by globally increasing Bloom.
Refine the unified emission profile or coverage according to visual feedback.
Show actual equal-scale WebGL details and normal motion, preserve previous
previews outside Git, and distinguish physical optics from artistic emission.
Do not push, open a PR or replace the production homepage during this review.
```
