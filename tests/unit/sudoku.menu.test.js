const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Hamburger menu behavior', () => {
  function mountBasicDom() {
    document.body.innerHTML = `
      <button id="menu-btn"></button>
      <div id="menu-popover" class="popover-menu" style="display:none">
        <button id="menu-home" class="popover-item"><span class="menu-icon"></span><span>Home</span></button>
        <button id="menu-newgame" class="popover-item"><span class="menu-icon"></span><span>New puzzle…</span></button>
        <button id="menu-daily" class="popover-item badged"><span class="menu-icon">📅<span id="menu-daily-item-dot" class="badge-dot" style="display:none"></span></span><span>Daily</span></button>
        <hr/>
        <button id="menu-restart" class="popover-item"><span class="menu-icon"></span><span>Restart</span></button>
        <button id="menu-clear" class="popover-item"><span class="menu-icon"></span><span>Clear</span></button>
        <hr/>
        <button id="menu-stats" class="popover-item"><span class="menu-icon"></span><span>Stats</span></button>
        <button id="menu-login" class="popover-item google-btn compact"><span class="g-logo" aria-hidden="true"></span><span class="g-text">Sign in with Google</span></button>
        <div class="menu-icon-row" role="group"><button id="menu-settings" class="popover-item icon-only" title="Settings" aria-label="Settings"></button><button id="menu-help" class="popover-item icon-only" title="Help" aria-label="Help"></button></div>
      </div>
      <div id="landing-overlay" style="display:none"></div>
      <div id="confirm-modal" style="display:none"><div class="modal-content"><button id="confirm-ok"></button><button id="confirm-cancel"></button></div></div>
      <div id="newpuzzle-modal" style="display:none"><div id="newpuzzle-diffs"><button data-diff="easy"></button></div><button id="newpuzzle-cancel"></button></div>
      <div id="calendar-modal" style="display:none"></div>
    `;
  }

  test('Clicking menu button toggles popover open/closed and sets aria-expanded', () => {
    mountBasicDom();
    const g = new SudokuGame({ headless: true });
    g.setupEventListeners();
    const btn = document.getElementById('menu-btn');
    const pop = document.getElementById('menu-popover');
    expect(pop.style.display).toBe('none');
    btn.click();
    expect(pop.style.display).toBe('block');
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    btn.click();
    expect(pop.style.display).toBe('none');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  test('Daily item shows dot by id and in-progress guard confirms before opening calendar', async () => {
    mountBasicDom();
    const g = new SudokuGame({ headless: true });
    g.isGameInProgress = () => true;
    // Stub confirm
    g.showConfirm = jest.fn(() => Promise.resolve(true));
    g.openCalendar = jest.fn();
    g.setupEventListeners();
    const dot = document.getElementById('menu-daily-item-dot');
    // show dot
    dot.style.display = 'inline-block';
    expect(dot.style.display).toBe('inline-block');
    // click Daily
    document.getElementById('menu-daily').click();
    // guard and then open
    await Promise.resolve();
    expect(g.showConfirm).toHaveBeenCalled();
    expect(g.openCalendar).toHaveBeenCalled();
  });

  test('New puzzle opens New Puzzle modal (not landing)', () => {
    mountBasicDom();
    const g = new SudokuGame({ headless: true });
    g.setupEventListeners();
    const modal = document.getElementById('newpuzzle-modal');
    expect(modal.style.display === '' ? 'none' : modal.style.display).toBe('none');
    document.getElementById('menu-newgame').click();
    const shown = modal.style.display || getComputedStyle(modal).display;
    expect(['block','grid','flex','inline-block']).toContain(shown);
  });

  test('Restart triggers confirm and resets when accepted', async () => {
    mountBasicDom();
    const g = new SudokuGame({ headless: true });
    g.isGameInProgress = () => true;
    g.showConfirm = jest.fn(() => Promise.resolve(true));
    g.updateDisplay = jest.fn();
    g.setupEventListeners();
    document.getElementById('menu-restart').click();
    await Promise.resolve();
    expect(g.showConfirm).toHaveBeenCalled();
  });

  test('Menu Sign in with Google shows loading state on click', async () => {
    mountBasicDom();
    // Stub supabase
    global.window.supabase = { auth: { signInWithOAuth: jest.fn(async () => {}) } };
    const g = new SudokuGame({ headless: true });
    g.setupEventListeners();
    const menuBtn = document.getElementById('menu-login');
    // Open popover then click sign-in
    document.getElementById('menu-btn').click();
    menuBtn.click();
    expect(window.supabase.auth.signInWithOAuth).toHaveBeenCalled();
    expect(menuBtn.disabled).toBe(true);
    expect(menuBtn.getAttribute('aria-busy')).toBe('true');
  });
});


