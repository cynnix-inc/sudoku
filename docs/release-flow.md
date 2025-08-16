## Release flow

This repo uses a solo-dev friendly, trunk-based flow with three environments powered by Expo EAS Updates.

- **development**: local dev or internal builds, `eas build --profile development`, updates go to `development` channel
- **preview**: PR preview updates for QA, updates go to `preview` channel
- **production**: main branch updates, updates go to `production` channel

### Branches and channels

- Feature branches are short-lived and merge into `main` via PRs
- EAS Update channels map to branches:
  - `development` ↔ local dev / internal
  - `preview` ↔ pull requests
  - `production` ↔ main

### Day-to-day

1. Create a feature branch from `main`
2. Open a PR. The `PR Preview` workflow publishes an EAS Update to the `preview` channel.
3. Scan the QR in the EAS dashboard or open the Updates tab in a dev client to install the preview.
4. Merge to `main` when ready.
5. On push to `main`, CI runs, Changesets generates versions/releases, and an EAS Update is published to the `production` channel.

### Promote preview to production

If a preview should go live without a rebuild, publish the same commit to the `production` channel:

```bash
pnpm --filter apps/app run eas:update:prod
```

### Changesets

- Commit changes regularly.
- When merging to `main`, the `release` workflow runs Changesets to bump versions and publish.
- Manual release: `pnpm release` from the repo root.


