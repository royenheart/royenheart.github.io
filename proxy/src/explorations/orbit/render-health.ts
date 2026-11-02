/**
 * Small, deterministic render-health controller.
 *
 * It measures only delivered frame intervals while the scene is actively
 * drawing. There is no device, GPU, refresh-rate or user-agent branching.
 * A short over-budget frame is absorbed; only sustained over-budget frames
 * move quality down and, at the lowest quality, eventually latch STASIS.
 */
export const RENDER_HEALTH = {
  warmupMs: 2_000,
  frameBudgetMs: 1_000 / 30,
  debtLimitMs: 1_000,
  severeFrameMs: 1_000 / 20,
  severeDebtLimitMs: 1_500,
  healthyFrameMs: 22,
  recoveryMs: 10_000,
  maxSampleMs: 250,
} as const;

export const QUALITY_STEPS = [1, 0.7, 0.45] as const;
export type QualityStep = (typeof QUALITY_STEPS)[number];

export interface RenderHealthState {
  quality: QualityStep;
  stasis: boolean;
  debt: number;
  severeDebt: number;
  healthyMs: number;
  warmupMs: number;
}

export function createRenderHealthState(): RenderHealthState {
  return {
    quality: 1,
    stasis: false,
    debt: 0,
    severeDebt: 0,
    healthyMs: 0,
    warmupMs: 0,
  };
}

/** Clear only the sampling window, preserving the selected quality/latch. */
export function resetRenderHealthSampling(
  state: RenderHealthState,
): RenderHealthState {
  return {
    ...state,
    debt: 0,
    severeDebt: 0,
    healthyMs: 0,
    warmupMs: 0,
  };
}

function stepQuality(quality: QualityStep, direction: -1 | 1): QualityStep {
  const index = QUALITY_STEPS.indexOf(quality);
  return QUALITY_STEPS[
    Math.max(0, Math.min(QUALITY_STEPS.length - 1, index + direction))
  ]!;
}

export function stepRenderHealth(
  state: RenderHealthState,
  frameMs: number,
  active: boolean,
): RenderHealthState {
  if (!active || !Number.isFinite(frameMs) || frameMs <= 0) {
    return resetRenderHealthSampling(state);
  }

  const dt = Math.min(frameMs, RENDER_HEALTH.maxSampleMs);

  // Never measure fonts, the first material upload or the entrance as a
  // performance failure. The warm-up is measured in visible frame time.
  if (state.warmupMs < RENDER_HEALTH.warmupMs) {
    return {
      ...state,
      debt: 0,
      severeDebt: 0,
      healthyMs: 0,
      warmupMs: state.warmupMs + dt,
    };
  }

  if (state.stasis) {
    const healthyMs =
      dt < RENDER_HEALTH.healthyFrameMs ? state.healthyMs + dt : 0;
    if (healthyMs < RENDER_HEALTH.recoveryMs) {
      return { ...state, healthyMs };
    }
    return {
      ...state,
      stasis: false,
      quality: QUALITY_STEPS[QUALITY_STEPS.length - 1]!,
      debt: 0,
      severeDebt: 0,
      healthyMs: 0,
    };
  }

  if (state.quality > QUALITY_STEPS[QUALITY_STEPS.length - 1]!) {
    const debt = Math.max(0, state.debt + dt - RENDER_HEALTH.frameBudgetMs);
    if (debt >= RENDER_HEALTH.debtLimitMs) {
      return {
        ...state,
        quality: stepQuality(state.quality, 1),
        debt: 0,
        severeDebt: 0,
        healthyMs: 0,
      };
    }

    // A healthy frame also repays accumulated debt. This makes one long
    // frame harmless instead of keeping it as permanent evidence.
    const healthyMs =
      state.quality < 1 && dt < RENDER_HEALTH.healthyFrameMs
        ? state.healthyMs + dt
        : 0;
    if (state.quality < 1 && healthyMs >= RENDER_HEALTH.recoveryMs) {
      return {
        ...state,
        quality: stepQuality(state.quality, -1),
        debt: 0,
        severeDebt: 0,
        healthyMs: 0,
      };
    }
    return { ...state, debt, severeDebt: 0, healthyMs };
  }

  const severeDebt = Math.max(
    0,
    state.severeDebt + dt - RENDER_HEALTH.severeFrameMs,
  );
  if (severeDebt >= RENDER_HEALTH.severeDebtLimitMs) {
    return {
      ...state,
      stasis: true,
      debt: 0,
      severeDebt: 0,
      healthyMs: 0,
    };
  }
  return { ...state, debt: 0, severeDebt, healthyMs: 0 };
}
