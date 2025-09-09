# Supabase Engineering Rules

When to use: Any feature integrating with Supabase client, auth, storage, RLS, or SQL migrations.

## Environment Naming & Access

- Use profiles: `local`, `dev`, `staging`, `prod`.
- Never embed service keys in client bundles. Use anon key only.

## Client Guards & Bundling

- Wrap client creation to throw with clear message when env vars are missing.
- Tree-shakeable exports; avoid dynamic requires.

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
    HttpResponse.json([{ id: 'u_1', email: 'a@example.com' }]),
  ),
];
```

```ts
// __tests__/msw/server.ts
import { setupServer } from 'msw/node';
import { supabaseHandlers } from './handlers/supabase';

export const server = setupServer(...supabaseHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Local Profiles

- `supabase/config.toml` holds default profile; do not commit secrets.
- Use `.env.local` for local URLs and anon keys.

## Migrations Conventions

- Name migrations `YYYYMMDDHHMMSS_description.sql`.
- One concern per migration; idempotent down steps where applicable.

## CI Expectations

- Workflow: `.github/workflows/supabase-validate.yml` runs on PRs (non-blocking) to surface migration diffs.
- PRs touching `supabase/**` should include brief rationale and test notes.

## References

- Supabase CLI: `https://supabase.com/docs/guides/cli`
- MSW: `https://mswjs.io/`
