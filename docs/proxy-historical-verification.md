# Historical visual verification

The selected public page is covered by a small, deterministic browser suite.
Earlier scene, transition, optics and card-layout studies remain documented as
technical and art-direction reports; they are no longer part of the gated CI
journey.

## Why the studies were retired from CI

The historical matrix ran 31 Playwright specs across Chromium, Firefox and
WebKit. Many specs looped 17 viewport sizes, both scenes, several animation
phases and canvas screenshot comparisons. With `fullyParallel: false` and two CI
workers, this could exceed the 25-minute job budget and made unrelated failures
block release checks.

Historical experiments still belong in the repository as reports and
Storybook studies. Gating CI on every past experiment made the selected page's
checks slow and fragile without improving its release confidence.

## Retired executable specs

The following Playwright specs were retired as executable CI tests. Their
mechanisms, measurements and decisions are recorded in the linked reports and
in Storybook:

| Retired spec                   | Report / study                                                  |
| ------------------------------ | --------------------------------------------------------------- |
| `accretion.spec.ts`            | [accretion studies](./proxy-accretion-studies.md)               |
| `glitch-transition.spec.ts`    | [glitch transition](./proxy-glitch-transition.md)               |
| `horizon-atmosphere.spec.ts`   | [relativistic horizon](./proxy-relativistic-horizon.md)         |
| `horizon-flow.spec.ts`         | [continuous ribbon](./proxy-continuous-ribbon.md)               |
| `horizon-waves.spec.ts`        | [perspective waves](./proxy-perspective-waves.md)               |
| `limb-controls.spec.ts`        | [limb refinement](./proxy-limb-refinement.md)                   |
| `mirror-rupture.spec.ts`       | [collapse motion language](./proxy-collapse-motion-language.md) |
| `orbit-contours.spec.ts`       | [audio contours](./proxy-audio-contours.md)                     |
| `orbit-ribbon.spec.ts`         | [orbit study](./proxy-orbit-study.md)                           |
| `orbit.spec.ts`                | [orbit study](./proxy-orbit-study.md)                           |
| `relativistic-horizon.spec.ts` | [scene continuity](./proxy-scene-continuity.md)                 |
| `rotary-directions.spec.ts`    | [continuous presentation](./proxy-continuous-presentation.md)   |
| `scene-formation.spec.ts`      | [scene formation](./proxy-scene-formation.md)                   |
| `spatial-radiation.spec.ts`    | [wave and strand analysis](./proxy-wave-strand-analysis.md)     |
| `tests/perf/orbit.spec.ts`     | [preview performance](./proxy-preview-performance.md)           |

Older reports may still cite those spec paths as reproduction commands. Those
references describe the experiment at the time it was run; they are not current
CI commands.

## Current coverage

CI runs Chromium only, and only the selected-page smoke path:

```sh
npx playwright test \
  tests/e2e/selected.spec.ts \
  tests/e2e/software-fallback.spec.ts \
  --project=chromium
```

The broader selected-page suite (`card-finishes`, `continuous-presentation`,
`slot-cards`, `elsewhere-*`, audio and scene continuity) remains available
locally:

```sh
npm run proxy:e2e -- --project=chromium
```

Storybook retains the visual studies. Storybook interaction tests remain a local
check because their browser timing is not stable enough for the release gate.
