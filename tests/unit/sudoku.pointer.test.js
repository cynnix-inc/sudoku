const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Pointer painting and release', () => {
  function buildBoardGrid() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const wrap = document.createElement('div');
        const cell = document.createElement('input');
        cell.className = 'cell';
        cell.dataset.row = String(r);
        cell.dataset.col = String(c);
        wrap.appendChild(cell);
        board.appendChild(wrap);
        const notes = document.createElement('div');
        notes.className = 'notes';
        notes.dataset.row = String(r);
        notes.dataset.col = String(c);
        wrap.appendChild(notes);
      }
    }
  }

  test('onBoardPointerMove paints locked number; notes mode toggles note', () => {
    const g = new SudokuGame({ headless: true });
    // ensure grid exists
    buildBoardGrid();
    // editable grid
    g.board = Array(9).fill().map(()=>Array(9).fill(0));
    g.initialBoard = Array(9).fill().map(()=>Array(9).fill(0));
    // start painting session
    g.lockedNumber = 7;
    g._isPainting = true;
    g._paintingPointerId = 1;
    const target = document.querySelector('.cell[data-row="0"][data-col="0"]');
    const orig = document.elementFromPoint;
    document.elementFromPoint = () => target;
    // value path
    g.isNotesMode = false;
    g.onBoardPointerMove({ clientX: 0, clientY: 0, pointerId: 1 });
    expect(g.board[0][0]).toBe(7);
    // notes path
    g.board[0][1] = 0;
    const target2 = document.querySelector('.cell[data-row="0"][data-col="1"]');
    document.elementFromPoint = () => target2;
    g.isNotesMode = true;
    g.onBoardPointerMove({ clientX: 0, clientY: 0, pointerId: 1 });
    expect(g.notes[0][1].has(7)).toBe(true);
    // restore
    document.elementFromPoint = orig;
  });

  test('onBoardPointerUp clears painting state', () => {
    const g = new SudokuGame({ headless: true });
    g._isPainting = true;
    g._paintingPointerId = 2;
    g.onBoardPointerUp({ pointerId: 2 });
    expect(g._isPainting).toBe(false);
    expect(g._paintingPointerId).toBe(null);
  });
});



