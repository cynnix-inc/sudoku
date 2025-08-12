const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Auto candidates toggles', () => {
  test('isAutoCandidatesEnabled and recomputeAllCandidates work together', () => {
    document.body.innerHTML = '<input type="checkbox" id="auto-candidates-toggle" checked /><div id="board"></div>';
    const g = new SudokuGame({ headless: true });
    g.generateSolvedBoard();
    g.solution = g.board.map(r => [...r]);
    // empty board
    g.board = Array(9).fill().map(()=>Array(9).fill(0));
    g.initialBoard = Array(9).fill().map(()=>Array(9).fill(0));
    g.recomputeAllCandidates();
    expect(g.notes[4][4].size).toBe(9);
  });

  test('isAutoAdvanceEnabled reads toggle state', () => {
    document.body.innerHTML = '<input type="checkbox" id="auto-advance-toggle" checked />';
    const g = new SudokuGame({ headless: true });
    expect(g.isAutoAdvanceEnabled()).toBe(true);
  });
});



