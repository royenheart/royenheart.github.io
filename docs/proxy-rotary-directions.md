# Rotary controls and contour-aware typography

Status: the user explicitly selected B / Velvet drum (rounded capsule with cylindrical card travel). It is now the Orbit component default and the selected-recording stories use it. A and C remain comparison studies. Work stays on `refactor/proxy-modernization`; no push, PR or production promotion. The classic Orbit deck remains available. The upper-left monogram and brand label have been removed from the immersive study, while its scene heading remains available to assistive technology.

## Brief and reference

Keep the two full-screen scenes, selected recordings, compact artwork control, information hierarchy and adjacent-scene triggers. Compare top alignment, softer silhouettes, different proportions, scene-specific texture and actual circular card motion. The subsequent feedback also requires content to follow the card silhouette instead of sharing one vertical left rail.

Programmatic analysis of the supplied 1029 × 462 sketch fitted the circle's right arc to center (797.97, 231.02), radius 210.59. A line fit to the ribbon's upper edge reaches y=19.08 at the circle center, against a circle top at y=20.43. This supports a top-tangent relationship. The observed ribbon height of about 164 px is not a mandatory scale.

## Candidates

| ID                 | Silhouette and proportion                                                                            | Material                                                      | Movement                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| A / Tangent glass  | Rounded taper; top aligns with the actual cover; wheel 144/124 px and card 54/48 px on desktop/phone | Etched facets for cubes, curved gold contours for the horizon | A radial sweep around the artwork center with a shallow depth turn                      |
| B / Velvet drum    | Shorter, fuller capsule; centered attachment; wheel 152/136 px and card 62/56 px                     | Fine woven strokes in blue, short brushed marks in bronze     | Cards roll vertically around a horizontal cylinder axis; adjacent faces tilt and recede |
| C / Orbital ribbon | Longer, slender curved taper; wheel 132/116 px and card 48/44 px                                     | Flowing blue filaments or warm accretion-like lines           | An elliptical path with depth and banking toward the artwork                            |

The outer trim follows the same card step. The actual audio spectrum remains driven only by available native audio. Inactive cards are inert and hidden from assistive technology. Previous/next controls, scoped wheel input, touch and arrow keys remain available; Escape restores artwork focus. Rapid input retargets the current angle without unmounting the cards. Reduced motion updates content without spatial travel.

These are finite sequences with visible neighboring faces, not a simulation of a mechanical object. The final information card retains scene traversal.

## Content follows the painted shape

`CardSurface.tsx` paints each rounded contour and its deterministic SVG texture. `useContourLayout.ts` samples that same outline at each text line's lower edge and applies a 13 px reading inset. The title, eyebrow and progress line no longer inherit one arbitrary shared left padding. Measurements use local layout offsets, not transformed screen rectangles, so rotation does not deform the text layout. Resize and font readiness trigger recalculation; there is no new per-frame layout loop.

The capsule produces a small curved offset; the tapered candidates produce more pronounced step-in alignment. Text remains horizontal for reading. Action controls keep 44 px targets and clear the artwork attachment.

For the selected B capture at 1440 × 900, the artwork itself measures 115.5 px in diameter inside the 152 px wheel; the active card is 62 px tall. At 390 × 844, these measure 103.34 px, 136 px and 56 px respectively. The introductory eyebrow/title insets are 14.78/19.15 px on desktop and 14.47/18.17 px on phone. These measurements distinguish the artwork boundary from the decorative outer ring and demonstrate the curved text offset.

## Terminology and implementation references

The general interaction is a **3D carousel**. A cylindrical carousel distributes cards around a cylinder; a radial or orbital carousel describes the circular path around an anchor. These are useful descriptions of the implementation, not three standardized HTML widgets.

- [David DeSandro: CSS 3D carousel](https://3dtransforms.desandro.com/carousel) explains perspective, face placement and angular indexing.
- [Motion: 3D transforms](https://motion.dev/docs/3d-transforms) explains the transform axes, perspective and preserved depth.
- [WAI-ARIA carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) informs naming, inactive content and keyboard controls.

The implementation uses the already-installed Motion package and native CSS/SVG. No renderer or animation dependency was added.

## Reproduce and review

With Storybook running on port 6006:

```sh
node proxy/scripts/capture-rotary.mjs /tmp/proxy-rotary-study/final
```

The script refuses a destination inside Git. It renders eighteen full-page screenshots across both scenes and 1440 × 900, 390 × 844 and 390 × 400 dimensions, six detail views, one comparison sheet and two side-by-side browser recordings. Each recording sends the same three forward and three reverse actions to all candidates. Background time is fixed at 12; the card transition is live, with a requested duration of 0.85 seconds. Browser recordings are wall-clock evidence, not frame-perfect exports.

`index.html` includes an interactive three-frame comparison, individual stories and device captures. `recipe.json` records actual wheel/card measurements and text insets; its selection is `drum`, recording the explicit user choice. Media requests are disabled for capture, with no replacement artist audio. The videos do not establish physical-device GPU performance.

## Acceptance criteria and continuation prompt

- No visible upper-left brand; retain the accessible scene name and factual registration links.
- Each candidate keeps its intended attachment and proportion at rest, including top-tangent alignment for A.
- Text has an inset from the actual contour at each line, with no clipped active controls or document overflow.
- Cards follow distinct, visibly spatial paths in both directions; interrupted input, resize, close/reopen and reduced motion remain usable.
- Preserve the selected B silhouette, proportions, cylindrical motion, contour-aware typography and both scene materials. Keep A/C and the original trapezoid baseline available for comparison.

```text
Continue from the user-selected B / Velvet drum: a rounded capsule with cylindrical
card travel. Its desktop/phone wheel is 152/136 px and its card is 62/56 px tall.
Keep the two scenes, compact corner composition, recording metadata, accessible
controls and scene triggers. Preserve the selected silhouette, material and motion
as separate decisions. Fit each text line to the same painted SVG contour, keeping
text horizontal and touch targets at least 44 px. Vary only unresolved proportions
or motion properties. Render both themes, phone/desktop/short-screen layouts and
real forward/reverse motion. Run geometry, interruption and reduced-motion checks.
The choice applies to the Orbit study; production promotion remains separate. Keep review captures outside Git and do not push or create a PR.
```

## Verification record

- `npm run proxy:check`: 76 files checked, zero Astro errors/warnings/hints; ESLint and formatting passed.
- `npm run proxy:test`: 37 tests passed.
- `npm run proxy:storybook:test`: 51 stories passed, including interactions and accessibility, after selecting B.
- `npm run proxy:build` and `npm run proxy:storybook:build`: both succeeded. Existing large graphics-chunk and Three.js deprecation notices remain.
- The three-candidate Playwright run covered 17 sizes, all eight information cards, computed contour/attachment geometry, actual intermediate 3D transforms, interrupted input, resize, focus restoration and reduced motion in Chromium, Firefox and WebKit. It initially passed 19 of 21 cases; two negative-control cases queried before Storybook mounted. After adding the mounting wait and missing-root diagnostic, the negative-control rerun passed in all three engines (21 distinct cases passed across those runs).
- An explicit string type on the Storybook `dockDesign` control preserves URL overrides: the inferred union was otherwise rejected by Storybook's argument mapper. The classic capture scripts now request `dockDesign:classic`, and the classic ribbon test asserts the design before measuring it.
- The new selected-recording integration case passed in all three engines: quiet entry, B selection, artwork metadata, final-card forward/reverse scene navigation, reset to the first card and short-screen geometry. Its first run exposed an incorrect lowercase title expectation in the test; correcting it to the existing `Axolotl` metadata produced three passes without changing application content.

- The classic baseline regression covered artwork containment throughout forward/reverse exchanges and Tab/Escape/scoped scrolling in three engines. Five of six cases passed initially; the Chromium exchange trace recorded an unexpected page navigation during concurrent development/build activity. A separate Chromium rerun, after those processes finished, passed without an application or test change (all six distinct cases passed across the runs).

The review artifacts and command logs remain outside Git under `/tmp/proxy-rotary-study/final` and `/tmp/rotary-*.log`. Browser layout and motion tests used the local Storybook development server; the separate build proves the standalone explorer compiles. The tests do not establish artist-stream availability or physical-device rendering performance, and the original Astro homepage has not been replaced or deployed.
