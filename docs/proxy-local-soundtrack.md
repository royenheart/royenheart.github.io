# Stable scene soundtrack delivery

## Current status

Bundled playback is implemented as an optional delivery path. The current user
choice is NetEase outer playback for **Clair de Lune** and **Sanctuary**, with
ambient motion when audio analysis is unavailable. See the
[current external soundtrack implementation](proxy-external-soundtrack.md).
The earlier Axolotl source investigation below is historical.

Neither artist recording is installed locally. The optional strict command
`npm run proxy:audio:check` requires local files and therefore still fails for
both scenes; it is not an external playback health check.
The owner confirmed that no local recordings or fixed audio URLs are available
and asked about copyright and the official NetEase route. The official
[X Rebirth Soundtrack Vol. 1 listing](https://store.steampowered.com/app/258990/X_Rebirth_Soundtrack_Vol_1/)
includes Sanctuary as track 28 and supplies MP3 and FLAC downloads. The
[Axolotl artist release](https://open.spotify.com/track/0DDrhNi7QBhJkSK3lL9ghD)
identifies the requested C418 recording; it is not a downloadable native audio
URL. No purchase, platform extraction or recording redistribution was performed.

## Source permissions and official playback

Availability does not establish permission to publish a recording. The
[Egosoft music policy](https://www.egosoft.com/support/faq/faq_answer_en.php?answer=2192&version=0)
permits soundtrack use with X-series gameplay videos and related livestreams;
it does not provide an express grant for standalone audio on an unrelated
personal website. Purchasing a downloadable copy is not presented here as a
website playback license. Axolotl's authorization for this use is unverified.

Sanctuary's official NetEase page offers an external player. The standard
official iframe was tested separately at
`http://192.0.2.10:6008/netease-playback/`: after a click, its native audio
advanced to 2.807 seconds, reported a duration of 168.033 seconds, and had no
media error in Chromium. The provider's iframe emitted cross-origin parent
document errors, but they did not stop this sampled playback. This is evidence
of current availability, not a guarantee of future availability or a conclusion
about every permitted use.

The iframe controls playback and does not expose PCM samples to the site's
native analyser. It cannot replace the selected unified player while retaining
its actual audio response. No hidden iframe, provider extraction, local copy of
Sanctuary, or change to the selected interface was introduced. The standalone
review page lives outside the repository.

## Install the recordings

FFmpeg with the `libmp3lame` encoder must be available on `PATH` for importing.
It is not required at runtime or for subsequent builds.

From the repository root, supply the two local files in this order:

```sh
npm run proxy:audio:install -- /path/to/clair-de-lune.flac /path/to/sanctuary.flac
npm run proxy:audio:check
npm run proxy:build
npm run proxy:storybook:build
```

The input files may use any audio format FFmpeg can decode. The importer:

1. Decodes both files completely into MP3, stereo, 44.1 kHz, 192 kbit/s.
2. Rejects failed decoding before changing either scene's configuration.
3. Writes content-addressed files under `proxy/src/assets/audio/`.
4. Updates `audioFile` and measured `duration` in `scene-music.json`, preserving
   song identity, artwork and platform links.

File identity is supplied by the caller; decoding does not prove that a file
contains the intended artist recording. Preview both tracks after importing.
The importer does not download music, substitute fixtures, remove older files
or publish anything. It refuses to replace metadata changed while it was
decoding. It does not modify the original input files.

Include the configured files in the build workspace: either keep distributable
assets in source control, or restore them from the owner's artifact storage
before the build. Merely committing the JSON filenames without their files
will fail the next build. Local installation alone does not provision CI.

## Runtime and deployment

Platform metadata and playback are separate. `MusicTrack.source` continues to
identify the platform page. `playbackUrl` points to a bundled recording when
`audioFile` is configured. The resolver prioritizes that file and refuses a
known platform page as a playback override.

Vite emits the imported MP3s as content-hashed assets. When the selected scene
is included in the production page, Astro puts them under `/_astro/`, so the
existing publisher and OpenResty immutable-asset location
already serve and retain them across releases. No playlist logic, redirect
resolver or Lua rendering is added to OpenResty. Standalone Storybook emits
its own hashed files; rebuild it before checking the LAN preview.

Same-origin delivery removes the third-party redirect and CORS dependency.
Verify the actual HTTPS gateway returns audio MIME types and supports HTTP
Range requests for seeking. The local Python Storybook server does not support
Range requests; successful full-file local playback is not evidence that the
deployed gateway supports seeking correctly.

Both build commands check configured audio files for existence before
bundling. The strict `proxy:audio:check` additionally requires both scenes to
have a recording. Until installation, ordinary builds still support the
selected external playback route and its explicit unavailable-audio state when a provider fails.

## Validation

- Unit tests verify bundled audio takes priority while source links remain,
  missing assets fail, and filenames cannot escape the asset directory.
- Publication tests retain a previous release's audio alongside its lazy
  JavaScript chunks.
- A local importer test used generated sine fixtures, including an HTML file
  disguised as MP3. Failure left both configurations unchanged; valid inputs
  converted successfully, preserved links and produced hashed Vite assets.
- Type checking, lint and formatting passed; all 56 unit tests passed. Astro
  and standalone Storybook builds passed. Three targeted Chromium regressions
  passed for native audio response, pause, silence, reduced motion and natural
  completion using explicit test tones.
- The new MP3 startup regression first failed in WebKit with media time stuck
  at zero. After reloading media once when attaching its Web Audio source,
  12 checks passed across Chromium, Firefox and WebKit: from-zero MP3 playback,
  PCM and ring energy, pause/resume without seeking, continuous scene junctions,
  prepared-deck crossfade and unavailable destinations. The original MP3 tone
  is explicitly labelled and only imported by a test story.

These checks establish the optional bundled delivery implementation. The earlier
[actual-recording audit](proxy-audio-playback-audit.md) records the previous
CORS failure; the [external soundtrack notes](proxy-external-soundtrack.md)
describe the subsequent ordinary-media playback route. No mobile-device or physical-speaker
verification has been performed.
