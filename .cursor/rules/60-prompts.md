Rule: Task Macros for Cursor
Applies to: apps/**, packages/**
Use when: asking the assistant to scaffold or modify code
Avoid: vague requests; always specify files and edits
Definition of Done:
  - Files created or edited as listed
  - Tests added or updated
  - Docs and exports updated
  - CI passes locally

# Macro: Create a new screen
Prompt:
"""
Create a new screen called <Name> using Expo Router.
Use functional components, TypeScript, and tokens from packages/ui.
Add accessibility labels for interactive elements.
Edits:
  - apps/mobile/app/<name>/index.tsx (new)
  - apps/mobile/test/<name>.test.tsx (new)
  - packages/ui/index.ts (ensure any new shared components are exported)
  - docs/screens.md (append short usage snippet)
Definition of Done:
  - Renders without errors via renderWithProviders
  - Test covers at least one user interaction
  - Lint and typecheck pass
"""

# Macro: Add a core solver strategy
Prompt:
"""
Implement a new Sudoku solver strategy named <StrategyName>.
Keep it pure and deterministic.
Edits:
  - packages/core/solver/<strategyName>.ts (new)
  - packages/core/index.ts (export)
  - packages/core/__tests__/<strategyName>.test.ts (new)
  - docs/adr/YYYY-MM-DD-<strategyName>.md (new ADR if performance or API changes)
Definition of Done:
  - 100 percent coverage on this strategy
  - No additional deps
  - Benchmarks documented in the ADR
"""

# Macro: Add a UI component
Prompt:
"""
Create a reusable UI component <ComponentName> in packages/ui.
Keep presentational only, no side effects.
Edits:
  - packages/ui/src/<ComponentName>.tsx (new)
  - packages/ui/src/index.ts (export)
  - packages/ui/__tests__/<ComponentName>.test.tsx (new)
  - storybook or docs snippet under docs/ui.md (append)
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
  - apps/mobile/app/providers/analytics.ts (new)
  - apps/mobile/app/_layout.tsx (initialize provider)
  - docs/analytics.md (document events and opt-out)
  - tests for provider behavior in apps/mobile/test/analytics.test.tsx
Definition of Done:
  - Events queued offline, sent over HTTPS
  - Opt-out respected across sessions
  - No PII, security checklist passes
"""
