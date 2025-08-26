import {
  auditSudokuStorage,
  listSudokuKeys,
  saveProgress,
  storageKeys,
  __TEST_ONLY__clearProgress,
} from '../../app/services/storage';

describe('storage audit/list coverage bump', () => {
  it('audits and lists sudoku namespace keys', async () => {
    __TEST_ONLY__clearProgress();
    await saveProgress(storageKeys.settings(), { x: 1 });
    await saveProgress(storageKeys.stats(), { y: 2 });
    const today = new Date();
    const y = today.getUTCFullYear();
    const m = String(today.getUTCMonth() + 1).padStart(2, '0');
    const d = String(today.getUTCDate()).padStart(2, '0');
    const utc = `${y}${m}${d}`;
    await saveProgress(storageKeys.dailyProgress(utc), { z: 3 });

    const keys = listSudokuKeys();
    expect(keys.some((k) => k.startsWith('sudoku-'))).toBe(true);

    const audit = await auditSudokuStorage();
    expect(audit.length).toBeGreaterThanOrEqual(3);
    expect(audit.every((e) => typeof e.sizeBytes === 'number')).toBe(true);
  });
});
