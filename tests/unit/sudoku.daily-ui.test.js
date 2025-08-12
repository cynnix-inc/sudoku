const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Daily UI state and results', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // Settings controls used by setDailyUiState
    const slider = document.createElement('input'); slider.type = 'range'; slider.id = 'lives-limit'; document.body.appendChild(slider);
    const label = document.createElement('span'); label.id = 'lives-limit-value'; document.body.appendChild(label);
    const pill = document.createElement('span'); pill.id = 'lives-limit-pill'; document.body.appendChild(pill);
    const note = document.createElement('div'); note.id = 'lives-daily-note'; document.body.appendChild(note);
    const preview = document.createElement('div'); preview.id = 'lives-preview'; document.body.appendChild(preview);
    const hb = document.createElement('div'); hb.id = 'health-bar'; document.body.appendChild(hb);
    const time = document.createElement('span'); time.id = 'time'; document.body.appendChild(time);
  });

  test('setDailyUiState enters/leaves daily with fixed lives and hint caps', () => {
    const g = new SudokuGame({ headless: true });
    g.setDailyUiState(true, 'hard');
    expect(document.documentElement.classList.contains('daily-active')).toBe(true);
    expect(g.livesEnabled).toBe(true);
    expect(g.livesLimit).toBe(4);
    expect(g.hintsUsed).toBe(0);
    expect(Number.isFinite(g.hintsLimit)).toBe(true);

    g.setDailyUiState(false, 'hard');
    expect(document.documentElement.classList.contains('daily-active')).toBe(false);
  });

  test('recordDailyResult writes completion entry when active daily cached', () => {
    const g = new SudokuGame({ headless: true });
    // Seed an active daily cache
    const key = g.getUtcDateKey();
    localStorage.setItem(`sudoku-daily-${key}`, JSON.stringify({ board: Array(9).fill().map(()=>Array(9).fill(0)), solution: Array(9).fill().map(()=>Array(9).fill(1)), difficulty: 'medium' }));
    g._activeDailyKey = key;
    g.recordDailyResult();
    const results = JSON.parse(localStorage.getItem('sudoku-daily-results') || '{}');
    expect(!!results[key]).toBe(true);
    expect(results[key].completed).toBe(true);
  });
});



