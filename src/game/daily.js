// Daily helpers extracted from the main game class. Stateless utilities.

export function getUtcDateKey(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

export function parseUtcKeyToDate(key) {
  const y = parseInt(key.slice(0, 4));
  const m = parseInt(key.slice(4, 6)) - 1;
  const d = parseInt(key.slice(6, 8));
  return new Date(Date.UTC(y, m, d));
}

export function getNextUtcMidnight(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
}

export function getWeekSeedFromDateKey(key) {
  const dt = parseUtcKeyToDate(key);
  const dow = dt.getUTCDay();
  const sunday = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate() - dow));
  return getUtcDateKey(sunday);
}

export function buildWeeklyPattern(weekSeed, createSeededRng) {
  const rng = createSeededRng('W:' + weekSeed);
  const mixes = [
    ['easy', 'medium', 'hard', 'medium', 'expert', 'medium', 'hard'],
    ['medium', 'medium', 'hard', 'expert', 'medium', 'hard', 'medium'],
    ['easy', 'medium', 'hard', 'expert', 'master', 'medium', 'hard'],
    ['medium', 'hard', 'expert', 'hard', 'medium', 'master', 'extreme'],
  ];
  return mixes[Math.floor(rng() * mixes.length)];
}

export function getDifficultyForDateKey(key, createSeededRng) {
  const seed = getWeekSeedFromDateKey(key);
  const pattern = buildWeeklyPattern(seed, createSeededRng);
  const dt = parseUtcKeyToDate(key);
  const day = dt.getUTCDay();
  return pattern[day] || 'medium';
}

export function getDailyDifficulty(createSeededRng) {
  const key = getUtcDateKey();
  return getDifficultyForDateKey(key, createSeededRng);
}

try {
  if (typeof window !== 'undefined') {
    window.SudokuDaily = {
      getUtcDateKey,
      parseUtcKeyToDate,
      getNextUtcMidnight,
      getWeekSeedFromDateKey,
      buildWeeklyPattern,
      getDifficultyForDateKey,
      getDailyDifficulty,
    };
  }
} catch {}


