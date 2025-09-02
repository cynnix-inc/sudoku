import type { Digit } from '../types';

export type IllusionReport = {
  hasContradictionSetup: boolean;
  nishioCandidates: number;
};

export function analyzeIllusions(grid: (Digit | null)[][]): IllusionReport {
  // Scaffold detection: metrics only
  let nishioCandidates = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r]![c] == null) nishioCandidates++;
    }
  }
  return {
    hasContradictionSetup: nishioCandidates > 60,
    nishioCandidates,
  };
}
