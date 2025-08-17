Rule: Testing Strategy and Utilities
Applies to: apps/**, packages/**
Use when: writing tests, adding features, refactoring
Avoid: flaky tests, real network or storage in unit tests
Definition of Done:
  - Unit tests for core logic
  - Component tests cover critical UI states
  - No real network or timers without proper fakes
  - Coverage thresholds met

# Pyramid
- Unit tests in packages/core with near 100 percent for critical algorithms.
- Component tests for UI states and interactions.
- Minimal end-to-end where risk justifies it.

# Utilities
- packages/testing provides:
  - renderWithProviders from @ultimate-sudoko/testing
  - mockStorage, mockTimers, userEvent helpers
- No real network calls in tests. Use MSW or local fakes.

# Coverage Gates
- core: 95 percent lines, 100 percent on generator and validator.
- ui: 80 percent lines.

# Always / Never
- Always test edge cases: invalid boards, near-solved states, unsolvable puzzles.
- Always snapshot only for stable, simple components.
- Never depend on external clock. Use fake timers.
- Never share state between tests. Reset per test.

## Example: renderWithProviders
```ts
// packages/testing/src/renderWithProviders.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { SudokuProvider } from '@ultimate-sudoko/app/state';

export function renderWithProviders(ui: React.ReactElement) {
  return render(<SudokuProvider>{ui}</SudokuProvider>);
}
```
