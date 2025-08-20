import { initializeGame, applyAction, createEmptyBoard, getCell } from '../../app/game/state';
import { isSolved } from '../../app/game/rules';
import type { Digit, GameConfig } from '../../app/game/types';

const easyConfig: GameConfig = { difficulty: 'easy', maxLives: 3 };

describe('Game state engine', () => {
  it('initializes with givens and config', () => {
    const givens = [{ row: 0, col: 0, value: 5 as Digit }];
    const state = initializeGame(givens, easyConfig);
    expect(getCell(state.board, 0, 0).value).toBe(5);
    expect(getCell(state.board, 0, 0).isGiven).toBe(true);
    expect(state.config.difficulty).toBe('easy');
    expect(state.livesRemaining).toBe(3);
  });

  it('applies place, note, and erase deterministically', () => {
    const state = initializeGame([], easyConfig);
    let next = applyAction(state, { type: 'place', row: 1, col: 1, value: 7 });
    expect(getCell(next.board, 1, 1).value).toBe(7);
    next = applyAction(next, { type: 'note', row: 1, col: 1, value: 3, present: true });
    expect(getCell(next.board, 1, 1).value).toBe(null);
    expect(getCell(next.board, 1, 1).notes[3]).toBe(true);
    next = applyAction(next, { type: 'erase', row: 1, col: 1 });
    expect(getCell(next.board, 1, 1).value).toBe(null);
    expect(Object.keys(getCell(next.board, 1, 1).notes).length).toBe(0);
  });

  it('isSolved returns true for a solved board', () => {
    const solved = createEmptyBoard();
    // Populate solved board with a known correct Sudoku solution
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
      const rowVals = rows[r]!;
      for (let c = 0; c < 9; c++) {
        getCell(solved, r, c).value = rowVals[c]! as Digit;
      }
    }
    expect(isSolved(solved)).toBe(true);
  });
});
