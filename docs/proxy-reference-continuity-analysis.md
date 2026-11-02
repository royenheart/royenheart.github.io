# Reference continuity analysis

Analysis date: 2026-10-05. Branch: `refactor/proxy-modernization`.

The user rejected the latest veil-to-halo junction and requested detailed reference analysis and procedural-method research before further visual changes. This round changes documentation only. The selected B deck, accepted thin rim, sparse foreground density, irregular waves, gold theme, and framing remain constraints. No push, PR, deployment, or production replacement is authorized in this review.

## Chapter One: Design overview

1. Design type: The supplied image is a small black-hole illustration used as a material and junction reference for the existing browser scene.
2. Style: Cinematic space visualization combines a dark silhouette with luminous, anisotropic filaments.
3. Impression: Large black areas and concentrated junction highlights establish scale and directed movement.
4. Visual language: Fine boundaries, broad striated bands, overlapping sheets, and weak outer wisps form a coherent hierarchy.
5. Layout: A low circular shadow intersects a nearly vertical tilted disk against extensive negative space.
6. Visual hierarchy: Bright junctions attract attention before the inner boundary, curved band, and outer falloff.
7. Color: Low-saturation blue-gray and warm brown meet in near-neutral bright regions.
8. Typography: The reference contains no typography or interface elements.
9. Shape and material: Unequal filament spacing and variable band width suggest an emitting sheet rather than a uniform tube.
10. Imagery and decoration: The surrounding darkness contributes to the composition without requiring decorative stars.
11. Interaction and motion: Flow direction is suggested by texture, while actual motion and temporal behavior remain unconfirmed.
12. Learning focus: Preserve material correspondence and directional continuity before adding occlusion or bloom.

## Chapter Two: Full design analysis

### 1. Overall recognition and first impression

The image is 236 by 419 pixels. Its authorship, original renderer, and physical model remain unconfirmed; resemblance to cinematic black-hole imagery does not establish provenance. The thin visible boundary must not be identified conclusively as a photon ring or the event horizon from this raster alone.

The strongest observations are directed flow, restrained color, and concentrated brightness. Approximately 51.2% of pixels have encoded RGB weighted brightness below 10 on a 0–255 scale. A previous fit to the visible right inner boundary estimates a center near (115, 284) and radius near 58 pixels. This describes the visible silhouette only. Its low placement leaves room for a tapering upper sheet and concentrates the circular mass in the lower image.

The dense foreground sheet crosses the dark region; the broad curved band appears to pass behind it. This is a visual interpretation of overlapping boundaries, not a recovered 3D model. Small edge losses support a continuous larger form without making every individual filament traceable through the junction.

### 2. Component breakdown and direct visual annotation

The original image was embedded unchanged in an SVG with numbered red overlays, rendered in Chromium, and visually inspected. Working artifacts are outside Git at `/tmp/proxy-reference-audit`: `annotation.png`, `annotation.svg`, `profiles.png`, `measurements.json`, and `analyze.py`. Temporary artifacts are not durable repository assets.

| Number | Component | Parent region | Purpose | Visible evidence |
| --- | --- | --- | --- | --- |
| 1 | Fine inner boundary | Circular silhouette | Defines the dark core | Sharper and narrower than the outer luminous band |
| 2 | Broad curved band | Outer disk image | Establishes curved material flow | Several directional filaments, unequal spacing and brightness |
| 3 | Upper junction | Disk/band overlap | Redirects attention between sheet and arc | A widening bright area with multiple overlapping directions |
| 4 | Lower junction | Disk/band overlap | Returns the curved band toward the lower sheet | Strong brightness, layered wisps, partially lost boundaries |
| 5 | Tilted foreground sheet | Main disk | Establishes depth and axial flow | Warm, narrow texture crossing the dark silhouette |
| 6 | Outer falloff | Curved band exterior | Connects emission to black space | Weak curved wisps and a long brightness tail |

The pixel workflow uses RGB patch medians, weighted brightness profiles, and local structure tensors. These supplement direct inspection; they do not infer a unique physical model.

### 3. Style, categories, and keywords

The closest industry description is cinematic black-hole visualization, with high confidence as a visual category and no claim of film authorship. Useful mechanism terms include gravitationally lensed disk imagery, anisotropic filamentary emission, occlusion, bloom, and veiling flare. A lensed disk image and optical glow are distinct mechanisms even when they overlap in the final image.

In painting, edge hierarchy and lost edges describe the selective visibility of boundaries. James Gurney's [Transitioning Edges](https://gurneyjourney.blogspot.com/2011/08/transitioning-edges.html) demonstrates that matching adjacent values can make an edge disappear without simply blurring it. Applying this observation here is an interpretation: the junction can suppress the distinction between strand and surrounding emission while preserving directional structure.

Useful search combinations are `procedural accretion disk shared coordinates`, `black hole lensed disk material`, `sweep arc length UV parallel transport`, and `veiling flare point spread function`. No historical painting movement is established by this reference.

### 4. Visual mechanisms, current failure, and researched construction methods

#### Palette and brightness

The following colors are per-channel medians of 5 by 5 patches in the supplied image, not a recovered author palette or physical temperature estimate.

| Role | Sample center | Measured RGB hex |
| --- | --- | --- |
| Warm upper sheet | (88, 149) | `#866A5F` |
| Cool curved band | (188, 277) | `#9099A5` |
| Upper junction | (108, 199) | `#DCDBD9` |
| Lower junction | (130, 353) | `#BABABD` |
| Dark core | (129, 284) | `#060702` |
| Outer falloff | (218, 280) | `#18181A` |

Cool and warm middle values distinguish overlapping regions, while brighter junctions become more neutral. Several brightness shoulders and a long weak outer tail preserve filament structure at multiple scales. The current gold theme can retain this hierarchy through cream highlights, champagne middle values, amber shadows, and near-black space; copying the reference's exact blue-gray hue is not required.

#### Direction, width, and texture

On the right curved band, local tangent estimates rotate approximately 37, 55, 68, 86, 111, and 136 degrees between source rows 212 and 337. Tensor coherence is about 0.85–0.98 at these samples. The upper junction itself has much lower directional coherence, about 0.23, consistent with overlapping directions. These measurements support coherent turning along the main arc, but do not prove that one identifiable strand passes through every bright junction.

The useful continuity hierarchy is position, tangent, curvature, band width, texture phase, emission, occlusion, and time. [Rhino's continuity documentation](https://docs.mcneel.com/rhino/6mac/help/en-us/popup_moreinformation/continuity_descriptions.htm) distinguishes G0 position, G1 tangent, and G2 curvature continuity. Geometry alone cannot guarantee matching material coordinates or brightness. This low-resolution reference is not evidence of exact G2 construction.

The junction should be read as a widening bundle of filaments entering a denser emitting region. Individual edges lose contrast inside that region, while neighboring wisps carry the same large-scale direction. Complete tip coverage remains a user requirement: hidden geometry may continue behind an opaque, textured part of the same material. A featureless screen-space strip is not an adequate replacement for that material.

#### What the current crop establishes

The new failure crop is 138 by 150 pixels and fully opaque. Along a five-column median profile centered at x=10, encoded weighted brightness falls from about 71 at y=70 to 49 at y=139, then rises to about 121 at y=147. The perceived gap is therefore a brightness trough accompanied by missing texture, not an alpha hole. A single profile cannot diagnose the whole image, but it directly supports the reported local separation.

The earlier checks established coverage and selected horizontal brightness profiles. They did not establish material correspondence across the whole junction, and missed this lower vertical transition. Passing those tests was insufficient evidence of aesthetic continuity.

#### What the current shader establishes

In `proxy/src/scenes/materials/relativisticHorizon.glsl`:

- `circularPhase` uses its own radial field near line 113, while the disk phase is derived from projected disk radius near line 251.
- Lines 256–265 give the veil the full blended phase but limit the disk-side correction; the two branches do not use an identical material map.
- Lines 144–159 merge distance envelopes and generate coverage around a perturbed screen-space height; the added emission does not transport individual strand identity.
- The selected limb treatment masks the back half of the disk near line 171 and excludes the second optical disk intersection near line 284.
- Lines 298–299 composite opaque veil emission over the disk; where coverage reaches one, the underlying texture disappears entirely.

The existing connected envelope improves silhouette and brightness continuity. It does not establish a common emitting material. More blur or a wider coverage strip will not by itself repair that mismatch.

#### Primary-source research

| Method and inspected source | Documented construction | Application and limit |
| --- | --- | --- |
| [Nika Maisuradze, Gargantua breakdown](https://www.blendernation.com/2015/02/17/behind-the-scenes-gargantua/) | Procedural disk noise shares one coordinate system; refraction geometry distorts the disk; emission, cloud, and gas layers contribute to the material | Preserve a common disk source before distortion; the refraction setup is an artistic lensing approximation |
| [3DSinghVFX, Cycles/Eevee breakdown](https://www.blendernation.com/2018/10/26/accreting-black-hole-in-blender-cycles-and-blender-eevee-breakdown/) | Annular disk geometry and procedural noise combine with a lensing approximation | A useful modeling study, but concentric geometry alone does not prove a continuous junction |
| [Eric Bruneton, shader model](https://ebruneton.github.io/black_hole_shader/black_hole/model.glsl.html) | Both ray/disk intersections evaluate the same `DiscColor` material with intersection position and time | Reuse the existing optical infrastructure and shared material; multiple images do not imply one-to-one visible strand correspondence |
| [DNGR paper, sections 4.3.1–4.3.2](https://arxiv.org/pdf/1502.03808) | Artist-directed disk models are rendered through curved light paths; measured optical point-spread functions produce lens flare by convolution | Derive glow from coherent emission; this does not require copying the film's renderer or running fluid simulation |
| [Tyler Kennedy, Godot shader breakdown](https://tkte.ch/articles/2026/01/15/godot-blackhole-shader.html) | Bent-ray stepping samples a shared disk material; cylindrical noise coordinates avoid an angular seam | Useful realtime material mapping; its inverse-square ray bending is a stylized approximation, not a GR solver |
| [SideFX Sweep](https://www.sidefx.com/docs/houdini/nodes/sop/sweep.html) and [Orient Along Curve](https://www.sidefx.com/docs/houdini/nodes/sop/orientalongcurve.html) | A cross-section follows a spine with shared UV coordinates and controlled orientation | An alternative art-directed ribbon can carry persistent along/across coordinates through the junction |

These are inspected descriptions, documentation, and shader source, not benchmarked integrations or verified authorship of the supplied image. Linked tutorial videos were not used as watched evidence.

#### Recommended next implementation study

First test a unified disk material through the existing optical intersections. The material should define density, filament phase, color, and motion from common disk coordinates. Examine the selected limb's excluded contribution and foreground mask before restoring any contribution; simply enabling the second intersection cannot guarantee the accepted composition.

If that optical construction cannot retain the accepted framing, compare a deliberately art-directed continuous ribbon. Use a smooth spline or flow map with persistent along-flow distance and cross-flow position. Derive all filament offsets, width changes, texture, and emission from this map. Control orientation through bends and ensure the mapping does not fold. This is a proposed application of procedural sweep techniques, not a claim about the reference renderer.

For either route, generate fine strands, medium wisps, and broad emission from the same material. Composite depth and complete tip coverage after establishing continuity, then derive glow from the emitted image using the existing postprocessing library. Keep temporal noise tied to material coordinates and wrap angular coordinates without a seam.

### 5. Additional dimensions and verification

The reference does not establish animation speed, material advection, camera motion, or responsiveness. Proposed motion should keep the accepted irregular waves and move texture consistently along the flow, including through the junction. Independent noise clocks can create temporal seams even when a still frame looks joined.

The next study should include:

1. A no-bloom view and a numbered material-coordinate view that expose every mapping branch.
2. Several tracked filament trajectories through the junction, rather than only the strongest ridge.
3. Width and tangent inspection, texture-phase checks, and brightness samples along actual flow paths.
4. Complete occlusion of all unwanted tips without a visible collective termination boundary or flat strip.
5. Equal-scale normal and enlarged views; fixed-time comparisons and normal-speed playback.
6. Phone, tablet, desktop, short-height, and resize checks for shader scaling and clipping.

Tests can establish measurable properties and runtime behavior, but the user determines aesthetic acceptance. No application tests were rerun for this documentation-only analysis.

### 6. More precise descriptions

| Vague request | Observable request |
| --- | --- |
| Make the junction softer | Widen the curved bundle gradually into the disk sheet while maintaining its tangent and internal directional texture |
| Hide the line ends | Continue strands behind a denser emitting part of the same flow, with full coverage and no row of visible caps |
| Make the glow more natural | Generate the broad falloff from existing emission and retain weaker directional wisps between sharp strands and the outer halo |

Retain directional coherence, multi-scale texture, and selective edge visibility. Palette hue, disk orientation, and framing can adapt to the existing scene. Uniformly thick strokes, an equally bright circle, or a featureless opacity band would weaken the reference's material character.

### 7. Implementation prompt

```text
Refine the existing browser black-hole scene using the supplied reference as a
material-continuity study. Preserve the accepted thin upper rim, gold palette,
sparse foreground disk reaching the bottom edge, irregular waves, dark core,
scene framing, and selected B wheel/card interface. Do not add typography or
change UI layout in this study.

Replace independent junction masking with a coherent material construction.
First investigate the existing optical intersections sampling one disk density,
filament, color, and time field. If this cannot preserve the approved framing,
compare an explicitly art-directed smooth ribbon with persistent along/across
coordinates. Do not call the latter a physical accretion simulation.

Make the filament bundle turn and gradually widen through the junction. Preserve
texture identity where traceable, and document legitimate optical branching.
Use layered emitting structure and depth to cover unwanted strand tips fully.
Keep directional wisps in the covering region, with no flat opacity strip,
exposed cap, dark separation, or abrupt texture reset. Derive broad glow from
the actual emitting structure through existing library postprocessing.

Translate the reference's near-white highlights, restrained middle values,
and dark outer falloff into cream, champagne, amber, and black. Its cool hue,
vertical orientation, and unconfirmed motion are not reproduction requirements.

Before judging a beauty render, show no-bloom geometry/material views and
numbered coordinate bands, then normal-speed motion and equal-scale junction
crops. Verify multiple filament paths, phase and width continuity, complete
coverage, absence of a flow-path brightness gap, and responsive framing.
Keep comparison captures outside Git. Do not push, open a PR, deploy, or replace
the production homepage during this review.
```
