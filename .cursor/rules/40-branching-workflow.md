Rule: Branching Workflow
Applies to: entire repository
Use when: creating branches, opening PRs, releasing
Avoid: long-lived branches, direct commits to main
Definition of Done:
  - Features branch from staging and merge back via PR
  - Promotion from staging -> main via PR

Branches
- main: production
- staging: integration
- feat/*, fix/*: short-lived
- hotfix/*: branch from main, then back-merge to staging

Flow
1. Branch: `git checkout staging && git pull && git checkout -b feat/<name>`
2. PR to `staging`. CI runs lint/types/tests/build.
3. Promote via PR from `staging` to `main`.
4. Hotfix: branch from `main`, PR to `main`, then PR back to `staging`.


