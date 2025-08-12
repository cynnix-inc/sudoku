// Stats and persistence helpers operating on a game instance.

export function getElapsedSeconds(game) {
  if (!game._hasStarted) return 0;
  if (!game.startTime) return 0;
  return Math.floor((Date.now() - game.startTime) / 1000);
}

export function persistToStorage(game) {
  const elapsed = game._hasStarted ? getElapsedSeconds(game) : (game._pendingStart ? game._preStartElapsed : 0);
  const diffEl = typeof document !== 'undefined' ? document.getElementById('difficulty') : null;
  const data = {
    board: game.board,
    solution: game.solution,
    initialBoard: game.initialBoard,
    elapsed,
    difficulty: diffEl ? diffEl.value : 'medium',
    hintsUsed: game.hintsUsed,
    hintsLimit: game.hintsLimit,
    gameType: game.gameType || 'classic',
  };
  try { localStorage.setItem('sudoku-progress', JSON.stringify(data)); } catch {}
}

export function persistSettings(game) {
  const mlEl = document.getElementById('lives-limit') || document.getElementById('mistakes-limit');
  let storedMistakeLimit;
  if (mlEl) {
    if (mlEl.disabled && typeof game._userMistakeRestoreValue === 'number') storedMistakeLimit = game._userMistakeRestoreValue;
    else storedMistakeLimit = parseInt(mlEl.value);
  } else {
    storedMistakeLimit = (game.livesLimit === Infinity ? 11 : game.livesLimit);
  }
  const settings = {
    autoCandidates: !!(document.getElementById('auto-candidates-toggle')?.checked),
    autoAdvance: !!(document.getElementById('auto-advance-toggle')?.checked),
    zenMode: !!(document.getElementById('zen-mode-toggle')?.checked),
    // Idle auto‑pause controls
    idleAutoPause: !!(document.getElementById('idle-autopause-toggle')?.checked),
    idleTimeoutSec: parseInt(document.getElementById('idle-timeout-slider')?.value || '120', 10),
    livesEnabled: !(storedMistakeLimit >= 11),
    livesLimit: storedMistakeLimit,
    themeDark: !!(document.getElementById('theme-dark-toggle')?.checked),
    weekstart: ((document.getElementById('weekstart-toggle')?.getAttribute('aria-checked') === 'true') ? 'monday' : 'sunday') || 'sunday',
    calendarOnlyPlayable: !!(document.getElementById('calendar-filter-playable-settings')?.checked),
    calendarOnlyIncomplete: !!(document.getElementById('calendar-filter-incomplete-settings')?.checked),
    accent: (document.querySelector('#accent-swatches .swatch[aria-checked="true"]')?.dataset.accent) || 'indigo',
    hintMode: (document.getElementById('hint-mode-select')?.value) || 'direct',
    // Board sizing
    gridSize: parseInt(document.getElementById('grid-size-slider')?.value || '2', 10),
    digitSize: parseInt(document.getElementById('digit-size-slider')?.value || '3', 10),
    noteSize: parseInt(document.getElementById('note-size-slider')?.value || '3', 10),
    updatedAt: new Date().toISOString(),
  };
  try { localStorage.setItem('sudoku-settings', JSON.stringify(settings)); } catch {}
  // If signed in, sync gameplay + calendar preferences to cloud (not appearance)
  try { game.syncRemoteSettings && game.syncRemoteSettings(); } catch {}
  // Apply idle settings immediately
  try {
    game._idleAutoPause = !!settings.idleAutoPause;
    const sec = Number.isFinite(settings.idleTimeoutSec) ? settings.idleTimeoutSec : 120;
    game._idleTimeoutMs = Math.max(30, sec) * 1000;
    if (typeof game._initIdleDetection === 'function') game._initIdleDetection();
  } catch {}
  // Apply zen/lives slider UI state immediately as well
  try {
    const zenToggle = document.getElementById('zen-mode-toggle');
    const isZen = !!(zenToggle && zenToggle.checked);
    const slider = document.getElementById('lives-limit') || document.getElementById('mistakes-limit');
    const labelEl = slider && slider.previousElementSibling && slider.previousElementSibling.classList && slider.previousElementSibling.classList.contains('control-label') ? slider.previousElementSibling : null;
    const label = document.getElementById('lives-limit-value') || document.getElementById('mistakes-limit-value');
    const pill = document.getElementById('lives-limit-pill') || document.getElementById('mistakes-limit-pill');
    if (isZen) {
      if (slider) { slider.disabled = true; slider.value = '11'; try { slider.setAttribute('aria-disabled', 'true'); } catch {} }
      try { if (labelEl) labelEl.setAttribute('data-label-disabled','true'); } catch {}
      if (label) label.textContent = 'Unlimited';
      if (pill) pill.textContent = '∞';
      game.livesEnabled = false; game.livesLimit = Infinity;
    } else if (slider) {
      slider.disabled = false; try { slider.setAttribute('aria-disabled', 'false'); } catch {}
      try { if (labelEl) labelEl.setAttribute('data-label-disabled','false'); } catch {}
      const v = parseInt(slider.value || '3', 10);
      if (label) label.textContent = v >= 11 ? 'Unlimited' : String(v);
      if (pill) pill.textContent = v >= 11 ? '∞' : String(v);
      if (v >= 11) { game.livesEnabled = false; game.livesLimit = Infinity; }
      else { game.livesEnabled = true; game.livesLimit = v; }
    }
  } catch {}
}

export function resumeFromStorage(game) {
  try {
    const raw = localStorage.getItem('sudoku-progress');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.board)) return;
    game.board = data.board; game.solution = data.solution; game.initialBoard = data.initialBoard;
    if (data.difficulty && document.getElementById('difficulty')) document.getElementById('difficulty').value = data.difficulty;
    game._preStartElapsed = Math.max(0, parseInt(data.elapsed || 0, 10));
    game._pendingStart = true;
    game._hasStarted = false;
    game.startTime = null;
    game.hintsUsed = data.hintsUsed || 0;
    game.hintsLimit = (Number.isFinite(data.hintsLimit) ? data.hintsLimit : game.hintsLimit);
    // Carry forward persisted type (future use for non-9x9 variants)
    if (data.gameType) game.gameType = data.gameType;
    game.updateDisplay && game.updateDisplay();
  } catch {}
}

export function resumeSettings(game) {
  try {
    const raw = localStorage.getItem('sudoku-settings');
    if (!raw) return;
    const s = JSON.parse(raw);
    if (!s) return;
    // Restore appearance → board sizing sliders and labels from persisted settings
    try {
      const gridSlider = document.getElementById('grid-size-slider');
      const digitSlider = document.getElementById('digit-size-slider');
      const noteSlider  = document.getElementById('note-size-slider');
      if (gridSlider && typeof s.gridSize === 'number') gridSlider.value = String(s.gridSize);
      if (digitSlider && typeof s.digitSize === 'number') digitSlider.value = String(s.digitSize);
      if (noteSlider && typeof s.noteSize === 'number') noteSlider.value = String(s.noteSize);
      const gridPill = document.getElementById('grid-size-pill');
      const digitPill = document.getElementById('digit-size-pill');
      const notePill  = document.getElementById('note-size-pill');
      if (gridPill && typeof s.gridSize === 'number') gridPill.textContent = String(s.gridSize);
      if (digitPill && typeof s.digitSize === 'number') digitPill.textContent = String(s.digitSize);
      if (notePill && typeof s.noteSize === 'number') notePill.textContent = String(s.noteSize);
      // Ensure live board sizing uses the last applied grid size
      game._appliedGridSize = (typeof s.gridSize === 'number') ? Math.max(1, Math.min(3, s.gridSize)) : 2;
      // Apply digit/note CSS scales so the board reflects persisted sizes on load
      const stepToDigitScale = (v) => ({ 1: 0.36, 2: 0.44, 3: 0.52, 4: 0.60, 5: 0.68 })[v] || 0.52;
      const stepToNoteScale  = (v) => ({ 1: 0.12, 2: 0.16, 3: 0.20, 4: 0.24, 5: 0.28 })[v] || 0.20;
      if (typeof s.digitSize === 'number') document.documentElement.style.setProperty('--digit-scale', String(stepToDigitScale(s.digitSize)));
      if (typeof s.noteSize === 'number')  document.documentElement.style.setProperty('--note-scale',  String(stepToNoteScale(s.noteSize)));
      // Recompute responsive layout with the applied grid size if available
      try { game.setupResponsiveSizing && game.setupResponsiveSizing(); } catch {}
    } catch {}
    const ac = document.getElementById('auto-candidates-toggle'); if (ac) ac.checked = !!s.autoCandidates;
    const aa = document.getElementById('auto-advance-toggle'); if (aa) aa.checked = !!s.autoAdvance;
    const ml = document.getElementById('lives-limit') || document.getElementById('mistakes-limit'); const mlv = document.getElementById('lives-limit-value') || document.getElementById('mistakes-limit-value');
    const limitValue = (typeof s.livesLimit === 'number') ? s.livesLimit : (typeof s.mistakeLimit === 'number' ? s.mistakeLimit : undefined);
    if (ml && typeof limitValue === 'number') {
      ml.value = limitValue;
      if (mlv) mlv.textContent = limitValue >= 11 ? 'Unlimited' : String(limitValue);
      const inProgress = game.isGameInProgress && game.isGameInProgress();
      if (!inProgress) {
        game.livesLimit = limitValue >= 11 ? Infinity : limitValue;
        game.livesEnabled = !(limitValue >= 11);
      } else {
        game._pendingMistakeLimitValue = limitValue;
      }
    }
    const themeToggle = document.getElementById('theme-dark-toggle'); if (themeToggle) themeToggle.checked = !!s.themeDark;
    const zenToggle = document.getElementById('zen-mode-toggle'); if (zenToggle) zenToggle.checked = !!s.zenMode;
    // Ensure lives slider UI matches zen state even if there was no transition
    try {
      const isZen = !!(zenToggle && zenToggle.checked);
      const slider = document.getElementById('lives-limit') || document.getElementById('mistakes-limit');
      const label = document.getElementById('lives-limit-value') || document.getElementById('mistakes-limit-value');
      const pill = document.getElementById('lives-limit-pill') || document.getElementById('mistakes-limit-pill');
      if (isZen) {
        if (slider) { slider.disabled = true; slider.value = '11'; try { slider.setAttribute('aria-disabled', 'true'); } catch {} }
        if (label) label.textContent = 'Unlimited';
        if (pill) pill.textContent = '∞';
        game.livesEnabled = false; game.livesLimit = Infinity;
      } else if (slider) {
        slider.disabled = false; try { slider.setAttribute('aria-disabled', 'false'); } catch {}
        const v = parseInt(slider.value || '3', 10);
        if (label) label.textContent = v >= 11 ? 'Unlimited' : String(v);
        if (pill) pill.textContent = v >= 11 ? '∞' : String(v);
        if (v >= 11) { game.livesEnabled = false; game.livesLimit = Infinity; }
        else { game.livesEnabled = true; game.livesLimit = v; }
      }
    } catch {}
    // Prevent legacy Zen restore from overriding defaults after a reset
    try { game._userZenRestoreValue = undefined; game._userLivesRestoreValue = undefined; game._userMistakeRestoreValue = undefined; } catch {}
    // Align internal zen flag with stored value so applyZenMode does not perform a restore transition
    try { game._zenMode = !!s.zenMode; } catch {}
    const idleToggle = document.getElementById('idle-autopause-toggle'); if (idleToggle && 'idleAutoPause' in s) idleToggle.checked = !!s.idleAutoPause;
    const idleSlider = document.getElementById('idle-timeout-slider'); if (idleSlider && typeof s.idleTimeoutSec === 'number') idleSlider.value = String(Math.max(10, s.idleTimeoutSec));
    // Reflect enabled/disabled state of idle timeout slider from toggle
  if (idleSlider) {
      const enabled = !!(idleToggle && idleToggle.checked);
      idleSlider.disabled = !enabled;
      try { idleSlider.setAttribute('aria-disabled', (!enabled).toString()); } catch {}
    // Only dim the idle slider's own row label; do not impact other labels
    try { const row = idleSlider.closest('.control-row'); const lbl = row && row.querySelector('.control-label'); if (lbl) lbl.setAttribute('data-label-disabled', (!enabled).toString()); } catch {}
    }
    const idlePill = document.getElementById('idle-timeout-pill');
    if (idlePill && (idleSlider || typeof s.idleTimeoutSec === 'number')) {
      const total = parseInt((idleSlider && idleSlider.value) || s.idleTimeoutSec || 0, 10);
      const m = Math.floor(total / 60), ss = String(total % 60).padStart(2, '0');
      idlePill.textContent = `${m}:${ss}`;
    }
    const weekToggle = document.getElementById('weekstart-toggle'); if (weekToggle && s.weekstart) weekToggle.setAttribute('aria-checked', s.weekstart === 'monday' ? 'true' : 'false');
    const fPlayable = document.getElementById('calendar-filter-playable-settings'); if (fPlayable) fPlayable.checked = !!s.calendarOnlyPlayable;
    const fIncomplete = document.getElementById('calendar-filter-incomplete-settings'); if (fIncomplete) fIncomplete.checked = !!s.calendarOnlyIncomplete;
    const swatches = document.querySelectorAll('#accent-swatches .swatch'); if (swatches && s.accent) swatches.forEach(b => b.setAttribute('aria-checked', b.dataset.accent === s.accent ? 'true' : 'false'));
    const hintModeSel = document.getElementById('hint-mode-select'); if (hintModeSel && s.hintMode) hintModeSel.value = s.hintMode;
    const isDark = !!s.themeDark;
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    try {
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'theme-color'); document.head.appendChild(meta); }
      meta.setAttribute('content', isDark ? '#0b1220' : '#667eea');
    } catch {}
    if (s.accent && game._applyAccent) game._applyAccent(s.accent);
    if (s.autoCandidates) game.recomputeAllCandidates && game.recomputeAllCandidates();
    game.applyZenMode && game.applyZenMode(!!s.zenMode);
    game.renderHealthBar && game.renderHealthBar();
    game.refreshCalendarHeaders && game.refreshCalendarHeaders();
  } catch {}
}

export function recordWin(game) {
  if (game._zenMode) return false;
  const diff = (game._activeDailyKey ? (JSON.parse(localStorage.getItem(`sudoku-daily-${game._activeDailyKey}`)||'{}').difficulty || game.getDailyDifficulty()) : (document.getElementById('difficulty')?.value || localStorage.getItem('sudoku-last-difficulty') || 'medium'));
  const elapsed = getElapsedSeconds(game);
  const stats = JSON.parse(localStorage.getItem('sudoku-stats') || '{}');
  stats.totalWins = (stats.totalWins || 0) + 1;
  stats.totalCompleted = (stats.totalCompleted || 0) + 1;
  stats.bestTimes = stats.bestTimes || {};
  stats.byDifficulty = stats.byDifficulty || {};
  const slot = (stats.byDifficulty[diff] = stats.byDifficulty[diff] || { played: 0, wins: 0 });
  slot.played += 1;
  slot.wins += 1;
  const best = stats.bestTimes[diff];
  let newBest = false;
  if ((game.hintsUsed || 0) === 0) {
    if (!best || elapsed < best) { stats.bestTimes[diff] = elapsed; newBest = true; }
  }
  // Idle settings
  const idleToggle = document.getElementById('idle-autopause-toggle'); if (idleToggle && typeof s.idleAutoPause === 'boolean') idleToggle.checked = !!s.idleAutoPause;
  const idleSlider = document.getElementById('idle-timeout-slider'); if (idleSlider && typeof s.idleTimeoutSec === 'number') idleSlider.value = String(s.idleTimeoutSec);
  if (typeof s.idleAutoPause === 'boolean') game._idleAutoPause = !!s.idleAutoPause;
  if (typeof s.idleTimeoutSec === 'number') game._idleTimeoutMs = Math.max(30, s.idleTimeoutSec) * 1000;
  try { stats.updatedAt = new Date().toISOString(); localStorage.setItem('sudoku-stats', JSON.stringify(stats)); } catch {}
  game.syncRemoteStats && game.syncRemoteStats();
  return newBest;
}

export function recordLoss(game) {
  if (game._zenMode) return;
  if (!game._hasMadeMove) return;
  const stats = JSON.parse(localStorage.getItem('sudoku-stats') || '{}');
  const diff = (game._activeDailyKey ? (JSON.parse(localStorage.getItem(`sudoku-daily-${game._activeDailyKey}`)||'{}').difficulty || game.getDailyDifficulty()) : (document.getElementById('difficulty')?.value || localStorage.getItem('sudoku-last-difficulty') || 'medium'));
  stats.totalLosses = (stats.totalLosses || 0) + 1;
  stats.totalCompleted = (stats.totalCompleted || 0) + 1;
  stats.byDifficulty = stats.byDifficulty || {};
  const slot = (stats.byDifficulty[diff] = stats.byDifficulty[diff] || { played: 0, wins: 0 });
  slot.played += 1;
  try { stats.updatedAt = new Date().toISOString(); localStorage.setItem('sudoku-stats', JSON.stringify(stats)); } catch {}
  game.syncRemoteStats && game.syncRemoteStats();
}

try {
  if (typeof window !== 'undefined') {
    window.SudokuStats = { getElapsedSeconds, persistToStorage, persistSettings, resumeFromStorage, resumeSettings, recordWin, recordLoss };
  }
} catch {}


