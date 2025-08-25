Architecture and layering

When to use: designing features, refactoring, or adding dependencies.

Purpose

- Keep a clean separation of concerns and predictable data flow in `app/**`.

Out of scope

- Code style minutiae (see `20-style-guide.md`).
- CI and workflow (see `50-devops.md`).

Priority

- If rules conflict with style, this file wins.

# Layers

- UI: screens and presentational components in `app/`.
- State/Hooks/Services: `app/state/`, `app/hooks/`, `app/services/`.
- Domain logic: pure modules in `app/game/`.

# Feature Consolidation

- **No shadow/duplicate features**: If similar functionality exists, consolidate to a single source of truth
- Core logic belongs in `app/game/` (domain layer)
- Presentational logic belongs in UI components
- Don't fork variants - refactor to shared utilities instead

# Examples

- Good: Single `validateBoard()` function used across all validation needs
- Bad: `validateBoard()`, `validatePuzzle()`, and `checkBoard()` doing similar things

# Allowed imports

- UI → state/hooks/services, domain (`app/game/`).
- Hooks/services → domain (`app/game/`).
- Domain (`app/game/`) → no React, no platform APIs.

# Forbidden

- UI importing storage/network modules directly.
- Cross-feature deep imports that bypass public modules.

# Data and effects

- Keep domain pure and deterministic.
- Isolate I/O (storage, network) behind service modules in `app/services/`.

# ADRs

- Use `docs/adr/YYYY-MM-DD-short-title.md` for decisions affecting architecture, libraries, or data shape.
- Include: Context, Decision, Alternatives, Consequences.

# Performance and logging

- Keep renders cheap; avoid heavy computation in render paths.
- Log at boundaries; avoid noisy logs inside tight loops.

# Anti-patterns (Non-examples)

- `app/<screen>/index.tsx` importing `AsyncStorage` or `supabase` directly.
- Domain functions that mutate global state or depend on time/IO.

# Self-check

- New code fits one layer and imports only from allowed layers.
- Domain modules have unit tests and no React or platform imports.
- Side effects are in services; UI stays presentational.
