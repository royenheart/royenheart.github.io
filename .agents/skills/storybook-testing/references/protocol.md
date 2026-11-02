# Responsive geometry and race protocol

## Geometry

Use `getBoundingClientRect()` in CSS pixels, not canvas bitmap dimensions. Give rounding a small tolerance (the current helper uses 1.5px). Measure after fonts and images have settled; poll meaningful conditions rather than sleeping for a guessed duration.

- Containment: child left/top must not precede parent left/top; child right/bottom must not exceed parent right/bottom.
- Collision: positive intersection on both axes indicates overlap. Adjacent borders may touch. Music popovers intentionally overlay the scene; music content must not overlap registration links in the footer.
- Alignment: scene bottom equals footer top; on narrow screens scene top equals navigation bottom; on wide screens scene left equals sidebar right.
- Clipping: check scroll dimensions and the bounds of interactive controls, not only the outer container. A truncated track title is allowed if the full title remains available; cropped buttons are not.
- Resize: repeat these calculations after portrait/landscape changes, breakpoint crossings, and scene switches. Canvas CSS size must equal its scene container.

Validate the oracle itself with a deliberate overlap/overflow mutation. Remove that mutation within the test's isolated page. Never change production CSS to satisfy the negative control.

The baseline matrix includes 320x568, 390x844, 430x932, 390x400, 844x390, 719/720/721x600, 768x1024, 1024x768, 1280x400, 1440x900, and 1920x1080. Extend it when a bug or supported device justifies another dimension. Check keyboard navigation, touch affordances, reduced motion, and zoom separately.

## Races

For every asynchronous resource, identify its owner and cleanup boundary. At minimum:

- Switch a scene repeatedly before and during visual transitions; the last user intent wins.
- Resolve the graphics import after a scene change; it receives the current scene.
- Unmount before a deferred import resolves; no graphics subtree may appear afterward.
- Change tracks while the old iframe is loading; the old timeout/status cannot modify the new track.
- Close the music panel before its timeout and reopen; the new instance owns a fresh timeout.
- Resize while switching scenes; no stale aspect ratio or detached canvas remains.
- Lose graphics context; fallback preserves navigation and scene selection.

Use deferred promises and explicit event ordering in Storybook `play()` functions. Use Playwright routing for network cases. No global promise mocks that leak into subsequent stories.

## Visual and performance evidence

Screenshots check overall composition; rectangle assertions catch silent layout errors. Neither substitutes for the other. Real-time scenes need deterministic capture time, seed, dimensions, and DPR for comparisons. Maintain separate reference captures per browser/device class if rasterization differs.

Do not confuse RAF interval with GPU frame completion. Report software rendering and missing true-device coverage. Check render submission stops while paused, and geometry/texture counts stabilize after repeated switching.

Official references: [Storybook interaction tests](https://storybook.js.org/docs/writing-tests/interaction-testing), [Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon), [accessibility tests](https://storybook.js.org/docs/writing-tests/accessibility-testing), [Playwright emulation](https://playwright.dev/docs/emulation).
