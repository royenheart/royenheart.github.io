# Mirror fracture and spatial radiation

## Current brief: F6 on the accepted F5 spatial paths

The user corrected F4's interpretation of outward propagation. Upright filaments must be distributed in a **three-dimensional fan over the disk**, then repeatedly travel beyond the rings along radial world-space paths. Screen-plane left/right translation is insufficient. The near-facing filaments move toward the observer, descend in the image and grow through perspective; lateral filaments travel diagonally outward. Preserve the mirror fracture and move the actual rim, disk, shadow and nebula with the panes.

The user accepted F5's three-dimensional propagation and requested longer, less disconnected strand shapes. The selected Orbit experience now uses F6: 2.85 times the original vertical extent, correlated broad bending, finer local variation, variable-width warm scattering and wider refraction. See [the strand reference analysis](proxy-wave-strand-analysis.md). Forward collapse, both arrivals, the settled scenes, gold palette, wheel, cards and registration layout remain in place. F4's planar waves and F3's material rupture remain independent comparison stories. F6's material character, fracture scale and distortion balance remain pending visual feedback.

## Reference interpretation

The original single-frame sketch has four thick, slightly sinuous vertical marks around and across a circular boundary. Thresholding and morphological opening separate the thick marks from the thin circle. Their height/width ratios are 6.68, 7.36, 11.87 and 17.37, with fitted axes approximately 0.98–5.47 degrees from vertical. Those measurements establish orientation, not velocity. F4 inferred horizontal motion from an ambiguous still; the user explicitly rejected that inference.

The corrected two-frame sketch supplies depth cues: the curved rings establish a receding plane, the filaments occupy different angular positions, and their later positions lie farther from the center along that plane. The front filament progresses toward the lower edge while side filaments spread laterally. The implementation encodes world-space coordinates and tests their perspective projection; it does not rely only on visual interpretation of the sketch.

The photographic reference contributes fine irregular bends, pale narrow cores, uneven local density and imperfect parallelism. Only its line character is transferred. The existing gold/pearl/copper scene supplies the palette; the mushroom cloud and ground are excluded. Historical records describe rocket smoke trails displaced by a shock wave as a photographic measurement aid. This identifies the class of reference feature, not the exact provenance of the supplied photograph. Its lines should not be presented as visible ionizing radiation. [Defense Nuclear Agency, Operation TEAPOT report](https://www.govinfo.gov/content/pkg/GOVPUB-D15-PURL-gpo222723/pdf/GOVPUB-D15-PURL-gpo222723.pdf).

Reference images, measurements and visual review artifacts remain outside Git. Pixel measurements establish geometry and palette, not aesthetic acceptance.

## Vocabulary and methods

- **Fractured image plane / glass-shatter transition:** content-bearing fragments separate and tilt; the source image itself breaks apart.
- **Screen-space refraction / piecewise image warp:** background coordinates shift according to a pane or wave displacement. This approximates distortion rather than tracing mirror reflections.
- **World-space radial advection of vertical filaments:** a precise descriptive phrase for upright curves whose anchors travel radially in the disk plane. **Fan-shaped emission** describes their angular distribution. Neither is a single standardized effect name.
- **Perspective scale and parallax:** near-facing curves acquire larger apparent height/width and move downward as depth decreases. The renderer's perspective camera produces this projection; no independent screen-space scaling animation is needed.

| Construction | Mechanism | Use |
| --- | --- | --- |
| Voronoi panes | Clip a sheet around seeded sites and transport its original coordinates with each pane | Actual content motion, using one small stable mesh |
| Full rigid-body glass destruction | Prefracture, constrain and simulate colliding pieces | Not needed for this camera-facing transition |
| World-space curve strips | Put upright curves at polar anchors on a tilted disk, advance radius and project with the scene camera | Selected F5 wave geometry |
| Shared vector displacement target | Render the same curve strips into a half-resolution signed field, then offset procedural source coordinates | Aligns visible waves with local refraction |
| Analytical screen curves | Move paired curves horizontally in image coordinates | Retained F4 comparison; rejected for the selected wave behavior |

SideFX documents seeded Voronoi decomposition, glass-specific cracks and fracture constraints. The pane generator here is an original half-plane clipping implementation; no Houdini runtime or copied implementation is included. [Voronoi Fracture](https://www.sidefx.com/docs/houdini/nodes/sop/voronoifracture), [Working with glass](https://www.sidefx.com/docs/houdini/destruction/glass.html).

Three.js documents perspective projection and render-target composition. NVIDIA describes the efficient refraction approximation of offsetting background sample coordinates. F5 combines these principles: actual world-space curves generate a displacement texture, while the existing artistic horizon directly re-evaluates its source function at displaced coordinates. No second copy of the full scene is rendered. [PerspectiveCamera](https://threejs.org/docs/pages/PerspectiveCamera.html), [Three.js postprocessing](https://threejs.org/manual/pages/post-processing.html), [GPU Gems 3, section 30.3.2](https://developer.nvidia.com/gpugems/gpugems3/part-v-physics-simulation/chapter-30-real-time-simulation-and-rendering-3d-fluids).

## F5 recipe

The reverse lasts **5.4 seconds**. Forward collapse remains 6.4 seconds; cube and horizon arrivals remain 3.2 and 4.6 seconds. Scene seed is 82371; deterministic review time is 12.

1. **Tension, approximately 0–1.3 s:** small pane-normal changes create refractive offsets and seam glints. Adjacent sections of rim, disk and nebula begin to misalign.
2. **Separation, approximately 1.3–3.5 s:** panes rotate, foreshorten, shrink slightly and move outward. Actual geometric openings expose the destination cubes.
3. **Spatial wave packets, overlapping the fracture:** five angular sectors span a front-facing fan of approximately 150 degrees. Three packets launch at normalized release 0.08, 0.27 and 0.46, with slight sector delays. Each anchor advances from radius 5.5 through another 7.4 local units during its 0.62-normalized lifetime. A 12-degree tilted disk gives near-facing paths downward travel. Curves remain upright with unequal low-frequency bends and fine roughness; their width is measured in world units.
4. **Recovery, approximately 3.5–5.4 s:** panes depart and fade at different times, waves move past the foreground, and blue cubes settle. Wave opacity reaches zero at the settled endpoint.

The front-facing fan is an art-directed interpretation of the user's sketch, not a full spherical radiation shell. Curves are luminous line strips, not fluid simulation. The mirror stage is a fractured procedural image, not physical rigid glass or multi-bounce ray tracing.

### Editable mechanisms

- `mirrorGeometry.ts`: 35 seeded convex Voronoi panes, clipped to aspect ratio. Seeds preserve pane identities during resize; one buffer geometry contains all panes.
- `mirrorVertex.glsl`: independent translation, rotation, tilt, perspective and lifetime. Original source coordinates stay attached to vertices.
- `radiation.ts`: five sectors, three packets, radial lifetime and actual XYZ curve samples. One reusable strip geometry contains all 15 filaments, with 96 segments per filament. F5 uses short independent curves; F6 uses the same anchors with longer correlated curves.
- `RadiationField.tsx`: renders that geometry visibly and into a library-owned half-resolution half-float displacement target. No additional renderer or canvas is created. Both passes use the same camera, coordinates and time. The target clears on resize and after the effect, and does not render continuously at rest.
- `radiationVertex.glsl` / `radiationFragment.glsl`: camera-facing strips of world-unit width, pearl cores, warm shoulders, tapered ends and signed bipolar displacement.
- `relativisticHorizon.glsl`: samples the curve displacement at the current screen pixel and re-evaluates rim, disk, shadow and nebula at each pane's source coordinates. The entire source participates.
- `CubeCloud`: restrained destination recovery behind departing panes replaces F3's bright ejecta for this direction.
- `SceneImpulse`: retains forward compression. Its planar reverse branch is disabled for F5; `mirrorWaves.glsl` remains solely for F4 comparison.

R3F owns rendering, sizing and the frame lifecycle; Motion owns scalar progress; Drei owns the framebuffer target. Geometry/materials dispose on replacement or unmount. The DOM interface stays outside scene distortion. Quiet entry, graphics fallback, reduced motion and atomic navigation remain available.

## Review views

- `streaming-mirror`, `streaming-surface`, `streaming-waves`: selected F6 with long smoke-like strands, respectively complete, source-only and emission-only.
- The spatial inspection starts with F6. **Compare short strands** toggles F5's earlier curve shape on the same paths and camera.

- `radiating-mirror`: complete F5 reverse, initially at the horizon.
- `radiating-surface`: fractured source with spatial refraction; added wave emission and destination cubes hidden. It intentionally ends empty.
- `radiating-waves`: the same actual 3D emitting geometry in the main scene camera.
- `Explorations/Spatial radiation`: orbitable view of the exact same geometry, with top/oblique/front camera presets and diagnostic disk guides. Guides are absent from the scene.
- `mirror-and-waves`, `mirror-surface`, `upright-waves`: retained F4 planar comparison.
- `collapse-and-rupture`, `rupture-material`: retained F3 material comparison.

Main F5/F6 review controls start at progress 100% (horizon); Play reverse moves to 0% (cubes). The spatial inspection slider instead labels release directly from 0 to 100%.

## Reusable prompt

> Fracture the actual scene-bearing image into irregular convex panes. Give adjacent panes small refractive offsets, then tilt, translate and separate them so the rim, foreground rings, black shadow and nebula move with the fragments. Distribute tall, roughly parallel, gently irregular luminous filaments across a fan in the tilted disk plane. Emit several delayed packets. Advance each filament's anchor radially in world space beyond the disk, including depth toward the camera; let perspective produce larger, lower foreground curves and diagonal lateral departures. Keep the curves upright while their anchors move. Use the same world geometry for narrow pearl-gold emission and a wider signed displacement field that refracts the fractured source. Preserve the original gold/copper palette and forward collapse. Reveal and settle the blue cube field through the departing panes. Keep interface controls stable and reduced motion immediate. Inspect the source-only, wave-only and orbitable spatial views as well as native playback. Do not substitute screen-plane left/right line motion, radial spokes, a fireball or cracks over intact source content.

## Verification

Executed for the final F6 code:

| Check | Result |
| --- | --- |
| Astro, TypeScript, ESLint and Prettier | Passed; 95 files, zero diagnostics |
| Static site and Storybook builds | Passed |
| Unit tests | 46 passed across 7 files, including pane coverage, radial XYZ movement, perspective growth, long-strand extent and deterministic replay |
| Focused Storybook tests | 34 passed across the Orbit, formation and spatial inspection stories; run with `--no-file-parallelism` |
| F6 mirror and spatial browser checks | 12 passed across Chromium, Firefox and WebKit |
| Selected navigation, arrival/context loss and reduced-motion regression | 3 passed in Chromium |
| Resting horizon continuity, wave spacing/motion and atmosphere regression | 4 passed in Chromium |

F5 had already passed 24 cross-browser checks before the strand refinement. Its short-strand comparison remains available, but the F6 counts above describe the final focused rerun.

The initial resize-resource assertion sampled pre-render telemetry in demand mode: immediately after a target resize it observed 11 textures, then 12 on the next requested frame. The same 12-texture count remained stable at all tested sizes. Resource checks now sample native playback, while deterministic screenshots retain demand rendering. This changes the sampling oracle, not the resource limit.

The first Storybook run reloaded after discovering new Drei deep imports. Explicit prebundling prevents that cold-start invalidation. The graphics playback-control test also exceeded its original 15-second total budget after graphics preparation and playback had begun; the Storybook project now allows 30 seconds for the complete interaction sequence. Readiness and interaction assertions remain enabled. No application animation duration changed for testing.

Review artifacts are outside Git under `/tmp/proxy-stream-wave/final/`. Screens cover 1440 × 900, 390 × 844, 768 × 1024 and 1280 × 400, with fixed time 12 and seed 82371. The separate orbitable view reuses the actual curve geometry. Browser execution uses software WebGL; these checks do not establish physical-device GPU performance or aesthetic acceptance.

Four native WebM recordings (complete, source, emission and spatial inspection) were decoded and inspected at 12 sample frames each. The gallery also verified actual playback of all four files, image loading, desktop/phone overflow and replacement/unmount of its live iframe. Capture and gallery checks reported no page errors. Original recordings include resource preparation, are silent, and may contain dropped frames from software rendering.
