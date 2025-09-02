import type { Digit } from '../types';

export type VariantName =
  | 'none'
  | 'diagonal' // Sudoku X
  | 'killer' // cages sum
  | 'thermo' // thermometer increasing
  | 'oddEven' // parity constraints
  | 'extraRegion'; // extra 3x3 region or irregular

export type VariantRule = {
  name: VariantName;
  enabled: boolean;
  // Minimal payloads to be elaborated in future issues
  data?: unknown;
};

export type VariantsConfig = {
  rules: VariantRule[];
};

export const DEFAULT_VARIANTS: VariantsConfig = {
  rules: [{ name: 'none', enabled: true }],
};

export type Grid = (Digit | null)[][];

export function applyVariantsMask(grid: Grid, _variants: VariantsConfig): Grid {
  // Scaffold: no-op until variants are implemented
  void _variants;
  return grid.map((row) => row.slice());
}

export function validateVariants(grid: Grid, _variants: VariantsConfig): boolean {
  // Scaffold: always true for now; future work will enforce constraints
  void _variants;
  void grid;
  return true;
}
