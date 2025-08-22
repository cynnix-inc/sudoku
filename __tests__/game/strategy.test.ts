import { createEmptyBoard, getCell } from '../../app/game/state';
import type { Board, Digit } from '../../app/game/types';
import {
  computeCandidates,
  findNextStep,
  solveWithStrategies,
} from '../../app/game/engine/strategy';

function boardFromValues(values: (Digit | null)[][]): Board {
  const b = createEmptyBoard();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = values[r]?.[c] ?? null;
      if (v != null) {
        const cell = getCell(b, r, c);
        cell.value = v;
        cell.isGiven = true;
      }
    }
  }
  return b;
}

describe('strategy ladder basics (#161)', () => {
  it('computes candidates and finds a naked single', () => {
    // Simple row missing a single value 5 in position (0,2)
    const start = boardFromValues([
      [1, 2, null, 4, 5, 6, 7, 8, 9],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
    ]);
    const cands = computeCandidates(start, 0, 2);
    expect(cands).toContain(3);
    const step = findNextStep(start);
    expect(step).toBeTruthy();
    expect(step?.technique).toBe('nakedSingle');
  });

  it('solves trivial grid using singles-only techniques', () => {
    const start = boardFromValues([
      [1, 2, 3, 4, 5, 6, 7, 8, null],
      [4, 5, 6, 7, 8, 9, 1, 2, 3],
      [7, 8, 9, 1, 2, 3, 4, 5, 6],
      [2, 3, 4, 5, 6, 7, 8, 9, 1],
      [5, 6, 7, 8, 9, 1, 2, 3, 4],
      [8, 9, 1, 2, 3, 4, 5, 6, 7],
      [3, 4, 5, 6, 7, 8, 9, 1, 2],
      [6, 7, 8, 9, 1, 2, 3, 4, 5],
      [9, 1, 2, 3, 4, 5, 6, 7, 8],
    ]);
    const { solved, steps } = solveWithStrategies(start);
    expect(solved).toBe(true);
    expect(steps.length).toBeGreaterThan(0);
  });
});
