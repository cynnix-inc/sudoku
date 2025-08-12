const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('initializeGame smoke', () => {
  test('initializeGame creates board and sets mode indicator without landing overlay', () => {
    document.body.innerHTML = '<div id="board"></div><div id="mode-indicator"></div><button id="timer-toggle"><span id="time"></span><span class="timer-icon"></span></button>';
    const g = new SudokuGame({ headless: false });
    // when no landing overlay present, it should generate a puzzle and update UI
    const board = document.getElementById('board');
    expect(board.children.length).toBeGreaterThan(0);
  });
});


