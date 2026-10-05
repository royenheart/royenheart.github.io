# Repository instructions

## Language and scope

- Write source code, identifiers, comments, tests, commit messages, skills, and engineering documentation in English. Communicate progress and results to the user in Chinese.
- Preserve existing authored blog posts and factual content, including official registration identifiers. Do not translate unrelated content or change user-owned work.
- Keep repository-wide agent instructions in this root file. Do not create `proxy/AGENTS.md`.

## Proxy application

- Preserve the personal navigation, central scene, music/footer layout, blue cube cloud, and golden event horizon.
- The user-approved immersive exploration may move navigation and music into a corner wheel/card deck over a full-screen scene. Preserve previous layouts as separate studies until a direction is selected.
- Keep the original trapezoid study as a baseline. The latest exploration explicitly permits softer contours, different wheel/card proportions, top-tangent alignment, and circular 3D card travel. Preserve the compact corner composition and cover the card attachment behind the artwork at rest. The user selected B (Velvet drum): a rounded capsule with cylindrical card travel. Use it as the current Orbit default, retain A/C as comparisons, and preserve the contour-derived text insets and both scene textures. Verify each candidate's intended geometry and accessible controls rather than enforcing the superseded exact trapezoid outline on every variant.
- The selected rotary deck has no visible up/down buttons: use card-scoped scrolling, touch gestures and accessible keyboard navigation. Reveal playback inside the song artwork on hover or keyboard focus; support touch without a detached corner button. The latest horizon study uses a thin upper limb glow and a procedural foreground disk reaching the bottom edge; retain the prior optical treatment for comparison.
- The user accepted the upper limb glow. Preserve it while refining the foreground: keep the ring filaments sparser and join the disk to the lower rim without a dark gap.
- The immersive exploration has no visible branding in its upper-left corner. Keep the scene name available to assistive technology.
- Build a static site. Read and validate repository content during the build; OpenResty must not render templates or interpret music configuration.
- Use TypeScript contracts, shared design tokens, accessible HTML controls, and the existing npm workspace lockfile.
- Use React Three Fiber for rendering lifecycle and established library primitives for animation and adaptive rendering. Keep artistic shaders separate from rendering infrastructure.
- Keep music source metadata separate from playback capabilities. Use the unified player for new music work; do not add new iframe players. Do not imply control over cross-origin playback or invent playable audio URLs.
- Keep the Jekyll blog build independent of the proxy application and development skills.

## Verification

- Component stories must cover meaningful states, phone/tablet/desktop widths, short and tall viewports, and content extremes.
- Verify geometry: containment, overlaps, clipping, alignment, and document overflow, both at rest and after resize or transitions. Screenshots supplement these assertions.
- Exercise race conditions: rapid repeated actions, interrupted transitions, delayed or stale asynchronous work, unmount, and resize during interaction.
- Test reduced motion and graphics failure. Use deterministic scene seeds and fixed time only for visual tests; also test the normal runtime.
- Report the checks actually executed. Browser emulation does not establish real-device GPU or audio performance.
- Read the relevant project skills under `.agents/skills/` when working on components, scenes, or browser verification.
