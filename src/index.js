// Lightweight module entry for the browser. Keeps backward compatibility:
// - Core class remains defined in script.js (UMD style)
// - This module simply initializes the game on page load and exposes helpers

// Load modular helpers so they attach to window (for legacy class to pick up)
import './logic/solver.js';
import './game/storage.js';
import './game/daily.js';
import './game/stats.js';
import './game/types.js';
import './ui/dom.js';
import './ui/events.js';
import './ui/calendar.js';
import './utils/devlog.js';
import './ui/timer.js';
import './ui/health.js';
import './ui/modals.js';
import './ui/toast.js';
import './ui/representation.js';
import './ui/hints.js';
import { APP_VERSION } from './version.js';

// Future: import fine‑grained modules here (ui orchestrators, analytics) and
// compose them with the core game instance.

function ensureSudokuGameInitialized() {
  try {
    if (typeof window === 'undefined') return;
    // If the core class is not present, do nothing (e.g., unit tests)
    if (!window.SudokuGame) {
      // If the legacy core isn't loaded (e.g., existing tag has `nomodule` and didn't execute),
      // load it programmatically. Guard to avoid duplicate injections.
      if (!window.__loadingSudokuCore) {
        window.__loadingSudokuCore = true;
        const s = document.createElement('script');
        s.src = 'script.js?v=v4';
        s.async = false;
        s.setAttribute('data-sudoku-core', '1');
        try { s.setAttribute('nonce', 'c3Vkb2t1LW5vbmNl'); } catch {}
        s.addEventListener('load', () => {
          window.__loadingSudokuCore = false;
          try { if (!window.__sudokuGame && window.SudokuGame) window.__sudokuGame = new window.SudokuGame(); } catch {}
        });
        document.head.appendChild(s);
      }
      return;
    }
    // Reuse a single instance for the page
    if (!window.__sudokuGame) {
      window.__sudokuGame = new window.SudokuGame();
    }
  } catch {}
}

// Boot when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureSudokuGameInitialized, { once: true });
  } else {
    ensureSudokuGameInitialized();
  }

  // Reflect version in Help > About. Prefer dynamic window.APP_VERSION (from env.js)
  // and fall back to the compiled APP_VERSION from src/version.js.
  const setVersion = () => {
    try {
      const el = document.getElementById('app-version');
      if (!el) return;
      const fromWindow = (typeof window !== 'undefined' && window.APP_VERSION) ? String(window.APP_VERSION) : '';
      const versionToShow = fromWindow || String(APP_VERSION || '');
      if (versionToShow) el.textContent = versionToShow;
    } catch {}
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setVersion, { once: true });
  } else {
    setVersion();
  }

  // Footer behavior: brand/year and seed copy
  const wireFooter = () => {
    try {
      // Set year directly (fallback independent of game instance)
      const yearEl = document.getElementById('game-brand-year');
      if (yearEl) yearEl.textContent = String(new Date().getFullYear());

      const g = window.__sudokuGame;
      if (g && g.updateFooterBrand) g.updateFooterBrand();
      if (g && g.updateFooterSeed) g.updateFooterSeed();
      const seedBtn = document.getElementById('game-seed');
      if (seedBtn && !seedBtn._wired) {
        const notifyMini = (msg, type, anchorEl) => {
          if (window.SudokuToasts && window.SudokuToasts.showMiniToast) {
            window.SudokuToasts.showMiniToast(anchorEl, msg, type, { position: 'above', duration: 900 });
            return;
          }
          try {
            const rect = anchorEl.getBoundingClientRect();
            const t = document.createElement('div');
            t.className = `mini-toast ${type || 'info'}`;
            t.textContent = msg;
            const x = rect.left + rect.width / 2 + window.scrollX;
            const y = rect.top - 8 + window.scrollY;
            t.style.left = `${x}px`;
            t.style.top = `${y}px`;
            document.body.appendChild(t);
            requestAnimationFrame(() => t.classList.add('show'));
            setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 160); }, 900);
          } catch {}
        };
        seedBtn.addEventListener('click', async () => {
          const seed = seedBtn.getAttribute('data-seed') || seedBtn.textContent || '';
          if (!seed) return;
          try {
            await navigator.clipboard.writeText(String(seed));
            notifyMini('Copied', 'success', seedBtn);
          } catch {
            notifyMini('Copy failed', 'error', seedBtn);
          }
        });
        seedBtn._wired = true;
      }
    } catch {}
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireFooter, { once: true });
  } else {
    wireFooter();
  }

  // Fallback wiring: ensure reset buttons work even if legacy bindings fail
  const wireResetButtons = () => {
    try {
      const game = window.__sudokuGame;
      if (!game) return;
      // Settings: Reset to defaults
      const settingsReset = document.getElementById('settings-reset');
      if (settingsReset && !settingsReset._idxBound) {
        settingsReset._idxBound = true;
        settingsReset.addEventListener('click', async () => {
          const ok1 = await (game.showConfirm?.('Reset all settings to defaults?'));
          if (!ok1) return;
          const ok2 = await (game.showConfirm?.('Are you sure?'));
          if (!ok2) return;
          try { localStorage.removeItem('sudoku-settings'); } catch {}
          // Defaults — Gameplay
          try { const ac = document.getElementById('auto-candidates-toggle'); if (ac) ac.checked = false; } catch {}
          try { const aa = document.getElementById('auto-advance-toggle'); if (aa) aa.checked = true; } catch {}
          try { const hintSel = document.getElementById('hint-mode-select'); if (hintSel) hintSel.value = 'direct'; } catch {}
          try { const zen = document.getElementById('zen-mode-toggle'); if (zen) zen.checked = false; } catch {}
          try { game._userZenRestoreValue = undefined; game._userLivesRestoreValue = undefined; game._userMistakeRestoreValue = undefined; } catch {}
          // Defaults — Lives
          try {
            const ml = document.getElementById('lives-limit') || document.getElementById('mistakes-limit');
            const mlv = document.getElementById('lives-limit-value') || document.getElementById('mistakes-limit-value');
            const mlp = document.getElementById('lives-limit-pill') || document.getElementById('mistakes-limit-pill');
            const mlprev = document.getElementById('lives-preview') || document.getElementById('mistakes-preview');
            if (ml) { ml.disabled = false; try { ml.setAttribute('aria-disabled', 'false'); } catch {} ml.value = '3'; }
            if (mlv) mlv.textContent = '3';
            if (mlp) mlp.textContent = '3';
            if (mlprev) mlprev.textContent = 'Hearts: ×3';
            game.livesEnabled = true;
            game.livesLimit = 3;
            game.resetMistakes && game.resetMistakes();
            game.renderHealthBar && game.renderHealthBar();
          } catch {}
          // Defaults — Idle
          try { const idleToggle = document.getElementById('idle-autopause-toggle'); if (idleToggle) idleToggle.checked = true; } catch {}
          try { const idleSlider = document.getElementById('idle-timeout-slider'); if (idleSlider) { idleSlider.value = '120'; idleSlider.disabled = false; try { idleSlider.setAttribute('aria-disabled', 'false'); } catch {} } } catch {}
          try { const idlePill = document.getElementById('idle-timeout-pill'); if (idlePill) idlePill.textContent = '2:00'; } catch {}
          // Defaults — Appearance
          try { const themeToggle = document.getElementById('theme-dark-toggle'); if (themeToggle) themeToggle.checked = false; } catch {}
          try { document.querySelectorAll('#accent-swatches .swatch').forEach(b => b.setAttribute('aria-checked', b.dataset.accent === 'indigo' ? 'true' : 'false')); } catch {}
          // Defaults — Board sizing
          try { const gs = document.getElementById('grid-size-slider'); if (gs) gs.value = '2'; } catch {}
          try { const gsp = document.getElementById('grid-size-pill'); if (gsp) gsp.textContent = '2'; } catch {}
          try { const ds = document.getElementById('digit-size-slider'); if (ds) ds.value = '3'; } catch {}
          try { const dsp = document.getElementById('digit-size-pill'); if (dsp) dsp.textContent = '3'; } catch {}
          try { const ns = document.getElementById('note-size-slider'); if (ns) ns.value = '3'; } catch {}
          try { const nsp = document.getElementById('note-size-pill'); if (nsp) nsp.textContent = '3'; } catch {}
          // Persist and align internals
          try { game.persistSettings && game.persistSettings(game); } catch {}
        });
      }
      // Settings: Reset cloud data
      const cloudReset = document.getElementById('cloud-reset');
      if (cloudReset && !cloudReset._idxBound) {
        cloudReset._idxBound = true;
        cloudReset.addEventListener('click', async () => {
          const ok1 = await (game.showConfirm?.('Reset cloud data? This deletes your synced stats and gameplay settings for your account.'));
          if (!ok1) return;
          const ok2 = await (game.showConfirm?.('Are you sure? This cannot be undone.'));
          if (!ok2) return;
          try {
            if (window.supabase) {
              const { data: { user } } = await window.supabase.auth.getUser();
              if (user) {
                try { await window.supabase.from('stats').delete().eq('user_id', user.id); } catch {}
                try { await window.supabase.from('settings').delete().eq('user_id', user.id); } catch {}
              }
            }
          } catch {}
          try { game.showToast && game.showToast('Cloud data reset', 'info', 3000); } catch {}
        });
      }
      // Stats: Reset all
      const statsReset = document.getElementById('stats-reset');
      if (statsReset && !statsReset._idxBound) {
        statsReset._idxBound = true;
        statsReset.addEventListener('click', async () => {
          const ok1 = await (game.showConfirm?.('Reset all Sudoku stats (wins, losses, best times, daily results)?'));
          if (!ok1) return;
          const ok2 = await (game.showConfirm?.('Are you sure? This cannot be undone.'));
          if (!ok2) return;
          try {
            localStorage.removeItem('sudoku-stats');
            localStorage.removeItem('sudoku-daily-results');
            localStorage.removeItem('sudoku-daily-last');
            localStorage.removeItem('sudoku-daily-streak');
          } catch {}
          try {
            if (window.supabase) {
              const { data: { user } } = await window.supabase.auth.getUser();
              if (user) await window.supabase.from('stats').delete().eq('user_id', user.id);
            }
          } catch {}
          try { game.showStats && game.showStats(); } catch {}
          try { game.updateDailyIconBadge && game.updateDailyIconBadge(); } catch {}
        });
      }
    } catch {}
  };

  // Bind now and also whenever modals open (ensures elements exist and are current)
  wireResetButtons();
  try {
    document.addEventListener('modalopen', (e) => {
      const id = e?.detail?.id;
      if (id === 'settings-modal' || id === 'stats-modal') wireResetButtons();
    });
  } catch {}
}

// Named exports reserved for future browser‑only utilities
export const version = APP_VERSION;


