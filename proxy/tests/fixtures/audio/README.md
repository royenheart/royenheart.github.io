# Native MP3 fixture

`steady-tone.mp3` is an original, generated 220 Hz sine wave, not an artist
recording. It exercises MP3 preloading, first playback and pause/resume through
the native player. Browser tests serve it over HTTP with byte-range support;
cross-origin playback remains detached from Web Audio.

Regenerate from the repository root with FFmpeg:

```sh
ffmpeg -v error -f lavfi -i 'sine=frequency=220:duration=12' \
  -map_metadata -1 -codec:a libmp3lame -b:a 192k -ar 44100 -ac 2 \
  proxy/tests/fixtures/audio/steady-tone.mp3
```

The fixture is only served by the browser test helper. It is never bundled with
the website or substituted for the selected soundtrack outside tests.
