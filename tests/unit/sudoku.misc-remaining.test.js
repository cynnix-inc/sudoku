const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Remaining behaviors', () => {
  test('isGameInProgress depends on history and flags', () => {
    const g = new SudokuGame({ headless: true });
    expect(g.isGameInProgress()).toBe(false);
    g.history.push({});
    expect(g.isGameInProgress()).toBe(true);
    g.isGameComplete = true;
    expect(g.isGameInProgress()).toBe(false);
  });

  test('applyZenMode toggles zen flag and DOM class', () => {
    const g = new SudokuGame({ headless: true });
    g.applyZenMode(true);
    expect(g._zenMode).toBe(true);
    expect(document.documentElement.classList.contains('zen')).toBe(true);
    g.applyZenMode(false);
    expect(document.documentElement.classList.contains('zen')).toBe(false);
  });

  test('updateDailyIconBadge shows a dot when daily incomplete', () => {
    document.body.innerHTML = '<span id="menu-daily-item-dot" style="display:none"></span>';
    const g = new SudokuGame({ headless: true });
    const key = g.getUtcDateKey();
    localStorage.setItem('sudoku-daily-results', JSON.stringify({ [key]: { completed: false } }));
    g.updateDailyIconBadge();
    const dot = document.getElementById('menu-daily-item-dot');
    expect(dot.style.display).toBe('inline-block');
  });

  test('updateCellDisplay writes value and clears error on correct value', () => {
    // set up one cell
    document.body.innerHTML = '<div id="board"><div><input class="cell" data-row="0" data-col="0" /></div></div>';
    const g = new SudokuGame({ headless: true });
    g.board = [[5]]; g.solution = [[5]]; g.initialBoard = [[0]];
    g.updateCellDisplay(0,0);
    const cell = document.querySelector('.cell');
    expect(cell.value).toBe('5');
    expect(cell.classList.contains('error')).toBe(false);
  });

  test('startDailyCountdown creates interval and updates once', () => {
    const g = new SudokuGame({ headless: true });
    // Should not throw; side effects are timer creation
    g.startDailyCountdown();
    expect(typeof g._dailyTimer !== 'undefined').toBe(true);
    clearInterval(g._dailyTimer);
  });
});



