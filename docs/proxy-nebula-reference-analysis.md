# Chapter One: Design Overview

1. Design type: Five astronomical images and one illustrated luminous arc and a subsequent contour sketch inform a procedural browser scene.
2. Style: Layered nebular texture is combined with a restrained cinematic rim treatment.
3. Impression: Large dark regions and concentrated luminous edges create depth without uniform brightness.
4. Visual language: Soft clouds, filamentary boundaries, obscuring dust and sparse sharp highlights recur.
5. Layout: Asymmetric background structures surround a stronger central form.
6. Visual hierarchy: Small bright peaks lead the eye before lower-contrast cloud structure becomes visible.
7. Color: Warm amber and copper emission are supported by cool blue, teal and muted violet regions.
8. Typography: These references provide no useful interface typography direction.
9. Shape and material: Irregular translucent clouds contrast with the sixth image's continuous sharp arc.
10. Imagery and decoration: Point stars supply a finer scale than the clouds, while the new sketch requests local rounded outer-glow protrusions.
11. Interaction and motion: The still images do not establish flicker, cloud speed or interaction behavior.
12. Learning focus: Borrow the separation of spatial scales, uneven illumination and supporting color roles.

# Chapter Two: Full Design Analysis

## 1. Overall Recognition and First Impression

The first five supplied images depict star fields and cloud-like astronomical
structures; their object identities, imaging instruments, exposure processing and
color calibration were not provided. No specific provenance is inferred from
appearance. The sixth is an illustration with architectural objects and a large
luminous arc. It is a lighting reference, not evidence of a physical black hole.

Three directly visible relationships matter: concentrated highlights against
larger dark areas, irregular bright/dark cloud boundaries, and warmer emission
beside cooler surroundings. These produce focal depth, material complexity and
color contrast respectively. The current scene needs those relationships while
retaining its gold identity and continuous ribbon geometry.

## 2. Component Breakdown and Direct Visual Annotation

The originals are preserved. Numbered SVG overlays and a browser-rendered contact
sheet live outside Git at `/tmp/proxy-nebula-study/references/`. The sheet uses
uncropped source images with preserved aspect ratios; its numbers correspond to
this table. It was rendered and visually inspected before implementation.

| ID | Component | Parent | Purpose | Visible features |
| --- | --- | --- | --- | --- |
| 1 | Warm fragmented shell | Reference 1 | Large-scale organization | Copper/gold filaments around a darker center |
| 2 | Cool point highlight | Reference 1 | Local contrast | Cyan-white peak with a small soft surround |
| 3 | Layered cloud | Reference 2 | Material depth | Broad cool masses mixed with warm luminous pockets |
| 4 | Dust lane | Reference 2 | Occlusion | A dark irregular band cuts across brighter cloud |
| 5 | Cloud boundary | Reference 3 | Scale separation | Broad pale wisps with small dark protrusions |
| 6 | Extended star highlight | Reference 3 | Sparse accent | A sharp core with thin elongated rays |
| 7 | Illuminated pillar edge | Reference 4 | Form definition | Warm ragged boundary around dark interior |
| 8 | Surrounding cloud | Reference 4 | Supporting field | Lower-contrast teal variation rather than flat black |
| 9 | Warm emission pocket | Reference 5 | Focal concentration | Ivory center fading through amber into dust |
| 10 | Dark separation | Reference 5 | Negative space | Broad dark cloud separates luminous regions |
| 11 | Rim and colored shoulder | Reference 6 | Silhouette | Narrow white edge, pink outer hue and cool surroundings |

Correction from the user: the former annotation 12 belongs to another building
and is excluded from this effect. The revised overlay removes that marker. The
new sketch requests a continuous rounded protrusion in the outer luminous layer,
not an independent point highlight or vertical streak. The user's second sketch further
fixes the black region and inner rim: only the outer luminous boundary rises,
with light filling the area between the fixed inner edge and raised outer lip.

Largest-connected-component extraction isolates the sketch's dark arc from its
text and arrow. At native size 1866 by 958, its median stroke is near (650, 168)
at the local peak. A chord through the neighboring shoulders (520, 241.5) and
(800, 191) lies about 50 pixels below that peak. This is a local sketch comparison,
not a fitted physical radius or a required implementation amplitude. The annotated
sketch and measurements are retained beside the original-reference overlays.

The semantic labels above interpret visible structures; pixel statistics alone
cannot identify materials.

## 3. Style, Categories, and Keywords

These are useful technique labels rather than a claimed historical movement:

- **Filamentary emission**: thread-like bright structures within a broader cloud;
  visible in references 1, 3 and 4.
- **Dust lanes / extinction**: dark regions interrupting brighter background;
  visible in references 2, 4 and 5.
- **Rim lighting and colored bloom**: a narrow bright contour with a wider colored
  shoulder; especially clear in reference 6.
- **Diffraction spikes / stylized glints**: extended sharp star rays in the
  astronomical images; this is useful only for background stars, not the requested rim motion.
  NASA explains that telescope diffraction patterns depend on optical geometry;
  they should not be described as literal spikes emitted by stars
  ([NASA diffraction explanation](https://science.nasa.gov/wp-content/uploads/2023/07/webb-diffractionspikestranscriptstsci-01g77dqfw6pd35sh619tyxt8gt.pdf)).

Search combinations: `procedural nebula domain warp dust lanes`, `filamentary
emission warm cool contrast`, and `organic emissive contour displacement`.

## 4. Visual Language and How It Works

Measured whole-image median sRGB code-value luma is approximately 23, 98, 96, 60,
38 and 171 out of 255 for references 1 through 6. These are image statistics, not
linear luminance, exposure measurements or physical object brightness. A
12-color median-cut palette and source dimensions are recorded in
`references/measurements.json`. The first and fifth images devote much more of
the frame to dark colors than the second, third and sixth.

For this scene, borrow the darker background hierarchy of references 1 and 5,
the cloud structure of 2 through 4, and the layered rim of 6. Copying reference
6's overall exposure would replace the current dark/gold identity with a bright
cyan environment. Instead, recommended palette roles are gold/ivory for the main
rim, copper/rose for warm shoulders, and limited desaturated teal/lilac for
reflected accents and supporting cloud. These are implementation choices, not
measured exact source colors.

A broad cloud field gives scale; smaller twisted strands imply complexity;
dark dust interrupts both and prevents a flat colored fog. Sparse bright stars
supply a third, much finer scale. The black-hole silhouette remains the main
object. The existing layout and typography are inherited from the application,
not redesigned from the references.

## 5. Description Dimensions I May Have Missed

Motion is unconfirmed in all six stills. The subsequent sketch clarifies the
requested geometry: a viscous-looking emissive contour with localized rounded
bulges. This is a descriptive phrase, not a unique standardized effect name.
Implementation terms are **outer emissive-contour modulation** and **luminous mantle thickening**; the
shadow contour is fixed.
Metaballs/implicit surfaces are another way to obtain smoothly merging organic
forms ([SideFX metaballs](https://www.sidefx.com/docs/houdini/nodes/sop/metaball.html)).
Solar prominences offer only a loose visual analogy: NASA describes plasma
structures associated with the Sun, not this illustrated black-hole surface
([NASA explanation](https://www.nasa.gov/image-article/what-solar-prominence/)).

The feedback requests lighter, slower protrusions, followed by deeper colored halation and more varied foreground strand colors. Proposed motion is slow cloud evolution and independently phased contour bulges
in the outer luminous mantle that grow, drift slightly along the arc, and settle
without moving the shadow boundary. Local emission follows the
same bulge envelope. No uniform whole-ring flash or rim-attached star rays remain.
The accepted foreground waves keep their own timing. Reduced motion
continues to freeze the scene through the existing rendering lifecycle.

Procedural construction uses bounded multi-scale noise and domain warping: a
low-frequency field bends the sampling coordinates of finer fields. The
[Book of Shaders](https://thebookofshaders.com/13/) describes octave layering,
ridged noise and domain-warped cloud-like textures. Here, dark extinction and
emission receive related coordinates to form coherent boundaries. This is an
art-directed field, not a volume ray march, fluid simulation or calibrated
astrophysical gas model. No source tutorial shader is copied.

## 6. Teach Me How to Describe It

- "More colorful" becomes "Keep the main rim ivory-gold, add uneven copper/rose
  shoulders, and use small cool teal reflections for local contrast."
- "Make the halo sparkle" becomes "Let a few smooth protrusions rise from the
  outer glow and settle slowly, with a fixed inner edge and light filling the raised region."
- "Add a nebula" becomes "Place asymmetric low-contrast clouds outside the dark
  core, combine broad masses and finer twisted wisps, and cut dark dust through
  them so the background does not become uniform fog."

Retain the gold focal hierarchy, continuous silhouette and separation of texture
scales. Cloud placement, the amount of supporting color and protrusion intensity can
change with feedback. Raising the whole background to reference 6's brightness,
coloring every ring as a rainbow, or replacing the sharp rim with broad haze
would substantially weaken the retained identity.

## 7. Turn It Into an Implementation Prompt

> Refine the existing procedural golden event-horizon exploration. Preserve its
> continuous shared ribbon coordinates, stable thin upper edge, dark core,
> foreground intervals growing toward the viewer, travelling waves, B / Velvet
> drum controls, English UI and second cube scene. Add an asymmetric procedural
> background with broad nebular masses, finer domain-warped wisps and dark dust
> separations. Keep background contrast subordinate to the black hole. Enrich
> gold with uneven copper/rose shoulders and sparse muted teal/lilac accents.
> Break the outer halo's uniform illumination with coherent material texture
> and a few light, slow, independently phased rounded outer-glow bulges with coupled emission;
> keep the shadow and thin inner rim fixed, fill each raised luminous mantle,
> and exclude the building-associated streak.
> Use existing seeded noise, scene time and library-owned rendering/Bloom, with
> no raster nebula backdrop, new rendering loop or volumetric ray marcher.
> Expose reproducible fixed-time review captures and normal-runtime video.
> Verify the dark core, readable controls, color hierarchy, localized motion,
> continuous junctions, foreground spacing/waves, multiple viewport classes and
> reduced-motion behavior. Treat the new color balance and bulge intensity as
> candidates awaiting visual feedback, not as user-approved choices.
