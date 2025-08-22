# Epic automation workflow template

Automate an Epic by iterating sub-issues top-to-bottom and shipping sequentially.

## Parameters
- **EPIC_NUMBER**: <e.g., 14>
- **EPIC_TITLE**: <e.g., Classic Mode – Playable 9×9 slice>
- **EPIC_SLUG**: <kebab-case short slug, e.g., classic-9x9>
- **REPO**: cynnix-inc/sudoku

## Goal
- Drive Epic #<EPIC_NUMBER> end-to-end by processing sub-issues in order (one at a time, no pauses).
- Maintain repository workflow (branching, Conventional Commits, CI gates, tests/docs, rebase, dependency policy, Node 20.x/Volta) per `CONTRIBUTING.md`.
- Use a dedicated epic integration branch; merge each sub-issue into it; when complete, merge epic to `staging`.

## Prerequisites
- GitHub CLI authenticated and sub-issues extension installed:
  - `gh auth status`
  - `gh extension install yahsan2/gh-sub-issue`
- Node 20.x via Volta (pinned in `package.json`). Verify:
  - `node -v`
  - `npm ci`

## High-level plan
1) Create the epic integration branch
```
# From repo root
git checkout staging && git pull
# Example: epic/<epic-number>-<epic-slug>
git checkout -b epic/<EPIC_NUMBER>-<EPIC_SLUG>
npm ci && npm run ci
```

2) Enumerate sub-issues for the Epic
```
# Open sub-issues only
gh sub-issue list <EPIC_NUMBER> -R cynnix-inc/sudoku --state open
```
- Process top-to-bottom; handle one sub-issue at a time.

3) For each sub-issue (loop)
- Prepare branch
```
# Update and rebase epic branch on latest staging
git checkout staging && git pull
git checkout epic/<EPIC_NUMBER>-<EPIC_SLUG> && git fetch origin && git rebase origin/staging

# Derive a kebab-case slug from the sub-issue title, then create a feature branch from the epic branch
# bash/zsh
id=<ISSUE_NUMBER>
title=$(gh issue view "$id" -R cynnix-inc/sudoku --json title --jq .title)
slug=$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g;s/^-+|-+$//g')
git checkout -b "feat/<EPIC_NUMBER>-$slug"

# PowerShell
# $id=<ISSUE_NUMBER>
# $title = gh issue view $id -R cynnix-inc/sudoku --json title --jq .title
# $slug = ($title.ToLower() -replace "[^a-z0-9]+","-" -replace "(^-+|-+$)","")
# git checkout -b "feat/<EPIC_NUMBER>-$slug"
```
- Implement
  - Follow `CONTRIBUTING.md` (branching model, Conventional Commits, CI/tests/docs expectations).
  - Make minimal, focused edits per acceptance criteria; update tests/docs accordingly.
- Verify
  - `npm run ci` (lint, types, tests, build) must pass locally.
- Commit & push
  - Use Conventional Commits. Keep commits small and meaningful.
- Open PR
  - Base: `epic/<EPIC_NUMBER>-<EPIC_SLUG>`; Head: `feat/<EPIC_NUMBER>-<slug>`.
  - Merge when checks are green; close the sub-issue with a verification note.
- Immediately proceed to the next open sub-issue.

4) Finalize the epic
```
# Ensure epic branch is up to date and green
git checkout epic/<EPIC_NUMBER>-<EPIC_SLUG>
git fetch origin && git rebase origin/staging

# Open one PR: epic → staging
# PR body should summarize completed sub-issues, risks, and rollback plan
```
- After merge, close the Epic with links to merged PRs.

## Outputs and guardrails
- Edits: list of files changed, with tests alongside implementation (e.g., `app/**` and `__tests__/**`).
- Quality gates: all green locally and in CI before merging.
- PRs: one PR per sub-issue into the epic branch; one final PR epic → staging.
- Docs: call out any `docs/**` or ADR updates in PR body.
- If blocked by missing acceptance detail, note it in the sub-issue and move to the next ready sub-issue.

## Guidance: how to pull sub-issues
- List open sub-issues for the epic:
```
gh sub-issue list <EPIC_NUMBER> -R cynnix-inc/sudoku --state open
```
- Review issue details:
```
# Open in browser
gh issue view <ISSUE_NUMBER> -R cynnix-inc/sudoku --web
# Or fetch structured fields
gh issue view <ISSUE_NUMBER> -R cynnix-inc/sudoku --json title,body,labels,assignees,state
```
- Close after merge:
```
gh issue close <ISSUE_NUMBER> -R cynnix-inc/sudoku -c "Fixed via PR #<PR_NUMBER>"
```
- Re-list and repeat:
```
gh sub-issue list <EPIC_NUMBER> -R cynnix-inc/sudoku --state open
```

## Quick start for Epic #<EPIC_NUMBER>
```
# 1) Create epic branch
git checkout staging && git pull
git checkout -b epic/<EPIC_NUMBER>-<EPIC_SLUG>
npm ci && npm run ci

# 2) List sub-issues
gh sub-issue list <EPIC_NUMBER> -R cynnix-inc/sudoku --state open

# 3) Start with the top sub-issue and loop as described above
```
