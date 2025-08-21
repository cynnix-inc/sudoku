# Changelog

## Unreleased

- Classic: Seed footer now supports copy-to-clipboard with confirmation toast (Issue #63).
- Classic: Auto-pause implemented for AppState (native) and visibility/blur (web). Tagged BDD with @issue-105 (Issue #105).

## v0.9 — 2025-08-20

- Clarified MVP layout specs: numpad single row aligned to grid; tools as icon-only below numpad; hearts-only lives; timer right-aligned with icon-only pause (refs #110, #111, #112, #116).
- Clarified seed display policy: numeric seed shown to players; added Daily numeric seed acceptance; updated fixtures to numeric seed value (refs #114).
- Acceptance: Undo/Redo must not change lives; added Gherkin scenario and unit tests (refs #113).
- Added ADR-0003 to document UI layout and controls decisions (refs #110, #111, #112, #115, #116, #117, #118).
- Updated QA features for layout, a11y, highlighting, and daily seed; expanded spec tracking with new issue IDs.
