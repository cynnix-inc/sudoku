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
}

// Named exports reserved for future browser‑only utilities
export const version = APP_VERSION;


