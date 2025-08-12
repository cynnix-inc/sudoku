// Hints UI helpers: attach to SudokuGame prototype if present
function attachUpdateHintUi() {
  try {
    if (typeof window === 'undefined') return;
    const Game = window.SudokuGame;
    if (!Game || typeof Game !== 'function') return;
    if (typeof Game.prototype.updateHintUi === 'function') return; // don't override if exists

    Game.prototype.updateHintUi = function updateHintUi() {
      try {
        const btn = document.getElementById('hint-btn');
        const badge = document.getElementById('hint-badge');
        if (!btn) return;
        const used = Number(this.hintsUsed || 0);
        const limit = Number.isFinite(this.hintsLimit) ? this.hintsLimit : Infinity;
        const remaining = Math.max(0, (limit === Infinity ? Infinity : limit - used));
        const disabled = remaining === 0;
        btn.disabled = !!disabled;
        if (badge) {
          if (limit === Infinity) {
            badge.style.display = 'none';
          } else {
            badge.textContent = String(remaining);
            badge.style.display = 'inline-block';
            badge.classList.toggle('badge-danger', remaining === 0);
          }
        }
        const baseLabel = 'Get a hint: fills one correct cell (+30s)';
        btn.setAttribute('aria-label', baseLabel + (limit === Infinity ? '' : ` — ${remaining} left`));
        btn.setAttribute('title', baseLabel);
      } catch {}
    };
  } catch {}
}

attachUpdateHintUi();

try { if (typeof window !== 'undefined') window.SudokuHints = { attachUpdateHintUi }; } catch {}
