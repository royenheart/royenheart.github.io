# F7: spreading corruption and late mirror fracture

## Direction and scope

The user rejected the entire radiation-strand treatment, including the longer F6
strands. F7 replaces the selected Orbit reverse transition. It begins with a local
color anomaly, expands through the image, progressively distorts and blurs the
horizon, disk and nebula, and only then fractures the scene into mirror panes.
F3–F6 remain historical comparisons, not selected effects. The settled scenes,
forward collapse, arrivals, deck and music behavior are preserved. The user
accepted F7 as workable and requested a showcase of the unchanged forward
collapse and both scene arrivals.

## Visual analysis

This is an art-directed digital breakdown, not a physical black-hole explosion.
The useful vocabulary describes independent observable operations:

| Operation | Technical description | Intended visual evidence |
| --- | --- | --- |
| Local anomalous color | Localized color-channel remapping and chromatic misregistration | A small cyan/iris contamination appears on the left upper rim while distant gold remains intact |
| Expansion | Irregular arrival field with a monotonically increasing threshold | The same affected region grows into the foreground and sky rather than random independent patches blinking |
| Loss of structural stability | Coherent domain displacement plus horizontal block tearing | The black silhouette bends, ring paths buckle, and nebula features move together |
| Loss of focus | Anisotropic multi-tap source filtering | Existing ring detail smears along a diagonal axis; the same scene is measurably softer than the no-blur diagnostic |
| Final fracture | Seeded convex panes retaining source coordinates, with independent tilt and separation | Distorted scene fragments move apart and reveal the destination between them |

The anomaly carries color, not added brightness. Gold progressively becomes
cyan, muted green and iris through channel remapping. Large coherent bending
provides continuity; sparse horizontal shears make the disturbance read as
Glitch. The broad warp moves smoothly with sequence progress. The few block
changes give it a digital cadence without a full-screen random-flash loop.

A simple blur along the horizontal axis was too aligned with the foreground
rings. The candidate uses a diagonal filter axis to break their sharpness. The
black shadow may deform during this transition; its accepted fixed shape at
rest and its audio-response behavior remain unchanged.

## Research and procedural choices

- Three.js [DigitalGlitch source](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/shaders/DigitalGlitch.js)
  demonstrates disturbed UVs, displaced scanline regions and separate color
  channel samples. F7 uses those general operations, with original shader code,
  an explicit progress clock and a growing local field rather than GlitchPass's
  random full-screen triggering.
- React Postprocessing's [ChromaticAberration](https://react-postprocessing.docs.pmnd.rs/effects/chromatic-aberration)
  documents channel separation. A global effect alone would not provide the
  requested localized growth, so color displacement is gated by the same field
  as geometry distortion.
- SideFX's [destruction overview](https://www.sidefx.com/docs/houdini/destruction/overview.html)
  describes Voronoi cell partitioning and independent pieces. F7 reuses the
  existing seeded scene-bearing pane mesh. This is a stylized mirror fracture,
  not a rigid-body glass simulation or a drawn crack overlay.

No new rendering framework or dependency is introduced. Three.js owns render
targets, R3F owns scheduling and resizing, Drei owns the offscreen target's
lifecycle, and Motion owns the master transition clock.

## Timeline

Reverse duration: **6.4 seconds**. The master progress is linear; each operation
has its own smooth envelope.

| Progress | Approximate time | Action |
| --- | --- | --- |
| 0.01–0.16 | 0.06–1.02 s | Local color contamination and restrained channel offset |
| 0.16–0.60 | 1.02–3.84 s | Contamination grows; coherent displacement and sparse block tearing intensify |
| 0.29–0.66 | 1.86–4.22 s | Diagonal smearing rises; disk, sky and shadow lose their original shape |
| 0.64–1.00 | 4.10–6.40 s | A remapped fracture clock activates seam light, then pane tilt, separation and destination recovery |

These are overlapping stages, not four crossfades. Pane movement begins only
after the shared fracture clock's own tension onset. Cube recovery uses that
same clock, so it cannot become visible through premature gaps in the first
part of the sequence. A reduced-motion transition jumps directly to its
settled destination.

## Rendering mechanism

`GlitchSurface.tsx` renders the live procedural source into one HDR target only
while the reverse transition is active. It contains the actual nebula, disk,
limb and black shadow. The settled scene and the forward collapse render
directly through their previous material.

`glitchFragment.glsl` samples that source through an irregular, seeded arrival
field, coherent low-frequency displacement and horizontal block shear. The
same affected region drives channel remapping, RGB separation and a bounded
nine-tap directional blur. Computing the source once avoids evaluating the
expensive procedural horizon nine times per pixel. Out-of-bounds samples return
empty space instead of stretching the texture's border across the image.

The HDR source target is capped at one device pixel per CSS pixel and follows
adaptive DPR below that. Bloom and tone mapping run once after the transformed
panes. The F7 path never mounts `RadiationField`; it has no filament geometry,
strand displacement map or reverse impulse emission. The forward compression
impulse remains available.

The alternate presentation shader is compiled before readiness is announced, in
the same linear HDR output configuration used by the composer. Late completion
after unmount is ignored. The target is library-managed. Shader materials, borrowed geometry ownership,
offscreen scene references, renderer target/clear state and unmount cleanup are
explicit. The seeded field uses sequence progress rather than accumulated
random steps; fixed-time scrubbing is reproducible.

## Studies and acceptance criteria

- `glitch-and-fracture`: complete selected sequence and destination.
- `glitch-surface`: actual distorted source and fracture, without destination
  cubes or extra impulse emission.
- `glitch-field`: unfractured grayscale arrival field for coverage inspection.
- `glitch-sharp`: identical displacement without the blur kernel, for a
  controlled sharpness comparison.

Inspect early, spreading, fully distorted, cracking and separated phases, then
play the native sequence. Verify that the early region is local and grows,
source features and the void move, blur changes source detail, and the destination
remains occluded before fracture. Verify both resting endpoints against the
previous sequence, deterministic rescrubbing, resize during motion, interruption,
unmount, context loss and reduced motion. Use phone, tablet, desktop and short
viewports, and retain native playback in addition to fixed-time screenshots.

## Reusable direction prompt

> Create a staged digital breakdown of the existing golden horizon. Begin with
> a small cyan/iris color anomaly on the upper-left rim. Expand one irregular,
> coherent corruption field through the disk and nebula. Displace the actual
> source image: bend the black silhouette, buckle the ring paths, and shear a
> few horizontal regions. Increase diagonal source smearing as corruption
> spreads. Keep the image connected during this buildup. In the final third,
> reveal mirror seams and separate tilted panes that still carry the distorted
> scene, exposing the blue cube world. Use one deterministic sequence clock.
> Preserve both resting scenes, forward collapse, arrival animations and
> reduced-motion completion. Add no radiation strands or bright burst overlay.

## Verification

Executed checks on the candidate:

- `npm run proxy:check`: 98 files, zero diagnostics; lint and formatting pass.
- `npm run proxy:test`: 46 tests across 7 files pass.
- Focused Storybook run of `FormationStudy` and `OrbitStudy`, with file
  parallelism disabled: 37 tests pass, including reverse playback, pause,
  unmount, accessibility and existing Orbit interactions.
- F7 corruption/source tests and the F7 mirror lifecycle cases: 15 tests pass
  across Chromium, Firefox and WebKit. They verify growing coverage, silhouette
  and sky changes, loss of foreground detail against an otherwise identical
  no-blur diagnostic, late destination exposure, deterministic replay, unchanged
  resting endpoints, resize/resource stability and reduced motion.
- Selected Orbit navigation, context loss during arrival and reduced-motion
  checks: 3 Chromium cases pass. Repeated input and in-flight phone/tablet resize
  retain one canvas and settled resource counts.
- Production and standalone Storybook builds pass.
- The review gallery decodes all images, plays all three videos without media
  errors, loads and removes the live diagnostic iframe, and has no horizontal
  overflow at 1440×900 or 390×844 in Chromium.

The resize case initially exceeded its 30-second total test budget. Trace
inspection and a separate native reproduction showed stable geometry/texture
counts, including all four dimensions. The case now has 45 seconds for software
WebGL; its resource assertions are unchanged.

Review artifacts are outside Git at `/tmp/proxy-glitch/final`, served locally at
`http://127.0.0.1:6008/glitch/`. They include 29 fixed-time screenshots, full and
source-only native recordings, and a 20-fps timeline export made from 129 actual
WebGL frames at 640×400. The timeline has a 6.4-second transition with short
endpoint holds; ambient scene time is fixed at 12 seconds. It is not an
interpolated video, a Remotion render, or a runtime performance measurement.

The native recordings were inspected across their actual video timeline, not
just the wall time recorded by the automation. Their loading lead-in is excluded
by the gallery's media start offsets. A separate native RAF trace reached the
settled destination in approximately 6.74 seconds on software WebGL, with a
roughly 1.02-second maximum sampled frame gap. Precompilation prepares the
alternate shader, but does not make this software renderer a smooth-device
performance benchmark. Each of the three videos was decoded at 12 distributed
frames for inspection.

Phone 390×844, tablet 768×1024, short desktop 1280×400 and desktop 1440×900
captures were inspected. Browser emulation and software WebGL do not establish
real phone or tablet GPU performance. The user accepted the F7 direction as workable.
