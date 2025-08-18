# Contributing to Ultimate Sudoku

Thank you for contributing! Please follow this guide to keep the project healthy and fast to ship.

## Branching model
- main: production. Protected; promotion-only via PR from `staging`.
- staging: integration branch. All feature PRs target `staging`.
- feature branches: short-lived, branch off `staging` (e.g., `feat/solver-naked-pairs`).
- hotfix: branch off `main` (e.g., `hotfix/crash-on-launch`), merge to `main` and back-merge to `staging`.

## Daily developer routine
1. `git checkout staging && git pull` then `git checkout -b feat/<short-name>`
2. Install: `npm ci` (Node managed by Volta; CI uses Node 20.x)
3. Run locally: `npm run dev` (or `npm run web`)
4. Before pushing: `npm run lint && npm run typecheck && npm test -- --ci`
5. Keep commits small; write a clear PR description.

## PR expectations
- All checks must pass: lint, types, tests, build.
- Add screenshots/GIF for UI changes.
- Include DB/Migration notes if schema changes.
- Add Risks and Rollback plan when relevant.

## Commit message style (Conventional Commits)
- Format: `<type>(scope): short summary`
- Common types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `build`, `ci`.
- Example: `feat(game): add candidate highlighting`.

## Rebase and sync
- Keep feature branches rebased on `staging`.
- Resolve conflicts locally, re-run quality checks, then push.

## Supabase migrations
- Place SQL files under `supabase/migrations/` (timestamped). Seed data in `supabase/seed.sql`.
- CI applies migrations on `staging` and `main`. Provide project refs and access token in repo secrets.

## Getting started
- Requirements: Node (Volta pinned), npm, Expo CLI (via npx), iOS/Android tooling as needed.
- Commands: `npm run dev`, `npm run web`, `npm run android`, `npm run ios`.


