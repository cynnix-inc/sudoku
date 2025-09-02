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
- Include DB/Migration notes if schema changes (see `docs/db.md`).
- Add Risks and Rollback plan when relevant.

## Product scope and ADRs

- MVP spec (source of truth): `docs/product/ultimate-sudoku-mvp-v0.9.md`
- ADRs (update when decisions change): `docs/adr/` (index at `docs/adr/README.md`)

## Acceptance criteria

- MVP acceptance scenarios (Gherkin): `docs/qa/features/`

## Platform setup

- Android: `docs/android-setup.md`
- iOS: `docs/ios-setup.md`

## Changing .cursor rules

- Open a PR updating files under `.cursor/rules/`.
- Include: Purpose, Out of scope, Priority, Examples, Non-examples, and a Self-check section in each changed file.
- Test the proposed rule by running Cursor on a throwaway branch and verifying diffs follow the rule.
- Required reviewers: at least one maintainer.

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

## Working from Issues

- Assign yourself to an Issue: create a feature branch using `feat/<short-name>` (e.g., `feat/classic-nav`).
- Open a PR to `staging` from your feature branch.
- Keep rebasing on `staging`; push updates to the same branch.
- When done, open/refresh the PR and request review.

## Epics, Issues, and Sub-issues

- We track large scopes as Epics (GitHub issues titled with `[Epic] ...`).
- Implementation tasks are Issues; Epics link to their children via sub-issues.
- Use the GitHub CLI sub-issues extension to manage hierarchy: see `gh-sub-issue`.

### Epic Processing Automation

The `scripts/epic-run.ps1` script automates the complete epic workflow:

#### Basic Usage

```bash
# Process the highest priority epic
.\epic-run.ps1

# Process a specific epic
.\epic-run.ps1 -EpicNumber 18

# Dry-run mode (see what would happen)
.\epic-run.ps1 -DryRun
```

#### Continuous Processing

```bash
# Process all epics sequentially
.\epic-run.ps1 -Continuous

# Start with a specific epic, then continue with others
.\epic-run.ps1 -EpicNumber 18 -Continuous
```

#### Features

- **Automatic epic selection** by priority (p0 > p1 > p2 > p3)
- **Sub-issue discovery** via gh-sub-issue or GitHub search fallback
- **Git branch management** with automatic rebasing and conflict resolution
- **CI integration** with automatic testing and validation
- **PR creation and management** with auto-merge when possible
- **Checkpoint system** for resume capability after interruptions
- **Continuous mode** for processing multiple epics in sequence

#### Resume Capability

If the script is interrupted, it can resume from where it left off:

- Saves progress after each sub-issue
- Tracks completed, failed, and current issues
- Automatically skips already-processed work
- Checkpoint files stored as `epic-{number}-checkpoint.json`

### Install the CLI extension

```bash
gh extension install yahsan2/gh-sub-issue
```

### Link an existing issue as a sub-issue

```bash
gh sub-issue add <epic-number> <issue-number> -R cynnix-inc/sudoku
```

### Create a new sub-issue under an epic

```bash
gh sub-issue create --parent <epic-number> \
  --title "[UI] 9×9 board rendering" \
  --body "Parent: #<epic-number>\n\nAcceptance Criteria..." \
  --label "type/feature,area/ui,priority/p0,status/ready" \
  --milestone "MVP v0.9" \
  -R cynnix-inc/sudoku
```

### List sub-issues under an epic

```bash
gh sub-issue list <epic-number> -R cynnix-inc/sudoku --state all
```

### Templates and labels

- Epics: Prefix title with `[Epic]`, include Scope and Done-when; add labels for area and priority.
- Issues: Start with a short bracketed area (e.g., `[UI]`), include Context, Acceptance Criteria, Out of scope, Tech notes.
- Labels: `type/*`, `area/*`, `mode/*`, `priority/*`, `status/*`.

Reference: `gh-sub-issue` usage and options are documented here: https://github.com/yahsan2/gh-sub-issue

## Styling

- Tailwind/NativeWind is scaffolded and kept for upcoming UI work. It may not be widely used in the codebase yet; prefer consistent usage where practical and avoid mixing multiple styling paradigms in the same component.
