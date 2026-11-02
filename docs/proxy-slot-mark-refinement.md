# Semantic Elsewhere marks and recessed storage

## Confirmed direction

The user selected relief printing for Event horizon and irregular foil for
Axolotl. The preview now resolves its default artwork from the current scene,
including after scene navigation. Explicit `cardArt` overrides remain historical
comparisons. The user also changed extraction to straight rise/return (`slide`);
drifting inlay remains selected. Only one bound card rises.

Music platform hover now performs one full 360-degree turn in 700ms. Motion owns
the rotation value. Leaving the target allows that turn to finish; repeated
entries while it is running do not stack turns. Reduced motion stops the turn
and restores the upright mark; target geometry and keyboard focus remain fixed.

## Turning “natural” into observable relationships

The following values are this round's proposed refinement, not independent
proof of aesthetic approval.

| Aspect | Previous | Current | Intended visual relationship |
| --- | --- | --- | --- |
| Left inset from the slot bounds | 20px | 32px | Clear the capsule's curved end |
| Maximum tile-card width | 280px | 268px | Trim the left edge while keeping the former right boundary |
| First exposed edge | 8px | 4px | Suggest stored stock instead of a partly extracted face |
| Vertical step | 7px | 3px | Two cards expose 7px total; three expose 10px instead of 22px |
| Horizontal step | 12px | 10px | Retain the upper-right diagonal without overstating depth |
| Stored-group opacity | 1 | 0.20 | Slightly fainter than the adjacent slot's 0.24 group opacity |
| Extraction direction | Temporary tilt | Vertical, zero rotation | Keep a coherent insertion track |

The resting stack supplies the raised card's measured left edge and width.
The same geometry is used in both states; shortening is shared with the raised
face rather than producing a width or position snap on extraction. Both palettes
use identical opacity and height rules. The rounded cut and 0.75px edge stay
consistent.

A face begins at the actual stored peek and opacity, rises to full opacity, and
returns to that same endpoint before the stack representation replaces it.
All nonselected cards remain at the lip. The existing last-request coordinator,
three-card window, wheel/touch/keyboard navigation, content scrolling and source
lip clipping remain in place.

## Semantic print candidates

The rejected GitHub tile contained abstract branching lines with no distinctive
GitHub silhouette. Its small scale and low contrast weakened recognition further.
These candidates keep the identifying subject larger than their decorative
lines. Labels remain in accessible names and the bound card; no button words or
native title tooltips have been added.

| ID | Blog subject | GitHub subject | Print vocabulary |
| --- | --- | --- | --- |
| `emblem` | Open pages and a central spine | Full GitHub mark | Large, restrained foil silhouettes |
| `intaglio` | Bound notebook with a bookmark | GitHub seal in a quiet enclosure | Engraved lines and subordinate registration strokes |
| `editorial` | Book thumbnail with article lines | GitHub mark with code brackets | Wider printed composition |

The user selected `editorial` (horizontal printing) as the default Elsewhere
mark style. `emblem` and `intaglio` remain explicit comparisons. The previously
accepted scene-specific card artwork remains unchanged.

The GitHub mark uses the unchanged Octicons `mark-github-16` path from commit
[`f04253eb4088fb9869418771effb391fa13a2744`](https://github.com/primer/octicons/blob/f04253eb4088fb9869418771effb391fa13a2744/icons/mark-github-16.svg).
The original MIT license is preserved in
`proxy/public/licenses/octicons-LICENSE.txt`; the path module includes attribution.
Only its size and theme ink are changed. Book/page motifs and surrounding print
work are original SVG paths. The card header also uses the GitHub mark for
consistent recognition. Historic repository line icons remain in old studies.

## Reproduction

- App: `http://192.0.2.10:4321/preview/?card=elsewhere&skipIntro=1`
- Gallery: `http://192.0.2.10:6008/slot-marks/`
- Mark comparison: `marks=emblem|intaglio|editorial`.
- Art defaults: horizon → relief; cubes → foil.
- Extraction/material defaults: slide / drift.
- `cards=demo` tests the eight-card extension.
- Storybook adds Foil Emblems, Intaglio Bookmarks and Editorial Prints.

Source: `ElsewhereMark.tsx`, `github-mark.ts`, `ElsewhereSegments.tsx`,
`SlotPreviewCard.tsx`, `ContinuousCards.tsx`, the existing finish selectors/CSS
and preview props. Artwork variants remain in `SceneCardArt.tsx`.

Review artifacts live outside the repository at `/tmp/proxy-slot-marks`.
The gallery includes magnified actual button crops, all six scene/mark pairings,
straight extraction/return recordings, a full-turn control recording and
previous/current resting comparisons. Backgrounds use the real WebGL renderer
at fixed scene time 12 for capture; live embeds run the normal scene clock.

## Executed validation

- Production and static Storybook builds passed. Astro (150 files), ESLint and
  formatting passed with no diagnostics; git whitespace check passed.
- 65 unit tests and 13 Slot cards Storybook interaction/a11y stories passed.
- 36 browser cases passed across Chromium, Firefox and WebKit. Coverage includes
  all three mark styles in both scenes, selected scene artwork, storage opacity
  and insets, full-turn rotation samples and reduced motion, native destinations,
  keyboard/Escape, two/eight-card cycling, interruption and rapid wrap, touch,
  card content scrolling and outer-slot isolation.
- Geometry checks ran at 320x320, 320x400, 320x240, 390x844 and 1440x900 across
  those cases. Actual headed Chrome captures additionally include 320x568 and
  768x1024. Captures use AMD Radeon Graphics through ANGLE; phone sizes are
  browser emulation, not real-device evidence.
- A 135-frame motion probe observed 30 distinct rising heights, zero rotation
  and a 7px maximum stored height for the normal two-card content.
- The LAN gallery played all six comparison clips and its control recording,
  with no page/resource errors. Its 320/390 layouts had no horizontal overflow;
  the live eight-card embed selected Sample 4 and kept the horizon relief art.
- Bundle report: 469,468 gzipped JS bytes / 18,028 CSS bytes, below existing
  512,000 / 30,720 byte budgets. No extra canvas or rendering library.

Artifacts are under /tmp/proxy-slot-marks: structured evidence, recipe, recorded
clips, actual screenshots and comparison source. Logs use /tmp/proxy-slot-marks-*.log.

## Accepted horizontal printing and progress alignment

The selected Elsewhere default is now `editorial`, including query fallback,
component defaults and the continuous presentation. Explicit mark comparisons remain.

The music progress line previously inherited the title's contour inset. At the
bottom of the capsule that inset placed its lower-left corner outside the painted
silhouette (confirmed at 1280 x 800). It now samples the SVG silhouette at its own
bottom edge, retains the shared 13px inner inset, and sits 6px above the slot box
bottom instead of 3px. At that viewport its left inset moved from 17.34px to
26.33px. Playback and native progress semantics are unchanged.

Validation: build and static checks passed; 11 presentation stories passed.
Six production browser cases passed across Chromium, Firefox and WebKit, covering
both scenes, the 13 shared viewports (320–1920px), reduced-motion re-entry at
320 x 320, the selected default marks, and 2px progress clearance inside the
actual curved silhouette. A deliberately displaced bar proves the geometry
oracle detects overflow. Headed Chrome screenshots cover both scenes at phone,
tablet and desktop widths; 65% fill is a visual fixture, not playback evidence.
Artifacts and logs are saved under `/tmp/proxy-progress-*`.
External audio is intentionally excluded from these UI checks. Recognition and
natural appearance remain subject to the user's visual judgement; automated
geometry results do not establish aesthetic acceptance.
