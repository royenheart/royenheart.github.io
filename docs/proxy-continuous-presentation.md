# Continuous entry and artwork handoff

## Requested behavior

The selected `/` view chooses a scene on each reload and immediately
plays its existing arrival. There is no entry gate and no scene counter. The
selected L2, live B and F7 background mechanisms remain unchanged.

The deck appears with the artwork after arrival and remains mounted during
scene changes. Transition input is temporarily inert. It contains four cards:

1. Avatar, RoyenHeart and the current scene relationship.
2. Artist/title, progress and the configured music-platform links.
3. Elsewhere: Blog and GitHub in one card.
4. The destination and previous-scene / music play-pause / next-scene controls. Music pause never changes the background clock.

The cube scene is named `Axolotl`; its song remains Clair de Lune. Sanctuary
remains the horizon soundtrack. No unverified platform URLs are synthesized.
The previous manual-entry UI remains in historical studies only.

## Motion analysis and provisional alternatives

The previous artwork component remounted on scene changes. Both cover layers
now remain mounted and share the scene blend value. The handoff begins before
the background transition completes, so the incoming artwork is already visible
when the scene commits. Cover failures have an explicit placeholder; delayed
images resolve through a short opacity transition. Reduced motion removes
displacement, blur and the traveling reveal edge.

| Candidate | Cover material                                                                 | Identity relationship                                 | Whole-page font              |
| --------- | ------------------------------------------------------------------------------ | ----------------------------------------------------- | ---------------------------- |
| A         | Ripple refraction: a low-frequency displacement field under a translucent film | Small tilted orbit joins name and scene               | Manrope + Noto Sans SC       |
| B         | Frosted diffusion: detail dissolves under a milky veil and resolves again      | Lowercase `on` inside a compact translucent badge     | IBM Plex Sans + Noto Sans SC |
| C         | Liquid meniscus: a curved reveal front travels across the disk                 | An indented route connector links the two text levels | Fraunces + Noto Serif SC     |

The user subsequently selected IBM Plex Sans, and all three cover materials
with random selection once per accepted scene transition. The normal preview
ignores historical font/variant query parameters; Storybook retains the old
font comparisons. Explicit `cover=ripple|frost|meniscus` and
`identity=orbit|badge|route` remain available for isolated review.

The technical term **displacement mapping** describes A's refraction-like
image warp. **Diffusion/frosted glass** describes B's blurred detail and soft
surface veil. **Meniscus/wipe** describes C's liquid-shaped reveal boundary.
These are artistic image treatments, not fluid simulation. The
[SVG displacement primitive](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap)
uses a second image to offset source pixels; here that field comes from SVG
fractal noise. Filters are confined to the roughly 100–120px artwork. No
full-screen filter, extra WebGL context or postprocessing pass was added.

## Sound and response

Automatic entry makes one sound attempt once the initial scene and media are
ready. Browser rejection does not block the arrival or retain a retry loop.
The information-card transport enables sound through a normal gesture. Actual
native media playback, not requested playback, determines ring activity.

The cube fallback previously moved by only a few SVG units at 22% opacity.
Its broader moving envelope and 84% opacity now make the default response
visible. Readable audio still controls bars from samples. Unreadable media
uses `data-response=ambient` with zero measured energy. Pause, reduced motion
and hidden-page states retain rest behavior.

## Font provenance

All five Fontsource packages are pinned to **5.3.0**, with their unmodified
OFL-1.1 license texts shipped under `public/licenses/fonts/`.

- [Manrope in Google Fonts](https://github.com/google/fonts/tree/main/ofl/manrope):
  the Fontsource OFL distribution, not the separately licensed Manrope V5.
- [IBM Plex](https://github.com/IBM/plex): the open-source Plex family.
- [Fraunces](https://github.com/googlefonts/fraunces): the open-source expressive serif.
- [Noto Sans SC](https://github.com/google/fonts/tree/main/ofl/notosanssc) and
  [Noto Serif SC](https://github.com/google/fonts/tree/main/ofl/notoserifsc):
  matching Chinese coverage for the unchanged registration labels.

Latin 400/500 weights are self-hosted. `node proxy/scripts/orbit-fonts.mjs`
selects unmodified CJK font subsets covering the authored registration text,
regenerates its CSS, and copies the licenses. Run it after changing registration
labels, then format generated CSS. Only the active font faces are requested by
the browser. Every selected-page text element inherits the same candidate font
system; headings and footer no longer choose unrelated families.

## Review and verification

- Full website: `http://192.0.2.10:4321/`.
- Card detail candidates: append `?details=etch`, `?details=flow` or `?details=orbit`. See `proxy-dock-refinement.md`.
- Storybook: `Explorations / Continuous presentation`.
- Screenshots and local review artifacts: `/tmp/proxy-presentation/`.

The first verification pass passed 63 unit tests, five Storybook stories and
12 Chromium/Firefox/WebKit browser scenarios. The geometry matrix covers both
scenes, all three candidates and eight width/height combinations, including
320px, short screens, both sides of the 640px breakpoint, tablet and desktop.
Browser scenarios cover deterministic random branches, blocked autoplay,
native fixture playback with moving bars, persistent navigation, rapid scene
requests, resize and failed artwork. Artist recordings remain external; fixture
success does not promise continuous availability of NetEase outer links.

The final pass completed 19 distinct browser/performance scenarios: the 15
selected-presentation checks across Chromium, Firefox and WebKit, three selected
Storybook regression cases, and the Chromium render-budget/idle/canvas-lifetime
check. An old performance assertion still searched for the historical Previous
button; after updating it to the selected two-scene Next action, all four
background handoffs passed. A further three-engine rerun verified restored
keyboard focus after scene transitions. Final type checks, lint, formatting,
63 unit tests and five Storybook stories passed. Production and Storybook builds
and the compressed bundle check passed (about 461 KB JavaScript and 13.4 KB CSS).

On this machine, headed Chrome through Wayland reported AMD Radeon hardware
rendering. At a 1920 × 1080 viewport, the bounded drawing buffer remained
1520 × 855. Six-second steady samples measured cube GPU p95 **1.37 ms** and
horizon GPU p95 **12.07 ms**, with 3 and 11 draw calls respectively. Observed
cadence was approximately 55 frames/s, with no main-thread long tasks in those
short samples. These are local measurements, not guarantees for external
computers. The comparison widgets do not add scene canvases.

The real rendered recording covers automatic cube arrival, running cubes,
live B, running horizon, F7 and running cubes again. It recorded no page errors;
the final canvas retained 4 geometries and 13 textures, and the cover filter
returned to `none`. Screenshots cover all candidates in the same horizon view,
all four cards, a phone and tablet cube view, and the synchronized cover lab.
The complete out-of-repository review is hosted at
`http://192.0.2.10:6008/presentation/`, including MP4/WebM motion capture.
This earlier review was followed by the font and randomized-cover selections
recorded above. Connector and new card-detail preferences remain pending.
