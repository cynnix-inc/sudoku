Rule: Accessibility (RN + Web)
Applies to: app/**, app/components/**
Use when: creating or updating UI
Avoid: unlabeled controls, broken focus, keyboard traps
Definition of Done:

- Interactive elements have roles and labels
- Keyboard and screen reader flows are testable
- Modals and overlays manage focus correctly

# Roles and Labels

- React Native: set `accessibilityRole` (button, header, link) and `accessibilityLabel`.
- Web: use semantic elements or ARIA (`role`, `aria-label`, `aria-labelledby`).
- Provide `accessibilityHint` where the action isn’t obvious.

# Keyboard and Focus

- Ensure visible focus on Web; custom components must expose focus styles.
- Trap focus inside modals; restore focus to opener when closing.
- Support Escape/Back to dismiss overlays; prevent background scroll.

# Modals and Overlays

- Mark overlay containers with `accessibilityViewIsModal` (RN) and `role="dialog"` + `aria-modal="true"` (Web).
- Provide a labeled title via `aria-labelledby` or set `accessibilityLabel`.

# Lists and Virtualization

- Use `accessibilityRole="list"` and `listitem` where applicable.
- Announce dynamic updates with polite live regions on Web when needed.

# Testing Patterns

- Prefer queries by role and name: `getByRole('button', { name: /start/i })`.
- Assert focus order with keyboard tabbing on Web; validate RN labels via Testing Library.
- Include at least one accessibility assertion per new screen.

# Always / Never

- Always label icon-only buttons.
- Always provide visible focus on Web.
- Never rely solely on color to convey meaning.
- Never block keyboard navigation.

# Examples

- Button
  - RN: `<Pressable accessibilityRole="button" accessibilityLabel="Start new game" />`
  - Web: `<button aria-label="Start new game" />`
