Rules index

When to use: as a starting point to find the right rule file.

- 00-project.md — Project overview, repo map, working agreements
- 10-architecture.md — Boundaries, layering, ADRs
- 20-style-guide.md — TS/React patterns, a11y, imports
- 30-testing.md — Coverage gates, test utilities, fakes/MSW
- 40-security.md — Secrets, data handling, dependency audits
- 50-devops.md — CI, releases, npm audit, bundle delta
- 60-prompts.md — Cursor task macros
- 61-epic-prompts.md — Epic automation and finalize prompts
- 99-glossary.md — Project-specific terminology and definitions

Conventions

- Each file starts with a title and a "When to use" section.
- Keep rules concise; if rules overlap, higher-numbered files (e.g., 50-\*) win for their domain.
- Examples and paths match this repo structure (`app/**`, `__tests__/`).

## Key Rules Integration

- **Architecture + Security**: Dependency review combines both domains
- **Testing + DevOps**: Coverage thresholds enforced in CI
- **Style + Architecture**: Import rules prevent cross-layer violations
- **Project + Architecture**: Repo structure enforces layering boundaries
