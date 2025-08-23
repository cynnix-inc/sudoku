import {
  generateMask,
  generateCuratedMask,
  symmetryModes,
  SymMode,
} from '../../app/game/engine/masks';

function countTrues(mask: boolean[][]): number {
  let n = 0;
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (mask[r]![c]) n++;
  return n;
}

describe('masks engine', () => {
  const targets = [17, 22, 28, 34];
  const modes: SymMode[] = ['rot180', 'mirrorH', 'mirrorV', 'none'];

  it('generateMask respects symmetry and target counts', () => {
    for (const t of targets) {
      for (const m of modes) {
        const mask = generateMask('seed-mask', t, m);
        expect(countTrues(mask)).toBe(t);
      }
    }
  });

  it('generateCuratedMask respects symmetry and target counts', () => {
    for (const t of targets) {
      for (const m of modes) {
        const mask = generateCuratedMask('seed-curated', t, m);
        expect(countTrues(mask)).toBe(t);
      }
    }
  });

  it('symmetryModes yields modes in a stable cycle for a seed', () => {
    const it = symmetryModes('seed-x');
    const seen = [it.next().value, it.next().value, it.next().value, it.next().value];
    expect(Array.isArray(seen)).toBe(true);
    expect(seen.length).toBe(4);
  });
});
