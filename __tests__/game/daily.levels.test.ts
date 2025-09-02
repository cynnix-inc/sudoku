import { createDailySeed, formatDailySeed, generateDailyPuzzle } from '../../app/game/daily';

describe('Daily with Ultimate levels', () => {
  it('seed includes legacy difficulty and separate level is present', () => {
    const date = new Date(Date.UTC(2025, 1, 3));
    const seed = createDailySeed(date);
    const s = formatDailySeed(seed);
    expect(s).toMatch(/^\d{8}-[A-Z]-/);
    expect(seed).toHaveProperty('level');
    expect(['novice', 'skilled', 'advanced', 'expert', 'fiendish', 'ultimate']).toContain(
      seed.level,
    );
  });

  it('generateDailyPuzzle uses level path', () => {
    const date = new Date(Date.UTC(2025, 1, 4));
    const p = generateDailyPuzzle(date);
    expect(p.givens.length).toBeGreaterThan(0);
    expect(Array.isArray(p.solution)).toBe(true);
  });
});
