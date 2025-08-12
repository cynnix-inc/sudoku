const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Mode indicator and daily badge', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    const host = document.createElement('div'); host.id = 'mode-indicator'; document.body.appendChild(host);
    const dot = document.createElement('span'); dot.id = 'menu-daily-item-dot'; document.body.appendChild(dot);
  });

  test('updateModeIndicator writes difficulty and triggers badge update', () => {
    const g = new SudokuGame({ headless: true });
    // stub badge
    g.updateDailyIconBadge = jest.fn();
    g.updateModeIndicator({ type: 'normal', difficulty: 'hard' });
    const host = document.getElementById('mode-indicator');
    expect(host.innerHTML.toLowerCase()).toContain('hard');
    expect(g.updateDailyIconBadge).toHaveBeenCalled();
  });
});



