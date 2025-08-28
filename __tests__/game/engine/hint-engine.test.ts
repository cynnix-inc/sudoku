import { findLogicHint } from '../../../app/game/engine/hint-engine';
import type { Board, Digit } from '../../../app/game/types';

describe('Hint Engine', () => {
  describe('findLogicHint', () => {
    function createTestBoard(): Board {
      const board: Board = Array(9)
        .fill(null)
        .map(() =>
          Array(9)
            .fill(null)
            .map(() => ({
              row: 0,
              col: 0,
              value: null,
              isGiven: false,
              isError: false,
              notes: {},
            })),
        );

      // Initialize with proper row/col values
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row] && board[row][col]) {
            board[row][col] = {
              row,
              col,
              value: null,
              isGiven: false,
              isError: false,
              notes: {},
            };
          }
        }
      }

      return board;
    }

    it('finds hints when available', () => {
      const board = createTestBoard();

      // Fill most of the board to create a scenario where hints can be found
      for (let col = 0; col < 9; col++) {
        if (col !== 0 && board[0] && board[0][col]) {
          board[0][col] = {
            row: 0,
            col,
            value: col as Digit,
            isGiven: false,
            isError: false,
            notes: {},
          };
        }
      }

      // Fill the first column except the first cell
      for (let row = 1; row < 9; row++) {
        if (board[row] && board[row][0]) {
          board[row][0] = {
            row,
            col: 0,
            value: (row + 8) as Digit,
            isGiven: false,
            isError: false,
            notes: {},
          };
        }
      }

      // Fill the first box except the first cell
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if ((row !== 0 || col !== 0) && board[row] && board[row][col]) {
            const value = (row * 3 + col + 9) as Digit;
            board[row][col] = {
              row,
              col,
              value,
              isGiven: false,
              isError: false,
              notes: {},
            };
          }
        }
      }

      const hint = findLogicHint(board);
      expect(hint).toBeTruthy();
      expect(hint?.row).toBe(0);
      expect(hint?.col).toBe(0);
      expect(hint?.value).toBe(1);
      expect(hint?.technique).toBeTruthy();
      expect(hint?.explanation).toBeTruthy();
    });

    it('returns null when no hints are found', () => {
      const board = createTestBoard();

      // Fill the board completely
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row] && board[row][col]) {
            board[row][col] = {
              row,
              col,
              value: (((row * 3 + Math.floor(row / 3) + col) % 9) + 1) as Digit,
              isGiven: false,
              isError: false,
              notes: {},
            };
          }
        }
      }

      const hint = findLogicHint(board);
      expect(hint).toBeNull();
    });

    it('handles empty board', () => {
      const board = createTestBoard();

      const hint = findLogicHint(board);
      // An empty board doesn't have any obvious hints
      expect(hint).toBeNull();
    });
  });
});
