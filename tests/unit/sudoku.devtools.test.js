/**
 * Dev Tools behavior tests
 */

const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Dev Tools panel', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="container">
        <header>
          <div class="rail app-header">
            <div class="header-left"><div id="user-chip" class="user-chip" style="display:none"></div></div>
            <div class="header-center"><div class="difficulty-display"><div id="mode-indicator" class="mode-indicator"></div></div></div>
            <div class="header-right"><button id="menu-btn"></button><div id="menu-popover"></div></div>
          </div>
        </header>
        <main>
          <div class="sudoku-board"><div id="board" class="board"></div></div>
        </main>
      </div>
      <input id="theme-dark-toggle" type="checkbox" />
      <div id="modal" class="modal"><div class="modal-content"><h2 id="modal-title"></h2><p id="modal-message"></p><button id="modal-new-game"></button><button id="modal-close"></button></div></div>
    `;
    // Ensure localStorage is clear between tests for deterministic behavior
    try { localStorage.clear(); } catch {}
  });

  test('Retro toggling restores previous dark mode state', () => {
    const g = new SudokuGame({ headless: true });
    // Wire core events to ensure dev panel binding exists
    g.setupEventListeners();
    const themeToggle = document.getElementById('theme-dark-toggle');

    // Case 1: start in light mode
    themeToggle.checked = false;
    document.documentElement.dataset.theme = 'light';
    g._toggleDevPanel();
    const retro = document.getElementById('dev-retro-toggle');
    expect(retro).toBeTruthy();

    // Enable retro -> forces dark
    retro.click();
    expect(document.documentElement.classList.contains('theme-retro')).toBeTruthy();
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(themeToggle.disabled).toBe(true);

    // Disable retro -> restores previous light state
    retro.click();
    expect(document.documentElement.classList.contains('theme-retro')).toBeFalsy();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(themeToggle.disabled).toBe(false);
    expect(themeToggle.checked).toBe(false);

    // Case 2: start in dark mode and ensure restoration to dark
    g._toggleDevPanel(); // minimize/hide existing
    themeToggle.checked = true;
    document.documentElement.dataset.theme = 'dark';
    g._toggleDevPanel(); // show again
    const retro2 = document.getElementById('dev-retro-toggle');
    retro2.click(); // on
    retro2.click(); // off -> should restore dark
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(themeToggle.checked).toBe(true);
  });

  test('Section collapse defaults and persistence', () => {
    const g = new SudokuGame({ headless: true });
    g.setupEventListeners();
    g._toggleDevPanel();
    const panel = document.getElementById('dev-panel');
    const themes = panel.querySelector('details[data-id="themes"]');
    const appearance = panel.querySelector('details[data-id="appearance"]');
    const effects = panel.querySelector('details[data-id="effects"]');

    // Defaults: themes open, others closed
    expect(themes.open).toBe(true);
    expect(appearance.open).toBe(false);
    expect(effects.open).toBe(false);

    // Open appearance and persist
    appearance.open = true;
    appearance.dispatchEvent(new Event('toggle'));

    // Hide and show panel to simulate reopening
    g._toggleDevPanel(); // hide
    g._toggleDevPanel(); // show
    const appearance2 = document.querySelector('#dev-panel details[data-id="appearance"]');
    const themes2 = document.querySelector('#dev-panel details[data-id="themes"]');

    expect(appearance2.open).toBe(true); // persisted
    expect(themes2.open).toBe(true); // still default (no change saved to false)
  });
});


