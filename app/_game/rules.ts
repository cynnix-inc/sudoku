import type { Board, Digit } from './types';

function isRowValid(board: Board, row: number, col: number, value: Digit): boolean {
  for (let c = 0; c < 9; c++) {
    if (c === col) continue;
    if (board[row]![c]!.value === value) return false;
  }
  return true;
}

function isColValid(board: Board, row: number, col: number, value: Digit): boolean {
  for (let r = 0; r < 9; r++) {
    if (r === row) continue;
    if (board[r]![col]!.value === value) return false;
  }
  return true;
}

function isBoxValid(board: Board, row: number, col: number, value: Digit): boolean {
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if (r === row && c === col) continue;
      if (board[r]![c]!.value === value) return false;
    }
  }
  return true;
}

export function isValidPlacement(board: Board, row: number, col: number, value: Digit): boolean {
  return (
    isRowValid(board, row, col, value) &&
    isColValid(board, row, col, value) &&
    isBoxValid(board, row, col, value)
  );
}

export function isSolved(board: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board[r]![c]!.value;
      if (v == null) return false;
      const original = board[r]![c]!.value;
      board[r]![c]!.value = null;
      const ok = isValidPlacement(board, r, c, v as Digit);
      board[r]![c]!.value = original;
      if (!ok) return false;
    }
  }
  return true;
}
