Rule: Architecture and Module Boundaries
Applies to: apps/**, packages/**
Use when: designing features, refactoring, adding dependencies
Avoid: cross-layer imports that break boundaries
Definition of Done:

- Module boundaries respected (UI does not contain domain logic)
- Data flow is unidirectional and explicit
- New dependency reviewed for size, license, and security
- ADR added for impactful decisions

# Architecture

- Monorepo with clear separation:
  - packages/core: Sudoku engine, validation, generation, serialization.
  - packages/ui: Pure presentational components with styles and a11y.
  - apps/\*: Composition, navigation, platform-specific glue.
  - packages/testing: shared test utilities.

## Data and State

- App state lives in app layer. Core exposes pure functions, no side effects.
- Prefer React hooks and Context over adding state libraries.
- Side effects isolated behind services (e.g., storage, network). Pure core.

## Dependency Rules

- core has zero React or platform dependencies.
- ui depends only on React, React Native primitives, and design tokens.
- apps can depend on ui and core, not vice versa.

## npm Workspaces Discipline

- Each workspace must declare all direct dependencies it imports (no relying on hoisted copies).
- Use package entry points to import across workspaces (e.g., `@ultimate-sudoko/core`), not relative paths.
- If a workspace needs a devDependency for its own tests/build, declare it locally or expose via a shared `packages/config`.
- Consider adding ESLint `no-restricted-imports` to block cross-package relative imports.

## Always / Never

- Always keep core deterministic and pure.
- Always document public APIs in core.
- Never import app code from packages.
- Never mix navigation with domain logic.

## ADRs

- Use docs/adr/YYYY-MM-DD-short-title.md for decisions that affect architecture, libraries, or data shape.
- Template includes: Context, Decision, Alternatives, Consequences.

## Example

- Adding a new solver strategy:
  - Implement in packages/core/solver/<strategy>.ts
  - Export via packages/core/index.ts
  - Add unit tests under packages/core/**tests**/<strategy>.test.ts
  - Add an ADR if this changes performance characteristics.
