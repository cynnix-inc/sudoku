Rule: Testing strategy and utilities
Applies to: `app/**`
Use when: writing tests, adding features, refactoring

Purpose
- Ensure fast, deterministic tests with clear coverage expectations.

Out of scope
- CI gates (see `50-devops.md`).

Definition of Done
  - Unit tests for domain logic (`app/lib/`)
  - Component tests cover critical UI states
  - No real network or timers without proper fakes
  - Coverage thresholds met

# Pyramid
- Unit tests for `app/lib/` with near 100 percent for critical algorithms.
- Component tests for UI states and interactions.
- Minimal end-to-end where risk justifies it.

# Utilities
- Use `@testing-library/react-native`.
- Create local helpers under `__tests__/utils/` if needed (e.g., `renderWithProviders`).
- No real network calls in tests. Use MSW or local fakes.

# Coverage gates
- lib: 95 percent lines for core algorithms.
- UI: 80 percent lines.

# Must / Should / Never
- Must test edge cases: invalid boards, near-solved states, unsolvable puzzles.
- Should use snapshots only for stable, simple components.
- Never depend on external clock. Use fake timers.
- Never share state between tests. Reset per test.

## Example: renderWithProviders
```ts
// __tests__/utils/renderWithProviders.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { SudokuProvider } from 'app/state';

export function renderWithProviders(ui: React.ReactElement) {
  return render(<SudokuProvider>{ui}</SudokuProvider>);
}
```
