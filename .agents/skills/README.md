# Frontend skills

These project-local skills support the proxy homepage. The root `AGENTS.md` defines repository policy. Upstream advice does not override the user's scope or the established design.

| Skill | Purpose |
| --- | --- |
| frontend-design | Deliberate visual refinement; preserve this project's composition |
| vercel-react-best-practices | React rendering and bundle review; ignore Next.js-specific recipes |
| playwright-cli | Browser inspection and evidence collection; the CLI is a separate dependency |
| emil-design-eng | Motion timing, interruption, tactile controls, and touch behavior |
| proxy-frontend | Static architecture, scene ownership, and focused prompts |
| storybook-testing | Responsive geometry, races, component and browser verification |

Upstream directories are vendored at the exact revisions in `sources.lock.json`. Keep their supporting files and licenses. Review updates, refresh checksums, and commit updates explicitly; builds never fetch skills. The installer copied skills only into this repository, not the global skill directory.

## Storybook selection research

On 2026-09-28 the skills.sh search API reported approximately 905 installs for `dalestudy/skills/storybook`, 859 for `mindrally/skills/storybook`, and 189 for `yonatangross/orchestkit/storybook-testing`. GitHub reported 4 stars for dalestudy/skills and 284 for orchestkit. These figures are discovery signals, not quality guarantees.

The reviewed general Storybook skill emphasizes story authoring; the reviewed testing skill emphasizes interaction/a11y and hosted visual testing. Neither established broad adoption for the exact geometry and race requirements here. Consequently, `storybook-testing` is an original project skill informed by official Storybook/Playwright documentation, not a copied or purportedly popular upstream skill.

Sources: [skills.sh search](https://skills.sh/?q=storybook), [reviewed general skill](https://github.com/dalestudy/skills/blob/a11368b0a0596c2be86bdfd00e155515a9acf5af/skills/storybook/SKILL.md), [reviewed testing skill](https://github.com/yonatangross/orchestkit/blob/6fe0faa76556a1290d7c5b13d68bcce8549ab022/src/skills/storybook-testing/SKILL.md).

## Additional design research

For the September 2026 style exploration, the official `emilkowalski/skills` source was selected for focused motion guidance (approximately 302K installs on skills.sh and 41K GitHub stars at review time). Impeccable and UI/UX Pro Max were also reviewed as alternatives; their wider workflows overlap existing design guidance. Adoption is a dated discovery signal, not a quality guarantee.

Sources: [Emil design engineering](https://skills.sh/emilkowalski/skills/emil-design-eng), [Impeccable](https://github.com/pbakaus/impeccable), [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill).
