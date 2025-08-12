- Daily Calendar UX
  - Legend container hugs contents and does not introduce horizontal scroll.
  - Streak pills (Current/Best) appear directly under the calendar title, are ~50% larger than standard controls, and have generous vertical spacing from the calendar grid.
  - Calendar grid never overflows the modal horizontally at common widths.
  - Legend presents as a 2×3 grid on normal screens; collapses to a single tooltip pill on narrow screens.
  - Auto‑focus moves to the first playable day cell on open; Arrow keys navigate days; PageUp/PageDown change months; Enter/Space activates a day.
  - Play today button is placed to the right of Close in the footer and only shows when today is visible and not completed.
High-level acceptance criteria for Ultimate Sudoku

- New Game
  - Clicking `#new-game-btn` creates a fresh puzzle with 81 cells. Givens vary by difficulty and may be below 20 for higher levels (approximate givens: Easy≈51, Medium≈41, Hard≈31, Expert≈21, Master≈19, Extreme≈17).
  - The `#mode-indicator` updates to show difficulty for normal games, and shows "Daily mmm-DD" in Daily mode.
  - Header layout: user chip appears at far left in `header-left` when signed in, the `#mode-indicator` renders centered within `header-center`, and the hamburger menu button `#menu-btn` remains at far right in `header-right`.

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
  - Daily modal shows date and difficulty; starting Daily loads a deterministic puzzle for the UTC day and sets fixed lives by difficulty (easy:6, medium:5, hard:4, expert:3, master:2, extreme:1). The Lives slider is disabled during Daily. Leaving Daily restores the user's lives setting.
  - Daily reroll works once per day and generates an alternate deterministic board; subsequent rerolls are blocked.

- Stats
  - Stats modal opens from Menu and displays totals, win rate, best times, and recent daily results based on local or synced data.
  - If signed in with Google, stats are synced to a cloud account and restored on other devices when logging in.
  - Settings sync occurs on sign‑in and after saving settings; newer data (local vs remote) wins.

- Settings
  - Settings reflect stored values, can be toggled, and persist across reloads.
  - Lives: dragging the slider to 11 sets Unlimited (∞). Changes made during an active game apply to the next game; otherwise they apply immediately.
  - Week start switch alters calendar weekday render.
  - When signed in, gameplay and calendar settings (auto‑candidates, auto‑advance, zen mode, lives enabled/limit, week start, hint mode) sync across devices. Appearance (dark mode, accent) remains device‑specific.
  - Board sizing controls persist and apply after closing Settings; preview inside Settings updates live while sliding.
  - Calendar cells include readable hover text and aria‑labels with date and difficulty.

- Accessibility/UI
  - 81 cells render with role grid and gridcell attributes; ARIA attributes update selection and health bar announces remaining lives; number pad visible on mobile; keyboard input supported on desktop.

Modals and overlays

- All app modals (New Puzzle, Stats, Settings, Help, Daily, Confirm) must:
  - Dim the entire viewport with a semi‑transparent black mask and subtle blur
  - Be centered and responsive, never exceeding viewport
  - Support backdrop click to close where appropriate (Confirm excluded)
  - Trap focus while open and support Escape to close
  - Use a centralized modal controller that:
    - Toggles an `is-open` class (no inline `style.display`)
    - Locks body scroll while any modal is open
    - Restores focus to the opener on close
    - Emits `modalopen`/`modalclose` events for orchestration
    - Supports `data-backdrop-close="false"` to disable backdrop closing (used by Confirm)

- Help modal
  - Displays gameplay guidance as a grid of sections (Lives, Hints, Sync, Zen, Mobile, Keyboard) using consistent `.help-card` styling.
  - Contains an About section rendered as a collapsible details element inside the grid with the same `.help-card` look.
  - The About section is collapsed by default and can be expanded/collapsed via its summary row.
  - The About section shows the current app version in `#app-version` and a brief data policy. No external repository/issue links are shown.

- Home screen (landing overlay) must:
  - Use the same full‑viewport dimming and blur as other modals
  - Be displayed with `display:flex` and centered content card
  - Vertically center relative to the live game area (between `.controls-strip` and `.number-pad`) using dynamic top/bottom padding
  - Maintain equal top/bottom spacing and avoid undimmed bands
  - Respect Escape/backdrop close behavior consistent with other overlays
  - Quick actions row `.landing-quick` shows three icon buttons in this exact order: Stats | Settings | Help
  - Each quick action opens its modal when clicked while the landing is visible: Stats → `#stats-modal`, Settings → `#settings-modal`, Help → `#help-modal`
  - When a modal is opened from the landing overlay and then closed via Close button, ESC, or backdrop: landing overlay reappears unless a game has started in the meantime
  - The header menu popover shows the compact icons with Settings and Help; order there is not constrained unless specified elsewhere

- Signed‑in name display
  - Header chip and landing greeting use only the user's first name (from Google `full_name`), falling back to email or "Player" when missing.

Mobile usability

- Touch detection and input
  - When a touch-capable device is detected (navigator.maxTouchPoints > 0), board inputs set inputmode="none" to suppress the OS keyboard and rely on the on-screen number pad.
  - Subtle haptic feedback fires on direct user actions (place/erase/paint/notes) when navigator.vibrate is supported.

- Gestures
  - Double‑tap the focused cell erases it (if not a given).
  - Long‑press on a cell with a locked number toggles a note for that number (quick‑note affordance).
  - Press‑and‑hold the Notes button enables Notes only while held; releasing restores the previous notes state.

- Layout and ergonomics
  - Number pad is visible and sticky at the bottom on small screens, respecting safe‑area insets (uses env(safe-area-inset-bottom)).
  - Tap targets for primary controls are at least 44×44 px.
  - Board width and cell sizes are computed to avoid sub‑pixel gaps and prevent horizontal scrolling on narrow screens.
  - Touch drag painting does not trigger page scroll (board uses touch-action: none).

Regression test coverage (baseline)

- Unit core logic
  - `generateSolvedBoard` produces a complete valid grid.
  - `isValidMove` enforces row/col/box constraints.
  - `solveBoard` solves a partially empty valid grid.

- E2E smoke
  - Page renders 81 cells; entering a number updates a cell.
  - Toggling the timer shows/hides pause overlay.

Mobile unit coverage

- Touch mode sets inputmode="none" on cells and disables OS keyboard.
- Board sets touch-action: none and binds pointer handlers.
- Double‑tap erase clears a non‑given cell.
- Notes button press‑and‑hold temporarily enables Notes and restores state on release.
- Haptics: when in touch mode and supported, navigator.vibrate is called on user actions.



