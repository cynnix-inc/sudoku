import type { Difficulty } from '../types';
import { generatePuzzle } from '../engine/generator';

export type DailySeed = {
  utcDate: string; // YYYYMMDD
  patternId: string; // single uppercase letter A-D (weekly pattern mix)
  difficulty: Difficulty; // lowercase tier per app/game/types
};

// Weekly difficulty mixes (Monday → Sunday)
// Pattern A is the base; B/C/D are rotations of the base for variety.
const BASE_WEEK_MIX: Difficulty[] = [
  'easy', // Mon
  'medium', // Tue
  'hard', // Wed
  'expert', // Thu
  'master', // Fri
  'extreme', // Sat
  'medium', // Sun (cool-down)
];

const WEEK_MIXES: Difficulty[][] = [
  BASE_WEEK_MIX,
  // rotate by 1..3 to produce B, C, D
  rotate(BASE_WEEK_MIX, 1),
  rotate(BASE_WEEK_MIX, 2),
  rotate(BASE_WEEK_MIX, 3),
];

function rotate<T>(arr: readonly T[], by: number): T[] {
  const n = arr.length;
  const k = ((by % n) + n) % n;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

function getIsoWeekIndex(date: Date): number {
  const y = date.getUTCFullYear();
  const jan4 = new Date(Date.UTC(y, 0, 4));
  const week1Monday = new Date(jan4.getTime() - ((jan4.getUTCDay() + 6) % 7) * 86400000);
  return Math.floor((date.getTime() - week1Monday.getTime()) / (7 * 86400000));
}

function getUtcWeekdayIndex(date: Date): number {
  // Convert JS Sunday=0..Saturday=6 to ISO Monday=0..Sunday=6
  const d = date.getUTCDay();
  return (d + 6) % 7;
}

export function getPatternIdForDate(date: Date): 'A' | 'B' | 'C' | 'D' {
  const weekIndex = getIsoWeekIndex(date);
  const idx = ((weekIndex % 4) + 4) % 4;
  return String.fromCharCode('A'.charCodeAt(0) + idx) as 'A' | 'B' | 'C' | 'D';
}

export function createDailySeed(date: Date): DailySeed {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const utcDate = `${y}${m}${d}`;
  const patternId = getPatternIdForDate(date);
  const difficulty = difficultyForDate(date); // derived from weekly mix + weekday
  return { utcDate, patternId, difficulty };
}

export function formatDailySeed(seed: DailySeed): string {
  return `${seed.utcDate}-${seed.patternId}-${seed.difficulty}`;
}

export function difficultyForDate(date: Date): Difficulty {
  const weekIndex = getIsoWeekIndex(date);
  const patternIdx = ((weekIndex % WEEK_MIXES.length) + WEEK_MIXES.length) % WEEK_MIXES.length;
  const weekdayIdx = getUtcWeekdayIndex(date);
  const mix = WEEK_MIXES[patternIdx]!;
  return mix[weekdayIdx]!;
}

export function generateDailyPuzzle(date: Date) {
  const seed = createDailySeed(date);
  const seedString = formatDailySeed(seed);
  return generatePuzzle({ seed: seedString, difficulty: seed.difficulty });
}

// Screen component for Daily mode
// Using a colocated default export at app/game/daily to allow route '/daily'
export { default as default } from '../../daily.screen';
