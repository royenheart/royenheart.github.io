# From force metaphors to executable motion

## Confirmed intent

The user wants a sense of collapse when blue cubes become the horizon, and rupture with a stellar-explosion impression in the opposite direction. The two directions must therefore have independent energy profiles. The earlier continuous gathering remains candidate F1 for comparison. Candidate F2 established separate timings, but its added ejecta did not sufficiently transform the source. The user rejected that overlay-like result. F3 is the current implementation: the actual rim and disk deform, expand, separate and disappear; ejecta originate from that transported material. Visual acceptance remains pending.

This is cinematic art direction. The black-hole rupture is a visual metaphor, not a claim that a black hole physically fractures like a solid shell. Existing steady-state composition, colors, foreground waves, luminous mantle and interface placement remain fixed.

## Professional vocabulary and evidence

- **Centripetal implosion / gravitational capture:** a converging flow, accelerating inward transport and increasing local density. In a fluid solver, negative divergence produces a converging field; this renderer uses a deterministic kinematic approximation, not a fluid solver. [SideFX: Understanding how pyro works](https://www.sidefx.com/docs/houdini/pyro/background.html).
- **Anticipation / compression / squash and stretch:** preparation followed by directional deformation makes force, weight and material legible. The deformation must follow travel, rather than stretch unrelated axes. [Pixar in a Box: Squash and stretch](https://www.khanacademy.org/computing/pixar/animate/ball/v/animate-4).
- **Pressure buildup / rupture / shock breakout:** a short preparation followed by a localized flash and an expanding shock front. NASA uses shock breakout for the bright flash when a supernova shock reaches the stellar surface; its use here is a visual analogy. [NASA: Watching Supernova Shock Breakouts in 3D](https://www.nas.nasa.gov/SC23/research/project45.html).
- **Ejecta / ballistic trails / drag:** departing material has multiple velocities, directions and stopping times. A leading wave and slower material trails establish layered release. SideFX separates the explosion source, expansion, trails and ballistic path controls. [SideFX: Creating explosions](https://www.sidefx.com/docs/houdini/pyro/explode.html).

Scientific descriptions inform the visual ordering, not literal simulated times, temperatures or relativistic dynamics. A full core-collapse supernova is more complex than a simple mechanical bounce; F3 does not present its procedural movement as an astrophysical solution.

## Atomic description template

Describe one mechanism with:

`object + trigger + spatial origin/target + direction/path + speed profile + deformation/material + timing/phase relation + observable acceptance + invariant`.

Replace mood words with independently adjustable mechanisms. For example, "make it powerful" is insufficient; "accelerate the same cube population toward the capture shell, align short luminous tails with velocity, concentrate brightness during capture, and let that peak decay into the existing rim" identifies things that can be rendered and compared.

| Axis | Collapse | Rupture and stellar release | Observable check |
| --- | --- | --- | --- |
| Cause and direction | Converging flow toward the center and capture shell | Outward strain of the existing rim and disk, followed by detachment | At least several consecutive frames establish the direction before brightness peaks. |
| Timing | Quiet anticipation, accelerating intake, brief capture peak, settling | Short pressure rise, fast breakout, longer deceleration and cooling | The reverse is not the same motion played backward. |
| Spatial coherence | Target azimuth follows each cube's approach direction, with limited curl | Rim and foreground groups move outward; fragments inherit their transported source positions | Avoid random cross-screen routes that resemble confetti. |
| Acceleration | A convex progress curve increases speed late in the intake | Rapid launch followed by exponential drag | Compare displacement per frame, not only total duration. |
| Mass and density | The occupied cloud contracts; material becomes concentrated near capture | Occupied area expands quickly, then disperses | Preserve depth and unequal onset instead of moving every cube as one rigid group. |
| Shape | Directional stretch with reduced transverse thickness | Short bright heads and tapered, soft trails; cubes regain volume while cooling | Avoid long uniformly opaque rods. |
| Material | Cyan/blue facets warm through amber to pearl highlights | Pearl-gold breakout, copper-gold ejecta, cooling toward the cube palette | Gold remains related to the existing horizon; avoid a full-screen white wash. |
| Emission | Local concentration peaks during capture, then merges into the rim | An uneven expanding shock shell leads smaller glowing debris | Distinguish the wave, material, and residual glow in time and scale. |
| Secondary motion | Slight uneven curvature and stagger support the main inward pull | Unequal angular sectors release at different times; trails dissipate | Detail must not obscure the dominant direction. |
| Camera and interface | Fixed overall framing, no repeated camera shake | Same framing; energy comes from matter and light | Wheel, cards and registration layout remain stable. |
| Rest and accessibility | Settle exactly onto the established horizon | Settle exactly onto the original cube cloud | Endpoint pixel comparisons, reduced-motion skip and graphics fallback. |

## F3 parameters and construction

- Forward: **6.4 seconds**. Staggered intake uses a convex `t^2.9` profile. Cubes outside the capture region approach the matching contour; inner cubes move toward the core. Directional strain peaks during the fast intake. A restrained inward compression front meets the capture region, and the existing emitting material forms after capture begins.
- Reverse: **4.8 seconds**. The source ribbon coordinates first compress, then expand and twist with unequal angular strain; the actual foreground strands therefore change position and spacing. Curved angular/radial fractures open in material coordinates and remove groups with different lifetimes. The original void clears without expanding its black mask. Ejecta originate from the same forward transport map at their release time. Approximately the first fifth builds pressure; the next short interval releases a localized breakout and uneven outward shell. Emitting contour sectors disappear with unequal timing. Ejecta detach from the transported rim and foreground, rather than spawning as an unrelated core overlay. Drag and shape recovery settle the same cube population back into its scene.
- These are artistic initial values, not inferred physical measurements. Timing, trail strength, shock brightness and launch spread are separate controls in the shader recipe.
- Both directions use the existing Three.js canvas and postprocessing. A transient additive material field supplies the compression front or shock shell. It is hidden at rest. No additional renderer, full volumetric solver or homemade GPU scheduling layer is introduced.
- The scene sequence remains atomic in the main experience. F3's review controls restart from the corresponding source scene when selecting the other direction. F1 retains reversible mid-flight scrubbing for direct comparison.

## Reusable implementation prompts

### Forward: inward force

> Build a cinematic centripetal implosion from the existing blue cube cloud into the established golden horizon. Preserve particle identity and scene framing. Begin with restrained anticipation; then accelerate cubes along coherent, slightly curved inward paths using a convex displacement profile. Outside particles converge on the matching capture contour; particles already inside it fall toward the core. Align temporary deformation and short soft luminous tails with velocity, narrow transverse dimensions, and concentrate local density and heat during capture. Transition cyan facets through amber into pearl-gold highlights. Fuse the captured material into the existing fixed-size rim and continuous foreground ribbon geometry. Keep the final shadow, mantle, nebula and travelling disk waves unchanged. Avoid random crossing paths, long opaque rods, a small black-hole disk scaling up, screen-wide white flashes, and repeated camera shake. Verify spatial contraction, late acceleration, the brief capture peak and the unchanged final scene.

### Reverse: rupture and release

> Create an independent rupture-and-stellar-release sequence from the established golden horizon into the blue cube scene. Begin with a short pressure buildup visible in the emitting mantle. Release unequal contour sectors into a localized warm-white breakout and an uneven outward shock shell. Let the shock lead the visible ejecta. Deform, transport and fragment the actual rim and disk material, clear the old void, and launch glowing fragments from their transported source positions; vary direction, depth and onset while preserving an unmistakable outward impulse. Use short bright heads, soft tapered trails and drag-limited deceleration. Reduce temperature and trail intensity as the original faceted cubes regain volume and resume their settled field. Preserve overall framing and interface positions. Return exactly to the original cube scene. Do not implement this as the forward animation reversed, a uniform radial line grid, confetti, an orange terrestrial fireball, or a global white overlay. Verify the order pressure → breakout → outward transport → cooling → rest.

### Shared boundaries

> Use the project's Motion values, R3F lifecycle, shared artistic ribbon coordinates, seeded geometry and existing bloom/tone mapping. Keep reduced motion immediate, dispose resources on unmount, and retain entry and scene navigation when graphics fail. Keep all code, comments, prompts and artifact labels in English. Preserve the separate F1 continuity study for comparison. Record actual viewport, seed, scene time and playback mode when producing review evidence.

## Review

F3: `explorations-scene-formation--collapse-and-rupture`.
Source-material diagnostic: `explorations-scene-formation--rupture-material` (added particles and impulse glow removed).
F1: `explorations-scene-formation--gather-and-form`.
Both arrivals remain available in the same Storybook group. The selected Orbit scene uses F3. Review material remains local and outside Git; no push or PR is authorized yet.
