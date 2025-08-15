## Reusable prompts and checklists for Ultimate Sudoku

These guides are copy-ready prompts and checklists to speed up consistent scaffolding, refactors, tests, and releases across the monorepo.

### Global principles

- **TypeScript strict** everywhere. Prefer composition over inheritance.
- **UI**: flat dark/light themes; glass only for overlays; high contrast; large Sudoku numbers for readability.
- **Performance**: avoid heavy blurs on lists/scroll views. Precompute constants.
- **No game logic** until requested. Environment and scaffolding only.

### Mandatory checklist (add to every PR)

- **Acceptance Criteria**: short, testable bullets.
- **Tests**: added/updated and passing locally.
- **Docs**: README or docs updated for any public APIs/scripts/env changes.
- **No console.log** in committed code.
- **Lints**: imports sorted; lints passing.

---

## Creating a new screen (Expo Router v5)

Use this when adding a new route under `apps/app/app`.

### Prompt

1) Scaffold a new screen file under `apps/app/app` following Expo Router v5 conventions.

- Route file path example: `apps/app/app/(main)/settings.tsx` or dynamic `apps/app/app/(main)/profile/[id].tsx`.
- Keep the component small and pure; lift side effects into hooks in `apps/app/hooks` if needed.
- Use tokens from `packages/ui/tokens` and shared components from `packages/ui`.
- Respect theming and accessibility (labels, roles, hitSlop, large text support).

2) Add a minimal integration test verifying the screen renders and key UI states. See "Integration test" section below.

3) Update navigation indexes (if applicable) and any deep link configuration.

4) Prepare PR with Acceptance Criteria, risks/rollbacks, and follow-ups as TODOs in code.

### Skeleton

```tsx
// File: apps/app/app/(main)/ExampleScreen.tsx
import * as React from 'react';
import { View, Text, StyleSheet, AccessibilityInfo } from 'react-native';
import { tokens } from 'packages/ui/tokens';
import { Button } from 'packages/ui';

export default function ExampleScreen(): React.JSX.Element {
  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility('Example screen loaded');
  }, []);

  return (
    <View style={styles.container} accessibilityRole="summary">
      <Text style={styles.title} accessibilityRole="header">Example</Text>
      <Text style={styles.body}>Scaffolded screen. No game logic.</Text>
      <Button label="Do nothing" onPress={() => { /* noop */ }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.background,
    padding: tokens.space[4],
    gap: tokens.space[4],
  },
  title: {
    color: tokens.color.textPrimary,
    fontSize: tokens.fontSize.xl,
    fontWeight: '700',
  },
  body: {
    color: tokens.color.textSecondary,
    fontSize: tokens.fontSize.md,
  },
});
```

### Touch points

- `apps/app/app/(main)/<NewScreen>.tsx`
- Add or verify index route files (e.g., `apps/app/app/(main)/_layout.tsx`) if needed
- Tests for the new screen (see below)
- Any deep link config or navigation mapping

### PR checklist snippet

- **Acceptance Criteria**:
  - [ ] Screen renders with title and base controls
  - [ ] Works in both light and dark themes
  - [ ] No runtime warnings
- **Risks**: minimal; new route only
- **Rollbacks**: revert this route file and its test
- **Follow-ups**: add analytics event (TODO in code)

---

## Adding a shared UI component

Place in `packages/ui`, co-locate tests as `ComponentName.test.tsx`. Export from `packages/ui/index.ts`.

### Prompt

1) Create a pure, stateless component under `packages/ui/src/components/ComponentName.tsx`.

- Use props with explicit types; provide sensible defaults; avoid side effects.
- Style using `tokens` from `packages/ui/tokens`.
- Accessibility first: roles, labels, focus order.

2) Add `packages/ui/src/components/ComponentName.test.tsx` using React Native Testing Library.

3) Export from `packages/ui/index.ts` and update any story/demo if present.

### Skeleton

```tsx
// File: packages/ui/src/components/Badge.tsx
import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { tokens } from '../tokens';

export type BadgeProps = {
  label: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  testID?: string;
};

export function Badge({ label, tone = 'default', testID }: BadgeProps): React.JSX.Element {
  const colorByTone = {
    default: tokens.color.surface,
    success: tokens.color.successSurface,
    warning: tokens.color.warningSurface,
    danger: tokens.color.dangerSurface,
  }[tone];

  return (
    <View style={[styles.container, { backgroundColor: colorByTone }]} accessibilityRole="text" testID={testID}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: tokens.space[2],
    paddingVertical: tokens.space[1],
    borderRadius: tokens.radius.sm,
  },
  text: {
    color: tokens.color.textPrimary,
    fontSize: tokens.fontSize.sm,
    fontWeight: '600',
  },
});
```

```tsx
// File: packages/ui/src/components/Badge.test.tsx
import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders the label', () => {
    render(<Badge label="New" testID="badge" />);
    expect(screen.getByText('New')).toBeTruthy();
    expect(screen.getByTestId('badge')).toBeTruthy();
  });
});
```

### Touch points

- `packages/ui/src/components/<Component>.tsx`
- `packages/ui/src/components/<Component>.test.tsx`
- `packages/ui/index.ts` re-exports
- Optional stories/demos

### PR checklist snippet

- **Acceptance Criteria**:
  - [ ] Component renders with default props
  - [ ] Variants render with tokens
  - [ ] Tests pass locally
- **Risks**: low; isolated UI
- **Rollbacks**: revert component and export changes
- **Follow-ups**: add docs snippet to `README.md` (TODO)

---

## Writing an integration test (React Native Testing Library)

Use for screens or complex components. Prefer tests that simulate user actions and assert on accessible output.

### Prompt

1) Create a test near the target or in the designated tests directory. Name as `<Subject>.test.tsx`.

2) Render with providers used by the app (theme, navigation). Avoid real network; mock as needed.

3) Interact with `@testing-library/react-native` queries, assert visible outcomes.

### Skeleton

```tsx
// Example: apps/app/__tests__/ExampleScreen.test.tsx
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ExampleScreen from '../app/(main)/ExampleScreen';

function renderWithProviders(ui: React.ReactElement) {
  // TODO: wrap in theme/navigation providers if the app exposes helpers
  return render(ui);
}

describe('ExampleScreen', () => {
  it('renders and responds to a press', () => {
    renderWithProviders(<ExampleScreen />);
    expect(screen.getByRole('header', { name: /example/i })).toBeTruthy();
    const button = screen.getByRole('button', { name: /do nothing/i });
    fireEvent.press(button);
    // Assert a no-op; ensure no crash
    expect(button).toBeTruthy();
  });
});
```

### Touch points

- Test file adjacent to subject or under `apps/app/__tests__` / `tests/`
- Provider wrappers/utilities if present

### PR checklist snippet

- **Acceptance Criteria**:
  - [ ] Renders without warnings
  - [ ] Primary action is pressable
  - [ ] Works in CI
- **Risks**: flakiness; rely on a11y queries and timers where needed
- **Rollbacks**: skip or revert the test file
- **Follow-ups**: add provider helpers (TODO)

---

## Updating EAS channels and docs when envs change

Channel, profile, or env changes require both config updates and documentation.

### Prompt

1) Update configuration files and verify no breaking changes.

- Edit `eas.json` profiles/channels.
- Edit any `.env` templates and ensure they are referenced by the app.
- Document variables in `README.md` or `docs/`.

2) Update EAS channels (non-interactive).

```bash
# List channels
eas channel:list --non-interactive

# Create or ensure channel exists
eas channel:create production --non-interactive || true

# Promote or publish update to channel
eas update --channel production --non-interactive --message "Sync env changes"
```

3) Update docs and notify.

- Add a short section to `docs/releases.md` describing the change.
- Update `README.md` if scripts or public APIs changed.
- Post Acceptance Criteria in the PR.

### Touch points

- `eas.json`
- `.env*` templates
- `README.md`, `docs/` (e.g., `docs/releases.md`)

### PR checklist snippet

- **Acceptance Criteria**:
  - [ ] Channels updated/validated in EAS
  - [ ] Env templates documented
  - [ ] App builds/updates succeed for target channels
- **Risks**: misconfigured env; mitigated by test build on a non-prod channel
- **Rollbacks**: revert `eas.json`, re-publish previous commit to stable channel
- **Follow-ups**: add CI check for channel consistency (TODO)

---

## PR description template (paste into PRs)

```
### Acceptance Criteria
- [ ] ...
- [ ] ...

### Touch points
- apps/app/app/(...)/...
- packages/ui/src/components/...
- tests/... or apps/app/__tests__/...
- docs/..., README.md, eas.json

### Risks
- ...

### Rollback Plan
- Revert commit; remove route/component; re-publish previous EAS update if applicable

### Follow-ups (TODOs)
- [ ] ...
```


