import {
  saveProgress,
  loadProgress,
  listSudokuKeys,
  clearNamespace,
  storageKeys,
  auditSudokuStorage,
  __TEST_ONLY__clearProgress,
} from '../../app/services/storage';
import { beforeEach } from '@jest/globals';

describe('storage error paths and namespace filters', () => {
  beforeEach(() => {
    __TEST_ONLY__clearProgress();
  });

  it('handles JSON.stringify errors in saveProgress', async () => {
    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;
    const key = storageKeys.settings();
    await saveProgress(key, cyclic);
    const loaded = await loadProgress<typeof cyclic>(key);
    expect(loaded).toBeNull();
  });

  it('handles invalid JSON in loadProgress', async () => {
    const key = storageKeys.stats();
    try {
      window.localStorage.setItem(key, '{not-json');
    } catch {
      /* ignore */
    }
    const loaded = await loadProgress<Record<string, unknown>>(key);
    expect(loaded).toBeNull();
  });

  it('clearNamespace filters by prefix correctly', async () => {
    const today = new Date();
    const y = today.getUTCFullYear();
    const m = String(today.getUTCMonth() + 1).padStart(2, '0');
    const d = String(today.getUTCDate()).padStart(2, '0');
    const utc = `${y}${m}${d}`;

    const kDaily = storageKeys.daily(utc);
    const kDailyProgress = storageKeys.dailyProgress(utc);
    const kClassicProgress = storageKeys.classicProgress();

    await saveProgress(kDaily, { a: 1 });
    await saveProgress(kDailyProgress, { b: 2 });
    await saveProgress(kClassicProgress, { c: 3 });

    clearNamespace('daily');
    const afterDaily = listSudokuKeys();
    expect(afterDaily).toContain(kDailyProgress);
    expect(afterDaily).toContain(kClassicProgress);
    expect(afterDaily).not.toContain(kDaily);

    clearNamespace('progress-daily');
    const afterProgressDaily = listSudokuKeys();
    expect(afterProgressDaily).toContain(kClassicProgress);
    expect(afterProgressDaily).not.toContain(kDailyProgress);
  });

  it('listSudokuKeys can filter to progress namespace', async () => {
    await saveProgress(storageKeys.settings(), { a: 1 });
    await saveProgress(storageKeys.classicProgress(), { b: 2 });
    const onlyProgress = listSudokuKeys('progress');
    expect(onlyProgress.length).toBeGreaterThan(0);
    expect(onlyProgress.every((k) => k.startsWith('sudoku-progress'))).toBe(true);
  });

  it('audits memory store path when localStorage is unavailable', async () => {
    const desc = Object.getOwnPropertyDescriptor(window, 'localStorage');
    try {
      Object.defineProperty(window, 'localStorage', { value: undefined });
    } catch {
      /* ignore */
    }
    await saveProgress(storageKeys.settings(), { q: 1 });
    if (desc) {
      Object.defineProperty(window, 'localStorage', desc);
    }
    const audit = await auditSudokuStorage();
    expect(audit.some((e) => e.store === 'memory')).toBe(true);
  });
});
