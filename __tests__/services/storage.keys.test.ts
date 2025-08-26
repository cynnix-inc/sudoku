import { beforeEach } from '@jest/globals';
import {
  storageKeys,
  clearNamespace,
  clearAllSudoku,
  __TEST_ONLY__clearProgress,
  saveProgress,
  loadProgress,
} from '../../app/services/storage';

describe('storage keys & namespace clearing (#169)', () => {
  beforeEach(() => {
    __TEST_ONLY__clearProgress();
  });

  it('produces stable keys for settings, stats, and daily', () => {
    expect(storageKeys.settings()).toBe('sudoku-settings');
    expect(storageKeys.stats()).toBe('sudoku-stats');
    expect(storageKeys.daily('20250101')).toBe('sudoku-daily-20250101');
  });

  it('clears only the targeted namespace when provided', async () => {
    await saveProgress(storageKeys.settings(), { a: 1 });
    await saveProgress(storageKeys.stats(), { b: 2 });
    await saveProgress(storageKeys.daily('20250101'), { c: 3 });

    clearNamespace('stats');

    const s = await loadProgress(storageKeys.settings());
    const st = await loadProgress(storageKeys.stats());
    const d = await loadProgress(storageKeys.daily('20250101'));
    expect(s).not.toBeNull();
    expect(st).toBeNull();
    expect(d).not.toBeNull();
  });

  it('clears all sudoku-* keys when namespace omitted', async () => {
    await saveProgress(storageKeys.settings(), { a: 1 });
    await saveProgress(storageKeys.stats(), { b: 2 });
    await saveProgress(storageKeys.daily('20250101'), { c: 3 });

    clearAllSudoku();

    const s = await loadProgress(storageKeys.settings());
    const st = await loadProgress(storageKeys.stats());
    const d = await loadProgress(storageKeys.daily('20250101'));
    expect(s).toBeNull();
    expect(st).toBeNull();
    expect(d).toBeNull();
  });
});
