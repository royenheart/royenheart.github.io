# Render Guard

The Render Guard is the one-line protection indicator in the selected continuous
page's footer. It sits above the registration hairline and does not report a
percentage, score, or remaining performance. Its only job is to name the
current render-protection mode.

## Guard Cant

**Guard Cant** is the shared 4° upward shear applied to every visible part of the
Render Guard: the `SYS` stamp, the `RENDER GUARD` label, the five mode marks and
the current-state plate. It is a shear, not a rotation: text baselines and the
top/bottom edges stay horizontal while vertical strokes lean by the same fixed
amount.

Do not apply a second skew or italic to the text inside a sheared badge. Keep
the cant identical across all five modes and at every viewport width.

## Modes

| Mode       | Meaning                                                                              |
| ---------- | ------------------------------------------------------------------------------------ |
| `FULL`     | Normal protection path; no higher-priority fallback is active.                       |
| `REDUCED`  | The render budget has been lowered.                                                  |
| `CRITICAL` | The minimum quality budget is active.                                                |
| `STASIS`   | Sustained severe frame overruns have latched the lowest budget; recovery is sampled. |
| `STILL`    | The live canvas has been replaced by the static poster path.                         |

`STASIS` is not a user pause, and `STILL` does not mean that the animated damage
layer has stopped. The mode is a discrete category, not a progress meter.

## Material and behavior

- The `SYS` plate is fixed brushed white-gold; it never inherits the mode color.
- The state plate uses the five state gradients, with a fine brushed texture and
  a 3px rounded edge.
- Only the current mode mark is active. State changes use a short color/edge
  transition; there is no sweep, breathing, percentage or continuous animation.
- `prefers-reduced-motion: reduce` removes the transition.
- The strip is read-only and reports one polite status message. Diagnostic
  details stay in the `Shift+D` HUD.

## Layout

- The strip is one line above the registration rule; the registration links
  remain below it.
- The `FULL` plate is 42×16px. Other mode labels expand to preserve readable
  text, while `SYS` remains 28×16px.
- Guard Cant is shared by the label, marks and both plates so the footer reads
  as one instrument rather than a stack of separate badges.

See `proxy/src/explorations/orbit/RenderGuard.tsx`,
`proxy/src/explorations/orbit/render-guard.css`, and
`proxy/src/explorations/orbit/OrbitStudy.tsx`.

## Render-health sampling

Frame health is sampled only while the page is visible, the scene is prepared
and continuous drawing is active. The controller uses delivered frame intervals
and has no device, GPU, user-agent or refresh-rate branches.

- A 2-second visible-frame warm-up absorbs fonts, material uploads and the
  entrance.
- Debt grows by `frameTime - 1000/30 ms` and is repaid every frame, so one long
  frame cannot latch a degraded state.
- Reaching 1000 ms of debt lowers quality one step (`1.00 → 0.70 → 0.45`).
- At the lowest step, debt above a 20fps budget can latch STASIS after 1500 ms;
  sustained healthy frames (under 22 ms) release it after 10 seconds.
- Hidden tabs, user pauses and reduced motion discard the current sampling
  window instead of treating the gap as a slow frame.
- Context loss, shader failure and missing required capabilities remain explicit
  STILL paths; they are not inferred from timing or device names.

Quality changes only alter the render budget and DPR. STASIS is recoverable and
the Render Guard remains a discrete status display.

See `proxy/src/explorations/orbit/render-health.ts` and
`proxy/tests/unit/render-health.test.ts`.
