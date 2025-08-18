# Supabase: Ultimate Sudoku

This folder hosts database migrations and seed data for Ultimate Sudoku.

Option A: Local development
- Install the CLI: `npm i -g supabase` or use Homebrew.
- Start local stack: `supabase start`
- Link to your project (if using remote project refs): `supabase link --project-ref <ref>`
- Apply migrations: `supabase db push`
- Load seed data: `psql "$SUPABASE_DB_URL" -f supabase/seed.sql` (or use `supabase db remote commit` for managed flows)

Option B: CI on staging
- On push to `staging`, GitHub Actions links to the staging project using `SUPABASE_PROJECT_REF_STAGING` and runs `supabase db push`.
- Use PRs targeting `staging` to preview DB changes.

Option C: Promote to production
- On push to `main`, CI links to `SUPABASE_PROJECT_REF_PROD` and runs `supabase db push`.
- The workflow uses the `production` environment to allow manual approvals or protections.

CLI basics
- Link: `supabase link --project-ref <ref>`
- Push: `supabase db push`
- Diff: `supabase db diff --use-migra` (optional)

Migration promotion in CI
- The workflow `.github/workflows/supabase-migrations.yml` selects project refs by branch and pushes migrations.
- Provide secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF_STAGING`, `SUPABASE_PROJECT_REF_PROD`.


