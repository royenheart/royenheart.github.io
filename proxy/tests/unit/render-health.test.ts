import { describe, expect, it } from 'vitest';
import {
  createRenderHealthState,
  stepRenderHealth,
  type RenderHealthState,
} from '../../src/explorations/orbit/render-health';

function drive(
  state: RenderHealthState,
  frameMs: number,
  frames: number,
): RenderHealthState {
  for (let index = 0; index < frames; index += 1) {
    state = stepRenderHealth(state, frameMs, true);
  }
  return state;
}

function warmed(): RenderHealthState {
  return drive(createRenderHealthState(), 1000 / 120, 240);
}

describe('render health budget', () => {
  for (const hz of [60, 90, 120, 144]) {
    it(`keeps a stable ${hz}Hz stream at full quality`, () => {
      const state = drive(warmed(), 1000 / hz, hz * 15);
      expect(state.quality).toBe(1);
      expect(state.stasis).toBe(false);
      expect(state.debt).toBe(0);
    });
  }

  it('absorbs one long frame without changing quality', () => {
    const state = drive(warmed(), 400, 1);
    expect(state.quality).toBe(1);
    expect(state.stasis).toBe(false);
    const recovered = drive(state, 1000 / 60, 120);
    expect(recovered.quality).toBe(1);
    expect(recovered.debt).toBe(0);
  });

  it('keeps a stable 30fps stream at full quality', () => {
    const state = drive(warmed(), 1000 / 30, 60 * 20);
    expect(state.quality).toBe(1);
    expect(state.stasis).toBe(false);
  });

  it('drops quality on sustained 20fps and only latches stasis at the floor', () => {
    const state = drive(warmed(), 50, 60 * 10);
    expect(state.quality).toBe(0.45);
    expect(state.stasis).toBe(false);
    const protectedState = drive(state, 55, 60 * 20);
    expect(protectedState.stasis).toBe(true);
  });

  it('recovers from stasis after sustained healthy frames', () => {
    const stasis = drive(drive(warmed(), 55, 60 * 35), 55, 60);
    expect(stasis.stasis).toBe(true);
    const healthy = drive(stasis, 1000 / 120, 120 * 25);
    expect(healthy.stasis).toBe(false);
  });

  it('discards samples while inactive and after a long pause', () => {
    const state = stepRenderHealth(warmed(), 5_000, false);
    expect(state.warmupMs).toBe(0);
    expect(state.debt).toBe(0);
    expect(state.stasis).toBe(false);
    const afterResume = drive(state, 1000 / 120, 120 * 3);
    expect(afterResume.quality).toBe(1);
    expect(afterResume.stasis).toBe(false);
  });

  it('does not treat the warm-up as a performance failure', () => {
    const state = drive(createRenderHealthState(), 1_000, 3);
    expect(state.warmupMs).toBe(750);
    expect(state.quality).toBe(1);
    expect(state.stasis).toBe(false);
  });
});
