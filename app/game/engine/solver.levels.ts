import type { Board } from '../types';
import type { UltimateLevel } from './levels';
import { LEVEL_RECIPES } from './levels';
import { solveWithStrategies, type Technique } from './strategy';

export function techniquesForLevel(level: UltimateLevel): Technique[] {
  const recipe = LEVEL_RECIPES[level];
  // Narrow to techniques implemented in strategy.ts for now
  const known: Technique[] = ['nakedSingle', 'hiddenSingle'];
  return known.filter((t) => recipe.allowedTechniques.includes(t));
}

export function solveBoardByLevel(board: Board, level: UltimateLevel) {
  const techniques = techniquesForLevel(level);
  return solveWithStrategies(board, techniques);
}
