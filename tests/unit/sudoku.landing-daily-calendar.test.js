require('../setup-jest');
const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Landing Daily tile switches to Calendar on completion', () => {
  function mountLandingDom() {
    // Append landing overlay markup resembling index.html critical bits
    const landing = document.createElement('div');
    landing.id = 'landing-overlay';
    landing.className = 'landing-overlay';
    landing.style.display = 'flex';
    landing.innerHTML = `
      <div class="landing-card">
        <div class="landing-daily" id="landing-daily-section">
          <div class="landing-daily-actions">
            <div class="daily-tile-wrap">
              <button id="landing-daily-btn" class="btn btn-secondary diff-btn diff-card daily-card" aria-live="polite" style="position:relative">
                <span class="diff-icon" id="landing-daily-icon"></span>
                <span class="diff-text">Daily</span>
                <span class="diff-hint" id="landing-daily-hint"></span>
                <span class="daily-complete-badge" id="landing-daily-complete" hidden>✓ Completed</span>
              </button>
              <button id="landing-calendar-btn" class="calendar-overlay" title="Open Daily calendar" aria-label="Open Daily calendar"></button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(landing);

    // Calendar modal host for openCalendar fallback
    const cal = document.createElement('div'); cal.id = 'calendar-modal'; document.body.appendChild(cal);
  }

  function setDailyCompleted(completed = true) {
    // Compute today key using same logic (UTC midnight key as yyyymmdd)
    const now = new Date();
    const key = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}`;
    const data = JSON.parse(localStorage.getItem('sudoku-daily-results') || '{}');
    data[key] = { ...(data[key] || {}), completed };
    localStorage.setItem('sudoku-daily-results', JSON.stringify(data));
  }

  test('completed: tile becomes Calendar, no difficulty, opens calendar on click', () => {
    mountLandingDom();
    setDailyCompleted(true);
    // eslint-disable-next-line no-undef
    const g = new SudokuGame({ headless: true });
    if (g && typeof g.setupEventListeners === 'function') g.setupEventListeners();

    const btn = document.getElementById('landing-daily-btn');
    const icon = document.getElementById('landing-daily-icon');
    const hint = document.getElementById('landing-daily-hint');
    const overlayBtn = document.getElementById('landing-calendar-btn');

    expect(btn.getAttribute('data-mode')).toBe('calendar');
    expect((hint && hint.textContent) || '').toBe('');
    // Icon is oversized calendar centered absolutely inside tile
    expect(icon.style.position).toBe('absolute');
    expect(icon.style.top).toBe('50%');
    expect(icon.style.left).toBe('50%');
    expect(icon.style.transform).toContain('translate(-50%, -50%)');
    // Allow a small range to avoid regressions if we tweak padding
    const w = icon.style.width;
    const h = icon.style.height;
    expect(['90%','92%','95%']).toContain(w);
    expect(['90%','92%','95%']).toContain(h);
    // Small overlay calendar button is hidden
    expect(overlayBtn.style.display).toBe('none');

    // Clicking tile opens calendar (stubbed)
    const spy = jest.fn();
    g.openCalendar = spy;
    btn.click();
    expect(spy).toHaveBeenCalled();
  });

  test('not completed: tile shows Daily with difficulty hint and overlay button visible', () => {
    // Fresh DOM for this case
    document.body.innerHTML = '';
    // Rehydrate base DOM expected by setup file
    // eslint-disable-next-line global-require
    require('../setup-jest');
    mountLandingDom();
    localStorage.removeItem('sudoku-daily-results');
    // eslint-disable-next-line no-undef
    const g2 = new SudokuGame({ headless: true });
    if (g2 && typeof g2.setupEventListeners === 'function') g2.setupEventListeners();

    const btn = document.getElementById('landing-daily-btn');
    const hint = document.getElementById('landing-daily-hint');
    const overlayBtn = document.getElementById('landing-calendar-btn');

    expect(btn.getAttribute('data-mode')).toBe('daily');
    expect((hint && hint.textContent) || '').not.toBe('');
    expect(overlayBtn.style.display).not.toBe('none');
  });
});


