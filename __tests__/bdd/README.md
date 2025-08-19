# BDD (Gherkin) with Jest

This folder hosts executable specs mapped from `.feature` files under `docs/qa/features/` using `jest-cucumber`.

Why this approach now:
- Runs inside Jest (fast, stable, counts toward coverage if desired)
- No web/native E2E infrastructure yet; focuses on deterministic logic/behaviors

Conventions:
- One `*.steps.ts` per feature file (or per scenario group)
- Reuse shared helpers for parsing and state where needed
- Keep steps wording aligned with `docs/qa/features/*.feature`

Run locally:
```bash
npm run test:bdd
```

CI:
- BDD tests are excluded from the default `npm test` run to avoid surprising flakes. Add a dedicated job later when stable.


