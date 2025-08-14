// Representation helpers for mapping digits (1..9) to letters/colors/icons by theme.
// Non-rendering: provides pure data mappings so core can annotate DOM without altering behavior.

const LETTER_THEMES = [
  { id: 'pocket-beasts', name: 'Pocket Beasts', letters: ['B','E','A','S','T','L','O','R','D'] },
  { id: 'galaxy-saga', name: 'Galaxy Saga', letters: ['S','T','A','R','B','O','U','N','D'] },
  { id: 'mystic-runes', name: 'Mystic Runes', letters: ['M','A','G','I','Q','U','E','S','T'] },
  { id: 'elemental-realms', name: 'Elemental Realms', letters: ['E','A','R','T','H','W','I','N','D'] },
  { id: 'treasure-isles', name: 'Treasure Isles', letters: ['S','H','I','P','W','R','E','C','K'] },
];

const COLOR_THEMES = [
  { id: 'pocket-beasts', name: 'Pocket Beasts', palette: ['#E69F00','#56B4E9','#009E73','#F0E442','#0072B2','#D55E00','#CC79A7','#999999','#333333'] },
  { id: 'galaxy-saga', name: 'Galaxy Saga', palette: ['#0B3D91','#56B4E9','#F0E442','#E69F00','#009E73','#CC79A7','#D55E00','#93A1A1','#073642'] },
  { id: 'mystic-runes', name: 'Mystic Runes', palette: ['#3B1E5A','#56B4E9','#E69F00','#009E73','#CC79A7','#F0E442','#0072B2','#9E9E9E','#2F2F2F'] },
  { id: 'elemental-realms', name: 'Elemental Realms', palette: ['#8D5524','#1E88E5','#E53935','#43A047','#F0E442','#0072B2','#D55E00','#999999','#37474F'] },
  { id: 'treasure-isles', name: 'Treasure Isles', palette: ['#C7923E','#004D61','#2A6F97','#63A1C8','#F0E442','#7B3F00','#009E73','#9E9E9E','#263238'] },
];

const ICON_THEMES = [
  { id: 'pocket-beasts', name: 'Pocket Beasts', tokens: ['claw','paw','wing','horn','scale','flame','leaf','fang','shell'] },
  { id: 'galaxy-saga', name: 'Galaxy Saga', tokens: ['star','planet','comet','rocket','satellite','asteroid','nebula','galaxy','eclipse'] },
  { id: 'mystic-runes', name: 'Mystic Runes', tokens: ['sun','moon','river','mountain','fire','wind','earth','spirit','time'] },
  { id: 'elemental-realms', name: 'Elemental Realms', tokens: ['fire','water','earth','air','metal','wood','light','shadow','aether'] },
  { id: 'treasure-isles', name: 'Treasure Isles', tokens: ['compass','anchor','wheel','map','key','ruby','coin','chest','spyglass'] },
];

export function getThemesForMode(mode) {
  if (mode === 'letters') return LETTER_THEMES;
  if (mode === 'colors') return COLOR_THEMES;
  if (mode === 'icons') return ICON_THEMES;
  return [];
}

export function mapDigitToRepresentation(value, { mode = 'numbers', themeId = 'pocket-beasts' } = {}) {
  const v = Number(value);
  if (!Number.isFinite(v) || v < 1 || v > 9) return '';
  if (mode === 'letters') {
    const t = LETTER_THEMES.find(t => t.id === themeId) || LETTER_THEMES[0];
    return t.letters[v - 1] || '';
  }
  if (mode === 'colors') {
    const t = COLOR_THEMES.find(t => t.id === themeId) || COLOR_THEMES[0];
    return t.palette[v - 1] || '';
  }
  if (mode === 'icons') {
    const t = ICON_THEMES.find(t => t.id === themeId) || ICON_THEMES[0];
    return t.tokens[v - 1] || '';
  }
  return String(v);
}

try {
  if (typeof window !== 'undefined') {
    window.SudokuRepresentation = { getThemesForMode, mapDigitToRepresentation };
  }
} catch {}


