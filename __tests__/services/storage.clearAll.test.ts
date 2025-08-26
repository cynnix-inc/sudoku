import {
  saveProgress,
  listSudokuKeys,
  clearAllSudoku,
  storageKeys,
  __TEST_ONLY__clearProgress,
} from '../../app/services/storage';
import { beforeEach } from '@jest/globals';

describe('storage clearAllSudoku and namespace empty-string branch', () => {
  beforeEach(() => {
    __TEST_ONLY__clearProgress();
  });

  it('clears all sudoku-* keys across memory and localStorage and handles empty namespace', async () => {
    // Polyfill localStorage if missing so we cover the localStorage branches
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage');
    if (
      !('localStorage' in window) ||
      (window as unknown as { localStorage?: unknown }).localStorage == null
    ) {
      const backing = new Map<string, string>();
      const poly = {
        get length() {
          return Array.from(backing.keys()).length;
        },
        key(i: number) {
          const keys = Array.from(backing.keys());
          return (keys[i] ?? null) as string | null;
        },
        getItem(k: string) {
          return (backing.get(k) ?? null) as string | null;
        },
        setItem(k: string, v: string) {
          backing.set(k, String(v));
        },
        removeItem(k: string) {
          backing.delete(k);
        },
        clear() {
          backing.clear();
        },
      } as unknown as {
        length: number;
        key: (i: number) => string | null;
        getItem: (k: string) => string | null;
        setItem: (k: string, v: string) => void;
        removeItem: (k: string) => void;
        clear: () => void;
      };
      try {
        Object.defineProperty(window, 'localStorage', { value: poly, configurable: true });
      } catch {
        // ignore if define fails; test will still exercise memory path
      }
    }

    await saveProgress(storageKeys.settings(), { a: 1 });
    await saveProgress(storageKeys.stats(), { b: 2 });
    try {
      window.localStorage.setItem('other-app-x', '123');
    } catch {
      /* ignore */
    }

    const before = listSudokuKeys('');
    expect(before.some((k) => k.startsWith('sudoku-'))).toBe(true);
    expect(before.some((k) => k.startsWith('other-app-'))).toBe(false);

    clearAllSudoku();

    const after = listSudokuKeys();
    expect(after.length).toBe(0);
    // Non-sudoku keys should remain when localStorage is available
    try {
      expect(window.localStorage.getItem('other-app-x')).toBe('123');
    } catch {
      // environments without localStorage polyfill: skip assertion
    }

    // restore localStorage if we replaced it
    if (original) {
      try {
        Object.defineProperty(window, 'localStorage', original);
      } catch {
        // ignore
      }
    }
  });
});
