# Code and UI Style

TypeScript
- "strict": true. No `any` in app code. Exported functions require explicit return types.
- Names: PascalCase for components, camelCase for functions/vars, SCREAMING_SNAKE_CASE for constants.

React
- Functional components only. Hooks follow the Rules of Hooks.
- Props are explicit and minimal. Avoid optional chains of optional props.

Styling
- NativeWind with a small token set. No inline magic numbers.
- Tokens drive spacing, radii, font sizes, and colors.
- Large number sizes for the grid. Respect system font scaling.

Accessibility
- All touchables have roles and accessible labels.
- Maintain color contrast for both themes. Avoid low‑opacity overlays behind text.
- Respect reduced motion.

Performance
- Avoid heavy blurs on scrolling surfaces. Use blur for sheets and modals only.
- Precompute constants outside render. Memoize where it removes real work.
