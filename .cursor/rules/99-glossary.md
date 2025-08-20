Glossary of terms and acronyms

When to use: when unsure about domain terms or abbreviations.

Purpose

- Provide shared definitions for common terms used in code and docs.

Out of scope

- Coding or architectural guidance.

## Terms

- Candidate: a possible number for a Sudoku cell that does not violate constraints.
- Solver strategy: a deterministic rule used to deduce cell values.
- Board: 9x9 grid; may be represented as `number[][]` with 0 for empty.
- Cell: individual position on the board.
- Row/Column/Box: Sudoku units that must contain 1–9 without duplicates.
- Notes: per-cell candidate marks maintained by the player.
- Lives: number of mistakes allowed before a game over in classic mode.
- Seed: a deterministic value used to initialize a daily puzzle.
- PII: Personally Identifiable Information.

## Self-check

- Prefer these terms in code, tests, and docs.
