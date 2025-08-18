Rule: Coding Style (TypeScript, React Native)
Applies to: app/**, components/**, packages/**
Use when: writing or reviewing code
Avoid: implicit any, deep nesting, unclear names
Definition of Done:
  - Type-safe components and functions
  - Hooks encapsulate side effects and data fetching
  - File naming: kebab-case for files, PascalCase for components

### Components
- Functional components with explicit props types.
- Keep components presentational; lift logic to hooks where possible.
- Use `useMemo`/`useCallback` only for measurable perf wins.

### Hooks
- Prefix custom hooks with `use`.
- Keep hooks pure; isolate I/O behind services.

### Files & imports
- Barrel export from feature folders where it reduces import noise.
- Absolute imports via tsconfig paths when configured (avoid long relative chains).

### Testing
- Use `@testing-library/react-native`.
- Prefer behavior-driven tests; avoid implementation details.


