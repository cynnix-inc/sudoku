Rule: DevOps, CI, and Release
Applies to: .github/**, apps/**, packages/**
Use when: configuring CI, adding scripts, preparing releases
Avoid: manual steps that can be automated
Definition of Done:
  - CI passes: type check, lint, tests, bundle size
  - Artifacts built for target platforms
  - Versioning and changelog updated
  - Rollback plan documented

# CI Jobs
- Install with `npm ci` (reproducible installs).
- Cache npm via `actions/setup-node` cache: 'npm' with `cache-dependency-path: package-lock.json`.
- Run scripts across workspaces with `npm run --workspaces <script>`.
- Enforce coverage thresholds from testing rules.
- Bundle size check: fail if delta exceeds 5 percent.
- Security audit: `npm audit --workspaces --audit-level=high --omit=dev` (allowlist justified exceptions only).

# Release
- Tag with semver.
- Generate release notes from conventional commits.
- For mobile, use EAS channels or equivalent; prefer progressive rollout.

# Environments
- Keep staging mirror close to production config.
- Feature flags controlled via config, not hard-coded.

# npm-specific Notes (monorepo)
- Lockfile: commit the root `package-lock.json`. Do not maintain per-package lockfiles.
- Avoid implicit reliance on hoisted deps. Each workspace must list its direct deps.
- Optional: add a `verify:deps` script using `npm ls --workspaces --all` or `depcheck` to fail on extraneous/missing deps.

# Always / Never
- Always run security audit in CI and fail on high vulnerabilities.
- Always sign builds where supported.
- Never publish without automated checks.
- Never keep long-lived feature branches without rebasing.

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
      - run: npm run --workspaces lint
      - run: npm run --workspaces typecheck
      - run: npm run --workspaces test
      - run: npm run --workspaces build
      - run: npm run verify:deps
      - run: npm run --workspaces bundle:check
      - run: npm audit --workspaces --audit-level=high --omit=dev
```
