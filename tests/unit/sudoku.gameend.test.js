const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Game end flows', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // build minimal UI for overlays and landing
    const board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board);
    const status = document.createElement('div'); status.id = 'status-message'; document.body.appendChild(status);
    const landing = document.createElement('div'); landing.id = 'landing-overlay'; document.body.appendChild(landing);
    const result = document.createElement('div'); result.id = 'landing-result'; document.body.appendChild(result);
  });

  test('checkGameComplete detects complete board and triggers win flow', () => {
    const g = new SudokuGame({ headless: true });
    // create a solved board
    g.generateSolvedBoard();
    g.solution = g.board.map(r => [...r]);
    g.initialBoard = g.board.map(r => r.map(() => 0));
    // updateDisplay requires DOM cells; create minimal 9x9
    const board = document.getElementById('board');
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const wrap = document.createElement('div');
        const cell = document.createElement('input'); cell.className = 'cell'; cell.dataset.row = String(r); cell.dataset.col = String(c);
        wrap.appendChild(cell); board.appendChild(wrap);
        const notes = document.createElement('div'); notes.className = 'notes'; notes.dataset.row = String(r); notes.dataset.col = String(c); wrap.appendChild(notes);
      }
    }
    g.updateDisplay();
    g.checkGameComplete();
    expect(g.isGameComplete).toBe(true);
    // landing should be prepared with some content
    const box = document.getElementById('landing-result');
    expect(box.className.includes('landing-result')).toBe(true);
  });

  test('showGameOver routes to landing with loss banner', () => {
    const g = new SudokuGame({ headless: true });
    g.showGameOver();
    const box = document.getElementById('landing-result');
    expect(box.className.includes('result-lose')).toBe(true);
  });
});



