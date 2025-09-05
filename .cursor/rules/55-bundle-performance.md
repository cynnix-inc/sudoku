# Bundle & Performance Budgets (Issue #426)

Applies to: app/**, scripts/**, CI
Use when: adding deps, changing build config, introducing large assets
Avoid: unbounded bundle growth, heavy unused dependencies, large uncompressed assets
Definition of Done:

- Bundle size remains within budget thresholds
- Regressions > 5% fail CI unless explicitly authorized
- Heavy dependencies are justified and tree-shaken

## Budgets & Enforcement

- Baseline file: `dist/bundle-baseline.json`
- Check script: `scripts/bundle-check.mjs` (wired as `npm run bundle:check`)
- CI expectation: run after `npm run build`; fail when any entry grows > 5%
- Update baseline intentionally by setting env and re-running:
  - Windows/PowerShell: `$env:UPDATE_BUNDLE_BASELINE='1'; npm run build && npm run bundle:check`
  - Unix shells: `UPDATE_BUNDLE_BASELINE=1 npm run build && npm run bundle:check`

## Heavy Dependency Checklist

- Can we avoid this dep with platform APIs or smaller alternatives?
- Scope imports (e.g., subpath imports) to minimize included code
- Ensure dead code elimination: no side-effectful top-level requires
- Verify tree-shaking: build once and inspect the delta in `dist`
- Lazy-load optional features; avoid bundling when not needed

## Large Assets Policy

- Prefer vector or procedural assets over large bitmaps where possible
- Compress images and ensure sizing matches actual usage
- Host non-critical assets remotely if appropriate and cache aggressively

## Local Workflow

- Build: `npm run build` (outputs to `dist`)
- Check: `npm run bundle:check`
- If legitimate increase:
  - Update baseline (see above), include rationale in PR description

## CI Integration

- CI runs: lint → typecheck → tests → build → bundle:check
- Fails if any bundle entry > 5% larger than baseline
- Document approval and follow-up tasks if temporarily allowed

## References

- Related: `50-devops.md` (CI gates), `verify-deps.mjs`
- Script: `scripts/bundle-check.mjs`
- Issue: #426
