const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Self-heal of empty-but-given cells', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    try { localStorage.clear(); } catch {}
  });

  test('updateDisplay heals mismatched givens and recomputes candidates', () => {
    // UI elements required by game
    document.body.innerHTML = [
      '<input type="checkbox" id="auto-candidates-toggle" checked />',
      '<div id="board"></div>',
      '<select id="difficulty"><option value="medium">Medium</option></select>',
      '<button class="number-btn" data-number="1">1</button>'
    ].join('');

    const g = new SudokuGame({ headless: true });
    // Build board DOM
    g.createBoard();

    // Board state: 8 placed ones, one empty at [0][0] incorrectly marked as given
    g.board = Array(9).fill().map(() => Array(9).fill(0));
    for (let c = 1; c < 9; c++) g.board[0][c] = 1; // 8 occurrences
    g.initialBoard = Array(9).fill().map(() => Array(9).fill(0));
    g.initialBoard[0][0] = 5; // wrong: marked as given while board is empty

    // Act: repaint (triggers heal + candidate recompute)
    g.updateDisplay();

    // Healed: the given flag must be cleared for empty cell
    expect(g.initialBoard[0][0]).toBe(0);
    // Candidates recomputed for empty cell
    expect(g.notes[0][0] instanceof Set).toBe(true);
    expect(g.notes[0][0].size).toBeGreaterThan(0);
    // Keypad should not be disabled for digit 1 (only 8 placed, 1 remaining)
    const btn1 = document.querySelector('.number-btn[data-number="1"]');
    expect(btn1.classList.contains('disabled')).toBe(false);
  });

  test('resumeFromStorage heals mismatched givens on load', () => {
    document.body.innerHTML = [
      '<input type="checkbox" id="auto-candidates-toggle" checked />',
      '<div id="board"></div>',
      '<select id="difficulty"><option value="medium">Medium</option></select>'
    ].join('');

    // Seed a saved game with a mismatch: empty board cell but initialBoard marked as given
    const board = Array(9).fill().map(() => Array(9).fill(0));
    const initialBoard = Array(9).fill().map(() => Array(9).fill(0));
    initialBoard[0][0] = 3;
    const solution = Array(9).fill().map(() => Array(9).fill(1));
    const payload = { board, initialBoard, solution, elapsed: 5, difficulty: 'medium', hintsUsed: 0, hintsLimit: 3 };
    try { localStorage.setItem('sudoku-progress', JSON.stringify(payload)); } catch {}

    const g = new SudokuGame({ headless: true });
    g.createBoard();
    g.resumeFromStorage();
    expect(g.initialBoard[0][0]).toBe(0);
  });
});


