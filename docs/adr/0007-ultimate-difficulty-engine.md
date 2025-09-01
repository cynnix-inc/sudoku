# ADR-0007: Replace Difficulty Engine with Ultimate Sudoku Levels

## Status

Proposed — linked to Epic #399

## Context

The current difficulty system uses classic tiers (`easy` → `extreme`) driven primarily by clue thresholds with a lightweight singles pass (see ADR-0005). The product spec introduces “Ultimate Sudoku” levels that are aligned with real solving experience: required logic techniques, puzzle structure, and board evolution. Levels: Novice, Skilled, Advanced, Expert, Fiendish, Ultimate.

## Decision

- Introduce six named levels with per-level “recipes” that define:
  - Givens/structure targets (ranges, symmetry, early/late outs)
  - Allowed/required techniques per level (solver-gated; no guessing)
  - Optional features: teaching prompts (Novice), hint path scaffolding (Skilled), timed challenges (Ultimate), and opt-in variants (Killer cages, Thermo, extra regions) behind flags
- Update generator and rating to target these recipes deterministically; generation must validate uniqueness and conformance using solver checks
- Update Daily pipeline to surface the new level names in seed metadata and calendar UI
- Update Settings/Classic to select these six levels and expose relevant toggles (feature-flagged where needed)

## Consequences

- Generator will accept level identifiers and map to per-level constraints; classic tiers remain only for legacy compatibility and internal mapping as needed
- Solver will be extended to gate technique application per level and emit a trace to support validation and teaching
- Daily storage/stats schemas will include the new level identifier
- Tests and QA features will validate conformance per level (docs/qa)

## Alternatives Considered

- Keep classic tiers (easy→extreme) only: rejected; does not capture perceived difficulty nor enable teaching/advanced experiences
- Full technique-based rating only (no clue thresholds): deferred; hybrid remains acceptable with strict validation

## References

- Epic #399 — Replace Difficulty Engine with Ultimate Sudoku Levels
- Product spec: `docs/product/ultimate-sudoku-mvp-v0.9.md`
- Levels source: `docs/product/Ultimate_Sudoku_Difficulty_Levels.csv`
- Prior approach: ADR-0005 (Difficulty thresholds and rating)
