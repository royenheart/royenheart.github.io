# Orbit study: artwork-aligned information ribbons

Status: interactive Storybook exploration on `refactor/proxy-modernization`. The production Astro homepage retains its existing layout. Captures stay outside Git. No push or PR has been requested for this iteration.

## Reference geometry

The user's second sketch defines the circle as the **song artwork**, not the spectrum, vinyl rim or containing box. Each information ribbon is a complete trapezoid with a wider top. Its entire right seam disappears behind the artwork, while its vertical extent stays inside that circle.

The measurements are reproducible without relying exclusively on visual interpretation. `proxy/scripts/measure-ribbon-reference.py` thresholds dark pixels, fits the isolated right side of the circle with least squares, and detects the long horizontal ribbon edges by row occupancy. For the supplied 986 × 461 sketch:

| Measurement | Result |
| --- | ---: |
| Artwork circle center | (755.11, 230.12) px |
| Artwork diameter | 421.17 px |
| Ribbon height | 164 px |
| Ribbon height / artwork diameter | 0.389 |
| Ribbon center offset / artwork diameter | -0.079 |

The implementation rounds the height ratio to 0.4 and retains the vertical offset. The full trapezoid ends at the circle's horizontal center; the wheel layers over it. A stable circular artwork wrapper provides the measurement reference even while the image rotates. The lower preview card retains the same outline, with a small left/down offset. Both scene themes share geometry and vary only colors and internal surfaces.

At 1440 × 900, the rendered front ribbon is approximately 70.03 px high and the artwork is 175.09 px in diameter. At 390 px wide, those values are approximately 51.06 px and 127.66 px. Compact pages split profile links and music source links into separate cards so that controls can retain 44 px target sizes.

## Interaction and rendering scope

- The initial scene is random unless a story pins it. Adjacent traversal cycles through cubes and horizon.
- Native audio completion or the last information card triggers scene navigation. Quiet entry has no automatic scene timer.
- Clicking or focusing the artwork opens the deck. Wheel input, touch gestures, arrow keys and explicit controls exchange cards. Escape closes the deck and restores artwork focus.
- Native audio drives the frequency ring. Unavailable audio leaves a quiet scene and source links; the selected artist tracks have not been verified as playable in the browser.
- The existing black-hole shader remains a baseline. Its replacement algorithm and the requested track sources are documented in [the research note](proxy-black-hole-research.md). Transition studies are provisional pending that reconstruction.

## Verification and review artifacts

`proxy/tests/support/orbit-layout.ts` measures rendered elements, not screenshots. It compares front and preview ribbons with the actual artwork bounds, checks the trapezoid's right corners against the circle equation, and uses `elementFromPoint` to verify that the disc really occludes the seam. It also checks control hit targets, circle-aware collisions, containment and viewport overflow. Hidden content is excluded from containment checks because it has no rendered box.

`proxy/tests/e2e/orbit.spec.ts` exercises all fixture cards at 17 viewport sizes, including 320 px phones, tablets, short screens, 1920 px desktops and the 639/640 px breakpoint. It also covers focus, scoped scrolling, repeated scene input, resize during traversal, real fixture audio completion, reduced motion and graphics failure.

`proxy/tests/e2e/orbit-ribbon.spec.ts` uses the eight cards associated with each selected recording. It samples rendered ribbon geometry on animation frames during forward and reverse exchanges at phone and desktop sizes. This complements the stable-layout assertions and actual browser recording.

Capture command, with Storybook running on port 6006:

```sh
node proxy/scripts/capture-orbit.mjs /tmp/proxy-orbit-study/cover-aligned
```

The script rejects repository-local destinations. The output contains six screenshots, `card-motion.webm`, a `recipe.json` with measured geometry, and an HTML review page. It fixes background time and disables remote media requests for reproducible visual comparison. It does not substitute an audio recording or claim that the baseline black hole is the new optical renderer.

Browser tests use emulated viewport sizes. They do not establish real-device GPU performance or remote provider availability.

Verification on 2026-10-05:

- `npm run proxy:check`: passed, with zero Astro diagnostics and passing ESLint/Prettier checks.
- Unit suite: 32 tests passed. Storybook browser suite: 41 tests passed.
- Production Astro build and standalone Storybook build: passed.
- All-card geometry at 17 dimensions and keyboard/scoped scrolling: passed in Chromium, Firefox and WebKit.
- Selected-track ribbon motion audit: passed in Chromium for both themes, both directions, eight cards and phone/desktop sizes.
- Chromium scene navigation races, in-flight resize, native fixture audio, reduced motion and graphics failure: passed. The four existing production scene browser tests also passed after the shared shader changes.
- The 1280 × 800 browser recording decodes successfully: 247 frames at 25 fps, 9.88 seconds.

One WebKit matrix attempt was interrupted by the development server reloading when a concurrent test wrote its HTML report. The isolated rerun passed. Use `--reporter=line` and separate artifact destinations when checking against the live development server, or use the built Storybook server to avoid report-triggered reloads. No application fix was inferred from that runner interruption.
