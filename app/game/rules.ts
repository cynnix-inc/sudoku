import type { Board, Digit } from './types';
import { getCell } from './state';

export function isSolved(board: Board): boolean {
  // All cells filled and each row/col/box contains digits 1..9 with no repeats
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!getCell(board, r, c).value) return false;
    }
  }
  const setEquals = (arr: number[]) => arr.slice().sort().join(',') === '1,2,3,4,5,6,7,8,9';
  for (let r = 0; r < 9; r++) {
    const row = board[r];
    if (!row) return false;
    if (!setEquals(row.map((c) => c.value as number))) return false;
  }
  for (let c = 0; c < 9; c++) {
    const col: number[] = [];
    for (let r = 0; r < 9; r++) col.push(getCell(board, r, c).value as number);
    if (!setEquals(col)) return false;
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const box: number[] = [];
      for (let r = br * 3; r < br * 3 + 3; r++) {
        for (let c = bc * 3; c < bc * 3 + 3; c++) {
          box.push(getCell(board, r, c).value as number);
        }
      }
      if (!setEquals(box)) return false;
    }
  }
  return true;
}

export function isValidPlacement(board: Board, row: number, col: number, value: Digit): boolean {
  // Row
  for (let c = 0; c < 9; c++) {
    if (c !== col && getCell(board, row, c).value === value) return false;
  }
  // Column
  for (let r = 0; r < 9; r++) {
    if (r !== row && getCell(board, r, col).value === value) return false;
  }
  // Box
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if (!(r === row && c === col) && getCell(board, r, c).value === value) return false;
    }
  }
  return true;
}
