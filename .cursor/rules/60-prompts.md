## Quick Reference: Git — which option when?
# New work: git checkout -b feat/<name> off staging
# Sync your branch: git pull --rebase origin staging (from your feature branch)
# Commit small: git add -p && git commit -m "..."
# Publish branch: git push -u origin feat/<name>
# Open PR: feature → staging
# Release: PR staging → main
# Hotfix: branch off main, PR to main, then merge main back into staging

Rule: Approved prompt patterns for Cursor
Applies to: `app/**`
Use when: asking the assistant to scaffold or modify code

Purpose
- Provide copy-pastable, safe templates that match this repo.

Out of scope
- Workflow and CI (see `50-devops.md`).

Priority
- If rules conflict, this file yields to `50-devops.md` and `40-security.md`.
Avoid: vague requests; always specify files and edits
Definition of Done:
  - Files created or edited as listed
  - Tests added or updated
  - Docs and exports updated
  - CI passes locally

# Macro: Create a new screen (Expo Router)
Prompt:
"""
Create a new screen called <Name> using Expo Router.
Use functional components, TypeScript, and tokens from packages/ui.
Add accessibility labels for interactive elements.
Edits:
  - app/<name>/index.tsx (new)
  - __tests__/app/<name>.test.tsx (new)
  - docs/screens.md (append short usage snippet)
Definition of Done:
  - Renders without errors via renderWithProviders
  - Test covers at least one user interaction
  - Lint and typecheck pass
"""

# Macro: Add a domain helper
Prompt:
"""
Implement a new Sudoku domain helper named <HelperName> in `app/lib`.
Keep it pure and deterministic.
Edits:
  - app/lib/<helperName>.ts (new)
  - __tests__/lib/<helperName>.test.ts (new)
  - docs/adr/YYYY-MM-DD-<helperName>.md (new ADR if performance or API changes)
Definition of Done:
  - 100 percent coverage on this helper
  - No additional deps
  - Benchmarks documented in the ADR
"""

# Macro: Add a UI component (presentational)
Prompt:
"""
Create a reusable UI component <ComponentName> under `app/components/`.
Keep presentational only, no side effects.
Edits:
  - app/components/<ComponentName>.tsx (new)
  - __tests__/components/<ComponentName>.test.tsx (new)
  - docs/ui.md (append snippet)
Definition of Done:
  - Component renders and is accessible
  - Unit test verifies props and interactions
  - Tree-shakeable and side-effect free
"""

# Macro: Wire basic analytics (privacy-first)
Prompt:
"""
Add basic anonymous analytics with opt-out.
Do not send PII.
Edits:
  - app/providers/analytics.ts (new)
  - app/_layout.tsx (initialize provider)
  - docs/analytics.md (document events and opt-out)
  - __tests__/app/analytics.test.tsx (new)

# Self-check
- Prompts list exact files to edit and tests to add.
- Paths use `app/` and `__tests__/` consistent with this repo.
- Macros avoid adding new dependencies unless specified.
- Resulting diffs pass `npm run lint`, `npm run typecheck`, and `npm test`.
Definition of Done:
  - Events queued offline, sent over HTTPS
  - Opt-out respected across sessions
  - No PII, security checklist passes
"""
