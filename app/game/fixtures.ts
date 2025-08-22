import type { Digit } from '../_game/types';

export type Given = { row: number; col: number; value: Digit };

export const FIXED_EASY_SEED = '482913';

// A simple, playable easy puzzle fixture. Not necessarily unique/optimal; used for slice bring-up.
// Minimal givens aligned with existing tests for the classic slice
export const fixedEasyGivens: Given[] = [
  { row: 0, col: 0, value: 5 },
  { row: 1, col: 3, value: 2 },
];

export function seedToGivens(seed: string): Given[] {
  if (seed === FIXED_EASY_SEED) return fixedEasyGivens;
  // Default minimal starter if unknown seed
  return [{ row: 0, col: 0, value: 5 }];
}
