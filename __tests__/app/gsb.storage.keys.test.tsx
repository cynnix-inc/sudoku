import { storageKeys } from '../../app/services/storage';

describe('GameScreenBase storage keys (Daily) (#306)', () => {
  it('computes per-UTC-date key via storageKeys.daily', () => {
    const today = new Date();
    const y = today.getUTCFullYear();
    const m = String(today.getUTCMonth() + 1).padStart(2, '0');
    const d = String(today.getUTCDate()).padStart(2, '0');
    const utcDate = `${y}${m}${d}`;
    const key = storageKeys.daily(utcDate);
    expect(key).toBe(`sudoku-daily-${utcDate}`);
  });

  it('computes per-UTC-date progress key via storageKeys.dailyProgress', () => {
    const today = new Date();
    const y = today.getUTCFullYear();
    const m = String(today.getUTCMonth() + 1).padStart(2, '0');
    const d = String(today.getUTCDate()).padStart(2, '0');
    const utcDate = `${y}${m}${d}`;
    const key = storageKeys.dailyProgress(utcDate);
    expect(key).toBe(`sudoku-progress-daily-${utcDate}`);
  });
});
