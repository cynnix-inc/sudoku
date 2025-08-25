Cursor task macros

When to use: asking the assistant to scaffold or modify code in `app/**`.

Purpose

- Provide copy-pastable, safe templates that match this repo.

Out of scope

- Workflow, issues, and labels (see `CONTRIBUTING.md` → "Epics, Issues, and Sub-issues"); CI (see `50-devops.md`).

Priority

- If rules conflict, this file yields to `50-devops.md` and `40-security.md`.
- Avoid vague requests; always specify files and edits.
- Definition of Done:
  - Files created or edited as listed
  - Tests added or updated
  - Docs and exports updated
  - CI passes locally

# Macro: Create a new screen (Expo Router)

Prompt:
"""
Create a new screen called <Name> using Expo Router.
Use functional components and TypeScript.
Add accessibility labels for interactive elements.
Edits:

- app/<name>/index.tsx (new)
- **tests**/app/<name>.test.tsx (new)
- docs/screens.md (append short usage snippet)
  Definition of Done:
- Renders without errors via renderWithProviders
- Test covers at least one user interaction
- Lint and typecheck pass
  """

# Macro: Add a domain helper

Prompt:
"""
Implement a new Sudoku domain helper named <HelperName> in `app/game`.
Keep it pure and deterministic.
Edits:

- app/game/<helperName>.ts (new)
- **tests**/game/<helperName>.test.ts (new)
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
- **tests**/components/<ComponentName>.test.tsx (new)
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
- app/\_layout.tsx (initialize provider)
- docs/analytics.md (document events and opt-out)
- **tests**/app/analytics.test.tsx (new)

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

# 📝 Issue / Feedback Template

Context:
While testing the current state of the game, I noticed the following issues or missing features:

1. [Describe issue here]
2. [Describe issue here]
3. [Describe issue here]

Next Steps Checklist:

- Verify whether each item is defined in the MVP product doc.
- Check if there are existing GitHub issues covering them.
- If not already covered:
  -- Determine whether the issue belongs under an existing Epic (type/epic label).
  --- If yes → add it as a sub-issue.
  --- If no Epic exists → open a new Epic and add the issue as its sub-issue.
  -- Update relevant documentation.
  -- Create new GitHub issues with clear titles, descriptions, and acceptance criteria.
- If requirements are ambiguous, pause and request human guidance.

Consistency Requirements:
To keep everything aligned, update the following where applicable:

- ADR — capture rationale for changes.
- QA feature files — reflect updated behavior for automated testing.
- Tests — ensure coverage reflects the updated acceptance criteria and requirements.
- CHANGELOGs — document user-visible changes.
- MVP doc tracking section — add new issue and Epic IDs for traceability.
