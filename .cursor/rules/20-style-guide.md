Rule: Code Style and Patterns
Applies to: apps/**, packages/**
Use when: writing or reviewing code
Avoid: stylistic drift, ad-hoc patterns
Definition of Done:

- TypeScript passes with strict settings
- ESLint and Prettier pass
- Components are functional and accessible
- Performance and bundle budgets met

# TypeScript

- "strict": true
- No implicit any, no namespace usage, prefer types over interfaces for unions.

# React and React Native

- Functional components with hooks only.
- Keep components small and pure. Extract hooks for complex logic.
- Accessibility: use accessible roles, labels, and test with screen readers.
  See `25-accessibility.md` for RN and Web specifics (roles, labels, focus, modals, testing).

# Imports and Structure

- Absolute imports via tsconfig paths for packages.
- Group imports: Node/std, external libs, internal modules, styles.

# Styling

- Centralize tokens in packages/ui (spacing, colors, typography).
- No inline magic numbers. Use constants or tokens.

# Always / Never

- Always write explicit return types for exported functions.
- Always memoize expensive computations.
- Never use class components.
- Never access storage or network inside UI components.

# Performance Budget

- Avoid adding heavy deps without review.
- Images must be optimized. Avoid runtime image resizing in hot paths.

## Examples

- Good: export const Button = ({ label }: Props) => { ... }
- Bad: export default function BigComponentDoingEverything() { /_ 400 lines _/ }
