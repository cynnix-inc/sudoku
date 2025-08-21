# Epic prompts

When to use: automating epic work or finalizing epics into `staging`.

These prompts define how to automate Epic work and finalize it into staging.  
They follow repository standards from `.cursor/rules` and guidance in `docs/README.md`.  
Environment: **PowerShell** (avoid non-portable pipes like `| cat`).

---

## 🔹 Prompt 1 — Automate Epic Work (sub-issues loop)

---

**Epic:** `Epic #<number> — <title>`

### 🎯 Goal

- Process Epic sub-issues sequentially with `gh sub-issue`.
- Follow repo standards in `.cursor/rules` and `docs/README.md`.
- Work happens in an **epic integration branch**. Each sub-issue merges into this branch **before** the next begins.

### 🗂 Workflow

1. **Epic Branch**

- Create an epic branch from `staging`.
- Ensure CI passes on the clean branch.

2. **Sub-Issue Loop**

- List open sub-issues for the Epic (see `docs/README.md` for details).
- For **each** sub-issue:
  - Create a feature branch off the epic branch.
  - Implement changes per acceptance criteria and `.cursor/rules`.
  - Update tests, docs, ADRs, and CHANGELOGs as required.
  - Run CI locally (lint, typecheck, tests, build, audit).
  - Commit with Conventional Commits.
  - Open a PR into the epic branch.

  **Merge Gate (non-blocking, no user input):**
  - Enable auto-merge (if repo policy allows).
  - **Poll** PR status at a regular cadence (e.g., every 30–60 seconds):
    - Wait until: all required checks are green **and** PR is merged into the epic branch.
    - If checks fail: amend the branch to fix, push, and keep polling.
    - If merge is blocked by required reviews: leave a concise comment tagging required reviewers, **continue polling** until merged.
  - After the PR merges:
    - Rebase the **epic branch** on latest `staging` to minimize conflicts.
    - Proceed to the next sub-issue.

### 📝 Output Expectations (per sub-issue)

- **Edits:** list of changed files + colocated tests.
- **Quality:** CI all green.
- **PRs:** one PR per sub-issue into the epic branch (merged before starting the next).
- **Docs:** update `docs/` and ADRs, reflected in PR body.

### 📦 Consistency Requirements

- **ADRs** updated where architectural/logic decisions change.
- **QA feature files** reflect updated behavior.
- **CHANGELOGs** include layout, icons, seed rules, undo/lives logic.
- **Tests** updated for new behaviors.
- **MVP doc** updated with new issue IDs in the tracking section.

### ⚠️ Guardrails

- Never skip lint, typecheck, tests, or CI.
- Keep branches small and focused.
- If acceptance details are missing, note it in the sub-issue and continue with the next ready item.
- PowerShell environment: avoid non-portable pipes and Unix-only idioms.

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

**Epic:** `Epic #<number> — <title>`

### 🎯 Goal

- Complete the Epic by merging the epic integration branch into **staging**.
- Summarize work and close the Epic.

### 🗂 Workflow

1. **Rebase & Verify**

- Rebase the epic branch on `staging`.
- Resolve conflicts.
- Run full CI to confirm green.

2. **Final PR**

- Open one PR: `epic/<epic-number>-<slug> → staging`.
- PR body should include:
  - Summary of completed sub-issues.
  - Risks and rollback plan.
  - Links to all merged sub-issue PRs.

3. **Close Epic**

- After merge, close the Epic with references to the final PR and linked sub-issue PRs.

### 📝 Output Expectations

- **Edits:** any final cleanup, doc updates, ADRs, or CHANGELOG entries.
- **Quality:** CI green after rebase.
- **PRs:** exactly one final PR epic → staging.
- **Docs:** ensure `docs/` and MVP tracking section reflect final state.
