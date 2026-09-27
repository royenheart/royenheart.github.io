# Proxy modernization: decisions and implementation

Research date: 2026-09-28. This English document supersedes the initial proposal and records the user's approved constraints and the implemented direction.

## Requirements

- Keep the VPC and OpenResty entry point, the current page composition, and both scenes.
- Edit content in repository files and publish a new build to update it.
- Remove OpenResty's participation in content parsing and frontend rendering.
- Use typed frontend source, established animation/rendering tools, responsive layout, component development, and browser verification.
- Add useful, reviewed agent skills under `.agents/skills`; repository policy belongs in root `AGENTS.md`, never `proxy/AGENTS.md`.
- Author code, comments, tests, prompts, and engineering documentation in English; report to the user in Chinese. Preserve unrelated authored posts and factual registration identifiers.

## Starting point

The old `proxy/template.html` combined layout, styles, music markup, raw Three.js rendering, custom GPU/Canvas fallback infrastructure, and animation logic in approximately 1,867 lines. The Lua example parsed `config.toml`, replaced template strings, and injected an entire music iframe. A Python preview duplicated that rendering path. Three.js and GSAP came from remote CDNs. The music configuration represented one NetEase embed, not a music service or an audio catalog API.

The existing visuals are valuable and do not require a redesign. The useful boundary change is to move content validation and HTML generation to the build, separate UI state from rendering infrastructure, and make the preserved composition executable in tests.

## Architecture choice

| Candidate | Fit | Decision |
| --- | --- | --- |
| Astro static generation + React islands | Static navigation/metadata, a small number of interactive areas, self-contained output, mature React graphics/test ecosystem | Selected |
| React + Vite SPA | Simple build, same React libraries, but static HTML and metadata require additional decisions | Viable alternative; less useful for this mostly static shell |
| Next.js static export | Rich ecosystem; static output is possible, but server features are unnecessary here and export restrictions add conceptual overhead | Reserve for future server-backed requirements |
| SvelteKit static adapter | Strong compiler and transitions, good static hosting | Viable; would trade away direct R3F integration and the chosen React component tooling |
| Nuxt static generation | Mature Vue ecosystem and prerendering | Viable; no existing Vue investment or application-server requirement to justify a switch |

The selected runtime has no production application server. The build reads JSON, validates with Zod, and emits HTML/assets. A static server can run directly at the OpenResty edge or behind it. The second form preserves literal reverse proxy deployment when required.

```text
Repository JSON + TypeScript + scene assets
                    |
        validation + Astro static build
                    |
       versioned HTML and hashed assets
                    |
      OpenResty / internal static server
                    |
Browser: static shell + music island + scene island
```

SSR on every request, a database, a playlist backend, and a CMS are unnecessary for the agreed publication model. They can be added later if content must change independently of releases.

## Selected tools and compatibility

| Concern | Selection | Boundary |
| --- | --- | --- |
| Language | TypeScript, strict checking | Types for content, state, component props, scene contracts, tests |
| Static framework | Astro 7 + React 19 integration | HTML generation and independently hydrated islands |
| Styling | Tailwind CSS 4, shared CSS custom properties, Grid/Flex/container queries | One responsive layout, not three device-specific apps |
| DOM animation | Motion 13 | Enter transitions and button feedback |
| 3D rendering | Three.js + React Three Fiber 9 + Drei 10 | Canvas lifecycle, frame hooks, instancing, adaptation |
| Content validation | Zod 4 | Build-time boundary; browser URL helpers do not import the validator |
| Component development | Storybook 10.6 | Typed stories, interaction states, accessibility |
| Unit/component runner | Vitest 4.1 + Storybook Vitest addon | A compatible peer-dependency combination, not a blind latest-major upgrade |
| End-to-end | Playwright 1.61 | Chromium, Firefox, WebKit, viewport matrix, geometry, race ordering |
| Quality | Astro check, ESLint, Prettier | Workspace-scoped checking; one committed root lockfile |

TypeScript improves compile-time contracts; it is still compiled to JavaScript for browsers. No language or GPU library guarantees uniform hardware performance. R3F/Drei remove the need to own a second renderer, while the existing shaders continue to express the artwork. WebGPU, native mobile wrappers, React Native, and a new audio engine are not needed for this browser homepage.

## Content and music

`site.json`, `playlist.json`, and `scenes.json` replace TOML. Schemas reject unsafe protocols, arbitrary iframe HTML, duplicate IDs, missing defaults, and invalid rendering budgets. React escapes text. The existing song ID and official registration content survive migration.

Music state belongs to the music island. Selection determines a typed provider URL; opening mounts a keyed player with its own advisory timer; changing tracks or closing unmounts that instance. A narrow viewport uses an external link instead of squeezing or invisibly loading the fixed-size provider UI. The iframe never autoplays. No code claims to observe cross-origin playback success or extracts undocumented playable URLs.

## Scene migration

The blue cube cloud keeps instanced geometry and the original vertex/fragment shader behavior. The golden event horizon keeps its layered backdrop, rim, dark core, foreground bands, and stars. R3F owns their lifecycle and Three.js retains the artwork-specific math.

One scene island owns selection, pause, visibility, reduced motion, dynamic loading, and fallback. This prevents disconnected controls and independent renderer instances. Deferred loading respects unmount; late completion receives current scene state. One Canvas survives scene switches. Old scene resources are released. Failure displays an appropriate original-art poster while controls/navigation remain usable.

Motion provides a short scene transition; a user or OS pause stops continuous rendering. Drei lowers DPR and cube density under sustained pressure. This is an adaptive policy, not a promise of equal GPU throughput on phones and desktops.

## Responsive verification

Storybook is the component explorer, not the entire test strategy. Its Vitest addon runs interaction and accessibility checks in a real browser. Playwright separately opens the actual built Storybook iframe and production page so toolbar viewport settings cannot masquerade as executed coverage.

The shared matrix is 320x568, 390x844, 430x932, 390x400, 844x390, 719x600, 720x600, 721x600, 768x1024, 1024x768, 1280x400, 1440x900, and 1920x1080. It covers short height, portrait/landscape, and the exact responsive boundary.

The geometry oracle calculates rectangle containment, positive intersections, neighboring edge alignment, document overflow, control height, and canvas/container agreement with a 1.5px rounding tolerance. A negative-control test deliberately breaks containment/overflow to verify detection. Intentional scene overlays are handled separately from forbidden footer collisions.

Race coverage includes repeated scene switches, interruption and resize, a graphics import resolving after a selection change or unmount, a track change during an outstanding embed request, stale timeout isolation, and close/reopen. Keyboard access, enlarged text, reduced motion, disabled JavaScript, chunk failure, missing WebGL, and context loss have dedicated cases.

Deterministic scene screenshots supplement geometry assertions. Normal-runtime tests collect RAF intervals, resource counts, and paused frame submissions. They do not claim GPU timing, a before/after speedup, real-device coverage, or pixel-identical rendering across operating systems. Real mobile device checks and verification through the deployed HTTPS gateway remain release-environment checks.

## Skills and prompts

The repository vendors selected skills at exact Git commits, preserves supporting files/licenses, and records file checksums in `sources.lock.json`. `npm run skills:check` detects unexpected changes. Builds do not download instructions. A submodule is allowed but unnecessary for these small, reviewed subsets.

- Anthropic `frontend-design`: visual refinement with the preservation constraint taking precedence.
- Vercel `react-best-practices`: relevant React rendering/bundle advice; skip Next.js-only recipes.
- Microsoft `playwright-cli`: browser investigation and evidence workflows.
- Local `proxy-frontend`: static architecture and focused implementation/review prompts.
- Local `storybook-testing`: viewport matrices, geometry calculations, races, accessibility, and honest evidence reporting.

Storybook-specific candidates were searched and their adoption signals recorded in `.agents/skills/README.md`. The reviewed candidates did not establish broad usage for this exact geometry/race workflow, so the project uses an original skill grounded in official Storybook and Playwright documentation. It is explicitly not advertised as a popular upstream skill. Root `AGENTS.md` contains the English-language and architecture rules; detailed procedures remain in focused skill references.

## Publication and cache behavior

A release contains only `proxy/dist`. The publisher checks artifact structure and direct asset references, refuses an existing release ID or immutable-asset collision, writes a manifest, retains old hashed assets, and atomically switches `current`. The preceding release is retained as `previous`. Publishers must be serialized.

OpenResty serves `/_astro/` from the shared immutable asset directory, uses revalidation for HTML/non-hashed files, and returns a real 404 for missing assets. This prevents a prior page from losing its lazy graphics chunk during a release. Rollback switches a symlink; content updates require no Lua code, playlist configuration, or OpenResty reload. Host configuration still requires the actual certificates, routes, MIME types, and cache settings.

The independent GitHub workflow checks the workspace and uploads a verified static artifact. It does not deploy to an unspecified VPC. The Jekyll workflow ignores proxy-only changes, and Jekyll explicitly excludes the app, docs, and agent instructions.

## Implementation sequence and evidence

1. Captured the legacy desktop composition and both scenes; retained original avatar source and art-derived fallback assets.
2. Established the npm workspace, compatible typed toolchain, repo-local skills, and root instructions.
3. Migrated validated content and static layout; separated the music and scene islands.
4. Ported the original shaders and geometry into library-owned rendering; added pause/adaptation/failure handling.
5. Added component, browser matrix, race, accessibility, and resource-lifetime checks.
6. Added compressed asset budgets, the publication helper, OpenResty examples, independent CI, and English documentation; removed the duplicate legacy path.

See `proxy/README.md` for executable commands, [the verification record](proxy-verification.md) for executed results, and `proxy/test-results/` for local evidence. A local passing build is distinct from an executed GitHub Actions run, a production deployment, or a true-device performance measurement.

## Primary references

- [Astro islands](https://docs.astro.build/en/concepts/islands/) and [deployment](https://docs.astro.build/en/guides/deploy/).
- [Astro React integration](https://docs.astro.build/en/guides/integrations-guide/react/).
- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports).
- [SvelteKit static adapter](https://svelte.dev/docs/kit/adapter-static) and [Nuxt deployment](https://nuxt.com/docs/getting-started/deployment).
- [Tailwind responsive design](https://tailwindcss.com/docs/responsive-design).
- [Motion accessibility](https://motion.dev/docs/react-accessibility).
- [R3F scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) and [Drei PerformanceMonitor](https://drei.docs.pmnd.rs/performances/performance-monitor).
- [Storybook Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon), [interaction tests](https://storybook.js.org/docs/writing-tests/interaction-testing), and [accessibility](https://storybook.js.org/docs/writing-tests/accessibility-testing).
- [Playwright emulation](https://playwright.dev/docs/emulation) and [clock](https://playwright.dev/docs/clock).
- [NGINX core module](https://nginx.org/en/docs/http/ngx_http_core_module.html) and [headers module](https://nginx.org/en/docs/http/ngx_http_headers_module.html).

Exact resolved package versions are recorded in the root lockfile. Skill commits, source links, reviewed adoption signals, licenses, and checksums are recorded beside the installed skills.
