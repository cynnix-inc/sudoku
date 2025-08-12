const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('RNG and difficulty schedule', () => {
  test('createSeededRng produces deterministic sequence', () => {
    const g = new SudokuGame({ headless: true });
    const rng1 = g.createSeededRng('seed');
    const rng2 = g.createSeededRng('seed');
    const seq1 = Array.from({ length: 5 }, () => rng1());
    const seq2 = Array.from({ length: 5 }, () => rng2());
    expect(seq1).toEqual(seq2);
  });

  test('buildWeeklyPattern yields 7 entries and stable across same week seed', () => {
    const g = new SudokuGame({ headless: true });
    const weekKey = '20310103';
    const p1 = g.buildWeeklyPattern(weekKey);
    const p2 = g.buildWeeklyPattern(weekKey);
    expect(Array.isArray(p1) && p1.length === 7).toBe(true);
    expect(p1).toEqual(p2);
  });

  test('getDifficultyForDateKey returns one of known difficulties', () => {
    const g = new SudokuGame({ headless: true });
    const key = '20310107';
    const d = g.getDifficultyForDateKey(key);
    expect(['easy','medium','hard','expert','master','extreme']).toContain(d);
  });
});



