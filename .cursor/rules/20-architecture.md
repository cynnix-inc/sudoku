Rule: Architecture, layers, and boundaries
Applies to: `app/**`
Use when: designing features, refactoring, adding dependencies

Purpose
- Keep a clean separation of concerns and predictable data flow.

Out of scope
- Code style minutiae (see `10-style.md`).
- CI and workflow (see `50-devops.md`).

Priority
- If rules conflict, this file wins over `10-style.md`.

# Layers
- UI: screens and presentational components in `app/`.
- Hooks/State/Services: `app/hooks/`, `app/state/`, `app/services/` (create as needed).
- Domain logic: pure modules in `app/lib/`.

# Allowed imports
- UI → hooks/state/services, domain (`app/lib/`).
- Hooks/services → domain (`app/lib/`).
- Domain (`app/lib/`) → no React, no platform APIs.

# Forbidden
- UI importing storage/network modules directly.
- Cross-feature deep imports that bypass public modules.

# Data and effects
- Keep domain pure and deterministic.
- Isolate I/O (storage, network) behind service modules.

# Performance and logging
- Keep renders cheap; avoid heavy computation in render paths.
- Log at boundaries; avoid noisy logs inside tight loops.

# Anti-patterns (Non-examples)
- `app/<screen>/index.tsx` importing `AsyncStorage` directly.
- Domain functions that mutate global state or depend on time/IO.

# Self-check
- New code fits one layer and imports only from allowed layers.
- Domain modules have unit tests and no React imports.
- Side effects are in services; UI stays presentational.

