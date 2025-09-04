import type { Difficulty } from '../types';
import type { UltimateLevel } from '../engine/levels';
import { generatePuzzle } from '../engine/generator';

export type DailySeed = {
  utcDate: string; // YYYYMMDD
  patternId: string; // single uppercase letter A-D (weekly mix id)
  difficulty: Difficulty; // legacy tier used for seed format & lives mapping
  level: UltimateLevel; // Ultimate Sudoku level displayed in UI
};

// Four predefined weekly difficulty mixes (Mon..Sun)
// A balanced rotation per ADR-0002 and MVP v0.9
const WEEKLY_MIXES: Difficulty[][] = [
  // A
  ['easy', 'medium', 'hard', 'expert', 'master', 'extreme', 'medium'],
  // B
  ['medium', 'hard', 'expert', 'master', 'extreme', 'hard', 'easy'],
  // C
  ['hard', 'expert', 'master', 'extreme', 'hard', 'medium', 'easy'],
  // D
  ['expert', 'master', 'extreme', 'hard', 'medium', 'easy', 'medium'],
];

function getIsoWeekZeroBasedIndex(date: Date): number {
  // Baseline Monday for rotation: 2025-01-06 (UTC)
  const baselineMonday = Date.UTC(2025, 0, 6);
  return Math.floor((date.getTime() - baselineMonday) / (7 * 86400000));
}

function getWeekMixIndex(date: Date): number {
  const idx = getIsoWeekZeroBasedIndex(date);
  const mod = ((idx % WEEKLY_MIXES.length) + WEEKLY_MIXES.length) % WEEKLY_MIXES.length;
  return mod;
}

function getDayOfWeekIndexUtc(date: Date): number {
  // Monday=0 .. Sunday=6
  return (date.getUTCDay() + 6) % 7;
}

export function createDailySeed(date: Date): DailySeed {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const utcDate = `${y}${m}${d}`;
  // Weekly pattern id A..D and difficulty from predefined mixes
  const mixIndex = getWeekMixIndex(date);
  const patternId = String.fromCharCode('A'.charCodeAt(0) + mixIndex);
  const difficulty = difficultyForDate(date);
  const level = levelForDate(date);
  return { utcDate, patternId, difficulty, level };
}

export function formatDailySeed(seed: DailySeed): string {
  return `${seed.utcDate}-${seed.patternId}-${seed.difficulty}`;
}

export function difficultyForDate(date: Date): Difficulty {
  const mixIndex = getWeekMixIndex(date);
  const maybeMix = WEEKLY_MIXES[mixIndex];
  const safeMix: Difficulty[] = Array.isArray(maybeMix) ? maybeMix : WEEKLY_MIXES[0]!;
  const dayIdx = getDayOfWeekIndexUtc(date);
  const val = safeMix[dayIdx];
  return val ?? 'medium';
}

export function levelForDate(date: Date): UltimateLevel {
  const difficulty = difficultyForDate(date);
  return mapDifficultyToLevel(difficulty);
}

export function mapLevelToDifficulty(level: UltimateLevel): Difficulty {
  switch (level) {
    case 'novice':
      return 'easy';
    case 'skilled':
      return 'medium';
    case 'advanced':
      return 'hard';
    case 'expert':
      return 'expert';
    case 'fiendish':
      return 'master';
    case 'ultimate':
      return 'extreme';
  }
}

export function mapDifficultyToLevel(difficulty: Difficulty): UltimateLevel {
  switch (difficulty) {
    case 'easy':
      return 'novice';
    case 'medium':
      return 'skilled';
    case 'hard':
      return 'advanced';
    case 'expert':
      return 'expert';
    case 'master':
      return 'fiendish';
    case 'extreme':
      return 'ultimate';
  }
}

export function generateDailyPuzzle(date: Date) {
  const seed = createDailySeed(date);
  const seedString = formatDailySeed(seed);
  // Use Ultimate level path for generation while keeping legacy difficulty for seed stability
  return generatePuzzle({ seed: seedString, level: seed.level });
}

// Screen component for Daily mode
// Using a colocated default export at app/game/daily to allow route '/daily'
export { default as default } from '../../daily.screen';
