import type { Difficulty, Digit } from '../types';
import { generatePuzzle } from '../engine/generator';

export type DailySeed = {
  dateUtcYYYYMMDD: string;
  patternId: string; // e.g., A,B,C...
  difficulty: Difficulty;
};

export function formatDailySeed(seed: DailySeed): string {
  return `${seed.dateUtcYYYYMMDD}-${seed.patternId}-${seed.difficulty}`;
}

// Simple weekly rotation pattern
const WEEKLY_PATTERN: Difficulty[] = [
  'easy',
  'medium',
  'hard',
  'expert',
  'master',
  'extreme',
  'medium',
];

export function difficultyForDate(dateUtc: Date): Difficulty {
  const start = new Date(Date.UTC(2025, 0, 6)); // Monday, Jan 6, 2025 baseline
  const days = Math.floor((dateUtc.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  const idx = ((days % 7) + 7) % 7;
  return WEEKLY_PATTERN[idx] ?? 'medium';
}

export function createDailySeed(dateUtc: Date): DailySeed {
  const yyyy = dateUtc.getUTCFullYear().toString();
  const mm = String(dateUtc.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dateUtc.getUTCDate()).padStart(2, '0');
  const difficulty = difficultyForDate(dateUtc);
  const patternId = String.fromCharCode('A'.charCodeAt(0) + ((dateUtc.getUTCDate() - 1) % 7));
  return { dateUtcYYYYMMDD: `${yyyy}${mm}${dd}`, patternId, difficulty };
}

export function generateDailyPuzzle(dateUtc: Date): {
  givens: { row: number; col: number; value: Digit }[];
  difficulty: Difficulty;
} {
  const seed = createDailySeed(dateUtc);
  const puzzle = generatePuzzle({ seed: formatDailySeed(seed), difficulty: seed.difficulty });
  return { givens: puzzle.givens, difficulty: seed.difficulty };
}
