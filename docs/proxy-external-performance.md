# External and mobile performance directions

Date: 2026-11-02. This record combines WAN-emulated browser measurements with
five module-specific Codex CLI audits (network/edge, bundle/entry, GPU/render,
DOM/React/audio, and perceived reliability). The public release was subsequently
updated from the old `cb28e15` artifact to `20261102ab`, with the selected
experience at `/`, the previous compact page at `/original/`, and `/preview/`
retained as a review alias. The post-deploy public checks below are a real
Cloudflare-fronted client path, not only a local simulation.

## What was actually tested

Before deployment, the public origin still served the 2026-10-07 release:
`/` was the old homepage, `/preview/` and `/preview-covers/` returned 404, and
`/optics/deflection.dat` was served as 2,097,160 bytes without compression. A
real external `/preview/` test was therefore impossible before deployment; the
documented publisher also rejected the `/preview/` artifact. The publisher was
fixed and release `20261102ab` is now live, so the public checks below replace
that gap. "External" evidence here means:

- Chrome 156 on the local host with real NVIDIA rendering (RTX 2060 via
  ANGLE/Vulkan), driven through CDP;
- 4G-shaped emulation: 10 Mbps down, 3 Mbps up, 80 ms RTT, 4× CPU throttle;
- 3G-shaped emulation: 1.6 Mbps down, 750 kbps up, 150 ms RTT, 4× CPU throttle;
- the same baseline and candidate static artifacts, with media either replaced
  by a deterministic fixture or left pointing at the real NetEase URLs.

This establishes request competition, buffering, fallback behavior, relative
ordering, and one real Cloudflare-fronted client path from this host. It does
**not** establish multi-region ISP loss, POP selection, mobile GPU/thermal
limits or provider availability.

## WAN-emulated results

| Case | Canvas ready | Arrival done | Horizon prepared | Outcome |
| --- | ---: | ---: | ---: | --- |
| 4G, fixture audio, before | 3.68 s | 8.69 s | 8.69 s (implicit) | live |
| 4G, fixture audio, after | 1.64 s | 6.69 s | 8.93 s | live |
| 3G, fixture audio, before | — | 12.40 s | — | **poster fallback** at the 10 s watchdog |
| 3G, fixture audio, after | 4.26 s | 9.27 s | 20.62 s | live cubes |
| 4G, real NetEase audio, before | 3.53 s | 8.51 s | 8.51 s (implicit) | live |
| 4G, real NetEase audio, after | 1.77 s | 6.75 s | 10.51 s | live |
| 3G, real NetEase audio, after fallback fix | 5.34 s | 10.34 s | 30.19 s | live cubes, preparation completes late |

The 3G real-audio case was the critical external finding. In the earlier build,
the cube scene was interactive for about 15 seconds, then the 15-second
preparation watchdog called the global failure handler, removed the canvas and
fell back to the poster: a healthy cube scene was discarded because a different
scene's destination assets were late. The timeout now marks preparation as slow
and keeps the live canvas; in the repeated 3G run the canvas remained `webgl`
and preparation completed at 30.19 s. Baseline still falls back at the 10 s
watchdog because it waits for horizon preparation before announcing readiness.

The NetEase audio is much larger than the fixture:

- Clair de Lune: `Content-Length: 4,906,466` bytes.
- Sanctuary: `Content-Length: 2,689,317` bytes.
- Both decks start requests with `Range: bytes=0-`; by 12 s the browser had
  buffered 207.9 s and 168.0 s respectively, i.e. roughly 6 MB of a 7.6 MB
  pair, including the whole spare track. This is third-party transfer on top of
  the same-origin route.

The same-origin cold transfer is about 3.28 MB (JS ~466 KB, optics 2.16 MB,
images/fonts/CSS), before that 7.6 MB of audio and the two remote cover images.
The network cost is therefore dominated by the optical tables and the two full
audio tracks, not by JavaScript. The live origin's uncompressed 2,097,160-byte
optics response confirms that the edge is not currently closing that gap.

## Ranked external opportunities

### 0. Deployment publisher and edge transform

The publisher previously only allowed `_astro/*`, `favicon.ico`, `index.html`
and `404.html`; the emitted artifact also contains `preview/`, `preview-covers/`,
`optics/` and `licenses/`, so the documented release path rejected it. The
allowlist is now extension-limited, rejects hidden/map/log/key/environment files,
and accepts the actual 84-file artifact (including `/original/`); release
`20261102ab` was published and verified. The OpenResty example now sends `Cache-Control: no-cache, no-transform`:
Cloudflare's Rocket Loader had been rewriting the Astro inline scripts and
deferring the client entry. The production config was updated and reloaded.

Public checks after the release:

| Check | Result |
| --- | --- |
| `/` (selected) | 200; `/preview/` remains a 200 alias |
| `/preview/` | 200, HTML Brotli ~2.4 KB, `cf-cache-status: DYNAMIC` |
| `/preview-covers/` | 200 |
| `/_astro/*.js` | 200, gzip, immutable, `cf-cache-status: HIT` |
| `/optics/deflection.dat` | 200, 2,097,160 B, identity, `no-cache` |
| Public first contentful paint (one desktop run) | **2.16 s** with normal QUIC/h2; 4.11 s with QUIC disabled |
| Public DOMContentLoaded / TTFB | 1.31 s / 0.65 s |

Before `no-transform`, the same public route in one run had FCP 49.9 s, DOM
15.3 s and first Astro script start at 30.8 s; the HTML showed Cloudflare
Rocket Loader rewriting the scripts. After the header change, the HTML no longer
contains `rocket-loader` and the entry starts immediately. This is a single
client/location measurement, not a regional percentile, but it is a causal
edge-transform defect with a clear fix.

### 1. Stop preloading both complete NetEase tracks

The two decks create `Audio` with `preload='auto'` and `load()` immediately,
before the visitor has chosen to play. On a constrained connection this is
7.6 MB competing with the 2.16 MB of optics and the first scene. It is the
largest single byte reduction available.

Recommended experiment, not yet implemented to avoid breaking the chosen
crossfade:

- request the active track only; attach/resolve the spare after first playback
  intent or after the dock is ready;
- if destination readiness is required for B/F7, start it with enough transition
  lead time and keep the current source-audible fallback;
- preserve one automatic attempt, gesture recovery, and the NetEase external
  URL policy; do not attach cross-origin media to Web Audio.

On the 3G real-audio run, the active audio and the optical tables were competing;
preparation reached 25.4 s. Even a modest reduction in concurrent media transfer
would move this case away from the watchdog boundary.

### 2. Make the preparation fallback destination-scoped

Do not call the global failure handler when only the horizon's optical assets
are late. On 3G the cubes are healthy and already visible; removing them turns a
partial success into a total fallback. A destination-scoped state should:

- keep the live cube canvas and clock;
- disable only the horizon transition, with visible/announced "preparing" status;
- offer the still-view/poster path for the destination without destroying the
  current scene;
- allow recovery when the tables eventually arrive, or a bounded retry.

The existing 15 s timeout is useful as a safety bound but not as a reason to
discard a working renderer. End-to-end tests should cover delayed, aborted and
invalid optical responses separately.

### 3. Compress and immutably cache the optical tables

The tables are 2,162,704 bytes uncompressed. Module measurements with Node
Brotli quality 11 estimate **1,496,017 bytes** (30.8% less); gzip is about
1,929,191 bytes (10.8% less). At the 1.6 Mbps profile that is roughly 3.3 s or
1.17 s of transmission respectively. Precompress at build time; do not compress
per request at quality 11.

Make the tables genuinely immutable with content-hashed filenames (or retained
version directories). The current `?v=` query is not sufficient if the fixed
path is replaced by a new release and an old tab still requests the old query.
The example OpenResty config only applies immutable caching to `/_astro/`;
`/optics/` remains `no-cache`. A bodyless 304 avoids the bytes but still costs a
validation round trip, and the old-tab/version mismatch is a correctness risk.

### 4. Emit a static first-paint shell

`preview.astro` is `client:only`; even the poster is React-created. The entry
closure is about 266 KB gzip before Canvas, and the page has no useful content
until it evaluates. A build-time static shell with the selected background,
identity/registration text and native Blog/GitHub links, replaced by the island
when it hydrates, would make the page useful while JavaScript and optics load.
Keep the random scene choice client-side; do not add a new entry gate or visible
branding.

Measure FCP, first visible identity text, layout shift and link usability with
JavaScript delayed/blocked, and independently measure canvas/arrival readiness.
This is a perceived-performance change, not a JS byte reduction.

### 5. Subset the registration font shards

The four Noto Sans SC shards total 130,168 bytes, while the authored registration
labels need only the seven Chinese glyphs (`公号备安浙甘网`). An exact-glyph subset
was measured at about 4,112 bytes, a 126 KB reduction. Preserve IBM Plex Sans and
the authored identifiers; validate coverage after content changes. This is a
build/CSS change, not a font-declaration-only cleanup.

### 6. Remove UI-only validation and Three.js from the entry closure

`lib/content/load` runs Zod validation in the browser, and
`useOrbitSoundtrack` imports `MathUtils` from Three for a scalar smoothstep,
putting `three.core` (about 100 KB gzip) in the UI closure before Canvas. Build
validation should stay; serialize validated data for the browser, and replace
the scalar helper with a local function. Estimated 10–20 KB of validation
removal plus deferral of the Three closure; confirm with module attribution
rather than chunk names.

### 7. Split the selected horizon payload at a real boundary

`OrbitCanvas` statically imports the relativistic horizon, glitch surface,
radiation and scene-impulse modules. `prepareHorizon` delays preparation but not
the code request; the selected-horizon shader/glitch modules remain in the
cube-first entry chunk. A genuinely loadable selected-horizon module could defer
roughly 15–35 KB gzip on cube-only visits; the exact figure needs a chunk
membership report. Keep the settled horizon presentation available, not only
the reverse transition, and preserve one canvas and the material clock.

### 8. Add only targeted preload hints

The HTML has stylesheet links but no module/font hints. The entry graph is
discovered in several serial rounds; targeted `modulepreload` for the small UI
entry (not every scene/historical study) may remove one or two rounds at
80–150 ms RTT. Zero bytes are saved, and competition can reverse the gain.
Generate hashes from the build; do not hard-code chunk names. Re-test the
cube-first optics deferral, because a blanket preload would undo it.

### 9. Fix font/preload and third-party connection setup separately

A single preconnect to `p2.music.126.net` can overlap DNS/TCP/TLS for both cover
images; the audio redirect hosts vary, so do not hard-code them. These are small
wins compared with the 7.6 MB audio transfer, but cheap to test.

### 10. GPU and DOM work for mobile, not for this desktop

The RTX 2060 run is 60 fps at DPR 1 for both scenes, so it provides no evidence
of mobile pressure. The module audits rank:

- adaptive quality recovery with hysteresis instead of permanent 0.45 DPR;
- a deflection-only limb shader and an F7 zero-blur/zero-infection fast path;
- removing the trailing full-resolution EffectComposer copy, then bloom target
  resolution;
- one-channel/lower-resolution optical tables after limb specialization;
- F7 target allocation/resize/recovery, about 9.9 MiB RGBA16F at 1440 × 900;
- isolating `timeupdate` into a progress leaf and memoizing card surfaces;
- ring cadence/path strategy and cover-filter transition cost;
- contour measurement read/write batching.

These need real Android/iOS/integrated-GPU runs and GPU timer queries; they are
not established by desktop SwiftShader or RTX numbers.

## Measurement boundary

The WAN numbers are still single runs on a desktop GPU with local origin and a
simulated link. They are enough to show:

- the cube readiness gain survives a 4G-shaped link and a hardware GPU;
- the real NetEase pair is roughly 7.6 MB and is eagerly preloaded;
- 3G forces the baseline into poster fallback; the candidate keeps live cubes
  while destination preparation is late, and no longer destroys them;
- optics and audio dominate external bytes.

They are not enough to claim an external p75, an edge/CDN improvement, mobile
battery savings, or provider reliability. Those require a deployed URL and
field/synthetic runs from outside the LAN. The publisher allowlist must be fixed
first; then collect at minimum cold/warm 4G and 3G traces, cache headers,
compression negotiation, third-party redirect outcomes, and RUM milestones
(first shell, first scene frame, arrival, dock, destination ready, fallback).
