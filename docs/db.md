## Database: environments, local dev, and CI promotion

This project uses Supabase for auth and Postgres. Migrations live in `supabase/migrations/` and seed data in `supabase/seed.sql`.

### Environments
- **dev (local)**: Local Supabase stack via CLI. Fast iteration, disposable data.
- **staging**: Shared cloud project for integration testing. CI applies migrations on every push to `staging`.
- **prod**: Production cloud project. Promotion-only via PR from `staging` to `main`; CI applies migrations on `main`.

### Local development options

#### Option A — Fully local Supabase
Use this when you need to iterate on schema/SQL and run the app against a local DB.

Commands:
```bash
# Install CLI (macOS)
brew install supabase/tap/supabase
# or: npm i -g supabase

# Start local services (Postgres, Studio, Auth, etc.)
supabase start

# Apply migrations from supabase/migrations/
supabase db push

# Load seed data (idempotent)
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```
Notes:
- The seed file creates tables with `IF NOT EXISTS` and uses `ON CONFLICT DO NOTHING` so it’s safe to re-run.
- Ensures `pgcrypto` via `CREATE EXTENSION IF NOT EXISTS pgcrypto;` for `gen_random_uuid()`.

#### Option B — Point your local app to staging
Use this to test against shared staging data without running local services.
- Obtain `SUPABASE_URL` and `SUPABASE_ANON_KEY` for staging (ask a maintainer).
- Set them in your local `.env` or runtime env and run the app normally.
- Do not run `supabase db push` against staging from your laptop; let CI own staging.

#### Option C — Point your local app to prod (rare)
Only for debugging issues that reproduce only in production. Read-only wherever possible.
- Obtain `SUPABASE_URL` and a restricted key from a maintainer.
- Never run migrations or seed against prod from your laptop.

### Migrations and seed
- Place schema changes under `supabase/migrations/` (timestamped).
- Keep seed data deterministic and idempotent in `supabase/seed.sql`.
- Typical local workflow:
```bash
# generate a diff-based migration (optional)
supabase db diff --use-migra -f 2025xxxxxx_add_table
# review/edit SQL, then push locally
supabase db push
# load seed data
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

### CI promotion flow
- On push to `staging`: CI links to the staging Supabase project and runs `supabase db push`.
- On push to `main`: CI links to the production project and runs `supabase db push`.
- Secrets required (in repo or org settings):
  - `SUPABASE_ACCESS_TOKEN`
  - `SUPABASE_PROJECT_REF_STAGING`
  - `SUPABASE_PROJECT_REF_PROD`
- The workflow file is `.github/workflows/supabase-migrations.yml` and selects the project by branch.

### Troubleshooting
- Migration failed in CI: create a fix migration and push to `staging`, or revert and re-run.
- Local DB won’t start: `supabase stop && supabase start` to refresh containers.
- Seed errors locally: verify `pgcrypto` exists and that your `psql` is pointing at the correct `SUPABASE_DB_URL`.
