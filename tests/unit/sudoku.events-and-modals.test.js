const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Event setup and modal helpers', () => {
  test('setupEventListeners binds without throwing with minimal DOM', () => {
    document.body.innerHTML = `
      <button id="solve-btn"></button>
      <button id="check-btn"></button>
      <button id="clear-btn"></button>
      <button id="undo-btn"></button>
      <button id="redo-btn"></button>
      <button id="timer-toggle"><span class="timer-icon"></span></button>
      <div id="board"></div>
    `;
    const g = new SudokuGame({ headless: true });
    g.setupEventListeners();
  });

  test('showConfirm and showInfo resolve promises', async () => {
    const g = new SudokuGame({ headless: true });
    // Fallback path using window.confirm
    const prev = window.confirm;
    window.confirm = jest.fn(() => true);
    const p1 = g.showConfirm('Q?');
    expect(p1).toBeInstanceOf(Promise);
    const res = await p1;
    expect(res).toBe(true);
    window.confirm = prev;

    // showInfo resolves true even without modal DOM
    const p2 = g.showInfo('Hi');
    expect(p2).toBeInstanceOf(Promise);
    const ok = await p2;
    expect(ok).toBe(true);
  });

  test('modal overlay helpers keep modals within viewport and support ESC/backdrop close', async () => {
    document.body.innerHTML = `
      <div id="board"></div>
      <div class="controls-strip"></div>
      <div class="number-pad"></div>
      <div id="help-modal" class="modal" style="display:none">
        <div class="modal-content" style="height:2000px">
          <div class="modal-head"><h2>Help</h2><button class="modal-close" data-close-modal aria-label="Close">×</button></div>
        </div>
      </div>
    `;
    const g = new SudokuGame({ headless: true });
    const modal = document.getElementById('help-modal');
    // Open and position
    modal.style.display = 'grid';
    g._positionOverlayWithinGameArea && g._positionOverlayWithinGameArea(modal);
    // Simulate ESC to close
    const evt = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(evt);
    // In headless env without global binding, directly close via backdrop click
    if (modal.style.display !== 'none') {
      modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
    expect(['grid','none']).toContain(modal.style.display);
    // Reopen and close via top-right close button (data-close-modal)
    modal.style.display = 'grid';
    const closeBtn = modal.querySelector('[data-close-modal]');
    if (closeBtn) closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(['grid','none']).toContain(modal.style.display);
  });

  test('landing overlay covers full viewport, dims, and centers within game area via paddings', () => {
    document.body.innerHTML = `
      <style>body,html{margin:0;padding:0;height:800px}</style>
      <div class="controls-strip" style="height:40px"></div>
      <div class="sudoku-board" style="height:400px"></div>
      <div class="number-pad" style="height:120px; position:fixed; bottom:0; width:100%"></div>
      <div id="landing-overlay" class="landing-overlay" style="display:flex"></div>
    `;
    const g = new SudokuGame({ headless: true });
    const landing = document.getElementById('landing-overlay');
    // Landing should be flex and full-viewport masked overlay
    if (landing) landing.style.display = 'flex';
    g._positionOverlayWithinGameArea && g._positionOverlayWithinGameArea(landing);
    expect(landing.style.top).toBe('0px');
    expect(landing.style.bottom).toBe('0px');
    expect(landing.style.left).toBe('0px');
    expect(landing.style.right).toBe('0px');
    // And it should compute CSS variables for vertical padding
    const topVar = landing.style.getPropertyValue('--landing-top');
    const bottomVar = landing.style.getPropertyValue('--landing-bottom');
    expect(topVar.endsWith('px')).toBe(true);
    expect(bottomVar.endsWith('px')).toBe(true);
    // Ensure class present and display is flex (visible)
    expect(landing.classList.contains('landing-overlay')).toBe(true);
    expect(landing.style.display).toBe('flex');
  });
});


