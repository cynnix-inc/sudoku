Testing strategy and utilities

When to use: writing tests, adding features, or refactoring.

Avoid

- Flaky tests; real network or storage in unit tests.

Definition of Done

- Unit tests for core logic
- Component tests cover critical UI states
- No real network or timers without proper fakes
- Coverage thresholds met

# Pyramid

- Unit tests for `app/game/**` with near 100 percent for critical algorithms.
- Component tests for UI states and interactions under `__tests__/app/**`.
- Minimal end-to-end where risk justifies it.

# Utilities

- Use `__tests__/utils/renderWithProviders.tsx`.
- Provide local fakes for storage and timers; prefer MSW for network.
- No real network calls in unit tests.

# Coverage gates (guidance)

- game: 95 percent lines for generators/validators.
- ui: 80 percent lines.

# Always / Never

- Always test edge cases: invalid boards, near-solved states, unsolvable puzzles.
- Always snapshot only for stable, simple components.
- Never depend on the real clock. Use fake timers.
- Never share state between tests. Reset per test.
