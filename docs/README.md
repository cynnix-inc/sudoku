# Ultimate Sudoku – Engineering Docs

This directory contains project Q&A, rules, and Epic workflows. Follow these when implementing features and running CI.

## Epic Workflow (Example: Classic Mode – Playable 9×9 slice #14)

High-level process:
- Create an epic branch from `staging` (fallback to `main` if `staging` is not present).
- Work through Epic sub-issues sequentially.
- For each sub-issue:
  - Create a feature branch off the epic branch.
  - Implement changes and update tests, ADRs, and CHANGELOGs.
  - Open a PR targeting the epic branch.
  - Enable auto-merge; wait until all checks are green and PR merges.
  - Rebase the epic branch on the latest `staging`.

Automation helper:
- A helper script exists at `scripts/epic-14.sh` to orchestrate the flow using GitHub CLI.
- Requirements: `git`, `gh` (authenticated), `jq`.
- Usage:
  ```bash
  bash scripts/epic-14.sh
  ```

The script:
- Ensures the epic branch `epic/14-classic-9x9` exists from `staging` (or `main`).
- Lists open sub-issues linked to Epic `#14`.
- For each, creates a feature branch, commits a placeholder doc under `docs/epic-14/sub-issues/`, opens a PR to the epic branch, enables auto-merge, polls until merged, and rebases the epic branch on the base.

Note: Replace placeholder docs with real code edits, tests, ADRs, and CHANGELOG updates per `.cursor/rules`.

## CI Expectations

Run these locally before pushing:
```bash
npm run lint
npm run typecheck
npm test
npm run bundle:check
npm run verify:deps
```

See `.cursor/rules/50-devops.md` and `.cursor/rules/30-testing.md` for details.

