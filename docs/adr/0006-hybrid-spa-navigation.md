# ADR-0006: Hybrid SPA Navigation (Router infra kept; state-based game screens)

Date: 2025-08-26

Status: Proposed

Context

- The app currently uses Expo Router/React Navigation patterns suitable for multi-screen apps.
- Product direction prefers a single-page-app feel for gameplay: switching modes (e.g., Classic, Daily) should not require distinct URL routes.
- We still want router infrastructure for web deep links (e.g., help/about) and future growth, but gameplay transitions should be instantaneous without route churn.

Decision

1. Keep router infrastructure for non-game surfaces and base app shell.
2. Represent gameplay screens (Classic, Daily, Archives) via application state rather than URL routes.
3. Remove public URL routes for gameplay (e.g., no `/daily` route); navigation between gameplay screens is handled within the app state/store.
4. Provide a not-found boundary for unknown routes with a minimal SPA-friendly page.

Consequences

- Web feels faster with fewer hard route transitions during gameplay.
- Deep links remain viable for documentation/help and future non-game pages.
- Tests, docs, and QA features must reflect no public gameplay URLs.

Implementation Notes

- Index screen selects the current gameplay screen via state and renders the corresponding component.
- Add a not-found boundary component for router fallbacks.
- Update tests to remove assumptions about `/daily` or similar gameplay URL routes.

References

- Product: docs/product/ultimate-sudoku-mvp-v0.9.md
- QA: docs/qa/features/08-navigation-help.feature
- Related Issues: #277, #278, #279, #280, #281
