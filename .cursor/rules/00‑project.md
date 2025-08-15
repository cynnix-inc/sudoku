# Ultimate Sudoku — Project Rules

Scope
- Environment and scaffolding only. Do not implement Sudoku logic until asked.
- Single app repo using Expo, TypeScript strict, NativeWind, React Native Web.

Principles
- Readability and accessibility first. Large grid numbers. High contrast.
- Keep components small and pure. Move side effects into hooks.
- Measure before you optimize. Avoid heavy blur on scrolling views.

Required on every change
- Add or update tests that match the change.
- Update docs when scripts, env, CI, or public APIs change.
- No console.log in committed code.

Branches and PRs
- Never commit to `main`. Create a feature branch.
- Conventional Commits for titles. Small PRs.
- Add Acceptance Criteria and a short test plan to the PR.

Enforced quality bars
- TypeScript strict must pass.
- ESLint must pass.
- Jest coverage target: 90 statements, 90 branches, 90 functions, 90 lines for core logic. UI files may use a per‑path override to 80 when needed.
