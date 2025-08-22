import { generatePuzzle } from '../../app/game/engine/generator';
import { isClueCountInDifficulty } from '../../app/game/engine/difficulty';
import { countSolutions, cloneGrid } from '../../app/game/engine/solver';

describe('generator (#159)', () => {
  it('is deterministic for the same seed', () => {
    const a = generatePuzzle({ seed: 'seed-123', minClues: 28 });
    const b = generatePuzzle({ seed: 'seed-123', minClues: 28 });
    expect(a.givens).toEqual(b.givens);
  });

  it('produces a uniquely solvable puzzle', () => {
    const { givens, solution } = generatePuzzle({ seed: 'seed-unique', minClues: 28 });
    const grid = cloneGrid(solution).map((row) => row.map(() => null)) as (
      | 1
      | 2
      | 3
      | 4
      | 5
      | 6
      | 7
      | 8
      | 9
      | null
    )[][];
    for (const g of givens) {
      grid[g.row]![g.col] = g.value;
    }
    // Cast to solver Grid type
    expect(
      countSolutions(grid as unknown as (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | null)[][], 2),
    ).toBe(1);
  });

  it('aims clue count to match difficulty thresholds when provided', () => {
    const { givens } = generatePuzzle({ seed: 'seed-medium', difficulty: 'medium' });
    const clues = givens.length;
    expect(isClueCountInDifficulty('medium', clues)).toBe(true);
  });
});
