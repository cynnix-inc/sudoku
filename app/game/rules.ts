import * as RULES from '../_game/rules';

export const isValidPlacement = (
  board: import('../_game/types').Board,
  row: number,
  col: number,
  value: import('../_game/types').Digit,
) => RULES.isValidPlacement(board, row, col, value);

export const isSolved = (board: import('../_game/types').Board) => RULES.isSolved(board);
