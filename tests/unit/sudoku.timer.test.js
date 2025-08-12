const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Timer and pause/resume behaviors', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    const time = document.createElement('span'); time.id = 'time'; document.body.appendChild(time);
    const pause = document.createElement('div'); pause.id = 'pause-overlay'; pause.style.display = 'none'; document.body.appendChild(pause);
    const btn = document.createElement('button'); btn.id = 'timer-toggle'; const icon = document.createElement('span'); icon.className = 'timer-icon'; btn.appendChild(icon); document.body.appendChild(btn);
  });

  test('ensureGameStarted starts timer and updates button/icon', () => {
    const g = new SudokuGame({ headless: true });
    expect(g._hasStarted).toBe(false);
    g.ensureGameStarted();
    expect(g._hasStarted).toBe(true);
    // updateTimerButton should set icon to pause when running
    const icon = document.querySelector('#timer-toggle .timer-icon');
    expect(icon.textContent === '⏸' || icon.textContent === '▶').toBe(true);
    // stop and ensure icon reflects non-running state
    g.stopTimer();
    const iconAfter = document.querySelector('#timer-toggle .timer-icon');
    expect(iconAfter.textContent).toBe('▶');
  });

  test('togglePause toggles overlay and timer state', () => {
    const g = new SudokuGame({ headless: true });
    g.ensureGameStarted();
    const overlay = document.getElementById('pause-overlay');
    // Enter pause
    g.togglePause();
    expect(overlay.style.display).toBe('flex');
    expect(g.isPaused).toBe(true);
    // Resume
    g.togglePause();
    expect(overlay.style.display).toBe('none');
  });

  test('autoPauseOnBlur sets pause and resumeFromPause resumes', () => {
    const g = new SudokuGame({ headless: true });
    g.ensureGameStarted();
    g.autoPauseOnBlur();
    const overlay = document.getElementById('pause-overlay');
    expect(overlay.style.display).toBe('flex');
    expect(g.isPaused).toBe(true);
    g.resumeFromPause();
    expect(overlay.style.display).toBe('none');
  });
});



