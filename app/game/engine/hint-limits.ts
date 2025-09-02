import type { Difficulty } from '../types';

/**
 * Get the maximum number of hints allowed for a given difficulty level.
 * Based on MVP requirements: Easy 5, Medium 3, Hard 2, Expert 1, Master 0, Extreme 0.
 */
export function getHintLimit(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 5;
    case 'medium':
      return 3;
    case 'hard':
      return 2;
    case 'expert':
      return 1;
    case 'master':
    case 'extreme':
      return 0;
    default:
      return 0;
  }
}

/**
 * Check if hints are available for a given difficulty and current usage.
 */
export function areHintsAvailable(difficulty: Difficulty, hintsUsed: number): boolean {
  return hintsUsed < getHintLimit(difficulty);
}

/**
 * Get the number of hints remaining for a given difficulty and current usage.
 */
export function getHintsRemaining(difficulty: Difficulty, hintsUsed: number): number {
  return Math.max(0, getHintLimit(difficulty) - hintsUsed);
}
