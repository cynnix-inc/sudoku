const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Calendar wrapper methods (smoke)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('openCalendar falls back to openDailyModal when SudokuCalendar not present', () => {
    const g = new SudokuGame({ headless: true });
    g.openDailyModal = jest.fn();
    g.openCalendar();
    expect(g.openDailyModal).toHaveBeenCalled();
  });

  test('shiftCalendar, renderCalendar, refreshCalendarHeaders no-op without SudokuCalendar', () => {
    const g = new SudokuGame({ headless: true });
    // shouldn't throw
    g.shiftCalendar(1);
    g.renderCalendar();
    g.refreshCalendarHeaders();
  });
});



