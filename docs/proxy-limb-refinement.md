# Limb glow and hover playback refinement

Status: requested control changes are implemented on `refactor/proxy-modernization`. B / Velvet drum remains the selected card design. The user accepted the first upper glow and the revised foreground density. The subsequent [wave and outer-glow refinement](proxy-wave-refinement.md) addresses sharp distortions and the abrupt rim/disk connection. No push, PR, deployment or production homepage replacement is included.

## Reference analysis

The user requested removal of the card up/down buttons, playback revealed over the song artwork on hover, and a foreground ring extending to the bottom with an upper glow resembling the supplied illustration. The established black/gold palette and overall scene layout remain; the reference's cyan/pink colors, towers and vertical beams are not imported.

A programmatic analysis sampled the bright curved boundary in the supplied 596 × 335 PNG. A robust circular fit, excluding the tower occlusions, found center (524.84, 761.59), radius 669.06 px and median radial residual 1.29 px. This describes a large sphere's local edge, rather than specifying a mandatory circle size for the homepage. At x=470, relative luminance was 0.999 on the crest, 0.665 ten pixels inward and 0.511 thirty pixels inward. These are image measurements, not scene-linear radiance or evidence of the illustration's original shader.

The useful visual terms are **limb glow**, **rim lighting**, and **bloom**. NASA uses limb for a planet's apparent edge; Unity describes Fresnel-based rim lighting and high-luminance bloom. The reference suggests a narrow bright crest, a colored inner shoulder and a wider soft outer falloff. A Fresnel factor is one common implementation; the image alone cannot identify its original algorithm.

- [NASA: Exploring Earth's Limb](https://svs.gsfc.nasa.gov/11901/)
- [Unity: Fresnel Effect Node](https://docs.unity3d.com/Packages/com.unity.shadergraph@17.0/manual/Fresnel-Effect-Node.html)
- [Unity: Bloom](https://docs.unity3d.com/6000.0/Documentation/Manual/urp/post-processing-bloom.html)

The annotated supplied image and numeric samples stay outside Git in `/tmp/proxy-limb-study/reference-analysis.{png,html,json}`. The source image was not replaced by a reconstruction.

## Implementation

The `limb` treatment retains the existing Schwarzschild lookup tables for the foreground disk and lensed sky. Disk coordinates drive advected noise, antialiased radial filaments and a warm emission profile. The outer disk extends to 48 Schwarzschild radii so the visible foreground crosses the viewport's bottom edge. The secondary disk image is suppressed in this treatment.

The upper glow is an explicitly art-directed emission layer following the finite-observer capture boundary. It combines an antialiased narrow crest, an exponential colored shoulder and two softer exterior falloffs. This is a rim-lighting visual analogy, not a simulated black-hole atmosphere or a claim that a black-hole surface has Fresnel reflectance. The unchanged `optical` treatment preserves the previous two-image disk study.

The follow-up refinement reduces radial phase frequency from 47 to 31, retaining the same noise, animation and colors. Its lower arc mask now extends from screen-space y=-1.0 to -0.55, allowing the rim tips to meet the foreground disk before fading. Foreground opacity occludes the extended tips. The upper crest, shoulder and outer falloff formulas are unchanged. This is a compositional seam adjustment, not a change to the geodesic lookup tables or the physical inner disk radius.

The new view height is 7.2, with the existing aspect adaptation. Cube collapse and the horizon share the same framing choice so the scene transition still targets the visible capture region. R3F owns rendering and resource lifetime; the existing postprocessing package owns bloom. No rendering dependency or custom GPU lifecycle was added.

The carousel's up/down buttons are removed. Wheel input is scoped to the card stage; vertical pointer gestures and focused ArrowUp/ArrowDown remain available. Home/End jump to the sequence endpoints and Escape restores cover focus. The count and close control remain. Inactive cards remain inert.

Playback is a separate sibling button centered inside the artwork bounds, not a nested button. It appears on cover hover or keyboard focus. On touch screens, opening the cards by tapping the cover reveals it. Clicking the artwork around the playback button still toggles information cards. It hides after a mouse leaves unless keyboard focus requires visibility. Its target remains 44 × 44 px. The classic comparison retains its earlier controls.

## Reproduce

With Storybook running on port 6006:

```sh
node proxy/scripts/capture-limb.mjs /tmp/proxy-limb-study/join
```

The script produces desktop, phone and short-screen captures for both scenes, hover details, a real-time interaction recording and a local review page. Artist media requests are disabled for visual capture. Playback tests use explicitly labeled original preview tones; they do not establish live artist-stream availability. Screenshots freeze background time at 12, while the recording uses normal animation.

## Acceptance criteria

- No visible carousel up/down buttons in B; scrolling outside the cards leaves the index unchanged.
- Hover playback is centered within the actual artwork circle, with no detached button below the wheel.
- Mouse leave, keyboard entry/exit, touch entry, cancelled gestures and interrupted card transitions remain usable.
- Preserve the B capsule, contour-based text insets, scene metadata and final-card scene traversal.
- Preserve the accepted narrow white-gold upper crest around a dark core. Sparser procedural foreground emission reaches the bottom on desktop and phone, with no unlit break between the rim tips and the disk.
- Preserve the prior optical treatment for comparison, real animation, graphics fallback and reduced motion.
- Keep review captures outside Git and retain the user's untracked blog post.

## Continuation prompt

```text
Continue from B / Velvet drum with scoped wheel and touch card navigation and
playback revealed inside the song artwork. Keep its shape, proportions, text
insets and blue/gold surface materials. Preserve the accepted upper limb glow,
the foreground disk extension and the prior optical comparison. The latest user
feedback requests sparser filaments and no gap between the disk and lower rim.
Refine only the next feedback on those two variables. Use the supplied-reference analysis
as a visual guide, not proof of a physical lighting model. Render actual WebGL
previews on desktop, phone and short screens; check input, geometry, accessibility,
interrupted motion and normal rendering. Keep artifacts outside Git. Do not push,
open a PR or replace the production homepage in this review round.
```

## Original control and glow verification

- `npm run proxy:check`: 78 files, zero Astro errors/warnings/hints; ESLint and formatting passed.
- `npm run proxy:test`: 37 tests passed.
- `npm run proxy:storybook:test`: 52 stories passed, including interactions and accessibility.
- `npm run proxy:build` and `npm run proxy:storybook:build`: both passed. Existing graphics-chunk and Three.js deprecation notices remain.
- Chromium: all 12 cases in `limb-controls.spec.ts` and `rotary-directions.spec.ts` passed against the development server. This includes all three card designs across 17 width/height combinations and eight cards.
- Firefox and WebKit: 24 focused cases passed against the built Storybook artifact. They cover new input/playback, reference-informed pixel assertions, B's 17-size matrix, interrupted motion, selected-scene traversal and the previous optical renderer's rendering/failure cases.
- Chromium: all five `relativistic-horizon.spec.ts` regressions passed against built Storybook. Total: 41 browser cases passed across the three runs, with no failed case.
- Actual WebGL captures: both scenes at 1440 × 900, 390 × 844 and 390 × 400, plus two artwork-hover details. The 1280 × 800 interaction recording is 20.68 seconds at 25 encoded frames/second and decoded fully with the available local FFmpeg binary.

The desktop candidate's central upper crest spans eight rows above 75% of its peak luminance; the sampled bottom region averages 17.91/255 luminance. The tests separately verify a dark core, narrow crest and visible foreground emission near the lower edge. These measurements establish the intended structure, not aesthetic acceptance.

Browser emulation, synthetic touch pointer sequences and local preview-tone playback are not evidence of physical-phone GPU behavior, assistive-technology certification or artist-stream availability. Review files remain in `/tmp/proxy-limb-study/final`, and command logs remain under `/tmp/limb-*.log`.

## Foreground spacing and connection follow-up

The accepted glow capture remains in `/tmp/proxy-limb-study/final`; the revision is in `/tmp/proxy-limb-study/join` and its review copy in `/tmp/proxy-limb-study/final/join`. The comparison page is `http://127.0.0.1:6008/join/comparison.html`. The new recording is 22.96 seconds at 1280 × 800 and 25 encoded frames/second; full FFmpeg decoding passed. Both scenes were captured at 1440 × 900, 390 × 844 and 390 × 400.

At fixed time 12 on the 1440 × 900 captures, the central foreground strip (x=695–744, y=570–859) has 29 luminance peaks instead of 45, measured with prominence 8 and minimum separation 3 pixels. Along the left rim at y=435–539, the minimum sampled luminance rises from 0 to 186/255; dark samples below 20 fall from 38 rows to zero. The upper region (x=340–1099, y=40–349) has zero pixel difference. The bottom sample remains illuminated at 18.29/255. Sampling data are retained in `join/measurements.json`; these comparisons verify spacing and continuity without establishing the user's preferred final density.

The existing renderer regression now follows both rim tips using a radius inferred from the rendered upper crest and rejects an unlit break. It also checks the narrow upper crest, dark core, bottom emission and changing normal-runtime frames at desktop and phone sizes. The focused case passed in Chromium, Firefox and WebKit. WebKit's first launch failed host dependency validation on Fedora before page execution; rerunning with the documented local compatibility environment (`PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1`) passed the actual rendering assertions. Logs are `/tmp/limb-join-browsers.log` and `/tmp/limb-join-webkit.log`.

`npm run proxy:check`, `npm run proxy:build` and `npm run proxy:storybook:build` passed for this revision. The controls are unchanged; the earlier interaction suite is recorded separately above. No review captures are committed.
