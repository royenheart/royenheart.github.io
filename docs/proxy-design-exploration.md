# Proxy design exploration

Research date: 2026-09-28. Branch: `refactor/proxy-modernization`. This is a local design review; no push, PR or deployment has been performed.

## Review scope

Four executable Storybook directions preserve the personal navigation, central canvas, music/footer composition, and both original Three.js scenes. The directions share `DesignConcept`, `SceneExperience` and `UnifiedPlayer`; differences live in scoped material, spacing, type and interaction rules. They are source-rendered interfaces, not screenshot backgrounds.

The production Astro page still uses the previous `HomeFrame` and music panel. The new player and visual directions are review prototypes. Selecting a direction precedes promotion into the production shell and completion of provider adapters. Prototype fonts and preview audio are isolated from the production page's import graph.

## Reference research

| Reference | Useful principle | Application here |
| --- | --- | --- |
| [HOVERSTAT.ES](https://www.hoverstat.es/) | Personal sites can build navigation around a distinctive interaction instead of a generic landing-page template | Keep the site as a small place to explore; avoid adding marketing sections |
| [Godly](https://godly.design/) | Strong motion and material direction can organize sparse content | Explore a focused chrome treatment around the existing scene |
| [SiteInspire](https://www.siteinspire.com/) | Typography and whitespace can establish character with very few components | Quiet Gallery uses a serif hierarchy and open margins |
| [Awwwards music and sound](https://www.awwwards.com/websites/music-sound/) | Music controls can be part of a site's visual identity | A persistent transport replaces the prototype's need for an embedded popup |
| [Teenage Engineering OP-1](https://teenage.engineering/products/op-1) | A readable instrument groups transport, feedback and physical controls | Orbital Console groups its transport into a recessed instrument panel |
| [Lusion](https://lusion.co/) | A studio reference for scene-led interactive presentation | Research reference only; its local reference capture remained at the loading screen, so it is not claimed as a completed visual inspection |

These references inform principles, not copied layouts or assets. No screenshots from reference sites are committed.

## Four design systems

| Direction | Color and material | Type and geometry | Interaction |
| --- | --- | --- | --- |
| A — Orbital Console | Midnight blue, steel rules, cyan signals; amber accent for the horizon | Space Grotesk, squared artwork, recessed transport, precision frame | Short feedback, a small press scale and scene crossfade |
| B — Liquid Chrome | Pearl blue, soft highlights, cobalt controls | Space Grotesk, circular portrait/cover, curved scene frame, floating player | Interruptible Motion springs for pointer-following portrait, lifted navigation, soft press |
| C — Quiet Gallery | Cool paper, slate ink, fine rules | Instrument Serif headings, flat square artwork, generous scene margins | Restrained link feedback and quiet scene transitions |
| D — Pop Circuit | Ice blue, navy ink, yellow and pink accents | Heavy Grotesk, outline type, offset shadows, rectangular transport | Physical shadow collapse and offset navigation presses |

All directions have 44px transport targets, visible keyboard focus, pointer-gated hover, a reduced-motion path and a responsive top navigation on phones. Scene controls and renderer ownership stay in the existing R3F island. There is no parallel GPU engine or bespoke animation loop.

## Skills

The existing pinned Anthropic frontend-design skill handles composition, and the local Storybook skill handles geometry and asynchronous races. Vercel's React guidance applies to state ownership and cleanup. The additional [Emil design engineering skill](https://github.com/emilkowalski/skills/tree/d16ebe60d09a5ba2afcb7054ede9d0a10c9f6128/skills/emil-design-eng) was installed under `.agents/skills/emil-design-eng`, with its MIT license, exact revision and per-file checksums.

Discovery snapshots: approximately 302K installs on [skills.sh](https://skills.sh/emilkowalski/skills/emil-design-eng), and approximately 41K GitHub stars for its upstream repository. These are dated popularity signals. [Impeccable](https://github.com/pbakaus/impeccable) and [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) were also researched; their broader workflows overlap the existing composition skill, so they were not installed. The new skill can be discovered by subsequent agent sessions; its instructions were read directly for this exploration.

## Music capability boundary

`parseMusicSource` normalizes NetEase, QQ Music, Bilibili, Spotify track links/URIs, HTTPS audio URLs and root-relative local audio. `MusicTrack` owns visible metadata; `TrackResolver` owns asynchronous metadata/playback resolution. A supported link is not proof of available audio. Aborted or stale resolutions cannot replace the current track, and a keyed native audio element stops the previous source.

| Source | Evidence or implementation in this review | Remaining integration |
| --- | --- | --- |
| NetEase | Retrieved actual song 30953026 metadata/cover; the public media route returned audio. A real Chromium click reached `readyState=4`, duration 306.574s and advancing playback time | General metadata refresh command and per-track availability, timeout and cache handling |
| QQ Music | Link/MID normalization and explicit unavailable-connection state | Metadata and playback adapter, tested against selected public tracks |
| Bilibili | BV/page normalization; a public metadata request was verified during research | CID/part selection, metadata refresh, runtime handling of expiring playback URLs and request headers |
| Direct/local | Native audio transport; original synthetic WAV preview fixtures exercise real playback | Repository content schema migration and explicit metadata for files without suitable embedded tags |
| Spotify | Track URL/URI normalization; public oEmbed metadata was verified during research; inline connection-required state | Official OAuth/SDK connection, account/browser eligibility, branding and actual playback tests |

The first preview item is the user's existing NetEase song. The other two items are clearly labeled original synthetic preview tones, generated for transport testing; they are not substituted recordings from QQ, Bilibili or Spotify. Artwork provenance and metadata are recorded in `proxy/src/explorations/source-evidence.json`. The NetEase cover is an attributed metadata thumbnail for review, not an original project illustration.

For the next integration, retain the repository-managed playlist as the source of truth. Refresh stable metadata at authoring/build time and commit it with the content. Keep expiring playback resolution in a separate application service behind OpenResty. OpenResty remains responsible for static files and routing, never provider parsing or UI state. Use a bounded provider/track API instead of an arbitrary URL-fetching proxy; do not bake expiring media URLs into the static build.

[Meting-API](https://github.com/metowolf/Meting-API) and its `@meting/core` are candidates for NetEase/QQ adapters, not a complete five-provider solution. The old npm `meting` package is a frontend component and should not be confused with the current server core. Bilibili needs a separate adapter. Spotify must use the [official Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk) and its [getting-started requirements](https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started); an oEmbed response supplies metadata and embed markup, not a reusable native full-track audio URL.

## Review artifacts and reproduction

Start `npm run proxy:storybook`, then run from the repository root:

```bash
node proxy/scripts/capture-concepts.mjs /tmp/proxy-style-previews
```

The script refuses a repository-local output directory. It writes 24 real Chromium screenshots: four directions × three device classes × two scenes, plus comparison boards and a JSON rendering-evidence manifest. Every scene capture waits for the WebGL renderer, the current scene, fonts and the canvas fade. The fixed scene seed/time is for comparison; normal motion remains available in Storybook.

Review sizes are 1440×900, 390×844 and 768×1024. Geometry tests cover the project's broader 13-size matrix from 320×568 to 1920×1080, including 719/720/721 widths and short-height cases. The oracle checks region containment, intersections, aligned edges, document overflow, player/control bounds and canvas dimensions; a deliberate collision confirms it detects broken layout.

Interaction coverage includes native playback, seeking, end-of-track advance, rapid play/pause, previous/next, muting, delayed out-of-order metadata, abort on track change, completion after unmount, repeated scene switching, resize, reduced motion and keyboard transport. External service availability is a separate manual observation, not a deterministic CI claim. Browser emulation and a software renderer do not establish physical-device GPU/audio performance.

## Executed verification

- Type checking, ESLint and formatting: passed, without diagnostics.
- Unit tests: 29 passed, including source normalization and invalid-input cases.
- Storybook Chromium interaction/accessibility tests: 28 passed across five story files.
- Design browser suite: 24 passed across Chromium, Firefox and WebKit. Each direction exercised all 13 viewport sizes; long metadata and connection-required states also exercised that matrix.
- Static Astro and Storybook builds: passed. Production gzip budget: 358,805 bytes of JavaScript and 4,052 bytes of CSS.
- Pinned skill verification: 92 files from four upstream skills passed checksum verification.
- Visual inspection: all four desktop/phone directions and both scenes across the desktop/phone/tablet comparison captures. Four short browser recordings additionally demonstrate hover, transport and scene switching; videos are silent and include initial loading.

The matrix found a tablet-landscape sidebar overflow, which was fixed by using the compact sidebar at shorter heights. Native audio testing found a Firefox decoder error when seeking too close to a WAV file's exact end; seeking now leaves a 250ms tail for the decoder and allows the real `ended` event to advance the queue. The range stays disabled until the media has a seekable range; later drag requests queue behind an in-flight seek, with the last intent winning. This fixes Firefox ignoring requests before its decoder accepts seeking; three consecutive focused reproductions passed after the fix. A batched full-queue wrap also required a resolution revision independent of track ID; a dedicated story verifies the same track remains playable after six rapid next actions.

On this Fedora host, WebKit uses locally supplied runtime libraries and command-scoped `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1`, as in the earlier verification report. No browser test was skipped in the design suite. CI continues to use the supported Ubuntu environment. Detailed local logs are under `/tmp/proxy-style-*.log`, and review media remain under `/tmp/proxy-style-previews/`.
