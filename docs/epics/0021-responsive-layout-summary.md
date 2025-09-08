# Epic #21: Responsive Layout (Web) — Summary

Status: Completed via multiple PRs; verified in CI and tests

Scope

- Ensure primary game screens scale gracefully across common web widths
- Maintain minimum hit targets (≥44px) and non-overlapping UI
- Keep grid + numpad alignment and ensure footer seed remains visible without layout shift

Key Implementations

- Board width computed from window width with band gaps; `cellSize` clamped to maintain hit target
- Single-row numpad sized to grid width (`testID` `numpad-row`), verified in tests
- Tools row wraps are avoided; minimum button sizing enforced
- Seed footer remains visible; copy action accessible

Accessibility and A11y Instrumentation

- Cells expose row/col, value/empty, notes summary, and state via accessibilityLabel/value
- Numpad labels reflect highlighted/locked states, with fallback accessible label
- Controls (notes, lock, erase, undo/redo) expose labels and hints

Related Tests

- `__tests__/app/classic.responsive.test.tsx`
- `__tests__/app/classic.numpad.test.tsx`
- `__tests__/components/SeedFooter.test.tsx`

Tracking

- Epic: #21
- Issues: #396, #450
- Linked product doc sections: MVP 5.1 Game Board and 5.3 Stats (layout), Accessibility section
