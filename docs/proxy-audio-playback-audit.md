# Selected soundtrack playback audit

Audited on 2026-10-06 (Asia/Shanghai), against `95f60df`, using the selected
Orbit scenes served at `http://192.0.2.10:6006`. The application was not
modified for this audit. The production homepage remains a separate surface.

The user subsequently replaced Axolotl with Clair de Lune and authorized a
non-reactive fallback animation when samples are inaccessible. The
[external soundtrack update](proxy-external-soundtrack.md) supersedes this
historical failure result: ordinary native playback no longer requests CORS
analysis for NetEase. The measurements below document the previous path.

## Historical result

Neither configured recording currently plays in the selected scene. Playback
and audio response work with a usable source, but the current NetEase outer
URLs do not supply one to the browser. Fixture tests do not establish external
recording availability.

The subsequent [bundled delivery implementation](proxy-local-soundtrack.md)
accepts local recordings while preserving platform metadata. Installation of
the two actual files is still pending; it does not change this audit's result.

| Configured recording | Browser result | Source diagnosis |
| --- | --- | --- |
| C418 — Axolotl, NetEase `1317502662` | Not ready; playback unavailable; no audio response | The initial redirect lacks CORS permission. Independently following it with curl reaches `/404`, returning HTTP 200 `text/html`, not audio. |
| Alexei Zakharov — Sanctuary, NetEase `27755434` | Not ready; playback unavailable; no audio response | The initial redirect lacks CORS permission. Its expiring CDN destination does return audio, but this does not repair the browser's rejected redirect. |

All six unmodified scene checks (two scenes in Chromium, Firefox and WebKit)
returned disabled playback, `readyState = 0`, media error code 4, media time 0,
and ring energy 0. No audio context was started. Browser diagnostics explicitly
reported missing `Access-Control-Allow-Origin` on the cross-origin redirect.
No request interception or autoplay-policy override was used in these checks.

## Actual-recording diagnostic

For an isolated diagnostic, the test browser replaced only Sanctuary's source
with the freshly resolved HTTPS version of its public CDN URL. A separate HTTP
probe confirmed status 206, `audio/mpeg`, and `Access-Control-Allow-Origin: *`
before the browser test. This temporary substitution was not saved to the app.
The expiring URL is not a deployable replacement and is intentionally omitted
from this report.

After clicking Play, the test sought to a non-silent passage at 30 seconds and
sampled native media time, the application analyser, and a monitor downstream
of the application's gain node. The app's normal connection to the audio
destination remained intact.

| Engine | Sampled media time advance | Output PCM RMS range | Contour energy range | Pause |
| --- | --- | --- | --- | --- |
| Chromium | 2.261 s | 0.0830–0.2423 | 0.5128–0.9188 | Media clock stopped; contours returned to rest |
| Firefox | 2.304 s | 0.0802–0.2317 | 0.5405–0.9282 | Media clock stopped; contours returned to rest |
| WebKit | 2.247 s | 0.0822–0.2412 | 0.4706–0.9614 | Media clock stopped; contours returned to rest |

All engines decoded the recording, ran their audio contexts and produced
nonzero output samples. The four contour paths changed during playback and
settled exactly to their resting paths after pausing. This establishes native
playback and visual response under the diagnostic source substitution. It does
not establish a fix to the configured source, sustained full-track delivery,
physical speaker output or real-device performance.

The media probes used an 800 by 600 viewport with `graphics:poster` to isolate
audio from software GPU load. This preserves the native player and visualizer;
it is not a verification of simultaneous WebGL and audio performance.

## Repair boundary

A subsequent from-zero MP3 test found a separate startup issue in the local
WebKit engine: attaching a media-element source to already preloaded MP3 audio
could leave its time and energy at zero despite a playing state. The earlier
Sanctuary diagnostic explicitly sought to 30 seconds, so it did not establish
correct from-zero playback. Orbit now re-primes media once after its Web Audio
source is connected; pause/resume retains the existing source and position.
The new `bundled-audio.spec.ts` regression starts an original MP3 test tone
without seeking and checks media time, PCM energy, the visualizer and resume.

The official NetEase iframe can currently play Sanctuary independently; see
the [follow-up delivery notes](proxy-local-soundtrack.md). It does not make
the outer URL readable by the native audio analyser.

Removing `crossOrigin` is not a solution for playback plus visualization. The
[Web Audio security specification](https://www.w3.org/TR/webaudio-1.0/#MediaElementAudioSourceNode-security)
requires a media-element source node to output silence when its media is
CORS-cross-origin. The analyser needs readable audio samples.

Both tracks need stable HTTPS audio delivery: same-origin files that may be
served by the site, or a provider that permits cross-origin media analysis.
If platform resolution is retained, resolve temporary media URLs through a
separate service and handle expiry there; keep OpenResty independent of
frontend rendering and music metadata. Axolotl additionally needs an available
recording source, because its current public endpoint returns an HTML error
page even outside the browser.

No expiring CDN URL, recording download or substitute track was added to the
repository. The selected artists and songs are unchanged.

## Evidence

The following focused regression run passed all 9 cases across Chromium,
Firefox and WebKit:

```sh
PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 npm run proxy:e2e -- \
  tests/e2e/orbit.spec.ts tests/e2e/orbit-contours.spec.ts \
  --grep 'real audio|silent playback' \
  --project chromium --project firefox --project webkit
```

These tests use generated PCM fixtures through native browser audio, not the
selected artist recordings. They verify cube-ring energy, four overlapping
closed contours, pause and restart, natural completion advancing the scene,
quiet entry without an automatic scene timer, silent playback, and reduced
motion returning the visualizer to rest. They run at the configured desktop
viewport (1280 by 720). No mobile audio or physical-device test was performed.

Local diagnostic artifacts are outside version control in
`/tmp/proxy-audio-audit/`:

- `probe.mjs`, `original-tracks.json`: unmodified source checks in all engines.
- `direct-check.mjs`, `direct-diagnostic.json`: explicitly substituted real
  Sanctuary recording, PCM output and contour checks in all engines.
- HTTP response headers and small response samples for each source.
- Browser screenshots and regression logs.

Temporary source URLs in the local diagnostic files must be freshly resolved
when repeating the test. A later provider response may differ from this audit.
