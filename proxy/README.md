# Immersive personal homepage

A static Astro page with a React interface and two Three.js backgrounds: **Axolotl** and **Event horizon**. The root page opens a randomly chosen scene with its arrival animation. Falling cubes gather into the horizon's rim and disk; the reverse transition distorts the rendered scene before it fractures.

The persistent corner controls contain identity, music, Elsewhere and scene transport slots. Blog/GitHub cards remain attached to their slots. Scene-specific foil/relief artwork, IBM Plex Sans, material reflections and horizontal printed marks share the blue/gold palettes. Music pause does not stop the scene. Keyboard, touch, reduced motion, hidden-tab suspension and a still-image fallback are supported.

## Develop and verify

Requires Node 24 and npm. From the repository root:

```bash
npm ci
npm run proxy:dev
npm test
npm run proxy:storybook:test
npm run proxy:build
npm run proxy:bundle
npm run proxy:storybook:build
npm run proxy:e2e
npm run proxy:deploy:test
```

Browser checks require `npx playwright install --with-deps chromium firefox webkit`; the OpenResty deployment smoke check requires Docker. Component stories cover the shipped interface and failure states. Browser evidence is written to `proxy/test-results` and `proxy/playwright-report`. Emulation does not establish real-device performance.

Headless Linux audio checks also need a working audio output. CI starts PulseAudio with a null sink so Firefox can decode and advance native media without a physical sound card; the tests still exercise real playback and user-gesture permission.

## Content and audio

Edit `src/content/site.json`, `scene-music.json` and `scenes.json`; Zod validates content during builds. Registration identifiers and destinations remain authored content. Scene music is Clair de Lune and Sanctuary, using the selected NetEase outer links. Remote availability and browser autoplay permission are outside the site's control. User input retries blocked playback; unavailable analysis uses an ambient response while playback is active. Paused music and reduced motion stop that response. Cross-origin audio is not attached to Web Audio.

Optional authorized recordings can be configured through `audioFile` under `src/assets/audio`; missing configured files fail the build. `scripts/scene-audio.mjs` handles explicit local imports. No artist recordings are bundled. The short synthetic tone under `tests/fixtures` is only for verification.

## Build and deploy

`proxy/dist` is the only release artifact. It contains HTML, hashed assets and license notices. No preview routes, analysis documents, comparison galleries or server-side rendering are published. The blog and homepage builds remain independent. The CI workflow verifies and uploads the static artifact; it does not deploy it.

See [deployment instructions](deploy/README.md) for atomic publication, cache behavior and rollback. The JavaScript budget covers all emitted chunks, including lazy graphics: 500 KiB gzip, plus 30 KiB CSS. Adaptive resolution and instanced geometry bound rendering cost. GPU timing still requires checking target hardware.

## Attribution

Public font and Octicons licenses are in `public/licenses`. The optical lookup implementation includes its upstream attribution under `src/scenes/relativity`; generated lookup assets are reproducible with `scripts/generate-optics.mjs`. The selected horizon is an artistic procedural ribbon treatment.
