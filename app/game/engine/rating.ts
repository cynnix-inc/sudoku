import type { Difficulty, Digit } from '../types';
import { DIFFICULTY_THRESHOLDS } from './difficulty';
import { initializeGame } from '../state';
import { solveWithStrategies } from './strategy';

export type Given = { row: number; col: number; value: Digit };

export type RatingResult = {
  difficulty: Difficulty;
  clueCount: number;
  techniquesUsed: string[];
  analyzedMs: number;
};

export function ratePuzzle(givens: Given[]): RatingResult {
  const start = Date.now();
  const clueCount = givens.length;
  // First pass: classify by thresholds (fast path)
  const difficulty = classifyByClues(clueCount);
  // Optional lightweight technique pass using singles to avoid heavy cost
  const game = initializeGame(givens as Array<{ row: number; col: number; value: Digit }>, {
    difficulty,
    maxLives: 3,
  });
  const { steps } = solveWithStrategies(game.board, ['nakedSingle', 'hiddenSingle'], 200);
  const techniquesUsed = Array.from(new Set(steps.map((s) => s.technique)));
  const analyzedMs = Date.now() - start;
  return { difficulty, clueCount, techniquesUsed, analyzedMs };
}

export function classifyByClues(clueCount: number): Difficulty {
  // Check ranges in descending strictness to match upper bounds first
  for (const [tier, t] of Object.entries(DIFFICULTY_THRESHOLDS) as [
    Difficulty,
    { minClues: number; maxClues: number },
  ][]) {
    if (clueCount >= t.minClues && clueCount <= t.maxClues) return tier;
  }
  // Fallback: clamp to closest bucket by comparing distance to minClues
  // Prefer harder tier if below all mins
  const tiers = Object.keys(DIFFICULTY_THRESHOLDS) as Difficulty[];
  let best: { tier: Difficulty; distance: number } | null = null;
  for (const tier of tiers) {
    const t = DIFFICULTY_THRESHOLDS[tier];
    const distance = clueCount < t.minClues ? t.minClues - clueCount : clueCount - t.maxClues;
    if (!best || distance < best.distance) best = { tier, distance };
  }
  return best ? best.tier : 'medium';
}
