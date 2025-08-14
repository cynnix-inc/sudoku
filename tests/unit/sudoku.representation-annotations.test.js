const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Representation annotations (non-visual, WIP)', () => {
  function mountBoardDom() {
    document.body.innerHTML = `
      <div class="sudoku-board"><div id="board" class="board"></div></div>
    `;
  }

  test('cells carry representation data attributes with defaults', () => {
    mountBoardDom();
    const g = new SudokuGame({ headless: true });
    g.initializeGame();

    const cell = document.querySelector('[data-row="0"][data-col="0"]');
    expect(cell).toBeTruthy();
    // Defaults written by updateDisplay
    expect(cell.getAttribute('data-repr-mode')).toBe('numbers');
    expect(cell.getAttribute('data-repr-theme')).toBe('pocket-beasts');
    const expectedDigit = g.board?.[0]?.[0] === 0 ? '' : String(g.board[0][0]);
    expect(cell.getAttribute('data-repr-digit') || '').toBe(expectedDigit);
  });

  test('changing stored mode persists and annotates on repaint', () => {
    mountBoardDom();
    try {
      const s = JSON.parse(localStorage.getItem('sudoku-settings') || '{}') || {};
      s.representationMode = 'letters';
      s.representationTheme = 'galaxy-saga';
      localStorage.setItem('sudoku-settings', JSON.stringify(s));
    } catch {}

    const g = new SudokuGame({ headless: true });
    g.initializeGame();

    const cell = document.querySelector('[data-row="0"][data-col="0"]');
    expect(cell.getAttribute('data-repr-mode')).toBe('letters');
    expect(cell.getAttribute('data-repr-theme')).toBe('galaxy-saga');
  });
});


