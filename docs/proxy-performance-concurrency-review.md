# Proxy performance and concurrency review

Date: 2026-11-01. Tree: `95f60df` plus the working-tree changes that made
`/` the selected continuous presentation. This record covers the review
and the fixes that followed it; it does not replace the earlier
[standalone preview audit](./proxy-preview-performance.md), whose hardware
figures were measured against an older tree.

## Scope and method

The selected `/` journey was inspected from the static artifact:

- Astro entry, content validation, React islands, Motion, Web Audio, R3F/Three.js,
  postprocessing, optical tables, cards, and the two scene transitions.
- Two independent Codex CLI audits (`gpt-6-astra`, 1M context) looked for
  performance, lifecycle, race, and concurrency defects. Their findings were
  checked against the source and then tested in Chromium; several initial
  hypotheses were dropped when the experiment disagreed.
- Baseline and candidate artifacts were served by the same small gzip static
  server. Runs used a fresh browser context and the same fixture audio and
  artwork routes. Startup values below are the last clean pair after the fixes;
  the environment was otherwise idle.

The first browser pass used Google Chrome 156 headless on SwiftShader. After
widening the device namespace, the startup and steady-state checks were repeated
with the same Chrome binary, `--use-gl=angle --use-angle=vulkan` and the host's
NVIDIA GPU. The renderer reported `ANGLE (NVIDIA, Vulkan 1.4.351 (NVIDIA NVIDIA
GeForce RTX 2060)), NVIDIA)`. Frame cadence is a submitted-frame measurement,
not GPU completion time: this pass did not use `EXT_disjoint_timer_query`, and
it does not establish mobile thermal or battery behavior.

Reproduction artifacts are outside Git in
`proxy/test-results/perf-audit/`. The source-level probes are
`lab/startup.mjs`, `lab/matrix.mjs`, `lab/check-fixes.mjs`,
`lab/check-transitions.mjs`, and `lab/story-check.mjs`.

## Startup comparison

The cube-first visit used to wait for the horizon's 2.16 MB optical tables and
its reverse-transition material before the first cube frame was announced. The
candidate announces the cube scene after its first submitted frame, starts the
authored arrival, and defers horizon preparation until that arrival completes.
Navigation to the horizon remains gated until preparation finishes.

| Observation (1440 × 900)                      |             Before |       After |
| --------------------------------------------- | -----------------: | ----------: |
| Canvas ready (`data-renderer="webgl"`)        |             6.24 s |      1.20 s |
| Arrival complete (`data-intro-done="true"`)   |            11.20 s |      6.15 s |
| Horizon prepared / horizon navigation enabled | 11.20 s (implicit) |      8.75 s |
| Initial JavaScript transferred (gzip)         |          467,625 B |   466,173 B |
| Optical tables transferred                    |        2,163,134 B | 2,163,134 B |

The gain is dependency ordering, not a smaller scene. The optical download and
shader preparation still happen; they no longer hold the cube arrival behind
them. The candidate arrival had no multi-second long task: the largest was
102 ms, versus 117 ms before, and preparation work moved after the arrival
(`max 1.69 s` while the dock was already visible). Repeated runs varied between
roughly 6.2–6.6 s for arrival completion and 8.7–9.9 s for preparation. The earlier attempt that
announced readiness early **without** deferring preparation moved a 2.4 s task
into the arrival and was rejected.

The initial-JS reduction is small. The old 155 KB `EventHorizon` chunk name was
misleading: it also carried shared `CubeCloud`/scene code, so lazy-loading the
baseline horizon saves only about 1.5–2 KB on the selected route. It is kept as
isolation for the historical baseline, not advertised as a major transfer win.
The baseline story still renders after the lazy split (6 draw calls, prepared
state true, non-blank canvas).

Both soundtrack elements still request their sources on mount. With the fixture
that was 289,751 B per deck (579,502 B for the pair, before images), and the
real provider may be larger. The requests are prepared early to keep the
crossfade seamless; deferring the spare deck is a remaining tradeoff rather than
an unconditional win.

### Hardware GPU rerun

The RTX 2060 run used the same baseline and candidate artifacts. Both reached
60 Hz with quality 1 and DPR 1 at 1440 × 900.

| Observation (hardware, 1440 × 900)    |                Before |                   After |
| ------------------------------------- | --------------------: | ----------------------: |
| Canvas ready                          |                3.07 s |                  0.63 s |
| Arrival complete                      |                7.95 s |                  5.52 s |
| Horizon prepared / navigation enabled |     7.95 s (implicit) |                  5.76 s |
| Cubes steady cadence                  | 60.0 fps, p95 16.7 ms |   60.0 fps, p95 16.7 ms |
| Cubes draw calls / DPR / quality      |             3 / 1 / 1 |               3 / 1 / 1 |
| Horizon steady cadence                |  (not sampled before) | 60.1 fps, 11 draw calls |

The startup improvement is therefore not a SwiftShader artifact: the ordering
gain survives on real GPU rasterization. The post-arrival preparation task is
shorter on this GPU (the prepared state follows the arrival by about 0.24 s in
this run), but it was not instrumented with GPU timestamps.

## Audio and DOM work at rest

Poster mode isolates the DOM/audio cost from WebGL. `timeupdate` drives React
state in `OrbitStudy`, and the audio ring writes SVG attributes from Motion's
frame loop.

| Poster condition                       | React commits/s | SVG attribute writes/s | Script time/s |
| -------------------------------------- | --------------: | ---------------------: | ------------: |
| Playing, normal motion                 |             3.8 |                 ~1,320 |      25–29 ms |
| Playing, reduced motion (ring at rest) |             3.8 |                     28 |      19–20 ms |
| Paused                                 |               0 |                     28 |        4–5 ms |

Thus the progress-driven parent re-render plus audio events cost roughly
14 ms/s, and the animated ring adds roughly 8 ms/s in this environment. The
ring is not the dominant cost, but it is avoidable work on a page that also
renders a full-screen scene. Node caching now removes repeated
`querySelectorAll` calls, and unchanged response attributes are not rewritten;
the per-frame attribute writes remain by design.

The selected WebGL run submitted ~36.6 frames/s at quality 0.45 (configured
buffer 648 × 405) and used 30–31 ms/s of script while playing versus 15–16 ms/s
while paused. These numbers are SwiftShader observation, not GPU headroom.

A second, larger opportunity remains: the whole `OrbitStudy` subtree is
re-evaluated at `timeupdate` cadence. Moving the time subscription into the
progress element and memoizing the decorative card surfaces would remove work
without changing visual state. It was not implemented in this pass because the
card array and callbacks are shared with the continuous presentation and the
change needs its own crossfade/accessibility verification.

## Defects fixed

### Cube entry coupled to horizon preparation

`OrbitCanvas` announced readiness only after the relativistic horizon reported
optical and reverse-material readiness. The candidate:

- reports the initial cube frame before optics are ready;
- reports preparation separately (`onPrepared`) and exposes it as
  `data-prepared`;
- defers `RelativisticHorizon` optical loading until the cube arrival completes;
- disables previous/next scene controls until the destination is prepared;
- starts a bounded preparation fallback after the arrival, and treats poster or
  failed-graphics navigation as already prepared.

The poster and context-failure paths were verified explicitly: both can still
navigate to the horizon while the canvas is absent. The `sceneReady` controls
carry an accessible description while disabled.

### Buffering removed the pause action

`waiting` sets the media state to not playing while the element is still not
paused. The transport previously chose Play in that window, so clicking it
called `play()` again and could not cancel the pending playback. The control now
uses the requested playback intent (`wanted`) rather than the audible state.
The buffering regression test dispatches `waiting`, asserts the control remains
Pause, then asserts both media elements are actually paused and their current
time does not advance.

The same pass fixed two intent-ownership races found by the second audit:

- A superseded `play()` request resolving after a scene handoff no longer clears
  the new scene's intent.
- The gesture-started deck is not started a second time by the reconciliation
  effect, which previously superseded its own request and looked like failure.
- Pending playback is deduplicated per media element, so an unrelated spare-track
  readiness change cannot increment the request generation and cancel the
  active gesture's own attempt. A track-id replacement also invalidates older
  requests before their completion can clear the replacement's intent.
- A rejected destination track now removes the false Pause affordance so one
  activation retries playback.

### Focus and Escape during a transition

The dock becomes inert during a scene change, which can move focus to `body`.
The previous `main` key handler never saw Escape in that state. Escape is now
handled at the document level (unless a card already handled it), and focus is
deferred to the artwork if the artwork control is still inert. Outside pointer,
key, or focus movement cancels the automatic return to the deck. Verified:
focus moved to a heading during a transition stays on the heading; Escape from
`body` during a transition ends on `.orbit-disc`; normal transitions still
return focus to `.rotary-deck`.

### Portal and reduced-motion lifecycle

- The Elsewhere portal observes the dock's `inert` boundary as well as the deck,
  so an automatic scene transition dismisses the raised card instead of leaving
  it interactive outside the inert dock.
- If reduced motion is enabled during a scene transition, the imperative Motion
  animation is stopped, the blend is settled at the target, and the lock and
  dock inertness are released. Verified at 700 ms into a transition.

## Remaining opportunities

1. **Localize audio progress.** Split the `timeupdate` state into a leaf
   progress subscription and memoize stable card artwork. Expected saving is the
   measured ~14 ms/s of React/audio work, with a larger effect on slower phones.
2. **Prepare one audio deck first.** Start the active track immediately and warm
   the spare only after playback intent or the first arrival. Preserve the
   source-audible fallback if the destination is late. This trades up to one
   track's initial transfer for a possible crossfade underrun.
3. **Optical delivery.** The 2.16 MB tables are deferred until after the cube
   arrival but are not content-addressed for immutable caching; `/optics/` is
   revalidated by the example server. A content-hashed filename or a retained
   shared optics directory would allow long-lived caching. A `<link rel=preload>`
   was deliberately not added: it would compete with the cube entry that this
   pass just unblocked.
4. **Adaptive quality recovery.** Quality only falls, to a 0.45 floor, and lives
   on the persistent canvas. A heavy horizon phase can leave the later cube
   scene at reduced DPR despite different pixel demand. Test hysteretic recovery
   before changing it; avoid per-transition resets.
5. **Destination completion during a transition.** If the incoming track ends
   before the visual handoff commits, its `ended` event is ignored and the
   commit can restart it from zero. This needs a deferred-completion state
   machine; it is rare with the current full-length tracks and was not changed.
6. **Preparation affects the visible dock.** Preparation now finishes after the
   arrival, while the cards are interactive. The largest observed task was
   1.69 s. A preparation status is announced, but a future pass should test
   idle-time scheduling or a destination-specific fallback rather than turning
   the whole page into a poster on timeout.

## Verification executed

- `npm test`: 65 unit tests passed (type check, lint, formatting and content
  contracts included).
- `npm run proxy:build`: passed.
- `npm run proxy:storybook:build`: passed.
- Chromium preview suite: 3/3 passed, including the new poster-navigation and
  buffering-pause regressions.
- Chromium Orbit perf test: passed (pixel budget, invisible-draw skipping,
  visibility suspension, resource lifetime).
- Chromium scene-continuity suite: 3/3 passed (five fixed-time junctions, live
  B/F7 crossfade, missing destination track). A combined final run of the
  preview + continuity suites passed 6/6.
- Storybook `HorizonBaseline` lazy branch: rendered with prepared state true and
  no console/page errors.
- Manual probes: poster navigation, optical-failure navigation, delayed-optics
  gating, buffering pause, focus/Escape, Elsewhere portal dismissal, reduced
  motion mid-transition.

The bundled headless Chromium shell could not start reliably in this host
(V8 snapshot/GPU-process failure), so the browser checks used the installed
Chrome 156 binary with the same test sources. The continuity run additionally
allowed autoplay to isolate the audio state machine; the project's default
Chromium environment remains the CI reference.

## External and mobile directions

WAN-emulated results, the real NetEase transfer, the deployment publisher
blocker and the module-level optimization backlog are recorded in
[external and mobile performance directions](./proxy-external-performance.md).
