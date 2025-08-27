# Contributing

Thanks for contributing! Please follow the style, testing, and DevOps rules under `.cursor/rules/`.

## Sub-Issue Templates

- Use the following templates when creating sub-issues under an Epic and include `Parent: #<epic-number>` in the body.
  - `docs/templates/feature-sub-issue.md`
  - `docs/templates/bug-sub-issue.md`
  - `docs/templates/chore-sub-issue.md`
- After creating, link them as sub-issues of the Epic. If you have the GitHub CLI extension installed, you can run:
  - `gh sub-issue add --parent <epic-number> --child <issue-number>`

## Automation

- See `.cursor/rules/epic-prompts.md` for prompts to scope Epics and prepare sub-issues.
- Epic automation can be run via `scripts/epic-run.ps1` or by commenting `/run-epic <number>` on the Epic.
