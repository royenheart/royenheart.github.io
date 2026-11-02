# Dock refinement and visual discontinuity

## Accepted functional changes

The continuous preview uses IBM Plex Sans and the existing licensed Noto Sans SC
subsets for Chinese labels. Each accepted scene navigation samples one of the
three cover materials once. Repeated input while busy cannot resample it.

The final information card contains previous scene, music play/pause and next
scene. The artwork has no overlapping playback button. Pausing music changes
only the native player and artwork response, never the scene material clock.
Music platform links remain inside the song card; Elsewhere groups Blog and
GitHub with locally drawn book and repository icons. Official registration
labels and URLs remain unchanged below the dock.

## What “jarring” means in this composition

Visual discontinuity is not a universal numerical score. Measurements can
expose mismatches in hierarchy, scale, material and timing, but whether a
particular balance feels appropriate still requires review in the moving scene.
We use separate observable constraints rather than an invented weighted score.

Initial browser measurements at 390 × 844 and 1440 × 900:

| Observable | Before | Revised constraint and reason |
| --- | --- | --- |
| Painted link height / card height | 44 / 56 = 79% on phone; 44 / 62 = 71% on desktop | 24 / 56 = 43%; retain the 44px hit area. The action no longer resembles a second full-height card. |
| Registration panel area / card area | 94 / 56 = 1.68 on phone; 52 / 62 = 0.84 on desktop at equal widths | Remove the filled enclosing panel. Retain a faint top rule, readable text, and separate touch areas. |
| New control outline / existing card outline | 1px / 0.65px = 1.54 | Use the same 0.65px line scale. A small secondary control should not have the heavier boundary. |
| Resting link border accent opacity | 24% | 14%; fill 5%, interactive fill 14%. Main text retains its reading contrast. |
| Palette distance | Two scenes already provide their accent token | All new ornament derives from that token; introduce no independent accent hue. Gold alone is insufficient if shape, texture or motion still disagrees. |
| Icon travel / icon size | Draft exploration used 4px on a 17px icon, about 24% | At most 1px, about 6%, with at most 3° tilt and 6% press compression. |
| Text stability | Draft candidates revealed, blurred or tilted labels | No independent text transform, blur or reveal. Typography travels only with the accepted cylinder. |
| Detail phase relative to card rotation | Uncoordinated entry can look like two consecutive animations | Entry starts 180ms into the 680ms turn and finishes by 580ms. It is settled when the card arrives. |
| Decorative runtime | Repeated shimmer can compete with scene motion | One-shot entry/focus feedback; zero running detail animations at idle. |

The first three rows were measured from the actual rendered UI. The numerical
limits in later rows are project-specific art direction, not perceptual laws.
The discarded, stronger draft was not selected or published as the default.

The scene supplies large flowing surfaces and a small textured capsule. New
independent rings, thick boxed chips, high-contrast flat panels and letter-level
motion each add a competing visual vocabulary. The correction preserves the
same capsule, stroke weight, local texture and accent across all comparisons.
Do not infer thematic fit from matching color alone.

## Controlled alternatives

All three studies use the same font, content, dimensions, colors and card
material. They are optional through `details=`; the regular preview remains
`none` until feedback selects a direction.

| ID | Mechanism | Timing | Intended relationship |
| --- | --- | --- | --- |
| A / etch | A small icon stroke is inscribed; a quiet stationary text underline | 260ms after 180ms delay | Echoes fine engraved marks and the cube scene's precise construction. |
| B / flow | A bounded, low-opacity reflection crosses the existing action surface | 400ms after 180ms delay; also on focus/hover | Echoes moving light in the horizon material without another luminous object. |
| C / orbit | The icon settles through a very small curved tilt | 360ms after 180ms delay | Echoes the drum's cylindrical travel without introducing a new orbit ring. |

Hover motion is gated to a fine pointer. Keyboard focus retains the native
visible focus indicator. Press feedback affects the glyph inside its stable
hit area. Reduced motion removes spatial/entry motion; hidden pages stop detail
animation. Switching cards cancels the inactive card's entry. Playback icon
replacement triggers the same local treatment, without changing layout.

These are CSS/SVG microinteractions, not fluid simulation. Transform and opacity
handle reflection and tilt. SVG dash animation repaints only the small icon;
it should not be described as entirely GPU-composited. No scene-wide filter,
additional renderer or per-frame React state was introduced.

## Rendering regression discovered during verification

A generated looping audio fixture exposed repeated demand-mode draws while
reduced motion was active: native time updates rerendered the un-memoized scene
component. Memoizing the existing canvas boundary isolates stable scene props
from song progress. The regression test requires idle frames to settle, then
requires frames and material time to keep advancing after music is paused in
normal motion. This separates music state from background state explicitly.

## Review surfaces

- Current website: `http://192.0.2.10:4321/preview/`.
- Controlled comparison: `http://192.0.2.10:6008/dock-refinement/`.
- Actual scene studies: `/preview/?scene=horizon&details=etch`, `flow`, `orbit`;
  replace `horizon` with `cubes` to inspect the blue material.
- Storybook: `Explorations / Continuous presentation / Etched Details`,
  `Flow Details`, and `Arc Details`.
- Review files, measurements and recordings: `/tmp/proxy-dock-refinement/`.

Aesthetic selection remains pending. Test evidence is recorded after the final
verification pass below.

## Final verification

- `npm test`: type checks, lint, formatting and **63 unit tests** passed.
- Production and Storybook builds passed; **8 presentation Storybook stories**
  passed their browser/accessibility checks.
- **24 browser scenarios** passed across Chromium, Firefox and WebKit. The
  selected layout matrix covers 11 viewport sizes from 320px through desktop,
  both scenes and all retained cover treatments. The detail matrix covers all
  three studies, both themes and four widths with real card turns, rapid input,
  resize, keyboard focus, hidden pages and reduced motion.
- The separate Chromium render-lifetime check passed after the canvas memo fix:
  playback during reduced motion settles to zero redraws; pausing music during
  normal motion leaves scene frames/time advancing; repeated transitions keep
  one canvas and bounded resources.
- Compressed output: **461,720 bytes JavaScript**, **14,488 bytes CSS**, within
  the existing 512,000 / 30,720 byte limits.
- Actual headed Chrome captures used AMD Radeon through ANGLE. Three study
  recordings cover both themes with no page errors. Phone (320/390), tablet
  (768) and desktop (1440) screenshots were inspected. One incorrectly sized
  review recording was recaptured and its filmstrip checked before delivery.
  This is local rendering evidence, not a new frame-rate benchmark or a claim
  about every visitor's hardware.
- The LAN comparison and website return HTTP 200. The comparison wrapper has
  no document overflow at 390px or 1440px and all seven live links resolve to
  the intended preview URL.

Audio interaction tests use a generated looping fixture. They verify native
playback/control behavior without claiming that an external NetEase URL will
remain available indefinitely. Decorative studies remain pending aesthetic
feedback; no default was selected automatically.
