# ADR-0002: Daily Determinism & No Reroll (Finalized for MVP)

## Status

Accepted — August 18, 2025

## Context

Daily must be the same worldwide, encourage fairness, and be simple.

## Decision

- Daily seed = `YYYYMMDD + patternId + difficulty` (UTC).
- Rotate **weekly difficulty patterns** from four predefined mixes (`patternId`).
- **Remove reroll** for MVP.

## Consequences

- Deterministic shared experience.
- Lower complexity.
- Room to iterate later if needed.
