import * as base from '../_game/rules';
import type { Board, Digit } from '../_game/types';

export function isValidPlacement(...args: Parameters<typeof base.isValidPlacement>): boolean {
  return base.isValidPlacement(...(args as [Board, number, number, Digit]));
}

export function isSolved(...args: Parameters<typeof base.isSolved>): boolean {
  return base.isSolved(...(args as [Board]));
}
