const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('animateNumber utility (indirect)', () => {
  test('showStats updates counters (uses animateNumber)', () => {
    document.body.innerHTML = `
      <div id="stats-modal"></div>
      <div id="stats-content"></div>
      <button id="stats-close"></button>
      <div id="toast-container"></div>
      <div id="board"></div>
    `;
    // seed stats
    localStorage.setItem('sudoku-stats', JSON.stringify({ totalWins: 1, totalLosses: 2, totalCompleted: 3, bestTimes: {}, byDifficulty: {} }));
    const g = new SudokuGame({ headless: true });
    // stub autoPause
    g.autoPauseOnBlur = jest.fn();
    g.showStats();
    expect(document.getElementById('stats-content').innerHTML.length).toBeGreaterThan(0);
  });
});



