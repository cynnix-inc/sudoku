Rule: Project mission, scope, and repo map
Applies to: entire repository
Use when: planning features, creating folders, onboarding, prioritizing work

Purpose

- Define what we are building, where code lives, and non-negotiable constraints.

Out of scope

- Language/framework minutiae (see `10-style.md`).
- Layering and import rules (see `20-architecture.md`).

Priority

- If rules conflict, this file wins over `10-style.md` and `20-architecture.md`.

# Mission

- Deliver a fast, accessible Sudoku experience with clean UI and reliable gameplay across iOS, Android, and Web (Expo).

# Scope and Stack

- Platforms: Expo (React Native), Web via React Native Web.
- Language: TypeScript.
- Navigation: Expo Router in `app/`.
- Styling: Tailwind via NativeWind; design tokens live alongside components.
- Testing: Jest + Testing Library (React Native preset).

# Repo map (authoritative)

```
app/                 # Expo Router routes (e.g., app/index.tsx, app/<screen>/index.tsx)
docs/                # Project docs and rules
scripts/             # Local scripts (e.g., bundle check, dep verify)
supabase/            # SQL migrations and seed data (if used)
App.js               # Expo entry
package.json         # npm scripts (lint, typecheck, test, build)
```

# Guardrails (apply to every edit)

- Must keep changes minimally scoped; avoid drive-by refactors.
- Must update or add tests that fail without the change.
- Must update docs/comments alongside code.
- Must preserve public APIs unless `BREAKING.md` is explicitly referenced.
- Must explain risky changes in the commit message body.

# NPM policy

- Use `npm ci` for reproducible installs.
- Commit `package-lock.json`.

# Examples

- Add a new screen: create `app/<feature>/index.tsx`, add a focused test under `__tests__/app/<feature>.test.tsx`.
- Update Sudoku logic: put pure helpers in `app/lib/` and cover with unit tests.

# Non-examples

- Introducing new package managers or workspace tooling without an ADR.
- Adding heavy dependencies without review or measurable need.

# How to change these rules

- Propose a PR that edits `.cursor/rules` and updates examples.
- Include a short plan for testing the rule (run Cursor on a throwaway branch).
- Required reviewers: at least one maintainer.
