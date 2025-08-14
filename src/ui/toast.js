// Lightweight reusable mini toast positioned near an anchor element
// Usage:
//   window.SudokuToasts.showMiniToast(anchorEl, 'Copied', 'success', { position: 'above', duration: 900 });

export function showMiniToast(anchorEl, message, type = 'info', options = {}) {
  try {
    if (!anchorEl) return;
    const { position = 'above', duration = 900, offset = 8 } = options || {};
    const rect = anchorEl.getBoundingClientRect();
    const toast = document.createElement('div');
    toast.className = `mini-toast ${type || 'info'}`;
    toast.textContent = String(message || '');
    const x = rect.left + rect.width / 2 + window.scrollX;
    const y = (position === 'below' ? (rect.bottom + offset) : (rect.top - offset)) + window.scrollY;
    toast.style.left = `${x}px`;
    toast.style.top = `${y}px`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 160); }, Math.max(300, duration));
  } catch {}
}

try {
  if (typeof window !== 'undefined') {
    window.SudokuToasts = window.SudokuToasts || {};
    window.SudokuToasts.showMiniToast = showMiniToast;
  }
} catch {}


