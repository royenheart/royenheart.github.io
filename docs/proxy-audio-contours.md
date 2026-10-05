# Quiet deck and layered audio contours

Status: implemented for visual review on `refactor/proxy-modernization`.
No push, PR, deployment or production homepage replacement is included.

## Reference interpretation

The user supplied a sketch of overlapping rounded outlines and confirmed that
the effect belongs around the lower-right song artwork in the horizon scene.
It does not change the large central black-hole boundary.

The actual sketch was thresholded below 90 in grayscale, excluding its title
above row 85. Its largest connected stroke group spans `(88, 91, 663, 549)` in
the 765 by 657 source. Intersections connect the strokes, so this measurement
does not establish an exact number of independent loops. An SVG overlay on the
unaltered source marks a shared envelope, crossing layers, and broad deformation.
It was rendered and displayed before implementation. All image artifacts stay
outside Git under `/tmp/proxy-audio-contours`.

Useful descriptive terminology is **layered organic radial audio visualizer**
or **audio-reactive contour rings**. These are combinations of effect descriptors,
not one uniquely standardized name. A radial waveform would map time-domain
samples directly around a circle; a radial spectrum would map frequency energy.
This implementation instead uses measured audio energy to deform a small set of
smooth contours. The static sketch alone does not establish speed, sound
mapping, trail persistence, or color. The gold/copper/pearl palette and restrained
cool accent are inherited from the accepted scene.

Primary references:

- [Web Audio AnalyserNode](https://www.w3.org/TR/webaudio-1.0/#AnalyserNode)
  distinguishes time-domain samples and frequency-domain analysis.
- [p5 FFT reference](https://p5js.org/reference/p5.sound/p5.FFT/)
  separately exposes waveform samples and a frequency spectrum. It is a
  terminology reference; no p5 dependency or source code was added.

## Interface changes

- Remove the wheel caption and the selected rotary deck's visible counter/close
  row. Retain a screen-reader position announcement and navigation instructions.
  Cover toggle and Escape still close the deck; wheel, touch and keyboard inputs
  still browse it. The separate classic comparison retains its original buttons.
- Identity contains the existing local avatar and name. Treat the avatar/name row
  as one contour-aware block, then flow the name beside the avatar. Other cards
  retain their individual contour-derived text insets.
- Order: identity, current scene, current song, song-source links, Blog/GitHub,
  adjacent-scene navigation. Source cards vary by scene, while the final card
  consistently owns previous/next scene navigation.
- Place registration links 8 CSS pixels from the left and 4 from the bottom,
  respecting safe-area insets. Preserve their authored labels and URLs.

## Audio construction

The existing media-element source and AnalyserNode remain the only audio graph.
The horizon wheel samples its byte waveform and frequency magnitudes. RMS
waveform energy gates deformation; coarse frequency groups shape its broad and
fine lobes. These groups are visual controls, not an instrument separator or
calibrated bass/mid/treble meter. A playing silent source remains still.

Four periodic angular contours use spatial harmonics 2, 3 and 5 with different
phase offsets. Closed cubic interpolation joins the 64 samples without an open
seam. Smooth saturation keeps radii in the 83–99 range inside the existing
200-unit view box; the cover occupies radius 80. The layers cross while keeping
the cover legible. After inspecting the initial capture, this soft saturation
replaced a tighter clamped displacement to make the overlapping motion clearer.
Measured amplitude uses an approximately 85 ms attack and 300 ms release;
silence and pause settle to a stable ring, while reduced motion rests immediately.
The existing Motion frame callback owns scheduling, with DOM updates limited to
25 Hz; paused updates stop once rest is reached. Per-frame values stay in refs.

The cube scene retains its bar response and wheel trim. The horizon replaces
those decorative bars/trim with the contour paths. No scene shader, black-hole
geometry, nebular field, foreground spacing or wave behavior changes.

## Review and evidence

The local review includes both full scenes, phone/tablet/short captures, the
new card sequence, and a magnified recording of the actual responding component.
The response recording uses an original synthesized pulsed PCM fixture,
explicitly labeled as a fixture rather than the artist's recording. A real silent
PCM fixture verifies the difference between playing state and audible energy.

The new browser checks cover content order, removed chrome, avatar/name content,
lower-left footer placement, real audio response, crossing closed curves, bounds,
pause settling, silent playback, and reduced-motion changes during playback.
Existing matrix/race tests cover every card, resize, interrupted transitions,
scoped wheel input, touch, keyboard navigation and the contour oracle's deliberate
negative control. The oracle now checks the profile row as a shape-aware block
and separately checks avatar/name collision and clipping.

## Verification record

- `proxy:check`: 83 files with zero Astro errors, warnings or hints; ESLint and
  Prettier passed. Production and Storybook builds passed after the final gain
  refinement.
- The deck/control regression run passed 42 cases across Chromium, Firefox and
  WebKit. Every card was checked at 17 viewport sizes for each retained rotary
  design, including portrait, landscape, short/tall screens and breakpoint edges.
  It includes deliberate contour-oracle failure, interrupted motion/resize,
  focus restoration and touch cancellation.
- After the final soft-saturation adjustment, all nine focused order/audio/rest
  cases passed again across the three browsers. Measured SVG paths must cross
  by exchanging inner/outer ordering at matched angles, remain inside the wheel,
  and change under actual audio analysis. Silent playback and reduced motion
  remain stationary; pause settles to the exact initial paths.
- The two relevant Storybook suites passed 27 story/accessibility cases. Their
  content-order expectations were updated to the new sequence. This run preceded
  the final contour-gain adjustment covered by the nine repeated browser cases.
- The retained classic study passed all five Chromium cases after the final
  adjustment: its card matrix, scoped input/focus, interrupted scene changes,
  audio-driven completion, and reduced-motion/graphics-failure behavior.

Logs use `/tmp/proxy-contours-{browser-final,audio-final,stories-final,legacy,
check-final,build-final,build-storybook-final}.log`. WebKit uses the established
local compatibility setup with command-local host validation skipped; actual
pages rendered. These emulated viewports do not establish physical-device GPU
or artist-source availability.

Actual captures live outside Git in `/tmp/proxy-audio-contours/final`. The local
review is served at `http://127.0.0.1:6008/audio-contours/`. It contains eight full
scene captures, additional card close views, the annotated actual sketch, a
normal-runtime response recording, and its enlarged crop. The pulsed PCM fixture
loops only in the external capture harness to keep automatic song-end navigation
out of the focused recording; normal completion is covered separately above.

The final full recording decodes to 461 frames at 25 fps. Its focused crop
contains 347 frames (13.88 seconds), including active response and the paused
settling interval. The active, resting, desktop, phone and tablet captures were
visually inspected. At review widths 1280 and 390, all nine displayed images
loaded, all eight card-selector options worked, the comparison switched, and
the cropped video played without JavaScript errors or horizontal overflow.
Recipes and video/page validation metadata accompany the external artifacts.
