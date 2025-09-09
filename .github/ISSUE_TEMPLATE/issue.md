---
name: Issue
about: Implement a focused task with clear acceptance criteria
title: '[Area] <concise goal>'
labels: status/ready
assignees: ''
---

### Context

- Why this matters; link to the MVP spec / ADRs.

### Acceptance Criteria

- Given ... → When ... → Then ...
- Given ... → When ... → Then ...

### Out of scope

- Items not addressed in this issue.

### Tech notes

- Target files (e.g., `app/...`), data shapes, flags, tests to add.

### Tracking (REQUIRED)

- Parent Epic: #<epic-issue-number>
- Related: #<other-issue-refs>

Notes:

- Prefer using the GitHub CLI to link this as a sub-issue:
  - `gh extension install yahsan2/gh-sub-issue`
  - `gh sub-issue add <epic-issue-number> <this-issue-number> -R cynnix-inc/sudoku`
