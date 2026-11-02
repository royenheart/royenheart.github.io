# Bound cards and information slots

The user selected the drifting inlay surface and graphic tile marks. The lower capsule is now described as an information **slot**; a component inside it may bind an inserted **card**. The corrected requirement is component-to-card binding, not component-to-slot binding. Only Elsewhere's two links currently provide preview content. Music transport, identity and scene controls have no fabricated cards or stack affordances.

## Reference interpretation

The sketch has a rounded front lip, two parallel exposed top edges and short diagonal depth cues. Treat this as a card pocket/index-card drawer: maintain an occluding lip, a common source position and reversible extraction. Preserve the approved capsule shape, Plex typography, blue/gold material family, static icon targets and the whole-slot hover reflection.

The former enamel polygon changed opacity abruptly around SVG x=100. A user-space gradient now covers the full overscanned field, gradually increasing accent opacity from zero to 0.075 over 440 SVG units. No hard polygon boundary crosses the icons. Painted controls and glyphs have zero interaction translation/scaling in the selected nameplate finish. Held outlines communicate hover, focus and press without a replayed flash. The accepted material and card-wide reflection clocks remain independent.

Bound card content uses a 12px group gap, 4px body gap, 12/20px header line heights, 16px identity line height and 18px description line height. The hostname footer and its divider are removed; actual destination URLs remain unchanged. These are project-specific design parameters, not universal aesthetic thresholds.

## Motion studies

| Query              | Source path                                         | Timing                                       | Tradeoff                                                               |
| ------------------ | --------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| `cardMotion=slide` | Straight extraction and reverse return              | 280ms in / 180ms out                         | Quietest; quiet first opening; browsing uses the shared group exchange |
| `cardMotion=lift`  | Four-degree initial tilt, lift, settle to zero      | 340ms in / 180ms out                         | Stronger physical handling metaphor; slightly slower                   |
| `cardMotion=fan`   | Opposed small lateral offsets and three-degree tilt | 280ms in / 180ms out; new entry delayed 90ms | More explicit layered exchange; source text remains with its card      |

The user rejected the intermediate detached window, even though it animated from the slot. All three now remain inserted 8px below the source lip at rest. A fixed aperture clips the concealed lower edge. Card width follows the source slot; lower tags reserve the wheel overlap on narrow screens. The portal shares stacking order with the deck: above rear slots, below the wheel. There is no settled gap. The aperture is fixed in screen coordinates and ends at the source slot's upper lip. Each keyed card is clipped behind that lip during movement, rather than fading a static popup. Side padding protects tilted corners and shadows. Motion's presence lifecycle retains old content until it returns. Returning cards are inert, hidden from accessibility and unable to intercept pointers. An explicit requested/shown/leaving coordinator keeps the physical window at at most three cards, including exchanges. It changes the physical key only after exit completes, coalescing rapid repeated requests into the latest selection. This prevents an exiting key from being resurrected during a fast wrap-around. First opening uses the chosen extraction. Browsing within the open group moves the old card toward the upper-right rear and advances the next toward the lower-left front (120ms exit, 220ms entrance); only dismissing the group returns the card fully into the slot. Rapid changes retain the latest desired binding.

A cyclic three-entry window selects actual bound hrefs for the front card and up to two rear material faces. The front holds readable content and the only active destination link. Resting edges and expanded rear faces share the same front-to-back ordering: each step is 12px right and 7px up, with parallel top edges. Extra bindings are not mounted as extra cards. Unbound slots have no edge ornament. The selected icon gets a held contour treatment while its card is requested. The portal escapes the rotating deck plane without changing the deck's layout or pointer targets.

## Material studies

| Query                | Treatment                                             | Full cycle      |
| -------------------- | ----------------------------------------------------- | --------------- |
| `cardSurface=drift`  | Broad enamel and soft inlay translate together        | 24 seconds      |
| `cardSurface=light`  | Wide low-opacity illumination crosses quiet material  | 20 seconds      |
| `cardSurface=layers` | Enamel and inlay travel at different rates/directions | 28 / 18 seconds |

Only clipped decorative layers animate. Text, title icons and layout do not drift. No new backdrop blur, shader pass, renderer or dependency was introduced. Reduced motion removes spatial movement and material animation, retaining a brief opacity response. Hidden-page state closes cards and stops background material work. On short screens, the body scrolls first; at its content boundary, further wheel input advances the inner card group. It never advances the outer slot deck. Left/right keys and horizontal touch swipes browse the inner group; outer slot navigation retains its existing controls.

## Interaction and lifecycle

- Bound components are named Blog/GitHub buttons that select their cards; the card header provides a native Open Blog/Open GitHub link. Unbound links remain native anchors. No duplicate browser `title` popup.
- Pointer travel between any bound component, the gap and the card keeps the card available. Treating the entire component area as a safe region prevents a stale leave event from dismissing a newly requested card.
- Keyboard focus reveals details, Escape dismisses while leaving focus on the trigger, and deck navigation closes disclosure.
- Clicking/tapping a binding selects and pins that card; the header arrow opens its destination. Outside pointer-down dismisses. Horizontal touch swipes browse the inner card group.
- Resize, visibility loss, inert state and deck rotation close the active request. No delayed reopening timer exists.
- The source surface shape, footer geometry, music behavior and scene shaders are unchanged.

## Sources

- [Motion AnimatePresence](https://motion.dev/docs/react-animate-presence): keyed content, retained exit animations and wait/sync sequencing. Implemented with the repository's existing Motion dependency.
- [W3C content on hover or focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html): dismissibility, hoverability and persistence.
- [WAI tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/): non-focusable descriptive content and Escape handling. The new interactive card group uses a labeled carousel region and a current-card group, not tooltip semantics. Focused group navigation survives card replacement; Escape returns focus to the selected binding.

The physical treatments above are original proposals for the user's sketch, not names of standardized design patterns.

## Review and evidence

- LAN review: `http://192.0.2.10:6008/slot-cards/`.
- Live page: `/?card=elsewhere&cardMotion=slide&cardSurface=drift&skipIntro=1`.
- Seven Storybook studies under `Explorations/Slot cards`, preserving older finish and detail studies.
- Artifact directory: `/tmp/proxy-slot-cards` (captures, recordings, recipe, logs and gallery).
- Tests: bound-only stack edges, stationary controls, old-content return, rapid A/B/A intent, Escape/reopen, resize/navigation cleanup, touch activation, short-screen scroll isolation, material-only motion, reduced motion and overflow negative control.
- Visual comparison: both rendered scenes; 320, 390 and 768px width captures. Browser emulation does not establish physical-device performance.

Drift/tile are selected. First-opening motion and card material choices remain proposals until visual feedback; the live page uses slide/drift as a provisional comparison baseline.

## Expanded group acceptance checks

`cards=demo` explicitly injects eight labeled sample cards into the preview; production metadata remains the two real links. `EightBoundCards` supplies the same review-only fixture in Storybook. The component accepts typed link bindings rather than assuming two items. A pure cyclic-window function caps both resting and expanded groups at three.

Regression checks count every rendered front/rear face during rapid navigation, verify both wrap directions, select a distant binding, keep the outer slot index unchanged, exercise horizontal touch input and verify focus restoration. The attachment oracle deliberately detaches the card to ensure it detects a gap. Text clearance is checked against the wheel's circular envelope. Firefox's automatically focusable scrolling nav introduced an unnecessary Tab stop; the nav is now programmatically focusable only, while its binding buttons remain in normal tab order.

A stress regression repeats six bursts of eleven forward steps, waits for the actual selected face, then interrupts a reverse step with Escape and selects a distant binding. The resting edge representation is hidden while raised faces exist, so it cannot double the visible card count.

## Executed verification

- Production build and Storybook build passed. Astro/TypeScript, ESLint and formatting checks passed (145 files; zero diagnostics).
- Unit suite: 65 passed. Three affected Storybook files: 30 passed; the seven slot-card stories passed again after the request/shown coordinator change.
- The three-browser integration matrix passed 27 cases before the queue fix. After fixing the discovered rapid-wrap race, all 12 carousel cases (including the new stress case) passed across Chromium, Firefox and WebKit; all three selected extraction lifecycle cases passed again as well. Earlier failed runs remain in the artifact directory for diagnosis.
- Desktop headed Chrome reported AMD Radeon ANGLE. Captures cover both themes and 320/390/768px viewports. Physical phones were not tested.
- The gallery loaded and played all ten distinct recordings, with zero page errors, no horizontal overflow at 320/390px, and a working eight-card embedded preview. Recordings crop real browser output and remove only initial loading frames.
- Final evidence: `race-final.log`, `lifecycle-final.log`, `check-race.log`, `stories-race.log`, `capture-evidence.json`, `gallery-evidence.json` and `recipe.json` in `/tmp/proxy-slot-cards`.
