// Minimal perf sanity checks for generator and strategies (#162)
import { generatePuzzle } from '../../app/game/engine/generator';
import { solveWithStrategies } from '../../app/game/engine/strategy';
import { initializeGame } from '../../app/game/state';

// Soft thresholds chosen to be generous; CI is slower, use higher caps there
const isCI = !!process.env['CI'];
const GENERATE_MS_SOFT_LIMIT = isCI ? 900 : 700; // ms
const SINGLES_MS_SOFT_LIMIT = isCI ? 900 : 700; // ms

function measureMs(fn: () => void): number {
  const start = Date.now();
  fn();
  return Date.now() - start;
}

// On CI, still run but with relaxed thresholds above
const maybeDescribe = describe;

maybeDescribe('performance benchmarks (#162)', () => {
  it('generates a medium puzzle under soft limit', () => {
    const elapsed = measureMs(() => {
      void generatePuzzle({ seed: 'perf-seed', difficulty: 'medium' });
    });
    expect(elapsed).toBeLessThan(GENERATE_MS_SOFT_LIMIT);
  });

  it('generates an expert puzzle under soft limit (higher cost)', () => {
    const elapsed = measureMs(() => {
      void generatePuzzle({ seed: 'perf-seed-expert', difficulty: 'expert' });
    });
    const limit = process.env['CI'] ? GENERATE_MS_SOFT_LIMIT * 3 : GENERATE_MS_SOFT_LIMIT * 2.5;
    expect(elapsed).toBeLessThan(limit);
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
