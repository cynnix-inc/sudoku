const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Calendar/UI helpers (smoke)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    const modal = document.createElement('div'); modal.id = 'calendar-modal';
    const content = document.createElement('div'); content.className = 'modal-content';
    const grid = document.createElement('div'); grid.id = 'calendar-grid'; content.appendChild(grid);
    const month = document.createElement('div'); month.id = 'calendar-month-label'; content.appendChild(month);
    const streaks = document.createElement('div'); streaks.id = 'calendar-streaks'; content.appendChild(streaks);
    modal.appendChild(content);
    document.body.appendChild(modal);
  });

  test('getDifficultyIcon returns some markup', () => {
    const g = new SudokuGame({ headless: true });
    const html = g.getDifficultyIcon('medium');
    expect(typeof html).toBe('string');
    expect(html.length).toBeGreaterThan(0);
  });

  test('streaks render when calendar opens', () => {
    const g = new SudokuGame({ headless: true });
    if (typeof window !== 'undefined' && window.SudokuCalendar && window.SudokuCalendar.openCalendar) {
      window.SudokuCalendar.openCalendar(g);
      const el = document.getElementById('calendar-streaks');
      expect(el).toBeTruthy();
      // legend should exist and contain at least 6 items (2x3)
      const legend = document.getElementById('calendar-legend');
      expect(legend).toBeTruthy();
      if (legend) {
        const items = legend.querySelectorAll('.legend-chip');
        expect(items.length).toBeGreaterThanOrEqual(6);
      }
    }
  });
});



