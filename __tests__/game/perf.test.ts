// Minimal perf sanity checks for generator and strategies (#162)
import { generatePuzzle } from '../../app/game/engine/generator';
import { solveWithStrategies } from '../../app/game/engine/strategy';
import { initializeGame } from '../../app/game/state';

// Soft thresholds chosen to be generous in CI environments
const GENERATE_MS_SOFT_LIMIT = 500; // ms
const SINGLES_MS_SOFT_LIMIT = 500; // ms

function measureMs(fn: () => void): number {
  const start = Date.now();
  fn();
  return Date.now() - start;
}

describe('performance benchmarks (#162)', () => {
  it('generates a medium puzzle under soft limit', () => {
    const elapsed = measureMs(() => {
      void generatePuzzle({ seed: 'perf-seed', difficulty: 'medium' });
    });
    expect(elapsed).toBeLessThan(GENERATE_MS_SOFT_LIMIT);
  });

  it('runs singles strategies under soft limit on trivial near-solved board', () => {
    const { givens } = generatePuzzle({ seed: 'perf-solve', difficulty: 'easy' });
    const game = initializeGame(givens, { difficulty: 'easy', maxLives: 3 });
    const elapsed = measureMs(() => {
      void solveWithStrategies(game.board);
    });
    expect(elapsed).toBeLessThan(SINGLES_MS_SOFT_LIMIT);
  });
});
