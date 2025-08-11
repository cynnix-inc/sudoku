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
        // Defer starting the game/timer until the first puzzle interaction
        this._hasStarted = false;
        this._pendingStart = false;
        this._preStartElapsed = 0;
        // Tracks whether user has made any board-changing input this run
        this._hasMadeMove = false;
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

        // Lives control (default to limited hearts until settings are loaded)
        this.mistakesEnabled = true;
        this.mistakeLimit = 3;
        this.mistakesCount = 0;
        this.lastWrongValues = Array(9).fill().map(() => Array(9).fill(null));
        this.isGameOver = false;
        // Hints state
        this.hintsUsed = 0;
        this.hintsLimit = Infinity; // set per difficulty
        this.hintPenaltySeconds = 60; // time penalty per hint
        // Timer pause/resume state
        this.isPaused = false;
        this._elapsedBeforePause = 0;
        // Auth state (Supabase)
        this._isLoggedIn = false;
        // Zen mode flag
        this._zenMode = false;
        
        if (!this._headless) {
            this.initializeGame();
            this.setupEventListeners();
        }
        // Initialize Supabase-related auth listeners and UI state
        if (!this._headless) {
            this._initSupabaseAuth && this._initSupabaseAuth();
        }
        // Try to resume saved progress and settings
        if (!this._headless) {
            this.resumeSettings && this.resumeSettings();
            this.renderHealthBar();
            this.resumeFromStorage && this.resumeFromStorage();
        }

        // Lightweight confetti helper
        this._burstConfetti = () => {
            try {
                const host = document.querySelector('.landing-card');
                if (!host) return;
                const colors = ['#6366f1','#14b8a6','#f59e0b','#ef4444','#22c55e','#3b82f6'];
                for (let i=0;i<28;i++) {
                    const s = document.createElement('span');
                    s.className = 'confetti-bit';
                    const size = Math.random()*6 + 4;
                    s.style.width = `${size}px`;
                    s.style.height = `${size}px`;
                    s.style.background = colors[Math.floor(Math.random()*colors.length)];
                    s.style.position = 'absolute';
                    s.style.top = '8px';
                    s.style.left = `${(host.clientWidth/2) + (Math.random()*30 - 15)}px`;
                    s.style.borderRadius = '2px';
                    s.style.opacity = '0.95';
                    s.style.transform = `translateY(0) rotate(${Math.random()*180}deg)`;
                    host.appendChild(s);
                    const dy = 80 + Math.random()*60;
                    const dx = (Math.random()*120 - 60);
                    s.animate([
                      { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
                      { transform: `translate(${dx}px, ${dy}px) rotate(240deg)`, opacity: 0 }
                    ], { duration: 900 + Math.random()*500, easing: 'cubic-bezier(.25,.8,.25,1)', fill: 'forwards' });
                    setTimeout(()=> s.remove(), 1600);
                }
            } catch {}
        };

        // Confetti burst at a specific host element
        this._burstConfettiAt = (host) => {
            try {
                if (!host) return;
                const colors = ['#6366f1','#14b8a6','#f59e0b','#ef4444','#22c55e','#3b82f6'];
                const rect = host.getBoundingClientRect();
                for (let i=0;i<22;i++) {
                    const s = document.createElement('span');
                    s.className = 'confetti-bit';
                    const size = Math.random()*5 + 3;
                    s.style.width = `${size}px`;
                    s.style.height = `${size}px`;
                    s.style.background = colors[Math.floor(Math.random()*colors.length)];
                    s.style.position = 'absolute';
                    s.style.top = `${(rect.height/2) - 10}px`;
                    s.style.left = `${(rect.width/2) - 10 + (Math.random()*24 - 12)}px`;
                    s.style.borderRadius = '2px';
                    s.style.opacity = '0.95';
                    host.appendChild(s);
                    const dy = 70 + Math.random()*50;
                    const dx = (Math.random()*100 - 50);
                    s.animate([
                      { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
                      { transform: `translate(${dx}px, ${dy}px) rotate(220deg)`, opacity: 0 }
                    ], { duration: 850 + Math.random()*450, easing: 'cubic-bezier(.25,.8,.25,1)', fill: 'forwards' });
                    setTimeout(()=> s.remove(), 1500);
                }
            } catch {}
        };

        // Seasonal themes (Pi Day, May 4th)
        this._applySeasonalThemes = () => {
            try {
                const now = new Date();
                const m = now.getMonth();
                const d = now.getDate();
                const root = document.documentElement;
                root.classList.remove('theme-pi','theme-saber');
                if (m === 2 && d === 14) { // Mar 14
                    root.classList.add('theme-pi');
                } else if (m === 4 - 1 && d === 4) { // May 4
                    root.classList.add('theme-saber');
                }
            } catch {}
        };

        // Accent helper
        this._applyAccent = (name) => {
            const map = {
                indigo: ['#6366f1', '#5558ee'],
                blue: ['#3b82f6', '#2563eb'],
                sky: ['#0ea5e9', '#0284c7'],
                teal: ['#14b8a6', '#0ea5a3'],
                emerald: ['#10b981', '#059669'],
                lime: ['#84cc16', '#65a30d'],
                amber: ['#f59e0b', '#d97706'],
                orange: ['#f97316', '#ea580c'],
                rose: ['#f43f5e', '#e11d48'],
                violet: ['#8b5cf6', '#7c3aed']
            };
            const keys = Object.keys(map);
            const pick = map[name] || map[keys[Math.floor(Math.random()*keys.length)]] || map.indigo;
            const [a1, a2] = pick;
            const root = document.documentElement;
            root.style.setProperty('--accent', a1);
            root.style.setProperty('--accent-600', a2);
            // derive rgba ramps from base accent for consistent theming
            try {
                const rgb = (() => {
                    const c = a1.trim();
                    if (c.startsWith('#')) {
                        const hex = c.slice(1);
                        const n = hex.length === 3 ? hex.split('').map(h => h + h).join('') : hex;
                        const r = parseInt(n.slice(0,2), 16);
                        const g = parseInt(n.slice(2,4), 16);
                        const b = parseInt(n.slice(4,6), 16);
                        return [r,g,b];
                    }
                    if (c.startsWith('rgb')) {
                        const m = c.match(/rgba?\(([^)]+)\)/i);
                        if (m) {
                            const parts = m[1].split(',').map(x => parseFloat(x.trim()));
                            return parts.slice(0,3);
                        }
                    }
                    return null;
                })();
                if (rgb) {
                    const [r,g,b] = rgb;
                    const setA = (varName, alpha) => root.style.setProperty(varName, `rgba(${r},${g},${b},${alpha})`);
                    setA('--accent-0a', 0);
                    setA('--accent-05a', 0.05);
                    setA('--accent-10a', 0.10);
                    setA('--accent-12a', 0.12);
                    setA('--accent-15a', 0.15);
                    setA('--accent-18a', 0.18);
                    setA('--accent-22a', 0.22);
                    setA('--accent-25a', 0.25);
                    setA('--accent-28a', 0.28);
                    setA('--accent-30a', 0.30);
                    setA('--accent-32a', 0.32);
                    setA('--accent-35a', 0.35);
                    setA('--accent-45a', 0.45);
                    setA('--accent-55a', 0.55);
                }
            } catch {}
        };

        // Rainbow digits next-game helper
        this._applyRainbowDigitsIfFlag = () => {
            try {
                const flag = localStorage.getItem('sudoku-rainbow-next') === '1';
                const pad = document.querySelector('.number-pad');
                if (pad) pad.classList.toggle('rainbow-digits', !!flag);
                if (flag) localStorage.removeItem('sudoku-rainbow-next');
            } catch {}
        };

        // Palindrome wink tracking and rapid-nav timestamps
        this._winkRows = new Set();
        this._navKeyTimestamps = [];
        // Konami progress buffer
        this._konamiProgress = [];

        // Seed calendar and daily state
        this._calendarRefMonth = new Date();
        this._activeDailyKey = null;
        // Initialize daily notification dot (moved to hamburger menu + menu item)
        this.updateDailyIconBadge && this.updateDailyIconBadge();
        // Seasonal themes + rainbow digits (if flagged) on load
        if (!this._headless) { this._applySeasonalThemes(); this._applyRainbowDigitsIfFlag(); }
    }

    // ----- Back-compat: Lives <-> Mistakes mapping -----
    get livesEnabled() {
        return this.mistakesEnabled;
    }
    set livesEnabled(value) {
        this.mistakesEnabled = !!value;
    }
    get livesLimit() {
        return this.mistakeLimit;
    }
    set livesLimit(value) {
        this.mistakeLimit = value;
    }
    get livesUsed() {
        return this.mistakesCount;
    }
    set livesUsed(value) {
        this.mistakesCount = value;
    }
    resetLives() {
        return this.resetMistakes && this.resetMistakes();
    }
    applyZenMode(on) {
        this._zenMode = !!on;
        document.documentElement.classList.toggle('zen', !!on);
        // Do not override Daily's fixed lives
        const isDaily = !!this._activeDailyKey;
        if (on && !isDaily) {
            this.mistakesEnabled = false;
            this.mistakeLimit = Infinity;
            this.resetMistakes && this.resetMistakes();
        }
        // Mark document for CSS to show hearts in Zen only when daily is active
        document.documentElement.classList.toggle('daily-active', !!this._activeDailyKey);
        this.renderHealthBar && this.renderHealthBar();
    }

    // Supabase: auth helpers
    async _initSupabaseAuth() {
        try {
            if (typeof window === 'undefined' || !window.supabase) return;
            const loginBtn = document.getElementById('menu-login');
            const logoutBtn = document.getElementById('menu-logout');
            const updateButtons = (loggedIn) => {
                if (loginBtn) loginBtn.style.display = loggedIn ? 'none' : 'block';
                if (logoutBtn) logoutBtn.style.display = loggedIn ? 'block' : 'none';
                this._isLoggedIn = !!loggedIn;
            };
            // Initial state
            const { data: { user } } = await window.supabase.auth.getUser();
            updateButtons(!!user);
            // Subscribe to auth changes
            window.supabase.auth.onAuthStateChange(async (_event, session) => {
                const isLoggedIn = !!session?.user;
                updateButtons(isLoggedIn);
                if (isLoggedIn) {
                    await this.syncRemoteStats && this.syncRemoteStats();
                }
            });
        } catch {}
    }

    async loginWithGoogle() {
        if (typeof window === 'undefined' || !window.supabase) {
            await (this.showInfo && this.showInfo('Sign-in not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.', { title: 'Sign-in Unavailable' }));
            return;
        }
        try {
            await window.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin }
            });
        } catch (e) {
            console.error(e);
            await (this.showInfo && this.showInfo('Failed to start Google sign-in.', { title: 'Sign-in Error' }));
        }
    }

    async logout() {
        if (typeof window === 'undefined' || !window.supabase) return;
        try { await window.supabase.auth.signOut(); } catch {}
    }

    // Stats sync: push local to remote if newer; pull if remote newer
    async syncRemoteStats() {
        if (typeof window === 'undefined' || !window.supabase) return;
        try {
            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) return;
            const localStatsRaw = localStorage.getItem('sudoku-stats');
            const localStats = localStatsRaw ? JSON.parse(localStatsRaw) : {};
            const localUpdatedAt = localStats.updatedAt ? new Date(localStats.updatedAt) : null;

            const { data: remote, error } = await window.supabase
                .from('stats')
                .select('*')
                .eq('user_id', user.id)
                .single();
            if (error && error.code !== 'PGRST116') throw error;

            const remoteUpdatedAt = remote?.updated_at ? new Date(remote.updated_at) : null;

            if (localStats && (localUpdatedAt && (!remoteUpdatedAt || localUpdatedAt > remoteUpdatedAt))) {
                await this._upsertRemoteStats(user.id, localStats);
            } else if (remote && (!localUpdatedAt || (remoteUpdatedAt && remoteUpdatedAt > localUpdatedAt))) {
                const merged = this._mapRemoteStatsToLocal(remote);
                localStorage.setItem('sudoku-stats', JSON.stringify(merged));
            }
        } catch (e) {
            console.error('syncRemoteStats failed', e);
        }
    }

    _mapLocalStatsToRow(userId, stats) {
        return {
            user_id: userId,
            total_played: stats.totalCompleted || 0,
            total_wins: stats.totalWins || 0,
            total_losses: stats.totalLosses || 0,
            best_easy: (stats.bestTimes && stats.bestTimes.easy) || null,
            best_medium: (stats.bestTimes && stats.bestTimes.medium) || null,
            best_hard: (stats.bestTimes && stats.bestTimes.hard) || null,
            best_expert: (stats.bestTimes && stats.bestTimes.expert) || null,
            best_master: (stats.bestTimes && stats.bestTimes.master) || null,
            best_extreme: (stats.bestTimes && stats.bestTimes.extreme) || null,
            by_difficulty: stats.byDifficulty || null,
            updated_at: new Date().toISOString(),
        };
    }

    _mapRemoteStatsToLocal(row) {
        const bestTimes = {
            easy: row.best_easy ?? null,
            medium: row.best_medium ?? null,
            hard: row.best_hard ?? null,
            expert: row.best_expert ?? null,
            master: row.best_master ?? null,
            extreme: row.best_extreme ?? null,
        };
        return {
            totalCompleted: row.total_played || 0,
            totalWins: row.total_wins || 0,
            totalLosses: row.total_losses || 0,
            bestTimes,
            byDifficulty: row.by_difficulty || {},
            updatedAt: row.updated_at || new Date().toISOString(),
        };
    }

    async _upsertRemoteStats(userId, stats) {
        const row = this._mapLocalStatsToRow(userId, stats);
        const { error } = await window.supabase.from('stats').upsert(row, { onConflict: 'user_id' });
        if (error) throw error;
    }

    // Determine if there is an active, non-finished game that should trigger confirmation
    isGameInProgress() {
        if (this.isGameComplete || this.isGameOver) return false;
        const anyMoves = (this.history && this.history.length > 0);
        // Do not treat mere timer progression as in-progress; only actual moves count
        return anyMoves;
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

    // Show a notification dot on the hamburger and Dailys menu item if today's daily is not completed
    updateDailyIconBadge() {
        const headerDot = document.getElementById('daily-dot'); // legacy (removed)
        const menuDot = document.getElementById('menu-daily-dot');
        const dailysDot = document.getElementById('menu-dailys-dot');
        try {
            const key = this.getUtcDateKey();
            const results = JSON.parse(localStorage.getItem('sudoku-daily-results') || '{}');
            const completed = !!(results && results[key] && results[key].completed);
            const display = completed ? 'none' : 'inline-block';
            if (headerDot) headerDot.style.display = display;
            if (menuDot) menuDot.style.display = display;
            if (dailysDot) dailysDot.style.display = display;
        } catch {
            if (headerDot) headerDot.style.display = 'inline-block';
            if (menuDot) menuDot.style.display = 'inline-block';
            if (dailysDot) dailysDot.style.display = 'inline-block';
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
        const landingOverlay = document.getElementById('landing-overlay');
        if (landingOverlay) {
            const isAutomation = (typeof navigator !== 'undefined' && !!navigator.webdriver);
            if (isAutomation) {
                // In automated/browser tests, skip menu to keep tests stable
                landingOverlay.style.display = 'none';
                try {
                    const saved = localStorage.getItem('sudoku-last-difficulty');
                    const diff = saved || 'medium';
                    this.updateModeIndicator({ type: 'normal', difficulty: diff });
                    this.generatePuzzle(diff);
                    // Make top-left cell editable for test stability
                    if (this.initialBoard && this.initialBoard[0] && this.initialBoard[0][0] !== 0) {
                        this.initialBoard[0][0] = 0;
                        this.board[0][0] = 0;
                    }
                } catch {
                    this.generatePuzzle('medium');
                    this.updateModeIndicator({ type: 'normal', difficulty: 'medium' });
                }
                this.updateDisplay();
            } else {
                // Show landing menu and defer puzzle generation until a selection is made
                landingOverlay.style.display = 'flex';
                // Clear mode indicator until a mode is chosen
                const host = document.getElementById('mode-indicator');
                if (host) host.innerHTML = '';
            }
        } else {
            // Fallback to previous behavior when landing overlay is not present (e.g., tests)
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
            // Do not start the timer on load; wait until first puzzle interaction
            this.updateDisplay();
            this.updateHintUi && this.updateHintUi();
        }
        // Ensure health bar is visible according to current settings
        this.renderHealthBar();
        // Ensure timer display is initialized
        if (typeof this.updateTimer === 'function') this.updateTimer();
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

        // Final safeguard: ensure uniqueness; if not unique, retry a few times
        let attempts = 0;
        while (!this.hasUniqueSolution() && attempts < 3) {
            this.generateSolvedBoard();
            this.solution = this.board.map(row => [...row]);
            if (typeof this.removeNumbersSymmetricUnique === 'function') {
                this.removeNumbersSymmetricUnique(cellsToRemoveCount);
            } else {
                this.removeNumbers(cellsToRemoveCount);
            }
            attempts++;
        }
        // console.log('Numbers removed, puzzle board:', this.board);
        
        // Copy to initial board
        this.initialBoard = this.board.map(row => [...row]);
        
        // Reset all notes to empty for a fresh puzzle
        this.notes = Array(9).fill().map(() => Array(9).fill(null).map(() => new Set()));
        // Reset hints and set cap by difficulty
        const hintCaps = { easy: 5, medium: 3, hard: 2, expert: 1, master: 0, extreme: 0 };
        this.hintsUsed = 0;
        this.hintsLimit = hintCaps[difficulty] ?? 3;
        this.updateHintUi && this.updateHintUi();
        // console.log('Initial board saved:', this.initialBoard);
        
        // Auto-candidates on start
        if (this.isAutoCandidatesEnabled && this.isAutoCandidatesEnabled()) {
            this.recomputeAllCandidates();
        }
    }

    // Symmetric removal with uniqueness enforcement for regular games
    removeNumbersSymmetricUnique(count) {
        const positions = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (r < 4 || (r === 4 && c <= 4)) positions.push([r, c]);
            }
        }
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        let removed = 0;
        for (const [r, c] of positions) {
            if (removed >= count) break;
            const sr = 8 - r, sc = 8 - c;
            if (this.board[r][c] === 0) continue;
            const v1 = this.board[r][c];
            const v2 = this.board[sr][sc];
            this.board[r][c] = 0;
            if (r !== sr || c !== sc) this.board[sr][sc] = 0;
            if (this.hasUniqueSolution()) {
                removed += (r === sr && c === sc) ? 1 : 2;
            } else {
                this.board[r][c] = v1;
                if (r !== sr || c !== sc) this.board[sr][sc] = v2;
            }
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
        // Enforce fixed lives limits in Daily; restore user setting otherwise
        const slider = document.getElementById('lives-limit') || document.getElementById('mistakes-limit');
        const label = document.getElementById('lives-limit-value') || document.getElementById('mistakes-limit-value');
        const note = document.getElementById('lives-daily-note') || document.getElementById('mistakes-daily-note');
        const pill = document.getElementById('lives-limit-pill') || document.getElementById('mistakes-limit-pill');
        const preview = document.getElementById('lives-preview') || document.getElementById('mistakes-preview');
        const map = { easy: 6, medium: 5, hard: 4, expert: 3, master: 2, extreme: 1 };

        if (isDaily) {
            document.documentElement.classList.add('daily-active');
            // Save the user's pre-daily slider value once so we can restore it later
            if (typeof this._userLivesRestoreValue !== 'number') {
                let currentValue = 3;
                if (slider && slider.value) {
                    currentValue = parseInt(slider.value);
                } else {
                    // Derive from current in-memory setting if slider unavailable
                    currentValue = (!this.mistakesEnabled || !Number.isFinite(this.mistakeLimit)) ? 11 : (Number.isFinite(this.mistakeLimit) ? this.mistakeLimit : 3);
                }
                this._userLivesRestoreValue = currentValue;
            }

            const lim = map[difficulty] ?? 3;
            this.livesEnabled = true;
            this.livesLimit = lim;
            if (slider) { slider.value = String(lim); slider.disabled = true; }
            if (label) label.textContent = String(lim);
            if (pill) pill.textContent = String(lim);
            if (preview) preview.textContent = `Hearts: ×${lim}`;
            if (note) note.style.display = 'block';
            // Apply Daily hint caps
            const hintCaps = { easy: 5, medium: 3, hard: 2, expert: 1, master: 0, extreme: 0 };
            this.hintsUsed = 0;
            this.hintsLimit = hintCaps[difficulty] ?? 3;
            this.updateHintUi && this.updateHintUi();
        } else {
            document.documentElement.classList.remove('daily-active');
            if (slider) slider.disabled = false;
            if (note) note.style.display = 'none';

            // Restore the user's slider value and in-memory rule from before Daily
            let v;
            if (typeof this._userLivesRestoreValue === 'number') {
                v = this._userLivesRestoreValue;
            } else {
                try {
                    const s = JSON.parse(localStorage.getItem('sudoku-settings') || '{}');
                    v = (typeof s.livesLimit === 'number') ? s.livesLimit : (typeof s.mistakeLimit === 'number' ? s.mistakeLimit : 3);
                } catch { v = 3; }
            }
            if (slider) slider.value = String(v);
            if (v >= 11) {
                this.livesEnabled = false;
                this.livesLimit = Infinity;
                if (label) label.textContent = 'Unlimited';
                if (pill) pill.textContent = '∞';
                if (preview) preview.textContent = 'Hearts: ∞';
            } else {
                this.livesEnabled = true;
                this.livesLimit = v;
                if (label) label.textContent = String(v);
                if (pill) pill.textContent = String(v);
                if (preview) preview.textContent = `Hearts: ×${v}`;
            }
            // Leaving Daily: just refresh hint UI
            this.updateHintUi && this.updateHintUi();
            // Clear saved value after restore so re-entering Daily can snapshot again
            delete this._userLivesRestoreValue;
        }

        // When leaving Daily or changing limits outside of an active game
        const inProgress = this.isGameInProgress && this.isGameInProgress();
        if (!inProgress) {
            this.resetLives();
        }
        this.renderHealthBar();
        // Update ARIA to say Lives
        const hb = document.getElementById('health-bar');
        if (hb) hb.setAttribute('aria-label', (!this.livesEnabled || !Number.isFinite(this.livesLimit) || this.livesLimit >= 11) ? 'Unlimited lives' : 'Lives');
    }

    generateDaily(difficulty) {
        // Ensure any previous Game Over or Pause overlays are cleared when starting Daily
        this.isGameComplete = false;
        this.isGameOver = false;
        const go = document.getElementById('gameover-overlay');
        if (go) go.style.display = 'none';
        const po = document.getElementById('pause-overlay');
        if (po) po.style.display = 'none';
        this.updateTimerButton && this.updateTimerButton();
        this.lockedNumber = null;
        document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('active'));
        if (this.selectedCell) { this.selectedCell.classList.remove('selected'); this.selectedCell = null; }
        document.querySelectorAll('.cell.highlighted').forEach(cell => cell.classList.remove('highlighted'));
        const key = this.getUtcDateKey();
        const storeKey = `sudoku-daily-${key}`;
        // Flag daily-active for Zen CSS logic
        document.documentElement.classList.add('daily-active');
        const cached = localStorage.getItem(storeKey);
        if (cached) {
            try {
                const data = JSON.parse(cached);
                if (data && data.board && data.solution) {
                    // Validate cached daily still has a unique solution
                    this.board = data.board.map(r => [...r]);
                    if (this.hasUniqueSolution()) {
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
                    } else {
                        // Invalidate bad cache
                        try { localStorage.removeItem(storeKey); } catch {}
                    }
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
        // Final uniqueness guard for freshly generated daily
        if (!this.hasUniqueSolution()) {
            // Regenerate once using the same seed but different shuffle approach
            this.board = Array(9).fill().map(() => Array(9).fill(0));
            fillBox(0,0); fillBox(3,3); fillBox(6,6);
            this.solveBoard();
            this.solution = this.board.map(r => [...r]);
            removeSymUnique(cellsToRemove[difficulty] || 40);
        }
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
        this.updateTimerButton && this.updateTimerButton();
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
                const activeBtn = document.querySelector(`.number-btn[data-number="${currentVal}"]`);
                // Do not lock/select a digit that is currently disabled on the pad
                if (activeBtn && !activeBtn.disabled && !activeBtn.classList.contains('disabled')) {
                    this.lockedNumber = currentVal;
                    document.querySelectorAll('.number-btn, #pad-erase-btn').forEach(b => b.classList.remove('active'));
                    activeBtn.classList.add('active');
                } else {
                    this.lockedNumber = null;
                }
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
            this._trackRapidNav();
        } else if ((k === 'ArrowDown' || lower === 's' || lower === 'j') && row < 8) {
            event.preventDefault();
            this.selectCell(document.querySelector(`[data-row="${row + 1}"][data-col="${col}"]`), row + 1, col);
            this._trackRapidNav();
        } else if ((k === 'ArrowLeft' || lower === 'a' || lower === 'h') && col > 0) {
            event.preventDefault();
            this.selectCell(document.querySelector(`[data-row="${row}"][data-col="${col - 1}"]`), row, col - 1);
            this._trackRapidNav();
        } else if ((k === 'ArrowRight' || lower === 'd' || lower === 'l') && col < 8) {
            event.preventDefault();
            this.selectCell(document.querySelector(`[data-row="${row}"][data-col="${col + 1}"]`), row, col + 1);
            this._trackRapidNav();
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
        // First real interaction should start the game/timer
        this.ensureGameStarted && this.ensureGameStarted();
        // Track last action source for pad re-selection logic
        this._lastActionSource = source;
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
        this._hasMadeMove = true;
        this.redoStack = [];

        // Easter: Palindrome wink (ordered row)
        try {
            const want = '123456789';
            const rowStr = this.board[row].join('');
            if (rowStr === want && !this._winkRows.has(row)) {
                this._winkRows.add(row);
                this.showStatus && this.showStatus('Nice ordering.', 'info');
            }
        } catch {}

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
        // Mark last action so pad logic can respond appropriately
        this._lastActionSource = 'undo';
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
        // If undo re-enabled a previously disabled digit and it was the last locked/active one, re-select it
        try {
            const reEnabled = [];
            for (let n = 1; n <= 9; n++) {
                const btn = document.querySelector(`.number-btn[data-number="${n}"]`);
                if (!btn) continue;
                if (!btn.disabled && !btn.classList.contains('disabled')) reEnabled.push(n);
            }
            // Re-select only if we previously had a locked number and it's now re-enabled, and the last action was not an erase
            if (this._lastActionSource !== 'erase' && this._lastLockedBeforeDisable && reEnabled.includes(this._lastLockedBeforeDisable)) {
                const btn = document.querySelector(`.number-btn[data-number="${this._lastLockedBeforeDisable}"]`);
                if (btn) {
                    document.querySelectorAll('.number-btn, #pad-erase-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.lockedNumber = this._lastLockedBeforeDisable;
                }
                this._lastLockedBeforeDisable = null;
            }
        } catch {}
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
        // First real interaction should start the game/timer
        this.ensureGameStarted && this.ensureGameStarted();
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
        // First real interaction should start the game/timer
        this.ensureGameStarted && this.ensureGameStarted();
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
        this.updateHintUi && this.updateHintUi();
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
                // Keep buttons clickable in tests but visually indicate disabled
                const isAutomation = (typeof navigator !== 'undefined' && !!navigator.webdriver);
                btn.disabled = isAutomation ? false : done;
                if (done) {
                    // Ensure any selected number that becomes disabled is immediately deselected
                    if (btn.classList.contains('active')) {
                        btn.classList.remove('active');
                        // Remember last locked number that was disabled so we can restore it on undo if applicable
                        if (!this._lastLockedBeforeDisable && this.lockedNumber === n) {
                            this._lastLockedBeforeDisable = n;
                        }
                    }
                    if (this.lockedNumber === n) this.lockedNumber = null;
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
        
        // Wiggle on completion
        try {
            const boardEl = document.getElementById('board');
            if (boardEl) { boardEl.classList.add('board-wiggle'); setTimeout(()=> boardEl.classList.remove('board-wiggle'), 500); }
        } catch {}

        this.isGameComplete = true;
        this.stopTimer();
        this.showGameCompleteModal();
    }

    showGameOver() {
        // Hide legacy overlay if present
        const overlay = document.getElementById('gameover-overlay');
        if (overlay) overlay.style.display = 'none';
        // Close legacy modal if open
        const legacyModal = document.getElementById('modal');
        if (legacyModal) legacyModal.style.display = 'none';

        // Route to landing menu with a loss result banner
        this.showLandingResult({ outcome: 'loss' });
    }

    showGameCompleteModal() {
        // Close legacy modal if open
        const legacyModal = document.getElementById('modal');
        if (legacyModal) legacyModal.style.display = 'none';
        // Record results
        this.recordDailyResult && this.recordDailyResult();
        const newBest = !!this.recordWin();
        // Route to landing with win banner
        this.showLandingResult({ outcome: 'win', newBest });
    }

    // Present the new main menu (landing) with a results banner at the top
    showLandingResult({ outcome, newBest = false } = {}) {
        try {
            const landing = document.getElementById('landing-overlay');
            const box = document.getElementById('landing-result');
            if (!landing || !box) return;

            // Compute difficulty label and icon
            const diff = (this._activeDailyKey
                ? (JSON.parse(localStorage.getItem(`sudoku-daily-${this._activeDailyKey}`) || '{}').difficulty || this.getDailyDifficulty())
                : (document.getElementById('difficulty')?.value || localStorage.getItem('sudoku-last-difficulty') || 'medium'));
            const diffLabel = String(diff).slice(0,1).toUpperCase() + String(diff).slice(1);
            const diffIcon = (this.getDifficultyIcon && this.getDifficultyIcon(diff)) || '';

            const timeSpent = this.getTimeSpent();
            const mistakes = this.livesUsed || 0;
            const mistakesTotal = (this.livesEnabled && Number.isFinite(this.livesLimit)) ? this.livesLimit : '∞';

            const isWin = outcome === 'win';
            const headline = isWin
                ? (newBest ? 'New Personal Best!' : 'Puzzle Completed')
                : 'Game Over';
            const emoji = isWin ? (newBest ? '🏆' : '🎉') : '💀';

            // Compose chips
            const chips = [
                `<span class="chip"><span class="icon">${diffIcon}</span><span>${diffLabel}</span></span>`,
                `<span class="chip"><span class="icon">⏱</span><span>${timeSpent}</span></span>`,
                `<span class="chip"><span class="icon">❤️</span><span>${mistakes}/${mistakesTotal}</span></span>`
            ];
            if ((this.hintsUsed || 0) > 0) chips.push(`<span class="chip"><span class="icon">🛈</span><span>Assisted</span></span>`);

            box.className = 'landing-result';
            box.classList.add(isWin ? 'result-win' : 'result-lose');
            if (newBest) box.classList.add('result-best');
            box.innerHTML = `
                <div class="headline">${emoji} ${headline}</div>
                <div class="sub">${isWin ? 'Well done!' : 'Out of lives.'}</div>
                <div class="chips">${chips.join('')}</div>
            `;
            box.hidden = false;

            // Trigger glint; confetti only on unassisted wins; plus time/next-game flair
            if (isWin) {
                if ((this.hintsUsed || 0) === 0) this._burstConfetti && this._burstConfetti();
                box.classList.add('glint');
                setTimeout(()=> box.classList.remove('glint'), 1200);
                try {
                    const elapsed = this.getElapsedSeconds && this.getElapsedSeconds();
                    if (typeof elapsed === 'number' && elapsed < 180) {
                        const board = document.getElementById('board');
                        if (board) {
                            board.classList.add('neon-trail');
                            setTimeout(()=> board.classList.remove('neon-trail'), 10000);
                        }
                    }
                } catch {}
                try {
                    if ((this.hintsUsed||0) === 0 && (this.mistakesCount||0) === 0) {
                        localStorage.setItem('sudoku-rainbow-next','1');
                    }
                } catch {}
            } else {
                landing.classList.add('loss-shake');
                setTimeout(()=> landing.classList.remove('loss-shake'), 700);
            }

            // Ensure any pause or overlays are not visible
            const pause = document.getElementById('pause-overlay'); if (pause) pause.style.display = 'none';
            landing.style.display = 'flex';
        } catch {}
    }

    startTimer() {
        // If resuming after pause, shift startTime forward by paused duration so elapsed excludes pause time
        if (this.isPaused && this._pauseStartedAt) {
            const pausedFor = Date.now() - this._pauseStartedAt;
            this._elapsedBeforePause += Math.max(0, Math.floor(pausedFor / 1000));
            this.isPaused = false;
            this._pauseStartedAt = null;
        }
        // Do not start timer unless the game has actually started via interaction
        if (!this._hasStarted) return;
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.updateTimer();
        }, 1000);
        // Update immediately on start
        this.updateTimer();
        this.updateTimerButton && this.updateTimerButton();
    }

    // Mark the game as started by the user and initialize the timer
    ensureGameStarted() {
        if (this._hasStarted) return;
        this._hasStarted = true;
        if (this._pendingStart) {
            this.startTime = Date.now() - (this._preStartElapsed * 1000);
        } else if (!this.startTime) {
            this.startTime = Date.now();
        }
        this._pendingStart = false;
        this._preStartElapsed = 0;
        this.startTimer();
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        // Keep icon in sync when timer stops
        this.updateTimerButton && this.updateTimerButton();
    }

    updateTimer() {
        const timeElement = document.getElementById('time');
        const timeSpent = this.getTimeSpent();
        timeElement.textContent = timeSpent;
    }

    // Ensure the pause/play icon and title reflect actual state
    updateTimerButton() {
        const timerBtn = document.getElementById('timer-toggle');
        if (!timerBtn) return;
        const icon = timerBtn.querySelector('.timer-icon');
        const overlay = document.getElementById('pause-overlay');
        const overlayShowing = !!(overlay && overlay.style.display !== 'none' && overlay.style.display !== '');
        const isRunning = !!this.timer && !this.isPaused && !overlayShowing && this._hasStarted;
        if (icon) icon.textContent = isRunning ? '⏸' : '▶';
        timerBtn.setAttribute('title', isRunning ? 'Pause' : (this._hasStarted ? 'Resume' : 'Start'));
    }

    // Update hint button state and tooltip
    updateHintUi() {
        const btn = document.getElementById('hint-btn');
        if (!btn) return;
        const finite = Number.isFinite(this.hintsLimit);
        const left = finite ? Math.max(0, this.hintsLimit - (this.hintsUsed || 0)) : '∞';
        const isOut = finite && (this.hintsUsed || 0) >= this.hintsLimit;
        btn.disabled = isOut;
        // Update bubble counter (no tooltip reliance)
        const badge = document.getElementById('hint-badge');
        if (badge) {
            if (!finite) {
                badge.style.display = 'none';
            } else {
                badge.textContent = String(left);
                badge.style.display = '';
                badge.classList.toggle('badge-danger', String(left) === '0');
            }
        }
        btn.removeAttribute('title');
    }

    getTimeSpent() {
        if (!this._hasStarted && this._pendingStart && Number.isFinite(this._preStartElapsed)) {
            const minutes = Math.floor(this._preStartElapsed / 60);
            const seconds = this._preStartElapsed % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
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
        this.updateTimerButton && this.updateTimerButton();
        // Clear locked number and highlight on numpad
        this.lockedNumber = null;
        document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('active'));
        this.stopTimer();
        // Reset timer state and defer start until interaction
        this.startTime = null;
        this.isPaused = false;
        this._pauseStartedAt = null;
        this._elapsedBeforePause = 0;
        this._hasStarted = false;
        this._pendingStart = false;
        this._preStartElapsed = 0;
        this._hasMadeMove = false;
        this.updateTimerButton && this.updateTimerButton();
        // Reset undo/redo history on new game
        this.history = [];
        this.redoStack = [];
        // If a pending mistakes setting was chosen during an active game, apply it now
        if (typeof this._pendingMistakeLimitValue === 'number') {
            const v = this._pendingMistakeLimitValue;
            if (v >= 11) {
                this.mistakesEnabled = false;
                this.mistakeLimit = Infinity;
            } else {
                this.mistakesEnabled = true;
                this.mistakeLimit = v;
            }
            // Clear the pending flag
            delete this._pendingMistakeLimitValue;
        }
        this.generatePuzzle(difficulty);
        // Defer timer until first interaction
        this.updateDisplay();
        // Apply rainbow pad style for next game if flagged
        this._applyRainbowDigitsIfFlag && this._applyRainbowDigitsIfFlag();
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
            return false;
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
            wrap.innerHTML = `<span class="health-heart"><div class="heart-full">${this.renderHeartSvg()}</div><span class="health-badge">∞</span></span>`;
            host.appendChild(wrap);
            host.setAttribute('aria-label', 'Unlimited lives');
            return;
        } else if (compact || this._zenMode) {
            const wrap = document.createElement('div');
            wrap.className = 'health-compact';
            const remaining = Math.max(0, total - this.mistakesCount);
            wrap.innerHTML = `<span class="health-heart"><div class="heart-full">${this.renderHeartSvg()}</div><span class="health-badge${remaining <= 1 ? ' badge-danger' : ''}">${remaining}</span></span>`;
            host.appendChild(wrap);
            host.setAttribute('aria-label', `Lives remaining: ${remaining} of ${total}`);
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
        const compactBadge = host.querySelector('.health-compact .health-badge');
        if (compactCount || compactBadge) {
            const unlimited = !this.livesEnabled || !Number.isFinite(this.livesLimit) || this.livesLimit >= 11;
            if (unlimited) {
                if (compactCount) compactCount.textContent = '∞';
                if (compactBadge) compactBadge.textContent = '∞';
                host.setAttribute('aria-label', 'Unlimited lives');
                return;
            }
            const total = (this.livesEnabled && Number.isFinite(this.livesLimit)) ? this.livesLimit : 0;
            const remaining = Math.max(0, total - this.livesUsed);
            if (compactCount) compactCount.textContent = `×${remaining}`;
            if (compactBadge) {
                compactBadge.textContent = String(remaining);
                compactBadge.classList.toggle('badge-danger', remaining <= 1);
            }
            host.setAttribute('aria-label', `Lives remaining: ${remaining} of ${total}`);
            // low-health color states on compact
            host.classList.toggle('health-critical', (total - this.mistakesCount) <= 1 && total > 0);
            host.classList.toggle('health-low', (total - this.mistakesCount) === 2);
            return;
        }
        const hearts = Array.from(host.querySelectorAll('.health-heart'));
        const total = hearts.length;
        const lost = Math.min(this.livesUsed, total);
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
        host.setAttribute('aria-label', `Lives remaining: ${remaining} of ${total}`);
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
        const hasToast = !!document.getElementById('toast-container');
        if (hasToast && typeof this.showToast === 'function') {
            this.showToast(message, type, 6000);
            return;
        }
        // Fallback: legacy inline banner only if toast unavailable
        const statusElement = document.getElementById('status-message');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status-message ${type}`;
            clearTimeout(this._statusTimer);
            this._statusTimer = setTimeout(() => this.clearStatus(), 6000);
        }
    }

    clearStatus() {
        const statusElement = document.getElementById('status-message');
        if (statusElement) {
            statusElement.textContent = '';
            statusElement.className = 'status-message';
        }
    }

    showToast(message, type = 'info', duration = 6000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.textContent = message;

        container.appendChild(el);

        const timer = setTimeout(() => {
            el.classList.add('out');
            setTimeout(() => el.remove(), 180);
        }, duration);

        el.addEventListener('click', () => {
            clearTimeout(timer);
            el.classList.add('out');
            setTimeout(() => el.remove(), 180);
        });
    }

    setupEventListeners() {
        // Game control buttons (header new game removed; handled via menu)
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
        // Initialize hint button UI on first bind
        this.updateHintUi && this.updateHintUi();
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

        // mistakes/lives toggle removed; slider controls behavior

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
            // Prevent clicks inside the popover from bubbling to the document
            popover.addEventListener('click', (e) => { e.stopPropagation(); });
            document.addEventListener('click', (e) => {
                if (!popover.contains(e.target) && e.target !== menuBtn) {
                    popover.style.display = 'none';
                    menuBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Popover actions
        const map = [
            ['menu-newgame', async () => {
                if (this.isGameInProgress && this.isGameInProgress()) {
                    const proceed = await this.showConfirm('Start a new game? Current game will end and count as a loss.');
                    if (!proceed) return;
                    this.recordLoss();
                }
                this.newGame();
            }],
            ['menu-dailys', () => { this.openCalendar && this.openCalendar(); }],
            ['menu-check', () => this.checkPuzzle()],
            ['menu-solve', () => this.solvePuzzle()],
            ['menu-clear', () => this.clearBoard()],
            ['menu-stats', () => this.showStats && this.showStats()],
            ['menu-login', () => this.loginWithGoogle && this.loginWithGoogle()],
            ['menu-logout', () => this.logout && this.logout()],
            ['menu-settings', () => { this.autoPauseOnBlur && this.autoPauseOnBlur(); const m = document.getElementById('settings-modal'); if (m) m.style.display = 'block'; }],
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
        // Defensive: delegate clicks from the popover in case direct bindings fail
        const menuDelegate = document.getElementById('menu-popover');
        if (menuDelegate && !menuDelegate._delegateBound) {
            menuDelegate._delegateBound = true;
            const actions = Object.fromEntries(map);
            menuDelegate.addEventListener('click', (ev) => {
                const item = ev.target && (ev.target.closest ? ev.target.closest('.popover-item') : null);
                if (!item || !item.id) return;
                const action = actions[item.id];
                if (typeof action === 'function') { hideMenu(); action(); }
            });
        }

        const settingsClose = document.getElementById('settings-close');
        if (settingsClose) settingsClose.addEventListener('click', async () => {
            const modal = document.getElementById('settings-modal');
            if (modal) modal.style.display = 'none';
            // Auto-resume on closing settings
            this.resumeFromPause && this.resumeFromPause();
            // If user changed Max mistakes during an active game, notify that it will apply next game
            if (this.isGameInProgress && this.isGameInProgress() && this._mistakesSettingChangedDuringActiveGame) {
                // Use OK-only modal per requirement
                await (this.showInfo && this.showInfo('Lives change will apply to your next game', { title: 'Settings Saved', okText: 'OK' }));
                // Keep pending value for next game; just clear the notification flag
                this._mistakesSettingChangedDuringActiveGame = false;
            }
        });
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
        // Settings: Lives slider (with back-compat IDs)
        const mistakesSlider = document.getElementById('lives-limit') || document.getElementById('mistakes-limit');
        const mistakesValue = document.getElementById('lives-limit-value') || document.getElementById('mistakes-limit-value');
        const mistakesPill = document.getElementById('lives-limit-pill') || document.getElementById('mistakes-limit-pill');
        const mistakesPreview = document.getElementById('lives-preview') || document.getElementById('mistakes-preview');
        if (mistakesSlider) {
            const sync = () => {
                const v = parseInt(mistakesSlider.value);
                const inProgress = this.isGameInProgress && this.isGameInProgress();
                if (v >= 11) { // unlimited/off
                    if (mistakesValue) mistakesValue.textContent = 'Unlimited'; // Lives
                    if (mistakesPill) mistakesPill.textContent = '∞';
                    if (mistakesPreview) mistakesPreview.textContent = 'Hearts: ∞';
                    if (!inProgress) {
                        this.livesEnabled = false;
                        this.livesLimit = Infinity;
                    } else {
                        // Defer applying to the next game
                        this._pendingMistakeLimitValue = v;
                        this._mistakesSettingChangedDuringActiveGame = true;
                    }
                } else {
                    if (mistakesValue) mistakesValue.textContent = String(v); // Lives
                    if (mistakesPill) mistakesPill.textContent = String(v);
                    if (mistakesPreview) mistakesPreview.textContent = `Hearts: ×${v}`;
                    if (!inProgress) {
                        this.livesEnabled = true;
                        this.livesLimit = v;
                    } else {
                        // Defer applying to the next game
                        this._pendingMistakeLimitValue = v;
                        this._mistakesSettingChangedDuringActiveGame = true;
                    }
                }
            };
            mistakesSlider.addEventListener('input', () => { sync(); this._showSavedToast && this._showSavedToast(); });
            mistakesSlider.addEventListener('change', () => {
                // Persist the chosen setting immediately so it survives reloads
                this.persistSettings && this.persistSettings();
                // If no active game, apply immediately; if in progress, defer until next game
                const inProgress = this.isGameInProgress && this.isGameInProgress();
                if (!inProgress) {
                    this.resetMistakes();
                    this.renderHealthBar && this.renderHealthBar();
                } else {
                    this._mistakesSettingChangedDuringActiveGame = true;
                }
            });
            // initialize display
            sync();
        }

        // Initialize standard tooltips (elements with data-tooltip)
        this._initTooltips && this._initTooltips();
        // Settings: theme + accent swatches + weekstart segmented + auto-advance
        const themeToggle = document.getElementById('theme-dark-toggle');
        const autoAdvanceToggle = document.getElementById('auto-advance-toggle');
        const applyTheme = () => {
            const isDark = !!(themeToggle && themeToggle.checked);
            document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
            // Update browser theme-color for PWA and browser UI
            try {
                let meta = document.querySelector('meta[name="theme-color"]');
                if (!meta) {
                    meta = document.createElement('meta');
                    meta.setAttribute('name', 'theme-color');
                    document.head.appendChild(meta);
                }
                meta.setAttribute('content', isDark ? '#0b1220' : '#667eea');
            } catch {}
        };
        const applyAccent = (v) => {
            const color = v || (document.querySelector('#accent-swatches .swatch[aria-checked="true"]')?.dataset.accent) || 'indigo';
            const map = {
                indigo: ['#6366f1', '#5558ee'],
                blue: ['#3b82f6', '#2563eb'],
                sky: ['#0ea5e9', '#0284c7'],
                teal: ['#14b8a6', '#0ea5a3'],
                emerald: ['#10b981', '#059669'],
                lime: ['#84cc16', '#65a30d'],
                amber: ['#f59e0b', '#d97706'],
                orange: ['#f97316', '#ea580c'],
                rose: ['#f43f5e', '#e11d48'],
                violet: ['#8b5cf6', '#7c3aed']
            };
            const [a1, a2] = map[color] || map.indigo;
            const root = document.documentElement;
            root.style.setProperty('--accent', a1);
            root.style.setProperty('--accent-600', a2);
            // also compute rgba ramps for CSS tokens
            try {
                const toRgb = (c) => {
                    if (c.startsWith('#')) {
                        const hex = c.slice(1);
                        const n = hex.length === 3 ? hex.split('').map(h => h + h).join('') : hex;
                        return [parseInt(n.slice(0,2),16), parseInt(n.slice(2,4),16), parseInt(n.slice(4,6),16)];
                    }
                    const m = c.match(/rgba?\(([^)]+)\)/i);
                    if (m) { const parts = m[1].split(',').map(x => parseFloat(x.trim())); return parts.slice(0,3); }
                    return null;
                };
                const rgb = toRgb(a1);
                if (rgb) {
                    const [r,g,b] = rgb;
                    const setA = (name, a) => root.style.setProperty(name, `rgba(${r},${g},${b},${a})`);
                    setA('--accent-0a', 0);
                    setA('--accent-05a', 0.05);
                    setA('--accent-10a', 0.10);
                    setA('--accent-12a', 0.12);
                    setA('--accent-15a', 0.15);
                    setA('--accent-18a', 0.18);
                    setA('--accent-22a', 0.22);
                    setA('--accent-25a', 0.25);
                    setA('--accent-28a', 0.28);
                    setA('--accent-30a', 0.30);
                    setA('--accent-32a', 0.32);
                    setA('--accent-35a', 0.35);
                    setA('--accent-45a', 0.45);
                    setA('--accent-55a', 0.55);
                }
            } catch {}
        };
        if (themeToggle) themeToggle.addEventListener('change', () => { applyTheme(); this.persistSettings && this.persistSettings(); });
        if (autoAdvanceToggle) autoAdvanceToggle.addEventListener('change', () => { this.persistSettings && this.persistSettings(); });
        // Zen mode toggle
        const zenToggle = document.getElementById('zen-mode-toggle');
        if (zenToggle) zenToggle.addEventListener('change', () => {
            this.applyZenMode && this.applyZenMode(zenToggle.checked);
            this.persistSettings && this.persistSettings();
            this._showSavedToast && this._showSavedToast();
        });
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
            document.getElementById('lives-limit') || document.getElementById('mistakes-limit'),
            document.getElementById('zen-mode-toggle')
        ];
        savedHooks.forEach(el => { if (el) el.addEventListener('change', () => this._showSavedToast()); });
        swatches.forEach(b => b.addEventListener('click', () => this._showSavedToast()));
        // Segmented control removed; avoid referencing undefined variable that would block listeners
        const statsOpen = document.getElementById('stats-btn');
        if (statsOpen && this.showStats) statsOpen.addEventListener('click', () => this.showStats());
        const statsClose = document.getElementById('stats-close');
        if (statsClose) statsClose.addEventListener('click', () => { const m = document.getElementById('stats-modal'); if (m) m.style.display = 'none'; this.resumeFromPause && this.resumeFromPause(); });
        
        // Number pad (include erase button which has data-number="0")
        document.querySelectorAll('.number-btn, #pad-erase-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // First real interaction via numpad should start the game
                this.ensureGameStarted && this.ensureGameStarted();
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
            // Secret dev-mode hotkey: Ctrl+Shift+D
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && key === 'd') {
                e.preventDefault();
                this._toggleDevPanel && this._toggleDevPanel();
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
                    this.updateTimerButton && this.updateTimerButton();
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
                    this._hasStarted = false;
                    this._pendingStart = false;
                    this._preStartElapsed = 0;
                    this.updateTimerButton && this.updateTimerButton();
                    // Reset undo/redo on difficulty start
                    this.history = [];
                    this.redoStack = [];
                    this.generatePuzzle(diff);
                    // Defer timer until first interaction
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
        // Keep icon in sync on load
        this.updateTimerButton && this.updateTimerButton();

        // Konami code unlock: Retro theme with CRT scanlines
        const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
        document.addEventListener('keydown', (e) => {
            try {
                this._konamiProgress.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
                if (this._konamiProgress.length > konami.length) this._konamiProgress.shift();
                const match = konami.every((k, i) => k === this._konamiProgress[i]);
                if (match) {
                    document.documentElement.classList.add('theme-retro');
                    this.showStatus && this.showStatus('Retro mode on.', 'info');
                }
            } catch {}
        });

        // Triple-click logo: pixel confetti + random accent
        const logo = document.querySelector('header h1');
        if (logo) {
            let clicks = 0; let timer = null;
            logo.addEventListener('click', () => {
                clicks += 1;
                clearTimeout(timer);
                timer = setTimeout(()=> { clicks = 0; }, 500);
                if (clicks >= 3) {
                    clicks = 0;
                    this._applyAccent();
                    this._burstConfettiAt && this._burstConfettiAt(logo.parentElement || logo);
                }
            });
        }

        // Alt+Click seeded input removed with header New Game

        // Dev panel toggle implementation (build lazily)
        this._toggleDevPanel = () => {
            let panel = document.getElementById('dev-panel');
            if (panel) { panel.classList.toggle('open'); return; }
            panel = document.createElement('div');
            panel.id = 'dev-panel';
            panel.className = 'dev-panel';
            panel.innerHTML = `
                <div class="dev-head">Dev Tools <button id="dev-close" title="Close">✕</button></div>
                <div class="dev-section">
                  <div class="dev-row"><button id="dev-retro" class="btn">Retro On</button><button id="dev-retro-off" class="btn">Retro Off</button></div>
                  <div class="dev-row"><button id="dev-confetti" class="btn">Confetti</button><button id="dev-accent" class="btn">Random Accent</button></div>
                  <div class="dev-row"><button id="dev-pi" class="btn">Pi Day</button><button id="dev-saber" class="btn">May 4</button><button id="dev-season-clear" class="btn">Season Off</button></div>
                  <div class="dev-row"><button id="dev-neon" class="btn">Neon Trail (10s)</button></div>
                  <div class="dev-row"><button id="dev-palin" class="btn">Palindrome Toast</button></div>
                  <div class="dev-row"><button id="dev-glow" class="btn">Rapid Glow (5s)</button><button id="dev-wiggle" class="btn">Wiggle</button></div>
                  <div class="dev-row"><button id="dev-rainbow" class="btn">Flag Rainbow Next</button></div>
                  <div class="dev-row">
                    <input id="dev-seed" placeholder="seed" class="dev-input" />
                    <select id="dev-seed-diff" class="dev-input">
                      <option>easy</option><option selected>medium</option><option>hard</option><option>expert</option><option>master</option><option>extreme</option>
                    </select>
                    <button id="dev-seed-go" class="btn">Start Seed</button>
                  </div>
                </div>
            `;
            document.body.appendChild(panel);
            const close = panel.querySelector('#dev-close'); if (close) close.addEventListener('click', () => panel.classList.remove('open'));
            // Wire actions
            panel.querySelector('#dev-retro')?.addEventListener('click', () => document.documentElement.classList.add('theme-retro'));
            panel.querySelector('#dev-retro-off')?.addEventListener('click', () => document.documentElement.classList.remove('theme-retro'));
            panel.querySelector('#dev-confetti')?.addEventListener('click', () => this._burstConfetti && this._burstConfetti());
            panel.querySelector('#dev-accent')?.addEventListener('click', () => this._applyAccent && this._applyAccent());
            panel.querySelector('#dev-pi')?.addEventListener('click', () => { document.documentElement.classList.add('theme-pi'); document.documentElement.classList.remove('theme-saber'); });
            panel.querySelector('#dev-saber')?.addEventListener('click', () => { document.documentElement.classList.add('theme-saber'); document.documentElement.classList.remove('theme-pi'); });
            panel.querySelector('#dev-season-clear')?.addEventListener('click', () => { document.documentElement.classList.remove('theme-pi','theme-saber'); });
            panel.querySelector('#dev-neon')?.addEventListener('click', () => { const board = document.getElementById('board'); if (board) { board.classList.add('neon-trail'); setTimeout(()=> board.classList.remove('neon-trail'), 10000); } });
            panel.querySelector('#dev-palin')?.addEventListener('click', () => this.showStatus && this.showStatus('Nice ordering.', 'info'));
            panel.querySelector('#dev-glow')?.addEventListener('click', () => { const b = document.getElementById('board'); if (b) { b.classList.add('board-glow'); setTimeout(()=> b.classList.remove('board-glow'), 5000); } });
            panel.querySelector('#dev-wiggle')?.addEventListener('click', () => { const b = document.getElementById('board'); if (b) { b.classList.add('board-wiggle'); setTimeout(()=> b.classList.remove('board-wiggle'), 600); } });
            panel.querySelector('#dev-rainbow')?.addEventListener('click', () => { try { localStorage.setItem('sudoku-rainbow-next','1'); this._applyRainbowDigitsIfFlag && this._applyRainbowDigitsIfFlag(); } catch {} });
            panel.querySelector('#dev-seed-go')?.addEventListener('click', async () => {
                const seed = String(panel.querySelector('#dev-seed')?.value || '').trim();
                const diff = String(panel.querySelector('#dev-seed-diff')?.value || 'medium');
                if (!seed) return;
                if (this.isGameInProgress && this.isGameInProgress()) {
                    const proceed = await this.showConfirm('Start seeded game? Current game will end and count as a loss.');
                    if (!proceed) return;
                    this.recordLoss();
                }
                this.isGameComplete = false; this.isGameOver = false; this.stopTimer();
                this.history = []; this.redoStack = [];
                this.updateModeIndicator && this.updateModeIndicator({ type: 'normal', difficulty: diff });
                this.generateSeeded && this.generateSeeded(seed, diff);
                this.updateDisplay && this.updateDisplay();
            });
            // open now
            requestAnimationFrame(()=> panel.classList.add('open'));
        };

        // Landing menu wiring
        const landing = document.getElementById('landing-overlay');
        if (landing) {
            // Greeting and auth state
            const greeting = document.getElementById('landing-greeting');
            const signinBtn = document.getElementById('landing-signin');
            const continueBtn = document.getElementById('landing-continue-btn');
            const calendarBtn = document.getElementById('landing-calendar-btn');
            const refreshGreeting = async () => {
                try {
                    if (typeof window !== 'undefined' && window.supabase) {
                        const { data: { user } } = await window.supabase.auth.getUser();
                        if (user) {
                            const name = user.user_metadata?.full_name || user.email || 'Player';
                            if (greeting) greeting.textContent = `Welcome back, ${name}!`;
                            if (signinBtn) signinBtn.style.display = 'none';
                        } else {
                            if (greeting) greeting.textContent = 'Welcome!';
                            if (signinBtn) signinBtn.style.display = '';
                        }
                    } else {
                        if (greeting) greeting.textContent = 'Welcome!';
                    }
                } catch {}
            };
            refreshGreeting();
            if (typeof window !== 'undefined' && window.supabase) {
                try { window.supabase.auth.onAuthStateChange(() => refreshGreeting()); } catch {}
            }
            if (signinBtn) signinBtn.addEventListener('click', () => {
                // Hide landing while auth flow starts; it may redirect away
                landing.style.display = 'none';
                this.loginWithGoogle && this.loginWithGoogle();
                // If sign-in is not configured and we show an info modal, restore landing after closing
                const ok = document.getElementById('confirm-ok');
                if (ok) ok.addEventListener('click', () => {
                    if (!this._hasStarted && !this._pendingStart) landing.style.display = 'flex';
                }, { once: true });
            });

            // Continue button visibility and action
            try {
                const saved = localStorage.getItem('sudoku-progress');
                if (continueBtn) continueBtn.style.display = saved ? '' : 'none';
            } catch { if (continueBtn) continueBtn.style.display = 'none'; }
            if (continueBtn) continueBtn.addEventListener('click', () => {
                // Resumes from storage and closes landing
                this.resumeFromStorage && this.resumeFromStorage();
                this.updateModeIndicator && this.updateModeIndicator({ type: 'normal', difficulty: (localStorage.getItem('sudoku-last-difficulty') || 'medium') });
                landing.style.display = 'none';
            });

            // Calendar opens daily calendar modal (hide landing while open)
            if (calendarBtn) calendarBtn.addEventListener('click', () => {
                landing.style.display = 'none';
                this.openCalendar ? this.openCalendar() : this.openDailyModal && this.openDailyModal();
                const closeBtn = document.getElementById('calendar-close');
                if (closeBtn) {
                    const onClose = () => {
                        if (!this._hasStarted && !this._pendingStart) landing.style.display = 'flex';
                    };
                    closeBtn.addEventListener('click', onClose, { once: true });
                }
            });

            // Daily button
            const dailyBtn = document.getElementById('landing-daily-btn');
            const dailyIcon = document.getElementById('landing-daily-icon');
            const dailyHint = document.getElementById('landing-daily-hint');
            const dailyComplete = document.getElementById('landing-daily-complete');
            const refreshDaily = () => {
                try {
                    const key = this.getUtcDateKey();
                    const diff = this.getDailyDifficulty();
                    const results = JSON.parse(localStorage.getItem('sudoku-daily-results') || '{}');
                    const done = !!(results && results[key] && results[key].completed);
                    if (dailyBtn) dailyBtn.setAttribute('data-diff', diff);
                    // Update icon tint by difficulty
                    if (dailyIcon) {
                        // Ensure centered SVG icon instead of text glyph
                        dailyIcon.innerHTML = this.getDifficultyIcon(diff);
                        dailyIcon.className = 'diff-icon';
                        dailyIcon.style = '';
                        const colorMap = {
                            easy: ['#047857','#a7f3d0'],
                            medium: ['#b45309','#fde68a'],
                            hard: ['#b91c1c','#fecaca'],
                            expert: ['#1e40af','#c7d2fe'],
                            master: ['#0ea5e9','#93c5fd'],
                            extreme: ['#7c3aed','#f0abfc']
                        };
                        const [fg,border] = colorMap[diff] || colorMap.medium;
                        dailyIcon.style.color = fg;
                        dailyIcon.style.borderColor = border;
                        dailyIcon.style.background = 'var(--surface)';
                    }
                    if (dailyHint) dailyHint.textContent = diff[0].toUpperCase()+diff.slice(1);
                    if (dailyBtn) dailyBtn.setAttribute('aria-disabled', done ? 'true' : 'false');
                    if (dailyComplete) dailyComplete.hidden = !done;
                } catch {}
            };
            if (dailyBtn) {
                refreshDaily();
                dailyBtn.addEventListener('click', async () => {
                    if (this.isGameInProgress && this.isGameInProgress()) {
                        const proceed = await this.showConfirm('Start Daily? Current game will end and count as a loss.');
                        if (!proceed) return;
                        this.recordLoss();
                    }
                    const diff = this.getDailyDifficulty();
                    // Starting from landing counts as game start (timer on immediate interaction)
                    this._hasStarted = true;
                    this.startTime = Date.now();
                    this.generateDaily(diff);
                    landing.style.display = 'none';
                    // After generation, update display
                    this.updateDisplay();
                    this.startTimer();
                });
            }

            // Difficulty selections
            // Normalize landing grid icons to use SVGs for perfect centering
            document.querySelectorAll('.diff-btn[data-diff]').forEach(btn => {
                const diff = btn.getAttribute('data-diff') || 'medium';
                const iconHost = btn.querySelector('.diff-icon');
                if (iconHost) iconHost.innerHTML = this.getDifficultyIcon(diff);
                btn.addEventListener('click', async () => {
                    const diff = btn.getAttribute('data-diff') || 'medium';
                    if (this.isGameInProgress && this.isGameInProgress()) {
                        const proceed = await this.showConfirm('Start a new game? Current game will end and count as a loss.');
                        if (!proceed) return;
                        this.recordLoss();
                    }
                    try { localStorage.setItem('sudoku-last-difficulty', diff); } catch {}
                    this.setDailyUiState && this.setDailyUiState(false);
                    this._activeDailyKey = null;
                    this.updateModeIndicator({ type: 'normal', difficulty: diff });
                    this.isGameComplete = false;
                    this.isGameOver = false;
                    const go = document.getElementById('gameover-overlay'); if (go) go.style.display = 'none';
                    const po = document.getElementById('pause-overlay'); if (po) po.style.display = 'none';
                    this.lockedNumber = null;
                    document.querySelectorAll('.number-btn, #pad-erase-btn').forEach(b => b.classList.remove('active'));
                    if (this.selectedCell) { this.selectedCell.classList.remove('selected'); this.selectedCell = null; }
                    document.querySelectorAll('.cell.highlighted').forEach(cell => cell.classList.remove('highlighted'));
                    this.stopTimer();
                    this.startTime = null; this.isPaused = false; this._pauseStartedAt = null; this._elapsedBeforePause = 0; this._hasStarted = false; this._pendingStart = false; this._preStartElapsed = 0;
                    this.history = []; this.redoStack = [];
                    // Starting from landing counts as game start (timer on immediate interaction)
                    this._hasStarted = true;
                    this.startTime = Date.now();
                    this.generatePuzzle(diff);
                    this.updateDisplay();
                    landing.style.display = 'none';
                    this.startTimer();
                });
            });

            // Bottom shortcuts
            const openSettings = document.getElementById('landing-settings');
            if (openSettings) openSettings.addEventListener('click', () => {
                const m = document.getElementById('settings-modal');
                if (m) {
                    landing.style.display = 'none';
                    m.style.display = 'block';
                    const closeBtn = document.getElementById('settings-close');
                    if (closeBtn) closeBtn.addEventListener('click', () => {
                        if (!this._hasStarted && !this._pendingStart) landing.style.display = 'flex';
                    }, { once: true });
                }
            });
            const openStats = document.getElementById('landing-stats');
            if (openStats) openStats.addEventListener('click', () => {
                landing.style.display = 'none';
                this.showStats && this.showStats();
                const closeBtn = document.getElementById('stats-close');
                if (closeBtn) closeBtn.addEventListener('click', () => {
                    if (!this._hasStarted && !this._pendingStart) landing.style.display = 'flex';
                }, { once: true });
            });
        }
    }

    /**
     * Standard tooltip initializer for elements with `data-tooltip`.
     * Creates a single floating tooltip element and reuses it.
     */
    _initTooltips() {
        if (this._tooltipsInitialized) return;
        this._tooltipsInitialized = true;

        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'app-tooltip';
        tooltipEl.hidden = true;
        document.body.appendChild(tooltipEl);

        let hideTimer = null;

        const positionTooltip = (target) => {
            const rect = target.getBoundingClientRect();
            const gap = 8;
            tooltipEl.style.left = '0px'; // reset before measure
            tooltipEl.style.top = '0px';
            const { width: tw, height: th } = tooltipEl.getBoundingClientRect();

            let left = Math.max(8, Math.min(rect.left + rect.width / 2 - tw / 2, window.innerWidth - tw - 8));
            let top = rect.bottom + gap;
            if (top + th > window.innerHeight - 8) {
                top = rect.top - th - gap;
            }
            tooltipEl.style.left = `${Math.round(left)}px`;
            tooltipEl.style.top = `${Math.round(top)}px`;
        };

        const show = (target) => {
            const text = target.getAttribute('data-tooltip');
            if (!text) return;
            tooltipEl.textContent = text;
            tooltipEl.hidden = false;
            positionTooltip(target);
        };

        const hide = () => {
            tooltipEl.hidden = true;
        };

        const attach = (el) => {
            el.addEventListener('mouseenter', () => {
                if (hideTimer) clearTimeout(hideTimer);
                show(el);
            });
            el.addEventListener('mouseleave', () => {
                hideTimer = setTimeout(hide, 20);
            });
            el.addEventListener('focus', () => show(el));
            el.addEventListener('blur', hide);
            el.addEventListener('pointerdown', hide);
        };

        document.querySelectorAll('[data-tooltip]').forEach(attach);
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

    // Simple info modal (OK-only) reusing confirm modal structure
    showInfo(message, { title = 'Notice', okText = 'OK' } = {}) {
        return new Promise(resolve => {
            const modal = document.getElementById('confirm-modal');
            const content = modal?.querySelector('.modal-content');
            const titleEl = document.getElementById('confirm-title');
            const msgEl = document.getElementById('confirm-message');
            const okBtn = document.getElementById('confirm-ok');
            const cancelBtn = document.getElementById('confirm-cancel');
            if (!modal || !content || !titleEl || !msgEl || !okBtn || !cancelBtn) {
                // Fallback gracefully
                window.alert(message);
                resolve(true);
                return;
            }
            titleEl.textContent = title;
            msgEl.textContent = message;
            okBtn.textContent = okText;
            const prevCancelDisplay = cancelBtn.style.display;
            cancelBtn.style.display = 'none';
            modal.style.display = 'block';
            const previouslyFocused = document.activeElement;
            const cleanup = () => {
                modal.style.display = 'none';
                okBtn.removeEventListener('click', onOk);
                modal.removeEventListener('click', onBackdrop);
                document.removeEventListener('keydown', onKey);
                cancelBtn.style.display = prevCancelDisplay || '';
                previouslyFocused && previouslyFocused.focus && previouslyFocused.focus();
            };
            const onOk = () => { cleanup(); resolve(true); };
            const onBackdrop = (e) => { if (e.target === modal) { onOk(); } };
            const onKey = (e) => {
                if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); onOk(); }
                if (e.key === 'Tab') {
                    // Focus trap to OK button only
                    if (document.activeElement !== okBtn) { e.preventDefault(); okBtn.focus(); }
                }
            };
            okBtn.addEventListener('click', onOk);
            modal.addEventListener('click', onBackdrop);
            document.addEventListener('keydown', onKey);
            setTimeout(() => { okBtn.focus(); }, 0);
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
                return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"><circle cx="8" cy="8" r="6" fill="currentColor"/></svg>';
            case 'medium':
                return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"><polygon points="8,3 14,13 2,13" fill="currentColor"/></svg>';
            case 'hard':
                return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"><rect x="3" y="3" width="10" height="10" fill="currentColor"/></svg>';
            case 'expert':
                return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"><polygon points="8,2 13,5 13,11 8,14 3,11 3,5" fill="currentColor"/></svg>';
            case 'master':
                // Octagon to increase complexity over hexagon
                return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"><polygon points="6,1 10,1 15,6 15,10 10,15 6,15 1,10 1,6" fill="currentColor"/></svg>';
            case 'extreme':
                // 5-point star for highest difficulty
                return '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"><polygon points="8,0.6 10.9,4.4 15.6,5.4 12.1,9.0 13.2,14.0 8,11.7 2.8,14.0 3.9,9.0 0.4,5.4 5.1,4.4" fill="currentColor"/></svg>';
            default:
                return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"><circle cx="8" cy="8" r="6" fill="currentColor"/></svg>';
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
        results[activeKey] = { completed: true, elapsed, difficulty: diff, mistakes: this.mistakesCount, hints: this.hintsUsed };
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
        // First real interaction should start the game/timer
        this.ensureGameStarted && this.ensureGameStarted();
        // Enforce hint limits if finite
        if (Number.isFinite(this.hintsLimit) && this.hintsUsed >= this.hintsLimit) {
            this.showStatus('No hints left', 'error');
            this.updateHintUi && this.updateHintUi();
            return;
        }
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.board[r][c] === 0) {
                    this.setCellValue(r, c, this.solution[r][c], 'hint');
                    this.hintsUsed = (this.hintsUsed || 0) + 1;
                    if (this.hintPenaltySeconds) {
                        // Apply time penalty by shifting start time backward
                        if (this.startTime) {
                            this.startTime -= this.hintPenaltySeconds * 1000;
                        }
                        this.updateTimer && this.updateTimer();
                        this.showStatus(`Hint used (+${this.hintPenaltySeconds}s)`, 'info');
                    } else {
                        this.showStatus('Hint used', 'info');
                    }
                    this.updateHintUi && this.updateHintUi();
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
            this.updateTimerButton && this.updateTimerButton();
        } else {
            // Resuming
            this.startTimer();
            this.updateTimerButton && this.updateTimerButton();
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
        this.updateTimerButton && this.updateTimerButton();
    }

    // Resume helper for closing modals (settings/stats)
    resumeFromPause() {
        const overlay = document.getElementById('pause-overlay');
        if (!overlay) return;
        const isShowing = overlay.style.display !== 'none' && overlay.style.display !== '';
        if (this.isPaused || isShowing) {
            overlay.style.display = 'none';
            this.startTimer();
            this.updateTimerButton && this.updateTimerButton();
        }
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
    getElapsedSeconds() {
        if (!this._hasStarted) return 0;
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
    persistToStorage() {
        const elapsed = this._hasStarted ? this.getElapsedSeconds() : (this._pendingStart ? this._preStartElapsed : 0);
        const data = { board: this.board, solution: this.solution, initialBoard: this.initialBoard, elapsed, difficulty: document.getElementById('difficulty').value, hintsUsed: this.hintsUsed, hintsLimit: this.hintsLimit };
        try { localStorage.setItem('sudoku-progress', JSON.stringify(data)); } catch {}
    }
    persistSettings() {
        // Persist slider-chosen lives limit even if we defer applying it mid-game (back-compat ID)
        const mlEl = document.getElementById('lives-limit') || document.getElementById('mistakes-limit');
        let storedMistakeLimit;
        if (mlEl) {
            if (mlEl.disabled && typeof this._userMistakeRestoreValue === 'number') {
                storedMistakeLimit = this._userMistakeRestoreValue;
            } else {
                storedMistakeLimit = parseInt(mlEl.value);
            }
        } else {
            storedMistakeLimit = (this.livesLimit === Infinity ? 11 : this.livesLimit);
        }
        const settings = {
            autoCandidates: !!(document.getElementById('auto-candidates-toggle')?.checked),
            autoAdvance: !!(document.getElementById('auto-advance-toggle')?.checked),
            zenMode: !!(document.getElementById('zen-mode-toggle')?.checked),
            livesEnabled: !(storedMistakeLimit >= 11),
            livesLimit: storedMistakeLimit,
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
            // Resume elapsed time but defer actual game start until first interaction
            this._preStartElapsed = Math.max(0, parseInt(data.elapsed || 0, 10));
            this._pendingStart = true;
            this._hasStarted = false;
            this.startTime = null;
            // Restore hints state if present
            this.hintsUsed = data.hintsUsed || 0;
            this.hintsLimit = (Number.isFinite(data.hintsLimit) ? data.hintsLimit : this.hintsLimit);
            this.updateDisplay();
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
            const ml = document.getElementById('lives-limit') || document.getElementById('mistakes-limit'); const mlv = document.getElementById('lives-limit-value') || document.getElementById('mistakes-limit-value');
            const limitValue = (typeof s.livesLimit === 'number') ? s.livesLimit : (typeof s.mistakeLimit === 'number' ? s.mistakeLimit : undefined);
            if (ml && typeof limitValue === 'number') {
                ml.value = limitValue;
                if (mlv) mlv.textContent = limitValue >= 11 ? 'Unlimited' : String(limitValue);
                const inProgress = this.isGameInProgress && this.isGameInProgress();
                if (!inProgress) {
                    this.livesLimit = limitValue >= 11 ? Infinity : limitValue;
                    this.livesEnabled = !(limitValue >= 11);
                } else {
                    // Defer applying storage-restored limit if game is in progress
                    this._pendingMistakeLimitValue = limitValue;
                }
            }
            const themeToggle = document.getElementById('theme-dark-toggle'); if (themeToggle) themeToggle.checked = !!s.themeDark;
            const zenToggle = document.getElementById('zen-mode-toggle'); if (zenToggle) zenToggle.checked = !!s.zenMode;
            const weekToggle = document.getElementById('weekstart-toggle');
            if (weekToggle && s.weekstart) { weekToggle.setAttribute('aria-checked', s.weekstart === 'monday' ? 'true' : 'false'); }
            const swatches = document.querySelectorAll('#accent-swatches .swatch');
            if (swatches && s.accent) {
                swatches.forEach(b => b.setAttribute('aria-checked', b.dataset.accent === s.accent ? 'true' : 'false'));
            }
            // Apply values to document
            const isDark = !!s.themeDark;
            document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
            try {
                let meta = document.querySelector('meta[name="theme-color"]');
                if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'theme-color'); document.head.appendChild(meta); }
                meta.setAttribute('content', isDark ? '#0b1220' : '#667eea');
            } catch {}
            if (s.accent) { applyAccent(s.accent); }
            if (s.autoCandidates) {
                // Ensure candidates are visible after restoring settings
                this.recomputeAllCandidates();
            }
            // Ensure hearts reflect restored settings and apply Zen
            this.applyZenMode && this.applyZenMode(!!s.zenMode);
            this.renderHealthBar();
            // Update calendar headers after loading settings
            this.refreshCalendarHeaders && this.refreshCalendarHeaders();
        } catch {}
    }
    recordWin() {
        if (this._zenMode) return false;
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
        // Do not update best time if any hint was used (assisted)
        let newBest = false;
        if ((this.hintsUsed || 0) === 0) {
            if (!best || elapsed < best) { stats.bestTimes[diff] = elapsed; newBest = true; }
        }
        try {
            stats.updatedAt = new Date().toISOString();
            localStorage.setItem('sudoku-stats', JSON.stringify(stats));
        } catch {}
        // Attempt background sync (non-blocking)
        this.syncRemoteStats && this.syncRemoteStats();
        return newBest;
    }

    recordLoss() {
        if (this._zenMode) return;
        // Only count a loss if the user actually made a move in this run
        if (!this._hasMadeMove) return;
        const stats = JSON.parse(localStorage.getItem('sudoku-stats') || '{}');
        // attribute loss to current mode/difficulty
        const diff = (this._activeDailyKey ? (JSON.parse(localStorage.getItem(`sudoku-daily-${this._activeDailyKey}`)||'{}').difficulty || this.getDailyDifficulty()) : (document.getElementById('difficulty')?.value || localStorage.getItem('sudoku-last-difficulty') || 'medium'));
        stats.totalLosses = (stats.totalLosses || 0) + 1;
        stats.totalCompleted = (stats.totalCompleted || 0) + 1; // includes wins and losses
        stats.byDifficulty = stats.byDifficulty || {};
        const slot = stats.byDifficulty[diff] = stats.byDifficulty[diff] || { played: 0, wins: 0 };
        slot.played += 1;
        try {
            stats.updatedAt = new Date().toISOString();
            localStorage.setItem('sudoku-stats', JSON.stringify(stats));
        } catch {}
        this.syncRemoteStats && this.syncRemoteStats();
    }
    showStats() {
        // Auto-pause when opening stats
        this.autoPauseOnBlur && this.autoPauseOnBlur();
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
            // Also clear remote stats if logged in
            try {
                if (typeof window !== 'undefined' && window.supabase) {
                    const { data: { user } } = await window.supabase.auth.getUser();
                    if (user) {
                        await window.supabase.from('stats').delete().eq('user_id', user.id);
                    }
                }
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
