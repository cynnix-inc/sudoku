const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Generation internals (symmetric unique remove)', () => {
  test('removeNumbersSymmetricUnique leaves zeros and keeps uniqueness', () => {
    const g = new SudokuGame({ headless: true });
    g.generateSolvedBoard();
    g.solution = g.board.map(r => [...r]);
    g.removeNumbersSymmetricUnique(20);
    const zeros = g.board.flat().filter(v => v === 0).length;
    expect(zeros).toBeGreaterThan(0);
    expect(g.hasUniqueSolution()).toBe(true);
  });
});



