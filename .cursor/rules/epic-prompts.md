Rule: Epic Planning Prompts
Applies to: epics, issues, sub-issues, project docs
Use when: drafting or running multi-step epic automation
Avoid: vague scope; always include Parent: #<epic-number>

# Overview
This file provides 10 copy/paste-ready prompts to plan and run epics. Each prompt includes Human Notes and a Copy/Paste block. Ensure sub-issues link back to their parent epic using "Parent: #<epic-number>" and are attached via the sub-issue command.

---

## 1a) Create epic with goals and acceptance criteria
Human Notes: Outline business goals, scope boundaries, and simple measurable acceptance criteria.
Copy/Paste:
"""
Create an Epic titled: <Epic title>.
Include: Goals, Non-Goals, Success Metrics, Risks, Out of Scope.
Add an acceptance checklist with 5-8 items.
Labels: type/epic, status/ready, priority/p2, area/core.
"""

## 1b) Derive sub-issues and link to the epic
Human Notes: Split into small, independently verifiable tasks. Include Parent: #<epic-number>.
Copy/Paste:
"""
From Epic #<epic-number>, create sub-issues for each deliverable.
Each sub-issue must include: title, scope, acceptance checklist, and "Parent: #<epic-number>".
Labels: type/feature or type/chore, status/ready, appropriate area/* and priority.
Then link them as sub-issues to Epic #<epic-number>.
"""

## 2) Discovery and spikes
Human Notes: Use when uncertainty is high; timebox and include decision outputs.
Copy/Paste:
"""
Create a Discovery sub-issue (Parent: #<epic-number>) with:
- Questions to answer
- Timebox (e.g., 1 day)
- Evaluation criteria
- Decision log outputs
Labels: status/in-progress, type/chore.
"""

## 3) Risk register and mitigations
Human Notes: Identify blockers and propose mitigations.
Copy/Paste:
"""
Add a comment to Epic #<epic-number> listing top 5 risks, likelihood/impact, and mitigations.
Label epic: needs-human if any high impact risks lack mitigation.
"""

## 4) Definition of Done alignment
Human Notes: Align on testing, docs, and release criteria.
Copy/Paste:
"""
Add a DoD section to Epic #<epic-number>:
- Tests updated
- Docs updated
- CI green
- Rollback plan
"""

## 5) Execution plan
Human Notes: Order by dependencies and value.
Copy/Paste:
"""
Plan execution for Epic #<epic-number>:
- Order sub-issues by dependency and value
- Identify critical path
- Assign owners
- Target dates
"""

## 6) T-Shirt sizing and throughput forecast
Human Notes: Quick size per sub-issue and rough forecast.
Copy/Paste:
"""
For Epic #<epic-number>, add sizes (S/M/L) to each sub-issue and forecast completion based on historical throughput.
"""

## 7) Dependency map
Human Notes: Surface external blocking items.
Copy/Paste:
"""
Comment on Epic #<epic-number> with a dependency map listing external teams, services, or approvals.
"""

## 8) Release notes draft
Human Notes: Prep user-facing notes early.
Copy/Paste:
"""
Draft release notes for Epic #<epic-number>: user impact, notable changes, migration notes.
"""

## 9) QA checklist
Human Notes: Convert acceptance criteria into a QA script.
Copy/Paste:
"""
Create a QA checklist for Epic #<epic-number> based on acceptance criteria. Include smoke tests and edge cases.
"""

## 10) Post-mortem template
Human Notes: Schedule a retro and capture learnings.
Copy/Paste:
"""
Post-mortem for Epic #<epic-number>:
- What went well
- What didn’t
- Action items with owners and dates
"""

