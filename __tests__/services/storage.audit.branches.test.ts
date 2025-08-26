import {
  auditSudokuStorage,
  saveProgress,
  storageKeys,
  __TEST_ONLY__clearProgress,
} from '../../app/services/storage';
import { beforeEach } from '@jest/globals';

describe('storage audit getByteLength branches', () => {
  beforeEach(() => {
    __TEST_ONLY__clearProgress();
  });

  it('uses TextEncoder when available, falls back to Buffer.byteLength or raw length', async () => {
    await saveProgress(storageKeys.settings(), { a: 1 });

    const G = globalThis as unknown as {
      TextEncoder?: new () => { encode: (s: string) => Uint8Array };
      Buffer?: { byteLength: (s: string, enc?: string) => number };
    };

    const originalTE = G.TextEncoder;
    const originalBuf = G.Buffer;

    try {
      // TextEncoder path
      G.TextEncoder = class {
        encode(s: string) {
          return new Uint8Array(s.length);
        }
      } as unknown as typeof G.TextEncoder;
      const auditWithTE = await auditSudokuStorage();
      expect(auditWithTE.length).toBeGreaterThan(0);

      // Buffer.byteLength path
      G.TextEncoder = undefined;
      G.Buffer = { byteLength: (s: string) => s.length } as unknown as typeof G.Buffer;
      const auditWithBuf = await auditSudokuStorage();
      expect(auditWithBuf.length).toBeGreaterThan(0);

      // Raw length path
      G.Buffer = undefined;
      const auditRaw = await auditSudokuStorage();
      expect(auditRaw.length).toBeGreaterThan(0);
    } finally {
      G.TextEncoder = originalTE;
      G.Buffer = originalBuf;
    }
  });
});
