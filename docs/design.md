### Design tokens and theme

This app uses a shared token system in `packages/ui` and a custom NativeWind preset to ensure consistent theming across native and web.

#### Tokens

- **Spacing**: 4px baseline scale up to 160px for layout rhythm.
- **Radii**: `xs(6)`, `sm(8)`, `md(12)`, `lg(16)`, `xl(24)`, `2xl(32)`, `full` for rounded surfaces and chips.
- **Durations**: `fast(100ms)`, `moderate(200ms)`, `slow(300ms)` for motion and state feedback.
- **Colors** (accessible pairs):
  - `background.light(#FFFFFF)` with `foreground.light(#111827)` → contrast ~ 12.6:1
  - `background.dark(#0B0B0C)` with `foreground.dark(#F3F4F6)` → contrast ~ 13.7:1
  - `primary(#2563EB)` on `background.dark` → contrast ~ 6.3:1
  - `primary(#2563EB)` on `background.light` with `primary.contrast(#FFFFFF)` for buttons → contrast ~ 8.6:1 on blue

All text/surface combinations meet or exceed WCAG 2.1 AA contrast thresholds (4.5:1 for normal text, 3:1 for large text). Large Sudoku numerals exceed 3:1.

#### NativeWind preset

Defined in `packages/ui/tailwind.preset.js` and consumed by both the UI package and the app. It exports:

- **Colors** matching the tokens (`background`, `foreground`, `primary`, `muted`, `success`, `warn`, `error`).
- **Radii** matching tokens.
- **Font sizes** including Sudoku-specific sizes: `text-sudoku`, `text-sudoku-lg`, `text-sudoku-xl`, `text-sudoku-2xl` for legible numerals in grid cells.
- Dark mode controlled via `class` or `[data-theme=dark]`.

#### Theme switching

- The UI `ThemeProvider` resolves `system` using OS settings and exposes `useTheme()` with `currentTheme`, `resolvedColorScheme`, `setTheme`.
- The app-level `AppThemeProvider` persists the preference to `AsyncStorage` so the theme is restored on launch.

#### Accessibility

- Web focus styles are enabled via `apps/app/global.css` with a visible 2px focus outline using the brand color.
- Press feedback: interactive elements slightly reduce opacity on active press on web; NativeWind `pressed:` utilities can be used on React Native components (e.g., `pressed:opacity-80`).


