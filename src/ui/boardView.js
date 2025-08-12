// Board rendering and DOM wiring for cells. No game logic here.
// Exposes renderBoard(game, boardElement).

import { el } from './dom.js';

export function renderBoard(game, boardElement) {
  if (!boardElement) return;
  boardElement.innerHTML = '';
  try {
    boardElement.setAttribute('role', 'grid');
    boardElement.setAttribute('aria-label', 'Sudoku board');
  } catch {}

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const wrapper = el('div', { className: 'cell-container' });

      const cell = el('input', {
        type: 'text',
        className: 'cell',
        maxLength: 1,
      });
      // Data attributes
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      // Input mode: avoid OS keyboards on touch
      if (game.touchMode) cell.setAttribute('inputmode', 'none');
      else cell.setAttribute('inputmode', 'numeric');
      cell.setAttribute('autocomplete', 'off');
      cell.setAttribute('autocorrect', 'off');
      try {
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-selected', 'false');
        cell.setAttribute('aria-label', `Row ${row + 1}, Column ${col + 1}`);
        cell.setAttribute('aria-invalid', 'false');
      } catch {}

      const notes = el('div', { className: 'notes' });
      notes.dataset.row = String(row);
      notes.dataset.col = String(col);
      for (let n = 1; n <= 9; n++) {
        const note = el('div', { className: 'note-item', text: '' });
        note.dataset.value = String(n);
        notes.appendChild(note);
      }

      cell.addEventListener('click', () => game.selectCell(cell, row, col));
      cell.addEventListener('input', (e) => game.handleCellInput(e, row, col));
      cell.addEventListener('keydown', (e) => game.handleKeyDown(e, row, col));

      wrapper.appendChild(cell);
      wrapper.appendChild(notes);
      boardElement.appendChild(wrapper);
    }
  }
}

try {
  if (typeof window !== 'undefined') window.SudokuBoardView = { renderBoard };
} catch {}


