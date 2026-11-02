# Selected nameplate refinement

## User decisions and scope

The user selected the oblique nameplate material and requested four refinements: avoid card/wheel overlap, shorten the registration rule to the marked artwork edge, remove repeated control flashes, and compare slow background motion. A subsequent instruction removes visible Blog/GitHub labels from Elsewhere and asks for several graphic interiors and custom, richer hover previews.

The default continuous view now uses `nameplate`, static material (`surface=still`), and a plain icon-only Elsewhere entry (`elsewhere=glyph`). The selected silhouette, gold/blue palettes, IBM Plex Sans, card order, scene animations and cover transitions are retained. Slow material motion and the richer Elsewhere decorative treatments are review candidates; their aesthetic selection is still open. Historical `finish=original`, inset and seam remain available.

## Layout and reflection corrections

| Before                                                            | After                                                                        | Reason                                                                                                  |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Content avoided only the cover                                    | Inset includes half the wheel, 3.5% response overhang and an 8px gap         | Cube response bars can extend beyond the wheel box; the same conservative envelope protects both scenes |
| Rule ended at the wheel box                                       | Rule ends at the visible artwork, 12% of wheel width inward                  | Matches the user's marked edge, excluding the outer audio response                                      |
| Each control had a separate reflection and hover fill brightening | Per-control reflection is hidden and transport fill stays at 8% theme accent | Prevents repeated flashes while moving across or clicking three controls                                |
| Only the card box triggered contour remeasurement                 | Observe the content lines as well                                            | A hidden title can reappear/reflow on a phone-to-desktop resize without another card-size change        |

At 1440x900 the rendered card begins at x=975.84px. The rule runs from x=975.86px to x=1401.61px, matching the artwork's right edge at x=1401.61px. Its width falls from 444px to 425.75px. Content padding grows from 69.76px to 89.32px. Full control rectangles remain outside the response envelope, not just their painted icons. The footer retains one line and 44px link targets on narrow screens.

The card-wide reflection remains a 680ms sweep, with a 240ms opacity transition. Moving between its controls does not restart that sweep. Focus outlines and small icon press feedback remain available.

## Slow material candidates

All variants animate clipped SVG material groups; labels, hit areas, silhouette and lining remain fixed. There are no added canvas instances, blur filters or JavaScript animation loops.

| Query            | Moving layer                                           | Full cycle | Excursion at a 368px card                |
| ---------------- | ------------------------------------------------------ | ---------- | ---------------------------------------- |
| `surface=drift`  | Enamel and inset stripes together                      | 24s        | About ±14.7px                            |
| `surface=layers` | Enamel and inset stripes at different rates/directions | 28s / 18s  | About ±18.4px / ±14.7px                  |
| `surface=light`  | Broad illumination, with stationary texture            | 20s        | 320 SVG units of travel, peak alpha 0.14 |

Only the active, settled card advances. Hidden cards, card travel and backgrounded documents pause the material clock; reduced motion removes it. The fast pointer sweep and slow background use independent elements, so hover does not reset the slow cycle.

## Elsewhere disclosure candidates

`elsewhere=glyph|index|tile` selects a complete icon/preview pairing:

- Glyph: centered line icon, compact name/identity/domain preview, 228px maximum width.
- Index: icon and restrained decorative ticks, description added to a 260px information strip.
- Tile: a small page/node drawing behind the icon, 280px preview with description and topic tags.

No visible Blog/GitHub words remain inside the link targets. Native anchors retain their accessible names and original URLs. The preview has its own icon bezel, type hierarchy, narrow material inlay, address row and scene-colored border. It is rendered outside the rotating plane through a React portal into the same themed root, preventing clipping and inheriting the existing palette. It sits above the wheel and clamps horizontally and vertically to the viewport.

Behavior:

- Mouse hover and keyboard focus disclose the preview. It stays reachable across the gap to the preview and remains open while hovered.
- Escape dismisses without moving keyboard focus. Leaving, outside interaction, resize, hidden document or card navigation clears it.
- Touch first reveals; another tap on the original icon follows its actual URL. Outside tap dismisses.
- A short viewport permits scrolling the preview. Wheel/touch events in the portal must not bubble into carousel navigation.
- Entrance uses a 4px translation over 160ms; reduced motion removes the animation.
- Only one preview exists at a time. No hover-time network calls are added.

Optional preview content is validated in `siteSchema` and stored in `site.json`. It was checked against the public [blog](https://royenheart.github.io/) and [GitHub profile](https://github.com/royenheart) during this work: Blog identity and topic summary, GitHub handle and existing bio. Variable follower/repository counts are omitted. Descriptions are a curated snapshot, not a live profile feed.

## Review artifacts

- LAN comparison: `http://192.0.2.10:6008/nameplate-motion/`
- Selected baseline: `http://192.0.2.10:4321/`
- Direct Elsewhere candidate: `/?scene=horizon&elsewhere=index&card=elsewhere&skipIntro=1`
- Direct motion candidate: `/?scene=cubes&surface=layers&card=next&skipIntro=1`
- Scripts, recipe, screenshots, recordings and logs: `/tmp/proxy-nameplate-motion/`

The comparison page switches both scene palettes and both link destinations. It contains actual browser captures and twelve playable recordings rather than several simultaneous WebGL scenes. Surface motion recordings use a muted looping audio fixture to show the cover response; they are not NetEase availability tests. Fixed-time stills and normal running motion are captured separately. Headed Chrome reports AMD Radeon hardware WebGL. Mobile sizes are browser emulations, not physical-device benchmarks.

## Verification record

See the logs in the artifact directory for the current run. The checks cover the maximum response clearance, deliberate restoration of the old insufficient inset, rule/cover alignment, no wrapping, target stability, repeated playback input without control flashes, card-wide hover continuity, active/hidden/reduced material clocks, all hover disclosures, touch navigation, Escape, interruption and resize. Storybook covers both material palettes, three slow-motion states and all three disclosure states.

Executed evidence:

- Type, lint and formatting checks passed; all 63 unit tests passed.
- Both selected Storybook suites passed: 23 stories, including hover/focus/navigation and accessibility checks.
- The full browser run passed 32/33 cases across Chromium, Firefox and WebKit. The remaining WebKit playback case reproduced with the fixture returning a full 200 response to MP3 range requests; after implementing standard 206 byte-range responses in the fixture, its targeted rerun passed. No production audio logic was changed for this finding.
- The added short-screen preview-scroll regression failed before event isolation and passed afterward in all three engines (3/3). The 36 distinct browser scenarios are therefore covered by the matrix and targeted follow-ups; this was not one all-green 36-test invocation.
- Main geometry matrix: four cards, both scenes, three finishes at 320x320, 390x844, 639x450, 640x450, 768x1024 and 1440x900; preview-specific checks also cover short-screen scrolling, direct deep links and touch disclosure.
- The LAN gallery loaded all scene/link images and played all twelve MP4s; no page errors or phone overflow were observed. A slow pointer crossing to the preview kept it open.
- Captures used headed Chrome with AMD Radeon WebGL. Material transforms advanced in all six scene/motion recordings, with no page errors.
- Production bundle remained within configured budgets (approximately 465KB gzip JavaScript and 17.3KB gzip CSS).

The dependency optimizer now explicitly includes `react-dom`, because the new portal import previously triggered a mid-test Vite reload. This is a test-runner preparation fix, not a production dependency addition.

The prior autoplay-fixture discrepancy is a separate audit and is not claimed fixed here. External audio availability and real-phone GPU performance remain outside these UI verification results.
