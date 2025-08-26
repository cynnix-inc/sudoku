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

// --------------------------
// Storage health/audit utils
// --------------------------

export type StorageAuditEntry = {
  key: string;
  validJson: boolean;
  sizeBytes: number;
  store: 'memory' | 'localStorage';
};

export function listSudokuKeys(namespace?: string): string[] {
  const keys = new Set<string>();
  // memory
  for (const key of Array.from(memoryStore.keys())) {
    if (keyMatchesNamespace(key, namespace)) keys.add(key);
  }
  // localStorage
  if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && keyMatchesNamespace(k, namespace)) keys.add(k);
      }
    } catch {
      /* ignore */
    }
  }
  return Array.from(keys).sort();
}

export async function auditSudokuStorage(namespace?: string): Promise<StorageAuditEntry[]> {
  const results: StorageAuditEntry[] = [];

  function getByteLength(raw: string): number {
    try {
      const TE = (
        globalThis as unknown as { TextEncoder?: new () => { encode: (s: string) => Uint8Array } }
      ).TextEncoder;
      if (TE) return new TE().encode(raw).length;
    } catch {
      // ignore
    }
    const G = globalThis as unknown as {
      Buffer?: { byteLength: (s: string, enc?: string) => number };
    };
    try {
      if (G.Buffer && typeof G.Buffer.byteLength === 'function') {
        return G.Buffer.byteLength(raw, 'utf8');
      }
    } catch {
      // ignore
    }
    return raw.length;
  }

  // memory
  for (const key of Array.from(memoryStore.keys())) {
    if (!keyMatchesNamespace(key, namespace)) continue;
    const raw = memoryStore.get(key) ?? '';
    const sizeBytes = getByteLength(raw);
    let validJson = true;
    try {
      JSON.parse(raw);
    } catch {
      validJson = false;
    }
    results.push({ key, validJson, sizeBytes, store: 'memory' });
  }

  // localStorage
  if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key || !keyMatchesNamespace(key, namespace)) continue;
        const raw = window.localStorage.getItem(key) ?? '';
        const sizeBytes = getByteLength(raw);
        let validJson = true;
        try {
          JSON.parse(raw);
        } catch {
          validJson = false;
        }
        results.push({ key, validJson, sizeBytes, store: 'localStorage' });
      }
    } catch {
      /* ignore */
    }
  }

  return results.sort((a, b) => a.key.localeCompare(b.key));
}
