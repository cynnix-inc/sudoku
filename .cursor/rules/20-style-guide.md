TypeScript/React style guide

When to use: writing or reviewing TypeScript/React Native code in this repo.

Definition of Done

- TypeScript strict mode passes
- ESLint and Prettier pass
- Components are functional and accessible
- Performance and bundle budgets met

# TypeScript

- "strict": true
- No implicit any; prefer types over interfaces for unions.
- Explicit return types for exported functions and component props.

# React and React Native

- Functional components with hooks only; no class components.
- Keep components small and pure. Extract hooks for complex logic.
- Accessibility: provide roles/labels and verify with Testing Library queries.

# Imports and structure

- Group imports: Node/std, external, internal modules, then styles.
- Prefer relative imports within `app/**`; avoid deep cross-feature paths.

# Styling

- Use Tailwind via NativeWind where appropriate; keep tokens/utilities centralized.
- No inline magic numbers. Prefer constants or tokens.

# Performance

- Memoize expensive computations when measured to help.
- Avoid adding heavy dependencies without review.
- Optimize images and avoid runtime resizing in hot paths.

# Never

- Never access storage or network inside UI components.
- Never weaken typing to "any" to silence errors.

## Examples

- Good: `export const Button = ({ label }: Props) => { /* ... */ }`
- Bad: `export default function BigComponentDoingEverything() { /* 400 lines */ }`
