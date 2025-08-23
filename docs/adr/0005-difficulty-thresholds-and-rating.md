# ADR-0005: Difficulty Thresholds and Rating Approach (MVP)

## Status

Accepted — August 22, 2025

## Context

MVP requires deterministic generation across tiers L0–L5 subset and a fast rating path suitable for Daily.

## Decision

- Define clue thresholds per tier:
  - easy: ≥34
  - medium: 28–33
  - hard: 24–27
  - expert: 22–25
  - master: 20–23
  - extreme: 17–20
- Provide a rating function that classifies primarily by thresholds and augments with a lightweight singles-only technique pass under 800ms.

## Alternatives Considered

- Full technique-based rating for MVP: rejected due to latency and scope; defer to post-MVP.

## Consequences

- Generator targets `minClues` derived from thresholds when a difficulty is supplied.
- Rating is deterministic and fast; extensible for deeper technique analysis later.
