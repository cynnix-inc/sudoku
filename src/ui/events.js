// Event wiring extracted from the main game class. Attaches listeners for
// number pad, lock toggle, modals, and global keyboard shortcuts.

export function wireCoreUiEvents(game) {
  // Number pad (include erase button which has data-number="0")
  document.querySelectorAll('.number-btn, #pad-erase-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      game.ensureGameStarted && game.ensureGameStarted();
      const number = parseInt(btn.dataset.number);
      const lockToggle = document.getElementById('pad-lock-toggle');
      const lockEnabled = !lockToggle || lockToggle.getAttribute('aria-pressed') === 'true';
      if (lockEnabled) {
        const isAlreadyActive = btn.classList.contains('active');
        document.querySelectorAll('.number-btn, #pad-erase-btn').forEach((b) => b.classList.remove('active'));
        if (isAlreadyActive) {
          game.lockedNumber = null;
          game.highlightSameNumbers && game.highlightSameNumbers();
        } else {
          game.lockedNumber = number > 0 ? number : 0;
          btn.classList.add('active');
          if (number > 0 && game.highlightNumber) game.highlightNumber(number);
          else game.highlightSameNumbers && game.highlightSameNumbers();
        }
      } else {
        if (game.selectedCell && !game.selectedCell.readOnly) {
          const r = parseInt(game.selectedCell.dataset.row);
          const c = parseInt(game.selectedCell.dataset.col);
          const v = number === 0 ? 0 : number;
          if (game.isNotesMode && v > 0) game.toggleNote && game.toggleNote(r, c, v);
          else { game.setCellValue && game.setCellValue(r, c, v, 'numpad'); game.checkGameComplete && game.checkGameComplete(); }
        }
        game.lockedNumber = null;
        document.querySelectorAll('.number-btn, #pad-erase-btn').forEach((b) => b.classList.remove('active'));
      }
      game.syncNotesBadgeState && game.syncNotesBadgeState();
    });
  });

  const lockToggle = document.getElementById('pad-lock-toggle');
  if (lockToggle) {
    lockToggle.addEventListener('click', () => {
      const wasPressed = lockToggle.getAttribute('aria-pressed') === 'true';
      const nowPressed = !wasPressed;
      lockToggle.setAttribute('aria-pressed', nowPressed.toString());
      lockToggle.textContent = nowPressed ? '🔒' : '🔓';
      if (!nowPressed) {
        game.lockedNumber = null;
        document.querySelectorAll('.number-btn, #pad-erase-btn').forEach((b) => b.classList.remove('active'));
      }
    });
  }

  // Modal buttons
  const modalNew = document.getElementById('modal-new-game');
  if (modalNew) modalNew.addEventListener('click', () => { const m = document.getElementById('modal'); if (m) m.style.display = 'none'; game.newGame && game.newGame(); });
  const modalClose = document.getElementById('modal-close');
  if (modalClose) modalClose.addEventListener('click', () => { const m = document.getElementById('modal'); if (m) m.style.display = 'none'; });
  window.addEventListener('click', (event) => { const m = document.getElementById('modal'); if (event.target === m) m.style.display = 'none'; });

  // Global keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const anyModalOpen = Array.from(document.querySelectorAll('.modal')).some((m) => m.style.display === 'block');
    if (anyModalOpen) return;
    const key = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && key === 'z' && !e.shiftKey) { e.preventDefault(); game.undo && game.undo(); return; }
    if ((e.ctrlKey || e.metaKey) && ((key === 'y') || (key === 'z' && e.shiftKey))) { e.preventDefault(); game.redo && game.redo(); return; }
    if (e.key === 'Escape') {
      game.lockedNumber = null;
      document.querySelectorAll('.number-btn, #pad-erase-btn').forEach((b) => b.classList.remove('active'));
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && key === 'd') { e.preventDefault(); game._toggleDevPanel && game._toggleDevPanel(); return; }
  });
}

try {
  if (typeof window !== 'undefined') window.SudokuEvents = { wireCoreUiEvents };
} catch {}


