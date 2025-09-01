import { createRng, hashStringToSeed } from './random';

export type UltimateLevel = 'novice' | 'skilled' | 'advanced' | 'expert' | 'fiendish' | 'ultimate';

export type LevelRecipe = {
  minClues: number;
  maxClues: number;
  // Placeholder: list of technique identifiers to validate against in solver
  allowedTechniques: string[];
};

export const LEVEL_RECIPES: Record<UltimateLevel, LevelRecipe> = {
  novice: {
    minClues: 36,
    maxClues: 40,
    allowedTechniques: ['nakedSingle', 'hiddenSingle'],
  },
  skilled: {
    minClues: 30,
    maxClues: 34,
    allowedTechniques: [
      'nakedSingle',
      'hiddenSingle',
      'lockedCandidates',
      'nakedPair',
      'hiddenPair',
      'boxLine',
    ],
  },
  advanced: {
    minClues: 26,
    maxClues: 30,
    allowedTechniques: [
      'nakedSingle',
      'hiddenSingle',
      'lockedCandidates',
      'nakedPair',
      'hiddenPair',
      'nakedTriple',
      'pointingPairs',
      'pointingTriples',
      'simpleColoring',
    ],
  },
  expert: {
    minClues: 22,
    maxClues: 26,
    allowedTechniques: [
      'xWing',
      'swordfish',
      'multiColoring',
      'lockedCandidates',
      'pairsTriples',
      'singles',
    ],
  },
  fiendish: {
    minClues: 20,
    maxClues: 24,
    allowedTechniques: ['xyWing', 'xyzWing', 'forcingChains', 'alternatingChains'],
  },
  ultimate: {
    minClues: 17,
    maxClues: 22,
    allowedTechniques: ['nishio', 'uniqueness', 'longChains', 'advancedColoring'],
  },
};

export function pickTargetCluesForLevel(seed: string, level: UltimateLevel): number {
  const { minClues, maxClues } = LEVEL_RECIPES[level];
  const rng = createRng(hashStringToSeed(`${seed}#lvl#${level}#target`));
  const span = Math.max(0, maxClues - minClues);
  const offset = Math.floor(rng() * Math.min(3, span + 1));
  return Math.max(minClues, Math.min(maxClues, maxClues - offset));
}
