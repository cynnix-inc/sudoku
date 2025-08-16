## Testing Policy

### Our testing pyramid

- Unit tests (broad base)
  - Fast, isolated, cover components and small utilities
  - Tools: Jest + `@testing-library/react-native` (configured in `apps/app` and `packages/ui`)
- Integration tests
  - Cross-component interactions, navigation, storage
  - Also via Jest where possible; target realistic usage
- E2E smoke tests (thin top)
  - Small set of critical-path checks on the web build using Playwright
  - CI builds the web app and runs a smoke suite

### Coverage targets

- `packages/ui`: 80% lines, 80% statements, focus on shared UI stability
- `apps/app`: 70% lines overall, higher for core screens (Settings, Home)
- E2E: not measured by coverage; keep suite under ~1–2 minutes

These are targets, not hard gates during early development, but PRs should trend coverage up and never significantly regress it.

### Where tests live

- App unit/integration: `apps/app/__tests__/` (see `jest.config.ts`)
- UI package tests: `packages/ui/src/**/__tests__/*.test.tsx`
- E2E: `tests/e2e` with Playwright config at repo root

### Commands

- All workspaces: `pnpm test`
- App only: `pnpm --filter apps/app run test`
- UI only: `pnpm --filter packages/ui run test`
- CI mode with coverage: `pnpm test:ci`
- E2E (web smoke): `pnpm e2e` (after a web export exists)

### Running locally on Windows PowerShell

Prereqs: Node and PNPM via Volta (recommended).

```powershell
# one-time
corepack enable
pnpm install

# run unit tests (all)
pnpm test

# run only app tests
pnpm --filter apps/app run test

# run only UI package tests
pnpm --filter packages/ui run test

# generate a web build and run E2E smoke in another terminal
pnpm --filter apps/app run build:web
pnpm e2e
```

Notes:

- If Playwright asks to install browsers, run: `pnpm exec playwright install`.
- In CI, we export web automatically and run Playwright against `http://localhost:8000` with a static server.


