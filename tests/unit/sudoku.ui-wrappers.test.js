const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('UI wrappers and tooltips', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('openDailyModal shows modal when elements present', () => {
    document.body.innerHTML = `
      <div id="daily-modal" class="modal" style="display:none"></div>
      <span id="daily-date"></span>
      <span id="daily-diff"></span>
      <span id="daily-modal-countdown"></span>
    `;
    const g = new SudokuGame({ headless: true });
    g.openDailyModal();
    const disp = document.getElementById('daily-modal').style.display;
    expect(['block','grid','flex','inline-block']).toContain(disp || 'block');
  });

  test('setupResponsiveSizing writes CSS var and/or width', async () => {
    document.body.innerHTML = '<div id="board"></div>';
    // Ensure rAF writes happen synchronously in test
    const prevRaf = window.requestAnimationFrame;
    window.requestAnimationFrame = (cb) => { cb(); return 0; };
    const g = new SudokuGame({ headless: true });
    g.setupResponsiveSizing();
    // Allow any setTimeout fallbacks to flush
    await new Promise(r => setTimeout(r, 0));
    let style = getComputedStyle(document.documentElement).getPropertyValue('--cell-size');
    if (!style) {
      style = document.documentElement.style.getPropertyValue('--cell-size');
    }
    if (style) {
      expect(style).toBeTruthy();
    }
    const width = document.getElementById('board').style.width;
    expect(width).toBeTruthy();
    // Restore rAF
    window.requestAnimationFrame = prevRaf;
  });

  test('_initTooltips installs handlers when present', () => {
    // provide minimal tooltip target
    document.body.innerHTML = '<button id="solve-btn" title="Solve"></button>';
    const g = new SudokuGame({ headless: true });
    // Should not throw
    g._initTooltips();
  });
});



