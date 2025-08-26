import { beforeEach } from '@jest/globals';
import {
  __TEST_ONLY__clearProgress,
  saveProgress,
  listSudokuKeys,
  auditSudokuStorage,
  storageKeys,
} from '../../app/services/storage';

describe('storage health & conflicts (#52)', () => {
  beforeEach(() => {
    __TEST_ONLY__clearProgress();
  });

  it('lists sudoku-* keys and audits JSON validity', async () => {
    await saveProgress(storageKeys.settings(), { ok: true });
    await saveProgress(storageKeys.stats(), { played: 1 });
    const keys = listSudokuKeys();
    expect(keys).toEqual(expect.arrayContaining([storageKeys.settings(), storageKeys.stats()]));

    const audit = await auditSudokuStorage();
    const settingsRow = audit.find((r) => r.key === storageKeys.settings());
    expect(settingsRow?.validJson).toBe(true);
  });
});
