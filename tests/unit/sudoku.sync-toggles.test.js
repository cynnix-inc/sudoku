const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

/**
 * Unit tests for Settings → Sync to Cloud toggles
 */
describe('Settings Sync toggles (defaults and persistence)', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		try { localStorage.clear(); } catch {}
	});

	test('defaults: gameplay ON, appearance OFF, calendar ON', () => {
		// Seed toggles in DOM so game wiring can initialize them
		const sg = document.createElement('input'); sg.type = 'checkbox'; sg.id = 'settings-sync-gameplay-toggle';
		const sa = document.createElement('input'); sa.type = 'checkbox'; sa.id = 'settings-sync-appearance-toggle';
		const sc = document.createElement('input'); sc.type = 'checkbox'; sc.id = 'settings-sync-calendar-toggle';
		document.body.appendChild(sg);
		document.body.appendChild(sa);
		document.body.appendChild(sc);

		// Construct game to trigger wiring
		const g = new SudokuGame({ headless: true });
		void g; // unused

		const raw = localStorage.getItem('sudoku-settings');
		const s = raw ? JSON.parse(raw) : {};
		expect(s.syncGameplayAcrossDevices ?? true).toBe(true);
		expect(s.syncAppearanceAcrossDevices ?? false).toBe(false);
		expect(s.syncCalendarAcrossDevices ?? true).toBe(true);
	});

	test('changing toggles persists immediately', () => {
		// Seed DOM
		const sg = document.createElement('input'); sg.type = 'checkbox'; sg.id = 'settings-sync-gameplay-toggle'; sg.checked = true;
		const sa = document.createElement('input'); sa.type = 'checkbox'; sa.id = 'settings-sync-appearance-toggle'; sa.checked = false;
		const sc = document.createElement('input'); sc.type = 'checkbox'; sc.id = 'settings-sync-calendar-toggle'; sc.checked = true;
		document.body.appendChild(sg);
		document.body.appendChild(sa);
		document.body.appendChild(sc);
		const g = new SudokuGame({ headless: true });
		void g;

		// Flip appearance ON and gameplay OFF
		sa.checked = true; sa.dispatchEvent(new Event('change'));
		sg.checked = false; sg.dispatchEvent(new Event('change'));
		const s = JSON.parse(localStorage.getItem('sudoku-settings'));
		expect(s.syncGameplayAcrossDevices).toBe(false);
		expect(s.syncAppearanceAcrossDevices).toBe(true);
		expect(s.syncCalendarAcrossDevices).toBe(true);
	});
});


