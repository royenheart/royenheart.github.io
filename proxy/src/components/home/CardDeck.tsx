import type { ReactNode } from 'react';
export interface OrbitCard {
  id: string;
  label: string;
  content: ReactNode;
  boundCards?: readonly string[];
}
