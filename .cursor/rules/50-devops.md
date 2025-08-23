DevOps, CI, and releases

When to use: configuring CI/CD, defining workflow, and preparing releases.

Purpose

- Define required scripts, CI gates, branching, and commit style.

Out of scope

- Code style and architecture (see `20-style-guide.md`, `10-architecture.md`).

Priority

- Wins over other files for workflow decisions (branching/commits/release).

Definition of Done

- CI passes: lint, typecheck, tests, build, bundle check
- Security audit reviewed
- Versioning and changelog updated
- Rollback plan documented

# CI Jobs (npm scripts in this repo)

- Install with `npm ci`.
- Node via Volta or `actions/setup-node` (Node 20). Cache: npm with `cache-dependency-path: package-lock.json`.
- Run: `npm run lint`, `npm run typecheck`, `npm test -- --ci`, `npm run build`.
- Enforce coverage thresholds from testing rules.
- Bundle size check: `npm run bundle:check` (fail if delta > 5%).
- Dependency verification: `npm run verify:deps`.
- Security audit: `npm audit --audit-level=high --omit=dev` (allowlist justified exceptions only).
- Android native checks: skip gracefully in web-only CI when `android/app/build.gradle` is absent.

# Release

- Tag with semver.
- Generate release notes from conventional commits.
- For mobile, use EAS channels or equivalent; prefer progressive rollout.

# Environments

- Keep staging close to production config.
- Feature flags controlled via config, not hard-coded.

# Workflow: Branching strategy

- Branches
  - main: production
  - staging: integration
  - feat/_, fix/_: short-lived
  - hotfix/\*: branch from main, then back-merge to staging
- Flow
  1. `git checkout staging && git pull && git checkout -b feat/<name>`
  2. PR to `staging`. CI runs lint/types/tests/build.
  3. Promote via PR from `staging` to `main`.
  4. Hotfix: branch from `main`, PR to `main`, then PR back to `staging`.

# Issue tracking (Epics, Issues, Sub-issues)

- Canonical guidance for creating and linking sub-issues, labels, and milestones lives in `CONTRIBUTING.md` → "Epics, Issues, and Sub-issues".

# Commit messages (Conventional Commits)

- Format: `<type>(scope): summary`
- Types: feat, fix, chore, docs, refactor, test, build, ci, perf
- Examples:
  - `feat(game): add candidate highlighting`
  - `fix(ui): correct status bar color on Android`

# Security (CI & dependencies)

- Never commit secrets. Use env vars and platform secret stores.
- Validate dependency licenses, sizes, and vulnerabilities before adding.
- Fail CI on high vulnerabilities; justify any allowlists.

## Example: GitHub Actions outline (npm workspaces)

```yaml
name: ci
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --ci
      - run: npm run build
      - run: npm run verify:deps
      - run: npm run bundle:check
      - run: npm audit --audit-level=high --omit=dev
```

# Self-check

- CI job runs `npm run lint`, `npm run typecheck`, `npm test -- --ci`, `npm run build`, `npm run verify:deps`, and `npm run bundle:check`.
- Branching and commit messages follow this rule.
- Security audit reviewed; any allowlists justified.
- Release notes and rollback plan present when releasing.
