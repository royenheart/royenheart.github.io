# Repository instructions

## Language and scope

- Write source code, identifiers, comments, tests, commit messages, skills, and engineering documentation in English. Communicate progress and results to the user in Chinese.
- Preserve existing authored blog posts and factual content, including official registration identifiers. Do not translate unrelated content or change user-owned work.
- Keep repository-wide agent instructions in this root file. Do not create `proxy/AGENTS.md`.

## Proxy application

- Preserve the personal navigation, central scene, music/footer layout, blue cube cloud, and golden event horizon.
- Build a static site. Read and validate repository content during the build; OpenResty must not render templates or interpret music configuration.
- Use TypeScript contracts, shared design tokens, accessible HTML controls, and the existing npm workspace lockfile.
- Use React Three Fiber for rendering lifecycle and established library primitives for animation and adaptive rendering. Keep artistic shaders separate from rendering infrastructure.
- Keep third-party music embeds isolated. Do not imply control over cross-origin playback or invent playable audio URLs.
- Keep the Jekyll blog build independent of the proxy application and development skills.

## Verification

- Component stories must cover meaningful states, phone/tablet/desktop widths, short and tall viewports, and content extremes.
- Verify geometry: containment, overlaps, clipping, alignment, and document overflow, both at rest and after resize or transitions. Screenshots supplement these assertions.
- Exercise race conditions: rapid repeated actions, interrupted transitions, delayed or stale asynchronous work, unmount, and resize during interaction.
- Test reduced motion and graphics failure. Use deterministic scene seeds and fixed time only for visual tests; also test the normal runtime.
- Report the checks actually executed. Browser emulation does not establish real-device GPU or audio performance.
- Read the relevant project skills under `.agents/skills/` when working on components, scenes, or browser verification.
