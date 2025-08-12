// Calendar UI helpers extracted from the main game class.

function openCalendar(game) {
  const modal = document.getElementById('calendar-modal');
  if (!modal) { try { console.warn('Calendar modal not found in DOM.'); } catch {} return; }
  game._calendarRefMonth = game._calendarRefMonth || new Date();
  refreshCalendarHeaders(game);
  renderCalendar(game);
  // Center using CSS grid layout
  modal.style.display = 'grid';
  if (game && game._positionOverlayWithinGameArea) game._positionOverlayWithinGameArea(modal);
  if (game && game._bindOverlayRecalibration) game._bindOverlayRecalibration(modal);
  const closeBtn = document.getElementById('calendar-close');
  const prevBtn = document.getElementById('calendar-prev');
  const nextBtn = document.getElementById('calendar-next');
  if (closeBtn && !closeBtn._bound) {
    closeBtn._bound = true;
    closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
  }
  if (prevBtn && !prevBtn._bound) { prevBtn._bound = true; prevBtn.addEventListener('click', () => { shiftCalendar(game, -1); }); }
  if (nextBtn && !nextBtn._bound) { nextBtn._bound = true; nextBtn.addEventListener('click', () => { shiftCalendar(game, 1); }); }
}

function shiftCalendar(game, deltaMonths) {
  const d = game._calendarRefMonth || new Date();
  const year = d.getFullYear();
  const month = d.getMonth();
  const newDate = new Date(year, month + deltaMonths, 1);
  game._calendarRefMonth = newDate;
  renderCalendar(game);
}

function renderCalendar(game) {
  const grid = document.getElementById('calendar-grid');
  const label = document.getElementById('calendar-month-label');
  const streaksRow = document.getElementById('calendar-streaks');
  const quickRow = document.getElementById('calendar-quick');
  if (!grid || !label) return;
  const ref = new Date(game._calendarRefMonth.getFullYear(), game._calendarRefMonth.getMonth(), 1);
  const monthName = ref.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  label.textContent = monthName;
  grid.innerHTML = '';
  grid.setAttribute('tabindex', '0');
  const baseFirstDow = new Date(ref.getFullYear(), ref.getMonth(), 1).getDay();
  const weekstart = ((document.getElementById('weekstart-toggle')?.getAttribute('aria-checked') === 'true') ? 'monday' : 'sunday') || (JSON.parse(localStorage.getItem('sudoku-settings')||'{}').weekstart) || 'sunday';
  const startOffset = weekstart === 'monday' ? ((baseFirstDow + 6) % 7) : baseFirstDow;
  const daysInMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
  const nowUtcMidnight = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
  const todayLocal = new Date();
  const todayLocalYear = todayLocal.getFullYear();
  const todayLocalMonth = todayLocal.getMonth();
  const todayLocalDate = todayLocal.getDate();
  for (let i = 0; i < startOffset; i++) {
    const spacer = document.createElement('div'); spacer.className = 'calendar-cell empty'; spacer.setAttribute('aria-hidden', 'true'); grid.appendChild(spacer);
  }
  // Compute streaks from localStorage results
  const results = JSON.parse(localStorage.getItem('sudoku-daily-results') || '{}');
  const computeStreaks = () => {
    const keys = Object.keys(results).sort();
    let current = 0, best = 0;
    // current streak: count back from yesterday if completed true
    const todayKey = game.getUtcDateKey(nowUtcMidnight);
    const yesterday = new Date(nowUtcMidnight.getTime() - 86400000);
    let cursor = game.getUtcDateKey(yesterday);
    while (results[cursor]?.completed) {
      current += 1; const d = new Date(Date.UTC(parseInt(cursor.slice(0,4)), parseInt(cursor.slice(4,6)) - 1, parseInt(cursor.slice(6,8))));
      const prev = new Date(d.getTime() - 86400000); cursor = game.getUtcDateKey(prev);
    }
    // best streak: scan sequences
    let run = 0; let prevKey = null;
    for (const k of keys) {
      if (!results[k]?.completed) { run = 0; continue; }
      if (!prevKey) { run = 1; prevKey = k; best = Math.max(best, run); continue; }
      const prev = new Date(Date.UTC(parseInt(prevKey.slice(0,4)), parseInt(prevKey.slice(4,6)) - 1, parseInt(prevKey.slice(6,8))));
      const next = new Date(prev.getTime() + 86400000);
      const expected = game.getUtcDateKey(next);
      if (k === expected) run += 1; else run = 1;
      best = Math.max(best, run); prevKey = k;
    }
    return { current, best };
  };
  const { current: currentStreak, best: bestStreak } = computeStreaks();
  if (streaksRow) {
    streaksRow.innerHTML = `<div class="streak"><span class="label">Current</span> 🔥 <span>${currentStreak}</span></div><div class="streak"><span class="label">Best</span> ⭐ <span>${bestStreak}</span></div>`;
  }

  // Quick actions: Play today only (filters moved to Settings)
  if (quickRow) {
    const playBtn = document.getElementById('calendar-play-today');
    const todayLocal = new Date();
    const todayKeyLocal = game.getUtcDateKey(new Date(Date.UTC(todayLocal.getFullYear(), todayLocal.getMonth(), todayLocal.getDate())));
    const isVisibleMonth = (todayLocal.getFullYear() === ref.getFullYear() && todayLocal.getMonth() === ref.getMonth());
    const isCompleted = !!results[todayKeyLocal]?.completed;
    if (playBtn) {
      playBtn.style.display = (!isCompleted && isVisibleMonth) ? 'inline-block' : 'none';
      if (!playBtn._bound) {
        playBtn._bound = true;
        playBtn.addEventListener('click', () => {
          const dff = game.getDifficultyForDateKey(todayKeyLocal);
          game.loadDailyByKey && game.loadDailyByKey(todayKeyLocal, dff);
          const modal = document.getElementById('calendar-modal'); if (modal) modal.style.display = 'none';
        });
      }
    }
  }

  // Render days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(ref.getFullYear(), ref.getMonth(), d);
    const cell = document.createElement('div'); cell.className = 'calendar-cell';
    const key = game.getUtcDateKey(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
    const header = document.createElement('div'); header.className = 'date-num'; header.textContent = String(d);
    const diff = game.getDifficultyForDateKey(key);
    const chip = document.createElement('span');
    chip.className = `diff-chip diff-${diff}`;
    // Enrich hover text for clarity
    chip.title = `${diff[0].toUpperCase() + diff.slice(1)} difficulty`;
    chip.setAttribute('aria-label', `${diff} difficulty`);
    // Unified icon circle
    const iconHost = document.createElement('span');
    iconHost.className = `diff-circle diff-${diff}`;
    iconHost.innerHTML = game.getDifficultyIcon(diff);
    chip.appendChild(iconHost);
    const thisUtcMidnight = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const isFuture = thisUtcMidnight.getTime() > nowUtcMidnight.getTime();
    if (isFuture) cell.classList.add('future');
    if (results[key]?.completed) { cell.classList.add('completed'); const check = document.createElement('span'); check.className = 'check-badge'; check.textContent = '✓'; cell.appendChild(check); }
    if (date.getFullYear() === todayLocalYear && date.getMonth() === todayLocalMonth && date.getDate() === todayLocalDate) cell.classList.add('today');
    // Hover/title for full cell with readable date and difficulty
    const readableDate = date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    cell.title = `${readableDate} — ${diff[0].toUpperCase() + diff.slice(1)}`;
    cell.setAttribute('aria-label', `${readableDate}, ${diff} difficulty`);

    if (!isFuture) {
      cell.addEventListener('click', () => {
        const dff = game.getDifficultyForDateKey(key);
        game.loadDailyByKey && game.loadDailyByKey(key, dff);
        const modal = document.getElementById('calendar-modal'); if (modal) modal.style.display = 'none';
      });
      // Make focusable for keyboard users
      cell.setAttribute('tabindex', '0');
      cell.setAttribute('role', 'button');
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cell.click(); }
      });
    }
    // Mark cells that are part of the current streak
    if (!isFuture && results[key]?.completed) {
      // Determine if this date is within the trailing current streak window
      // Build a set of the last N completed days where N=currentStreak
      if (currentStreak > 0) {
        const lastSet = new Set();
        let c = currentStreak; let ptr = new Date(nowUtcMidnight.getTime() - 86400000);
        while (c > 0) { const k = game.getUtcDateKey(ptr); lastSet.add(k); ptr = new Date(ptr.getTime() - 86400000); c--; }
        if (lastSet.has(key)) { cell.classList.add('streak'); cell.classList.add('streak-badge'); }
      }
    }
    cell.appendChild(header); cell.appendChild(chip); grid.appendChild(cell);
  }
  const used = startOffset + daysInMonth;
  const trailing = (7 - (used % 7)) % 7;
  for (let i = 0; i < trailing; i++) { const spacer = document.createElement('div'); spacer.className = 'calendar-cell empty'; spacer.setAttribute('aria-hidden', 'true'); grid.appendChild(spacer); }

  // Ensure legend appears fully readable (no dimming)
  try {
    const legend = document.getElementById('calendar-legend');
    if (legend) {
      legend.querySelectorAll('span').forEach((item) => { item.style.opacity = '1'; });
      // Replace legend icons with unified difficulty SVGs used across the app
      const inject = (cls, svg) => {
        const host = legend.querySelector(`.legend-chip[data-diff="${cls}"] .legend-icon`);
        if (host && svg) {
          host.className = `legend-icon diff-circle diff-${cls}`;
          host.innerHTML = svg;
        }
      };
      const icon = (d) => (game.getDifficultyIcon ? game.getDifficultyIcon(d) : '');
      inject('easy', icon('easy'));
      inject('medium', icon('medium'));
      inject('hard', icon('hard'));
      inject('expert', icon('expert'));
      inject('master', icon('master'));
      inject('extreme', icon('extreme'));
    }
  } catch {}

  // Grid-level keyboard navigation and initial focus
  try {
    const cells = Array.from(grid.querySelectorAll('.calendar-cell:not(.empty)'));
    const focusCellAtIndex = (idx) => { if (cells[idx]) cells[idx].focus(); };
    // Initial focus: first playable day in the visible month
    const firstPlayableIdx = cells.findIndex(c => !c.classList.contains('future'));
    if (firstPlayableIdx >= 0) setTimeout(() => focusCellAtIndex(firstPlayableIdx), 0);
    grid.onkeydown = (e) => {
      const active = document.activeElement;
      const idx = cells.indexOf(active);
      // PageUp/PageDown change months
      if (e.key === 'PageUp' || (e.key === 'ArrowLeft' && e.altKey)) { e.preventDefault(); shiftCalendar(game, -1); return; }
      if (e.key === 'PageDown' || (e.key === 'ArrowRight' && e.altKey)) { e.preventDefault(); shiftCalendar(game, 1); return; }
      if (idx === -1) return;
      const cols = 7;
      if (e.key === 'ArrowRight') { e.preventDefault(); focusCellAtIndex(Math.min(cells.length - 1, idx + 1)); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); focusCellAtIndex(Math.max(0, idx - 1)); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); focusCellAtIndex(Math.min(cells.length - 1, idx + cols)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); focusCellAtIndex(Math.max(0, idx - cols)); }
      else if (e.key === 'Home') { e.preventDefault();
        // Move to start of the current week row
        const rowStart = idx - (idx % cols); focusCellAtIndex(rowStart);
      } else if (e.key === 'End') { e.preventDefault();
        const rowStart = idx - (idx % cols); const rowEnd = Math.min(cells.length - 1, rowStart + cols - 1); focusCellAtIndex(rowEnd);
      }
    };
  } catch {}

  // Basic focus trap inside calendar modal
  try {
    const modal = document.getElementById('calendar-modal');
    if (modal && !modal._trapBound) {
      modal._trapBound = true;
      modal.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const list = Array.from(focusables).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1);
        if (!list.length) return;
        const first = list[0]; const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    }
  } catch {}

  // Celebrate if entire month completed
  try {
    const allKeys = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(ref.getFullYear(), ref.getMonth(), d);
      const key = game.getUtcDateKey(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
      allKeys.push(key);
    }
    const allDone = allKeys.length > 0 && allKeys.every(k => results[k]?.completed);
    if (allDone) {
      // simple confetti sparkle using CSS particles
      const wrap = document.querySelector('#calendar-modal .modal-content');
      if (wrap) {
        const n = 16;
        for (let i = 0; i < n; i++) {
          const bit = document.createElement('div');
          bit.className = 'confetti-bit';
          bit.textContent = '✨';
          bit.style.left = Math.round(10 + Math.random() * 80) + '%';
          bit.style.top = '6%';
          bit.style.transition = 'transform 900ms ease, opacity 900ms ease';
          bit.style.opacity = '1';
          wrap.appendChild(bit);
          requestAnimationFrame(() => {
            bit.style.transform = `translate(${Math.round(-40 + Math.random()*80)}px, ${140 + Math.random()*60}px)`;
            bit.style.opacity = '0';
          });
          setTimeout(() => bit.remove(), 1000);
        }
      }
    }
  } catch {}

  // Apply filters from Settings (persisted values)
  try {
    const settings = JSON.parse(localStorage.getItem('sudoku-settings') || '{}');
    const onlyPlayable = !!settings.calendarOnlyPlayable;
    const onlyIncomplete = !!settings.calendarOnlyIncomplete;
    if (onlyPlayable || onlyIncomplete) {
      const nowUtcMidnight2 = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
      grid.querySelectorAll('.calendar-cell').forEach(cell => {
        if (cell.classList.contains('empty')) return;
        const day = parseInt(cell.querySelector('.date-num')?.textContent || '0', 10);
        if (!day) return;
        const date = new Date(ref.getFullYear(), ref.getMonth(), day);
        const key = game.getUtcDateKey(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
        const thisUtcMidnight = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const isFuture = thisUtcMidnight.getTime() > nowUtcMidnight2.getTime();
        const completed = !!results[key]?.completed;
        let hide = false;
        if (onlyPlayable && isFuture) hide = true;
        if (onlyIncomplete && completed) hide = true;
        cell.style.display = hide ? 'none' : '';
      });
    }
  } catch {}
}

function refreshCalendarHeaders(game) {
  const wrap = document.getElementById('calendar-weekdays');
  if (!wrap) return;
  const weekstart = ((document.getElementById('weekstart-toggle')?.getAttribute('aria-checked') === 'true') ? 'monday' : 'sunday') || (JSON.parse(localStorage.getItem('sudoku-settings')||'{}').weekstart) || 'sunday';
  const days = weekstart === 'monday' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  wrap.innerHTML = days.map((d) => `<div>${d}</div>`).join('');
}

try { if (typeof window !== 'undefined') window.SudokuCalendar = { openCalendar, shiftCalendar, renderCalendar, refreshCalendarHeaders }; } catch {}
try { if (typeof module !== 'undefined' && module.exports) module.exports = { openCalendar, shiftCalendar, renderCalendar, refreshCalendarHeaders }; } catch {}


