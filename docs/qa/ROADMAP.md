# QA & BDD Roadmap

This file tracks upcoming QA/BDD enhancements. Prefer creating GitHub Issues for each item and linking back here. Keep this list lean and current.

## Near-term (Phase 1.1)

- Jest + Gherkin:
  - [ ] Add steps for gameplay controls (lock, notes, erase) referencing `01-gameplay-controls.feature`
  - [ ] Add steps for stats calculations referencing `05-stats-reporting.feature`
  - [ ] Add a tiny shared test helper for seeded puzzles
  - [ ] Reflect seed tap-to-copy (no dedicated copy button) in steps
- CI:
  - [ ] Add a separate `test-bdd` job in `.github/workflows/test.yml` (allow soft-fail initially)

## Mid-term (Phase 2)

- Web E2E (opt-in):
  - [ ] Introduce Playwright + `@cucumber/cucumber` for 1–2 critical smoke scenarios
  - [ ] Host Expo Web for tests (dev server or static export); collect traces on failure
  - [ ] Tag E2E features with `@e2e` and run only on `main` and nightly
- Data isolation:
  - [ ] Consider local Supabase in CI for DB-dependent E2E; otherwise mock network

## Later (Phase 2+)

- Native E2E (Detox):
  - [ ] Evaluate Detox for Android/iOS smoke tests; keep scenarios minimal
- Accessibility checks:
  - [ ] Add automated a11y validations for color contrast and landmarks on web

## Best practices

- Keep `.feature` wording stable and human-readable; avoid UI text coupling
- Reuse step vocabulary; prefer domain language (cell, candidate, lives)
- Flake control: retries for E2E, screenshots/traces, and timeouts tuned per step
