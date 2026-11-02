# Card material explorations

## Scope and decision status

The user approved exploring the reference-derived directions across the complete information deck: retain the current rounded capsule shape, but vary its background, edge treatment and internal structure. The user subsequently selected the nameplate finish. It is now the continuous default; inset, seam and the previous standalone rails (`original`) remain comparisons. The follow-up clearance, material motion and Elsewhere disclosure work is documented in `proxy-nameplate-refinement.md`.

The shared rules are B/drum geometry and cylindrical travel, contour-derived text placement, IBM Plex Sans, existing gold/blue palettes, Material reflection, the four-card sequence, cover transitions, the compact dock and its one-line right-aligned registration footer. No scene shader or scene transition changed in this round.

## Candidates and implementation

| Query | Material / structure | Feedback |
| --- | --- | --- |
| `finish=inset` | A shared recessed bed, sparse SVG mesh, inner channel and 1.05px outer edge | Labels advance 3px over 240ms; bounded material reflection |
| `finish=nameplate` | Enamel inlays, oblique internal plates, doubled lining and 1.3px edge | Labels advance 3px and plates lift 2px over 300ms |
| `finish=seam` | Smoked body, broad curved low-contrast texture and 0.65px edge | Labels remain fixed; reflective seam responds over 220ms |

Each accepts `scene=cubes` or `scene=horizon` on `/preview/`. Invalid material values fall back to the selected `nameplate` finish. The card silhouette is the same existing SVG path in every variant. Internal gradient, mesh and reflection elements are clipped to it. Material differences also affect the avatar bezel, transport surfaces and platform controls; the Elsewhere links keep stable horizontal labels and fixed 44px hit areas.

Owners:

- `card-finishes.ts`: typed study IDs and parsing.
- `CardFinishLayer.tsx` and `card-finishes.css`: procedural surface layers, palette roles and interaction recipes.
- `ElsewhereSegments.tsx`: actual links, icon/label structure and stable targets.
- `CardSurface.tsx`, `RotaryDeck.tsx`, `ContinuousCards.tsx`, `OrbitStudy.tsx`: integration without replacing scene rendering.
- `CardFinishes.stories.tsx`: both palettes for every material, keyboard flow and unavailable audio state.

The contour layout refresh key includes the finish, so switching a Storybook control cannot retain the old rail inset. A keyboard bug found during verification was fixed: when a link handles a carousel navigation key, focus returns to the carousel before its previous card becomes inert. Existing Storybook visibility assertions now wait for the actual rotating card to become visible rather than assuming visibility immediately after a key event.

The reference method is documented in `proxy-elsewhere-reference-analysis.md`. The new material treatments and hover timings are original website proposals, not claims about the game's renderer or measured motion.

## Review artifacts

- LAN comparison: `http://192.0.2.10:6008/card-finishes/`
- Full live candidate: `http://192.0.2.10:4321/preview/?finish=inset&scene=horizon`
- Outside-repository source and evidence: `/tmp/proxy-card-finishes/`

The comparison page switches scene and card consistently across all three candidates, links to the live app, shows phone captures and plays one cropped motion recording at a time. It does not mount three simultaneous WebGL scenes. `recipe.json` records parameters and source ownership. The stills use 1440x900, scene time 12, stable scene seeds and simulated denied audio playback to keep the artwork rotation fixed. Motion recordings use the actual running scenes and a looping muted audio fixture; they are not external audio-availability tests.

## Original exploration verification

The results below describe the earlier three-material comparison; see the follow-up document for current verification.

- Production build and bundle budget passed: 462,909 bytes gzip JavaScript; 16,226 bytes gzip CSS.
- Type/lint/format checks and all 63 unit tests passed.
- Both selected Storybook files passed: 17 tests, including six new material stories.
- Final geometry/interaction matrix: 9 tests passed across Chromium, Firefox and WebKit. Every material and scene was checked on all four cards at 320x320, 390x844, 639x450, 640x450, 768x1024 and 1440x900, plus resize during reversal and reduced motion.
- Tests cover outline/artwork containment, control occlusion and overlap, text containment, unchanged hover target bounds, focus response, interrupted hover return and registration alignment.
- Actual headed Chrome captures report AMD Radeon hardware WebGL. Both themes and phone captures were visually inspected. Motion evidence records 36–37 additional scene frames during a 650ms music pause and no page errors.
- The review page's eight scene/card combinations load the actual images; all three MP4 recordings play. No page errors or phone document overflow were observed.

These browser measurements do not establish real-phone GPU performance. The preceding autoplay recovery fixture discrepancy remains a separate unresolved audit, as recorded in `proxy-elsewhere-reference-analysis.md`; this round does not claim cross-browser autoplay completion.
