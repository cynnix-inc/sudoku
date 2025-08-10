High-level acceptance criteria for Sudoku

- New Game
  - Clicking `#new-game-btn` creates a fresh puzzle with 81 cells and at least 20 givens.
  - The `#mode-indicator` updates to show difficulty.

- Board interactions
  - Clicking a cell focuses it; pressing number pad sets value in that cell (unless it is an initial given).
  - `#notes-toggle` toggles notes mode; number pad updates notes in the cell.
  - `#pad-erase-btn` clears value/notes for the selected cell.
  - Locked number painting: clicking a number on the pad toggles lock; dragging over cells paints that number.

- Validation and status
  - If mistakes are enabled, wrong entries decrement hearts and show a floater.
  - When all cells match solution, modal appears and win is recorded; timer stops.
  - Pause via `#timer-toggle` shows `#pause-overlay`; toggling resumes timer.

- Daily
  - Daily modal shows date and difficulty; starting daily loads a deterministic puzzle for the day and sets mistake limits by difficulty.
  - Daily reroll works once per day and generates an alternate deterministic board.

- Settings
  - Settings reflect stored values, can be toggled, and persist across reloads.
  - Week start switch alters calendar weekday render.

- Accessibility/UI
  - 81 cells render with role grid and gridcell attributes; number pad visible on mobile; keyboard input supported on desktop.

Regression test coverage (baseline)

- Unit core logic
  - `generateSolvedBoard` produces a complete valid grid.
  - `isValidMove` enforces row/col/box constraints.
  - `solveBoard` solves a partially empty valid grid.

- E2E smoke
  - Page renders 81 cells; entering a number updates a cell.
  - Toggling the timer shows/hides pause overlay.


