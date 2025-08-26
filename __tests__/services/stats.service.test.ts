import { beforeEach } from '@jest/globals';
import { __TEST_ONLY__clearProgress } from '../../app/services/storage';
import { loadStats, recordResult, recordDailyResult } from '../../app/services/stats';

describe('services/stats (#51)', () => {
  beforeEach(() => {
    __TEST_ONLY__clearProgress('sudoku-stats');
  });

  it('updates best times on win', async () => {
    await recordResult('easy', 'win', 120);
    const stats = await loadStats();
    expect(stats?.bestTimeByDifficulty['easy']).toBe(120);
  });

  it('does not update best time when hints used', async () => {
    await recordResult('easy', 'win', 150, { usedHints: true });
    const stats = await loadStats();
    expect(stats?.bestTimeByDifficulty['easy']).toBeUndefined();
  });

  it('records daily results and caps recent list', async () => {
    for (let i = 0; i < 65; i++) {
      const day = 20240101 + i;
      await recordDailyResult(String(day), 'medium', 'win', 200 + i, false);
    }
    const stats = await loadStats();
    expect(stats).toBeTruthy();
    const recent = (stats as NonNullable<typeof stats>).recentDailyResults;
    expect(recent.length).toBeLessThanOrEqual(60);
    const first = recent[0];
    if (!first) throw new Error('recentDailyResults empty');
    expect(first.date).toBe(String(20240101 + 64));
  });
});
