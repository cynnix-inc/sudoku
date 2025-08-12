const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('generateDaily smoke', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="board"></div>
      <div id="health-bar"></div>
      <div id="mode-indicator"></div>
      <div id="status-message"></div>
    `;
    // stub number pad buttons queried by generateDaily
    for (let n = 1; n <= 9; n++) {
      const btn = document.createElement('button'); btn.className = 'number-btn'; btn.dataset.number = String(n); document.body.appendChild(btn);
    }
  });

  test('generateDaily populates grid and sets daily UI state', () => {
    const g = new SudokuGame({ headless: true });
    g.generateDaily('medium');
    expect(g.initialBoard.flat().filter(v => v === 0).length).toBeGreaterThan(0);
    expect(document.documentElement.classList.contains('daily-active')).toBe(true);
  });
});



