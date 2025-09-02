import { initializeGame } from '../../app/game/state';
import { solveBoardByLevel, techniquesForLevel } from '../../app/game/engine/solver.levels';
import type { Digit } from '../../app/game/types';

function givensFromString(rows: string[]): { row: number; col: number; value: Digit }[] {
  const givens: { row: number; col: number; value: Digit }[] = [];
  rows.forEach((line, r) => {
    line.split('').forEach((ch, c) => {
      if (/[1-9]/.test(ch)) givens.push({ row: r, col: c, value: Number(ch) as Digit });
    });
  });
  return givens;
}

describe('solver level gating', () => {
  it('Novice uses singles-only techniques', () => {
    const rows = [
      '53..7....',
      '6..195...',
      '.98....6.',
      '8...6...3',
      '4..8.3..1',
      '7...2...6',
      '.6....28.',
      '...419..5',
      '....8..79',
    ];
    const givens = givensFromString(rows);
    const game = initializeGame(givens, { difficulty: 'easy', maxLives: 3 });
    const allowed = techniquesForLevel('novice');
    expect(allowed).toEqual(['nakedSingle', 'hiddenSingle']);
    const { steps } = solveBoardByLevel(game.board, 'novice');
    const used = Array.from(new Set(steps.map((s) => s.technique)));
    for (const t of used) expect(allowed).toContain(t);
  });
});
