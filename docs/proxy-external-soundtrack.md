# NetEase playback and ambient audio fallback

## Selected behavior

The cubes scene uses the existing **Clair de Lune**, NetEase song `30953026`.
The horizon scene keeps **Sanctuary**, NetEase song `27755434`.
`proxy/src/content/scene-music.json` remains the build-time source of metadata,
cover URLs and platform links. Neither recording is bundled or rehosted.

Both use NetEase's public `song/media/outer/url` endpoint in the existing native
player. The browser follows the provider redirect on each load; the application
does not save an expiring CDN URL. There is no iframe or OpenResty playlist logic.
This is current external availability, not a guarantee of provider uptime.

## Playback and analysis are independent capabilities

The resolver marks NetEase playback as `analysis: 'unavailable'`. Orbit leaves
`crossOrigin` unset and never connects that media to a `MediaElementAudioSourceNode`.
Ordinary media playback can work even when the redirect does not permit CORS
analysis. Connecting unreadable media to Web Audio would instead produce silence,
as specified by the [Web Audio security rules](https://www.w3.org/TR/webaudio-1.0/#MediaElementAudioSourceNode-security).

The two preloaded decks retain native play, pause, progress and ended events.
A WebKit regression exposed an intermittent rewind state with only the current
frame decoded (`readyState = 2`). Requiring future data before calling `play()`
skipped the return handoff. The player now lets `play()` wait for additional data
once metadata is known. The initial load deadline is cleared on the first
`canplay`, so a later seek cannot be misreported as an initial load failure.
Their handoff uses `HTMLMediaElement.volume` when analysis is unavailable;
readable local/CORS sources retain the existing Web Audio gain path. No fake
progress timer is used. A failed media load still reports unavailable sound.

The artwork ring has three observable response modes:

- `audio`: real readable samples drive the bars or overlapping closed contours.
- `ambient`: actual playback is active, but analysis is missing, suspended or
  throws. Gentle deterministic waves animate the scene's existing ring shape.
- `rest`: paused, buffering, quiet entry, hidden document or reduced motion.

Ambient motion is decorative, not a measured spectrum. Its `data-energy` remains
zero; `data-response` distinguishes it from audio response. Readable silent PCM
stays still and is never classified as an analysis failure. Reading can recover
from a transient failure without reloading the song. Missing Web Audio support
also leaves ordinary playback usable. Reduced motion still takes precedence.

## Review and verification

Use these current LAN views:

- Cubes and falling arrival: `http://192.0.2.10:6006/continuity-live.html?view=cubes`
- Horizon and Sanctuary: `http://192.0.2.10:6006/continuity-live.html?view=horizon`
- Full visual journey: `http://192.0.2.10:6008/journey/`

The `sound` view remains an explicitly synthetic test fixture. The selected
cubes/horizon views use the real NetEase songs.

`ambient-audio.spec.ts` verifies bars and contours, pause/resume, reduced motion,
analysis failure/recovery, missing Web Audio, external-deck volume handoff,
natural completion and paused navigation. It checks geometry at 390×400,
768×1024 and 1440×900. Existing MP3 and contour regressions retain coverage for
real PCM, readable silence and from-zero WebKit playback.

External service probes are separate from deterministic fixture tests and are
stored outside the repository under `/tmp/proxy-audio-audit/`. They exercise
ordinary media on the LAN origin and a controlled HTTPS document, then the
actual selected Orbit scenes without replacing requests or media URLs. Sampling
media time and native state does not establish physical speaker output or
mobile-device audio policy. Real-device volume/autoplay behavior still depends
on the browser; no autoplay-policy override is used in these checks.

## Recorded results (2026-10-06)

Both actual selected tracks advanced from zero, paused and resumed in every
engine below. No Web Audio source was attached; no media error was observed.
The ring's geometry changed while its mode was `ambient` and measured energy
remained zero. These are short playback samples, not full-track longevity tests.

| Engine | Clair de Lune sampled time | Sanctuary sampled time | Pause/resume and ambient motion |
| --- | --- | --- | --- |
| Chromium | 1.796 s | 1.787 s | Passed |
| Firefox | 1.783 s | 1.822 s | Passed |
| Webkit | 1.884 s | 1.870 s | Passed |

The real WebGL journey also passed a Chromium handoff check. At blend 0.775,
both actual songs were advancing with native volumes 0.421 and 0.907. After
completion, Sanctuary continued and Clair de Lune paused and rewound. No page
errors were recorded. Six screenshots and geometry checks cover both scenes
at 1280×800, 768×1024 and 390×844 in
`/tmp/proxy-audio-audit/current/`.

- `npm test`: type checking, lint and formatting passed; 57 unit tests passed.
- Astro and standalone Storybook builds passed.
- Four focused Storybook interaction/accessibility cases passed.
- The 21 focused browser regressions passed across Chromium, Firefox and WebKit.
- The WebKit rewind regression additionally passed three consecutive runs.
  A separate check used the actual NetEase tracks, sought Sanctuary near its
  end, and verified that the real ended event returned to Clair de Lune with
  advancing media, a playing control and ambient motion. This accelerated
  completion check does not establish uninterrupted full-track delivery.

Key evidence files: `selected-external.json`, `native-external-secure.json`,
`selected-live.json`, `selected-natural-completion.json`,
`rewind-regression.log`, `ambient-check.log`, `ambient-stories.log` and
`ambient-e2e-final.log`, all under `/tmp/proxy-audio-audit/`.
