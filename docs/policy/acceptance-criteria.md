## Acceptance Criteria (AC)

### What AC are

Acceptance Criteria are the minimal, verifiable behaviors a change must satisfy before it can be merged. They are:

- Specific and observable
- Testable (manually and/or via automated tests)
- Written in user language, not implementation details

### Example: Toggleable Theme

Context: The app supports System/Light/Dark themes via `ThemeProvider` and a Settings screen with a toggle.

- The app defaults to the system theme at first launch.
- When the user toggles the theme to Dark, the UI switches immediately and persists across app restarts.
- When the user toggles back to System, the UI follows OS theme changes again without needing an app restart.
- The theme label in Settings reflects the current selection.
- The toggle is accessible: screen readers announce its state, and contrast meets WCAG AA for labels.

Good AC (clear and testable):

- Changing the theme toggle updates visible UI colors within 200ms on the Settings screen and Home screen.
- After force-closing and reopening the app, the last explicit choice (Light/Dark) is restored.
- When set to System, switching the OS theme propagates within one navigation event.

Bad AC (vague or implementation-driven):

- “Use AsyncStorage for theme.” (implementation detail)
- “Make it feel fast.” (not measurable)
- “Fix theme bugs.” (not specific)

### What to include alongside AC

- Screenshots or a short screen recording when UI changes are visible
- A brief risk/rollback note
- Links to related issues/tasks

## Pull Request AC Template

Paste this into your PR description and complete all sections.

```markdown
### Summary
- What does this change do for users?

### Acceptance Criteria
- [ ] Behavior 1: …
- [ ] Behavior 2: …
- [ ] Behavior 3: …

### Tests
- [ ] Unit tests added or updated
- [ ] Integration/E2E added when behavior spans screens
- Commands to run locally:
  - `pnpm test` (all)
  - `pnpm --filter apps/app run test` (app)
  - `pnpm --filter packages/ui run test` (UI)
  - `pnpm e2e` (web smoke after `pnpm --filter apps/app run build:web`)

### Flags / Remote Config
- [ ] New feature flag? Name and default state:
- [ ] Flag added to Supabase `feature_flags` (default off unless specified)

### Release Notes
- Package(s):
- Summary for users:

### Screenshots / Video (optional)
```


