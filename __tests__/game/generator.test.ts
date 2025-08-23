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
    const tiers: ('medium' | 'hard' | 'expert' | 'master' | 'extreme')[] = [
      'medium',
      'hard',
      'expert',
      'master',
      'extreme',
    ];
    for (const tier of tiers) {
      let matched = false;
      for (let i = 0; i < 5 && !matched; i++) {
        const { givens } = generatePuzzle({ seed: `seed-${tier}-${i}`, difficulty: tier });
        const clues = givens.length;
        matched = isClueCountInDifficulty(tier, clues);
      }
      expect(matched).toBe(true);
    }
  });
});
