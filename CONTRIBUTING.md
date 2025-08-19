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

### Install the CLI extension (If not already installed)
```bash
gh extension install yahsan2/gh-sub-issue
```

### Link an existing issue as a sub-issue
```bash
gh sub-issue add <epic-number> <issue-number> -R cynnix-inc/sudoku
```

### Create a new sub-issue under an epic (generic)
```bash
gh sub-issue create --parent <epic-number> \
  --title "[<Area or Type>] <Concise title>" \
  --body "Parent: #<epic-number>\n\nContext:\n- ...\n\nAcceptance Criteria:\n- ...\n\nOut of scope:\n- ...\n\nTech notes:\n- ..." \
  --label "type/<feature|bug|chore|docs|refactor|test>,area/<area>,priority/<p0|p1|p2>,status/<ready|triage|in-progress>" \
  --milestone "<milestone name>" \
  -R cynnix-inc/sudoku
```

### Example: create a Bug sub-issue
```bash
gh sub-issue create --parent <epic-number> \
  --title "[Bug] App crashes on launch (Android 14)" \
  --body "Parent: #<epic-number>\n\nSteps to Reproduce:\n1. ...\n2. ...\n\nExpected:\n- ...\n\nActual:\n- ...\n\nLogs:\n- ..." \
  --label "type/bug,area/android,priority/p0,status/triage" \
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

#### Label taxonomy and usage
- **type/**: nature of work
  - `type/feature`: new functionality
  - `type/bug`: a defect; default status `status/triage`
  - `type/chore`: maintenance, tooling, infra
  - `type/docs`: documentation-only
  - `type/refactor`: internal code changes without behavior change
  - `type/test`: tests-only tasks
- **area/**: subsystem or surface
  - Examples: `area/ui`, `area/game`, `area/services`, `area/android`, `area/ios`, `area/web`
  - Create a new `area/<name>` when work consistently targets a new domain (see “Creating new labels”)
- **mode/**: game mode when applicable
  - `mode/classic`, `mode/daily`
- **priority/**: impact and urgency
  - `priority/p0`: critical (crash, data loss, security); fix ASAP
  - `priority/p1`: high (major feature impaired, MVP blocker)
  - `priority/p2`: normal
- **status/**: lifecycle state
  - `status/triage` → `status/ready` → `status/in-progress` → `status/done` (or `status/blocked`)

#### Discover labels and milestones
- **List labels**
```bash
gh label list -R cynnix-inc/sudoku
```
- **List labels via API (names only)**
```bash
gh api repos/cynnix-inc/sudoku/labels --paginate --jq '.[].name'
```
- **List milestones (titles)**
```bash
gh api repos/cynnix-inc/sudoku/milestones --jq '.[].title'
```

#### Creating new labels (when needed)
- Prefer reusing existing families. Only add new labels when:
  - A new `area/<name>` is consistently used across issues.
  - Avoid adding new `type/*`, `priority/*`, or `status/*` without maintainer discussion.
- Create a new area label:
```bash
gh label create area/<new-area> -R cynnix-inc/sudoku --color BFD4F2 --description "<short description>"
```

#### Bug issues quick guidance
- Use `type/bug`, an appropriate `area/*`, and start with `status/triage`.
- Set `priority/p0` for crashes/data loss/security; `priority/p1` if major but not catastrophic; otherwise `priority/p2`.
- Add `mode/*` if the bug is specific to a game mode.
- Add a milestone (e.g., "MVP v0.9") if it must land in that release; otherwise omit.

Reference: `gh-sub-issue` usage and options are documented here: https://github.com/yahsan2/gh-sub-issue

## Styling
- Tailwind/NativeWind is scaffolded and kept for upcoming UI work. It may not be widely used in the codebase yet; prefer consistent usage where practical and avoid mixing multiple styling paradigms in the same component.
