import type { Digit } from '../types';
import { createRng, hashStringToSeed, shuffled } from './random';
import { cloneGrid, countSolutions } from './solver';

export type GenerateOptions = {
  seed: string;
  minClues?: number; // rough target
};

export type GeneratedPuzzle = {
  givens: { row: number; col: number; value: Digit }[];
  solution: (Digit | null)[][];
};

// Very basic generator: fill a complete valid grid randomly, then remove clues while preserving uniqueness
export function generatePuzzle(options: GenerateOptions): GeneratedPuzzle {
  const { seed, minClues = 28 } = options;
  const rng = createRng(hashStringToSeed(seed));

  // Step 1: generate full solution by backtracking with randomized order
  const empty: (Digit | null)[][] = Array.from({ length: 9 }, () => Array(9).fill(null));
  const digits: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  function isValid(grid: (Digit | null)[][], row: number, col: number, value: Digit): boolean {
    for (let c = 0; c < 9; c++) if (c !== col && (grid[row]![c] ?? null) === value) return false;
    for (let r = 0; r < 9; r++) if (r !== row && (grid[r]![col] ?? null) === value) return false;
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        if (!(r === row && c === col) && (grid[r]![c] ?? null) === value) return false;
      }
    }
    return true;
  }

  function fill(grid: (Digit | null)[][]): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if ((grid[r]![c] ?? null) == null) {
          for (const v of shuffled(digits, rng)) {
            if (isValid(grid, r, c, v)) {
              grid[r]![c] = v;
              if (fill(grid)) return true;
              grid[r]![c] = null;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  const solution = cloneGrid(empty);
  if (!fill(solution)) {
    throw new Error('Failed to fill solution');
  }

  // Step 2: remove clues while keeping unique solution
  const cells = shuffled(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number]),
    rng,
  );
  const puzzle = cloneGrid(solution);
  let clues = 81;
  for (const [r, c] of cells) {
    if (clues <= minClues) break;
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
