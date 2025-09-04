# ADR-0002: Daily Determinism & No Reroll (Finalized for MVP)

## Status

Accepted — August 18, 2025

## Context

Daily must be the same worldwide, encourage fairness, and be simple.

## Decision

- Daily seed = `YYYYMMDD + patternId + difficulty` (UTC).
- Rotate **weekly difficulty patterns** from four predefined mixes (`patternId`).
  - A: easy, medium, hard, expert, master, extreme, medium
  - B: medium, hard, expert, master, extreme, hard, easy
  - C: hard, expert, master, extreme, hard, medium, easy
  - D: expert, master, extreme, hard, medium, easy, medium
- **Remove reroll** for MVP.

## Consequences

- Deterministic shared experience.
- Lower complexity.
- Room to iterate later if needed.
