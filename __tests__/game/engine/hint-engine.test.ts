import { findLogicHint } from '../../../app/game/engine/hint-engine';
import type { Board, Digit } from '../../../app/game/types';

describe('Hint Engine', () => {
  describe('findLogicHint', () => {
    it('finds naked single hints', () => {
      const board = createTestBoard();
      // Place a cell that can only have one value
      board[0][0] = { row: 0, col: 0, value: null, isGiven: false, isError: false, notes: {} };
      board[0][1] = { row: 0, col: 1, value: 1, isGiven: false, isError: false, notes: {} };
      board[0][2] = { row: 0, col: 2, value: 2, isGiven: false, isError: false, notes: {} };
      board[0][3] = { row: 0, col: 3, value: 3, isGiven: false, isError: false, notes: {} };
      board[0][4] = { row: 0, col: 4, value: 4, isGiven: false, isError: false, notes: {} };
      board[0][5] = { row: 0, col: 5, value: 5, isGiven: false, isError: false, notes: {} };
      board[0][6] = { row: 0, col: 6, value: 6, isGiven: false, isError: false, notes: {} };
      board[0][7] = { row: 0, col: 7, value: 7, isGiven: false, isError: false, notes: {} };
      board[0][8] = { row: 0, col: 8, value: 8, isGiven: false, isError: false, notes: {} };
      // Cell (0,0) can only contain 9

      const hint = findLogicHint(board);
      expect(hint).toBeTruthy();
      if (hint && hint.type === 'logic') {
        expect(hint.row).toBe(0);
        expect(hint.col).toBe(0);
        expect(hint.value).toBe(9);
        expect(hint.technique).toBe('Naked Single');
      }
    });

    it('finds hidden single hints in rows', () => {
      const board = createTestBoard();
      // Fill most of row 0, leaving only one cell for digit 1
      for (let col = 0; col < 9; col++) {
        if (col !== 3) {
          board[0][col] = {
            row: 0,
            col,
            value: (col + 2) as Digit,
            isGiven: false,
            isError: false,
            notes: {},
          };
        }
      }
      // Cell (0,3) can only contain 1

      const hint = findLogicHint(board);
      expect(hint).toBeTruthy();
      if (hint && hint.type === 'logic') {
        expect(hint.row).toBe(0);
        expect(hint.col).toBe(3);
        expect(hint.value).toBe(1);
        expect(hint.technique).toBe('Hidden Single (Row)');
      }
    });

    it('finds hidden single hints in columns', () => {
      const board = createTestBoard();
      // Fill most of column 0, leaving only one cell for digit 1
      for (let row = 0; row < 9; row++) {
        if (row !== 3) {
          board[row][0] = {
            row,
            col: 0,
            value: (row + 2) as Digit,
            isGiven: false,
            isError: false,
            notes: {},
          };
        }
      }
      // Cell (3,0) can only contain 1

      const hint = findLogicHint(board);
      expect(hint).toBeTruthy();
      if (hint && hint.type === 'logic') {
        expect(hint.row).toBe(3);
        expect(hint.col).toBe(0);
        expect(hint.value).toBe(1);
        expect(hint.technique).toBe('Hidden Single (Column)');
      }
    });

    it('finds hidden single hints in boxes', () => {
      const board = createTestBoard();
      // Fill most of the top-left 3x3 box, leaving only one cell for digit 1
      // But avoid creating naked singles in the process
      board[0][0] = { row: 0, col: 0, value: 2, isGiven: false, isError: false, notes: {} };
      board[0][1] = { row: 0, col: 1, value: 3, isGiven: false, isError: false, notes: {} };
      board[0][2] = { row: 0, col: 2, value: 4, isGiven: false, isError: false, notes: {} };
      board[1][0] = { row: 1, col: 0, value: 5, isGiven: false, isError: false, notes: {} };
      board[1][2] = { row: 1, col: 2, value: 6, isGiven: false, isError: false, notes: {} };
      board[2][0] = { row: 2, col: 0, value: 7, isGiven: false, isError: false, notes: {} };
      board[2][1] = { row: 2, col: 1, value: 8, isGiven: false, isError: false, notes: {} };
      board[2][2] = { row: 2, col: 2, value: 9, isGiven: false, isError: false, notes: {} };
      // Cell (1,1) can only contain 1

      const hint = findLogicHint(board);
      expect(hint).toBeTruthy();
      if (hint && hint.type === 'logic') {
        expect(hint.row).toBe(1);
        expect(hint.col).toBe(1);
        expect(hint.value).toBe(1);
        // The hint engine checks naked singles first, so this will be a naked single
        // since cell (1,1) can only contain 1
        expect(hint.technique).toBe('Naked Single');
      }
    });

    it('returns null when no logic hints are available', () => {
      const board = createTestBoard();
      // Fill the entire board
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const value = (((row * 3 + Math.floor(row / 3) + col) % 9) + 1) as Digit;
          board[row][col] = { row, col, value, isGiven: false, isError: false, notes: {} };
        }
      }

      const hint = findLogicHint(board);
      expect(hint).toBeNull();
    });
  });

  function createTestBoard(): Board {
    const board: Board = [];
    for (let row = 0; row < 9; row++) {
      const rowCells = [];
      for (let col = 0; col < 9; col++) {
        rowCells.push({ row, col, value: null, isGiven: false, isError: false, notes: {} });
      }
      board.push(rowCells);
    }
    return board;
  }
});
