import { generatePuzzle } from '../../app/game/engine/generator';

describe('Ultimate Levels generator', () => {
  const seed = 'test-seed-1234';

  it('generates Novice within clue window', () => {
    const p = generatePuzzle({ seed, level: 'novice' });
    expect(p.givens.length).toBeGreaterThanOrEqual(36);
    expect(p.givens.length).toBeLessThanOrEqual(40);
  });

  it('generates Skilled within clue window', () => {
    const p = generatePuzzle({ seed, level: 'skilled' });
    expect(p.givens.length).toBeGreaterThanOrEqual(30);
    expect(p.givens.length).toBeLessThanOrEqual(34);
  });

  it('generates Ultimate within clue window', () => {
    const p = generatePuzzle({ seed, level: 'ultimate' });
    expect(p.givens.length).toBeGreaterThanOrEqual(17);
    expect(p.givens.length).toBeLessThanOrEqual(22);
  });
});
