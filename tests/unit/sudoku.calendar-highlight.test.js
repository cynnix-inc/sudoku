const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

function mountCalendarDom() {
  document.body.innerHTML = '';
  const modal = document.createElement('div'); modal.id = 'calendar-modal';
  const content = document.createElement('div'); content.className = 'modal-content';
  const grid = document.createElement('div'); grid.id = 'calendar-grid'; content.appendChild(grid);
  const month = document.createElement('div'); month.id = 'calendar-month-label'; content.appendChild(month);
  const streaks = document.createElement('div'); streaks.id = 'calendar-streaks'; content.appendChild(streaks);
  const legend = document.createElement('div'); legend.id = 'calendar-legend'; content.appendChild(legend);
  modal.appendChild(content);
  document.body.appendChild(modal);
}

describe('Calendar highlight: prefers most recent incomplete when today is completed', () => {
  beforeEach(() => {
    // Clean any persisted results between tests
    localStorage.removeItem('sudoku-daily-results');
    localStorage.removeItem('sudoku-settings');
  });

  test('falls back to highlighting today when the entire month is completed', () => {
    mountCalendarDom();
    const g = new SudokuGame({ headless: true });
    const today = new Date();
    // Ensure the calendar is showing the current month
    g._calendarRefMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    // Mark every day of the visible month as completed
    const results = {};
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const key = g.getUtcDateKey(new Date(Date.UTC(today.getFullYear(), today.getMonth(), d)));
      results[key] = { completed: true };
    }
    localStorage.setItem('sudoku-daily-results', JSON.stringify(results));

    // Disable filters; open calendar via public API
    localStorage.setItem('sudoku-settings', JSON.stringify({ calendarOnlyPlayable: false, calendarOnlyIncomplete: false }));
    if (typeof window !== 'undefined' && window.SudokuCalendar && window.SudokuCalendar.renderCalendar) {
      window.SudokuCalendar.renderCalendar(g);
    }
    const grid = document.getElementById('calendar-grid');
    const keyAttr = grid.getAttribute('data-highlight-key');
    const expectedTodayKey = g.getUtcDateKey(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
    expect(keyAttr).toBe(expectedTodayKey);
  });

  test('highlights most recent incomplete day in current month when today is completed', () => {
    mountCalendarDom();
    const g = new SudokuGame({ headless: true });
    const now = new Date();
    g._calendarRefMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const results = {};
    const todayKey = g.getUtcDateKey(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
    results[todayKey] = { completed: true };

    // Choose a target earlier day within the same month when possible
    const todayLocalDate = now.getDate();
    const targetDay = todayLocalDate > 1 ? (todayLocalDate - 1) : null;
    if (targetDay) {
      // Explicitly mark targetDay as incomplete by ensuring no completed flag
      const targetKey = g.getUtcDateKey(new Date(Date.UTC(now.getFullYear(), now.getMonth(), targetDay)));
      results[targetKey] = { completed: false };
    }
    localStorage.setItem('sudoku-daily-results', JSON.stringify(results));

    localStorage.setItem('sudoku-settings', JSON.stringify({ calendarOnlyPlayable: false, calendarOnlyIncomplete: false }));
    if (typeof window !== 'undefined' && window.SudokuCalendar && window.SudokuCalendar.renderCalendar) {
      window.SudokuCalendar.renderCalendar(g);
    }
    const grid = document.getElementById('calendar-grid');
    const keyAttr = grid.getAttribute('data-highlight-key');
    const expectedKey = (() => {
      if (targetDay) {
        return g.getUtcDateKey(new Date(Date.UTC(now.getFullYear(), now.getMonth(), targetDay)));
      }
      return g.getUtcDateKey(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
    })();
    expect(keyAttr).toBe(expectedKey);
  });
});


