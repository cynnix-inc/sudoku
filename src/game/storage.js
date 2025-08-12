// Local storage helpers and simple namespacing. No DOM dependencies.

const ns = (key) => `sudoku-${key}`;

export function safeGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(ns(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function safeSet(key, value) {
  try {
    localStorage.setItem(ns(key), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function safeRemove(key) {
  try {
    localStorage.removeItem(ns(key));
    return true;
  } catch {
    return false;
  }
}

export const storage = { get: safeGet, set: safeSet, remove: safeRemove };

try {
  if (typeof window !== 'undefined') window.SudokuStorage = storage;
} catch {}


