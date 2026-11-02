# Continuous scene formation

> Current direction: [F7 spreading glitch and late fracture](proxy-glitch-transition.md).
> The user rejected radiation strands. Strand-based reverse transitions below
> are historical comparisons. The latest forward and cube-arrival candidates are
> [L2 and A/B/C accretion studies](proxy-accretion-studies.md).

## Brief and scope

The selected Orbit scene now gathers the original blue cube cloud into the golden horizon, with an individual arrival for each scene. This implements the requested continuous transformation inside the existing exploration; it does not replace the production homepage, publish the branch, or change music sources.

Preserve the accepted horizon at rest: the fixed black boundary, thin inner edge, gently raised outer emitting mantle, colored halation, continuous disk junction, depth-dependent strand spacing, travelling surface waves and procedural nebulae. The optical and baseline comparison studies retain their earlier transition.

## Preserved comparison: F3 material rupture

Superseded for the selected reverse transition by [F7 spreading glitch and late fracture](proxy-glitch-transition.md). F3 remains a separate comparison. The forward collapse and arrivals documented here are retained.

The subsequent feedback requests inward force and a separate stellar-release impression. The first F2 implementation was rejected because added bright debris dominated while the original rim and disk stayed recognizable underneath. F3 addresses the source material directly: a shared forward/inverse transport map strains, twists and expands the actual emitting contour and disk; curved cracks separate material groups; surviving groups move outward and disappear at different times. The black void opens instead of growing into a larger intact mask. Ejecta begin at positions obtained from the same transported ribbon map.

`rupture-material` removes both the transient pulse plane and added cube particles. The original rim and disk must visibly move and break in this view. This is the key diagnostic, alongside the complete scene. F3 is procedural material-coordinate transport in the existing 2.5D artistic renderer, not rigid-body or fluid simulation.

F3 uses a 6.4-second collapse and a 4.8-second rupture. The selected F7 reverse lasts 6.4 seconds. F1's 7.2-second reversible path and both arrivals remain available as comparisons. See `proxy-collapse-motion-language.md` for atomic descriptions, sources and reusable prompts. The construction and timing table below document F1; they do not override the new asymmetric default.

## F1 construction

`ribbonGeometry.glsl` holds the existing nested ribbon map, wave displacement and radial strand phase. Both shaders import the same source. A forward parameterization solves the contour's vertical opening, then restores wave displacement; the existing fragment shader uses its inverse material coordinates. This is the selected artistic surface, not a new physical black-hole simulation.

Each cube has a stable target on this surface. Most target the upper inner contour; the remainder target foreground strand crests. The camera-plane conversion uses the projected horizon center and its actual view depth, so arrival points follow the same geometry after aspect-ratio, camera and inclination changes. Targets do not change randomly during a transition.

The cube cloud approaches along shallow curved paths, retains depth initially, then flattens into small tangential warm shards. Emission develops along the same material coordinates while those shards disappear. The inner contour keeps its final size; there is no separate miniature black hole scaling up beneath the cloud. The background atmosphere recedes as the nebula emerges. The shared frame loop, Motion values, R3F lifecycle and existing postprocessing remain responsible for rendering; no separate animation engine or acceleration system was added.

Adaptive DPR remains enabled. The selected cube geometry keeps its particle count during adaptation, preventing a quality change from replacing particle identities mid-flight. The original production cube scene retains its previous quality behavior.

## Timing recipe

The master timeline is linear; local smoothstep curves provide acceleration, deceleration and stagger. Seed: `82371`. Still captures use scene time `12`; live playback advances the actual ambient clock.

| Sequence | Duration | Visible development |
| --- | --- | --- |
| Blue arrival | 3.2 s | Small, distant blocks descend and grow in staggered depth groups; the blue atmosphere fills behind them. |
| Horizon arrival | 4.6 s | Two shoulder regions trace upward into the rim; continuous foreground material extends outward toward the viewer; the nebula follows. |
| Cubes to horizon | 7.2 s | Gather, land along the contour, warm and flatten into shards, merge into the emitting rim and foreground. |
| Horizon to cubes | 7.2 s | Traverse the same scalar progress backward; strands release shards and the cube cloud spreads back into depth. |

The forward transition's approximate sections are 0–2.2 s for gathering, 2.2–4.5 s for contour alignment and warming, 4.5–6.5 s for material fusion, and the remaining interval for settling. Ambient motion continues throughout; reverse playback restores the same geometric path, not a rewind of the song or ambient time.

The arrival begins once graphics resources are ready. It is an artistic introduction, not a fabricated download percentage. The wheel appears after entry; sound entry still requires actual audio readiness and a browser gesture, with quiet entry available when audio fails. The selected loading screen uses the full scene instead of the previous decorative loading mark. Its prompt appears near the bottom once formation finishes. Reduced motion skips spatial travel. Graphics failure retains the poster and entry/navigation controls.

A scene transition remains atomic: repeated scene requests while it is active cannot skip the fixed sequence. The dedicated motion study supports pause, scrubbing and direction reversal mid-flight for inspection. Unmount stops its animation and disposes its canvas resources.

## Review entry points

The previous forward collapse and arrival animations are archived together at
`http://127.0.0.1:6008/forward-arrivals/`, with artifacts outside Git at
`/tmp/proxy-forward-arrivals/final/`. The clips sample the unchanged implementation
at revision `a42c051`: collapse 6.4 seconds, cube arrival 3.2 seconds, horizon
arrival 4.6 seconds. The 20-fps WebGL exports use fixed ambient time and short
endpoint holds. Live controls use the current renderer and may differ from these
archived clips. This showcase
does not revise the accepted F7 reverse transition or imply real-device frame rates.

The selected Orbit stories use this choreography automatically:

- `explorations-orbit-study--selected-cubes`
- `explorations-orbit-study--selected-horizon`

The new `Explorations/Scene formation` stories isolate the actual renderer:

- `collapse-and-rupture`: the preserved F3 independent inward and outward sequences.
- `rupture-material`: original source material only, with added particles and the impulse plane removed.
- `gather-and-form`: forward/reverse playback, pause and timeline scrubbing.
- `cube-arrival` and `horizon-arrival`: replay and inspect each arrival.
- `playback-controls`: interaction and cleanup verification.

Append `capture=1` for fixed ambient time while retaining manual progress control; leave it absent to inspect native runtime. These diagnostic controls belong to Storybook, not the homepage.

Local review artifacts are outside the repository at `/tmp/proxy-scene-formation/final/`, served at `http://127.0.0.1:6008/scene-formation/`. The gallery contains real browser recordings, intermediate stills, responsive captures, a recipe and links to the live studies. The recordings are silent motion reviews, not evidence of external music playback.

## Verification

The new browser suite checks that an F1 intermediate image differs from every simple crossfade of the endpoint images, that its reverse scrubbing reproduces the same geometry, that the developing horizon retains its final edge position, and that the foreground continues forming. It also covers distinct cube arrival stages, native playback/pause/reversal, unmount/remount, in-flight resize, repeated scene input, resource counts, both arrival prompts across the 13-size viewport matrix, context failure and reduced motion. F3 checks independent directional energy, matching resting endpoints, and actual rim displacement in the material-only diagnostic. A brightness-only negative control cannot satisfy that spatial displacement assertion.

Executed checks for the current material-transport revision:

- `proxy:check`: 87 files, no Astro diagnostics; ESLint and formatting passed.
- `proxy:build` and `proxy:storybook:build`: passed. The production build retains its existing large-chunk advisory.
- Unit tests: 37 passed across 5 files.
- Formation and Orbit Storybook tests: 24 passed across 2 files, including accessibility checks.
- Formation browser tests: 30 passed, 10 each in Chromium, Firefox and WebKit.
- Existing horizon atmosphere, continuity and perspective-wave regressions: 4 passed in Chromium.
- Viewport matrix: 320×568, 390×844, 430×932, 390×400, 844×390, 719×600, 720×600, 721×600, 768×1024, 1024×768, 1280×400, 1440×900 and 1920×1080. The live transition also resizes between desktop, short phone and portrait tablet.

Logs are under `/tmp/proxy-scene-formation/`: `final-check.log`, `final-build.log`, `material-build.log`, `final-unit.log`, `final-stories.log`, `material-e2e.log` and `steady-regression.log`. F3 captures and native recordings are under `final/f3/`; the gallery retains F1 at `continuity.html`. Software-rendered browser emulation does not establish real-device GPU performance. Visual pacing, fracture character and the amount of luminous debris remain pending user feedback.
