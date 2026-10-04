# Procedural black hole research and soundtrack decision

Status: research complete; the replacement renderer is not implemented. The existing transition studies remain provisional. The user requested improving the black hole before continuing transition work. No aesthetic direction has been selected. Work remains on `refactor/proxy-modernization`; no push or PR.

## Confirmed constraints

- Information cards use a complete trapezoid, with the top wider than the bottom. The later detail sketch clarifies that the actual artwork circle is the height reference, and must occlude the ribbon's entire right seam. The silhouette stays identical across themes; colors and internal surface styling may change.
- Preserve the current composition: a central dark region, a broad foreground disk, a bright upper arc and a warm gold palette. Keep the immersive wheel/card layout from the supplied sketch.
- Improve the black hole, outer disk and surrounding light with procedural algorithms. Keep renderer infrastructure in R3F and established postprocessing tools.
- Use C418's **Axolotl** for the cube scene and Alexei Zakharov's **Sanctuary** for the horizon scene.
- Keep the sequence fixed after the initial random scene. Native song completion or the final information card advances it; reverse traversal uses the same adjacent transition.

## Why the current image feels primitive

`proxy/src/scenes/EventHorizon.tsx` combines a backdrop, two glow planes, a core plane, a foreground disk plane and points for stars. In `materials/horizon.ts`, the glow comes from Gaussian radial bands, the core from a smooth silhouette mask, and the disk from prescribed ellipses and sine bands. These are already procedural shaders, but they do not trace light through curved spacetime.

Consequently, the arc and foreground disk are independent shapes. A thicker glow merely obscures that separation. The replacement should derive the visible surfaces from shared light paths and then add controlled optical bloom.

## Candidate algorithms

| Method | What determines the image | Suitability for this site |
| --- | --- | --- |
| Analytic rings, noise and a screen distortion field | Authored shapes and artistic approximations | Cheap, useful as a fallback; it would not resolve the current structural limitation. |
| Numerical null-geodesic integration per pixel | Integration of curved light paths, disk intersections and capture | Useful as a reference implementation. Per-pixel step counts and near-critical rays make its cost less predictable on phones. |
| Precomputed Schwarzschild beam tracing | Lookup tables for deflection and disk intersections, with live material evaluation | Recommended first implementation: preserve lensing while bounding the geometric work per pixel. |
| Kerr ray/beam tracing | Rotating spacetime, including frame dragging | A later option if spin-induced asymmetry becomes an explicit visual requirement; unnecessary complexity for the present composition. |

Eric Bruneton's [2020 method](https://arxiv.org/abs/2010.08735) uses two compact tables to compute curved-ray intersections in constant time. Its reference implementation is WebGL2. The paper uses a thin disk, not a full fluid simulation. James et al.'s [DNGR paper](https://arxiv.org/abs/1502.03808) describes beam propagation in Kerr spacetime for *Interstellar*. The recommendation above is an engineering judgment for this repository, not a claim that either reference establishes performance on the user's devices.

## Optical structure to implement

1. **Capture and shadow.** Trace rays that either escape, cross the emitting disk, or enter the horizon. The visible shadow is not the physical event-horizon radius.
2. **Lensed disk images.** Use the same disk for the direct foreground image and the arc bent above/around the shadow. Changing the viewing angle must move both consistently.
3. **Fine rings.** Preserve high bending near the critical rays. Sample and filter those regions carefully rather than painting a thick white circumference.
4. **Moving material.** Evaluate seeded, advected disk density at the traced intersection. Use radial differential rotation, coarse turbulent structures and restrained fine detail. Avoid a rigid rotating texture or uniformly spaced stripes.
5. **Light and color.** Use an emissivity/temperature profile, gravitational shift and Doppler beaming. Artistic controls may reduce the brightness asymmetry and retain gold, but those controls must remain distinct from physical parameters.
6. **Bloom.** Apply thresholded HDR bloom after shading to soften the brightest emission. Keep the dark center legible. Bloom is an optical postprocess; it does not generate the lensed disk geometry.

[NASA's anatomy guide](https://science.nasa.gov/universe/black-holes/anatomy/) distinguishes the shadow, accretion disk, photon sphere and Doppler beaming. This distinction matters here: the requested surrounding light should have a narrow lensed structure plus softer light spill, rather than one oversized halo.

For a non-rotating hole with `r_s = 1`, a useful reference equation is `u'' = 1.5 u² - u`, where `u = 1/r` and derivatives are with respect to orbital angle. The photon sphere is at `r = 1.5`, and the critical impact parameter for a distant observer is `sqrt(27)/2`. These are different quantities. The upstream [ray functions](https://ebruneton.github.io/black_hole_shader/black_hole/functions.glsl.html) also explain why ordinary linear table coordinates lose precision around critical rays and how to avoid interpolating across capture/escape discontinuities.

The reference [scene model](https://ebruneton.github.io/black_hole_shader/black_hole/model.glsl.html) separates ray tracing from disk emission, received color and background filtering. We can preserve that boundary while replacing its disk appearance with our seeded artistic density model. A disk that rotates around a Schwarzschild hole does not imply that the hole itself has Kerr spin.

## Integration proposal

The existing R3F Canvas should continue owning resize, lifetime, demand rendering and quality adaptation. Add an isolated `RelativisticHorizon` component and dedicated shaders. Keep the current horizon available as the comparison baseline until review.

- Generate and validate the optical lookup tables offline. Serve them as ordinary static assets through OpenResty. They encode ray geometry, not pre-rendered screenshots, and introduce no runtime rendering work on the server.
- Start with the reference table dimensions, `512 × 512` and `64 × 32`, with two float32 channels. Their raw payload is approximately **2.016 MiB**, calculated from those dimensions; this excludes other textures and render targets. Record a generator version and checksum. Validate sampling precision and float-texture filtering support before choosing storage formats.
- Keep the black hole center, apparent diameter, disk inclination and camera framing aligned with the existing scene. Define the conversion from world-space cube positions to black-hole units explicitly so that the eventual aggregation transition has a real spatial target.
- Use procedural sky density for the first study. The reference's large astronomical catalog preprocessing is optional and inappropriate as a prerequisite for this personal homepage.
- Use established [React Postprocessing Bloom](https://react-postprocessing.docs.pmnd.rs/effects/bloom) if that dependency is adopted. Keep HDR emission before tone mapping, then apply one final tone-mapping stage. Do not independently tone-map every layer and bloom already-clipped white.
- Make resolution scale, disk detail and bloom resolution quality controls. Keep the same optical model across desktop, tablet and phone. Treat desktop 60 fps and phone 30 fps as **targets to measure**, not verified claims. Pause rendering for hidden/reduced-motion states and keep a still fallback.

No new rendering dependency or upstream submodule was installed during this research. The upstream source was inspected at commit [`e72b3f293409893a6fa25528b29572c96fc57f57`](https://github.com/ebruneton/black_hole_shader/tree/e72b3f293409893a6fa25528b29572c96fc57f57). If code is adapted, retain its [BSD-3-Clause license](https://github.com/ebruneton/black_hole_shader/blob/e72b3f293409893a6fa25528b29572c96fc57f57/LICENSE) and notices. Relevant source files exist under `black_hole/functions.glsl`, `black_hole/model.glsl`, and `black_hole/preprocess/`.

## Ordered implementation and acceptance criteria

1. Build the static-camera optical renderer and a numerical reference. Validate capture/escape near the critical impact parameter, weak-field deflection, disk intersections and lookup error. Compare several table resolutions. Do not claim physical accuracy solely because the image resembles a black hole.
2. Recreate the current framing and gold palette. Present the old renderer and the new optical renderer at the same seed, time, size and camera. Provide a live slow orbit to demonstrate that the upper arc belongs to the disk.
3. Compare a restrained thin disk and a more textured turbulent disk, holding the optical model fixed. Provide a real playback clip and stills outside Git. Let the user choose the density and glow level.
4. Exercise 17 viewport sizes including short screens and breakpoint edges; inspect ring aliasing, disk clipping and wheel/card containment. Verify reduced motion, missing tables, unavailable WebGL and resource disposal. Measure frame-time distributions at supported quality levels on actual target hardware when available.
5. Only after the black hole is accepted, resume cube aggregation and reverse expansion. Match the transition's spatial target, palette and end state to the new renderer. Retain song-end/final-card triggers and the repeated-input gate.

## Soundtrack evidence and implementation status

The selected metadata is stored in `proxy/src/content/scene-music.json`, validated by `src/lib/music/scene-tracks.ts`, and used by default in the new Orbit study. The production Astro page has not yet adopted the immersive study. The earlier neutral synthesized tones remain explicit test fixtures; they are not presented as recordings by these artists.

| Scene | Selected recording | Verified links |
| --- | --- | --- |
| Cubes | C418 — Axolotl, approximately 5:03 | [NetEase 1317502662](https://music.163.com/song?id=1317502662), [Spotify](https://open.spotify.com/track/0DDrhNi7QBhJkSK3lL9ghD) |
| Horizon | Alexei Zakharov — Sanctuary, approximately 2:48; Spotify labels it Sanctuary (Zone 2) | [NetEase 27755434](https://music.163.com/song?id=27755434), [Spotify](https://open.spotify.com/track/2afhQXoPbDCimkgue7zUfZ) |

The publisher's [X Rebirth soundtrack listing](https://store.steampowered.com/app/258990/X_Rebirth_Soundtrack_Vol_1/) independently identifies Sanctuary as track 28. NetEase's public song-detail response supplied artist, duration and album cover metadata for both IDs. The covers are linked from the platform; no audio recording or expiring media URL was added to the repository.

Probes on 2026-10-05:

- Axolotl's public NetEase outer-media endpoint redirected to an HTML 404 page in this environment.
- Sanctuary's endpoint returned `audio/mpeg` to the command-line probe, through an expiring HTTP CDN URL. This is not a deployable permanent asset URL.
- Both tracks failed the actual Storybook browser's anonymous CORS media request. Neither selected track is claimed to play inside the page yet. Quiet entry, metadata and source links remain available; no simulated spectrum is substituted.
- Spotify's [Web Playback SDK getting-started guide](https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started) requires an authorized Premium account and lists restrictions on synchronizing recordings with visual media. A Spotify link is useful now, but the SDK is not an unrestricted anonymous audio source for this design. It does not provide a raw PCM analyser input to this component.

For full local controls, real frequency analysis and reliable native `ended` events, use a permitted same-origin/CORS-enabled recording or a supported provider integration. Keep provider adapters and short-lived playback resolution separate from build-time metadata and from OpenResty routing. This research does not establish playback availability on QQ Music or Bilibili for these two recordings.

## Continuation brief

Implement a WebGL2/R3F Schwarzschild black-hole study using validated precomputed ray tables, procedural advected disk emission and restrained HDR bloom. Preserve the present framing, warm palette, wheel/card interaction and repository-driven scene music. Retain the old horizon for comparison. Show actual still and temporal output before choosing a disk style. Verify optical invariants, viewport geometry, failure handling and measured rendering cost. Then adapt the adjacent cube-to-hole transition to the accepted renderer. Write all source, comments and engineering notes in English; report to the user in Chinese.
