import { loadProgress, saveProgress } from './storage';
import { createDailySeed, formatDailySeed, generateDailyPuzzle } from '../game/daily';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type CachedDaily = {
  seed: string;
  givens: { row: number; col: number; value: number }[];
  solution: (number | null)[][];
  savedAtMs: number;
};

export function dailyCacheKey(utcDate: string): string {
  return `sudoku-daily-${utcDate}`;
}

export async function loadDailyPuzzle(date: Date): Promise<CachedDaily> {
  const seedObj = createDailySeed(date);
  const utcDate = seedObj.utcDate;
  const key = dailyCacheKey(utcDate);
  const cached = await loadProgress<CachedDaily>(key);
  const now = Date.now();
  if (cached && now - cached.savedAtMs <= THIRTY_DAYS_MS) {
    return cached;
  }

  const generated = generateDailyPuzzle(date);
  const seed = formatDailySeed(seedObj);
  const payload: CachedDaily = {
    seed,
    givens: generated.givens,
    solution: generated.solution,
    savedAtMs: now,
  };
  await saveProgress(key, payload);
  return payload;
}
