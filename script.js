class SudokuGame {
    constructor(options = {}) {
        this._headless = !!options.headless;
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.initialBoard = Array(9).fill().map(() => Array(9).fill(0));
        this.notes = Array(9).fill().map(() => Array(9).fill(null).map(() => new Set()));
        this.selectedCell = null;
        this.timer = null;
        this.startTime = null;
        this.isGameComplete = false;

        // History for undo/redo
        this.history = [];
        this.redoStack = [];
        
        // Modes/state
        this.isNotesMode = false;
        this.lockedNumber = null;
        // Input environment
        const maxTouchPoints = (typeof navigator !== 'undefined' && navigator.maxTouchPoints) ? navigator.maxTouchPoints : 0;
        this.touchMode = maxTouchPoints > 0;
        // Pointer painting state (for locked-number drag painting)
        this._isPainting = false;
        this._paintingPointerId = null;
        // Touch long-press and gesture state
        this._pressTimer = null;
        this._pressStartX = 0;
        this._pressStartY = 0;
        this._pressMoved = false;
        this._longPressActive = false;
        // Temporary notes-hold state
        this._notesHoldActive = false;
        this._notesHoldWas = null;
        this._notesHoldTimer = null;

        // Mistakes control (default to limited hearts until settings are loaded)
        this.mistakesEnabled = true;
        this.mistakeLimit = 3;
        this.mistakesCount = 0;
        this.lastWrongValues = Array(9).fill().map(() => Array(9).fill(null));
        this.isGameOver = false;
        // Timer pause/resume state
        this.isPaused = false;
        this._elapsedBeforePause = 0;
        
        if (!this._headless) {
            this.initializeGame();
            this.setupEventListeners();
        }
        // Try to resume saved progress and settings
        if (!this._headless) {
            this.resumeSettings && this.resumeSettings();
            this.renderHealthBar();
            this.resumeFromStorage && this.resumeFromStorage();
        }

        // Seed calendar and daily state
        this._calendarRefMonth = new Date();
        this._activeDailyKey = null;
        // Initialize daily notification dot
        this.updateDailyIconBadge && this.updateDailyIconBadge();
    }

    // Determine if there is an active, non-finished game that should trigger confirmation
    isGameInProgress() {
        // In progress if not complete/over and any move has been made or timer has started
        const anyMoves = (this.history && this.history.length > 0);
        const hasElapsed = this.getElapsedSeconds && this.getElapsedSeconds() > 0;
        return !this.isGameComplete && !this.isGameOver && (anyMoves || hasElapsed);
    }
    
    updateModeIndicator({ type, difficulty, dateKey }) {
        const host = document.getElementById('mode-indicator');
        if (!host) return;
        // Build pill with icon + label (for daily show date)
        const cls = `mode-pill mode-${difficulty || 'medium'}`;
        const icon = this.getDifficultyIcon(difficulty || 'medium');
        if (type === 'daily' && dateKey) {
            const d = this.parseUtcKeyToDate(dateKey);
            const mon = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
            const day = String(d.getUTCDate()).padStart(2, '0');
            const formatted = `${mon}-${day}`; // mmm-DD
            host.innerHTML = `<span class="mode-label">Daily</span><span class="${cls}"><span class="icon">${icon}</span><span class="mode-date">${formatted}</span></span>`;
        } else {
        const label = (difficulty || 'medium');
            host.innerHTML = `<span class="mode-label">Mode</span><span class="${cls}"><span class="icon">${icon}</span><span class="mode-date">${label[0].toUpperCase()+label.slice(1)}</span></span>`;
        }
        // Update icon badge state whenever mode changes
        this.updateDailyIconBadge && this.updateDailyIconBadge();
    }

    // Show a notification dot on the calendar icon if today's daily is not completed
    updateDailyIconBadge() {
        const dot = document.getElementById('daily-dot');
        if (!dot) return;
        try {
            const key = this.getUtcDateKey();
            const results = JSON.parse(localStorage.getItem('sudoku-daily-results') || '{}');
            const completed = !!(results && results[key] && results[key].completed);
            dot.style.display = completed ? 'none' : 'inline-block';
        } catch {
            dot.style.display = 'inline-block';
        }
    }

    spawnMistakeFloater(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cell || !cell.parentElement) return;
        const floater = document.createElement('div');
        floater.className = 'mistake-floater show';
        floater.textContent = '−1';
        // position relative to cell wrapper
        const wrapper = cell.parentElement;
        wrapper.style.position = wrapper.style.position || 'relative';
        floater.style.left = '50%';
        floater.style.top = '6px';
        floater.style.transform = 'translateX(-50%)';
        wrapper.appendChild(floater);
        floater.addEventListener('animationend', () => { floater.remove(); }, { once: true });
    }

    initializeGame() {
        this.createBoard();
        this.setupResponsiveSizing();
        // Restore last chosen difficulty if available
        try {
            const saved = localStorage.getItem('sudoku-last-difficulty');
            if (saved) {
                this.updateModeIndicator({ type: 'normal', difficulty: saved });
                this.generatePuzzle(saved);
            } else {
                this.generatePuzzle('medium');
                this.updateModeIndicator({ type: 'normal', difficulty: 'medium' });
            }
        } catch {
            this.generatePuzzle('medium');
            this.updateModeIndicator({ type: 'normal', difficulty: 'medium' });
        }
        this.startTimer();
        this.updateDisplay();
        // Ensure health bar is visible according to current settings
        this.renderHealthBar();
    }

    // Compute pixel-perfect cell size to avoid subpixel gaps on mobile
    setupResponsiveSizing() {
        const boardElement = document.getElementById('board');
        const apply = () => {
            if (!boardElement) return;
            // available width (in px)
            const vw = Math.min(window.innerWidth, document.documentElement.clientWidth || window.innerWidth);
            // Container paddings/margins are inside .container; give the board some side breathing room
            const maxBoardWidth = Math.min(520, Math.max(300, vw - 28));
            // Choose the largest integer cell size that fits (account for 8 gaps of 1px)
            const raw = Math.floor((maxBoardWidth - 8) / 9);
            const cellSize = Math.max(34, Math.min(60, raw));
            // Compute exact board width for these integer tracks
            const boardWidth = cellSize * 9 + 8; // add 8px for 1px gaps between 9 columns
            boardElement.style.width = boardWidth + 'px';
            document.documentElement.style.setProperty('--cell-size', cellSize + 'px');
        };
        // Initial and on resize/orientation change
        apply();
        window.addEventListener('resize', apply);
        window.addEventListener('orientationchange', apply);
    }

    createBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        // A11y: mark as grid
        try {
            boardElement.setAttribute('role', 'grid');
            boardElement.setAttribute('aria-label', 'Sudoku board');
        } catch {}
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const wrapper = document.createElement('div');
                wrapper.className = 'cell-container';

                const cell = document.createElement('input');
                cell.type = 'text';
                // On touch devices, suppress OS keyboard; rely on on-screen number pad
                if (this.touchMode) cell.setAttribute('inputmode', 'none'); else cell.setAttribute('inputmode', 'numeric');
                cell.setAttribute('autocomplete','off');
                cell.setAttribute('autocorrect','off');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.maxLength = 1;
                // A11y roles/labels
                try {
                    cell.setAttribute('role', 'gridcell');
                    cell.setAttribute('aria-selected', 'false');
                    cell.setAttribute('aria-label', `Row ${row + 1}, Column ${col + 1}`);
                } catch {}

                const notes = document.createElement('div');
                notes.className = 'notes';
                notes.dataset.row = row;
                notes.dataset.col = col;
                for (let n = 1; n <= 9; n++) {
                    const note = document.createElement('div');
                    note.className = 'note-item';
                    note.textContent = '';
                    note.dataset.value = n;
                    notes.appendChild(note);
                }

                cell.addEventListener('click', () => this.selectCell(cell, row, col));
                cell.addEventListener('input', (e) => this.handleCellInput(e, row, col));
                cell.addEventListener('keydown', (e) => this.handleKeyDown(e, row, col));

                wrapper.appendChild(cell);
                wrapper.appendChild(notes);
                boardElement.appendChild(wrapper);
            }
        }
    }

    generatePuzzle(difficulty = 'medium') {
        // console.log('Generating puzzle with difficulty:', difficulty);
        
        // Generate a solved board first
        this.generateSolvedBoard();
        // console.log('Solved board generated:', this.board);
        
        // Copy solution
        this.solution = this.board.map(row => [...row]);
        
        // Remove numbers based on difficulty
        const cellsToRemove = {
            'easy': 30,
            'medium': 40,
            'hard': 50,
            'expert': 60,
            'master': 62,
            'extreme': 64
        };
        
        const cellsToRemoveCount = cellsToRemove[difficulty] || 40;
        // Use symmetric removal with uniqueness check
        if (typeof this.removeNumbersSymmetricUnique === 'function') {
            this.removeNumbersSymmetricUnique(cellsToRemoveCount);
        } else {
            this.removeNumbers(cellsToRemoveCount);
        }
        // console.log('Numbers removed, puzzle board:', this.board);
        
        // Copy to initial board
        this.initialBoard = this.board.map(row => [...row]);
        
        // Reset all notes to empty for a fresh puzzle
        this.notes = Array(9).fill().map(() => Array(9).fill(null).map(() => new Set()));
        // console.log('Initial board saved:', this.initialBoard);
        
        // Auto-candidates on start
        if (this.isAutoCandidatesEnabled && this.isAutoCandidatesEnabled()) {
            this.recomputeAllCandidates();
        }
    }

    // ---- Daily puzzle helpers ----
    getUtcDateKey(date = new Date()) {
        const y = date.getUTCFullYear();
        const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const d = date.getUTCDate().toString().padStart(2, '0');
        return `${y}${m}${d}`;
    }

    parseUtcKeyToDate(key) {
        const y = parseInt(key.slice(0,4));
        const m = parseInt(key.slice(4,6)) - 1;
        const d = parseInt(key.slice(6,8));
        return new Date(Date.UTC(y, m, d));
    }

    getNextUtcMidnight() {
        const now = new Date();
        const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
        return next;
    }

    startDailyCountdown() {
        const target = this.getNextUtcMidnight();
        const update = () => {
            const secs = Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000));
            const hh = Math.floor(secs / 3600).toString().padStart(2, '0');
            const mm = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
            const ss = (secs % 60).toString().padStart(2, '0');
            // Reuse status line to show countdown when menu is open or always if desired
            // document.getElementById('status-message').textContent = `Next Daily in ${hh}:${mm}:${ss}`;
        };
        if (this._dailyTimer) clearInterval(this._dailyTimer);
        this._dailyTimer = setInterval(update, 1000);
        update();
    }

    setDailyUiState(isDaily, difficulty) {
        // Enforce fixed mistake limits in Daily; restore user setting otherwise
        const slider = document.getElementById('mistakes-limit');
        const label = document.getElementById('mistakes-limit-value');
        const note = document.getElementById('mistakes-daily-note');
        const pill = document.getElementById('mistakes-limit-pill');
        const preview = document.getElementById('mistakes-preview');
        const map = { easy: 6, medium: 5, hard: 4, expert: 3, master: 2, extreme: 1 };

        if (isDaily) {
            // Save the user's pre-daily slider value once so we can restore it later
            if (typeof this._userMistakeRestoreValue !== 'number') {
                let currentValue = 3;
                if (slider && slider.value) {
                    currentValue = parseInt(slider.value);
                } else {
                    // Derive from current in-memory setting if slider unavailable
                    currentValue = (!this.mistakesEnabled || !Number.isFinite(this.mistakeLimit)) ? 11 : (Number.isFinite(this.mistakeLimit) ? this.mistakeLimit : 3);
                }
                this._userMistakeRestoreValue = currentValue;
            }

            const lim = map[difficulty] ?? 3;
            this.mistakesEnabled = true;
            this.mistakeLimit = lim;
            if (slider) { slider.value = String(lim); slider.disabled = true; }
            if (label) label.textContent = String(lim);
            if (pill) pill.textContent = String(lim);
            if (preview) preview.textContent = `Hearts: ×${lim}`;
            if (note) note.style.display = 'block';
        } else {
            if (slider) slider.disabled = false;
            if (note) note.style.display = 'none';

            // Restore the user's slider value and in-memory rule from before Daily
            let v;
            if (typeof this._userMistakeRestoreValue === 'number') {
                v = this._userMistakeRestoreValue;
            } else {
                try {
                    const s = JSON.parse(localStorage.getItem('sudoku-settings') || '{}');
                    v = (typeof s.mistakeLimit === 'number') ? s.mistakeLimit : 3;
                } catch { v = 3; }
            }
            if (slider) slider.value = String(v);
            if (v >= 11) {
                this.mistakesEnabled = false;
                this.mistakeLimit = Infinity;
                if (label) label.textContent = 'Unlimited';
                if (pill) pill.textContent = '∞';
                if (preview) preview.textContent = 'Hearts: ∞';
            } else {
                this.mistakesEnabled = true;
                this.mistakeLimit = v;
                if (label) label.textContent = String(v);
                if (pill) pill.textContent = String(v);
                if (preview) preview.textContent = `Hearts: ×${v}`;
            }
            // Clear saved value after restore so re-entering Daily can snapshot again
            delete this._userMistakeRestoreValue;
        }

        this.resetMistakes();
        this.renderHealthBar();
    }

    generateDaily(difficulty) {
        // Ensure any previous Game Over or Pause overlays are cleared when starting Daily
        this.isGameComplete = false;
        this.isGameOver = false;
        const go = document.getElementById('gameover-overlay');
        if (go) go.style.display = 'none';
        const po = document.getElementById('pause-overlay');
        if (po) po.style.display = 'none';
        this.lockedNumber = null;
        document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('active'));
        if (this.selectedCell) { this.selectedCell.classList.remove('selected'); this.selectedCell = null; }
        document.querySelectorAll('.cell.highlighted').forEach(cell => cell.classList.remove('highlighted'));
        const key = this.getUtcDateKey();
        const storeKey = `sudoku-daily-${key}`;
        const cached = localStorage.getItem(storeKey);
        if (cached) {
            try {
                const data = JSON.parse(cached);
                if (data && data.board && data.solution) {
                    this.board = data.board;
                    this.solution = data.solution;
                    this.initialBoard = data.board.map(row => [...row]);
                    this.updateDisplay();
                    this.setDailyUiState(true, data.difficulty || difficulty);
                    this.renderHealthBar();
                    this.showStatus(`Loaded Daily ${key} (${data.difficulty || difficulty})`, 'info');
                    this.startDailyCountdown();
                    // Refresh candidates based on settings when loading cached daily
                    if (this.isAutoCandidatesEnabled && this.isAutoCandidatesEnabled()) {
                        this.recomputeAllCandidates();
                    } else {
                        for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) { this.notes[r][c].clear(); this.updateNotesDisplay(r, c); }
                    }
                    return;
                }
            } catch {}
        }

        // Seeded RNG from date
        const seed = key;
        const rng = this.createSeededRng(seed);
        const randInt = (max) => Math.floor(rng() * max);

        // Generate solved board using local RNG
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        const fillBox = (row, col) => {
            const nums = [1,2,3,4,5,6,7,8,9];
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const idx = randInt(nums.length);
                    this.board[row+i][col+j] = nums[idx];
                    nums.splice(idx,1);
                }
            }
        };
        fillBox(0,0); fillBox(3,3); fillBox(6,6);
        this.solveBoard();
        this.solution = this.board.map(r => [...r]);

        // Remove with symmetry + uniqueness using local RNG
        const removeSymUnique = (count) => {
            const positions = [];
            for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (r < 4 || (r === 4 && c <= 4)) positions.push([r,c]);
            for (let i = positions.length - 1; i > 0; i--) { const j = randInt(i+1); [positions[i], positions[j]] = [positions[j], positions[i]]; }
            let removed = 0;
            for (const [r,c] of positions) {
                if (removed >= count) break;
                const sr = 8 - r, sc = 8 - c;
                if (this.board[r][c] === 0) continue;
                const v1 = this.board[r][c], v2 = this.board[sr][sc];
                this.board[r][c] = 0; if (r !== sr || c !== sc) this.board[sr][sc] = 0;
                if (this.hasUniqueSolution()) { removed += (r===sr && c===sc) ? 1 : 2; }
                else { this.board[r][c] = v1; if (r !== sr || c !== sc) this.board[sr][sc] = v2; }
            }
        };
        const cellsToRemove = { easy: 30, medium: 40, hard: 50, expert: 60, master: 62, extreme: 64 };
        removeSymUnique(cellsToRemove[difficulty] || 40);
        this.initialBoard = this.board.map(r => [...r]);
        this.updateDisplay();
        if (this.isAutoCandidatesEnabled && this.isAutoCandidatesEnabled()) {
            this.recomputeAllCandidates();
        } else {
            for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) { this.notes[r][c].clear(); this.updateNotesDisplay(r, c); }
        }
        this.setDailyUiState(true, difficulty);
        this.renderHealthBar();

        // Cache daily
        try { localStorage.setItem(storeKey, JSON.stringify({ board: this.board, solution: this.solution, difficulty })); } catch {}
        this.showStatus(`Generated Daily ${key} (${difficulty})`, 'info');
        this._activeDailyKey = key;
        this.startDailyCountdown();
        this.updateModeIndicator({ type: 'daily', difficulty, dateKey: key });
    }

    // Generate or load daily by specific UTC date key
    async loadDailyByKey(key, difficulty) {
        if (this.isGameInProgress && this.isGameInProgress()) {
            const proceed = await this.showConfirm('Load this Daily? Current game will end and count as a loss.');
            if (!proceed) return false;
            this.recordLoss();
        }
        // Ensure any previous Game Over or Pause overlays are cleared when loading a Daily
        this.isGameComplete = false;
        this.isGameOver = false;
        const go = document.getElementById('gameover-overlay');
        if (go) go.style.display = 'none';
        const po = document.getElementById('pause-overlay');
        if (po) po.style.display = 'none';
        this.lockedNumber = null;
        document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('active'));
        if (this.selectedCell) { this.selectedCell.classList.remove('selected'); this.selectedCell = null; }
        document.querySelectorAll('.cell.highlighted').forEach(cell => cell.classList.remove('highlighted'));
        const storeKey = `sudoku-daily-${key}`;
        const cached = localStorage.getItem(storeKey);
        if (cached) {
            try {
                const data = JSON.parse(cached);
                if (data && data.board && data.solution) {
                    this.board = data.board;
                    this.solution = data.solution;
                    this.initialBoard = data.board.map(row => [...row]);
                    this.updateDisplay();
                    this.setDailyUiState(true, data.difficulty || difficulty);
                    this.showStatus(`Loaded Daily ${key} (${data.difficulty || difficulty})`, 'info');
                    this._activeDailyKey = key;
                    if (this.isAutoCandidatesEnabled && this.isAutoCandidatesEnabled()) {
                        this.recomputeAllCandidates();
                    } else {
                        for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) { this.notes[r][c].clear(); this.updateNotesDisplay(r, c); }
                    }
                    this.updateModeIndicator({ type: 'daily', difficulty: data.difficulty || difficulty, dateKey: key });
                    return true;
                }
            } catch {}
        }
        // If not cached, generate deterministically for that day (using its key as seed)
        const rng = this.createSeededRng(key);
        const randInt = (max) => Math.floor(rng() * max);
        // generate solved
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        const fillBox = (row, col) => {
            const nums = [1,2,3,4,5,6,7,8,9];
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const idx = randInt(nums.length);
                    this.board[row+i][col+j] = nums[idx];
                    nums.splice(idx,1);
                }
            }
        };
        fillBox(0,0); fillBox(3,3); fillBox(6,6);
        this.solveBoard();
        this.solution = this.board.map(r => [...r]);
        const removeSymUnique = (count) => {
            const positions = [];
            for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (r < 4 || (r === 4 && c <= 4)) positions.push([r,c]);
            for (let i = positions.length - 1; i > 0; i--) { const j = randInt(i+1); [positions[i], positions[j]] = [positions[j], positions[i]]; }
            let removed = 0;
            for (const [r,c] of positions) {
                if (removed >= count) break;
                const sr = 8 - r, sc = 8 - c;
                if (this.board[r][c] === 0) continue;
                const v1 = this.board[r][c], v2 = this.board[sr][sc];
                this.board[r][c] = 0; if (r !== sr || c !== sc) this.board[sr][sc] = 0;
                if (this.hasUniqueSolution()) { removed += (r===sr && c===sc) ? 1 : 2; }
                else { this.board[r][c] = v1; if (r !== sr || c !== sc) this.board[sr][sc] = v2; }
            }
        };
        const cellsToRemove = { easy: 30, medium: 40, hard: 50, expert: 60, master: 62, extreme: 64 };
        const diff = difficulty || this.getDifficultyForDateKey(key);
        removeSymUnique(cellsToRemove[diff] || 40);
        this.initialBoard = this.board.map(r => [...r]);
        this.updateDisplay();
        if (this.isAutoCandidatesEnabled && this.isAutoCandidatesEnabled()) {
            this.recomputeAllCandidates();
        } else {
            for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) { this.notes[r][c].clear(); this.updateNotesDisplay(r, c); }
        }
        // Reset timer and undo/redo when loading a daily
        this.startTime = null;
        this.isPaused = false;
        this._pauseStartedAt = null;
        this._elapsedBeforePause = 0;
        // Reset undo/redo when loading a daily
        this.history = [];
        this.redoStack = [];
        this.setDailyUiState(true, diff);
        this.renderHealthBar();
        try { localStorage.setItem(storeKey, JSON.stringify({ board: this.board, solution: this.solution, difficulty: diff })); } catch {}
        this._activeDailyKey = key;
        this.updateModeIndicator({ type: 'daily', difficulty: diff, dateKey: key });
        return true;
    }

    getDifficultyForDateKey(key) {
        // Build a weekly varied pattern based on the week's seed
        const weekSeed = this.getWeekSeedFromDateKey(key);
        const pattern = this.buildWeeklyPattern(weekSeed);
        const dt = this.parseUtcKeyToDate(key);
        const day = dt.getUTCDay(); // 0..6, Sunday..Saturday
        return pattern[day] || 'medium';
    }

    getWeekSeedFromDateKey(key) {
        // Anchor seed: the Sunday of this UTC week
        const dt = this.parseUtcKeyToDate(key);
        const dow = dt.getUTCDay();
        const sunday = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate() - dow));
        return this.getUtcDateKey(sunday);
    }

    buildWeeklyPattern(weekSeed) {
        const rng = this.createSeededRng('W:' + weekSeed);
        // Choose one of a few mixes to vary counts weekly (sum to 7). Include Master/Extreme sparingly.
        const mixes = [
            { easy: 2, medium: 2, hard: 1, expert: 1, master: 1 },
            { easy: 1, medium: 3, hard: 1, expert: 1, master: 1 },
            { easy: 1, medium: 2, hard: 2, expert: 1, master: 1 },
            { easy: 1, medium: 2, hard: 2, expert: 1, extreme: 1 },
            { easy: 2, medium: 1, hard: 2, expert: 1, master: 1 },
        ];
        const mix = mixes[Math.floor(rng() * mixes.length)];
        const bag = [];
        Object.entries(mix).forEach(([k, n]) => { for (let i = 0; i < n; i++) bag.push(k); });
        while (bag.length < 7) bag.push('medium');
        if (bag.length > 7) bag.length = 7;
        for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        // Light bias: if a harder puzzle is early and easier late, swap them
        if (rng() < 0.5) {
            const early = Math.floor(rng() * 3); // 0..2
            const late = 4 + Math.floor(rng() * 3); // 4..6
            if (this.rankDifficulty(bag[early]) > this.rankDifficulty(bag[late])) {
                [bag[early], bag[late]] = [bag[late], bag[early]];
            }
        }
        return bag; // Sunday..Saturday
    }

    rankDifficulty(d) {
        switch (d) {
            case 'easy': return 0;
            case 'medium': return 1;
            case 'hard': return 2;
            case 'expert': return 3;
            case 'master': return 4;
            case 'extreme': return 5;
            default: return 1;
        }
    }

    createSeededRng(seedString) {
        let h = 2166136261 >>> 0;
        if (this._rerollSuffix) seedString = seedString + this._rerollSuffix;
        for (let i = 0; i < seedString.length; i++) { h ^= seedString.charCodeAt(i); h = Math.imul(h, 16777619); }
        let state = h || 1;
        return function() {
            state ^= state << 13; state >>>= 0;
            state ^= state >> 17; state >>>= 0;
            state ^= state << 5;  state >>>= 0;
            return (state >>> 0) / 4294967296;
        };
    }

    generateSolvedBoard() {
        // Start with an empty board
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        
        // Fill diagonal 3x3 boxes first (these can be filled independently)
        // Only fill boxes at (0,0) and (3,3) and (6,6) to avoid going out of bounds
        this.fillBox(0, 0);
        this.fillBox(3, 3);
        this.fillBox(6, 6);
        
        // Solve the rest of the board
        if (!this.solveBoard()) {
            // If solving fails, try again with a fresh board
            this.board = Array(9).fill().map(() => Array(9).fill(0));
            this.fillBox(0, 0);
            this.fillBox(3, 3);
            this.fillBox(6, 6);
            this.solveBoard();
        }
    }

    fillBox(row, col) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const randomIndex = Math.floor(Math.random() * numbers.length);
                this.board[row + i][col + j] = numbers[randomIndex];
                numbers.splice(randomIndex, 1);
            }
        }
    }

    solveBoard() {
        const emptyCell = this.findEmptyCell();
        if (!emptyCell) return true;
        
        const [row, col] = emptyCell;
        
        for (let num = 1; num <= 9; num++) {
            if (this.isValidMove(row, col, num)) {
                this.board[row][col] = num;
                
                if (this.solveBoard()) {
                    return true;
                }
                
                this.board[row][col] = 0;
            }
        }
        
        return false;
    }

    findEmptyCell() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }

    isValidMove(row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (this.board[row][x] === num) return false;
        }
        
        // Check column
        for (let x = 0; x < 9; x++) {
            if (this.board[x][col] === num) return false;
        }
        
        // Check 3x3 box
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.board[startRow + i][startCol + j] === num) return false;
            }
        }
        
        return true;
    }

    // Helpers for uniqueness checking on arbitrary grids
    hasUniqueSolution() {
        const grid = this.board.map(row => [...row]);
        let solutionsFound = 0;
        const solveCount = () => {
            if (solutionsFound > 1) return true; // early exit
            const empty = this.findEmptyInGrid(grid);
            if (!empty) { solutionsFound++; return false; }
            const [r, c] = empty;
            for (let n = 1; n <= 9; n++) {
                if (this.isValidInGrid(grid, r, c, n)) {
                    grid[r][c] = n;
                    if (solveCount()) return true;
                    grid[r][c] = 0;
                }
            }
            return false;
        };
        solveCount();
        return solutionsFound === 1;
    }

    findEmptyInGrid(grid) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c] === 0) return [r, c];
            }
        }
        return null;
    }

    isValidInGrid(grid, row, col, num) {
        for (let x = 0; x < 9; x++) if (grid[row][x] === num) return false;
        for (let x = 0; x < 9; x++) if (grid[x][col] === num) return false;
        const sr = Math.floor(row / 3) * 3;
        const sc = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[sr + i][sc + j] === num) return false;
            }
        }
        return true;
    }

    removeNumbers(count) {
        let removed = 0;
        while (removed < count) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (this.board[row][col] !== 0) {
                this.board[row][col] = 0;
                removed++;
            }
        }
    }

    selectCell(cell, row, col) {
        // Remove previous selection
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
            try { this.selectedCell.setAttribute('aria-selected', 'false'); } catch {}
        }
        
        // Add selection to current cell
        cell.classList.add('selected');
        this.selectedCell = cell;
        // Focus the input to keep keyboard entry in sync with the visible selection
        try {
            cell.focus();
            // Move caret to end
            const len = cell.value ? String(cell.value).length : 0;
            if (cell.setSelectionRange) cell.setSelectionRange(len, len);
            cell.setAttribute('aria-selected', 'true');
        } catch {}
        
        // In lock mode: selecting a cell that already contains a number should
        // auto-select the same number on the number pad (update lockedNumber/UI)
        try {
            const lockToggle = document.getElementById('pad-lock-toggle');
            const lockEnabled = !lockToggle || lockToggle.getAttribute('aria-pressed') === 'true';
            const currentVal = parseInt(cell.value || '0');
            if (lockEnabled && currentVal >= 1 && currentVal <= 9) {
                this.lockedNumber = currentVal;
                document.querySelectorAll('.number-btn, #pad-erase-btn').forEach(b => b.classList.remove('active'));
                const activeBtn = document.querySelector(`.number-btn[data-number="${currentVal}"]`);
                if (activeBtn) activeBtn.classList.add('active');
                this.syncNotesBadgeState();
                // Highlight grid to reflect the locked number
                this.highlightSameNumbers();
            }
        } catch {}

        // If a number is locked, placing it on click (or erase if 0)
        if (this.lockedNumber !== null && !cell.readOnly) {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);
            const v = this.lockedNumber;
            const lockToggle = document.getElementById('pad-lock-toggle');
            const lockEnabled = !lockToggle || lockToggle.getAttribute('aria-pressed') === 'true';
            const currentVal = parseInt(cell.value || '0');
            // In lock mode, if we just synced the lock to the cell's own value, skip placing
            const shouldSkipPlace = lockEnabled && currentVal === v && currentVal !== 0;
            if (!shouldSkipPlace) {
                if (this.isNotesMode && v > 0) {
                    this.toggleNote(r, c, v);
                } else {
                    this.setCellValue(r, c, v, 'locked-number');
                    this.checkGameComplete();
                }
            }
        }

        // Highlight related cells
        this.highlightRelatedCells(row, col);
        this.highlightSameNumbers();
    }

    highlightRelatedCells(row, col) {
        // Remove previous highlights
        document.querySelectorAll('.cell.highlighted').forEach(cell => {
            cell.classList.remove('highlighted');
        });
        
        // Highlight same row, column, and box
        for (let i = 0; i < 9; i++) {
            // Same row
            const rowCell = document.querySelector(`[data-row="${row}"][data-col="${i}"]`);
            if (rowCell) rowCell.classList.add('highlighted');
            
            // Same column
            const colCell = document.querySelector(`[data-row="${i}"][data-col="${col}"]`);
            if (colCell) colCell.classList.add('highlighted');
        }
        
        // Same 3x3 box
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const boxCell = document.querySelector(`[data-row="${startRow + i}"][data-col="${startCol + j}"]`);
                if (boxCell) boxCell.classList.add('highlighted');
            }
        }
    }

    handleCellInput(event, row, col) {
        const value = event.target.value;
        
        if (this.isNotesMode && (value >= '1' && value <= '9')) {
            const v = parseInt(value);
            this.toggleNote(row, col, v);
            event.target.value = this.board[row][col] === 0 ? '' : this.board[row][col];
        } else if (value === '' || (value >= '1' && value <= '9')) {
            const newVal = value === '' ? 0 : parseInt(value);
            this.setCellValue(row, col, newVal, 'input');
            this.checkGameComplete();
            // Auto-advance to next cell (row-major)
            if (this.selectedCell) {
                let r = row, c = col + 1;
                if (c > 8) { c = 0; r = row + 1; }
                if (r <= 8) {
                    const next = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                    if (next) this.selectCell(next, r, c);
                }
            }
        } else {
            event.target.value = '';
        }
    }

    handleKeyDown(event, row, col) {
        const k = event.key;
        const lower = k.toLowerCase();
        if (k >= '1' && k <= '9') {
            if (this.isNotesMode) {
                this.toggleNote(row, col, parseInt(k));
            } else {
                this.setCellValue(row, col, parseInt(k), 'keydown');
            }
            this.checkGameComplete();
            // Auto-advance after keyboard entry if enabled
            const autoAdv = this.isAutoAdvanceEnabled && this.isAutoAdvanceEnabled();
            if (autoAdv) {
                event.preventDefault();
                let nextRow = row;
                let nextCol = col;
                const forward = !event.shiftKey;
                if (forward) {
                    nextCol += 1;
                    if (nextCol > 8) { nextCol = 0; nextRow += 1; }
                } else {
                    nextCol -= 1;
                    if (nextCol < 0) { nextCol = 8; nextRow -= 1; }
                }
                if (nextRow >= 0 && nextRow <= 8) {
                    const next = document.querySelector(`[data-row="${nextRow}"][data-col="${nextCol}"]`);
                    if (next) this.selectCell(next, nextRow, nextCol);
                }
            }
        } else if (k === '0' || k === 'Backspace' || k === 'Delete') {
            if (this.isNotesMode) {
                this.clearNotes(row, col);
            } else {
                this.setCellValue(row, col, 0, 'erase');
            }
        } else if ((k === 'ArrowUp' || lower === 'w' || lower === 'k') && row > 0) {
            event.preventDefault();
            this.selectCell(document.querySelector(`[data-row="${row - 1}"][data-col="${col}"]`), row - 1, col);
        } else if ((k === 'ArrowDown' || lower === 's' || lower === 'j') && row < 8) {
            event.preventDefault();
            this.selectCell(document.querySelector(`[data-row="${row + 1}"][data-col="${col}"]`), row + 1, col);
        } else if ((k === 'ArrowLeft' || lower === 'a' || lower === 'h') && col > 0) {
            event.preventDefault();
            this.selectCell(document.querySelector(`[data-row="${row}"][data-col="${col - 1}"]`), row, col - 1);
        } else if ((k === 'ArrowRight' || lower === 'd' || lower === 'l') && col < 8) {
            event.preventDefault();
            this.selectCell(document.querySelector(`[data-row="${row}"][data-col="${col + 1}"]`), row, col + 1);
        } else if (k === 'Escape') {
            // Clear locked number and deactivate buttons
            this.lockedNumber = null;
            document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('active'));
        }
    }

    updateCellDisplay(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.value = this.board[row][col] === 0 ? '' : this.board[row][col];
            cell.classList.remove('error');
            
            if (this.board[row][col] !== 0 && this.board[row][col] !== this.solution[row][col]) {
                cell.classList.add('error');
            }
        }
        this.updateNotesDisplay(row, col);
        this.highlightSameNumbers();
    }

    setCellValue(row, col, value, source = 'api') {
        if (this.initialBoard[row][col] !== 0) return; // Don't change givens
        if (this.mistakesEnabled && this.isGameOver) return;
        const oldValue = this.board[row][col];
        if (oldValue === value) return;
        // Capture notes before changing value so undo can restore them
        const prevNotes = Array.from(this.notes[row][col]);
        this.board[row][col] = value;
        // Clear notes on set
        if (value !== 0) this.notes[row][col].clear();
        this.updateCellDisplay(row, col);
        // Haptic feedback for direct user placements/erases
        try {
            const userSources = ['numpad','keyboard','keydown','paint','locked-number','erase','input','tap'];
            if (this.touchMode && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function' && userSources.includes(source)) {
                navigator.vibrate(10);
            }
        } catch {}
        // record history including previous notes so undo can restore them
        this.history.push({ type: 'value', row, col, oldValue, newValue: value, prevNotes });
        this.redoStack = [];

        // Mistakes handling
        if (this.mistakesEnabled && value !== 0 && this.solution[row][col] !== value) {
            // Count unique wrong attempts per cell/value to avoid spamming
            if (this.lastWrongValues[row][col] !== value) {
                this.lastWrongValues[row][col] = value;
                this.mistakesCount += 1;
                this.updateHealthBar();
                this.spawnMistakeFloater(row, col);
                if (this.mistakesCount >= this.mistakeLimit) {
                    this.isGameOver = true;
                    this.stopTimer();
                    this.showGameOver();
                    this.recordLoss();
                }
            }
        }

        // Auto-candidates update
        if (typeof this.recomputeCandidatesForPeers === 'function' && this.isAutoCandidatesEnabled && this.isAutoCandidatesEnabled()) {
            this.recomputeCandidatesForPeers(row, col);
        }
        // Update availability of numbers on the pad
        this.updateNumberPadAvailability();
    }

    undo() {
        const last = this.history.pop();
        if (!last) return;
        if (last.type === 'value') {
            const { row, col, oldValue, newValue, prevNotes } = last;
            this.board[row][col] = oldValue;
            // Restore notes that were present before the value change
            if (Array.isArray(prevNotes)) {
                this.notes[row][col] = new Set(prevNotes);
            }
            this.updateCellDisplay(row, col);
            this.updateNotesDisplay(row, col);
            // Recompute candidates for peers if auto-candidates are enabled
            if (typeof this.recomputeCandidatesForPeers === 'function' && this.isAutoCandidatesEnabled && this.isAutoCandidatesEnabled()) {
                this.recomputeCandidatesForPeers(row, col);
            }
        } else if (last.type === 'note') {
            const { row, col, note, added } = last;
            if (added) this.notes[row][col].delete(note); else this.notes[row][col].add(note);
            this.updateNotesDisplay(row, col);
        } else if (last.type === 'notesClear') {
            const { row, col, prev } = last;
            this.notes[row][col] = new Set(prev);
            this.updateNotesDisplay(row, col);
        }
        this.redoStack.push(last);
        // Ensure number pad reflects current counts after undo
        this.updateNumberPadAvailability();
    }

    redo() {
        const next = this.redoStack.pop();
        if (!next) return;
        if (next.type === 'value') {
            const { row, col, oldValue, newValue } = next;
            this.board[row][col] = newValue;
            // Clearing notes again if placing a value
            if (newValue !== 0) this.notes[row][col].clear();
            this.updateCellDisplay(row, col);
            this.updateNotesDisplay(row, col);
            // Recompute candidates for peers if auto-candidates are enabled
            if (typeof this.recomputeCandidatesForPeers === 'function' && this.isAutoCandidatesEnabled && this.isAutoCandidatesEnabled()) {
                this.recomputeCandidatesForPeers(row, col);
            }
        } else if (next.type === 'note') {
            const { row, col, note, added } = next;
            if (added) this.notes[row][col].add(note); else this.notes[row][col].delete(note);
            this.updateNotesDisplay(row, col);
        } else if (next.type === 'notesClear') {
            const { row, col } = next;
            this.notes[row][col].clear();
            this.updateNotesDisplay(row, col);
        }
        this.history.push(next);
        // Ensure number pad reflects current counts after redo
        this.updateNumberPadAvailability();
    }

    toggleNote(row, col, value) {
        if (this.initialBoard[row][col] !== 0) return;
        if (this.board[row][col] !== 0) return;
        const set = this.notes[row][col];
        let added = false;
        if (set.has(value)) {
            set.delete(value);
        } else {
            set.add(value);
            added = true;
        }
        this.updateNotesDisplay(row, col);
        // Subtle haptic for note toggles on touch
        try { if (this.touchMode && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(6); } catch {}
        this.history.push({ type: 'note', row, col, note: value, added });
        this.redoStack = [];
    }

    clearNotes(row, col) {
        const prev = Array.from(this.notes[row][col]);
        this.notes[row][col].clear();
        this.updateNotesDisplay(row, col);
        this.history.push({ type: 'notesClear', row, col, prev });
        this.redoStack = [];
    }

    updateNotesDisplay(row, col) {
        const notesEl = document.querySelector(`.notes[data-row="${row}"][data-col="${col}"]`);
        if (!notesEl) return;
        const set = this.notes[row][col];
        const children = notesEl.children;
        for (let i = 0; i < children.length; i++) {
            const n = i + 1;
            children[i].textContent = set.has(n) ? n : '';
        }
    }

    updateDisplay() {
        // console.log('Updating display with board:', this.board);
        // console.log('Initial board:', this.initialBoard);
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    const value = this.board[row][col] === 0 ? '' : this.board[row][col];
                    cell.value = value;
                    cell.classList.toggle('initial', this.initialBoard[row][col] !== 0);
                    cell.readOnly = this.initialBoard[row][col] !== 0;
                    // Clear any lingering error class during a full repaint
                    cell.classList.remove('error');
                    // console.log(`Cell [${row}][${col}]: value=${value}, initial=${this.initialBoard[row][col] !== 0}`);
                }
                this.updateNotesDisplay(row, col);
            }
        }
        this.highlightSameNumbers();
        this.updateNumberPadAvailability();
    }

    highlightSameNumbers() {
        // Clear existing same-number highlights
        document.querySelectorAll('.cell.same-number').forEach(c => c.classList.remove('same-number'));
        
        if (!this.selectedCell) return;
        const selectedValue = this.selectedCell.value;
        if (!selectedValue) return;
        
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (cell && cell.value === selectedValue) {
                    cell.classList.add('same-number');
                }
            }
        }
    }

    // Highlight all cells that contain a specific number value (1..9), independent of selection
    highlightNumber(value) {
        // Clear existing same-number highlights
        document.querySelectorAll('.cell.same-number').forEach(c => c.classList.remove('same-number'));
        const v = parseInt(value);
        if (!(v >= 1 && v <= 9)) return;
        const target = String(v);
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (cell && cell.value === target) {
                    cell.classList.add('same-number');
                }
            }
        }
    }

    updateNumberPadAvailability() {
        // Compute remaining counts for digits 1..9
        const remaining = Array(10).fill(9);
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const v = this.board[r][c];
                if (v >= 1 && v <= 9) remaining[v] -= 1;
            }
        }
        document.querySelectorAll('.number-btn').forEach(btn => {
            const n = parseInt(btn.dataset.number);
            if (n >= 1 && n <= 9) {
                const done = remaining[n] <= 0;
                btn.classList.toggle('disabled', done);
                btn.disabled = done;
                if (done && this.lockedNumber === n) {
                    this.lockedNumber = null;
                    btn.classList.remove('active');
                }
            }
        });
    }

    checkGameComplete() {
        if (this.isGameComplete) return;
        if (this.isGameOver) return;
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0 || this.board[row][col] !== this.solution[row][col]) {
                    return;
                }
            }
        }
        
        this.isGameComplete = true;
        this.stopTimer();
        this.showGameCompleteModal();
    }

    showGameOver() {
        const overlay = document.getElementById('gameover-overlay');
        if (overlay) overlay.style.display = 'flex';
    }

    showGameCompleteModal() {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const timeSpent = this.getTimeSpent();
        
        modalTitle.textContent = 'Congratulations!';
        modalMessage.textContent = `You've solved the puzzle in ${timeSpent}!`;
        modal.style.display = 'block';
        // If today’s daily is active, record result
        this.recordDailyResult && this.recordDailyResult();
        this.recordWin();
    }

    startTimer() {
        // If resuming after pause, shift startTime forward by paused duration so elapsed excludes pause time
        if (this.isPaused && this._pauseStartedAt) {
            const pausedFor = Date.now() - this._pauseStartedAt;
            this._elapsedBeforePause += Math.max(0, Math.floor(pausedFor / 1000));
            this.isPaused = false;
            this._pauseStartedAt = null;
        }
        if (!this.startTime) this.startTime = Date.now();
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.updateTimer();
        }, 1000);
        // Update immediately on start
        this.updateTimer();
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateTimer() {
        const timeElement = document.getElementById('time');
        const timeSpent = this.getTimeSpent();
        timeElement.textContent = timeSpent;
    }

    getTimeSpent() {
        if (!this.startTime) return '00:00';
        const now = Date.now();
        let elapsed = Math.floor((now - this.startTime) / 1000);
        // Subtract accumulated paused time
        elapsed -= (this._elapsedBeforePause || 0);
        if (this.isPaused && this._pauseStartedAt) {
            // While paused, exclude current paused duration
            const pausedDelta = Math.floor((now - this._pauseStartedAt) / 1000);
            elapsed -= pausedDelta;
        }
        if (elapsed < 0) elapsed = 0;
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    newGame() {
        // Ensure we return to normal mode from Daily
        this.setDailyUiState && this.setDailyUiState(false);
        this._activeDailyKey = null;
        let difficulty = 'medium';
        try {
            const saved = localStorage.getItem('sudoku-last-difficulty');
            if (saved) difficulty = saved;
        } catch {}
        // Remember last chosen difficulty
        try { localStorage.setItem('sudoku-last-difficulty', difficulty); } catch {}
        // Update mode pill now that difficulty is known
        this.updateModeIndicator && this.updateModeIndicator({ type: 'normal', difficulty });
        this.isGameComplete = false;
        this.isGameOver = false;
        const overlay = document.getElementById('gameover-overlay');
        if (overlay) overlay.style.display = 'none';
        // Also ensure pause overlay is hidden
        const pause = document.getElementById('pause-overlay');
        if (pause) pause.style.display = 'none';
        // Clear locked number and highlight on numpad
        this.lockedNumber = null;
        document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('active'));
        this.stopTimer();
        // Reset timer state
        this.startTime = null;
        this.isPaused = false;
        this._pauseStartedAt = null;
        this._elapsedBeforePause = 0;
        // Reset undo/redo history on new game
        this.history = [];
        this.redoStack = [];
        this.generatePuzzle(difficulty);
        this.startTimer();
        this.updateDisplay();
        // Ensure candidates/notes reflect current settings on fresh board
        if (this.isAutoCandidatesEnabled && this.isAutoCandidatesEnabled()) {
            this.recomputeAllCandidates();
        } else {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    this.notes[r][c].clear();
                    this.updateNotesDisplay(r, c);
                }
            }
        }
        this.clearStatus();
        this.renderHealthBar();
        
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
            this.selectedCell = null;
        }
        
        document.querySelectorAll('.cell.highlighted').forEach(cell => {
            cell.classList.remove('highlighted');
        });

        this.resetMistakes();
        const label = document.getElementById('difficulty-label'); if (label) label.textContent = difficulty[0].toUpperCase() + difficulty.slice(1);
    }

    getDailyDifficulty() {
        // Derive today's difficulty from a varied weekly pattern
        const key = this.getUtcDateKey();
        return this.getDifficultyForDateKey(key);
    }

    openDailyModal() {
        const m = document.getElementById('daily-modal');
        const dd = document.getElementById('daily-date');
        const di = document.getElementById('daily-diff');
        const dc = document.getElementById('daily-modal-countdown');
        if (!m || !dd || !di || !dc) { const diff = this.getDailyDifficulty(); this.generateDaily(diff); return; }
        const key = this.getUtcDateKey();
        dd.textContent = `${key.slice(0,4)}-${key.slice(4,6)}-${key.slice(6)}`;
        const diff = this.getDailyDifficulty();
        di.textContent = diff[0].toUpperCase() + diff.slice(1);
        m.style.display = 'block';
        if (this._dailyModalTimer) clearInterval(this._dailyModalTimer);
        const update = () => {
            const t = this.getNextUtcMidnight();
            const secs = Math.max(0, Math.floor((t.getTime() - Date.now())/1000));
            const hh = Math.floor(secs / 3600).toString().padStart(2,'0');
            const mm = Math.floor((secs % 3600)/60).toString().padStart(2,'0');
            const ss = (secs % 60).toString().padStart(2,'0');
            dc.textContent = `${hh}:${mm}:${ss}`;
        };
        this._dailyModalTimer = setInterval(update, 1000);
        update();
    }

    async rerollDailyOnce(fromModal = false) {
        if (this.isGameInProgress && this.isGameInProgress()) {
            const proceed = await this.showConfirm('Reroll Daily? Current game will end and count as a loss.');
            if (!proceed) return false;
            this.recordLoss();
        }
        const key = this.getUtcDateKey();
        const rerollFlagKey = `sudoku-daily-reroll-${key}`;
        if (localStorage.getItem(rerollFlagKey)) {
            this.showStatus('Reroll already used today', 'error');
            return;
        }
        // Clear today’s cached daily so generation won’t return early
        try { localStorage.removeItem(`sudoku-daily-${key}`); } catch {}
        localStorage.setItem(rerollFlagKey, '1');

        // Use an alternate seed suffix for a different but deterministic reroll
        this._rerollSuffix = '-R';
        const diff = this.getDailyDifficulty();
        // Reset timer and undo/redo when rerolling
        this.startTime = null;
        this.isPaused = false;
        this._pauseStartedAt = null;
        this._elapsedBeforePause = 0;
        this.history = [];
        this.redoStack = [];
        this.generateDaily(diff);
        delete this._rerollSuffix;

        if (fromModal) {
            const m = document.getElementById('daily-modal');
            if (m) m.style.display = 'none';
            if (this._dailyModalTimer) clearInterval(this._dailyModalTimer);
        }
        this.showStatus('Daily rerolled', 'success');
        return true;
    }

    resetMistakes() {
        this.mistakesCount = 0;
        this.lastWrongValues = Array(9).fill().map(() => Array(9).fill(null));
        this.updateHealthBar(true);
    }

    // ---- Health bar (hearts) ----
    renderHealthBar() {
        const host = document.getElementById('health-bar');
        if (!host) return;
        host.className = 'health-bar-row';
        host.innerHTML = '';
        const unlimited = !this.mistakesEnabled || !Number.isFinite(this.mistakeLimit) || this.mistakeLimit >= 11;
        const total = unlimited ? 0 : (this.mistakesEnabled && Number.isFinite(this.mistakeLimit)) ? this.mistakeLimit : 0;
        const compact = window.matchMedia('(max-width: 420px)').matches;
        if (unlimited) {
            // Infinity display at normal heart size
            const wrap = document.createElement('div');
            wrap.className = 'health-compact';
            wrap.innerHTML = `<span class="health-heart"><div class="heart-full">${this.renderHeartSvg()}</div></span><span class="x">∞</span>`;
            host.appendChild(wrap);
            host.setAttribute('aria-label', 'Unlimited mistakes');
            return;
        } else if (compact) {
            const wrap = document.createElement('div');
            wrap.className = 'health-compact';
            wrap.innerHTML = `<span class="health-heart"><div class="heart-full">${this.renderHeartSvg()}</div></span><span class="x">×${Math.max(0, total - this.mistakesCount)}</span>`;
            host.appendChild(wrap);
            host.setAttribute('aria-label', `Mistakes remaining: ${Math.max(0, total - this.mistakesCount)} of ${total}`);
        } else {
            for (let i = 0; i < total; i++) {
                const heart = document.createElement('div');
                heart.className = 'health-heart appear';
                heart.setAttribute('aria-hidden','true');
                heart.innerHTML = `<div class="heart-full">${this.renderHeartSvg()}</div><div class="heart-half left">${this.renderHeartSvg()}</div><div class="heart-half right">${this.renderHeartSvg()}</div>`;
                host.appendChild(heart);
            }
            this.updateHealthBar(true);
        }
    }

    renderHeartSvg() {
        // full heart SVG path
        return `<svg class="heart-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12.1 8.64l-.1.1-.1-.1C10.14 6.88 7.4 6.86 5.64 8.6c-1.76 1.76-1.76 4.62 0 6.38L12 21.34l6.36-6.36c1.76-1.76 1.76-4.62 0-6.38-1.76-1.74-4.5-1.72-6.26.04z"/></svg>`;
    }
    updateHealthBar(reset = false) {
        const host = document.getElementById('health-bar');
        if (!host) return;
        const compactCount = host.querySelector('.health-compact .x');
        if (compactCount) {
            const unlimited = !this.mistakesEnabled || !Number.isFinite(this.mistakeLimit) || this.mistakeLimit >= 11;
            if (unlimited) { compactCount.textContent = '∞'; host.setAttribute('aria-label', 'Unlimited mistakes'); return; }
            const total = (this.mistakesEnabled && Number.isFinite(this.mistakeLimit)) ? this.mistakeLimit : 0;
            compactCount.textContent = `×${Math.max(0, total - this.mistakesCount)}`;
            host.setAttribute('aria-label', `Mistakes remaining: ${Math.max(0, total - this.mistakesCount)} of ${total}`);
            // low-health color states on compact
            host.classList.toggle('health-critical', (total - this.mistakesCount) <= 1 && total > 0);
            host.classList.toggle('health-low', (total - this.mistakesCount) === 2);
            return;
        }
        const hearts = Array.from(host.querySelectorAll('.health-heart'));
        const total = hearts.length;
        const lost = Math.min(this.mistakesCount, total);
        hearts.forEach((h, idx) => {
            if (reset) { h.classList.remove('lost'); h.style.opacity = '1'; h.style.transform = ''; }
            if (idx < lost && !h.classList.contains('lost')) {
                const isFinal = (idx === total - 1);
                if (isFinal) h.classList.add('final');
                h.classList.add('lost');
                h.addEventListener('animationend', () => { h.style.display = 'none'; }, { once: true });
            }
        });
        const remaining = Math.max(0, total - lost);
        host.setAttribute('aria-label', `Mistakes remaining: ${remaining} of ${total}`);
        // Low-health state color/pulse
        host.classList.toggle('health-critical', remaining <= 1 && total > 0);
        host.classList.toggle('health-low', remaining === 2);
    }

    solvePuzzle() {
        this.board = this.solution.map(row => [...row]);
        this.updateDisplay();
        this.checkGameComplete();
    }

    checkPuzzle() {
        let hasErrors = false;
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    cell.classList.remove('error');
                    
                    if (this.board[row][col] !== 0 && this.board[row][col] !== this.solution[row][col]) {
                        cell.classList.add('error');
                        hasErrors = true;
                    }
                }
            }
        }
        
        if (hasErrors) {
            this.showStatus('Some numbers are incorrect. Check the red cells.', 'error');
        } else {
            this.showStatus('All numbers are correct!', 'success');
        }
    }

    clearBoard() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.initialBoard[row][col] === 0) {
                    this.board[row][col] = 0;
                    this.updateCellDisplay(row, col);
                }
            }
        }
        this.clearStatus();
    }

    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('status-message');
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        
        setTimeout(() => {
            this.clearStatus();
        }, 3000);
    }

    clearStatus() {
        const statusElement = document.getElementById('status-message');
        statusElement.textContent = '';
        statusElement.className = 'status-message';
    }

    setupEventListeners() {
        // Game control buttons
        document.getElementById('new-game-btn').addEventListener('click', async () => {
            if (this.isGameInProgress && this.isGameInProgress()) {
                const proceed = await this.showConfirm('Start a new game? Current game will end and count as a loss.');
                if (!proceed) return;
                this.recordLoss();
            }
            this.newGame();
        });
        const solveBtn = document.getElementById('solve-btn'); if (solveBtn) solveBtn.addEventListener('click', () => this.solvePuzzle());
        const checkBtn = document.getElementById('check-btn'); if (checkBtn) checkBtn.addEventListener('click', () => this.checkPuzzle());
        const clearBtn = document.getElementById('clear-btn'); if (clearBtn) clearBtn.addEventListener('click', () => this.clearBoard());
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) undoBtn.addEventListener('click', () => this.undo());
        const redoBtn = document.getElementById('redo-btn');
        if (redoBtn) redoBtn.addEventListener('click', () => this.redo());
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) hintBtn.addEventListener('click', () => this.giveHint());
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
        const notesToggle = document.getElementById('notes-toggle');
        if (notesToggle) notesToggle.addEventListener('click', () => {
            this.isNotesMode = !this.isNotesMode;
            notesToggle.classList.toggle('btn-primary', this.isNotesMode);
            notesToggle.classList.toggle('btn-secondary', !this.isNotesMode);
            this.syncNotesBadgeState();
        });
        // Temporary Notes Hold: press-and-hold Notes button enables notes only while held (touch-friendly)
        if (notesToggle) {
            const startHold = () => {
                if (this._notesHoldActive) return;
                this._notesHoldActive = true;
                this._notesHoldWas = this.isNotesMode;
                this.isNotesMode = true;
                notesToggle.classList.add('btn-primary');
                notesToggle.classList.remove('btn-secondary');
                this.syncNotesBadgeState();
            };
            const endHold = () => {
                if (!this._notesHoldActive) return;
                this._notesHoldActive = false;
                if (this._notesHoldWas !== null) this.isNotesMode = !!this._notesHoldWas;
                notesToggle.classList.toggle('btn-primary', this.isNotesMode);
                notesToggle.classList.toggle('btn-secondary', !this.isNotesMode);
                this._notesHoldWas = null;
                this.syncNotesBadgeState();
            };
            // Pointer-based hold (works for mouse and touch)
            notesToggle.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'touch' || e.buttons === 1) startHold();
            });
            window.addEventListener('pointerup', endHold);
            window.addEventListener('pointercancel', endHold);
            // Keyboard hold
            notesToggle.addEventListener('keydown', (e) => { if (e.code === 'Space' || e.key === ' ') startHold(); });
            notesToggle.addEventListener('keyup', (e) => { if (e.code === 'Space' || e.key === ' ') endHold(); });
        }

        // mistakes toggle removed; slider controls behavior

        const menuBtn = document.getElementById('menu-btn');
        const popover = document.getElementById('menu-popover');
        if (menuBtn && popover) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const open = popover.style.display === 'block';
                // Close newgame popover if open
                const ng = document.getElementById('newgame-popover');
                if (ng) ng.style.display = 'none';
                popover.style.display = open ? 'none' : 'block';
                menuBtn.setAttribute('aria-expanded', (!open).toString());
            });
            document.addEventListener('click', (e) => {
                if (!popover.contains(e.target) && e.target !== menuBtn) {
                    popover.style.display = 'none';
                    menuBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Popover actions
        const map = [
            ['menu-check', () => this.checkPuzzle()],
            ['menu-solve', () => this.solvePuzzle()],
            ['menu-clear', () => this.clearBoard()],
            ['menu-stats', () => this.showStats && this.showStats()],
            ['menu-settings', () => { const m = document.getElementById('settings-modal'); if (m) m.style.display = 'block'; }],
            ['menu-help', () => { const m = document.getElementById('help-modal'); if (m) m.style.display = 'block'; }],
        ];
        const hideMenu = () => {
            const pop = document.getElementById('menu-popover');
            const btn = document.getElementById('menu-btn');
            if (pop) pop.style.display = 'none';
            if (btn) btn.setAttribute('aria-expanded', 'false');
        };
        this._hideMenu = hideMenu;
        map.forEach(([id, fn]) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', () => { hideMenu(); fn(); });
        });

        const settingsClose = document.getElementById('settings-close');
        if (settingsClose) settingsClose.addEventListener('click', () => { document.getElementById('settings-modal').style.display = 'none'; });
        const settingsReset = document.getElementById('settings-reset');
            if (settingsReset) settingsReset.addEventListener('click', async () => {
            if (!(await this.showConfirm('Reset all settings to defaults?'))) return;
            if (!(await this.showConfirm('Are you sure?'))) return;
            try { localStorage.removeItem('sudoku-settings'); } catch {}
            // Defaults
            const ac = document.getElementById('auto-candidates-toggle'); if (ac) ac.checked = false;
            const aa = document.getElementById('auto-advance-toggle'); if (aa) aa.checked = false;
            const ml = document.getElementById('mistakes-limit'); const mlv = document.getElementById('mistakes-limit-value');
            if (ml && mlv) { ml.value = '3'; mlv.textContent = '3'; this.mistakesEnabled = true; this.mistakeLimit = 3; this.resetMistakes(); this.renderHealthBar(); }
            const themeToggle = document.getElementById('theme-dark-toggle'); if (themeToggle) themeToggle.checked = false;
            const weekSeg = document.getElementById('weekstart-segment'); if (weekSeg) { weekSeg.querySelectorAll('.segment').forEach(seg => seg.setAttribute('aria-checked', seg.dataset.week === 'sunday' ? 'true' : 'false')); }
            document.querySelectorAll('#accent-swatches .swatch').forEach(b => b.setAttribute('aria-checked', b.dataset.accent === 'indigo' ? 'true' : 'false'));
            // Apply UI
            this.persistSettings && this.persistSettings();
            this.resumeSettings && this.resumeSettings();
            this._showSavedToast && this._showSavedToast();
        });
        const helpClose = document.getElementById('help-close');
        if (helpClose) helpClose.addEventListener('click', () => { document.getElementById('help-modal').style.display = 'none'; });
        const dailyClose = document.getElementById('daily-close');
        if (dailyClose) dailyClose.addEventListener('click', () => { const m = document.getElementById('daily-modal'); if (m) m.style.display = 'none'; if (this._dailyModalTimer) clearInterval(this._dailyModalTimer); });
        const dailyStart = document.getElementById('daily-start');
        if (dailyStart) dailyStart.addEventListener('click', async () => {
            if (this.isGameInProgress && this.isGameInProgress()) {
                const proceed = await this.showConfirm('Start Daily? Current game will end and count as a loss.');
                if (!proceed) return;
                this.recordLoss();
            }
            const diff = this.getDailyDifficulty();
            // Reset timer and undo/redo when starting daily
            this.startTime = null;
            this.isPaused = false;
            this._pauseStartedAt = null;
            this._elapsedBeforePause = 0;
            this.history = [];
            this.redoStack = [];
            this.generateDaily(diff);
            const m = document.getElementById('daily-modal'); if (m) m.style.display = 'none'; if (this._dailyModalTimer) clearInterval(this._dailyModalTimer);
        });
        const dailyReroll = document.getElementById('daily-reroll');
        if (dailyReroll) dailyReroll.addEventListener('click', () => this.rerollDailyOnce(true));
        const dailyIcon = document.getElementById('daily-icon-btn');
        if (dailyIcon) dailyIcon.addEventListener('click', () => { hideMenu(); this.openCalendar(); });
        // Difficulty picker persistence
        const diffEl = document.getElementById('difficulty');
        if (diffEl) {
            diffEl.addEventListener('change', () => {
                try { localStorage.setItem('sudoku-last-difficulty', diffEl.value); } catch {}
            });
        }
        // Auto-candidates toggle: recompute immediately
        const autoToggle = document.getElementById('auto-candidates-toggle');
        if (autoToggle) {
            autoToggle.addEventListener('change', () => {
                if (autoToggle.checked) {
                    this.recomputeAllCandidates();
                } else {
                    for (let r = 0; r < 9; r++) {
                        for (let c = 0; c < 9; c++) {
                            this.notes[r][c].clear();
                            this.updateNotesDisplay(r, c);
                        }
                    }
                }
                this.persistSettings && this.persistSettings();
            });
        }
        // Settings: mistakes limit slider
        const mistakesSlider = document.getElementById('mistakes-limit');
        const mistakesValue = document.getElementById('mistakes-limit-value');
        const mistakesPill = document.getElementById('mistakes-limit-pill');
        const mistakesPreview = document.getElementById('mistakes-preview');
        if (mistakesSlider) {
            const sync = () => {
                const v = parseInt(mistakesSlider.value);
                if (v >= 11) { // unlimited/off
                    if (mistakesValue) mistakesValue.textContent = 'Unlimited';
                    if (mistakesPill) mistakesPill.textContent = '∞';
                    if (mistakesPreview) mistakesPreview.textContent = 'Hearts: ∞';
                    this.mistakesEnabled = false;
                    this.mistakeLimit = Infinity;
                } else {
                    if (mistakesValue) mistakesValue.textContent = String(v);
                    if (mistakesPill) mistakesPill.textContent = String(v);
                    if (mistakesPreview) mistakesPreview.textContent = `Hearts: ×${v}`;
                    this.mistakesEnabled = true;
                    this.mistakeLimit = v;
                }
            };
            mistakesSlider.addEventListener('input', () => { sync(); this._showSavedToast && this._showSavedToast(); });
            mistakesSlider.addEventListener('change', () => { this.resetMistakes(); this.persistSettings && this.persistSettings(); });
            // initialize display
            sync();
        }
        // Settings: theme + accent swatches + weekstart segmented + auto-advance
        const themeToggle = document.getElementById('theme-dark-toggle');
        const autoAdvanceToggle = document.getElementById('auto-advance-toggle');
        const applyTheme = () => { document.documentElement.dataset.theme = themeToggle && themeToggle.checked ? 'dark' : 'light'; };
        const applyAccent = (v) => {
            const color = v || (document.querySelector('#accent-swatches .swatch[aria-checked="true"]')?.dataset.accent) || 'indigo';
            const map = { indigo: ['#6366f1', '#5558ee'], teal: ['#14b8a6', '#0ea5a3'], rose: ['#f43f5e', '#e11d48'] };
            const [a1, a2] = map[color] || map.indigo;
            document.documentElement.style.setProperty('--accent', a1);
            document.documentElement.style.setProperty('--accent-600', a2);
        };
        if (themeToggle) themeToggle.addEventListener('change', () => { applyTheme(); this.persistSettings && this.persistSettings(); });
        if (autoAdvanceToggle) autoAdvanceToggle.addEventListener('change', () => { this.persistSettings && this.persistSettings(); });
        // Accent swatches
        const swatches = document.querySelectorAll('#accent-swatches .swatch');
        swatches.forEach(btn => {
            btn.addEventListener('click', () => {
                swatches.forEach(b => b.setAttribute('aria-checked','false'));
                btn.setAttribute('aria-checked','true');
                applyAccent(btn.dataset.accent);
                this.persistSettings && this.persistSettings();
            });
        });
        // Weekstart slider toggle (false=sunday, true=monday)
        const weekToggle = document.getElementById('weekstart-toggle');
        if (weekToggle) {
            const setChecked = (val) => { weekToggle.setAttribute('aria-checked', val ? 'true' : 'false'); };
            weekToggle.addEventListener('click', () => {
                const cur = weekToggle.getAttribute('aria-checked') === 'true';
                setChecked(!cur);
                this.persistSettings && this.persistSettings();
                this.refreshCalendarHeaders && this.refreshCalendarHeaders();
                this.renderCalendar && this.renderCalendar();
                this._showSavedToast && this._showSavedToast();
            });
        }
        // Initialize from persisted settings if present
        applyTheme(); applyAccent();
        // Settings saved toast helper
        const savedToast = document.getElementById('settings-saved');
        this._showSavedToast = () => {
            if (!savedToast) return;
            savedToast.classList.add('show');
            clearTimeout(this._savedToastTimer);
            this._savedToastTimer = setTimeout(() => savedToast.classList.remove('show'), 900);
        };
        // Hook toast on relevant changes
        const savedHooks = [
            document.getElementById('auto-candidates-toggle'),
            document.getElementById('auto-advance-toggle'),
            document.getElementById('theme-dark-toggle'),
            document.getElementById('mistakes-limit')
        ];
        savedHooks.forEach(el => { if (el) el.addEventListener('change', () => this._showSavedToast()); });
        swatches.forEach(b => b.addEventListener('click', () => this._showSavedToast()));
        // Segmented control removed; avoid referencing undefined variable that would block listeners
        const statsOpen = document.getElementById('stats-btn');
        if (statsOpen && this.showStats) statsOpen.addEventListener('click', () => this.showStats());
        const statsClose = document.getElementById('stats-close');
        if (statsClose) statsClose.addEventListener('click', () => { const m = document.getElementById('stats-modal'); if (m) m.style.display = 'none'; });
        
        // Number pad (include erase button which has data-number="0")
        document.querySelectorAll('.number-btn, #pad-erase-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const number = parseInt(btn.dataset.number);
                // Lock number mode depending on toggle
                const lockToggle = document.getElementById('pad-lock-toggle');
                const lockEnabled = !lockToggle || lockToggle.getAttribute('aria-pressed') === 'true';

                if (lockEnabled) {
                    // In lock mode, switching numbers should NOT enter into the current cell
                    const isAlreadyActive = btn.classList.contains('active');
                    document.querySelectorAll('.number-btn, #pad-erase-btn').forEach(b => b.classList.remove('active'));
                    if (isAlreadyActive) {
                        this.lockedNumber = null;
                        // Clear number highlights when unlocking
                        this.highlightSameNumbers();
                    } else {
                        this.lockedNumber = number > 0 ? number : 0;
                        btn.classList.add('active');
                        // Highlight same number across the grid for the locked number
                        if (number > 0) {
                            this.highlightNumber(number);
                        } else {
                            this.highlightSameNumbers();
                        }
                    }
                } else {
                    // Single-shot behavior (no sticky lock): place immediately if a cell is selected
                    if (this.selectedCell && !this.selectedCell.readOnly) {
                        const r = parseInt(this.selectedCell.dataset.row);
                        const c = parseInt(this.selectedCell.dataset.col);
                        const v = number === 0 ? 0 : number;
                        if (this.isNotesMode && v > 0) {
                            this.toggleNote(r, c, v);
                        } else {
                            this.setCellValue(r, c, v, 'numpad');
                            this.checkGameComplete();
                        }
                    }
                    this.lockedNumber = null;
                    document.querySelectorAll('.number-btn, #pad-erase-btn').forEach(b => b.classList.remove('active'));
                }
                this.syncNotesBadgeState();
            });
        });
        // Lock toggle behavior
        const lockToggle = document.getElementById('pad-lock-toggle');
        if (lockToggle) {
            lockToggle.addEventListener('click', () => {
                const wasPressed = lockToggle.getAttribute('aria-pressed') === 'true';
                const nowPressed = !wasPressed;
                lockToggle.setAttribute('aria-pressed', nowPressed.toString());
                // Toggle icon between locked and unlocked
                lockToggle.textContent = nowPressed ? '🔒' : '🔓';
                if (!nowPressed) {
                    // when turning off, clear any active lock highlight
                    this.lockedNumber = null;
                    document.querySelectorAll('.number-btn, #pad-erase-btn').forEach(b => b.classList.remove('active'));
                }
            });
        }
        
        // Modal buttons
        document.getElementById('modal-new-game').addEventListener('click', () => {
            document.getElementById('modal').style.display = 'none';
            this.newGame();
        });
        
        document.getElementById('modal-close').addEventListener('click', () => {
            document.getElementById('modal').style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('modal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Keyboard shortcuts (global)
        document.addEventListener('keydown', (e) => {
            // Ignore when a modal is open
            const anyModalOpen = Array.from(document.querySelectorAll('.modal')).some(m => m.style.display === 'block');
            if (anyModalOpen) return;
            // Undo/Redo with Ctrl/Meta
            const key = e.key.toLowerCase();
            if ((e.ctrlKey || e.metaKey) && key === 'z' && !e.shiftKey) { e.preventDefault(); this.undo(); return; }
            if ((e.ctrlKey || e.metaKey) && ((key === 'y') || (key === 'z' && e.shiftKey))) { e.preventDefault(); this.redo(); return; }
            // Global Escape clears locked number
            if (e.key === 'Escape') {
                this.lockedNumber = null;
                document.querySelectorAll('.number-btn, #pad-erase-btn').forEach(b => b.classList.remove('active'));
                return;
            }
            // Do not handle numeric input globally; rely on focused cell handlers
        });

        // Pointer-based drag painting across cells when a number is locked
        const board = document.getElementById('board');
        if (board) {
            // Improve touch responsiveness during drags
            try { board.style.touchAction = 'none'; } catch {}
            board.addEventListener('pointerdown', (e) => this.onBoardPointerDown(e));
            board.addEventListener('pointermove', (e) => this.onBoardPointerMove(e));
            window.addEventListener('pointerup', (e) => this.onBoardPointerUp(e));
            window.addEventListener('pointercancel', (e) => this.onBoardPointerUp(e));
        }

        // New game dropdown and label handling
        const newDropdownBtn = document.getElementById('newgame-dropdown');
        const newPopover = document.getElementById('newgame-popover');
        if (newDropdownBtn && newPopover) {
            // Keep original parent to restore later when closing
            const originalParent = newPopover.parentElement;
            const toggleNewPopover = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const open = !(newPopover.hidden === true || newPopover.style.display === 'none');
                // Close hamburger menu if open
                const mp = document.getElementById('menu-popover');
                if (mp) mp.style.display = 'none';
                if (open) {
                    newPopover.hidden = true; newPopover.style.display = 'none';
                    // restore to original parent to keep DOM clean
                    if (originalParent && newPopover.parentElement !== originalParent) originalParent.appendChild(newPopover);
                } else {
                    // Float the popover to body to avoid clipping/overlap issues
                    const rect = newDropdownBtn.getBoundingClientRect();
                    document.body.appendChild(newPopover);
                    newPopover.style.position = 'fixed';
                    newPopover.style.visibility = 'hidden';
                    newPopover.hidden = false; newPopover.style.display = 'block';
                    // measure to align right edge under the caret
                    const width = newPopover.offsetWidth;
                    const left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.right - width));
                    const top = rect.bottom + 6;
                    newPopover.style.left = `${left}px`;
                    newPopover.style.top = `${top}px`;
                    newPopover.style.right = 'auto';
                    newPopover.style.visibility = 'visible';
                    newPopover.style.zIndex = '1000';
                    // Focus first item
                    const first = newPopover.querySelector('button, [data-diff]');
                    first && first.focus && first.focus();
                }
            };
            newDropdownBtn.addEventListener('click', toggleNewPopover);
            newDropdownBtn.addEventListener('pointerdown', (e)=>{ /* ensure pointer events trigger */ });
            // Also open when clicking New Game label if desired
            // document.getElementById('new-game-btn')?.addEventListener('contextmenu', toggleNewPopover);
            newPopover.addEventListener('click', (e) => { e.stopPropagation(); });
            newPopover.querySelectorAll('[data-diff]').forEach(item => {
                item.addEventListener('click', async () => {
                    if (this.isGameInProgress && this.isGameInProgress()) {
                        const proceed = await this.showConfirm('Start a new game? Current game will end and count as a loss.');
                        if (!proceed) { return; }
                        this.recordLoss();
                    }
                    const diff = item.getAttribute('data-diff');
                    try { localStorage.setItem('sudoku-last-difficulty', diff); } catch {}
                    this.updateModeIndicator({ type: 'normal', difficulty: diff });
                    // Update the icons inside the popover to match new colorful style
                    // (no-op here; icons are styled via CSS)
                    newPopover.hidden = true; newPopover.style.display = 'none';
                    // Reset any Game Over or Pause state when starting via difficulty picker
                    this.isGameComplete = false;
                    this.isGameOver = false;
                    const go = document.getElementById('gameover-overlay');
                    if (go) go.style.display = 'none';
                    const po = document.getElementById('pause-overlay');
                    if (po) po.style.display = 'none';
                    this.lockedNumber = null;
                    document.querySelectorAll('.number-btn, #pad-erase-btn').forEach(b => b.classList.remove('active'));
                    if (this.selectedCell) { this.selectedCell.classList.remove('selected'); this.selectedCell = null; }
                    document.querySelectorAll('.cell.highlighted').forEach(cell => cell.classList.remove('highlighted'));
                    this.setDailyUiState && this.setDailyUiState(false);
                    this.stopTimer();
                    // Reset timer state for new difficulty game
                    this.startTime = null;
                    this.isPaused = false;
                    this._pauseStartedAt = null;
                    this._elapsedBeforePause = 0;
                    // Reset undo/redo on difficulty start
                    this.history = [];
                    this.redoStack = [];
                    this.generatePuzzle(diff);
                    this.startTimer();
                    this.updateDisplay();
                    if (this.isAutoCandidatesEnabled && this.isAutoCandidatesEnabled()) {
                        this.recomputeAllCandidates();
                    } else {
                        for (let r = 0; r < 9; r++) {
                            for (let c = 0; c < 9; c++) {
                                this.notes[r][c].clear();
                                this.updateNotesDisplay(r, c);
                            }
                        }
                    }
                    this.clearStatus && this.clearStatus();
                });
            });
            document.addEventListener('click', (e) => {
                const withinButton = (newDropdownBtn.contains(e.target));
                const withinPopover = newPopover.contains(e.target);
                if (!withinButton && !withinPopover) {
                    newPopover.hidden = true; newPopover.style.display = 'none';
                    // restore to original parent if moved to body
                    if (originalParent && newPopover.parentElement !== originalParent) originalParent.appendChild(newPopover);
                }
            });
        }

        // Clicking timer toggles pause
        const timerBtn = document.getElementById('timer-toggle');
        if (timerBtn) timerBtn.addEventListener('click', () => this.togglePause());
    }

    // Accessible confirm modal replacing native confirm()
    showConfirm(message, { title = 'Confirm', okText = 'OK', cancelText = 'Cancel' } = {}) {
        return new Promise(resolve => {
            const modal = document.getElementById('confirm-modal');
            const content = modal?.querySelector('.modal-content');
            const titleEl = document.getElementById('confirm-title');
            const msgEl = document.getElementById('confirm-message');
            const okBtn = document.getElementById('confirm-ok');
            const cancelBtn = document.getElementById('confirm-cancel');
            if (!modal || !content || !titleEl || !msgEl || !okBtn || !cancelBtn) {
                // Fallback gracefully
                resolve(window.confirm(message));
                return;
            }
            titleEl.textContent = title;
            msgEl.textContent = message;
            okBtn.textContent = okText;
            cancelBtn.textContent = cancelText;
            modal.style.display = 'block';
            const previouslyFocused = document.activeElement;
            const cleanup = () => {
                modal.style.display = 'none';
                okBtn.removeEventListener('click', onOk);
                cancelBtn.removeEventListener('click', onCancel);
                modal.removeEventListener('click', onBackdrop);
                document.removeEventListener('keydown', onKey);
                previouslyFocused && previouslyFocused.focus && previouslyFocused.focus();
            };
            const onOk = () => { cleanup(); resolve(true); };
            const onCancel = () => { cleanup(); resolve(false); };
            const onBackdrop = (e) => { if (e.target === modal) { onCancel(); } };
            const onKey = (e) => {
                if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
                if (e.key === 'Enter') { e.preventDefault(); onOk(); }
                if (e.key === 'Tab') {
                    // Simple focus trap within modal buttons
                    const focusables = [cancelBtn, okBtn];
                    const idx = focusables.indexOf(document.activeElement);
                    if (e.shiftKey) {
                        if (idx <= 0) { e.preventDefault(); focusables[focusables.length - 1].focus(); }
                    } else {
                        if (idx === -1 || idx >= focusables.length - 1) { e.preventDefault(); focusables[0].focus(); }
                    }
                }
            };
            okBtn.addEventListener('click', onOk);
            cancelBtn.addEventListener('click', onCancel);
            modal.addEventListener('click', onBackdrop);
            document.addEventListener('keydown', onKey);
            // Move focus into modal
            setTimeout(() => { cancelBtn.focus(); }, 0);
        });
    }

    onBoardPointerDown(e) {
        const target = e.target.closest && e.target.closest('.cell');
        if (!target) return;
        // Track long-press gesture start for quick-note affordance
        this._pressStartX = e.clientX;
        this._pressStartY = e.clientY;
        this._pressMoved = false;
        this._longPressActive = false;
        if (this.touchMode) {
            clearTimeout(this._pressTimer);
            this._pressTimer = setTimeout(() => {
                // If pointer hasn't moved much, treat as long-press
                if (!this._pressMoved) {
                    this._longPressActive = true;
                    // If a number is locked and > 0, toggle a note for that number here
                    const locked = this.lockedNumber;
                    const r = parseInt(target.dataset.row);
                    const c = parseInt(target.dataset.col);
                    if (locked && locked > 0 && !target.readOnly) {
                        // Temporarily ensure notes mode behavior without altering global toggle
                        this.toggleNote(r, c, locked);
                    }
                }
            }, 450); // ~450ms long-press
        }
        const row = parseInt(target.dataset.row);
        const col = parseInt(target.dataset.col);
        this.selectCell(target, row, col);
        // Double-tap to erase (works for touch and mouse quick double click)
        const cellKey = `${row},${col}`;
        const now = Date.now();
        if (now - this._lastTapTime < 300 && this._lastTapCellKey === cellKey && !target.readOnly) {
            this.setCellValue(row, col, 0, 'tap');
            this.checkGameComplete();
        }
        this._lastTapTime = now;
        this._lastTapCellKey = cellKey;
        if (this.lockedNumber !== null && !target.readOnly) {
            e.preventDefault();
            this._isPainting = true;
            this._paintingPointerId = e.pointerId;
            const v = this.lockedNumber;
            if (this.isNotesMode && v > 0) {
                this.toggleNote(row, col, v);
            } else {
                this.setCellValue(row, col, v, 'paint');
                this.checkGameComplete();
            }
        }
    }

    onBoardPointerMove(e) {
        if (!this._isPainting || this._paintingPointerId !== e.pointerId) return;
        // Mark as moved for long-press cancellation
        const dx = Math.abs(e.clientX - this._pressStartX);
        const dy = Math.abs(e.clientY - this._pressStartY);
        if (dx > 6 || dy > 6) this._pressMoved = true;

        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el) return;
        const cell = el.closest && el.closest('.cell');
        if (!cell) return;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        if (cell.readOnly) return;
        const v = this.lockedNumber;
        if (v === null) return;
        if (this.isNotesMode && v > 0) {
            this.toggleNote(row, col, v);
        } else {
            this.setCellValue(row, col, v, 'paint');
            this.checkGameComplete();
        }
    }

    onBoardPointerUp(e) {
        if (this._isPainting && this._paintingPointerId === e.pointerId) {
            this._isPainting = false;
            this._paintingPointerId = null;
        }
        // Cancel any pending long-press timer
        clearTimeout(this._pressTimer);
        this._pressTimer = null;
        this._pressMoved = false;
        this._longPressActive = false;
    }

    // ----- Calendar UI -----
    openCalendar() {
        const modal = document.getElementById('calendar-modal');
        if (!modal) return this.openDailyModal();
        // Default ref month is current in local time for UX; comparisons use UTC keys
        this._calendarRefMonth = this._calendarRefMonth || new Date();
        this.refreshCalendarHeaders();
        this.renderCalendar();
        modal.style.display = 'block';
        const closeBtn = document.getElementById('calendar-close');
        const prevBtn = document.getElementById('calendar-prev');
        const nextBtn = document.getElementById('calendar-next');
        if (closeBtn && !closeBtn._bound) { closeBtn._bound = true; closeBtn.addEventListener('click', () => { modal.style.display = 'none'; }); }
        if (prevBtn && !prevBtn._bound) { prevBtn._bound = true; prevBtn.addEventListener('click', () => { this.shiftCalendar(-1); }); }
        if (nextBtn && !nextBtn._bound) { nextBtn._bound = true; nextBtn.addEventListener('click', () => { this.shiftCalendar(1); }); }
    }

    shiftCalendar(deltaMonths) {
        const d = this._calendarRefMonth || new Date();
        const year = d.getFullYear();
        const month = d.getMonth();
        const newDate = new Date(year, month + deltaMonths, 1);
        this._calendarRefMonth = newDate;
        this.renderCalendar();
    }

    renderCalendar() {
        const grid = document.getElementById('calendar-grid');
        const label = document.getElementById('calendar-month-label');
        if (!grid || !label) return;
        const ref = new Date(this._calendarRefMonth.getFullYear(), this._calendarRefMonth.getMonth(), 1);
        const monthName = ref.toLocaleString(undefined, { month: 'long', year: 'numeric' });
        label.textContent = monthName;
        grid.innerHTML = '';

        // Determine first weekday offset and number of days
        const baseFirstDow = new Date(ref.getFullYear(), ref.getMonth(), 1).getDay(); // 0..6 local, Sun=0
        const weekstart = ((document.getElementById('weekstart-toggle')?.getAttribute('aria-checked') === 'true') ? 'monday' : 'sunday') || (JSON.parse(localStorage.getItem('sudoku-settings')||'{}').weekstart) || 'sunday';
        const startOffset = weekstart === 'monday' ? ((baseFirstDow + 6) % 7) : baseFirstDow;
        const daysInMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();

        const results = JSON.parse(localStorage.getItem('sudoku-daily-results') || '{}');
        const nowUtcMidnight = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
        const todayLocal = new Date();
        const todayLocalYear = todayLocal.getFullYear();
        const todayLocalMonth = todayLocal.getMonth();
        const todayLocalDate = todayLocal.getDate();

        // Leading blank spacers to align weekday columns
        for (let i = 0; i < startOffset; i++) {
            const spacer = document.createElement('div');
            spacer.className = 'calendar-cell empty';
            spacer.setAttribute('aria-hidden', 'true');
            grid.appendChild(spacer);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(ref.getFullYear(), ref.getMonth(), d);
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';

            const key = this.getUtcDateKey(new Date(Date.UTC(date.getUTCFullYear?.() ?? date.getFullYear(), (date.getUTCMonth?.() ?? date.getMonth()), date.getUTCDate?.() ?? date.getDate())));

            const header = document.createElement('div');
            header.className = 'date-num';
            header.textContent = String(d);

            // Difficulty chip
            const diff = this.getDifficultyForDateKey(key);
            const chip = document.createElement('span');
            chip.className = `diff-chip diff-${diff}`;
            chip.title = diff[0].toUpperCase() + diff.slice(1);
            chip.innerHTML = this.getDifficultyIcon(diff);

            // Flags
            const thisUtcMidnight = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const isFuture = thisUtcMidnight.getTime() > nowUtcMidnight.getTime();
            if (isFuture) cell.classList.add('future');
            if (results[key]?.completed) {
                cell.classList.add('completed');
                const check = document.createElement('span');
                check.className = 'check-badge';
                check.textContent = '✓';
                cell.appendChild(check);
            }
            if (date.getFullYear() === todayLocalYear && date.getMonth() === todayLocalMonth && date.getDate() === todayLocalDate) {
                cell.classList.add('today');
            }

            if (!isFuture) {
                cell.addEventListener('click', () => {
                    const dff = this.getDifficultyForDateKey(key);
                    this.loadDailyByKey(key, dff);
                    const modal = document.getElementById('calendar-modal');
                    if (modal) modal.style.display = 'none';
                });
            }

            cell.appendChild(header);
            cell.appendChild(chip);
            grid.appendChild(cell);
        }

        // Trailing blank spacers to complete final week row
        const used = startOffset + daysInMonth;
        const trailing = (7 - (used % 7)) % 7;
        for (let i = 0; i < trailing; i++) {
            const spacer = document.createElement('div');
            spacer.className = 'calendar-cell empty';
            spacer.setAttribute('aria-hidden', 'true');
            grid.appendChild(spacer);
        }
    }

    refreshCalendarHeaders() {
        const wrap = document.getElementById('calendar-weekdays');
        if (!wrap) return;
        const weekstart = ((document.getElementById('weekstart-toggle')?.getAttribute('aria-checked') === 'true') ? 'monday' : 'sunday') || (JSON.parse(localStorage.getItem('sudoku-settings')||'{}').weekstart) || 'sunday';
        const days = weekstart === 'monday' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        wrap.innerHTML = days.map(d => `<div>${d}</div>`).join('');
    }

    getDifficultyIcon(diff) {
        // Inline SVG for crisp, scalable icons; color inherited via currentColor
        switch (diff) {
            case 'easy':
                return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="6" fill="currentColor"/></svg>';
            case 'medium':
                return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><polygon points="8,3 14,13 2,13" fill="currentColor"/></svg>';
            case 'hard':
                return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><rect x="3" y="3" width="10" height="10" fill="currentColor"/></svg>';
            case 'expert':
                return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><polygon points="8,2 13,5 13,11 8,14 3,11 3,5" fill="currentColor"/></svg>';
            case 'master':
                // Octagon to increase complexity over hexagon
                return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><polygon points="6,1 10,1 15,6 15,10 10,15 6,15 1,10 1,6" fill="currentColor"/></svg>';
            case 'extreme':
                // 5-point star for highest difficulty
                return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><polygon points="8,2 9.76,6.3 14,6.5 10.5,9.2 11.9,13.5 8,11.2 4.1,13.5 5.5,9.2 2,6.5 6.24,6.3" fill="currentColor"/></svg>';
            default:
                return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="6" fill="currentColor"/></svg>';
        }
    }

    // ----- Daily results tracking -----
    recordDailyResult() {
        // Determine if current board corresponds to an active daily key
        const activeKey = this._activeDailyKey || this.getUtcDateKey();
        const cacheKey = `sudoku-daily-${activeKey}`;
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return; // Not in a daily context
        const diff = JSON.parse(cached)?.difficulty || this.getDifficultyForDateKey(activeKey);
        const elapsed = this.getElapsedSeconds();
        const results = JSON.parse(localStorage.getItem('sudoku-daily-results') || '{}');
        results[activeKey] = { completed: true, elapsed, difficulty: diff, mistakes: this.mistakesCount };
        try { localStorage.setItem('sudoku-daily-results', JSON.stringify(results)); } catch {}
        // Update header notification
        this.updateDailyIconBadge && this.updateDailyIconBadge();

        // Update streak if completing today’s daily
        const todayKey = this.getUtcDateKey();
        if (activeKey === todayKey) {
            try {
                const lastKey = localStorage.getItem('sudoku-daily-last');
                let streak = parseInt(localStorage.getItem('sudoku-daily-streak') || '0');
                if (lastKey) {
                    const lastDate = this.parseUtcKeyToDate(lastKey);
                    const todayDate = this.parseUtcKeyToDate(todayKey);
                    const diffDays = Math.round((todayDate - lastDate) / (24*3600*1000));
                    if (diffDays === 1) streak += 1;
                    else if (diffDays === 0) {/* do nothing */}
                    else streak = 1; // reset
                } else {
                    streak = 1;
                }
                localStorage.setItem('sudoku-daily-last', todayKey);
                localStorage.setItem('sudoku-daily-streak', String(streak));
            } catch {}
        }
    }

    // ----- Optional helpers wired by UI buttons -----
    giveHint() {
        if (this.isGameComplete || this.isGameOver) return;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.board[r][c] === 0) {
                    this.setCellValue(r, c, this.solution[r][c], 'hint');
                    this.showStatus('Hint used', 'info');
                    return;
                }
            }
        }
        this.showStatus('No empty cells to hint', 'info');
    }

    togglePause() {
        const overlay = document.getElementById('pause-overlay');
        if (!overlay) return;
        const show = overlay.style.display === 'none' || overlay.style.display === '';
        overlay.style.display = show ? 'flex' : 'none';
        if (show) {
            // Entering pause
            this.isPaused = true;
            this._pauseStartedAt = Date.now();
            this.stopTimer();
            this.updateTimer();
        } else {
            // Resuming
            this.startTimer();
        }
    }

    autoPauseOnBlur() {
        const overlay = document.getElementById('pause-overlay');
        if (!overlay) return;
        overlay.style.display = 'flex';
        // Enter pause state if not already
        if (!this.isPaused) {
            this.isPaused = true;
            this._pauseStartedAt = Date.now();
        }
        this.stopTimer();
        this.updateTimer();
    }

    // Auto-candidates toggles
    isAutoCandidatesEnabled() {
        const toggle = document.getElementById('auto-candidates-toggle');
        return !!(toggle && toggle.checked);
    }
    // Auto-advance toggle
    isAutoAdvanceEnabled() {
        const toggle = document.getElementById('auto-advance-toggle');
        return !!(toggle && toggle.checked);
    }
    computeCandidates(row, col) {
        const s = new Set();
        if (this.board[row][col] !== 0) return s;
        for (let n = 1; n <= 9; n++) if (this.isValidMove(row, col, n)) s.add(n);
        return s;
    }
    recomputeAllCandidates() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.board[r][c] === 0) this.notes[r][c] = this.computeCandidates(r, c); else this.notes[r][c].clear();
                this.updateNotesDisplay(r, c);
            }
        }
    }
    recomputeCandidatesForPeers(row, col) {
        const peers = new Set();
        for (let i = 0; i < 9; i++) { peers.add(`${row},${i}`); peers.add(`${i},${col}`); }
        const sr = Math.floor(row / 3) * 3, sc = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) peers.add(`${sr + i},${sc + j}`);
        peers.forEach(key => {
            const [r, c] = key.split(',').map(Number);
            if (this.board[r][c] === 0) {
                this.notes[r][c] = this.computeCandidates(r, c);
                this.updateNotesDisplay(r, c);
            }
        });
    }

    // Persistence & stats
    getElapsedSeconds() { if (!this.startTime) return 0; return Math.floor((Date.now() - this.startTime) / 1000); }
    persistToStorage() {
        const data = { board: this.board, solution: this.solution, initialBoard: this.initialBoard, elapsed: this.getElapsedSeconds(), difficulty: document.getElementById('difficulty').value };
        try { localStorage.setItem('sudoku-progress', JSON.stringify(data)); } catch {}
    }
    persistSettings() {
        const settings = {
            autoCandidates: !!(document.getElementById('auto-candidates-toggle')?.checked),
            autoAdvance: !!(document.getElementById('auto-advance-toggle')?.checked),
            mistakesEnabled: this.mistakesEnabled,
            mistakeLimit: this.mistakeLimit === Infinity ? 11 : this.mistakeLimit,
            themeDark: !!(document.getElementById('theme-dark-toggle')?.checked),
            weekstart: ((document.getElementById('weekstart-toggle')?.getAttribute('aria-checked') === 'true') ? 'monday' : 'sunday') || 'sunday',
            accent: (document.querySelector('#accent-swatches .swatch[aria-checked="true"]')?.dataset.accent) || 'indigo',
        };
        try { localStorage.setItem('sudoku-settings', JSON.stringify(settings)); } catch {}
    }
    resumeFromStorage() {
        try {
            const raw = localStorage.getItem('sudoku-progress');
            if (!raw) return;
            const data = JSON.parse(raw);
            if (!data || !Array.isArray(data.board)) return;
            this.board = data.board; this.solution = data.solution; this.initialBoard = data.initialBoard;
            if (data.difficulty) document.getElementById('difficulty').value = data.difficulty;
            this.startTime = Date.now() - (data.elapsed || 0) * 1000;
            this.updateDisplay(); this.startTimer();
        } catch {}
    }
    resumeSettings() {
        try {
            const raw = localStorage.getItem('sudoku-settings');
            if (!raw) return;
            const s = JSON.parse(raw);
            if (!s) return;
            const ac = document.getElementById('auto-candidates-toggle'); if (ac) ac.checked = !!s.autoCandidates;
            const aa = document.getElementById('auto-advance-toggle'); if (aa) aa.checked = !!s.autoAdvance;
            const ml = document.getElementById('mistakes-limit'); const mlv = document.getElementById('mistakes-limit-value');
            if (ml && typeof s.mistakeLimit === 'number') {
                ml.value = s.mistakeLimit;
                if (mlv) mlv.textContent = s.mistakeLimit >= 11 ? 'Unlimited' : String(s.mistakeLimit);
                this.mistakeLimit = s.mistakeLimit >= 11 ? Infinity : s.mistakeLimit;
                this.mistakesEnabled = !(s.mistakeLimit >= 11);
            }
            const themeToggle = document.getElementById('theme-dark-toggle'); if (themeToggle) themeToggle.checked = !!s.themeDark;
            const weekToggle = document.getElementById('weekstart-toggle');
            if (weekToggle && s.weekstart) { weekToggle.setAttribute('aria-checked', s.weekstart === 'monday' ? 'true' : 'false'); }
            const swatches = document.querySelectorAll('#accent-swatches .swatch');
            if (swatches && s.accent) {
                swatches.forEach(b => b.setAttribute('aria-checked', b.dataset.accent === s.accent ? 'true' : 'false'));
            }
            // Apply values to document
            document.documentElement.dataset.theme = s.themeDark ? 'dark' : 'light';
            if (s.accent) {
                const map = { indigo: ['#6366f1', '#5558ee'], teal: ['#14b8a6', '#0ea5a3'], rose: ['#f43f5e', '#e11d48'] };
                const [a1, a2] = map[s.accent] || map.indigo;
                document.documentElement.style.setProperty('--accent', a1);
                document.documentElement.style.setProperty('--accent-600', a2);
            }
            if (s.autoCandidates) {
                // Ensure candidates are visible after restoring settings
                this.recomputeAllCandidates();
            }
            // Ensure hearts reflect restored settings
            this.renderHealthBar();
            // Update calendar headers after loading settings
            this.refreshCalendarHeaders && this.refreshCalendarHeaders();
        } catch {}
    }
    recordWin() {
        const diff = (this._activeDailyKey ? (JSON.parse(localStorage.getItem(`sudoku-daily-${this._activeDailyKey}`)||'{}').difficulty || this.getDailyDifficulty()) : (document.getElementById('difficulty')?.value || localStorage.getItem('sudoku-last-difficulty') || 'medium'));
        const elapsed = this.getElapsedSeconds();
        const stats = JSON.parse(localStorage.getItem('sudoku-stats') || '{}');
        stats.totalWins = (stats.totalWins || 0) + 1;
        stats.totalCompleted = (stats.totalCompleted || 0) + 1; // includes wins and losses
        stats.bestTimes = stats.bestTimes || {};
        // per-difficulty counters
        stats.byDifficulty = stats.byDifficulty || {};
        const slot = stats.byDifficulty[diff] = stats.byDifficulty[diff] || { played: 0, wins: 0 };
        slot.played += 1;
        slot.wins += 1;
        const best = stats.bestTimes[diff];
        if (!best || elapsed < best) stats.bestTimes[diff] = elapsed;
        try { localStorage.setItem('sudoku-stats', JSON.stringify(stats)); } catch {}
    }

    recordLoss() {
        const stats = JSON.parse(localStorage.getItem('sudoku-stats') || '{}');
        // attribute loss to current mode/difficulty
        const diff = (this._activeDailyKey ? (JSON.parse(localStorage.getItem(`sudoku-daily-${this._activeDailyKey}`)||'{}').difficulty || this.getDailyDifficulty()) : (document.getElementById('difficulty')?.value || localStorage.getItem('sudoku-last-difficulty') || 'medium'));
        stats.totalLosses = (stats.totalLosses || 0) + 1;
        stats.totalCompleted = (stats.totalCompleted || 0) + 1; // includes wins and losses
        stats.byDifficulty = stats.byDifficulty || {};
        const slot = stats.byDifficulty[diff] = stats.byDifficulty[diff] || { played: 0, wins: 0 };
        slot.played += 1;
        try { localStorage.setItem('sudoku-stats', JSON.stringify(stats)); } catch {}
    }
    showStats() {
        const modal = document.getElementById('stats-modal');
        const content = document.getElementById('stats-content');
        if (!modal || !content) return;
        const stats = JSON.parse(localStorage.getItem('sudoku-stats') || '{}');
        const totalWins = stats.totalWins || 0;
        const totalLosses = stats.totalLosses || 0;
        const totalCompleted = stats.totalCompleted || (totalWins + totalLosses);
        const best = stats.bestTimes || {};
        // Ensure keys for all difficulties exist for display
        ['easy','medium','hard','expert','master','extreme'].forEach(k => { if (!(k in best)) best[k] = null; });
        const winRatio = totalCompleted > 0 ? Math.round((totalWins / totalCompleted) * 100) : 0;
        const fmt = (s) => typeof s === 'number' ? `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}` : '-';
        const dailyResults = JSON.parse(localStorage.getItem('sudoku-daily-results') || '{}');
        // Compute current streak from recorded completions so it remains accurate across reloads/timezones
        const computeCurrentDailyStreak = () => {
            const keys = Object.keys(dailyResults);
            if (!keys.length) return 0;
            const completed = new Set(keys.filter(k => dailyResults[k]?.completed));
            const prevKey = (key) => {
                const d = this.parseUtcKeyToDate(key);
                const prev = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - 1));
                return this.getUtcDateKey(prev);
            };
            // Start from today; if today not completed, begin at yesterday
            let cursor = this.getUtcDateKey();
            if (!completed.has(cursor)) cursor = prevKey(cursor);
            let s = 0;
            while (completed.has(cursor)) { s++; cursor = prevKey(cursor); }
            return s;
        };
        const streak = computeCurrentDailyStreak();
        const dailyCount = Object.keys(dailyResults).length;

        // Recent list (max 10)
        const recentKeys = Object.keys(dailyResults).sort().reverse().slice(0, 10);
        const recentRows = recentKeys.map(k => {
            const r = dailyResults[k];
            const label = `${k.slice(0,4)}-${k.slice(4,6)}-${k.slice(6)}`;
            const diff = r.difficulty || this.getDifficultyForDateKey(k);
            const icon = this.getDifficultyIcon(diff);
            const time = fmt(r.elapsed);
            const mistakes = (typeof r.mistakes === 'number') ? r.mistakes : '-';
            return `<button class="table-row" data-key="${k}" aria-label="Open daily ${label}">
                <span>${label}</span>
                <span class="diff-chip diff-${diff}">${icon}</span>
                <span>${time}</span>
                <span>${mistakes}</span>
                <span></span>
            </button>`;
        }).join('');

        // Mini chart buckets from recent (or all) daily results
        const allKeys = Object.keys(dailyResults);
        const sourceKeys = allKeys.length <= 10 ? allKeys : recentKeys;
        const buckets = [0, 0, 0, 0]; // 0-5,5-10,10-15,15+
        sourceKeys.forEach(k => {
            const sec = (dailyResults[k] && typeof dailyResults[k].elapsed === 'number') ? dailyResults[k].elapsed : null;
            if (sec == null) return;
            if (sec < 5*60) buckets[0]++; else if (sec < 10*60) buckets[1]++; else if (sec < 15*60) buckets[2]++; else buckets[3]++;
        });
        const maxBucket = Math.max(1, ...buckets);
        const bucketHeights = buckets.map(n => Math.round((n / maxBucket) * 100));

        // Build UI
        content.innerHTML = `
            <div class="stat-grid">
                <div class="stat-card"><div class="stat-value" id="stat-played">${totalCompleted}</div><div class="stat-label">Total Played</div></div>
                <div class="stat-card"><div class="stat-value" id="stat-wins">${totalWins}</div><div class="stat-label">Wins</div></div>
                <div class="stat-card">
                    <div class="stat-value" id="stat-winrate">${winRatio}%</div>
                    <div class="progress"><div class="progress-bar" id="winrate-bar" style="width:0%"></div></div>
                    <div class="stat-label">Win Rate</div>
                </div>
                <div class="stat-card"><div class="stat-value" id="stat-losses">${totalLosses}</div><div class="stat-label">Losses</div></div>
            </div>

            <div class="streak-card stat-card ${streak > 0 ? 'streak-hot' : ''}" style="margin-bottom: 0.6rem">
                <div class="stat-value">${streak > 0 ? '🔥 ' + streak : '0'}</div>
                <div class="stat-label">Daily streak • ${dailyCount} completed</div>
            </div>

            <div class="stats-table grouped" aria-label="Stats by difficulty">
                <div class="table-head"><span>Level</span><span>Played</span><span>Wins</span><span>Win%</span><span>Best</span></div>
                ${['easy','medium','hard','expert','master','extreme'].map(d => {
                    const bd = (stats.byDifficulty && stats.byDifficulty[d]) || { played: 0, wins: 0 };
                    const played = bd.played || 0; const wins = bd.wins || 0; const rate = played ? Math.round((wins/played)*100) : 0;
                    return `<div class=\"table-row\" aria-label=\"${d} stats\">\n                        <span class=\"diff-chip diff-${d}\">${this.getDifficultyIcon(d)}</span>\n                        <span>${played}</span>\n                        <span>${wins}</span>\n                        <span>${rate}%</span>\n                        <span>${fmt(best[d])}</span>\n                    </div>`;
                }).join('')}
            </div>

            <div class="chart" aria-label="Time distribution chart">
                <div class="chart-title">Time distribution ${sourceKeys.length ? `(last ${sourceKeys.length})` : ''}</div>
                <div class="chart-bars">
                    <div class="bar" style="height:0%"><span>0–5m</span></div>
                    <div class="bar" style="height:0%"><span>5–10m</span></div>
                    <div class="bar" style="height:0%"><span>10–15m</span></div>
                    <div class="bar" style="height:0%"><span>15m+</span></div>
                </div>
            </div>

            <div class="stats-table" aria-label="Recent daily results">
                <div class="table-head"><span>Date</span><span>Diff</span><span>Time</span><span>Mist.</span><span></span></div>
                ${recentRows || `<div class="empty">No daily results yet. Play today’s Daily to get started!</div>`}
            </div>

            

            <div class="stats-actions"></div>
        `;

        // Animate progress bar after insertion for smooth width transition
        requestAnimationFrame(() => {
            const bar = document.getElementById('winrate-bar');
            if (bar) bar.style.width = `${winRatio}%`;
        });

        // Animate KPI count-up
        const animateNumber = (el, to, suffix = '', duration = 600) => {
            if (!el) return;
            const start = performance.now();
            const from = 0;
            const step = (t) => {
                const p = Math.min(1, (t - start) / duration);
                const val = Math.round(from + (to - from) * p);
                el.textContent = `${val}${suffix}`;
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };
        animateNumber(document.getElementById('stat-played'), totalCompleted);
        animateNumber(document.getElementById('stat-wins'), totalWins);
        animateNumber(document.getElementById('stat-losses'), totalLosses);
        animateNumber(document.getElementById('stat-winrate'), winRatio, '%');

        // Animate chart bars
        const bars = content.querySelectorAll('.chart-bars .bar');
        bucketHeights.forEach((h, i) => {
            const b = bars[i]; if (b) requestAnimationFrame(() => { b.style.height = `${h}%`; });
        });

        // Wire row clicks to load daily
        content.querySelectorAll('.table-row[data-key]').forEach(btn => {
            btn.addEventListener('click', () => {
                const k = btn.getAttribute('data-key');
                const dff = this.getDifficultyForDateKey(k);
                this.loadDailyByKey(k, dff);
                modal.style.display = 'none';
            });
        });

        // Actions
        const resetBtn = document.getElementById('stats-reset');
        if (resetBtn && !resetBtn._bound) { resetBtn._bound = true; resetBtn.addEventListener('click', async () => {
            if (!(await this.showConfirm('Reset all Sudoku stats (wins, losses, best times, daily results)?'))) return;
            if (!(await this.showConfirm('Are you sure? This cannot be undone.'))) return;
            try {
                localStorage.removeItem('sudoku-stats');
                localStorage.removeItem('sudoku-daily-results');
                localStorage.removeItem('sudoku-daily-last');
                localStorage.removeItem('sudoku-daily-streak');
            } catch {}
            this.showStats();
            this.updateDailyIconBadge && this.updateDailyIconBadge();
        }); }

        modal.style.display = 'block';
    }

    // Archive feature removed
}

// Initialize the game when the page loads (only in browser)
if (typeof document !== 'undefined') {
    const __initSudoku = () => {
        // Skip auto-init if the host element is missing (e.g., unit tests/jsdom)
        if (!document.getElementById('board')) return;
        const game = new SudokuGame();
        if (typeof window !== 'undefined') { window.SudokuGame = SudokuGame; window.__sudokuGame = game; }
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', __initSudoku);
    } else {
        __initSudoku();
    }
}

// Export for Node/Jest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SudokuGame };
}
