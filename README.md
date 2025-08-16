## Ultimate Sudoku

Monorepo for the Ultimate Sudoku app using Expo Router, NativeWind, and shared UI packages.

### Getting Started

1. Enable Corepack and install dependencies:

   ```bash
   corepack enable
   pnpm install
   ```

2. Run the app:

   ```bash
   pnpm dev     # start Metro/dev server (native)
   pnpm web     # run on web
   pnpm ios     # run iOS (requires Xcode)
   pnpm android # run Android (requires Android SDK)
   ```

3. Recommended toolchain (via Volta): Node 22.5.1, PNPM 9.12.0.

### Environment Setup

Create a Supabase project at `https://supabase.com`, then copy the Project URL and anon public key into a `.env` file at the repo root (or use OS env vars):

- `SUPABASE_URL=...`
- `SUPABASE_ANON_KEY=...`
- `EAS_PROJECT_ID=...` (required for EAS builds/updates)
- `APP_ENV=development`

Warning: never expose Supabase service role keys in the client or commit them to the repo.

Deep linking redirect for Supabase (Authentication → URL Configuration):

```
ultimate-sudoku://**
```

See onboarding docs at `docs/onboarding/` for full details.

### Scripts

<!-- AUTOGEN: SCRIPTS -->
| Script | Command |
| --- | --- |
| `android` | pnpm --filter apps/app run android |
| `dev` | pnpm --filter apps/app start |
| `docs:generate` | node scripts/generate-readme.mjs |
| `e2e` | pnpm exec playwright test |
| `eas:update:preview` | pnpm --filter apps/app run eas:update:preview |
| `eas:update:prod` | pnpm --filter apps/app run eas:update:prod |
| `format` | pnpm -r exec prettier --write . |
| `ios` | pnpm --filter apps/app run ios |
| `lint` | pnpm -r exec eslint . |
| `new:branch` | powershell -ExecutionPolicy Bypass -File ./scripts/new-branch.ps1 |
| `release` | changeset version && git add -A && git commit -m 'chore: version packages' && git push && changeset tag && git push --follow-tags |
| `test` | pnpm -r run test |
| `test:ci` | node scripts/check-tests.mjs && pnpm -r run test:ci |
| `typecheck` | pnpm -r run typecheck |
| `web` | pnpm --filter apps/app run web |
<!-- /AUTOGEN -->

### EAS Channels

<!-- AUTOGEN: EAS-CHANNELS -->
| Profile | Channel | Distribution | Dev Client |
| --- | --- | --- | --- |
| `development` | development | internal | yes |
| `preview` | preview |  |  |
| `production` | production |  |  |
<!-- /AUTOGEN -->

### CI Overview

- Linting and formatting: `pnpm lint`, `pnpm format`
- Tests: `pnpm test` (unit), `pnpm e2e` (Playwright)
- Docs sync: updates the README sections above on changes to scripts/EAS config

### Troubleshooting

- Expo cache issues: try `rm -rf .expo` and restart with `pnpm dev` (or `--clear`)
- iOS build hiccups: clean Derived Data and reinstall pods in `apps/app/ios`
- Android device not detected: ensure `adb devices` shows your device and USB debugging is enabled
- EAS auth: run `eas whoami` and `eas login` if updates/builds fail

