# Falling arrival and two-cohort accretion

## Brief and decision status

The user accepted F7's reverse glitch/fracture direction and requested a new cube
arrival plus alternative forward transitions. Keep the settled cube composition,
golden horizon, continuous disk/halo junction, foreground waves, and F7 unchanged.
The arrival now uses falling accumulation. The user selected live B (orbital
capture) for the Orbit forward transition. A/C remain historical comparisons.
The subsequent [continuous journey](proxy-scene-continuity.md) checks handoffs.

| ID | Story | Mechanism | Decision |
| --- | --- | --- | --- |
| L2 | `cube-arrival` | Full-sized cubes fall from above the frustum; lower destinations settle first | Pending visual feedback |
| A | `split-accretion` | Two simultaneous curved transport streams into the crown and disk | Comparison |
| B | `orbital-accretion` | Orbital winding before cubes fuse into the two contour families | Selected |
| C | `cascade-accretion` | Crown first, then progressively deeper foreground strata | Comparison |

`layered-cube-arrival` retains the earlier arrival mechanism. Existing F1 and F3
stories retain the earlier forward transformations. Historical preview videos
remain outside the repository. No production homepage replacement is included.

## What currently moves in the settled horizon

The selected limb treatment has three time-dependent systems:

- `waveSurface` displaces the foreground emitting surface with three unequal
  directions, wavelengths, and speeds. Its displacement tapers near the upper rim.
- The material's angular coordinate advances at 0.12 radians per scene second.
  It transports density detail along the ring, rather than moving every circular
  strand bodily inward or outward. Radial strand spacing remains perspective-based.
- The outer mantle has slower texture drift, shimmer and small filled protrusions;
  the black shadow boundary and thin inner rim keep their accepted contour.

These are procedural animation fields, not an evolving fluid simulation. Capture
mode freezes scene time by default; the prior forward/arrival video exports thus
froze this ambient motion while advancing the transition. Normal runtime advances
it continuously, subject to pause, reduced motion and visibility handling.

## Translate the request into controllable motion

**Falling accumulation** consists of staggered emission, downward acceleration,
depth-dependent framing, ordered settling and a small damped rebound. Cubes enter
at their existing size and material opacity, outside the camera's upper frustum.
They arrive at the authored composition rather than being scaled and faded into
place. Lower destinations settle earlier; upper airborne layers follow. The
4.8-second sequence hands back to the normal looping cube field at its exact
endpoint. It preserves the existing art-directed pile; it does not add rigid-body
contacts or claim that overlapping authored cubes are a collision simulation.

**Two-cohort accretion** separates three useful controls: attraction toward a
curve, transport along it and rotation around it. Houdini exposes the same
conceptual separation in [POP Curve Force](https://www.sidefx.com/docs/houdini/nodes/dop/popcurveforce.html);
[POP Attract](https://www.sidefx.com/docs/houdini/nodes/dop/popattract.html) describes
target steering. These are conceptual references, not imported Houdini code.

The implementation uses stable instance identities and deterministic authored
paths so that progress can be scrubbed, reversed for inspection and replayed.
It is not a gravity solver. The artistic term "accretion" describes material
being gathered and deposited, not a claim of astrophysical accuracy.

| Axis | A: split | B: orbit | C: cascade |
| --- | --- | --- | --- |
| Main path | Accelerated curved approach | Winding arc with depth before capture | Direct curved delivery in ordered waves |
| Coordination | Crown and disk overlap in time | Travel around contours before deposition | Crown precedes inner-to-outer disk |
| Intended character | Clear material cause and effect | Sustained rotation and circulation | Deliberate construction and expanding depth |
| Shared constraint | Exact ribbon destination | Exact ribbon destination | Exact ribbon destination |

All candidates run for 6.4 seconds with the same seed, camera, geometry and final
material. About 44% of instances feed the upper rim/mantle; the rest feed foreground
strands. This ratio is an initial hypothesis, not a user-approved preference.

## Material continuity

`accretion.glsl` defines a shared landing schedule in material radius and angle.
The cube vertex shader and horizon fragment shader consume that same schedule.
`ribbonPoint` gives each cube a destination on the existing nested ribbon surface,
including its current travelling wave displacement. No independent circular
substitute or additional flash covers the handoff.

Each cube keeps its identity during approach, heats locally, stretches along its
path and flattens tangentially into a short luminous segment. The matching region
of horizon emission appears during that segment's deposition interval, and the
segment disappears only after the surface has taken over. Nebula emergence remains
subordinate. At progress one the unchanged full horizon is rendered. In reverse,
F7 keeps its own direction-specific clock and bypasses all accretion transport.

## Implementation prompt

> Preserve the authored blue cube and golden horizon endpoints and the accepted F7
> reverse. Replace cube entry with full-size, staggered, accelerating falls from
> above the actual camera frustum, lower-layer accumulation and restrained settling.
> Build three forward studies: simultaneous split delivery, orbital capture and
> crown-then-strata delivery. Assign stable instances to crown and disk cohorts.
> Transport the actual cubes into the existing nested ribbon coordinates. Share
> per-destination landing times with the source surface's emission field. Heat and
> flatten each cube before handing its visible material to the surface. Preserve
> foreground waves, the continuous junction, accessible playback and reduced-motion
> endpoint behavior. Export comparable playable previews and await a user selection.

## Verification and review artifacts

The new browser tests assert top-first arrival and later bottom accumulation,
unchanged arrival/transition endpoints, distinct intermediate paths, deterministic
replay and actual time-dependent foreground movement. Existing formation/F7 tests
cover navigation races, resize, context loss and reduced motion. Browser execution
and viewport captures are emulation, not physical-device GPU performance evidence.

The review gallery and frame/video recipes live at `/tmp/proxy-accretion/final`,
served locally at `http://192.168.31.143:6008/accretion/`. Videos and screenshots are not
committed. Exported animation playback is separate from native browser frame rate.

### Executed checks

- Astro check: 100 files, no errors, warnings or hints. ESLint/Prettier passed.
- Production and standalone Storybook builds passed.
- Unit tests: 46 passed across 7 files.
- Formation and Orbit Storybook tests: 41 passed across 2 files, including accessibility.
- New raster/behavior checks: 9 passed across Chromium, Firefox and WebKit. Screenshots are
  normalized to CSS pixels so WebKit's 2x device scale samples the same regions.
- The existing formation and F7 checks: 12 passed in Chromium, including context loss,
  repeated navigation, in-flight resize, reduced motion and the 13-size entry matrix.
- Review captures cover all four studies at 390x400, 844x390, 768x1024 and 1440x900.
  Canvas dimensions, control containment and document overflow are asserted.

The initial entry-matrix run hit an 8-second readiness timeout after reloading at
1920x1080. Two isolated probes measured 8.42 and 8.60 seconds to finish preparation;
the geometry test now waits up to 15 seconds for the actual enabled controls and
asserts that WebGL, rather than fallback, became ready. The complete matrix passed
in 46.2 seconds. No application delay or arbitrary sleep was added.

A simultaneous screenshot export/Storybook/browser run also exhausted the old
8-second scene-preparation assertion in a Chromium comparison case. The affected
case passed in 21.1 seconds without competing renderers; checks do not infer shader failures
from a busy software GPU. The initial WebKit command was blocked by Fedora's
host-dependency validation. The established local opt-out allowed the actual
browser to launch and exercise WebGL; no dependency package was installed.

Logs and generation scripts are under `/tmp/proxy-accretion/` and the corresponding
`/tmp/proxy-accretion-*.log` paths. These observations do not establish real-device
frame rates or aesthetic acceptance.
