const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Stats merge (local + remote)', () => {
	beforeEach(() => {
		try { localStorage.clear(); } catch {}
		// Minimal DOM to satisfy code paths if needed
		document.body.innerHTML = '<div id="toast-container"></div>';
	});

	test('merges totals, best times (min), byDifficulty (sum), and daily results union', async () => {
		// Seed local stats and daily results
		const local = {
			totalCompleted: 3,
			totalWins: 2,
			totalLosses: 1,
			bestTimes: { easy: 60, medium: 120 },
			byDifficulty: { easy: { played: 2, wins: 1 } },
			updatedAt: new Date(Date.now() - 2000).toISOString(),
		};
		localStorage.setItem('sudoku-stats', JSON.stringify(local));
		localStorage.setItem('sudoku-daily-results', JSON.stringify({ A: { completed: false, updatedAt: new Date(Date.now() - 5000).toISOString() } }));

		const remoteRow = {
			user_id: '00000000-0000-0000-0000-000000000000',
			updated_at: new Date(Date.now() - 1000).toISOString(),
			total_played: 4,
			total_wins: 1,
			total_losses: 3,
			best_easy: 45, // better than local 60
			best_medium: 140, // worse than local 120
			best_hard: null,
			best_expert: null,
			best_master: null,
			best_extreme: null,
			by_difficulty: { easy: { played: 2, wins: 1 }, medium: { played: 2, wins: 0 } },
			daily_results: { A: { completed: true, updatedAt: new Date(Date.now() - 4000).toISOString() }, B: { completed: false } },
		};

		// Stub supabase
		global.window.supabase = {
			auth: { getUser: async () => ({ data: { user: { id: remoteRow.user_id } } }) },
			from: () => ({
				select: () => ({ eq: () => ({ single: async () => ({ data: remoteRow }) }) }),
				upsert: async () => ({})
			})
		};

		const g = new SudokuGame({ headless: true });
		await g.syncRemoteStats();

		const merged = JSON.parse(localStorage.getItem('sudoku-stats'));
		// Totals add
		expect(merged.totalCompleted).toBe(local.totalCompleted + remoteRow.total_played);
		expect(merged.totalWins).toBe(local.totalWins + remoteRow.total_wins);
		expect(merged.totalLosses).toBe(local.totalLosses + remoteRow.total_losses);
		// Best times min
		expect(merged.bestTimes.easy).toBe(45);
		expect(merged.bestTimes.medium).toBe(120);
		// By difficulty merged
		expect(merged.byDifficulty.easy.played).toBe(4);
		expect(merged.byDifficulty.easy.wins).toBe(2);
		expect(merged.byDifficulty.medium.played).toBe(2);
		// Daily results union and preference for completed
		const dr = JSON.parse(localStorage.getItem('sudoku-daily-results'));
		expect(dr.A.completed).toBe(true);
		expect(dr.B).toBeTruthy();
	});
});


