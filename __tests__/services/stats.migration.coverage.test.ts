import { loadStats, saveStats, recordDailyResult, type StatsData } from '../../app/services/stats';
import { __TEST_ONLY__clearProgress, saveProgress } from '../../app/services/storage';
import { beforeEach } from '@jest/globals';

describe('stats migration and branch coverage', () => {
  beforeEach(() => {
    __TEST_ONLY__clearProgress();
  });

  it('migrates v1 stats to v2 with defaults', async () => {
    // Write a v1-shaped payload directly to storage under the internal key
    // Using storage API to avoid coupling to stats internals
    await saveProgress('sudoku-stats', { schemaVersion: 1 });
    const migrated = await loadStats();
    expect(migrated).not.toBeNull();
    const m = migrated as StatsData;
    expect(m.schemaVersion).toBe(2);
    expect(m.totals.played).toBe(0);
    expect(m.recentDailyResults).toEqual([]);
    expect(typeof m.lastCalculated).toBe('number');
  });

  it('trims recentDailyResults to max length after many inserts', async () => {
    const date = '20250101';
    // Seed an initial large recentDailyResults list at max size (60)
    const existing: StatsData = {
      schemaVersion: 2,
      totals: { played: 0, wins: 0, losses: 0 },
      bestTimeByDifficulty: {},
      recentDailyResults: Array.from({ length: 60 }, (_, i) => ({
        date: `202412${String(10 + i).padStart(2, '0')}`,
        result: 'win',
        seconds: 100 + i,
        usedHints: false,
      })),
      lastCalculated: 0,
    };
    await saveStats(existing);

    // Add one more daily result to trigger trimming
    await recordDailyResult(date, 'easy', 'loss', 200, false);

    const loaded = (await loadStats()) as StatsData;
    expect(loaded.recentDailyResults.length).toBe(60);
    // Newest entry should be first and preserved
    expect(loaded.recentDailyResults.length).toBeGreaterThan(0);
    expect(loaded.recentDailyResults[0]!.date).toBe(date);
  });
});
