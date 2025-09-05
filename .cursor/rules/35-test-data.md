# Deterministic Test Data & Fixtures Policy (Issue #425)

Applies to: **tests**/**, app/**, scripts/\_\_
Use when: writing tests, creating fixtures/fakes, mocking network/time
Avoid: flaky randomness, time-dependent tests, oversized snapshots, shared-mutable fixtures
Definition of Done:

- Test data is reproducible on every run (CI and local)
- Randomness and time are explicitly controlled
- Network is mocked; tests are offline-safe
- Snapshots are minimal and stable, or replaced with explicit assertions

## Determinism First

- Control time:
  - Prefer fake timers when time-based behavior matters.
  - Pin `Date.now()`/`new Date()` using a single helper to ensure UTC and stability.
- Control randomness:
  - Use seeded RNG utilities (single source) when generating random test data.
  - Derive seeds from test names or constants; never from ambient time.
- Remove non-determinism:
  - Normalize unstable fields (timestamps, IDs) before assertions or snapshots.

## Fixtures Strategy

- Centralize factories/builders under `__tests__/utils/fixtures.ts` (add small, composable helpers).
- Prefer object builders (functions) over class singletons; return fresh instances per call.
- Use plain data with clear defaults; override via partials for clarity.
- Guard against mutation:
  - Freeze deep objects where practical or clone per test.
  - Never share mutable global fixtures across tests.

## Snapshot Limits

- Keep snapshots small and intentional; avoid snapshotting entire UI trees.
- Prefer explicit assertions for behavior and critical props.
- If snapshotting:
  - Strip unstable fields via serializers or `toMatchInlineSnapshot` with curated shapes.
  - Co-locate snapshots with tests and keep them readable.

## BDD Data Conventions

- Name fixtures after user intent (Given/When/Then) and the domain concept.
- Use small, readable datasets; avoid large opaque blobs.
- Document non-obvious fields inline in the test, not hidden inside fixture helpers.

## Network & IO Mocking (MSW pattern)

- Tests run fully offline; do not depend on real network/storage.
- Use request handlers per suite to model success, error, and edge cases.
- Reset handlers between tests to avoid cross-test leakage.
- Prefer MSW/fakes over jest.spyOn at deep internals; mock at the boundary.

## Time zones and locale

- Assume UTC in tests; normalize locale- and TZ-sensitive formatting.
- When asserting formatted strings, assert the formatting function result, not ambient Date.

## Utilities Checklist

- Add helper: `withFixedTime(date)` to set/restore clock around a test.
- Add helper: `seededRandom(seed)` or use the project RNG with a fixed seed.
- Add factory examples: `makePuzzle()`, `makeStats()`, `makeSettings()`.

## CI Expectations

- No test may rely on live network, wall-clock time, or randomness without control.
- Flakes must be eliminated by design; disabling tests is a last resort and temporary.

## References

- Related rules: `30-testing.md`, `50-devops.md`
- Issue: #425
