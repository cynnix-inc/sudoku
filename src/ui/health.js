// Lives / health bar rendering helpers extracted from monolith
export function renderHealthBar(game) {
  try {
    const host = document.getElementById('health-bar');
    if (!host) return;
    host.innerHTML = '';
    const unlimited = !game.livesEnabled || !Number.isFinite(game.livesLimit) || game.livesLimit >= 11;
    const total = unlimited ? 1 : Math.max(0, Number(game.livesLimit) || 0);
    const used = unlimited ? 0 : Math.max(0, Number(game.mistakesCount) || 0);
    const remaining = unlimited ? Infinity : Math.max(0, total - used);
    const row = document.createElement('div');
    row.className = 'health-bar-row';
    if (!unlimited && total > 5) row.classList.add('stack');
    if (unlimited) {
      const wrap = document.createElement('div');
      wrap.className = 'health-compact health-infinite';
      const heart = document.createElement('div');
      heart.className = 'health-heart';
      heart.innerHTML = `<svg class=\"heart-svg\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 21s-6.716-4.418-9.193-7.2C-0.457 11.06 0.18 7.5 2.6 6.2 4.73 5.06 7.2 5.86 8.4 7.8c1.2-1.94 3.67-2.74 5.8-1.6 2.42 1.3 3.06 4.86 0.8 7.6C18.716 16.582 12 21 12 21z\"/></svg>`;
      const badge = document.createElement('span');
      badge.className = 'health-badge';
      badge.textContent = '∞';
      heart.appendChild(badge);
      wrap.appendChild(heart);
      row.appendChild(wrap);
    } else {
      if (total > 5) {
        // Two-row layout where the bottom row is prioritized for remaining lives
        const bottomRowCapacity = 5;
        const topRowCount = total - bottomRowCapacity;
        const bottomRowCount = bottomRowCapacity; // total > 5 implies at least 1 full bottom row slot set

        const topRowRemaining = Math.max(0, Math.min(remaining - bottomRowCapacity, topRowCount));
        const bottomRowRemaining = Math.max(0, Math.min(remaining, bottomRowCapacity));

        // Build Top Row (row 1): remaining first (left), then lost to fill the row
        for (let i = 0; i < topRowCount; i++) {
          const h = document.createElement('div');
          h.className = 'health-heart';
          h.style.gridRow = '1';
          if (i >= topRowRemaining) h.classList.add('lost');
          h.innerHTML = `<svg class="heart-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.716-4.418-9.193-7.2C-0.457 11.06 0.18 7.5 2.6 6.2 4.73 5.06 7.2 5.86 8.4 7.8c1.2-1.94 3.67-2.74 5.8-1.6 2.42 1.3 3.06 4.86 0.8 7.6C18.716 16.582 12 21 12 21z"/></svg>`;
          row.appendChild(h);
        }

        // Build Bottom Row (row 2): remaining hearts first (left), then lost
        for (let i = 0; i < bottomRowCount; i++) {
          const h = document.createElement('div');
          h.className = 'health-heart';
          h.style.gridRow = '2';
          if (i >= bottomRowRemaining) h.classList.add('lost');
          // Mark the bottom-left most remaining heart as the "last" heart
          if (i === 0 && bottomRowRemaining > 0) h.classList.add('last-heart');
          h.innerHTML = `<svg class="heart-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.716-4.418-9.193-7.2C-0.457 11.06 0.18 7.5 2.6 6.2 4.73 5.06 7.2 5.86 8.4 7.8c1.2-1.94 3.67-2.74 5.8-1.6 2.42 1.3 3.06 4.86 0.8 7.6C18.716 16.582 12 21 12 21z"/></svg>`;
          row.appendChild(h);
        }
      } else {
        // Single-row layout (<= 5 total). Leftmost is considered the "last" heart.
        for (let i = 0; i < total; i++) {
          const h = document.createElement('div');
          h.className = 'health-heart';
          if (i >= remaining) h.classList.add('lost');
          if (i === 0 && remaining > 0) h.classList.add('last-heart');
          h.innerHTML = `<svg class="heart-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.716-4.418-9.193-7.2C-0.457 11.06 0.18 7.5 2.6 6.2 4.73 5.06 7.2 5.86 8.4 7.8c1.2-1.94 3.67-2.74 5.8-1.6 2.42 1.3 3.06 4.86 0.8 7.6C18.716 16.582 12 21 12 21z"/></svg>`;
          row.appendChild(h);
        }
      }
    }
    host.appendChild(row);
  } catch {}
}

try { if (typeof window !== 'undefined') window.SudokuHealth = { renderHealthBar }; } catch {}
