import { computeStreaks, type DailyResult } from '../../app/services/stats';

describe('UTC daily streaks (#49)', () => {
  it('computes current and best streaks over recentDailyResults', () => {
    const results: DailyResult[] = [
      // Newest first or mixed order is fine; computeStreaks sorts internally
      { date: '20250106', result: 'win', seconds: 120, usedHints: false },
      { date: '20250105', result: 'win', seconds: 100, usedHints: false },
      { date: '20250104', result: 'loss', seconds: 200, usedHints: false },
      { date: '20250103', result: 'win', seconds: 130, usedHints: true },
      { date: '20250102', result: 'win', seconds: 130, usedHints: false },
      { date: '20250101', result: 'win', seconds: 130, usedHints: false },
    ];
    // Winning days: 20250106, 20250105 (gap at 04), then 03,02,01 ⇒ best=3; current streak at head=2
    const streaks = computeStreaks(results);
    expect(streaks.best).toBe(3);
    expect(streaks.current).toBe(2);
  });

  it('counts a day as win if any result that day is a win', () => {
    const results: DailyResult[] = [
      { date: '20250110', result: 'loss', seconds: 50, usedHints: false },
      { date: '20250110', result: 'win', seconds: 40, usedHints: false },
      { date: '20250109', result: 'win', seconds: 40, usedHints: false },
    ];
    const streaks = computeStreaks(results);
    expect(streaks.current).toBe(2);
    expect(streaks.best).toBe(2);
  });

  it('returns zeros when no wins present', () => {
    const results: DailyResult[] = [
      { date: '20250101', result: 'loss', seconds: 10, usedHints: false },
      { date: '20250103', result: 'loss', seconds: 10, usedHints: false },
    ];
    const s = computeStreaks(results);
    expect(s).toEqual({ current: 0, best: 0 });
  });
});
