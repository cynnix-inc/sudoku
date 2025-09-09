---
name: Epic
about: Track a larger initiative with linked sub-issues (child issues)
title: '[Epic] <concise scope>'
labels: type/epic, enhancement, status/ready
assignees: ''
---

### Context

- Links to spec/ADR sections (e.g., `docs/product/ultimate-sudoku-mvp-v0.9.md` §X, `docs/adr/XXXX-*.md`).

### Scope

- What is included in this epic.

### Out of scope

- What will not be addressed here.

### Done when

- Describe the completion state for the epic (outcomes, UX, performance, tests).

### Child issues (sub-issues)

- Use the CLI to create/link:
  - `gh extension install yahsan2/gh-sub-issue`
  - `gh sub-issue create --parent <this-issue-number> --title "[...] ..." --label "type/feature,area/...,priority/p?,status/ready" --milestone "MVP v0.9" -R cynnix-inc/sudoku`
  - Or link existing: `gh sub-issue add <this-issue-number> <child-issue-number> -R cynnix-inc/sudoku`

### Notes

- Update `docs/product/ultimate-sudoku-mvp-v0.9.md` “Tracking” section with this epic number and key child issue numbers.
- Ensure each child issue includes a back-link to this Epic in its "Tracking (REQUIRED)" section.
