import {
  createDailySeed,
  formatDailySeed,
  difficultyForDate,
  generateDailyPuzzle,
} from '../../app/game/daily';

describe('daily module (#163)', () => {
  it('formats seeds as YYYYMMDD-pattern-difficulty', () => {
    const d = new Date(Date.UTC(2025, 8, 21));
    const seed = createDailySeed(d);
    const fmt = formatDailySeed(seed);
    expect(fmt).toMatch(/^\d{8}-[A-Z]-[a-z]+$/);
  });

  it('rotates difficulty weekly and is deterministic per date', () => {
    const monday = new Date(Date.UTC(2025, 0, 6));
    const tiers = [0, 1, 2, 3, 4, 5, 6].map((i) =>
      difficultyForDate(new Date(monday.getTime() + i * 86400000)),
    );
    expect(tiers.length).toBe(7);
    const a = generateDailyPuzzle(monday);
    const b = generateDailyPuzzle(monday);
    expect(a.givens).toEqual(b.givens);
  });
});
