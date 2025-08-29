import { ratePuzzle, classifyByClues } from '../../app/game/engine/rating';
import { DIFFICULTY_THRESHOLDS } from '../../app/game/engine/difficulty';
import { makeLinearGivens } from '../utils/fixtures';

describe('rating engine (#159/#160)', () => {
  it('classifies by clue thresholds', () => {
    for (const [tier, t] of Object.entries(DIFFICULTY_THRESHOLDS)) {
      const mid = Math.floor((t.minClues + t.maxClues) / 2);
      const d = classifyByClues(mid);
      expect(d).toBe(tier);
    }
  });

  it('rates under 800ms on small samples', () => {
    const givens = makeLinearGivens(30);
    const { analyzedMs } = ratePuzzle(givens);
    expect(analyzedMs).toBeLessThan(800);
  });
});
