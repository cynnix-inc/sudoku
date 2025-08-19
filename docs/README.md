# /docs – Product & QA Documentation

This folder holds the **locked MVP spec** for Ultimate Sudoku and supporting QA assets suitable for a Cursor-based repo.

## Structure
- `product/ultimate-sudoku-mvp-v0.9.md` — canonical product spec (locked).  
- `qa/features/*.feature` — **Gherkin** acceptance tests (MVP).  
- `adr/` — short **Architecture Decision Records** for significant decisions.  
- `CHANGELOG.md` — human-readable change log for docs/spec.
 - `qa/ROADMAP.md` — QA & BDD roadmap checklist and best practices.

## Authoring Conventions
- Treat `product/ultimate-sudoku-mvp-v0.9.md` as **source of truth**.  
- Use **(Phase 1)** vs **(Phase 2+)** flags for scope.  
- Update ADRs when decisions change; bump changelog.  
- Keep feature files focused and **testable** (Given/When/Then).

## Suggested Repo Locations
- Keep `/docs` at **repo root** for discoverability.  
- Link from root `README.md` to `/docs/product/ultimate-sudoku-mvp-v0.9.md`.  
- For Cursor: pin this doc in the sidebar and enable outline TOC for fast nav.

## Planning Workflow (Epics, Issues, Sub-issues)
- Track large scopes as Epics (issue title prefixed with `[Epic]`).
- Break work into Issues with clear Acceptance Criteria and Tech notes.
- Link Issues under their Epic using the GitHub CLI sub-issue extension.

Canonical guide: see `CONTRIBUTING.md` → "Epics, Issues, and Sub-issues" for creating sub-issues, labels, and milestones.

Quick reference:
```bash
# install extension
gh extension install yahsan2/gh-sub-issue

# link an existing issue under an epic
gh sub-issue add <epic-number> <issue-number> -R cynnix-inc/sudoku

# list sub-issues for an epic
gh sub-issue list <epic-number> -R cynnix-inc/sudoku --state all
```

Extension docs: https://github.com/yahsan2/gh-sub-issue
