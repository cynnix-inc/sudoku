const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

/**
 * UI state tests for label greying in Settings
 */
describe('Settings UI label greying (Zen + Idle)', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div>
        <div id="settings-saved"></div>
        <!-- Zen toggle -->
        <input type="checkbox" id="zen-mode-toggle" />
        <!-- Lives control (matches DOM structure: label is previousElementSibling of slider) -->
        <div class="control-col">
          <div class="control-label" id="lives-label">Lives</div>
          <input type="range" id="lives-limit" min="0" max="11" step="1" value="3" />
          <span id="lives-limit-value">3</span>
          <span id="lives-limit-pill">3</span>
          <div id="lives-preview"></div>
        </div>
        <!-- Idle controls (labels inside the same row) -->
        <div class="control-row">
          <span class="control-label" id="idle-toggle-label">Auto-pause on idle</span>
          <input type="checkbox" id="idle-autopause-toggle" checked />
        </div>
        <div class="control-row">
          <span class="control-label" id="idle-label">Idle timeout</span>
          <input type="range" id="idle-timeout-slider" min="30" max="600" step="30" value="120" />
          <span id="idle-timeout-pill"></span>
        </div>
      </div>`;
    try { localStorage.clear(); } catch {}
  });

  test('Zen mode greys Lives label only; Idle labels remain unaffected', () => {
    const g = new SudokuGame({ headless: true });
    g.setupEventListeners();

    // Turn on Zen
    const zenToggle = document.getElementById('zen-mode-toggle');
    zenToggle.checked = true;
    zenToggle.dispatchEvent(new Event('change'));

    // Lives slider disabled and Lives label greyed
    const livesSlider = document.getElementById('lives-limit');
    const livesLabel = document.getElementById('lives-label');
    expect(livesSlider.disabled).toBe(true);
    expect(livesLabel.getAttribute('data-label-disabled')).toBe('true');

    // Idle labels should not be greyed by Zen state alone
    const idleLabel = document.getElementById('idle-label');
    expect(idleLabel.getAttribute('data-label-disabled')).not.toBe('true');
  });

  test('Disabling Auto-pause greys Idle timeout label and disables its slider; re-enabling restores', () => {
    const g = new SudokuGame({ headless: true });
    g.setupEventListeners();

    const idleToggle = document.getElementById('idle-autopause-toggle');
    const idleSlider = document.getElementById('idle-timeout-slider');
    const idleLabel = document.getElementById('idle-label');

    // Initial: enabled
    expect(idleToggle.checked).toBe(true);
    expect(idleSlider.disabled).toBe(false);
    expect(idleLabel.getAttribute('data-label-disabled')).toBe('false');

    // Disable auto-pause
    idleToggle.checked = false;
    idleToggle.dispatchEvent(new Event('change'));
    expect(idleSlider.disabled).toBe(true);
    expect(idleLabel.getAttribute('data-label-disabled')).toBe('true');

    // Enable back
    idleToggle.checked = true;
    idleToggle.dispatchEvent(new Event('change'));
    expect(idleSlider.disabled).toBe(false);
    expect(idleLabel.getAttribute('data-label-disabled')).toBe('false');
  });
});


