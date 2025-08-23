import { generatePuzzle } from '../../app/game/engine/generator';
import { isClueCountInDifficulty } from '../../app/game/engine/difficulty';

describe('generator paths coverage', () => {
  it('produces in-range puzzles for several tiers', () => {
    const tiers: ('medium' | 'hard' | 'expert' | 'master')[] = [
      'medium',
      'hard',
      'expert',
      'master',
    ];
    for (const tier of tiers) {
      const { givens } = generatePuzzle({ seed: `cov-${tier}`, difficulty: tier });
      expect(isClueCountInDifficulty(tier, givens.length)).toBe(true);
    }
  });

  it('respects minClues legacy path', () => {
    const { givens } = generatePuzzle({ seed: 'cov-legacy', minClues: 30 });
    expect(givens.length).toBeGreaterThanOrEqual(30);
  });
});
