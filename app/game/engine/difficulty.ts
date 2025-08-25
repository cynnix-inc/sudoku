import type { Difficulty } from '../types';

export type DifficultyThreshold = {
  minClues: number;
  maxClues: number; // inclusive upper bound
};

// Thresholds derived from product spec (MVP v0.9)
// Easy: ≥34 clues
// Medium: 28–33 clues
// Hard: 24–27 clues
export const DIFFICULTY_THRESHOLDS: Record<Difficulty, DifficultyThreshold> = {
  easy: { minClues: 34, maxClues: 81 },
  medium: { minClues: 28, maxClues: 33 },
  hard: { minClues: 24, maxClues: 27 },
  // Expert: 22–25 clues
  expert: { minClues: 22, maxClues: 25 },
  // Master: 20–23 clues
  master: { minClues: 20, maxClues: 23 },
  // Extreme: 17–20 clues
  extreme: { minClues: 17, maxClues: 20 },
};

export function isClueCountInDifficulty(difficulty: Difficulty, clueCount: number): boolean {
  const t = DIFFICULTY_THRESHOLDS[difficulty];
  return clueCount >= t.minClues && clueCount <= t.maxClues;
}
