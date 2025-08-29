import { generatePuzzle } from '../../app/game/engine/generator';
import { solveWithStrategies } from '../../app/game/engine/strategy';
import { initializeGame } from '../../app/game/state';

// Harder caps for guard rails; relaxed on CI
const isCI = !!process.env['CI'];
const GEN_MED_HARD = isCI ? 1200 : 900;
const GEN_EXP_HARD = isCI ? 2800 : 2000;
const STRATS_HARD = isCI ? 1200 : 900;

function measureMs(fn: () => void): number {
  const start = Date.now();
  fn();
  return Date.now() - start;
}

describe('performance guard rails (#341)', () => {
  it('generator medium under hard cap', () => {
    const elapsed = measureMs(() => {
      void generatePuzzle({ seed: 'guard-seed-med', difficulty: 'medium' });
    });
    expect(elapsed).toBeLessThan(GEN_MED_HARD);
  });

  it('generator expert under hard cap', () => {
    const elapsed = measureMs(() => {
      void generatePuzzle({ seed: 'guard-seed-exp', difficulty: 'expert' });
    });
    expect(elapsed).toBeLessThan(GEN_EXP_HARD);
  });

  it('singles strategies under hard cap', () => {
    const { givens } = generatePuzzle({ seed: 'guard-solve', difficulty: 'easy' });
    const game = initializeGame(givens, { difficulty: 'easy', maxLives: 3 });
    const elapsed = measureMs(() => {
      void solveWithStrategies(game.board);
    });
    expect(elapsed).toBeLessThan(STRATS_HARD);
  });
});
