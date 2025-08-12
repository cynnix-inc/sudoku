const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('spawnMistakeFloater', () => {
  test('appends floater to cell wrapper when present', () => {
    document.body.innerHTML = '<div><input class="cell" data-row="0" data-col="0" /></div>';
    const g = new SudokuGame({ headless: true });
    g.spawnMistakeFloater(0, 0);
    const floater = document.querySelector('.mistake-floater');
    expect(!!floater).toBe(true);
  });
});



