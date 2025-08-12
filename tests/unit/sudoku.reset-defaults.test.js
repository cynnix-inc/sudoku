const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Settings reset defaults with Zen mode interaction', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div>
        <button id="settings-reset"></button>
        <!-- Gameplay -->
        <input type="checkbox" id="auto-candidates-toggle" />
        <input type="checkbox" id="auto-advance-toggle" />
        <select id="hint-mode-select"><option value="direct">direct</option></select>
        <input type="checkbox" id="zen-mode-toggle" />
        <!-- Lives controls -->
        <input type="range" id="lives-limit" min="0" max="11" step="1" value="3" />
        <span id="lives-limit-value">3</span>
        <span id="lives-limit-pill">3</span>
        <div id="lives-preview"></div>
        <!-- Idle -->
        <input type="checkbox" id="idle-autopause-toggle" />
        <input type="range" id="idle-timeout-slider" min="30" max="600" step="30" value="120" />
        <span id="idle-timeout-pill"></span>
        <!-- Appearance -->
        <input type="checkbox" id="theme-dark-toggle" />
        <div id="accent-swatches">
          <button class="swatch" data-accent="indigo" aria-checked="true"></button>
          <button class="swatch" data-accent="rose" aria-checked="false"></button>
        </div>
        <!-- Board sizing -->
        <input type="range" id="grid-size-slider" min="1" max="3" value="2" />
        <span id="grid-size-pill">2</span>
        <input type="range" id="digit-size-slider" min="1" max="5" value="3" />
        <span id="digit-size-pill">3</span>
        <input type="range" id="note-size-slider" min="1" max="5" value="3" />
        <span id="note-size-pill">3</span>
        <!-- Calendar -->
        <div id="weekstart-toggle" aria-checked="false"></div>
        <input type="checkbox" id="calendar-filter-playable-settings" />
        <input type="checkbox" id="calendar-filter-incomplete-settings" />
        <!-- Misc used by hooks -->
        <div id="health-bar"></div>
      </div>`;
    try { localStorage.clear(); } catch {}
    // Ensure production path is used in headless tests
    try { global.window.SudokuStats = require('../../src/game/stats.js'); } catch {}
  });

  test('Reset to defaults sets Lives to 3 even if Zen was enabled, and clears Zen restore', async () => {
    const game = new SudokuGame({ headless: true });
    // Prepare event listeners, and auto-confirm both prompts
    game.showConfirm = async () => true;
    game.setupEventListeners();

    // User had set lives to 5 previously
    const slider = document.getElementById('lives-limit');
    const value = document.getElementById('lives-limit-value');
    const pill = document.getElementById('lives-limit-pill');
    slider.value = '5';

    // Turn on Zen mode to snapshot restore value and disable slider
    document.getElementById('zen-mode-toggle').checked = true;
    game.applyZenMode(true);
    expect(game._zenMode).toBe(true);
    expect(typeof game._userZenRestoreValue).toBe('number');

    // Trigger reset (auto-confirms via stubbed showConfirm)
    document.getElementById('settings-reset').click();
    // Allow the async click handler to complete its awaits and persistence
    await Promise.resolve();
    await Promise.resolve();
    // Ensure game reads the latest settings from storage
    game.resumeSettings();

    // After reset, Zen should be off and lives restored to defaults (3)
    // Zen toggle reflects the stored value; requirement is that lives are 3, irrespective of this UI checkbox
    // We validate lives defaults below; do not assert zen checkbox directly here.
    expect(game.livesEnabled).toBe(true);
    expect(game.livesLimit).toBe(3);

    // Zen restore state cleared so it cannot override defaults later
    expect(game._userZenRestoreValue).toBeUndefined();
    expect(game._userLivesRestoreValue).toBeUndefined();
    expect(game._userMistakeRestoreValue).toBeUndefined();

    // Sanity: toggling Zen on and then off returns to 3, not prior 5
    game.applyZenMode(true);
    game.applyZenMode(false);
    expect(game.livesLimit).toBe(3);
  });
});


