const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Selection and highlight behaviors', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    const board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board);
    // create a minimal 9x9 DOM
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const wrap = document.createElement('div');
        const cell = document.createElement('input');
        cell.className = 'cell'; cell.dataset.row = String(r); cell.dataset.col = String(c);
        wrap.appendChild(cell); board.appendChild(wrap);
        const notes = document.createElement('div'); notes.className = 'notes'; notes.dataset.row = String(r); notes.dataset.col = String(c); wrap.appendChild(notes);
      }
    }
  });

  test('selectCell marks selected and highlights related', () => {
    const g = new SudokuGame({ headless: true });
    const cell = document.querySelector('.cell[data-row="0"][data-col="0"]');
    g.selectCell(cell, 0, 0);
    expect(cell.classList.contains('selected')).toBe(true);
    // row/col highlights applied
    const rowPeer = document.querySelector('.cell[data-row="0"][data-col="5"]');
    const colPeer = document.querySelector('.cell[data-row="5"][data-col="0"]');
    expect(rowPeer.classList.contains('highlighted')).toBe(true);
    expect(colPeer.classList.contains('highlighted')).toBe(true);
  });
});



