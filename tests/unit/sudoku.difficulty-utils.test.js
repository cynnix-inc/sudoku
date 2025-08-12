const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Difficulty helpers', () => {
  test('getWeekSeedFromDateKey returns Sunday-based key for week', () => {
    const g = new SudokuGame({ headless: true });
    const fri = '20310110'; // Fri Jan 10 2031
    const weekSeed = g.getWeekSeedFromDateKey(fri);
    const d = g.parseUtcKeyToDate(weekSeed);
    expect(d.getUTCDay()).toBe(0);
  });

  test('rankDifficulty orders expected values', () => {
    const g = new SudokuGame({ headless: true });
    expect(g.rankDifficulty('easy')).toBeLessThan(g.rankDifficulty('hard'));
    expect(g.rankDifficulty('expert')).toBeLessThan(g.rankDifficulty('extreme'));
  });
});



