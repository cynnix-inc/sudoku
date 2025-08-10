const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Sudoku core logic', () => {
  test('generateSolvedBoard creates a full valid solution', () => {
    const game = new SudokuGame({ headless: true });
    game.generateSolvedBoard();
    const board = game.board;
    // All rows filled 1..9 without zeros
    for (let r = 0; r < 9; r++) {
      expect(board[r].every(n => n >= 1 && n <= 9)).toBe(true);
      const s = new Set(board[r]);
      expect(s.size).toBe(9);
    }
    // All cols unique
    for (let c = 0; c < 9; c++) {
      const col = Array.from({ length: 9 }, (_, r) => board[r][c]);
      const s = new Set(col);
      expect(s.size).toBe(9);
    }
  });

  test('isValidMove respects Sudoku constraints', () => {
    const game = new SudokuGame({ headless: true });
    // simple manual placement
    game.board[0][0] = 1;
    expect(game.isValidMove(0, 1, 1)).toBe(false); // same row
    expect(game.isValidMove(1, 0, 1)).toBe(false); // same col
    expect(game.isValidMove(1, 1, 1)).toBe(false); // same 3x3
    expect(game.isValidMove(0, 1, 2)).toBe(true);
  });

  test('solveBoard can solve a partial grid', () => {
    const game = new SudokuGame({ headless: true });
    game.generateSolvedBoard();
    // knock out some cells
    for (let i = 0; i < 20; i++) {
      const r = Math.floor(Math.random() * 9);
      const c = Math.floor(Math.random() * 9);
      game.board[r][c] = 0;
    }
    const solved = game.solveBoard();
    expect(solved).toBe(true);
    // no zeros remain
    expect(game.board.flat().includes(0)).toBe(false);
  });
});


