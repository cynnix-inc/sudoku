const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Daily helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('getUtcDateKey and parseUtcKeyToDate roundtrip', () => {
    const g = new SudokuGame({ headless: true });
    const d = new Date(Date.UTC(2031, 6, 15));
    const key = g.getUtcDateKey(d);
    expect(key).toBe('20310715');
    const back = g.parseUtcKeyToDate(key);
    expect(back.getUTCFullYear()).toBe(2031);
    expect(back.getUTCMonth()).toBe(6);
    expect(back.getUTCDate()).toBe(15);
  });

  test('getNextUtcMidnight returns a future UTC midnight', () => {
    const g = new SudokuGame({ headless: true });
    const next = g.getNextUtcMidnight();
    const now = new Date();
    expect(next.getTime()).toBeGreaterThan(now.getTime());
    expect(next.getUTCHours()).toBe(0);
    expect(next.getUTCMinutes()).toBe(0);
    expect(next.getUTCSeconds()).toBe(0);
  });
});



