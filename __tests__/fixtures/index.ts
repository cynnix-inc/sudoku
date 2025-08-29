import { createEmptyBoard, getCell } from '../../app/game/state';
import type { Board, Digit } from '../../app/game/types';

export function buildSolvedBoard(): Board {
  const solved = createEmptyBoard();
  const rows: number[][] = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = rows[r]![c]! as Digit;
      const cell = getCell(solved, r, c);
      cell.value = v;
      cell.isGiven = true;
    }
  }
  return solved;
}

export function buildEmptyBoard(): Board {
  return createEmptyBoard();
}


