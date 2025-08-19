# Ultimate Sudoku

## Quick start

- Install dependencies (Node 20.x via Volta is pinned):
  - `npm ci`
- Run the app:
  - Web: `npm run web`
  - Android: `npm run android`
  - iOS (on macOS): `npm run ios`

## Docs

- Product spec (source of truth): `docs/product/ultimate-sudoku-mvp-v0.9.md`
- ADRs: `docs/adr/` (see `docs/adr/README.md`)
- Acceptance (Gherkin): `docs/qa/features/`
- Database & migrations (Supabase): `docs/db.md`
- Android setup: `docs/android-setup.md`
- iOS setup: `docs/ios-setup.md`

## Contributing

See `CONTRIBUTING.md` for branching, commit style, quality gates, and PR expectations.

### Tooling & Releases

- Uses **Husky** + **lint-staged** to enforce linting and tests pre-commit
- **Commitlint** enforces Conventional Commits
- **Changesets** for versioning and changelog; base branch is `staging`
- **Dependabot** keeps dependencies up to date
- **Lighthouse CI** runs on PRs to `staging` for basic web performance checks
