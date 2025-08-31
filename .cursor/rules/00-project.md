Rule: Project Overview and Repo Map for Ultimate Sudoko
Applies to: ./, apps/**, packages/**
Use when: creating new features, scaffolding folders, onboarding, planning
Avoid: changing gameplay mechanics without a clear request
Definition of Done:

- The feature fits within scope and target platforms
- Folder paths match the repo map
- No unauthorized dependencies added
- Linked docs updated where relevant

# Ultimate Sudoko: Project Overview

This project builds a lightweight, high-quality Sudoku experience with modern tooling and strict quality gates.

## Scope and Targets

- Platforms: React Native (Expo), iOS, Android, Web where practical.
- Languages: TypeScript.
- Package manager: npm (workspaces).
- Monorepo structure with apps and packages folders.
- Focus: core Sudoku gameplay, clean UI, reliable performance.

## Repo Map (authoritative paths)

```
apps/
  mobile/
    app/                 # Expo Router screens
    components/          # App-specific UI
    hooks/               # App-specific hooks
    assets/              # Images, fonts, sounds
    test/                # App-level tests
  web/
    src/                 # Web entry where applicable
    test/
packages/
  ui/                    # Reusable UI components
  core/                  # Game logic, Sudoku engine, helpers
  config/                # ESLint, Prettier, tsconfig, shared tooling
  testing/               # test-utils like renderWithProviders
docs/                    # This ruleset and ADRs
```

## Working Agreements

- Keep commits small and descriptive.
- PRs must pass CI, tests, type check, and lint.
- Changes to game rules or generator require an ADR.
- npm lockfile policy: commit package-lock.json; use `npm ci` for reproducible installs.

## Examples

- Adding a new screen: create apps/mobile/app/<feature>/index.tsx, add tests, export any shared UI in packages/ui.
- Updating Sudoku engine: modify packages/core and add unit tests under packages/core/**tests**.
