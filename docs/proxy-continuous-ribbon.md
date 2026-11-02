# Continuous disk and arc material

Status: the user accepted the improved junction. The requested follow-up expands
foreground intervals with depth and strengthens travelling surface waves; see
[the depth and wave refinement](proxy-perspective-waves.md). The implementation
and verification below record the preceding junction revision.
Work stays on `refactor/proxy-modernization`.
No push, PR, deployment, or production homepage replacement is included.

## Construction decision

The [reference analysis](proxy-reference-continuity-analysis.md) identified a
material-coordinate discontinuity behind the previous veil. The earlier distance
union connected selected brightness contours but replaced foreground texture
with independent opaque emission.

A temporary common optical-disk prototype sampled both intersections with one
material. Its large upper disk image materially changed the accepted composition.
The prototype shader and actual capture remain outside Git at
`/tmp/proxy-flow-study/optical-common.glsl` and `optical-common.png`.

The selected candidate uses an explicitly art-directed nested ribbon family in
`proxy/src/scenes/materials/relativisticHorizon.glsl`. It retains the existing
optical sky and capture scale. The separate `optical` treatment retains its two
disk intersections and original material.

## Shared mapping

For each screen point, the ribbon family interpolates between an upper circular
arc and an expanded foreground ellipse. The blend is a smooth logistic function
of vertical position, avoiding a finite-height cutoff. Material radius increases
both ellipse axes; a bounded 16-step bisection therefore finds at most one radius
at any screen point. This monotonic radial mapping prevents neighboring ribbons
from folding across each other before the bounded material perturbation.

The upper radius uses logarithmic compression. The foreground axes use the
accepted capture scale and an inclination-dependent vertical scale. One pair of
material coordinates supplies:

- The continuous filament phase across the arc, junction, and foreground.
- The existing unequal travelling swells in the foreground.
- Periodic angular noise without an angle-wrap texture seam.
- Fine strand width, medium wisps, diffuse emission, and radial attenuation.

The narrow rim measures the same inner contour. Its original world-space crest
width and warm highlight remain in place above the junction. Outer falloff uses
distance from that inner contour, not a local derivative of the logarithmically
compressed material radius: the latter created a bounded-field halo cutoff in an
intermediate experiment and was removed.

There is no screen-space strip hiding a row of finite strand endpoints. The
strands continue through the turn in the material itself. Material coverage
attenuates background stars; it is not a translucent treatment of exposed tips.
Bloom remains owned by React Postprocessing and follows the common emission.

The mapping is a procedural artistic surface, not a fluid solver or a new
general-relativistic lensing model. It follows the common-coordinate and sweep
principles documented in the reference analysis without adding a dependency or
importing tutorial shader code.

## Diagnostics and regression evidence

Storybook adds two diagnostic views alongside `Selected Horizon`:

- `Horizon Flow Coordinates` groups four consecutive strand periods by color.
  The groups read the same warped coordinate as the normal material.
- `Horizon Unbloomed Emission` preserves the gold material and disables Bloom.

Both are exposed through `horizonDiagnostic` and leave the selected scene in
`beauty` mode by default. Diagnostic controls are confined to the exploration;
they add no controls to the homepage interface.

The new browser oracle flood-fills observed color regions from foreground seeds
and requires multiple distinct groups to reach the upper arc through both sides.
It does not reproduce the shader mapping in TypeScript. A deliberately severed
image is a negative control for that oracle.

The emission check resizes the same scene through desktop, tablet, and short
phone dimensions, sampling the low-frequency light field near both junctions.
It hides the overlaid album control during pixel capture so the control cannot
be mistaken for a shader gap. Individual sharp strand peaks are removed from
this envelope measurement; strand continuity has its own color-region test.

The old test requiring almost no strand contrast inside a flat veil was removed.
That condition encoded the rejected construction and did not detect its lower
material discontinuity. Thin crest, dark core, turning ridge, bottom-reaching
emission, normal motion, and existing input tests remain.

## Review artifacts

Artifacts live outside Git in `/tmp/proxy-flow-study/final`. The review includes
the prior candidate, current desktop/phone/tablet captures, coordinate groups,
unbloomed emission, junction crops, and normal-runtime video. Fixed-time images
use time 12 and the repository scene seed; `recipe.json` records dimensions,
diagnostic modes, capture details, and any browser errors.

The retained constraints are the gold palette, accepted upper rim, dark core,
sparse foreground extending to the bottom, irregular travelling waves, selected
B wheel/card interface, and both scenes. The new junction deliberately changes
the way the broad light band expands into the foreground. User feedback, rather
than test success alone, determines whether that shape and material are accepted.

## Executed verification

- `proxy:check`: 79 files, zero Astro errors/warnings/hints; ESLint and Prettier passed.
- `proxy:build` and `proxy:storybook:build`: passed.
- Four focused rendering cases passed in Chromium, Firefox, and WebKit: material
  connectivity with a severed-image negative control, unbloomed resize inspection,
  the retained rim/core/foreground/motion checks, and the separate optical-disk
  inclination case (12 browser cases).
- Existing scoped scrolling, artwork playback/focus, and touch gesture cases
  passed in Chromium (three cases).
- The 17-size Orbit geometry matrix, interrupted navigation with resize/reversal,
  and reduced-motion/graphics-failure cases passed in Chromium (three cases).
- Captures cover both scenes at 1440 by 900, 390 by 844, 390 by 400, and 768 by
  1024, plus the horizon at 844 by 390 and both diagnostic views at 1440 by 900.
- The 1280 by 800 runtime recording decodes all 548 frames, lasting 21.92 seconds
  at an encoded 25 fps. That rate does not measure GPU rendering performance.
- The review page loaded all images, switched before/current views, played its
  video, and had no document overflow at 1280 and 390 pixels in Chromium.

WebKit first failed the unsupported Fedora host validator before executing page
code. An actual launch/content probe passed with the previously documented local
compatibility setup, followed by all four WebKit cases using command-local
`PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1`. No system library was changed.
Browser emulation does not establish physical iOS/Android GPU performance.

Logs are `/tmp/proxy-flow-{final-check,build,storybook,browsers,webkit,layout}.log`.
The review is served locally at `http://127.0.0.1:6008/flow/`; it is not a deployment.
