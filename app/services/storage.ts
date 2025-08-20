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
