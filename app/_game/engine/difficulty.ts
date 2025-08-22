import type { Difficulty } from '../types';

export type DifficultyThreshold = {
  minClues: number;
  maxClues: number; // inclusive upper bound
};

// Thresholds derived from product spec (MVP v0.9)
// Easy: ≥34 clues
// Medium: 28–33 clues
// Hard: 24–27 clues
export const DIFFICULTY_THRESHOLDS = {
  easy: { minClues: 34, maxClues: 81 },
  medium: { minClues: 28, maxClues: 33 },
  hard: { minClues: 24, maxClues: 27 },
} as const satisfies Record<Difficulty, DifficultyThreshold>;

export function isClueCountInDifficulty(difficulty: Difficulty, clueCount: number): boolean {
  const t = DIFFICULTY_THRESHOLDS[difficulty];
  return clueCount >= t.minClues && clueCount <= t.maxClues;
}
