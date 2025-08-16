# Supabase onboarding

This project uses Supabase for authentication and configuration flags. No gameplay data yet.

## 1) Create project and gather credentials

- Create a Supabase project
- In Project Settings → API, copy:
  - Project URL → `SUPABASE_URL`
  - anon public key → `SUPABASE_ANON_KEY`

Create a `.env` at repo root from `.env.example` and paste values. Do not put service role keys in client apps.

## 2) Deep linking for OAuth

- In `apps/app/app.config.ts`, the app scheme is `ultimate-sudoku`
- In Supabase → Authentication → URL Configuration, add redirect URL:

```
ultimate-sudoku://**
```

This enables mobile deep links and Expo dev client. The app exchanges the code with `supabase.auth.exchangeCodeForSession` when it receives the link.

## 3) Initialize database schema

Run the SQL in `supabase/sql/001_init.sql` in the Supabase SQL editor.

Tables created:
- `profiles` referencing `auth.users`
- `feature_flags (key text primary key, value jsonb, enabled boolean)`

RLS is enabled with safe defaults:
- Read/update own profile
- Read enabled flags for everyone (anon)
- No writes otherwise

## 4) Test queries

After running the SQL, test:

```sql
-- As anon, enabled flags are readable
select key, value from public.feature_flags where enabled = true;

-- Insert a flag (requires service role or admin)
insert into public.feature_flags(key, value, enabled) values ('new-ui', '{"bucket":"alpha"}', true);
```

## 5) Using in app

- Supabase client is initialized in `apps/app/lib/supabase.ts`
- Deep link handling for OAuth is wired in `apps/app/index.ts`
- Use `useRemoteFlags()` from `apps/app/lib/useRemoteFlags.ts` for feature flags:

```ts
const { isEnabled } = useRemoteFlags();
if (isEnabled('new-ui')) {
  // render beta UI
}
```

## 6) Storage

No storage buckets are used yet. When adding, create buckets in Supabase Storage and ensure RLS and signed URLs as needed.


