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
import { APP_VERSION } from './version.js';

// Future: import fine‑grained modules here (ui orchestrators, analytics) and
// compose them with the core game instance.

function ensureSudokuGameInitialized() {
  try {
    if (typeof window === 'undefined') return;
    // If the core class is not present, do nothing (e.g., unit tests)
    if (!window.SudokuGame) return;
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
}

// Named exports reserved for future browser‑only utilities
export const version = APP_VERSION;


