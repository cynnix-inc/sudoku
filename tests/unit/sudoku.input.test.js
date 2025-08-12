const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Input handlers', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    const board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board);
    const time = document.createElement('span'); time.id = 'time'; document.body.appendChild(time);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const wrap = document.createElement('div');
        const cell = document.createElement('input'); cell.className = 'cell'; cell.dataset.row = String(r); cell.dataset.col = String(c);
        wrap.appendChild(cell); board.appendChild(wrap);
        const notes = document.createElement('div'); notes.className = 'notes'; notes.dataset.row = String(r); notes.dataset.col = String(c); wrap.appendChild(notes);
      }
    }
  });

  test('handleCellInput places value and respects notes mode', () => {
    const g = new SudokuGame({ headless: true });
    g.generateSolvedBoard();
    g.solution = g.board.map(r => [...r]);
    g.initialBoard = Array(9).fill().map(()=>Array(9).fill(0));
    const cell = document.querySelector('.cell[data-row="0"][data-col="0"]');
    // direct value
    g.handleCellInput({ target: cell }, 0, 0);
    // By default empty input clears; set a digit instead
    cell.value = '3'; g.handleCellInput({ target: cell }, 0, 0);
    expect(g.board[0][0]).toBe(3);
    // notes mode
    g.board[0][0] = 0; cell.value = '5'; g.isNotesMode = true; g.handleCellInput({ target: cell }, 0, 0);
    expect(g.notes[0][0].has(5)).toBe(true);
  });

  test('handleKeyDown supports digits and erase', () => {
    const g = new SudokuGame({ headless: true });
    g.generateSolvedBoard();
    g.solution = g.board.map(r => [...r]);
    g.initialBoard = Array(9).fill().map(()=>Array(9).fill(0));
    const cell = document.querySelector('.cell[data-row="0"][data-col="1"]');
    // digit
    g.handleKeyDown({ key: '7', preventDefault: () => {}, shiftKey: false }, 0, 1);
    expect(g.board[0][1]).toBe(7);
    // erase
    g.handleKeyDown({ key: 'Backspace', preventDefault: () => {} }, 0, 1);
    expect(g.board[0][1]).toBe(0);
  });
});


