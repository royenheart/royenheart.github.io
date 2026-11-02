# Selected B and continuous scene handoffs

## Decision and inspection

The user selected live B (orbital capture), then requested inspection of arrival,
normal animation, forward formation and reverse recovery as one continuous flow.
`OrbitCanvas` now defaults to `orbit`; A/C remain explicit comparison stories.
The production homepage is not replaced by this exploration.

The horizon flow entry already points to `SelectedHorizon`, with the selected
continuous ribbon, waves, colored mantle and nebula. It deliberately preserves
the accepted final composition. It is not a new background design. The legacy
static asset is still used if graphics fail; the external review wrapper now
reports WebGL/fallback state and the advancing material clock, rather than
silently treating a still image as evidence of animated rendering.

## Handoffs

| Junction | Behavior |
| --- | --- |
| Falling arrival to running cubes | Arrival offsets are applied to the already moving cube field. They settle to zero without swapping meshes or resetting time. |
| Entry prompt to wheel | The entry veil fades out over 0.6 seconds while the wheel enters. The renderer keeps moving while a user gesture is awaited. Reduced motion removes the fade. |
| Running cubes to B | Preserve the initial cube lighting coordinates, including each vertex's local position. The camera uses a quintic smootherstep with zero endpoint velocity and acceleration. Material deposition retains its own linear clock. |
| B to running horizon | The same ribbon coordinates and advancing material time remain active at full formation. No Canvas remount or replacement background. |
| Running horizon to F7 to cubes | The accepted spreading glitch and late mirror fracture continue to recover the existing moving cube field. Camera endpoints settle smoothly. No radiation geometry is introduced. |

The arrival's last fraction is a settling interval with ongoing ambient movement,
not an inserted frozen frame. Actual rendering can still slow on a constrained
GPU; the existing capped ambient step and adaptive pixel ratio remain in place.

## Sound

Previously navigation paused the source immediately and only created the next
audio element after the transition. Both sources now resolve and preload at
mount, without starting playback. The first sound gesture resumes both Web Audio
contexts; the spare deck remains paused until a requested transition.

Manual navigation keeps the current song and starts the prepared destination at
zero gain. Equal-power gains hand sound over during the latter part of the visual
transition. After natural song completion, the destination fades in earlier.
The old deck pauses and rewinds after the scene handoff. Quiet entry and an
explicit pause suppress both decks. Source ownership and playback intent protect
late play promises and unmount cleanup.

An unavailable destination cannot hold up visual navigation. The source remains
audible through the transition, then the destination exposes its existing sound
fallback. Browser autoplay rejection still requires a user gesture. External
platform availability and cross-origin analysis are not established by local
synthetic tone tests.

The historical [selected soundtrack audit](proxy-audio-playback-audit.md)
found that CORS analysis blocked the configured outer URLs. The later
[external soundtrack update](proxy-external-soundtrack.md) switches cubes to
Clair de Lune and plays both NetEase links as ordinary native media, with an
ambient ring when samples are inaccessible. Readable sources retain real analysis.

## Review

`Explorations/Continuous journey/Selected B` drives one Canvas through 28 seconds:

- 0–4.8: falling arrival.
- 4.8–8: running cubes.
- 8–14.4: selected B.
- 14.4–18: running horizon.
- 18–24.4: F7 reverse.
- 24.4–28: running cubes again.

The review clock is `12 + timeline seconds`, including running sections. Seeking
is deterministic; pausing this review pauses all material time. It is separate
from the ordinary interactive runtime, whose ambient clock advances automatically.

The LAN gallery is `http://192.0.2.10:6008/journey/`. Frame exports, video,
viewport evidence and the status wrapper live under `/tmp/proxy-continuity/`;
none of those generated artifacts are committed. The gallery links the original
track scene separately from an explicitly labelled synthetic sound check.

## Verification scope

Boundary image tests compare 10 milliseconds before and after all five visual
junctions, retaining the same Canvas and clock. Native runtime tests exercise
real synthetic audio, prepared-deck crossfade, unavailable destination, quiet
reverse, resizing and resource identity. Existing stories cover delayed sound,
context loss, repeated navigation and reduced motion. These checks establish
tested behavior in browser emulation, not aesthetic acceptance or real-device
frame rates.

### Executed checks

- Astro check: 103 files, no diagnostics; ESLint and Prettier passed.
- Production and standalone Storybook builds passed.
- Unit tests: 46 passed across 7 files.
- Formation, Orbit and Journey stories: 45 passed, including accessibility.
- New continuity checks: 9 passed across Chromium, Firefox and WebKit.
- Existing behavior checks: 6 passed in Chromium, covering natural audio
  completion, quiet playback, reduced motion, context loss, the two-scene
  13-viewport entry matrix, repeated navigation and in-flight resize.
- Across the three browsers, mean absolute RGB changes at the five boundary
  samples were 0.426–1.419 on a 0–255 channel scale, below the test limit of 2.
  This supports temporal continuity; it does not replace visual review.
- Sixteen captured states cover 390x400, 844x390, 768x1024 and 1440x900 at
  arrival, B transport, running horizon and F7 distortion. Canvas sizing,
  control containment and document overflow checks passed.
- The continuous H.264 export contains 561 actual WebGL frames at 20 fps
  (28.05 seconds including the final sampled frame). Sampled frames decode
  successfully throughout the clip. No audio is included in this visual export.
- The LAN gallery passed video seek/playback, full native journey playback,
  current WebGL horizon inspection and mobile overflow checks. The live horizon
  advanced from material time 13.994 to 14.994 with 20 additional rendered frames;
  no page errors were recorded. This is motion evidence, not a frame-rate claim.

Manual crossfade tests loop the short synthetic fixture tones to avoid racing
their natural end on a software renderer. The separate completion regression
uses the original 12-second non-looping fixture. Browser runs and frame export
are serialized to avoid competing software WebGL contexts. Initial harness
failures came from noncanonical range-input strings and hovering the artwork's
center under its playback overlay; the harness now uses canonical numbers and
the artwork edge. No visual assertion was relaxed to pass these checks.
