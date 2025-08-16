## Release Policy

### Trunk-based development

- `main` is always releasable. Small, frequent merges.
- Feature work happens on short-lived branches (e.g., `feat/theme-toggle`).
- All merges to `main` pass typecheck, lint, unit tests, and smoke E2E in CI.

### Feature branches and PR previews (EAS Update)

- For UI/UX review, publish preview Updates from feature branches:
  - `pnpm eas:update:preview` (runs in `apps/app` via workspace filter)
  - Channel: `preview` (see `apps/app/eas.json` for channels/profiles)
- Use PR description to include QR codes/links from the EAS Update output for reviewers.

### Versioning and changelogs with Changesets

- We use Changesets to manage versions and changelogs across workspaces.
- When a change is user-visible or affects a package API, add a changeset:
  - `pnpm dlx changeset` and follow prompts (select affected packages, bump type)
- On release:
  - Version packages and generate changelogs: `pnpm release`
  - This commits version bumps and changelogs and creates tags.

### Cutting a manual release (if needed)

Situations: hotfix, failed automation, or out-of-band release.

1) Ensure `main` is green in CI.
2) Bump versions and changelogs locally:

```bash
pnpm dlx changeset version
pnpm install
git add -A
git commit -m "chore: version packages"
git push
```

3) Tag and push tags (if not using `pnpm release`):

```bash
pnpm dlx changeset tag
git push --follow-tags
```

4) Publish EAS Updates:

```bash
pnpm eas:update:prod
```

Add release notes to the PR and link changeset-generated changelogs.


