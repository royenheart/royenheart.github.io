# Nebular backdrop and raised luminous mantle

Status: implemented as a visual candidate after reference analysis, two structural
clarifications, and feedback requesting lighter motion and deeper color. The
revised balance remains open to visual feedback. Work stays
on `refactor/proxy-modernization`, without push, PR, deployment or production
homepage replacement. The authored blog post remains untouched.

## Direction and corrections

The [reference analysis](proxy-nebula-reference-analysis.md) separates observations,
pixel statistics, interpretation and implementation suggestions. Annotated source
images and both user sketches are kept outside Git.

The building-associated streak in reference 6 is excluded. An initial point-glint
interpretation was removed. The user's first sketch established a rounded,
viscous-looking local protrusion. The second explicitly fixes the black region:
only the **outer luminous mantle** rises. A temporary whole-contour displacement
was therefore also removed. These intermediate captures remain outside Git and
are not presented as current candidates.

The existing lower junction, expanding foreground intervals, travelling surface
waves, dark core, gold identity, selected Velvet drum interface and cube scene
are retained.

## Procedural construction

`relativisticHorizon.glsl` supplies all new material. There are no nebula image
textures, additional dependencies, new render loops, or volume ray marches.

### Background

A seeded low-frequency noise field bends the coordinates of finer noise. Related
fields describe cloud emission and dark absorbing dust; additional small-scale
variation gives texture inside the larger cloud masses. Warm copper/rose and cool
blue-gray regions have different spatial weights. Two star scales add sparse
sharp accents. Cloud evolution is slow and uses existing scene time.

The background is an art-directed camera-plane field. A prototype that passed
bright clouds through the original optical sky mapping exposed a second circular
shadow across the flattened foreground; that composition was rejected during
inspection. The selected ribbon silhouette now occludes the backdrop through its
existing material radius. The separate `optical` treatment is unchanged.

### Mantle and color

Three smooth angular envelopes rise and settle at different phases, with a small
amount of tangential drift. Their maximum scene-space heights are 0.10, 0.085 and
0.07; angular widths are 0.085, 0.100 and 0.115 radians. Relative to the first
fixed-shadow study, peak heights are reduced by roughly 40 percent; cycles now
last approximately 18–25 seconds, with slower tangential drift and lower-amplitude
halo shimmer. A vertical gate confines
them to the upper arc, leaving the accepted lower junction and waves in place.

The black shadow and thin inner crest retain the original contour. Distance from
that contour drives a raised outer lip, a filled emitting bridge beneath it, and
a soft exterior falloff. Those components use the same angular envelope and
existing material noise. The effect changes outer light thickness, not the
radius of the black region. Its activation is limited to outward distance;
there is no new rim-attached point star, beam, or hollow dark pocket under a bulge.

The main crest remains ivory-gold. The latest feedback asks for deeper colored
halation and more distinct foreground layers. The broad warm halo has stronger
copper/rose color, a slightly wider near falloff, and more outer emission; the
white crest and gentle mantle timing stay unchanged. Seeded radial strata vary
strand color from champagne to copper-orange, with limited periodic azimuthal
cool reflections. Color uses the same material radius as the waves and does not
alter ring spacing or strand trajectories. Advected texture modulates the broad halo,
and local emission increases with the mantle's envelope. Existing library Bloom
spreads this emission. This is a controllable artistic approximation of luminous
fluid-like behavior, not a viscosity solver or astrophysical black-hole surface.

## Inspection and regression strategy

The existing coordinate and unbloomed views remain available. Color groups test
the original arc/foreground connectivity; the emission view exposes the mantle
without relying on Bloom to hide a seam. Capture times 12, 20 and 28 use the same
scene seed and camera setup.

The new atmosphere test measures actual pixels rather than duplicating the
shader's equations. It checks visible spatial cloud variation, both warm and cool
supporting colors, a subordinate background exposure, and a dark core. It samples
temporal changes by arc sector to distinguish localized emission from uniform
whole-ring flashing. Radial scans separately track the inner and outer edges of
the bright material: the outer edge must rise across a rounded shoulder while
the inner edge remains within a small rasterization tolerance. A repeated fixed
time checks deterministic replay.

Prior continuity, foreground-spacing/wave, upper-rim and normal-animation tests
remain relevant. Reduced-motion and interrupted navigation checks exercise the
existing library-managed lifecycle. Browser emulation does not establish actual
phone GPU performance or music-provider playback availability.

## Review artifacts

`/tmp/proxy-nebula-study/final` contains actual scene captures and video. The local
review is served at `http://127.0.0.1:6008/nebula-mantle/`, with before/current
comparison, wave/mantle phases, close views of the rim, phone/tablet/landscape
captures, the retained cube scene, and links to the corrected reference analysis.
Screenshots, recordings and supplied references remain outside Git.

## Verification record

The preceding fixed-shadow candidate passed all 15 focused browser cases after
the radial oracle was corrected to compare CSS pixels at DPR 1 and DPR 2. Its
17-size card geometry matrix, interrupted navigation/resize/reversal case, and
reduced-motion/graphics-failure case passed in Chromium. Layout and rendering
lifecycle did not change in the subsequent gentler-motion refinement.

The two isolated negative controls also belong to that candidate: removing its
nebular field failed the visible-background assertion, and extending darkness
into its bulge failed the fixed-inner-edge assertion. Neither mutation touched
repository files. Gentler-motion verification before the color-depth refinement:

- `proxy:check`: 81 files, zero Astro errors/warnings/hints; ESLint and Prettier
  passed. Production and Storybook builds passed.
- All five focused rendering cases passed again on the gentler final shader in
  Chromium, Firefox and WebKit (15 cases): atmosphere and fixed-shadow mantle,
  connected material groups, unbloomed resize, foreground spacing/waves, and
  thin rim/core/bottom emission/normal runtime.
- Final fixed-time radial samples at 1440 by 900, times 12 and 20, show up to
  2 pixels of brightness-threshold variation at the inner edge and up to
  10 pixels at the outer emitting boundary. The geometric shadow is unchanged;
  the small inner threshold variation includes Bloom and rasterization.

Gentler-motion logs use `/tmp/proxy-gentle-{build,storybook,check,render-tests,capture,
extra,review}.log`. Earlier geometry/lifecycle logs are
`/tmp/proxy-mantle-layout.log`. Negative controls are
`/tmp/proxy-mantle-negative-{cloud,shadow}.log`.

WebKit runs with the previously established Fedora compatibility setup and
command-local `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1`. Actual WebKit page
rendering was tested, and no system libraries were changed. Emulated phone/tablet
captures do not establish physical-device GPU performance.

## Deeper halation and strand color refinement

The normalized red-minus-green channel spread between the 10th and 90th
percentiles of observed strand crests grows from approximately 0.017 to 0.098
in matched time-20 captures. Normalizing by RGB sum separates material color
variation from a uniform brightness change. The atmosphere test now also checks
that foreground chromatic spread; the fixed shadow, cloud structure, local
mantle motion and deterministic replay checks remain.

The final color refinement passed `proxy:check` (81 files, no Astro diagnostics,
ESLint and Prettier passing), the production build, and the Storybook build.
All 15 focused rendering cases passed in Chromium, Firefox and WebKit on this
shader, including the new strand-color assertion and the retained continuity,
wave, shadow and normal-runtime checks.

An isolated browser-response mutation replaced only the foreground strand tint
with one constant gold color. It failed the chromatic-spread assertion at 0.0187
against the 0.065 minimum, confirming that the check detects loss of color
layers even with the current background and halo. This expected failure is
recorded in `/tmp/proxy-strata-negative-palette.log`; repository code was not
modified by the negative control.

The refreshed capture recipe records 14 scene/diagnostic captures, including
desktop, phone, short-phone, tablet and landscape views. Additional close views
show the rim phases and artwork hover controls. The normal-runtime recording
decodes to 640 frames at 25 fps (25.6 seconds, 1280 by 800). Desktop, phone,
tablet, and a decoded runtime frame were inspected after capture.

At review-page widths 1280 and 390, all 12 displayed images loaded, the
before/current and fixed-time controls switched correctly, the video played,
and the document had no horizontal overflow or JavaScript errors. The page also
includes a matched time-20 comparison of the preceding palette and this revision.
Capture, video and page-check metadata remain with the external review artifacts.

Final color-refinement logs use `/tmp/proxy-strata-{build,storybook,check,
render-tests,capture,extra,review}.log`. The user-selected gentler height and timing
are retained. New halation depth and color balance remain open to visual feedback.
