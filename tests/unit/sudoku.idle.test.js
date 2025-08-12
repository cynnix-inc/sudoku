const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Idle auto-pause behavior', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = `
      <div id="board"></div>
      <div id="pause-overlay" class="pause-overlay" style="display:none;">Paused</div>
      <button id="timer-toggle"><span class="timer-icon"></span></button>
      <div id="confirm-modal" style="display:none;">
        <div class="modal-content">
          <h2 id="confirm-title"></h2>
          <p id="confirm-message"></p>
          <button id="confirm-cancel">Cancel</button>
          <button id="confirm-ok">OK</button>
        </div>
      </div>`;
    try { localStorage.clear(); } catch {}
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('enabled idle pauses and inline resume unpauses', async () => {
    // Seed settings for short timeout
    localStorage.setItem('sudoku-settings', JSON.stringify({ idleAutoPause: true, idleTimeoutSec: 1 }));
    const g = new SudokuGame({ headless: true });
    g._hasStarted = true;
    // Make document visible (some environments start as 'hidden')
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    // Advance beyond timeout
    jest.advanceTimersByTime(1100);
    // Pause overlay should be visible
    const overlay = document.getElementById('pause-overlay');
    expect(['flex', 'block', '']).toContain(overlay.style.display);
    // Simulate clicking inline resume button if present; else click overlay
    const btn = document.getElementById('idle-resume-btn') || document.getElementById('resume-overlay-btn');
    if (btn) btn.click(); else overlay.click();
    // Overlay hidden after resume
    expect(overlay.style.display).toBe('none');
  });

  test('disabled idle does not pause', () => {
    localStorage.setItem('sudoku-settings', JSON.stringify({ idleAutoPause: false, idleTimeoutSec: 1 }));
    const g = new SudokuGame({ headless: true });
    g._hasStarted = true;
    jest.advanceTimersByTime(1500);
    const overlay = document.getElementById('pause-overlay');
    expect(overlay.style.display === 'none' || overlay.style.display === '').toBe(true);
  });

  test('pagehide and blur force pause with resume affordance', () => {
    localStorage.setItem('sudoku-settings', JSON.stringify({ idleAutoPause: true, idleTimeoutSec: 60 }));
    const g = new SudokuGame({ headless: true });
    g._hasStarted = true;
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    window.dispatchEvent(new Event('pagehide'));
    const overlay = document.getElementById('pause-overlay');
    expect(['flex', 'block', '']).toContain(overlay.style.display);
    // Click overlay to resume
    overlay.click();
    expect(overlay.style.display).toBe('none');
  });
});


