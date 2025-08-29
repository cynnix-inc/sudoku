import type { Digit } from '../../app/game/types';

export type Given = { row: number; col: number; value: Digit };

// Common givens builders for tests
export function makeLinearGivens(count: number, value: Digit = 1 as Digit): Given[] {
  const res: Given[] = [];
  let r = 0;
  let c = 0;
  for (let i = 0; i < count; i++) {
    res.push({ row: r, col: c, value });
    c++;
    if (c >= 9) {
      c = 0;
      r = (r + 1) % 9;
    }
  }
  return res;
}

export const EASY_SEED = 'fixture-easy';
export function seedToGivens(seed: string): Given[] {
  if (seed === EASY_SEED) return [{ row: 0, col: 0, value: 5 as Digit }];
  return [{ row: 0, col: 0, value: 1 as Digit }];
}
