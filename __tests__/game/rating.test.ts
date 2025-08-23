import { ratePuzzle, classifyByClues } from '../../app/game/engine/rating';
import { DIFFICULTY_THRESHOLDS } from '../../app/game/engine/difficulty';
import type { Digit } from '../../app/game/types';

function makeGivens(count: number) {
  const res: { row: number; col: number; value: Digit }[] = [];
  let r = 0;
  let c = 0;
  for (let i = 0; i < count; i++) {
    res.push({ row: r, col: c, value: 1 as Digit });
    c++;
    if (c >= 9) {
      c = 0;
      r++;
      if (r >= 9) r = 0;
    }
  }
  return res;
}

describe('rating engine (#159/#160)', () => {
  it('classifies by clue thresholds', () => {
    for (const [tier, t] of Object.entries(DIFFICULTY_THRESHOLDS)) {
      const mid = Math.floor((t.minClues + t.maxClues) / 2);
      const d = classifyByClues(mid);
      expect(d).toBe(tier);
    }
  });

  it('rates under 800ms on small samples', () => {
    const givens = makeGivens(30);
    const { analyzedMs } = ratePuzzle(givens);
    expect(analyzedMs).toBeLessThan(800);
  });
});
