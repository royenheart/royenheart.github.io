---
name: storybook-testing
description: Build and verify React Storybook stories with viewport matrices, DOM geometry assertions, accessibility, and asynchronous interaction race tests. Use for stories, responsive component changes, layout regressions, and frontend interaction testing in this repository.
---

# Storybook testing

Read the root `AGENTS.md`. Keep the current page composition and both visual scenes.

Use `storybook/test`, typed CSF stories, `@storybook/addon-vitest`, and the existing Playwright integration. Read [the test protocol](references/protocol.md) for geometry, races, and evidence. Use the project's locked versions; do not install a competing runner or assume a hosted visual-testing service is available.

## Repository entry points

- Stories: `proxy/src/**/*.stories.tsx`.
- Shared dimensions: `proxy/tests/support/viewports.ts`.
- Browser geometry calculations: `proxy/tests/support/layout.ts`.
- Whole-page and built Storybook matrix: `proxy/tests/e2e/`.
- Rendering lifetime and frame samples: `proxy/tests/perf/`.
- `npm run proxy:storybook:test`: stories plus accessibility in a real Chromium browser.
- `npm run proxy:storybook:build`: build the standalone component explorer.
- `npm run proxy:build && npm run proxy:storybook:build`, then `npm run proxy:e2e`: test production artifacts and actual Storybook iframes in Chromium, Firefox, and WebKit.

## Required decisions

1. Identify meaningful state transitions and container constraints before adding stories. Cover content extremes and failed dependencies, not just decorative variants.
2. Exercise both width and height. Include short/tall screens, portrait/landscape, and values immediately around layout breakpoints. Storybook viewport toolbar settings alone do not prove tests ran at those sizes; use explicit browser viewport changes.
3. Assert computed geometry before interaction and after resize/transition. Check containment, collision, clipping, aligned edges, and document overflow. Exclude intentional overlays explicitly instead of disabling all geometry checks.
4. Cover rapid repeated input, interruption, delayed completion, stale work, and unmount. Use controlled promises or routes for ordering; do not rely on arbitrary sleeps to manufacture races.
5. Keep network mocks scoped. Cross-origin iframe load is not evidence that music is playing. Test the containing UI and fallback separately from external service availability.
6. Capture and inspect screenshots for representative device classes and both scenes. Use fixed seeds/time for scene comparison, and also verify normal rendering and pause behavior.
7. Report executed browsers, dimensions, pass/failure counts, and artifact paths. Explicitly separate emulation from real-device evidence.

Do not update visual baselines merely to make a failing test pass. Diagnose whether the component, test oracle, or intended design changed first.
