import { createEmptyBoard, getCell } from '../../app/game/state';
import { isSolved, isValidPlacement } from '../../app/game/rules';
import type { Digit } from '../../app/game/types';

describe('game/rules', () => {
  it('isValidPlacement rejects duplicates in row, column, and box', () => {
    const board = createEmptyBoard();
    getCell(board, 0, 0).value = 5 as Digit;
    expect(isValidPlacement(board, 0, 1, 5 as Digit)).toBe(false); // row
    getCell(board, 1, 1).value = 6 as Digit;
    expect(isValidPlacement(board, 2, 1, 6 as Digit)).toBe(false); // column
    getCell(board, 1, 0).value = 7 as Digit;
    expect(isValidPlacement(board, 2, 2, 7 as Digit)).toBe(false); // box
    expect(isValidPlacement(board, 4, 4, 7 as Digit)).toBe(true);
  });

  it('isSolved returns true for a known solution and false otherwise', () => {
    const board = createEmptyBoard();
    // not solved initially
    expect(isSolved(board)).toBe(false);
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
        getCell(board, r, c).value = rows[r]![c]! as Digit;
      }
    }
    expect(isSolved(board)).toBe(true);
  });
});
