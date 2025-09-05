Rule: DevOps, CI, and Release
Applies to: .github/**, apps/**, packages/\*\*
Use when: configuring CI, adding scripts, preparing releases
Avoid: manual steps that can be automated
Definition of Done:

- CI passes: type check, lint, tests, bundle size
- Artifacts built for target platforms
- Versioning and changelog updated
- Rollback plan documented

# CI Jobs (single-package default)

- Install with `npm ci` (reproducible installs).
- Cache npm via `actions/setup-node` cache: 'npm' with `cache-dependency-path: package-lock.json`.
- Run scripts via npm scripts defined in `package.json`.
- Enforce coverage thresholds from testing rules.
- Bundle size check: fail if delta exceeds 5 percent.
- Security audit: `npm audit --workspaces --audit-level=high --omit=dev` (allowlist justified exceptions only).

# Release (single source of truth)

- Tag with semver.
- Generate release notes from conventional commits.
- For mobile, use EAS channels or equivalent; prefer progressive rollout.

- Standard: Changesets drives versioning and changelog. Base branch is `staging`. Use Node version from `engines.node` in `package.json` (repo standard: Node 20.x via Volta) when configuring CI.

# Environments

- Keep staging mirror close to production config.
- Feature flags controlled via config, not hard-coded.

# Optional: Workspaces guidance (for future)

- Lockfile: commit the root `package-lock.json`. Do not maintain per-package lockfiles.
- Avoid implicit reliance on hoisted deps. Each workspace must list its direct deps.
- Optional: add a `verify:deps` script using `npm ls --workspaces --all` or `depcheck` to fail on extraneous/missing deps.

# Always / Never

- Always run security audit in CI and fail on high vulnerabilities.
- Always sign builds where supported.
- Never publish without automated checks.
- Never keep long-lived feature branches without rebasing.

## Example: GitHub Actions outline (single-package)

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
