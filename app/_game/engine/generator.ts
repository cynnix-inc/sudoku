import type { Digit, Difficulty } from '../types';
import { createRng, hashStringToSeed, shuffled } from './random';
import { cloneGrid, countSolutions } from './solver';
import { pickTargetClues, generateMask, symmetryModes } from './masks';

export type GenerateOptions = {
  seed: string;
  difficulty?: Difficulty; // if provided, aim to meet clue thresholds fast
  minClues?: number; // legacy/override when uniqueness mode used
};

export type GeneratedPuzzle = {
  givens: { row: number; col: number; value: Digit }[];
  solution: (Digit | null)[][];
};

function generateSolvedGrid(seed: string): (Digit | null)[][] {
  const rng = createRng(hashStringToSeed(`${seed}#solved`));

  // Base Latin pattern: (r*3 + floor(r/3) + c) % 9 + 1
  const base = (r: number, c: number) => (((r * 3 + Math.floor(r / 3) + c) % 9) + 1) as Digit;

  // Helper to shuffle indices with band/stack structure for valid permutations
  const bands = [0, 1, 2];
  const stacks = [0, 1, 2];
  const bandOrder = bands.slice().sort(() => (rng() < 0.5 ? -1 : 1));
  const stackOrder = stacks.slice().sort(() => (rng() < 0.5 ? -1 : 1));

  const rows: number[] = [];
  for (const b of bandOrder) {
    const within = [0, 1, 2].sort(() => (rng() < 0.5 ? -1 : 1));
    for (const i of within) rows.push(b * 3 + i);
  }

  const cols: number[] = [];
  for (const s of stackOrder) {
    const within = [0, 1, 2].sort(() => (rng() < 0.5 ? -1 : 1));
    for (const i of within) cols.push(s * 3 + i);
  }

  // Optional digit relabeling to diversify solutions while staying valid
  const digits: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const relabeled = digits.slice().sort(() => (rng() < 0.5 ? -1 : 1));
  const mapDigit = (d: Digit): Digit => relabeled[d - 1]! as Digit;

  const grid: (Digit | null)[][] = Array.from({ length: 9 }, () => Array(9).fill(null));
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      grid[r]![c] = mapDigit(base(rows[r]!, cols[c]!));
    }
  }
  return grid;
}

export function generatePuzzle(options: GenerateOptions): GeneratedPuzzle {
  const { seed, difficulty, minClues } = options;

  // Always compute a solved grid quickly
  const solution = cloneGrid(generateSolvedGrid(seed));

  if (difficulty) {
    // Fast path: honor clue thresholds without expensive uniqueness checks
    const target = pickTargetClues(seed, difficulty);
    // Cycle through symmetry modes for variety
    const modes = symmetryModes(seed);
    let attempts = 0;
    let mask: boolean[][] | null = null;
    while (attempts < 4) {
      const mode = modes.next().value;
      mask = generateMask(seed, target, mode);
      if (mask) break;
      attempts++;
    }

    const givens: { row: number; col: number; value: Digit }[] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (mask![r]![c]) {
          givens.push({ row: r, col: c, value: solution[r]![c]! });
        }
      }
    }
    return { givens, solution };
  }

  // Fallback uniqueness mode: remove clues while preserving a single solution
  const rng = createRng(hashStringToSeed(seed));
  const puzzle = cloneGrid(solution);
  const cells = shuffled(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number]),
    rng,
  );
  let clues = 81;
  const targetMin = minClues ?? 28;
  for (const [r, c] of cells) {
    if (clues <= targetMin) break;
    const backup = puzzle[r]![c]!;
    puzzle[r]![c] = null;
    const gridCopy = cloneGrid(puzzle);
    const num = countSolutions(gridCopy, 2);
    if (num !== 1) {
      puzzle[r]![c] = backup; // restore to keep uniqueness
    } else {
      clues--;
    }
  }

  const givens: { row: number; col: number; value: Digit }[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = puzzle[r]![c] ?? null;
      if (v != null) givens.push({ row: r, col: c, value: v });
    }
  }

  return { givens, solution };
}
