const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Health bar (Lives) UI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    const host = document.createElement('div'); host.id = 'health-bar'; document.body.appendChild(host);
  });

  test('renderHealthBar unlimited and finite modes', () => {
    const g = new SudokuGame({ headless: true });
    // Unlimited (lives disabled)
    g.livesEnabled = false; g.livesLimit = Infinity;
    g.renderHealthBar();
    expect(document.querySelector('#health-bar .health-badge')?.textContent).toBe('∞');

    // Finite lives
    document.getElementById('health-bar').innerHTML = '';
    g.livesEnabled = true; g.livesLimit = 3; g.livesUsed = 0;
    g.renderHealthBar();
    const label = document.getElementById('health-bar').getAttribute('aria-label') || '';
    expect(label).toContain('Lives remaining:');
  });

  test('updateHealthBar updates counts and aria-label', () => {
    const g = new SudokuGame({ headless: true });
    g.livesEnabled = true; g.livesLimit = 3; g.livesUsed = 0;
    g.renderHealthBar();
    g.livesUsed = 2;
    g.updateHealthBar();
    const label = document.getElementById('health-bar').getAttribute('aria-label') || '';
    expect(label).toContain('1');
  });
});



