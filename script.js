class SudokuGame {
    constructor() {
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
        this.touchMode = (navigator.maxTouchPoints || 0) > 0;
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

        // Mistakes control
        this.mistakesEnabled = false;
        this.mistakeLimit = 3;
        this.mistakesCount = 0;
        this.lastWrongValues = Array(9).fill().map(() => Array(9).fill(null));
        this.isGameOver = false;
        
        this.initializeGame();
        this.setupEventListeners();
        // Try to resume saved progress and settings
        this.resumeSettings && this.resumeSettings();
        this.resumeFromStorage && this.resumeFromStorage();

        // Seed calendar and daily state
        this._calendarRefMonth = new Date();
        this._activeDailyKey = null;
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
            'expert': 60
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
        // Enforce fixed mistake limits in Daily; enable slider otherwise
        const slider = document.getElementById('mistakes-limit');
        const label = document.getElementById('mistakes-limit-value');
        const note = document.getElementById('mistakes-daily-note');
        const map = { easy: 5, medium: 4, hard: 3, expert: 2 };
        if (isDaily) {
            const lim = map[difficulty] ?? 3;
            this.mistakesEnabled = true;
            this.mistakeLimit = lim;
            if (slider) { slider.value = String(lim); slider.disabled = true; }
            if (label) label.textContent = String(lim);
            if (note) note.style.display = 'block';
        } else {
            if (slider) slider.disabled = false;
            if (note) note.style.display = 'none';
        }
        this.resetMistakes();
        this.renderHealthBar();
    }

    generateDaily(difficulty) {
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
        const cellsToRemove = { easy: 30, medium: 40, hard: 50, expert: 60 };
        removeSymUnique(cellsToRemove[difficulty] || 40);
        this.initialBoard = this.board.map(r => [...r]);
        this.updateDisplay();
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
    loadDailyByKey(key, difficulty) {
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
                    this.updateModeIndicator({ type: 'daily', difficulty: data.difficulty || difficulty, dateKey: key });
                    return;
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
        const cellsToRemove = { easy: 30, medium: 40, hard: 50, expert: 60 };
        const diff = difficulty || this.getDifficultyForDateKey(key);
        removeSymUnique(cellsToRemove[diff] || 40);
        this.initialBoard = this.board.map(r => [...r]);
        this.updateDisplay();
        this.setDailyUiState(true, diff);
        this.renderHealthBar();
        try { localStorage.setItem(storeKey, JSON.stringify({ board: this.board, solution: this.solution, difficulty: diff })); } catch {}
        this._activeDailyKey = key;
        this.updateModeIndicator({ type: 'daily', difficulty: diff, dateKey: key });
    }

    getDifficultyForDateKey(key) {
        // Map weekday to difficulty by UTC weekday for the provided key
        const dt = this.parseUtcKeyToDate(key);
        const day = dt.getUTCDay();
        const map = ['expert','easy','medium','medium','hard','hard','expert'];
        return map[day] || 'medium';
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
        
        // If a number is locked, placing it on click (or erase if 0)
        if (this.lockedNumber !== null && !cell.readOnly) {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);
            const v = this.lockedNumber;
            if (this.isNotesMode && v > 0) {
                this.toggleNote(r, c, v);
            } else {
                this.setCellValue(r, c, v, 'locked-number');
                this.checkGameComplete();
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
        // record history
        this.history.push({ type: 'value', row, col, oldValue, newValue: value });
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
    }

    undo() {
        const last = this.history.pop();
        if (!last) return;
        if (last.type === 'value') {
            const { row, col, oldValue, newValue } = last;
            this.board[row][col] = oldValue;
            this.updateCellDisplay(row, col);
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
    }

    redo() {
        const next = this.redoStack.pop();
        if (!next) return;
        if (next.type === 'value') {
            const { row, col, oldValue, newValue } = next;
            this.board[row][col] = newValue;
            this.updateCellDisplay(row, col);
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
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            this.updateTimer();
        }, 1000);
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
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
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
        this.generatePuzzle(difficulty);
        this.startTimer();
        this.updateDisplay();
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
        // Map weekday to difficulty (Mon..Sun: 1..7)
        const day = new Date().getUTCDay(); // 0=Sun..6=Sat
        const map = ['expert','easy','medium','medium','hard','hard','expert'];
        return map[day] || 'medium';
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

    rerollDailyOnce(fromModal = false) {
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
        this.generateDaily(diff);
        delete this._rerollSuffix;

        if (fromModal) {
            const m = document.getElementById('daily-modal');
            if (m) m.style.display = 'none';
            if (this._dailyModalTimer) clearInterval(this._dailyModalTimer);
        }
        this.showStatus('Daily rerolled', 'success');
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
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
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
            ['menu-archive', () => this.openArchive()],
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
        const helpClose = document.getElementById('help-close');
        if (helpClose) helpClose.addEventListener('click', () => { document.getElementById('help-modal').style.display = 'none'; });
        const dailyClose = document.getElementById('daily-close');
        if (dailyClose) dailyClose.addEventListener('click', () => { const m = document.getElementById('daily-modal'); if (m) m.style.display = 'none'; if (this._dailyModalTimer) clearInterval(this._dailyModalTimer); });
        const dailyStart = document.getElementById('daily-start');
        if (dailyStart) dailyStart.addEventListener('click', () => { const diff = this.getDailyDifficulty(); this.generateDaily(diff); const m = document.getElementById('daily-modal'); if (m) m.style.display = 'none'; if (this._dailyModalTimer) clearInterval(this._dailyModalTimer); });
        const dailyReroll = document.getElementById('daily-reroll');
        if (dailyReroll) dailyReroll.addEventListener('click', () => this.rerollDailyOnce(true));
        const archiveClose = document.getElementById('archive-close');
        if (archiveClose) archiveClose.addEventListener('click', () => { const m = document.getElementById('archive-modal'); if (m) m.style.display = 'none'; });
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
        if (mistakesSlider && mistakesValue) {
            const sync = () => {
                const v = parseInt(mistakesSlider.value);
                if (v >= 11) { // unlimited/off
                    mistakesValue.textContent = 'Unlimited';
                    this.mistakesEnabled = false;
                    this.mistakeLimit = Infinity;
                } else {
                    mistakesValue.textContent = String(v);
                    this.mistakesEnabled = true;
                    this.mistakeLimit = v;
                }
            };
            mistakesSlider.addEventListener('input', sync);
            mistakesSlider.addEventListener('change', () => { this.resetMistakes(); this.persistSettings && this.persistSettings(); });
            // initialize display
            sync();
        }
        // Settings: theme + accent + weekstart + auto-advance
        const themeToggle = document.getElementById('theme-dark-toggle');
        const accentSelect = document.getElementById('accent-select');
        const weekstartSelect = document.getElementById('weekstart-select');
        const autoAdvanceToggle = document.getElementById('auto-advance-toggle');
        const applyTheme = () => {
            document.documentElement.dataset.theme = themeToggle && themeToggle.checked ? 'dark' : 'light';
        };
        const applyAccent = () => {
            const v = (accentSelect && accentSelect.value) || 'indigo';
            // Map accents to HSLs; update CSS variables at root
            const map = {
                indigo: ['#6366f1', '#5558ee'],
                teal: ['#14b8a6', '#0ea5a3'],
                rose: ['#f43f5e', '#e11d48'],
            };
            const [a1, a2] = map[v] || map.indigo;
            document.documentElement.style.setProperty('--accent', a1);
            document.documentElement.style.setProperty('--accent-600', a2);
        };
        if (themeToggle) themeToggle.addEventListener('change', () => { applyTheme(); this.persistSettings && this.persistSettings(); });
        if (accentSelect) accentSelect.addEventListener('change', () => { applyAccent(); this.persistSettings && this.persistSettings(); });
        if (weekstartSelect) weekstartSelect.addEventListener('change', () => { this.persistSettings && this.persistSettings(); this.refreshCalendarHeaders && this.refreshCalendarHeaders(); this.renderCalendar && this.renderCalendar(); });
        if (autoAdvanceToggle) autoAdvanceToggle.addEventListener('change', () => { this.persistSettings && this.persistSettings(); });
        // Initialize from persisted settings if present
        applyTheme(); applyAccent();
        const statsOpen = document.getElementById('stats-btn');
        if (statsOpen && this.showStats) statsOpen.addEventListener('click', () => this.showStats());
        const statsClose = document.getElementById('stats-close');
        if (statsClose) statsClose.addEventListener('click', () => { const m = document.getElementById('stats-modal'); if (m) m.style.display = 'none'; });
        
        // Number pad
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const number = parseInt(btn.dataset.number);
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
                // Lock number mode: clicking a number locks it for repeated placement
                const isAlreadyActive = btn.classList.contains('active');
                document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('active'));
                if (isAlreadyActive) {
                    // Toggle off
                    this.lockedNumber = null;
                } else {
                    if (number > 0) {
                        this.lockedNumber = number;
                        btn.classList.add('active');
                    } else {
                        this.lockedNumber = 0; // erase mode
                        btn.classList.add('active');
                    }
                }
                this.syncNotesBadgeState();
            });
        });
        
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
                document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('active'));
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
                item.addEventListener('click', () => {
                    const diff = item.getAttribute('data-diff');
                    try { localStorage.setItem('sudoku-last-difficulty', diff); } catch {}
                    this.updateModeIndicator({ type: 'normal', difficulty: diff });
                    // Update the icons inside the popover to match new colorful style
                    // (no-op here; icons are styled via CSS)
                    newPopover.hidden = true; newPopover.style.display = 'none';
                    this.setDailyUiState && this.setDailyUiState(false);
                    this.stopTimer();
                    this.generatePuzzle(diff);
                    this.startTimer();
                    this.updateDisplay();
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
        const weekstart = (document.getElementById('weekstart-select')?.value) || (JSON.parse(localStorage.getItem('sudoku-settings')||'{}').weekstart) || 'sunday';
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
            chip.textContent = this.getDifficultyIcon(diff);

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
        const weekstart = (document.getElementById('weekstart-select')?.value) || (JSON.parse(localStorage.getItem('sudoku-settings')||'{}').weekstart) || 'sunday';
        const days = weekstart === 'monday' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        wrap.innerHTML = days.map(d => `<div>${d}</div>`).join('');
    }

    getDifficultyIcon(diff) {
        // Use glyphs consistent with dropdown icons
        switch (diff) {
            case 'easy': return '●'; // circle
            case 'medium': return '▲'; // triangle
            case 'hard': return '■'; // square
            case 'expert': return '⬢'; // hexagon
            default: return '●';
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
        if (show) { this.stopTimer(); } else { this.startTimer(); }
    }

    autoPauseOnBlur() {
        const overlay = document.getElementById('pause-overlay');
        if (!overlay) return;
        overlay.style.display = 'flex';
        this.stopTimer();
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
            weekstart: document.getElementById('weekstart-select')?.value || 'sunday',
            accent: document.getElementById('accent-select')?.value || 'indigo',
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
            if (ml && mlv && typeof s.mistakeLimit === 'number') {
                ml.value = s.mistakeLimit;
                if (s.mistakeLimit >= 11) { mlv.textContent = 'Unlimited'; this.mistakeLimit = Infinity; this.mistakesEnabled = false; }
                else { mlv.textContent = s.mistakeLimit; this.mistakeLimit = s.mistakeLimit; this.mistakesEnabled = true; }
            }
            const themeToggle = document.getElementById('theme-dark-toggle'); if (themeToggle) themeToggle.checked = !!s.themeDark;
            const weekstartSelect = document.getElementById('weekstart-select'); if (weekstartSelect && s.weekstart) weekstartSelect.value = s.weekstart;
            const accentSelect = document.getElementById('accent-select'); if (accentSelect && s.accent) accentSelect.value = s.accent;
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
            // Update calendar headers after loading settings
            this.refreshCalendarHeaders && this.refreshCalendarHeaders();
        } catch {}
    }
    recordWin() {
        const diff = document.getElementById('difficulty')?.value || 'medium';
        const elapsed = this.getElapsedSeconds();
        const stats = JSON.parse(localStorage.getItem('sudoku-stats') || '{}');
        stats.totalWins = (stats.totalWins || 0) + 1;
        stats.totalCompleted = (stats.totalCompleted || 0) + 1; // includes wins and losses
        stats.bestTimes = stats.bestTimes || {};
        const best = stats.bestTimes[diff];
        if (!best || elapsed < best) stats.bestTimes[diff] = elapsed;
        try { localStorage.setItem('sudoku-stats', JSON.stringify(stats)); } catch {}
    }

    recordLoss() {
        const stats = JSON.parse(localStorage.getItem('sudoku-stats') || '{}');
        stats.totalLosses = (stats.totalLosses || 0) + 1;
        stats.totalCompleted = (stats.totalCompleted || 0) + 1; // includes wins and losses
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
        const winRatio = totalCompleted > 0 ? Math.round((totalWins / totalCompleted) * 100) : 0;
        const fmt = (s) => typeof s === 'number' ? `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}` : '-';
        const dailyResults = JSON.parse(localStorage.getItem('sudoku-daily-results') || '{}');
        const streak = localStorage.getItem('sudoku-daily-streak') || '0';
        const dailyCount = Object.keys(dailyResults).length;
        const rows = Object.keys(dailyResults).sort().reverse().slice(0, 10).map(k => {
            const r = dailyResults[k];
            return `<div>${k.slice(0,4)}-${k.slice(4,6)}-${k.slice(6)} (${r.difficulty}): ${fmt(r.elapsed)} | mistakes: ${r.mistakes}</div>`;
        }).join('');
        content.innerHTML = `
            <div>Total Played: ${totalCompleted} &nbsp;|&nbsp; Wins: ${totalWins} &nbsp;|&nbsp; Losses: ${totalLosses} &nbsp;|&nbsp; Win Ratio: ${winRatio}%</div>
            <div>Best Times:
              <div>Easy: ${fmt(best.easy)}</div>
              <div>Medium: ${fmt(best.medium)}</div>
              <div>Hard: ${fmt(best.hard)}</div>
              <div>Expert: ${fmt(best.expert)}</div>
            </div>
            <hr/>
            <div>Daily: ${dailyCount} completed | Streak: ${streak}</div>
            ${rows}
        `;
        modal.style.display = 'block';
    }

    openArchive() {
        const modal = document.getElementById('archive-modal');
        const list = document.getElementById('archive-list');
        if (!modal || !list) return;
        const results = JSON.parse(localStorage.getItem('sudoku-daily-results') || '{}');
        const keys = Object.keys(results).sort().reverse();
        list.innerHTML = keys.slice(0, 50).map(k => {
            const r = results[k];
            const label = `${k.slice(0,4)}-${k.slice(4,6)}-${k.slice(6)} (${r.difficulty})`;
            return `<div class="archive-item"><span>${label}</span><button data-date="${k}">Load</button></div>`;
        }).join('') || '<div>No dailies yet. Play today\'s to start building your archive!</div>';
        list.querySelectorAll('button[data-date]').forEach(btn => {
            btn.addEventListener('click', () => {
                const k = btn.getAttribute('data-date');
                const cacheKey = `sudoku-daily-${k}`;
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    try { const data = JSON.parse(cached); this.board = data.board; this.solution = data.solution; this.initialBoard = data.board.map(row => [...row]); this.updateDisplay(); this._activeDailyKey = k; this.setDailyUiState(true, data.difficulty || this.getDifficultyForDateKey(k)); } catch {}
                } else {
                    this.showStatus('Cached board not found for that date', 'error');
                }
                modal.style.display = 'none';
            });
        });
        modal.style.display = 'block';
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});
