// Game type registry and helpers. Keeps current default as 'classic' 9x9.

const CLASSIC = {
  id: 'classic',
  name: 'Classic',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: Array.from({ length: 9 }, (_, i) => String(i + 1)),
};

const DAILY = {
  id: 'daily',
  name: 'Daily',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: Array.from({ length: 9 }, (_, i) => String(i + 1)),
};

const REGISTRY = { classic: CLASSIC, daily: DAILY };

export function getGameType(id = 'classic') {
  return REGISTRY[id] || CLASSIC;
}

export function listGameTypes() {
  return Object.values(REGISTRY);
}

try {
  if (typeof window !== 'undefined') {
    window.SudokuTypes = { getGameType, listGameTypes };
  }
} catch {}



