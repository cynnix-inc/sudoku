import type { Difficulty } from '../types';
import type { UltimateLevel } from '../engine/levels';
import { generatePuzzle } from '../engine/generator';

export type DailySeed = {
  utcDate: string; // YYYYMMDD
  patternId: string; // single uppercase letter A-Z
  difficulty: Difficulty; // legacy tier used for seed format & lives mapping
  level: UltimateLevel; // Ultimate Sudoku level displayed in UI
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
  const level = levelForDate(date);
  const difficulty = difficultyForDate(date);
  return { utcDate, patternId, difficulty, level };
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

export function levelForDate(date: Date): UltimateLevel {
  const levels: UltimateLevel[] = [
    'novice',
    'skilled',
    'advanced',
    'expert',
    'fiendish',
    'ultimate',
  ];
  const start = Date.UTC(2025, 0, 6); // Monday baseline for rotation
  const weekIndex = Math.floor((date.getTime() - start) / (7 * 86400000));
  return levels[((weekIndex % levels.length) + levels.length) % levels.length]!;
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

export function generateDailyPuzzle(date: Date) {
  const seed = createDailySeed(date);
  const seedString = formatDailySeed(seed);
  // Use Ultimate level path for generation while keeping legacy difficulty for seed stability
  return generatePuzzle({ seed: seedString, level: seed.level });
}

// Screen component for Daily mode
// Using a colocated default export at app/game/daily to allow route '/daily'
export { default as default } from '../../daily.screen';
