const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Mobile usability behaviors', () => {
  beforeEach(() => {
    // Force touch-capable environment in tests
    try { Object.defineProperty(window.navigator, 'maxTouchPoints', { value: 1, configurable: true }); } catch {}
    // Provide vibrate stub
    window.navigator.vibrate = jest.fn();
  });

  test('cells use inputmode="none" in touch mode', () => {
    const game = new SudokuGame({ headless: false });
    const cells = Array.from(document.querySelectorAll('.cell'));
    expect(cells.length).toBe(81);
    for (const cell of cells) {
      expect(cell.getAttribute('inputmode')).toBe('none');
    }
  });

  test('board binds pointer handlers and sets touch-action none', () => {
    const game = new SudokuGame({ headless: false });
    const board = document.getElementById('board');
    expect(board).toBeTruthy();
    // handler presence (cannot easily introspect listeners; rely on class methods existing)
    expect(typeof game.onBoardPointerDown).toBe('function');
    // style applied for improved responsiveness
    expect(board.style.touchAction).toBe('none');
  });

  test('double‑tap erases editable cell', () => {
    const game = new SudokuGame({ headless: false });
    // Make (0,0) editable and set a value
    game.initialBoard[0][0] = 0;
    game.board[0][0] = 5;
    game.updateDisplay();
    const cell = document.querySelector('.cell[data-row="0"][data-col="0"]');
    // First tap
    game.onBoardPointerDown({ target: cell, clientX: 0, clientY: 0, pointerId: 1, preventDefault: () => {} });
    // Second tap within 300ms
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValueOnce(now + 200);
    game.onBoardPointerDown({ target: cell, clientX: 0, clientY: 0, pointerId: 1, preventDefault: () => {} });
    // After double-tap, value cleared
    expect(game.board[0][0]).toBe(0);
  });

  test('notes press‑and‑hold temporarily enables notes', () => {
    const game = new SudokuGame({ headless: false });
    const notesBtn = document.getElementById('notes-toggle');
    expect(notesBtn).toBeTruthy();
    // Ensure initial is off
    game.isNotesMode = false;
    // Pointer down should enable notes while held
    // Simulate touch pointerdown (pointerType:'touch') to trigger hold
    notesBtn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }));
    expect(game.isNotesMode).toBe(true);
    // Releasing restores
    window.dispatchEvent(new Event('pointerup', { bubbles: true }));
    expect(game.isNotesMode).toBe(false);
  });

  test('haptics vibrate fires on user actions when supported', () => {
    const game = new SudokuGame({ headless: false });
    // Prepare editable cell
    game.initialBoard[1][1] = 0;
    game.board[1][1] = 0;
    game.setCellValue(1, 1, 7, 'numpad');
    expect(window.navigator.vibrate).toHaveBeenCalled();
  });
});


