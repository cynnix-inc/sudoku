const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Settings sync behavior with per-field timestamps and appearance toggle', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		try { localStorage.clear(); } catch {}
	});

	test('appearance fields are excluded from remote upsert when appearance sync is OFF', async () => {
		// Seed basic settings
		localStorage.setItem('sudoku-settings', JSON.stringify({
			updatedAt: new Date().toISOString(),
			__ts: {},
			themeDark: true,
			accent: 'rose',
			syncAppearanceAcrossDevices: false,
		}));

		let capturedPayload = null;
		// Stub supabase
		window.supabase = {
			auth: { getUser: async () => ({ data: { user: { id: 'u' } } }) },
			from: () => ({
				select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }),
				upsert: async (payload) => { capturedPayload = payload; return {}; },
			})
		};

		const g = new SudokuGame({ headless: true });
		await g.syncRemoteSettings();
		expect(capturedPayload).toBeTruthy();
		expect(capturedPayload.prefs.themeDark).toBeUndefined();
		expect(capturedPayload.prefs.accent).toBeUndefined();
	});

	test('appearance fields included when appearance sync is ON', async () => {
		localStorage.setItem('sudoku-settings', JSON.stringify({
			updatedAt: new Date().toISOString(),
			__ts: {},
			themeDark: true,
			accent: 'rose',
			syncAppearanceAcrossDevices: true,
		}));
		let capturedPayload = null;
		window.supabase = {
			auth: { getUser: async () => ({ data: { user: { id: 'u' } } }) },
			from: () => ({
				select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }),
				upsert: async (payload) => { capturedPayload = payload; return {}; },
			})
		};
		const g = new SudokuGame({ headless: true });
		await g.syncRemoteSettings();
		expect(capturedPayload.prefs.themeDark).toBe(true);
		expect(capturedPayload.prefs.accent).toBe('rose');
	});
});

const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Settings sync behavior (gameplay/calendar vs appearance)', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div>
        <input type="checkbox" id="auto-candidates-toggle" />
        <input type="checkbox" id="auto-advance-toggle" />
        <input type="checkbox" id="zen-mode-toggle" />
        <input type="range" id="lives-limit" min="0" max="11" step="1" value="3" />
        <span id="lives-limit-value"></span>
        <input type="checkbox" id="theme-dark-toggle" />
        <div id="accent-swatches">
          <button class="swatch" data-accent="indigo" aria-checked="true"></button>
          <button class="swatch" data-accent="rose" aria-checked="false"></button>
        </div>
        <select id="hint-mode-select">
          <option value="direct">direct</option>
          <option value="logic">logic</option>
        </select>
        <div id="weekstart-toggle" aria-checked="false"></div>
        <input type="checkbox" id="idle-autopause-toggle" />
        <input type="range" id="idle-timeout-slider" min="30" max="600" step="30" value="120" />
        <span id="idle-timeout-pill"></span>
      </div>`;
    try { localStorage.clear(); } catch {}
    // Stub supabase for tests that simulate signed-in merge
    global.window.supabase = undefined;
    // Ensure production path is used in headless tests
    try { global.window.SudokuStats = require('../../src/game/stats.js'); } catch {}
  });

  test('local persist/resume carries gameplay+calendar+appearance fields', () => {
    const g1 = new SudokuGame({ headless: true });
    // Set various controls
    document.getElementById('auto-candidates-toggle').checked = true;
    document.getElementById('auto-advance-toggle').checked = true;
    document.getElementById('zen-mode-toggle').checked = true;
    document.getElementById('lives-limit').value = '11';
    document.getElementById('theme-dark-toggle').checked = true;
    document.querySelectorAll('#accent-swatches .swatch').forEach(b => b.setAttribute('aria-checked', b.dataset.accent === 'rose' ? 'true' : 'false'));
    document.getElementById('hint-mode-select').value = 'logic';
    document.getElementById('weekstart-toggle').setAttribute('aria-checked','true');

    g1.persistSettings();

    const g2 = new SudokuGame({ headless: true });
    g2.resumeSettings();

    const s = JSON.parse(localStorage.getItem('sudoku-settings'));
    expect(s).toBeTruthy();
    expect(s.autoCandidates).toBe(true);
    expect(s.autoAdvance).toBe(true);
    expect(s.zenMode).toBe(true);
    expect(s.livesLimit).toBe(11);
    expect(s.weekstart).toBe('monday');
    expect(s.hintMode).toBe('logic');
    expect(typeof s.updatedAt).toBe('string');
  });

  test('idle auto-pause settings persist and restore with pill update', () => {
    const g = new SudokuGame({ headless: true });
    // set values and persist
    document.getElementById('idle-autopause-toggle').checked = true;
    document.getElementById('idle-timeout-slider').value = '150';
    g.persistSettings();
    // clear and restore
    document.getElementById('idle-autopause-toggle').checked = false;
    document.getElementById('idle-timeout-slider').value = '30';
    g.resumeSettings();
    const s = JSON.parse(localStorage.getItem('sudoku-settings'));
    expect(s.idleAutoPause).toBe(true);
    expect(s.idleTimeoutSec).toBe(150);
    expect(document.getElementById('idle-autopause-toggle').checked).toBe(true);
    expect(document.getElementById('idle-timeout-slider').value).toBe('150');
    // pill shows m:ss formatting (2:30) when resumeSettings formats it; allow exact string
    expect(document.getElementById('idle-timeout-pill').textContent).toBe('2:30');
  });

  test('signed-in pull merges only gameplay/calendar fields from remote', async () => {
    const g = new SudokuGame({ headless: true });
    // Local appearance set to dark/rose
    document.getElementById('theme-dark-toggle').checked = true;
    document.querySelectorAll('#accent-swatches .swatch').forEach(b => b.setAttribute('aria-checked', b.dataset.accent === 'rose' ? 'true' : 'false'));
    g.persistSettings();

    const localBefore = JSON.parse(localStorage.getItem('sudoku-settings'));

    // Fake supabase and remote row with different gameplay/calendar and different appearance (which should be ignored)
    const remoteRow = {
      user_id: '00000000-0000-0000-0000-000000000000',
      updated_at: new Date(Date.now() + 1000).toISOString(),
      prefs: {
        autoCandidates: true,
        autoAdvance: true,
        zenMode: false,
        livesEnabled: true,
        livesLimit: 5,
        weekstart: 'monday',
        hintMode: 'logic',
        themeDark: false,
        accent: 'indigo'
      }
    };
    window.supabase = {
      auth: { getUser: async () => ({ data: { user: { id: remoteRow.user_id } } }) },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: remoteRow }) }) }),
        upsert: async () => ({})
      })
    };

    await g.syncRemoteSettings();

    const merged = JSON.parse(localStorage.getItem('sudoku-settings'));
    expect(merged.autoCandidates).toBe(true);
    expect(merged.autoAdvance).toBe(true);
    expect(merged.zenMode).toBe(false);
    expect(merged.livesLimit).toBe(5);
    expect(merged.weekstart).toBe('monday');
    expect(merged.hintMode).toBe('logic');
    // Appearance remains as before
    expect(merged.themeDark).toBe(localBefore.themeDark);
    expect(merged.accent).toBe(localBefore.accent);
  });

  test('persistSettings merges with previous values when some controls are missing (simplified/mobile view)', () => {
    try { localStorage.clear(); } catch {}
    // Seed previous settings with a variety of values
    const prev = {
      autoCandidates: true,
      autoAdvance: true,
      zenMode: false,
      idleAutoPause: false,
      idleTimeoutSec: 150,
      livesEnabled: true,
      livesLimit: 5,
      themeDark: true,
      weekstart: 'monday',
      calendarOnlyPlayable: true,
      calendarOnlyIncomplete: false,
      accent: 'rose',
      hintMode: 'logic',
      gridSize: 3,
      digitSize: 4,
      noteSize: 2,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('sudoku-settings', JSON.stringify(prev));

    // Render a simplified settings UI (only lives slider present)
    document.body.innerHTML = `
      <div>
        <input type="range" id="lives-limit" min="0" max="11" step="1" value="11" />
        <span id="lives-limit-value"></span>
      </div>`;
    // Ensure production path is used
    try { global.window.SudokuStats = require('../../src/game/stats.js'); } catch {}

    const g = new SudokuGame({ headless: true });
    g.persistSettings();

    const merged = JSON.parse(localStorage.getItem('sudoku-settings'));
    expect(merged).toBeTruthy();
    // Lives updated from simplified UI
    expect(merged.livesLimit).toBe(11);
    expect(merged.livesEnabled).toBe(false);
    // Unrendered controls keep previous values
    expect(merged.themeDark).toBe(true);
    expect(merged.accent).toBe('rose');
    expect(merged.hintMode).toBe('logic');
    expect(merged.weekstart).toBe('monday');
    expect(merged.idleAutoPause).toBe(false);
    expect(merged.idleTimeoutSec).toBe(150);
    expect(merged.gridSize).toBe(3);
    expect(merged.digitSize).toBe(4);
    expect(merged.noteSize).toBe(2);
  });
});


