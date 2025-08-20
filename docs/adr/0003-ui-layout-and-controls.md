# ADR-0003: UI Layout and Controls – Numpad Row, Tool Icons, Timer Icon, Highlighting, and Lock Toggle

Date: 2025-08-20

Status: Accepted (Finalized for MVP)

Context

- MVP requires a clean, compact game UI on web and native, with high accessibility.
- Feedback identified gaps: discoverability of Lock, lack of same-digit highlighting, non-responsive web layout, and verbose timer label.

Decision

1. Numpad renders as a single row aligned to the grid width. Tools render as icon-only below the numpad with accessible labels (refs #110, #111).
2. Lives are displayed as hearts-only with an accessible label; no textual “Lives” label (ref #112).
3. Timer shows time plus an icon-only Pause/Resume control; no textual “Timer” label (ref #116).
4. Selecting a value in-grid or activating a numpad digit highlights all same digits in the grid and the corresponding numpad key (ref #115).
5. Provide a dedicated Lock toggle button in the tool row in addition to the long-press gesture on numpad digits (ref #118).
6. Ensure responsive behavior on web: grid fully visible on small screens, single-row numpad, adequate hit targets; centered layout on tablet/desktop (ref #117).

Consequences

- Improves discoverability, scanning speed, and accessibility without increasing visual noise.
- Requires updates to Header, Numpad, and Board implementations plus tests and feature files.
- Minor increase in UI state synchronization (active digit, lock state, highlight state).

Alternatives Considered

- Keep long-press-only for Lock (rejected: low discoverability).
- Keep textual timer label (rejected: redundant; icon + aria-label suffices).

Migration

- Update MVP spec and QA features (done).
- Add tests for numeric seed display, timer icon behavior, undo/lives rule, and numpad presence.
- Link implementation issues under epics (#14, #21, #22) and track #110–#118.
