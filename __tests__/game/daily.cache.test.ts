import { __TEST_ONLY__clearProgress, loadProgress } from '../../app/services/storage';
import { loadDailyPuzzle, dailyCacheKey } from '../../app/services/daily';

describe('daily cache (#40)', () => {
  it('caches daily puzzle by UTC date with 30-day TTL', async () => {
    const date = new Date(Date.UTC(2025, 8, 21));
    const key = dailyCacheKey('20250921');
    __TEST_ONLY__clearProgress(key);

    const a = await loadDailyPuzzle(date);
    const b = await loadDailyPuzzle(date);
    expect(b.seed).toBe(a.seed);
    const stored = await loadProgress<typeof a>(key);
    expect(stored?.seed).toBe(a.seed);
  });
});
