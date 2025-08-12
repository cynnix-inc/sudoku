const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Calendar cell accessibility (title and aria-label)', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="calendar-modal"></div>
      <div id="calendar-weekdays"></div>
      <div id="calendar-grid"></div>
      <div id="calendar-month-label"></div>
      <div id="weekstart-toggle" aria-checked="false"></div>
    `;
    try { localStorage.clear(); } catch {}
  });

  test('renderCalendar sets cell title and aria-label', () => {
    const g = new SudokuGame({ headless: true });
    g._calendarRefMonth = new Date();
    // Provide helpers used by calendar
    g.getUtcDateKey = (d=new Date()) => `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
    g.getDifficultyForDateKey = () => 'medium';
    if (typeof window !== 'undefined' && window.SudokuCalendar && window.SudokuCalendar.renderCalendar) {
      window.SudokuCalendar.renderCalendar(g);
    } else {
      // fallback: call via module import path
      const cal = require('../../src/ui/calendar.js');
      cal.renderCalendar(g);
    }
    const cells = Array.from(document.querySelectorAll('.calendar-cell'));
    expect(cells.length).toBeGreaterThan(0);
    const withTitle = cells.filter(c => c.title && c.getAttribute('aria-label'));
    expect(withTitle.length).toBeGreaterThan(0);
  });
});


