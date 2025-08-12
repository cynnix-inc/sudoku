const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Highlight behaviors', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    const board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const wrap = document.createElement('div');
        const cell = document.createElement('input'); cell.className = 'cell'; cell.dataset.row = String(r); cell.dataset.col = String(c);
        wrap.appendChild(cell); board.appendChild(wrap);
      }
    }
  });

  test('highlightSameNumbers marks cells matching selected value', () => {
    const g = new SudokuGame({ headless: true });
    g.board = Array(9).fill().map(()=>Array(9).fill(0));
    g.initialBoard = Array(9).fill().map(()=>Array(9).fill(0));
    // Place a value in two cells
    const a = document.querySelector('.cell[data-row="0"][data-col="0"]');
    const b = document.querySelector('.cell[data-row="0"][data-col="1"]');
    a.value = '5'; b.value = '5';
    g.selectCell(a, 0, 0);
    g.highlightSameNumbers();
    expect(b.classList.contains('same-number')).toBe(true);
  });

  test('highlightNumber applies by digit without selection', () => {
    const g = new SudokuGame({ headless: true });
    const x = document.querySelector('.cell[data-row="1"][data-col="1"]');
    x.value = '3';
    g.highlightNumber(3);
    expect(x.classList.contains('same-number')).toBe(true);
  });
});



