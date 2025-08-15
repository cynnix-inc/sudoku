# Testing

Test levels (now)
- Unit and component tests with Jest and React Native Testing Library.
- Web E2E smoke tests with Playwright.
- Native E2E with Detox planned for phase 2.

Coverage gates
- 90% statements, branches, functions, lines for core logic.
- UI directories can override to 80% when justified.

Policy
- Each new component or route includes a matching test file.
- Prefer a11y queries over testIDs when possible.
- Avoid snapshot‑only tests. Assertions should describe behavior.
- No network in tests. Mock Supabase and timers.

Placement
- Co‑locate tests as `*.test.ts` or `*.test.tsx` next to the subject, or in `__tests__/` for cross‑cutting utilities.

CI
- CI fails if coverage drops under thresholds.
- Upload coverage summary to PR.
