Rule: Language and framework conventions (TypeScript + React Native)
Applies to: `app/**`
Use when: writing or reviewing code

Purpose
- Decide everyday coding conventions so code reads the same across the repo.

Out of scope
- Cross-layer boundaries (see `20-architecture.md`).
- Tooling/CI (see `50-devops.md`).

Priority
- If rules conflict with `20-architecture.md`, architecture wins.

# Must
- TypeScript strict; explicit types for exported functions and component props.
- Functional components only; no class components.
- Hooks encapsulate side effects. Prefix custom hooks with `use`.
- File naming: kebab-case for files, PascalCase for exported components.
- Group imports: std/node, external, internal, styles.
- Avoid magic numbers: prefer constants or tokens.
- Keep components small and presentational; extract complex logic to hooks or `app/lib/`.

# Should
- Use `useMemo`/`useCallback` only for measurable performance wins.
- Prefer absolute imports when path aliases are configured; otherwise keep relative paths short.
- Write accessible components (labels/roles; test with Testing Library queries by role/text).

# May
- Barrel export within a feature folder when it reduces import noise.

# Examples
```tsx
// app/components/NumberButton.tsx
import React from 'react';

type Props = { value: number; onPress: (value: number) => void };

export function NumberButton({ value, onPress }: Props) {
  return <Button accessibilityLabel={`Choose ${value}`} onPress={() => onPress(value)}>{value}</Button>;
}
```

```ts
// app/lib/board.ts
export function isSolved(board: number[][]): boolean {
  // pure and deterministic
  return board.every(row => row.every(cell => cell > 0));
}
```

# Non-examples
- Side effects (storage/network) inside UI components.
- Implicit `any` or untyped props.

# Self-check
- `npm run lint && npm run typecheck` pass.
- Components are functional with typed props.
- No magic numbers; tokens/constants used.
- Hooks prefixed with `use` and isolated side effects.

