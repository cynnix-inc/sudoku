# Changelog

## Unreleased

- Classic: Seed footer now supports copy-to-clipboard with confirmation toast (Issue #63).
- Classic: Auto-pause implemented for AppState (native) and visibility/blur (web). Tagged BDD with @issue-105 (Issue #105).
- Classic: Prevent default browser shortcuts/scroll for handled keys on web; add BDD @issue-106 and tests (Issue #106).
- Classic: Persist notes mode, paused state, and locked digit across sessions; add BDD @issue-107 and tests (Issue #107).
- Classic: End-state banner (solved/game over) and restart with same seed; add BDD @issue-108 and tests (Issue #108).
- Classic: Accessibility polish for cells' screen reader labels; updated BDD @issue-109 and added tests (Issue #109).
- Classic: Numpad aligns to grid width; single-row layout; BDD/tests added (Issue #110).
- Classic: Tools moved below numpad as icon-only buttons with a11y labels; BDD added (Issue #111).
- Classic: Header shows hearts-only lives with accessible label; timer right-aligned (Issue #112).

## v0.9 — 2025-08-20

- Clarified MVP layout specs: numpad single row aligned to grid; tools as icon-only below numpad; hearts-only lives; timer right-aligned with icon-only pause (refs #110, #111, #112, #116).
- Clarified seed display policy: numeric seed shown to players; added Daily numeric seed acceptance; updated fixtures to numeric seed value (refs #114).
- Acceptance: Undo/Redo must not change lives; added Gherkin scenario and unit tests (refs #113).
- Added ADR-0003 to document UI layout and controls decisions (refs #110, #111, #112, #115, #116, #117, #118).
- Updated QA features for layout, a11y, highlighting, and daily seed; expanded spec tracking with new issue IDs.
