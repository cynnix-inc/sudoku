import type { Difficulty } from '../types';
import { generatePuzzle } from '../engine/generator';

export type DailySeed = {
  utcDate: string; // YYYYMMDD
  patternId: string; // single uppercase letter A-Z
  difficulty: Difficulty; // lowercase tier per app/game/types
};

export function createDailySeed(date: Date): DailySeed {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const utcDate = `${y}${m}${d}`;
  // Rotate a simple pattern weekly: A..Z cycling based on ISO week number
  const jan4 = new Date(Date.UTC(y, 0, 4));
  const week1Monday = new Date(jan4.getTime() - ((jan4.getUTCDay() + 6) % 7) * 86400000);
  const weekIndex = Math.floor((date.getTime() - week1Monday.getTime()) / (7 * 86400000));
  const patternId = String.fromCharCode('A'.charCodeAt(0) + (weekIndex % 26));
  const difficulty = difficultyForDate(date);
  return { utcDate, patternId, difficulty };
}

export function formatDailySeed(seed: DailySeed): string {
  return `${seed.utcDate}-${seed.patternId}-${seed.difficulty}`;
}

export function difficultyForDate(date: Date): Difficulty {
  // Cycle tiers weekly: easy, medium, hard, expert, master, extreme
  const tiers: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'master', 'extreme'];
  const start = Date.UTC(2025, 0, 6); // Monday baseline for rotation
  const weekIndex = Math.floor((date.getTime() - start) / (7 * 86400000));
  return tiers[((weekIndex % tiers.length) + tiers.length) % tiers.length]!;
}

export function generateDailyPuzzle(date: Date) {
  const seed = createDailySeed(date);
  const seedString = formatDailySeed(seed);
  return generatePuzzle({ seed: seedString, difficulty: seed.difficulty });
}

// Screen component for Daily mode
// Using a colocated default export at app/game/daily to allow route '/daily'
export { default as default } from '../../daily.screen';
