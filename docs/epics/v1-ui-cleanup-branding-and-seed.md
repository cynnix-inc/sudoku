[Epic] v1 UI cleanup — branding, labels removal, and seed tap-to-copy

Parent references: `docs/adr/0004-branding-and-labels.md`, `docs/product/ultimate-sudoku-mvp-v0.9.md`

Context:

- Align UI with product branding: show "Ultimate Sudoku" title in header.
- Remove redundant textual labels: "Mode:", "Difficulty:", "Seed:", and the inline instruction "long-press to lock a digit".
- Update seed copy UX: the numeric seed value itself is tappable/clickable to copy; no dedicated copy button. Provide subtle hover/focus affordance and confirmation.

Scope:

- Header branding and layout clarifications.
- Label removals where redundant with iconography.
- Seed tap-to-copy behavior and affordance.
- Documentation and QA feature updates (done); implementation and tests follow in this epic.

Out of scope:

- Visual redesign beyond the above.
- Changes to seed computation or display format (remains numeric string).

Done when:

- Header shows "Ultimate Sudoku" with Mode–Difficulty displayed without textual prefixes.
- No inline UI text for "Mode:", "Difficulty:", "Seed:", or "long-press to lock a digit".
- Footer seed value is tappable to copy; no separate copy button; subtle hover/focus affordance and confirmation present; accessible name/role exposed.
- QA feature files reflect behavior; unit/integration tests updated to match.
- ADR-0004 is linked from related PRs/issues.

Child issues (create via CLI):

Note: Use GitHub CLI sub-issues [[memory:6683356]] to create and link child issues under this epic. Use our Issue/Epic templates [[memory:6683367]].

```bash
# 1) Create the Epic (run once). Capture the new issue number for PARENT.
# Replace <REPO> with cynnix-inc/sudoku if needed.

gh issue create \
  --title "[Epic] v1 UI cleanup — branding, labels, seed tap-to-copy" \
  --body $'Context:\n- See ADR-0004 and MVP spec updates.\n\nScope:\n- Header branding, label removals, seed tap-to-copy.\n\nOut of scope:\n- No seed format change.\n\nDone when:\n- Title shown as \"Ultimate Sudoku\"; mode/difficulty without labels; seed tappable to copy with hover/focus affordance and confirmation; tests updated.\n\nChild issues:\n- Will be added via sub-issues.' \
  --label "area/ui,type/feature,priority/p2,status/ready" \
  -R <REPO>

# Export the created epic number (replace 123 with the actual number)
EPIC=123

# 2) [UI] Header branding and label removal
gh sub-issue create --parent $EPIC \
  --title "[UI] Show \"Ultimate Sudoku\" title; remove \"Mode:\"/\"Difficulty:\" labels" \
  --body $'Parent: #'$EPIC'\n\nContext:\n- ADR-0004.\n\nAcceptance Criteria:\n- Header includes product title \"Ultimate Sudoku\" styled per design system.\n- Mode–Difficulty shown without textual prefixes (no \"Mode:\" or \"Difficulty:\").\n- No \"Timer\" textual label; icon-only pause control remains.\n- A11y: title is a heading/landmark; icons have aria-labels.\n\nOut of scope:\n- Any change to timer behavior.' \
  --label "area/ui,type/feature,priority/p2,status/ready" \
  -R <REPO>

# 3) [UI] Remove inline instructional text for lock gesture
gh sub-issue create --parent $EPIC \
  --title "[UI] Remove inline \"long-press to lock a digit\" text; rely on Lock icon" \
  --body $'Parent: #'$EPIC'\n\nContext:\n- ADR-0003 and ADR-0004.\n\nAcceptance Criteria:\n- No inline instructional text about long-press in main UI surfaces.\n- Lock discoverability provided by dedicated Lock icon and help/docs.\n- A11y: Lock icon is labeled; help/docs include guidance.\n\nOut of scope:\n- Removing the long-press gesture support.' \
  --label "area/ui,type/feature,priority/p2,status/ready" \
  -R <REPO>

# 4) [UI] Seed tap-to-copy without dedicated button
gh sub-issue create --parent $EPIC \
  --title "[UI] Seed tap-to-copy via value (no dedicated button)" \
  --body $'Parent: #'$EPIC'\n\nContext:\n- ADR-0004.\n\nAcceptance Criteria:\n- Footer shows numeric seed; the seed value is tappable/clickable to copy.\n- Subtle hover/focus affordance on web (cursor, underline, color shift); visible focus ring.\n- Confirmation toast/snackbar on copy.\n- No separate copy button is shown.\n- A11y: element exposes appropriate role and label (e.g., button with \"Copy seed\").\n\nOut of scope:\n- Changing seed format or placement.' \
  --label "area/ui,type/feature,priority/p2,status/ready" \
  -R <REPO>
```

Links:

- ADR: `docs/adr/0004-branding-and-labels.md`
- MVP: `docs/product/ultimate-sudoku-mvp-v0.9.md`
- QA Features: `docs/qa/features/01-gameplay-controls.feature`, `docs/qa/features/07-ui-accessibility.feature`, `docs/qa/features/08-navigation-help.feature`, `docs/qa/features/02-modes-daily.feature`
