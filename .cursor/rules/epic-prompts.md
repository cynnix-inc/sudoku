Epic Prompts (10) — Human Notes and Copy/Paste

Human Notes
- These prompts help you scope an Epic, break it down into sub-issues, and run the automation. Keep answers concise and actionable.
- Always include the Epic number (e.g., #123) in sub-issues using the Parent: #<epic-number> convention.
- Link sub-issues using the GitHub CLI sub-issue extension when available.

Copy/Paste Prompts
1) Epic Definition
- Prompt: “Define the Epic in one paragraph: purpose, business value, and success criteria. Note assumptions and explicit out-of-scope items.”

2) Scope and Non-Goals
- Prompt: “List the concrete deliverables in scope for this Epic and explicitly list non-goals.”

3) Risks and Unknowns
- Prompt: “List the top 3–5 risks, unknowns, or dependencies that could delay this Epic and how they will be retired.”

4) Acceptance Criteria
- Prompt: “Provide testable acceptance criteria for the Epic and what constitutes ‘done’ (including documentation or rollout).”
- 4b) Sub-issue readiness checklist (keep this consistent with Sub-Issues prompts)
  1. For each sub-issue, ensure the body includes: Title, Summary (1–3 sentences), and “Parent: #<epic-number>”.
  2. Add labels: `type/<kind>`, `status/ready`, `priority/p<0-3>`, and `area/<area>`.
  3. Add acceptance criteria to each sub-issue using a bullet list that is directly testable.
  4. Link the sub-issue to the Epic using the sub-issue extension (see Prompt 7) or link manually (see Prompt 6).
  5. Confirm each sub-issue uses one of the templates under `CONTRIBUTING.md` → “Sub-Issue Templates”.

5) Sequencing
- Prompt: “Propose the execution order for sub-issues to maximize throughput and reduce risk. Note any parallelizable items.”

6) Sub-Issues — 1a (Manual Linking)
- Prompt: “Generate a minimal list of sub-issues. For each, provide a title, a 1–3 sentence summary, and include ‘Parent: #<epic-number>’. Ensure labels include ‘type/<kind>’, ‘status/ready’, and ‘priority/<pN>’.”
- Copy/Paste Template:
  Title: [Feature|Bug|Chore] <short>
  Summary: <1–3 sentences>
  Parent: #<epic-number>
  Acceptance Criteria:
    - <criteria 1>
    - <criteria 2>
  Labels: type/<kind>, status/ready, priority/p<0-3>, area/<area>

7) Sub-Issues — 1b (CLI Linking)
- Prompt: “Provide gh CLI commands to create and link each sub-issue as a sub-issue of the Epic using the sub-issue extension. Use Parent: #<epic-number> in body as well.”
- Example (PowerShell):
  $title = "[Feature] Add Settings Screen"
  $body  = @"
  Parent: #<epic-number>
  Summary: Implement settings view with toggles.
  Acceptance Criteria:
  - Toggle persists to storage
  - Unit tests cover reducers
  Labels: type/feature, status/ready, priority/p1, area/ui
  "@
  gh issue create --title $title --body $body --label "type/feature,status/ready,priority/p1,area/ui"
  # Then link as sub-issue (requires gh-sub-issue extension)
  gh sub-issue add --parent <epic-number> --child (gh issue list --search $title --json number --jq '.[0].number')

8) Estimation and Priority
- Prompt: “Estimate each sub-issue (S/M/L) and set priority labels (p0–p3). State the rationale briefly.”

9) Rollout and Backout
- Prompt: “Describe rollout plan, monitoring, and backout steps for this Epic (feature flags, staged rollout, or toggle).”

10) Success Metrics
- Prompt: “Define 2–3 measurable success indicators and how they will be collected.”

Operational Notes
- Use the ‘Sub-Issue Templates’ in CONTRIBUTING.md for consistent formatting.
- The Epic runner expects: ‘type/epic’ on the parent, and child issues with ‘status/ready’ to be picked up first.
- For automation details, see scripts/epic-run.ps1 and .github/workflows/epic-automation.yml.

