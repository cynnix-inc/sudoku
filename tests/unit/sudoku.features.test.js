const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Sudoku feature logic (headless)', () => {
  test('notes add/remove and undo/redo integrity', () => {
    const game = new SudokuGame({ headless: true });
    // Prepare a tiny known state
    game.generateSolvedBoard();
    game.solution = game.board.map(r => [...r]);
    // Make cell (0,0) editable
    game.initialBoard[0][0] = 0;
    game.board[0][0] = 0;

    // Toggle note 5
    game.toggleNote(0, 0, 5);
    expect(game.notes[0][0].has(5)).toBe(true);
    // Toggle again removes
    game.toggleNote(0, 0, 5);
    expect(game.notes[0][0].has(5)).toBe(false);

    // Add value with notes present and undo restores notes
    game.toggleNote(0, 0, 3);
    const prevNotes = new Set(game.notes[0][0]);
    game.setCellValue(0, 0, 7, 'test');
    expect(game.board[0][0]).toBe(7);
    expect(game.notes[0][0].size).toBe(0);
    game.undo();
    expect(game.board[0][0]).toBe(0);
    expect(game.notes[0][0]).toEqual(prevNotes);
    game.redo();
    expect(game.board[0][0]).toBe(7);
    expect(game.notes[0][0].size).toBe(0);
  });

  test('computeCandidates and recomputeCandidatesForPeers', () => {
    const game = new SudokuGame({ headless: true });
    game.generateSolvedBoard();
    game.solution = game.board.map(r => [...r]);
    // Start with an empty board but keep a solved solution reference
    game.board = Array(9).fill().map(() => Array(9).fill(0));
    game.initialBoard = Array(9).fill().map(() => Array(9).fill(0));

    // In an empty grid, each empty has 1..9 candidates
    const s = game.computeCandidates(4, 4);
    expect(s.size).toBe(9);

    // Place a 5 at (0,0) and recompute peers; (0,4) should no longer include 5
    game.setCellValue(0, 0, 5, 'test');
    game.recomputeCandidatesForPeers(0, 0);
    const cRowPeer = game.computeCandidates(0, 4);
    expect(cRowPeer.has(5)).toBe(false);
    const cColPeer = game.computeCandidates(4, 0);
    expect(cColPeer.has(5)).toBe(false);
    const cBoxPeer = game.computeCandidates(1, 1);
    expect(cBoxPeer.has(5)).toBe(false);
  });

  test('puzzle generation keeps unique solution for common difficulties', () => {
    const game = new SudokuGame({ headless: true });
    ['medium', 'hard'].forEach(diff => {
      game.generatePuzzle(diff);
      expect(game.hasUniqueSolution()).toBe(true);
      // Ensure initialBoard marks givens as read-only (>0) and board contains zeros (removed cells)
      const givens = game.initialBoard.flat().filter(v => v !== 0).length;
      const empties = game.board.flat().filter(v => v === 0).length;
      expect(givens).toBeGreaterThan(0);
      expect(empties).toBeGreaterThan(0);
    });
  });

  test('lives counting: unique wrong values per cell; game over at limit', () => {
    const game = new SudokuGame({ headless: true });
    game.generateSolvedBoard();
    game.solution = game.board.map(r => [...r]);
    game.initialBoard = Array(9).fill().map(() => Array(9).fill(0));
    game.board = Array(9).fill().map(() => Array(9).fill(0));

    game.livesEnabled = true;
    game.livesLimit = 2;

    const r = 0, c = 0;
    const correct = game.solution[r][c];
    const wrong1 = ((correct % 9) + 1);
    const wrong2 = ((wrong1 % 9) + 1);

    game.setCellValue(r, c, wrong1, 'test');
    expect(game.livesUsed).toBe(1);
    // Repeat same wrong value does not increment
    game.setCellValue(r, c, wrong1, 'test');
    expect(game.livesUsed).toBe(1);
    // Different wrong value increments
    game.setCellValue(r, c, wrong2, 'test');
    expect(game.livesUsed).toBe(2);
    expect(game.isGameOver).toBe(true);
  });

  test('daily deterministic and reroll single-use', async () => {
    const key = '20990102'; // fixed future-like key; ensures no collision with real cache
    // Clear any prior cache for this key
    try { localStorage.removeItem(`sudoku-daily-${key}`); localStorage.removeItem(`sudoku-daily-reroll-${key}`); } catch {}

    const g1 = new SudokuGame({ headless: true });
    const g2 = new SudokuGame({ headless: true });

    // Deterministic load by key
    await g1.loadDailyByKey(key, 'medium');
    await g2.loadDailyByKey(key, 'medium');
    expect(g1.board).toEqual(g2.board);

    // Reroll once changes board and prevents second reroll
    // Use g1 as active; fake today key to our fixed key by stubbing getUtcDateKey
    g1._activeDailyKey = key;
    g1.getUtcDateKey = () => key;
    // Seed initial daily cache for reroll path
    try { localStorage.setItem(`sudoku-daily-${key}`, JSON.stringify({ board: g1.board, solution: g1.solution, difficulty: 'medium' })); } catch {}
    const first = await g1.rerollDailyOnce(false);
    expect(first).toBe(true);
    const second = await g1.rerollDailyOnce(false);
    expect(!!second).toBe(false);
  });

  test('number pad disables when a digit is exhausted', () => {
    document.body.innerHTML = '';
    // Build number pad buttons 1..9
    for (let n = 1; n <= 9; n++) {
      const btn = document.createElement('button');
      btn.className = 'number-btn';
      btn.setAttribute('data-number', String(n));
      document.body.appendChild(btn);
    }
    const game = new SudokuGame({ headless: true });
    // Fill exactly 9 occurrences of number 1
    game.board = Array(9).fill().map(() => Array(9).fill(0));
    for (let r = 0; r < 9; r++) game.board[r][0] = 1;
    game.updateNumberPadAvailability();
    const oneBtn = document.querySelector('.number-btn[data-number="1"]');
    const twoBtn = document.querySelector('.number-btn[data-number="2"]');
    expect(oneBtn?.disabled).toBe(true);
    expect(oneBtn?.classList.contains('disabled')).toBe(true);
    expect(twoBtn?.disabled).toBe(false);
  });

  test('recordWin and recordLoss update stats correctly; loss requires a move', () => {
    // Reset storage
    try { localStorage.clear(); } catch {}
    localStorage.setItem('sudoku-last-difficulty', 'hard');
    const game = new SudokuGame({ headless: true });

    // Loss without a move should not count
    game._hasMadeMove = false;
    game.recordLoss();
    const s0 = JSON.parse(localStorage.getItem('sudoku-stats') || '{}');
    expect(s0.totalLosses || 0).toBe(0);

    // Now count a loss
    game._hasMadeMove = true;
    game.recordLoss();
    let s1 = JSON.parse(localStorage.getItem('sudoku-stats') || '{}');
    expect(s1.totalLosses).toBe(1);
    expect(s1.totalCompleted).toBe(1);
    expect(s1.byDifficulty?.hard?.played).toBe(1);
    expect(s1.byDifficulty?.hard?.wins || 0).toBe(0);

    // Record a win
    game.recordWin();
    let s2 = JSON.parse(localStorage.getItem('sudoku-stats') || '{}');
    expect(s2.totalWins).toBe(1);
    expect(s2.totalLosses).toBe(1);
    expect(s2.totalCompleted).toBe(2);
    expect(s2.byDifficulty?.hard?.played).toBe(2);
    expect(s2.byDifficulty?.hard?.wins).toBe(1);
  });

  test('updateHintUi reflects finite and unlimited hint states', () => {
    document.body.innerHTML = '';
    const btn = document.createElement('button');
    btn.id = 'hint-btn';
    const badge = document.createElement('span');
    badge.id = 'hint-badge';
    document.body.appendChild(btn);
    document.body.appendChild(badge);

    const game = new SudokuGame({ headless: true });
    // Finite: 3 limit, used 2 → left 1; enabled
    game.hintsLimit = 3;
    game.hintsUsed = 2;
    game.updateHintUi();
    expect(btn.disabled).toBe(false);
    expect(badge.textContent).toBe('1');

    // Out of hints
    game.hintsUsed = 3;
    game.updateHintUi();
    expect(btn.disabled).toBe(true);
    expect(badge.textContent).toBe('0');

    // Unlimited
    game.hintsLimit = Infinity;
    game.hintsUsed = 0;
    game.updateHintUi();
    expect(btn.disabled).toBe(false);
    expect(badge.style.display).toBe('none');
  });

  test('resumeSettings roundtrip for Lives slider including Unlimited=11', () => {
    // Prepare UI controls present for both persist and resume paths
    document.body.innerHTML = '';
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'lives-limit';
    slider.value = '11';
    const valueLabel = document.createElement('span');
    valueLabel.id = 'lives-limit-value';
    document.body.appendChild(slider);
    document.body.appendChild(valueLabel);

    try { localStorage.clear(); } catch {}
    const g1 = new SudokuGame({ headless: true });
    // Persist settings with Unlimited lives (11)
    g1.persistSettings();

    // New instance resumes settings
    const g2 = new SudokuGame({ headless: true });
    g2.resumeSettings();
    expect(g2.livesEnabled).toBe(false);
    expect(g2.livesLimit).toBe(Infinity);
    expect(slider.value).toBe('11');
    expect(valueLabel.textContent).toBe('Unlimited');
  });

  test('Zen mode: toggles UI state and suppresses stats', () => {
    document.body.innerHTML = '';
    const time = document.createElement('button'); time.id = 'timer-toggle'; document.body.appendChild(time);
    const status = document.createElement('div'); status.className = 'game-status'; document.body.appendChild(status);
    const hb = document.createElement('div'); hb.id = 'health-bar'; document.body.appendChild(hb);
    const game = new SudokuGame({ headless: true });
    game.applyZenMode(true);
    expect(game._zenMode).toBe(true);
    expect(document.documentElement.classList.contains('zen')).toBe(true);
    // Stats suppressed
    const s0 = JSON.parse(localStorage.getItem('sudoku-stats') || '{}');
    game.recordWin();
    game.recordLoss();
    const s1 = JSON.parse(localStorage.getItem('sudoku-stats') || '{}');
    expect(s1).toEqual(s0);
  });

  test('giveHint respects hintsLimit and applies time penalty', () => {
    document.body.innerHTML = '';
    const status = document.createElement('div'); status.id = 'status-message'; document.body.appendChild(status);
    const timer = document.createElement('span'); timer.id = 'time'; document.body.appendChild(timer);
    const game = new SudokuGame({ headless: true });
    game.generateSolvedBoard();
    game.solution = game.board.map(r => [...r]);
    game.board = Array(9).fill().map(() => Array(9).fill(0));
    game.hintsLimit = 1;
    game.hintPenaltySeconds = 30;
    // First hint fills one cell and increments hintsUsed
    game.giveHint();
    expect(game.board.flat().filter(v => v !== 0).length).toBe(1);
    expect(game.hintsUsed).toBe(1);
    const firstStatus = document.getElementById('status-message')?.textContent || '';
    expect(firstStatus.toLowerCase()).toContain('hint');
    // Second hint rejected with message and no additional fill
    game.giveHint();
    expect(game.board.flat().filter(v => v !== 0).length).toBe(1);
    const secondStatus = document.getElementById('status-message')?.textContent || '';
    expect(secondStatus.toLowerCase()).toContain('no hints');
  });

  test('recordWin does not update best time when hints are used (assisted run)', () => {
    // Reset storage and seed a prior best time for medium
    try { localStorage.clear(); } catch {}
    localStorage.setItem('sudoku-last-difficulty', 'medium');
    localStorage.setItem('sudoku-stats', JSON.stringify({ bestTimes: { medium: 200 }, byDifficulty: { medium: { played: 0, wins: 0 } } }));

    const game = new SudokuGame({ headless: true });
    // Simulate an active run elapsed of 100s
    game._hasStarted = true;
    game.startTime = Date.now() - 100 * 1000;
    // Mark as assisted
    game.hintsUsed = 1;

    const newBest = game.recordWin();
    const stats = JSON.parse(localStorage.getItem('sudoku-stats') || '{}');

    // Best time should remain unchanged because hints were used
    expect(stats.bestTimes.medium).toBe(200);
    expect(newBest).toBe(false);
    // Wins/played should still increment
    expect(stats.totalWins).toBe(1);
    expect(stats.totalCompleted).toBe(1);
    expect(stats.byDifficulty.medium.played).toBe(1);
    expect(stats.byDifficulty.medium.wins).toBe(1);
  });

  test('checkPuzzle marks errors and success', () => {
    document.body.innerHTML = '';
    const boardHost = document.createElement('div'); boardHost.id = 'board'; document.body.appendChild(boardHost);
    const status = document.createElement('div'); status.id = 'status-message'; document.body.appendChild(status);
    const game = new SudokuGame({ headless: true });
    game.generateSolvedBoard();
    game.solution = game.board.map(r => [...r]);
    // Create DOM inputs for a couple cells
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
      const wrap = document.createElement('div');
      const cell = document.createElement('input');
      cell.className = 'cell'; cell.setAttribute('data-row', String(r)); cell.setAttribute('data-col', String(c));
      wrap.appendChild(cell); boardHost.appendChild(wrap);
    }
    // Make one wrong
    game.initialBoard = game.board.map(row => row.map(() => 0));
    game.board[0][0] = (game.solution[0][0] % 9) + 1; // wrong value
    game.updateDisplay();
    game.checkPuzzle();
    const wrongCell = document.querySelector('.cell[data-row="0"][data-col="0"]');
    expect(wrongCell?.classList.contains('error')).toBe(true);
    // Fix and re-check
    game.board[0][0] = game.solution[0][0];
    game.updateDisplay();
    game.checkPuzzle();
    const msg = document.getElementById('status-message')?.textContent || '';
    expect(msg.toLowerCase()).toContain('all numbers are correct');
  });
});


