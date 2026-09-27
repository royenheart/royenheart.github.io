---
name: proxy-frontend
description: Modify the static Astro personal homepage, typed content, React islands, or its two Three.js scenes while preserving the established design and OpenResty deployment boundary.
---

# Proxy frontend

Read the root `AGENTS.md`, `proxy/DESIGN.md`, and `proxy/README.md`.

- Content is validated by `proxy/src/lib/content/schema.ts` and loaded during static generation. Never add Lua rendering or a playlist server for repository-managed content.
- The outer `HomeFrame` renders static HTML; music and scene controls are independent React islands. Keep shared scene controls and canvas state within one island.
- R3F owns the frame loop, sizing, and GPU resource lifecycle. Artistic shaders live in `proxy/src/scenes/materials`; preserve their visual role without duplicating a Canvas fallback engine.
- Use local state for interactions and refs for per-frame values. Clean up asynchronous work and listeners on unmount. Preserve controls when graphics fail.
- Apply Vercel's React skill only where relevant. This is Astro, not Next.js: do not add `next/dynamic`, server actions, RSC caches, or a Vercel deployment dependency.
- Use the `storybook-testing` skill when changing interactive UI or responsive layout.

Use [the focused prompts](references/prompts.md) as task templates when useful. Run the checks documented in the README and report actual evidence.
