# Supabase Engineering Rules (Issue #427)

Applies to: app/**, scripts/**, CI
Use when: accessing Supabase, adding envs, writing network tests, creating migrations
Avoid: leaking secrets, bundling admin client in app, brittle network tests
Definition of Done:

- Env vars named consistently and read via a single module
- Client creation is guarded and tree-shakeable; admin code never ships to app
- Contract tests run against MSW/fakes; live calls only in dedicated E2E
- Migrations follow naming/rollback conventions

## Environment Naming & Access

- Public client envs:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Never read envs ad hoc across the codebase. Centralize access in `app/services/supabase.ts`.
- In tests, if envs are missing, log a single warning and provide a safe no-op client.

## Client Guards & Bundling

- App bundle must only include the public client (no service role keys).
- Guard client creation:
  - Export a factory that returns a configured client when both URL and ANON are set.
  - Otherwise return a stub with no-op methods used by tests.
- Keep admin/service-role client usage in server-only scripts or CI utilities, never in app code.

## Contract Tests & MSW

- Prefer MSW handlers or fakes over live network calls in unit tests.
- Model success, error, and edge cases; reset handlers between tests.
- Keep a small number of CI smoke tests for serialization/shape using recorded fixtures.

### Example: MSW setup pattern

```ts
// __tests__/msw/handlers/supabase.ts
import { http, HttpResponse } from 'msw';

export const supabaseHandlers = [
  http.post('https://supabase.example.com/auth/v1/token*', () =>
    HttpResponse.json({ access_token: 'test', expires_in: 3600 }),
  ),
  http.get('https://supabase.example.com/rest/v1/profile*', () =>
    HttpResponse.json([{ id: 'u_1', name: 'Test User' }]),
  ),
];
```

```ts
// __tests__/msw/server.ts
import { setupServer } from 'msw/node';
import { supabaseHandlers } from './handlers/supabase';

export const server = setupServer(...supabaseHandlers);
```

```ts
// jest.setup.ts (augment existing)
import { server } from './__tests__/msw/server';
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Notes

- Handlers live under `__tests__/msw/handlers/*` grouped by service.
- Keep URLs parametric if possible; prefer reading base URL from a single module.
- Tests must pass without real env keys; MSW covers contract-level behavior.

## Local Profiles

- Document local profiles (e.g., `.env.development`, `.env.test`) and how to obtain URL/key.
- Do not commit secrets. Use `.env*` in `.gitignore`; provide `.env.example` for required keys.

## Migrations Conventions

- Use descriptive, timestamped names (e.g., `20250905T1230_add_user_index.sql`).
- Migrations must be idempotent or guard against double-apply when feasible.
- Provide down/rollback where supported; document irreversible changes.

## CI Expectations

- Lint/type/tests must pass without live Supabase.
- For any job needing live Supabase, run in a separate workflow with explicit secrets and safeguards.

## References

- Related: `40-security.md`, `50-devops.md`, `30-testing.md`
- Issue: #427
