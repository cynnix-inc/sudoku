# ADR-0004: Branding, Header Title, Label Reductions, and Seed Copy UX

Date: 2025-08-22

Status: Accepted (Finalized for MVP docs)

Context

- The current game header shows the mode name as a title (e.g., "Classic"). Product branding requires a consistent product title.
- Several textual UI labels add visual noise and are redundant with iconography and context.
- Seed copy UX currently implies a dedicated copy button; the intent is a more lightweight interaction.

Decision

1. Title and Branding
   - The app title is "Ultimate Sudoku". The game header should present the product title with tasteful styling consistent with our design system.
   - Mode and difficulty continue to be shown contextually in the header without prefixed textual labels.

2. Remove Redundant Text Labels
   - Remove explicit textual prefixes: "Mode:", "Difficulty:", "Seed:", and the instructional text "long-press to lock a digit" from the default UI surfaces.
   - Discoverability for Lock is covered by ADR-0003 via a dedicated Lock icon in the tool row and the long‑press gesture remains supported without inline instructional text.

3. Seed Copy Interaction
   - Do not show a separate copy button for the footer seed.
   - The displayed seed value itself is clickable/tappable to copy to clipboard.
   - Provide subtle hover/focus affordance (e.g., underline on hover, cursor change, gentle color shift) and a brief confirmation toast/snackbar on copy.

Consequences

- Reduces textual clutter and aligns with icon-first controls while keeping accessibility via aria-labels and tooltips where appropriate.
- Requires documentation and QA feature updates to reflect: title branding, label removal, and seed tap-to-copy behavior.
- No functional change to underlying generation or seed format; numeric seed display remains required.

References

- ADR-0003: UI Layout and Controls – icon-only tools, timer icon, and lock toggle.
- MVP Spec: docs/product/ultimate-sudoku-mvp-v0.9.md
- QA: docs/qa/features/\*.feature
