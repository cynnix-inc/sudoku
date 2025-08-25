# Epic prompts

When to use: automating epic work or finalizing epics into `staging`.

These prompts define how to automate Epic work and finalize it into staging.  
They follow repository standards from `.cursor/rules` and guidance in `docs/README.md`.  
Environment: PowerShell (avoid non-portable pipes like `| cat`).

## --

## Prompt 1a — Automate Epic Work (preselected Epic)

Epic: Epic #<number> — <title>
Shell: PowerShell (avoid Unix‑only pipes).
Standards: Follow .cursor/rules and docs/README.md for workflow, testing, CI, and documentation.

🎯 Goal

Process this Epic end‑to‑end by iterating sub‑issues sequentially (and nested sub‑issues first), merging each into the epic branch, and closing each sub‑issue after merge. Follow repo standards in .cursor/rules and docs/README.md.

🗂 Workflow

1. Epic branch

- Create an epic branch from staging; ensure CI passes on the clean branch.
  (Trunk‑based & CI gates)

2. Sub‑issue loop

- List all open sub‑issues for this Epic (see docs/README.md for sub‑issue usage) .
- For each sub‑issue:
  -- Nested first: if the sub‑issue has children, complete all nested sub‑issues first, then the parent.
  -- Existence check (efficiency): search code/docs to see if the feature already exists.
  --- If it exists: align to current requirements, ensure tests cover ACs and are green, update docs/ADR/CHANGELOG as needed. Only write new code if gaps remain. (Architecture + repo map)
  -- Implement: honor module boundaries (pure core, presentational UI, app glue), strict TS/style, accessibility; avoid heavy deps unless reviewed.
  -- Update: tests per AC (respect coverage), docs, ADRs, CHANGELOGs.
  -- Verify: run CI locally (lint, typecheck, tests, build, bundle, audit).
  -- PR: open PR into the epic branch using Conventional Commits.
  -- Merge gate (automated): enable auto‑merge if allowed; poll until checks are green and the PR is merged.
  -- Close the sub‑issue: post a brief verification note with the PR link.
  -- Rebase epic on staging to minimize conflicts, then continue to the next sub‑issue.

3. Finalize Epic

- When all sub‑issues are merged & closed, proceed with your “Finalize Epic” prompt (epic → staging).
  (Keep ADRs/docs consistent with the final state.)

📝 Output expectations (per sub‑issue)

- Edits: list of changed files + colocated tests.
- Quality: CI all green.
- PRs: one PR per sub‑issue into epic branch (merged before the next).
- Docs: docs/ and ADR updates referenced in the PR body.

📦 Consistency requirements

- Security checklist honored; no secrets in code/logs; least‑privilege.
- Coverage thresholds met; no real network/timers in unit tests.
- CI gates enforced (bundle delta ≤5%, audit high‑sev clean).

---

## 🔹 Prompt 1B — Automate Next Epic Work (auto‑select Epic)

Shell: PowerShell (avoid Unix‑only pipes).
Standards: Follow .cursor/rules and docs/README.md for workflow, testing, CI, and documentation.

🎯 Goal

- Auto‑select the next Epic to work on (issues labeled type/epic), then process its sub‑issues sequentially (nested first).
- Each sub‑issue must merge into the epic branch and be closed before the next begins.
- Keep CI, security, architecture, and docs in compliance.

🗂 Workflow

1. Identify Candidate Epics

- List all open issues labeled type/epic and read their descriptions/metadata.

2. Select Next Epic (prioritization)
   Choose using this order:
1. MVP‑Critical / Core gameplay (needed for first playable slice).
1. Hotfix / CI / Security (CI failing on staging/main; security/privacy risk) — handle before features.
1. Dependency‑Unblockers (unlocks other Epics/features).
1. In‑Progress / Near‑Done (reduce WIP and drift).
1. Tie‑breaker: Oldest first (minimize long‑lived branch drift).

Special cases:

- Bug‑fix Epics → treat as #2; add failing test first, fix, keep test; require green CI.
- Updated‑spec Epics → pause to add an ADR, update ACs/docs, and align tests, then continue.

Announce: “Proceeding with Epic #X — <title>”.

3. Epic Branch

- Create epic branch from staging; ensure clean branch passes CI.

4. Sub‑Issue Loop (for each sub‑issue)

- Nested first: if the sub‑issue has children, complete those before the parent.
- Existence check: search code/docs to confirm if feature already exists. If yes, align with current requirements, ensure tests cover ACs and are green, and update docs/ADR/CHANGELOGs. Only write new code if gaps remain.
- Implement: honor module boundaries (pure core in packages/core, presentational UI in packages/ui, app glue in apps/\*), strict TS/style/a11y; avoid heavy deps unless reviewed.
- Update: tests per AC (respect coverage), docs, ADRs, CHANGELOGs.
- Verify locally: lint, typecheck, tests, build, bundle delta, audit.
- PR: open into the epic branch with Conventional Commits.
- Merge gate (automated; no human input):
  -- Enable auto‑merge if allowed; poll until required checks are green and PR is merged.
  -- If checks fail, fix and push; keep polling.
- Close the sub‑issue: after merge, close it with a short verification note linking the PR.
- Rebase epic on staging to minimize conflicts, then continue to the next sub‑issue.

5. After all sub‑issues are done

- Use your Finalize Epic prompt (epic → staging). Keep ADRs/docs consistent with final state.

📝 Output Expectations (per sub‑issue)

- Edits: changed files + colocated tests.
- Quality: CI all green.
- PRs: exactly one PR per sub‑issue into the epic branch (merged before next).
- Docs: docs/ and ADR updates referenced in PR body.

⚠️ Guardrails

- Always process nested sub‑issues before parent.
- Prior to merge, Never skip lint, typecheck, tests, build, bundle delta, or audit.
- Security: no secrets in code/logs; least‑privilege; encrypt in transit.
- If Epic selection or ACs are ambiguous, pause and request human guidance.

---

## ##🔹 Prompt 2 — Epic Review (post sub-issues completion)

Epic: Epic #<number> — <title>

Goal
Review all completed sub-issues in this Epic to confirm they meet requirements and are production-ready before final merge.

Workflow
For each sub-issue in the Epic:

1. Documentation & Requirements Check

- Compare the issue description and MVP documentation against the code implementation.
- Ensure all specified functionality and behaviors are present.
- Verify ADRs/CHANGELOGs/docs were updated where relevant.

2. Acceptance Criteria & Tests

- Confirm all acceptance criteria (AC) are implemented.
- Check that tests exist to cover each AC.
- Ensure tests are passing locally and in CI (green across lint, typecheck, unit, integration, e2e if defined).

3. Deviation Handling

- If there are major deviations between requirements and implementation, or missing tests/docs:
  -- Do not proceed automatically.
  -- Prompt for help and flag the issue for manual review.

Output Expectations (per sub-issue)

- Status: Pass / Needs Attention.
- Edits Required: List any missing docs, ADR updates, or tests.
- Quality: Confirm CI status (green).
- Confidence: Summarize whether implementation matches requirements fully.

Guardrails

- Never mark an issue as complete if AC or tests are missing.
- Stop review immediately if requirements and code diverge significantly — escalate for human input.
- Use PowerShell conventions; avoid Unix-only pipes (| cat).

After all sub-issues are reviewed and marked “Pass,” proceed with Prompt 3 — Finalize Epic to merge into staging.

---

## 🔹 Prompt 3 — Finalize Epic

---

Epic: `Epic #<number> — <title>`

### 🎯 Goal

- Complete the Epic by merging the epic integration branch into staging.
- Summarize work and close the Epic.

### 🗂 Workflow

1. Rebase & Verify

- Rebase the epic branch on `staging`.
- Resolve conflicts.
- Run full CI to confirm green.

2. Final PR

- Open one PR: `epic/<epic-number>-<slug> → staging`.
- PR body should include:
  - Summary of completed sub-issues.
  - Risks and rollback plan.
  - Links to all merged sub-issue PRs.

3. Close Epic

- After merge, close the Epic with references to the final PR and linked sub-issue PRs.

### 📝 Output Expectations

- Edits: any final cleanup, doc updates, ADRs, or CHANGELOG entries.
- Quality: CI green after rebase.
- PRs: exactly one final PR epic → staging.
- Docs: ensure `docs/` and MVP tracking section reflect final state.
