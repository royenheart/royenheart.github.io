# Single-card extraction and scene print studies

## Brief and analysis

The user selected lift-and-settle extraction and drifting inlay for the cards.
Only the selected card should rise. Other cards remain stored in the same slot,
with no full-height faces behind the raised card. The visible resting group still
steps toward the upper right and contains at most three physical cards.

The previous resting representation used separate square-ended strokes, whereas
the raised representation used a filled rounded rectangle. Their outlines and
widths did not match. This was a state-continuity defect, not a request to redesign
the accepted expanded face. Resting and raised states now share `slot-card-face`:
10px top corners, 0.75px edge, the same base material and same width. The first
edge exposes 8px; subsequent cards step 12px right and 7px up. Their bases remain
behind the slot. Only the raised binding is omitted from the resting stack.

The full-height rear-face renderer and its ResizeObserver were removed. The
existing requested/shown/leaving coordinator is retained: rapid inputs coalesce
to the latest binding and an exiting key cannot simultaneously re-enter. An
exchange returns the old face into the slot (160ms), then lifts the new face
(280ms). First extraction takes 340ms, with a transient -4 degree tilt; the
settled face remains upright and inserted 8px below the lip. Reduced motion uses
a brief opacity change. There are never two simultaneously raised faces.

## Confirmed control corrections

- Music platform hover rotates the glyph by 32 degrees over 420ms without moving
  the 44px hit target. Hover has no selection frame. Keyboard focus remains
  visible, and reduced motion suppresses rotation.
- Graphic Elsewhere tiles keep their schematic drawing but remove the central
  overlaid book/repository glyph. The expanded card header retains its icon.
- Platform and transport controls no longer have native `title` tooltips. Their
  accessible names remain. Truncated noninteractive identity/music text retains
  its full metadata.
- Both source slots and content cards default to drifting inlay. Slow material
  transforms remain separate from text and the scene printing.

## Pending artwork comparison

These are original editable SVG paths in `SceneCardArt.tsx`; no external artwork
or additional rendering library is used. The alternatives compare print/material
expression while holding card outline, copy, position and animation constant.

| ID | Cubes / Axolotl | Event horizon | Intended difference |
| --- | --- | --- | --- |
| `engraving` | Folded wire contours and cube lattice | Nested, bent ring contours | Fine printed watermark, minimal mass |
| `foil` | Irregular connected crystal facets | Twisted crescent and crossing ribbon | Broad reflective field with pearl/copper or blue accents |
| `relief` | Isometric cluster with light and dark faces | Stacked curved ridges | More explicit object depth and a stronger silhouette |

Each motif extends across an irregular lower-right area rather than sitting in a
circle or badge. A directional mask reduces ink behind the copy. The material
container clips decorative overscan independently of the content scroller; this
prevents the artwork from creating horizontal or vertical scrollbars. Short
screens still scroll actual card content.

`engraving` is the provisional preview fallback, **not a user-selected artwork**.
The chosen extraction and material are applied across all alternatives.

## Reproduction and review

- LAN app: `http://192.0.2.10:4321/preview/?card=elsewhere&skipIntro=1`
- Comparison: `http://192.0.2.10:6008/card-art/`
- `cardArt=engraving|foil|relief` selects the artwork study.
- `scene=cubes|horizon` selects the scene; omit to preserve random arrival.
- `cards=demo` supplies eight explicit sample cards only in preview.
- Historical `cardMotion=slide|lift|fan` and `cardSurface=drift|light|layers`
  overrides remain available.
- Storybook: `Explorations/Slot cards`, including Engraved Scene, Irregular Foil,
  Layered Relief and Eight Bound Cards.

Review captures, recordings, gallery source and its selection export are stored
outside the repository in `/tmp/proxy-card-art`. Background captures use the
actual WebGL scenes at `sceneTime=12`, 1280x800, cropped to a 500x420 dock view.
Live embeds omit capture mode and run the scene normally. The gallery records a
selection only on an explicit Save selection action and does not edit the app.

## Acceptance checks

- No more than three physical cards, and at most one raised face during rapid
  input, wrap-around, return and interruption.
- Nonselected faces stay within 23px above the source lip; equal-width resting
  edges share the raised card's corner radius and seven-pixel step.
- Inner navigation does not turn the outer information-slot carousel.
- Card remains attached, text clears the wheel, controls remain reachable,
  decorative art does not expand scroll bounds, and the document has no
  horizontal overflow at phone, tablet, desktop and short sizes.
- Native links work from the raised card, Escape returns focus, touch selection
  and horizontal swipes work, and reduced motion leaves meaningful feedback.

Validation results are appended after final runs; browser emulation does not
establish real-device GPU or audio performance.

## Executed validation

- Production Astro build and standalone Storybook build passed. Final Astro
  check, ESLint and formatting passed (147 checked files, no diagnostics).
- 65 unit tests passed; 10 Slot cards Storybook interaction/a11y stories passed.
- 45 production-browser cases passed across Chromium, Firefox and WebKit:
  all three art treatments in both scenes at 320x320, 390x844, 768x1024 and
  1440x900; two/eight-card navigation, rapid wrap and interrupted return;
  touch selection/swiping; short content scrolling; keyboard/Escape; reduced
  motion; material clocks; source hover rotation and absent native tooltips.
- The first browser run exposed a test-oracle distinction between CSS `none`
  and an identity transform matrix. The return check now verifies matrix
  identity; final browser runs passed. The first visual capture also exposed
  artwork overscan creating unwanted scrollbars; the decorative clipping layer
  fixed it, and art tests now assert the card has no horizontal overflow.
- Headed Chrome captured all six scene/art pairs on AMD Radeon Graphics through
  ANGLE. Phone/short/tablet screenshots were inspected. A 129-frame extraction
  probe observed 31 distinct rising heights and a peak tilt of -3.79 degrees;
  stored cards remained at the lip (15px maximum for the two-card content).
- LAN gallery playback checked all six comparison videos plus control feedback;
  the 320/390 gallery widths had no horizontal overflow, and the live eight-card
  embed selected Sample 4 with the requested foil artwork. Videos remove only
  leading loading frames; original WebM captures and trim offsets are retained.
- Gzipped JS totals 468,086 bytes and CSS 17,964 bytes, within the existing
  512,000 / 30,720 byte budgets. No new canvas or animation runtime was added.

Logs use `/tmp/proxy-card-art-*.log`; structured visual evidence is under
`/tmp/proxy-card-art/*-evidence.json`. Automated media routes intentionally avoid
external music playback in UI checks. Browser emulation and one local GPU do not
establish performance or audio behavior on external physical devices. All three
artwork variants remain available for user selection.
