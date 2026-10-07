export const rotaryDesigns = {
  tangent: { step: 16 },
  drum: { step: 55 },
  orbit: { step: 52 },
} as const;

export type RotaryDesign = keyof typeof rotaryDesigns;
export type DockDesign = 'classic' | RotaryDesign;
