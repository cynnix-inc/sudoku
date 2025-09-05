# Epic Prompts Cheat Sheet

Quick reference for all prompts. Each has a **Human Notes** section (read only) and a **Copy/Paste Prompt** section (use in Cursor).
Click a prompt name to jump to its section.

| Prompt # | Name                                                                                                            | When to Use                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 1a       | [New Issue Discovery (Batch Input)](#-prompt-1a--new-issue-discovery-batch-input)                               | During testing when multiple issues are found at once        |
| 1b       | [New Issue Discovery (Use Previous Chat Findings)](#-prompt-1b--new-issue-discovery-use-previous-chat-findings) | When issues were already listed in chat, no retyping         |
| 2        | [Orphaned Issues Review](#-prompt-2--orphaned-issues-review)                                                    | Weekly or before planning; ensure all issues belong to Epics |
| 3        | [Automate Epic Work (Preselected Epic)](#-prompt-3--automate-epic-work-preselected-epic)                        | You know which Epic to work on; process its sub-issues       |
| 4        | [Automate Next Epic Work (Auto-select)](#-prompt-4--automate-next-epic-work-auto-select)                        | Keep progress moving; automatically pick next Epic           |
| 5        | [Epic Review](#-prompt-5--epic-review-post-sub-issues-completion)                                               | After all sub-issues are merged, before final Epic merge     |
| 6        | [Finalize Epic](#-prompt-6--finalize-epic)                                                                      | When Epic is ready to merge into staging                     |
| 7        | [Workflow Fix After Staging PR](#-prompt-7--workflow-fix-after-staging-pr)                                      | A staging PR causes workflow failures                        |
| 8        | [Dependency Update & Audit](#-prompt-8--dependency-update--audit)                                               | Regularly (monthly/quarterly) or when alerts appear          |
| 9        | [ADR & Architecture Alignment](#-prompt-9--adr--architecture-alignment)                                         | Whenever architecture/design changes are made                |
| 10       | [Release Readiness Check](#-prompt-10--release-readiness-check)                                                 | Before cutting a release candidate (staging → production)    |

---

# Epic Prompts

These prompts define how to automate Epic work, review, and finalize into staging.
They follow repository standards from `.cursor/rules` and guidance in `docs/README.md`.
Environment: **PowerShell** (avoid non-portable pipes like `| cat`).

---

## 🔹 Prompt 1a — New Issue Discovery (Batch Input)

📘 **Human Notes**

- **When to use:** While testing/reviewing, when you’ve spotted multiple issues and want to log them all at once.
- **Goal:** Accept a list of findings, then create/route one GitHub issue per finding.
- **Key:** Batch entry, but each tracked separately.

💻 **Copy/Paste Prompt**

```
New Issue Discovery (Batch Input)

Context: Multiple issues were discovered during testing. Handle them one by one.

Workflow:
1. For each listed finding:
   - Verify against MVP doc.
   - Check if GitHub issue already exists.
   - If not, create a new GitHub issue with:
     - Clear title & description
     - Draft ACs
     - Labels (bug/feature/chore, severity, area)
   - Route to existing Epic (type/epic) as sub-issue, or create new Epic if none exists.
2. Stop here — no implementation, docs, or tests. Discovery only.
```

---

## 🔹 Prompt 1b — New Issue Discovery (Use Previous Chat Findings)

📘 **Human Notes**

- **When to use:** You’ve already logged issues during a test session in chat, and don’t want to retype them.
- **Goal:** Parse chat history for recent “list of findings,” then handle them just like 1a.
- **Key:** Zero re-entry overhead.

💻 **Copy/Paste Prompt**

```
New Issue Discovery (Use Previous Chat Findings)

Context: Parse chat history for the latest list of findings.

Workflow:
1. Retrieve the most recent list of issues from chat context.
2. For each finding:
   - Verify against MVP doc.
   - Check if GitHub issue already exists.
   - If not, create a new issue with title, description, ACs, and labels.
   - Route into existing Epic (type/epic) or create new Epic if none fits.
3. Confirm summary: created X new issues, linked to Epics A/B, skipped Y duplicates.
4. Stop here — discovery only, no implementation or docs/tests.
```

---

## 🔹 Prompt 2 — Orphaned Issues Review

📘 **Human Notes**

- **When to use:** Regularly (e.g., weekly), or before sprint/epic planning.
- **Goal:** Ensure all issues are linked to an Epic.
- **Key:** If no Epic fits, create a new one. For hotfix-only items, mark explicitly as standalone bug.

💻 **Copy/Paste Prompt**

```
Orphaned Issues Review

Goal:
- Ensure all open issues (not labeled type/epic) are assigned.

Workflow:
1. Identify all open issues without type/epic.
2. Check if each is already a sub-issue.
3. If not, assign to the appropriate Epic (per MVP doc).
4. If no Epic fits, create new Epic (type/epic) and attach.
5. If ambiguous, pause and request human guidance.
```

---

## 🔹 Prompt 3 — Automate Epic Work (preselected Epic)

📘 **Human Notes**

- **When to use:** You already know which Epic you want to work on.
- **Goal:** Process its sub-issues sequentially, closing each after merge.
- **Key:** Nested sub-issues first, existence check before implementing, full CI green, docs/tests updated only if behavior changes.

💻 **Copy/Paste Prompt**

```
Automate Epic Work (preselected Epic)

Epic: Epic #<number> — <title>

Goal:
- Process Epic end-to-end by iterating sub-issues sequentially (nested first).
- Merge each into epic branch, close sub-issues after merge.
- Follow repo standards in .cursor/rules and docs/README.md.

Workflow:
1. Create epic branch from staging.
2. For each sub-issue:
   - Process nested sub-issues first.
   - Existence check: if feature exists, align instead of duplicating.
   - Compare to MVP doc + ACs before coding.
   - Implement per .cursor/rules.
   - Update tests/docs/ADRs/CHANGELOGs only if behavior changes.
   - Run full CI (npm run ci).
   - PR into epic branch, poll until merged.
   - Close sub-issue with verification note + PR link.
   - Rebase epic on staging if needed.
3. After all sub-issues merged & closed, proceed with Finalize Epic prompt.
```

---

## 🔹 Prompt 4 — Automate Next Epic Work (auto-select)

📘 **Human Notes**

- **When to use:** To keep momentum moving automatically without preselecting an Epic.
- **Goal:** Look up all open Epics (type/epic), select next logically, then process as in Prompt 3.
- **Key:** Prioritize MVP-critical, hotfix/security, dependency-unblockers, in-progress, then oldest (tie-breaker: smaller Epic).

💻 **Copy/Paste Prompt**

```
Automate Next Epic Work (auto-select)

Goal:
- Automatically select the next Epic and process sub-issues sequentially.

Workflow:
1. Identify candidate Epics (label type/epic).
2. Select next Epic using priority order:
   - MVP-critical
   - Hotfix / CI / Security
   - Dependency-unblockers
   - In-progress / Near-done
   - Oldest first (tie-breaker: smaller Epic)
3. Create epic branch from staging.
4. Process sub-issues as in Prompt 3 (nested-first, existence check, CI, merge, close).
5. After all sub-issues, use Finalize Epic prompt.
```

---

## 🔹 Prompt 5 — Epic Review (post sub-issues completion)

📘 **Human Notes**

- **When to use:** After all sub-issues in an Epic are merged but before final merge into staging.
- **Goal:** Verify implementation matches requirements, ACs, and tests.
- **Key:** Block if major deviations; confirm coverage thresholds, docs parity, and CHANGELOG updates.

💻 **Copy/Paste Prompt**

```
Epic Review (post sub-issues completion)

Goal:
- Review completed Epic before merging to staging.

Workflow:
1. For each sub-issue:
   - Compare MVP doc + ACs to implementation.
   - Ensure tests exist and coverage thresholds are met.
   - Confirm docs/ADRs/CHANGELOGs updated where required.
2. If major deviations, pause and request human guidance.
```

---

## 🔹 Prompt 6 — Finalize Epic

📘 **Human Notes**

- **When to use:** After review passes and Epic is ready to merge into staging.
- **Goal:** Merge epic branch into staging, summarize work, close Epic.
- **Key:** Confirm all sub-issues closed, update MVP tracking doc, ensure rollback plan documented.

💻 **Copy/Paste Prompt**

```
Finalize Epic

Epic: Epic #<number> — <title>

Goal:
- Merge epic branch into staging and close the Epic.

Workflow:
1. Rebase epic branch on staging, resolve conflicts, ensure CI green.
2. Open final PR epic → staging with summary of sub-issues, risks, rollback plan.
3. After merge:
   - Close Epic.
   - Update MVP tracking doc with Epic completion.
```

---

## 🔹 Prompt 7 — Workflow Fix After Staging PR

📘 **Human Notes**

- **When to use:** Anytime a PR merged into staging causes failing workflows.
- **Goal:** Create branch, fix minimal workflows, merge once CI passes.
- **Key:** Do not expose secrets, match Node/Volta versions per .cursor/rules.

💻 **Copy/Paste Prompt**

```
Workflow Fix After Staging PR

Goal:
- Fix failing workflows after a staging PR.

Workflow:
1. Create branch from staging.
2. Review failing workflows in .github/workflows/.
3. Apply minimal fixes (action versions, secrets, syntax).
4. Update docs with troubleshooting notes if needed.
5. Commit fix(ci): ... and PR into staging.
6. Merge once CI passes.
```

---

## 🔹 Prompt 8 — Dependency Update & Audit

📘 **Human Notes**

- **When to use:** Regularly (monthly/quarterly) or when alerts appear.
- **Goal:** Review and update dependencies respecting dependency gate rules.
- **Key:** Must log ADR if impactful, run full CI, confirm bundle delta < 5%.

💻 **Copy/Paste Prompt**

```
Dependency Update & Audit

Goal:
- Update and audit dependencies according to rules.

Workflow:
1. Review outdated/vulnerable deps.
2. Apply updates conservatively.
3. Confirm license, vuln, and size impact.
4. Add ADR if significant change.
5. Run full CI, confirm bundle delta < 5%.
6. Merge only if CI and gates green.
```

---

## 🔹 Prompt 9 — ADR & Architecture Alignment

📘 **Human Notes**

- **When to use:** Whenever architecture/design changes are proposed or detected.
- **Goal:** Ensure ADRs are updated and linked to Epics/PRs.
- **Key:** Block merges until ADR created/updated.

💻 **Copy/Paste Prompt**

```
ADR & Architecture Alignment

Goal:
- Ensure ADRs reflect current architecture decisions.

Workflow:
1. Check if architecture change is present.
2. Draft or update ADR (context, decision, alternatives, consequences).
3. Link ADR to Epic/PR.
4. Block merge until ADR exists and is approved.
```

---

## 🔹 Prompt 10 — Release Readiness Check

📘 **Human Notes**

- **When to use:** Before cutting a release candidate (staging → production).
- **Goal:** Verify all Epics in scope are closed, docs/CHANGELOG updated, version bumped, rollback plan exists.
- **Key:** Combines audit of CI health, docs parity, ADRs, and security scan.

💻 **Copy/Paste Prompt**

```
Release Readiness Check

Goal:
- Verify readiness before release to production.

Workflow:
1. Confirm all Epics for release are closed.
2. Confirm MVP tracking doc updated.
3. Update CHANGELOG + bump version.
4. Verify ADRs + docs parity.
5. Run security scan + ensure CI all green.
6. Prepare rollback plan.
```
