const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Persistence roundtrip', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // needed UI bits referenced in persist/resume
    const diffSel = document.createElement('select'); diffSel.id = 'difficulty'; diffSel.innerHTML = '<option value="medium">Medium</option>'; document.body.appendChild(diffSel);
    const time = document.createElement('span'); time.id = 'time'; document.body.appendChild(time);
    // clear storage
    try { localStorage.clear(); } catch {}
  });

  test('persistToStorage then resumeFromStorage restores board and settings', () => {
    const g1 = new SudokuGame({ headless: true });
    // seed a tiny known board
    g1.board = Array(9).fill().map(() => Array(9).fill(0));
    g1.solution = Array(9).fill().map(() => Array(9).fill(1));
    g1.initialBoard = Array(9).fill().map(() => Array(9).fill(0));
    g1.hintsLimit = 3; g1.hintsUsed = 2;
    // simulate some elapsed time without starting timer
    g1._pendingStart = true; g1._preStartElapsed = 42;
    g1.persistToStorage();

    const g2 = new SudokuGame({ headless: true });
    g2.resumeFromStorage();
    expect(g2.board.flat().length).toBe(81);
    expect(g2.hintsLimit).toBe(3);
    expect(g2.hintsUsed).toBe(2);
    // pending start state should be set for resumed sessions
    expect(g2._pendingStart).toBe(true);
  });
});



