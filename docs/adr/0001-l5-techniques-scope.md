# ADR-0001: L5 Technique Scope (Finalized for MVP)

## Status
Accepted — August 18, 2025

## Context
We need challenging **Master/Extreme** puzzles without exploding generator complexity or latency.

## Decision
Adopt an **L5 subset** only:
- XY‑Chain
- Finned/Sashimi Fish (≤ Swordfish)
- Advanced AIC/forcing chains up to length **7**

Guardrails: if generation exceeds budget, fallback to lower L5 usage or reclassify puzzle.

## Consequences
- Enables credible top‑tier difficulty.
- Keeps generation predictable.
- Feature‑flagged for future tuning.
