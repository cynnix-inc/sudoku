// Tiny dev logger; logs only in dev or when explicitly enabled
export function isDevLoggingEnabled() {
  try {
    if (typeof window === 'undefined') return false;
    const host = window.location && window.location.hostname;
    const flag = window.localStorage && window.localStorage.getItem('sudoku-debug') === '1';
    return flag || host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
}

export function devlog(...args) {
  try {
    if (!isDevLoggingEnabled()) return;
    // eslint-disable-next-line no-console
    console.debug('[DEV]', ...args);
  } catch {}
}

try {
  if (typeof window !== 'undefined') {
    window.__devlog = devlog;
  }
} catch {}
