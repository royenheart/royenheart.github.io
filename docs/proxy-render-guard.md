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

| Mode       | Meaning                                                         |
| ---------- | --------------------------------------------------------------- |
| `FULL`     | Normal protection path; no higher-priority fallback is active.  |
| `REDUCED`  | The render budget has been lowered.                             |
| `CRITICAL` | The minimum quality budget is active.                           |
| `STASIS`   | A sustained-performance fallback has paused continuous drawing. |
| `STILL`    | The live canvas has been replaced by the static poster path.    |

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
