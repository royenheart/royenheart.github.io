# Personal homepage

The VPC homepage is an Astro static site with React islands, TypeScript, Tailwind CSS, Motion, and React Three Fiber. It preserves the sidebar/navigation, central artwork, bottom music/registration bar, blue cube cloud, and golden event horizon. OpenResty serves the build output or proxies to an internal static server. It never reads application data or renders templates.

## Development

Use Node 24 LTS and run commands from the repository root:

```bash
npm ci
npm run proxy:dev
```

Astro prints the local URL (normally `http://localhost:4321`). `npm run proxy:storybook` opens the component development server at `http://localhost:6006`. Run `npm run proxy:build && npm run proxy:preview` to inspect the production output. Preview is for local verification only.

The Jekyll blog remains independent. One root `package-lock.json` locks the npm workspace. Do not create another lockfile inside `proxy`.

## Content

Edit the following files, commit, build, and publish the new artifact:

- `src/content/site.json`: title, profile links, and official registration links.
- `src/content/playlist.json`: track IDs, labels, and the default selection.
- `src/content/scenes.json`: default scene, deterministic seed, particle budget, and palettes.

`src/lib/content/schema.ts` validates these files during the build. Invalid links, arbitrary HTML, duplicate track IDs, missing defaults, or invalid graphics settings fail the build. React escapes labels; raw iframe markup is not accepted.

A playlist entry uses this structure:

```json
{
  "id": "first-light",
  "kind": "netease-embed",
  "songId": "30953026",
  "label": "A little music for the journey"
}
```

The existing NetEase song is preserved. Multiple entries expose a native track selector. An empty playlist uses `{"defaultTrackId": null, "tracks": []}`. The player loads only after Listen is pressed, with autoplay disabled. Small screens use the external song link. Cross-origin playback remains under NetEase's control; a loaded iframe does not establish that audio is playing. The advisory timeout and external link remain available when the provider fails.

## Architecture

`src/pages/index.astro` validates data and emits the static `HomeFrame`. Music and scene controls hydrate independently. `SceneExperience` owns scene selection, loading, reduced motion, pause, and fallback. `SceneCanvas` loads separately and delegates the render loop, resizing, instancing, and resource disposal to R3F/Three.js. Motion handles DOM transitions; Drei's performance monitor lowers quality when needed. There is no custom cross-device renderer or second Canvas2D engine.

The existing artistic shaders remain in `src/scenes/materials`. The scene posters are fallback captures of the original artwork; live rendering uses actual geometry and shaders. The optimized avatar derives from the original `avatar.svg`, retained as source material.

Useful diagnostic URLs:

- `/?capture=1`: deterministic scene time for screenshots; no continuous loop.
- `/?graphics=poster`: static scene artwork for layout/failure isolation.

Neither diagnostic mode is evidence of normal animation performance. Test `/` as well.

See [design constraints](DESIGN.md), [architecture decisions](../docs/proxy-refactor-plan.md), [verification record](../docs/proxy-verification.md), [deployment](deploy/README.md), and [agent skills](../.agents/skills/README.md).

## Verification

```bash
npm run skills:check
npm test
npx playwright install chromium firefox webkit
npm run proxy:storybook:test
npm run proxy:build
npm run proxy:bundle
npm run proxy:deploy:test # Requires Docker
npm run proxy:storybook:build
npm run proxy:e2e
```

On supported Linux CI, use `npx playwright install --with-deps chromium firefox webkit`. Local operating systems may need additional browser libraries. The Playwright config starts the production preview and a static Storybook server. In local development it can reuse servers on ports 4321 and 6006; stop stale servers after rebuilding when necessary. CI requires clean ports.

`npm test` runs type checking, lint, formatting, content-contract tests, and temporary-directory deployment tests. `proxy:storybook:test` runs component interactions and accessibility checks in Chromium. `proxy:e2e` runs the actual production page and built Storybook iframe in Chromium, Firefox, and WebKit. The GPU/performance smoke is explicitly Chromium-only; other engines verify layout, input, and failure behavior. `npm run proxy:perf` runs only the rendering lifetime/frame-sampling scenario.

The 13-size matrix covers phone, tablet, desktop, portrait/landscape, short height, and both sides of the 720px breakpoint. Geometry assertions calculate containment, intersection, edge alignment, overflow, and canvas size. A deliberate broken-layout test verifies that the oracle detects defects. Race tests cover repeated scene changes, resize during interaction, deferred graphics loading/unmount, pending music embeds, stale timeouts, and close/reopen. Text enlargement, keyboard access, reduced motion, no JavaScript, unavailable graphics, and context loss have dedicated checks.

Browser evidence is written to `proxy/test-results/` and `proxy/playwright-report/`. Frame intervals describe the browser scheduler, not GPU completion. Software-rendered CI results do not establish real iOS/Android device performance. Screenshots are review artifacts; this migration does not claim cross-platform pixel-identical image baselines.

The compressed budget covers **all emitted JavaScript**, including the dynamically imported graphics chunk, and all CSS. It does not hide the graphics download under a shell-only budget. The graphics import starts after hydration, so it is still part of the first normal visit. `proxy:bundle` records individual and total gzip sizes and fails above 500 KiB JavaScript or 30 KiB CSS.

## Release

The independent `Proxy checks and static artifact` workflow uploads `proxy-static-<commit>` after verification. Deploy only its contents (`proxy/dist`), using the [atomic publication helper and OpenResty examples](deploy/README.md). Node is a build/deployment-helper dependency; the public server needs no Node, Python, Lua template engine, playlist API, or database.

The legacy TOML/template/Python preview path and source-regex tests have been removed. Previous Git revisions and deployed release directories remain the rollback source. No production deployment is performed by the verification workflow.
