// Lightweight wrapper for web/local testing. For native, this could switch to AsyncStorage.
const memoryStore = new Map<string, string>();
export async function saveProgress(key: string, value: unknown): Promise<void> {
  try {
    const payload = JSON.stringify(value);
    if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
      window.localStorage.setItem(key, payload);
    } else {
      memoryStore.set(key, payload);
    }
  } catch {
    // ignore serialization/storage errors in tests
    return;
  }
}

export async function loadProgress<T>(key: string): Promise<T | null> {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } else if (memoryStore.has(key)) {
      return JSON.parse(memoryStore.get(key)!) as T;
    }
  } catch {
    // ignore parse/storage errors in tests
    return null;
  }
  return null;
}

// Unified storage key helpers for the Sudoku app namespace
const STORAGE_PREFIX = 'sudoku-';

export const storageKeys = {
  settings(): string {
    return `${STORAGE_PREFIX}settings`;
  },
  stats(): string {
    return `${STORAGE_PREFIX}stats`;
  },
  daily(utcDate: string): string {
    return `${STORAGE_PREFIX}daily-${utcDate}`;
  },
};

function keyMatchesNamespace(key: string, namespace?: string): boolean {
  if (!key.startsWith(STORAGE_PREFIX)) return false;
  if (!namespace) return true; // entire sudoku-* namespace
  return key.startsWith(`${STORAGE_PREFIX}${namespace}`);
}

// Clear keys in the sudoku namespace. If namespace omitted, clears all sudoku-* keys.
export function clearNamespace(namespace?: 'settings' | 'stats' | 'daily' | string): void {
  // memory store
  for (const key of Array.from(memoryStore.keys())) {
    if (keyMatchesNamespace(key, namespace)) {
      memoryStore.delete(key);
    }
  }
  // localStorage
  if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
    try {
      // Iterate backwards because removing items mutates length
      for (let i = window.localStorage.length - 1; i >= 0; i--) {
        const k = window.localStorage.key(i);
        if (k && keyMatchesNamespace(k, namespace)) {
          window.localStorage.removeItem(k);
        }
      }
    } catch {
      /* ignore */
    }
  }
}

// Clear all sudoku-* keys across stores
export function clearAllSudoku(): void {
  clearNamespace(undefined);
}

// Test-only helpers to avoid cross-test leakage when using storage fallbacks or jsdom localStorage
export function __TEST_ONLY__clearMemoryStore(): void {
  memoryStore.clear();
}
export function __TEST_ONLY__clearProgress(key?: string): void {
  if (key) {
    memoryStore.delete(key);
    if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    }
  } else {
    memoryStore.clear();
    if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
      try {
        window.localStorage.clear();
      } catch {
        /* ignore */
      }
    }
  }
}
