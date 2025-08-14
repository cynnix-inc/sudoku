// Game type registry and helpers. Keeps current default as 'classic' 9x9.
// This file defines metadata only. Most types are marked as `wip: true` and are
// not yet wired into generation or UI. Existing behavior remains unchanged.

const CLASSIC = {
  id: 'classic',
  name: 'Classic',
  icon: '🔢',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: Array.from({ length: 9 }, (_, i) => String(i + 1)),
};

const DAILY = {
  id: 'daily',
  name: 'Daily',
  icon: '📅',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: Array.from({ length: 9 }, (_, i) => String(i + 1)),
};

// Helpers for symbol sets
function digits(n) {
  return Array.from({ length: n }, (_, i) => String(i + 1));
}

function alphanumForSize(n) {
  // Returns 1-9 then A.. for sizes > 9 (e.g., 12 => 1-9,A,B,C ; 16 => 1-9,A..G)
  if (n <= 9) return digits(n);
  const extra = n - 9;
  return digits(9).concat(Array.from({ length: extra }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i)));
}

// Classic variants: Mini/Max boards (same rules scaled)
const CLASSIC_4 = {
  id: 'classic-4',
  name: 'Classic 4x4',
  icon: '4️⃣',
  size: 4,
  box: { rows: 2, cols: 2 },
  symbols: digits(4),
  wip: true,
};

const CLASSIC_6 = {
  id: 'classic-6',
  name: 'Classic 6x6',
  icon: '6️⃣',
  size: 6,
  box: { rows: 2, cols: 3 },
  symbols: digits(6),
  wip: true,
};

const CLASSIC_12 = {
  id: 'classic-12',
  name: 'Classic 12x12',
  icon: '🔢',
  size: 12,
  box: { rows: 3, cols: 4 },
  symbols: alphanumForSize(12),
  wip: true,
};

const CLASSIC_16 = {
  id: 'classic-16',
  name: 'Classic 16x16',
  icon: '🔢',
  size: 16,
  box: { rows: 4, cols: 4 },
  symbols: alphanumForSize(16),
  wip: true,
};

// Wordoku / Color (representation-focused variants; rules are classic unless combined)
const WORDOKU_9 = {
  id: 'wordoku-9',
  name: 'Wordoku 9x9',
  icon: '🔠',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: Array.from({ length: 9 }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i)),
  representation: { type: 'letters' },
  // Theme-specific nine-letter sets (internal validation still uses symbols)
  themes: [
    { id: 'pocket-beasts', name: 'Pocket Beasts', letters: ['B','E','A','S','T','L','O','R','D'] }, // BEASTLORD
    { id: 'galaxy-saga', name: 'Galaxy Saga', letters: ['S','T','A','R','B','O','U','N','D'] }, // STARBOUND
    { id: 'mystic-runes', name: 'Mystic Runes', letters: ['M','A','G','I','Q','U','E','S','T'] }, // MAGIQUEST
    { id: 'elemental-realms', name: 'Elemental Realms', letters: ['E','A','R','T','H','W','I','N','D'] }, // EARTHWIND
    { id: 'treasure-isles', name: 'Treasure Isles', letters: ['S','H','I','P','W','R','E','C','K'] }, // SHIPWRECK
  ],
  wip: true,
};

const COLOR_9 = {
  id: 'color-9',
  name: 'Color 9x9',
  icon: '🎨',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: digits(9),
  representation: { type: 'colors' },
  // Approved color/theme palettes (colorblind-conscious, high contrast)
  themes: [
    {
      id: 'pocket-beasts',
      name: 'Pocket Beasts',
      palette: ['#E69F00','#56B4E9','#009E73','#F0E442','#0072B2','#D55E00','#CC79A7','#999999','#333333'],
    },
    {
      id: 'galaxy-saga',
      name: 'Galaxy Saga',
      palette: ['#0B3D91','#56B4E9','#F0E442','#E69F00','#009E73','#CC79A7','#D55E00','#93A1A1','#073642'],
    },
    {
      id: 'mystic-runes',
      name: 'Mystic Runes',
      palette: ['#3B1E5A','#56B4E9','#E69F00','#009E73','#CC79A7','#F0E442','#0072B2','#9E9E9E','#2F2F2F'],
    },
    {
      id: 'elemental-realms',
      name: 'Elemental Realms',
      palette: ['#8D5524','#1E88E5','#E53935','#43A047','#F0E442','#0072B2','#D55E00','#999999','#37474F'],
    },
    {
      id: 'treasure-isles',
      name: 'Treasure Isles',
      palette: ['#C7923E','#004D61','#2A6F97','#63A1C8','#F0E442','#7B3F00','#009E73','#9E9E9E','#263238'],
    },
  ],
  wip: true,
};

// Icons/avatars (graphic tokens), internal symbols remain digits 1..9
const ICONS_9 = {
  id: 'icons-9',
  name: 'Icons 9x9',
  icon: '🔣',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: digits(9),
  representation: { type: 'icons' },
  themes: [
    {
      id: 'pocket-beasts',
      name: 'Pocket Beasts',
      tokens: ['claw','paw','wing','horn','scale','flame','leaf','fang','shell'],
    },
    {
      id: 'galaxy-saga',
      name: 'Galaxy Saga',
      tokens: ['star','planet','comet','rocket','satellite','asteroid','nebula','galaxy','eclipse'],
    },
    {
      id: 'mystic-runes',
      name: 'Mystic Runes',
      tokens: ['sun','moon','river','mountain','fire','wind','earth','spirit','time'],
    },
    {
      id: 'elemental-realms',
      name: 'Elemental Realms',
      tokens: ['fire','water','earth','air','metal','wood','light','shadow','aether'],
    },
    {
      id: 'treasure-isles',
      name: 'Treasure Isles',
      tokens: ['compass','anchor','wheel','map','key','ruby','coin','chest','spyglass'],
    },
  ],
  wip: true,
};

// Most popular
const DIAGONAL = {
  id: 'diagonal',
  name: 'Diagonal (Sudoku X)',
  icon: '❌',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: digits(9),
  constraints: ['classic', 'diagonals'],
  wip: true,
};

const KILLER = {
  id: 'killer',
  name: 'Killer (Sum Cages)',
  icon: '🧮',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: digits(9),
  constraints: ['classic', 'killer'],
  meta: { cages: [] },
  wip: true,
};

const JIGSAW = {
  id: 'jigsaw',
  name: 'Jigsaw / Irregular',
  icon: '🧩',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: digits(9),
  constraints: ['rows', 'cols', 'regions-irregular'],
  meta: { regions: [] },
  wip: true,
};

// 5 rarest
const GIRANDOLA = {
  id: 'girandola',
  name: 'Girandola',
  icon: '🌀',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: digits(9),
  constraints: ['classic', 'girandola'],
  meta: { shapes: [] },
  wip: true,
};

const ASTERISK = {
  id: 'asterisk',
  name: 'Asterisk',
  icon: '✳️',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: digits(9),
  constraints: ['classic', 'asterisk'],
  meta: { starCells: [] },
  wip: true,
};

const TOROIDAL = {
  id: 'toroidal',
  name: 'Toroidal',
  icon: '♾️',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: digits(9),
  constraints: ['rows-wrap', 'cols-wrap', 'boxes-wrap'],
  wip: true,
};

const FORTRESS = {
  id: 'fortress',
  name: 'Fortress',
  icon: '🏰',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: digits(9),
  constraints: ['classic', 'fortress'],
  meta: { shadedCells: [] },
  wip: true,
};

const CLONE = {
  id: 'clone',
  name: 'Clone',
  icon: '🪞',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: digits(9),
  constraints: ['classic', 'clone'],
  meta: { cloneGroups: [] },
  wip: true,
};

// 5 with a cult-like following
const ARROW = {
  id: 'arrow',
  name: 'Arrow',
  icon: '➡️',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: digits(9),
  constraints: ['classic', 'arrow'],
  meta: { arrows: [] },
  wip: true,
};

const THERMO = {
  id: 'thermo',
  name: 'Thermo',
  icon: '🌡️',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: digits(9),
  constraints: ['classic', 'thermo'],
  meta: { thermometers: [] },
  wip: true,
};

const GERMAN_WHISPERS = {
  id: 'german-whispers',
  name: 'German Whispers',
  icon: '〰️',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: digits(9),
  constraints: ['classic', 'german-whispers'],
  meta: { lines: [] },
  wip: true,
};

const KROPKI = {
  id: 'kropki',
  name: 'Kropki',
  icon: '⚪⚫',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: digits(9),
  constraints: ['classic', 'kropki'],
  meta: { dots: [] },
  wip: true,
};

const SANDWICH = {
  id: 'sandwich',
  name: 'Sandwich',
  icon: '🥪',
  size: 9,
  box: { rows: 3, cols: 3 },
  symbols: digits(9),
  constraints: ['classic', 'sandwich'],
  meta: { clues: [] },
  wip: true,
};

const REGISTRY = {
  classic: CLASSIC,
  daily: DAILY,
  // Classic variants
  'classic-4': CLASSIC_4,
  'classic-6': CLASSIC_6,
  'classic-12': CLASSIC_12,
  'classic-16': CLASSIC_16,
  // Representation variants (not yet wired)
  'wordoku-9': WORDOKU_9,
  'color-9': COLOR_9,
  'icons-9': ICONS_9,
  // Most popular
  diagonal: DIAGONAL,
  killer: KILLER,
  jigsaw: JIGSAW,
  // 5 rarest
  girandola: GIRANDOLA,
  asterisk: ASTERISK,
  toroidal: TOROIDAL,
  fortress: FORTRESS,
  clone: CLONE,
  // Cult favorites
  arrow: ARROW,
  thermo: THERMO,
  'german-whispers': GERMAN_WHISPERS,
  kropki: KROPKI,
  sandwich: SANDWICH,
};

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



