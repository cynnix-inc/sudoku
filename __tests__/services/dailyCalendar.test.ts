import { buildMonthMatrix, getTodayUTCDateString } from '../../app/services/dailyCalendar';
import type { StatsData } from '../../app/services/stats';

describe('daily calendar service (#39)', () => {
  it('marks future days locked and completed days based on stats', () => {
    const today = new Date(Date.UTC(2025, 0, 15)); // Jan 15, 2025 UTC
    const completedUTC = ['20250102', '20250110', '20250115'];
    const stats: StatsData = {
      schemaVersion: 2,
      totals: { played: 0, wins: 0, losses: 0 },
      bestTimeByDifficulty: {},
      recentDailyResults: completedUTC.map((d) => ({
        date: d,
        result: 'win',
        seconds: 100,
        usedHints: false,
      })),
      lastCalculated: today.getTime(),
    };

    const grid = buildMonthMatrix(2025, 0, stats, today);
    const flat = grid.flat();
    const find = (d: string) => flat.find((x) => x.utcDate === d)!;
    // Completed flags
    expect(find('20250102').completed).toBe(true);
    expect(find('20250110').completed).toBe(true);
    expect(find('20250115').completed).toBe(true);
    // Future lock
    expect(find('20250116').isFuture).toBe(true);
    // Today marker
    expect(find('20250115').isToday).toBe(true);
    // In-month flags
    expect(find('20250101').isInMonth).toBe(true);
  });

  it('returns correct today UTC string helper', () => {
    const d = new Date(Date.UTC(2025, 5, 3));
    expect(getTodayUTCDateString(d)).toBe('20250603');
  });
});
