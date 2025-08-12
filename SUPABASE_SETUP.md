## Supabase setup for Ultimate Sudoku (Google Sign‑In + Cloud Stats)

This guide configures Supabase authentication (Google OAuth) and a `stats` table with Row Level Security so player stats sync across devices when signed in. If Supabase is not configured, the app falls back to local storage automatically.

### Prerequisites
- A Supabase account and project
- Google Cloud OAuth client (for Google Sign‑In)
- Node.js installed locally (for running the dev server)

### 1) Create a Supabase project
1. Sign in to Supabase and create a new project
2. Choose a strong database password and a region close to your users

### 2) Enable Google provider
1. In Supabase: Authentication → Providers → Google → Enable
2. Provide Google OAuth credentials (Client ID and Client Secret). See Supabase docs for creating a Google OAuth client.
3. In Supabase: Authentication → URL Configuration, add Allowed Redirect URLs for your environments:
   - `http://localhost:5173`
   - `https://YOUR_DOMAIN` (replace with your production domain)

The app redirects back to `window.location.origin` after Google sign‑in, so make sure each origin you use is listed.

### 3) Create the `stats` table with RLS

Preferred: automate with Supabase CLI migrations

1. Install the Supabase CLI: `npm i -g supabase`
2. Link your project: `supabase link --project-ref YOUR_PROJECT_REF`
3. Push migrations: `npm run supabase:push`

This runs the SQL in `supabase/migrations/0001_create_stats.sql` to create:
   - A `stats` table keyed by `user_id` (references `auth.users(id)`)
   - RLS policies so users can only read/update their own row

Manual fallback

1. In Supabase: SQL Editor → New query
2. Paste and run the contents of `supabase.sql` (or the migration file above)

Schema summary:
- Columns: `user_id (uuid, pk)`, `updated_at (timestamptz, default now())`,
  `total_played`, `total_wins`, `total_losses`, best times per difficulty,
  and `by_difficulty (jsonb)` for aggregated stats.

### 4) Get your API URL and anon key
1. In Supabase: Settings → API
2. Copy the Project URL and the `anon public` API key

The anon key is safe to embed in a public client; RLS policies protect your data.

### 5) Configure the frontend via `.env`
1. Copy `.env.example` to `.env` in the project root and fill in real values:

```
SUPABASE_URL=https://YOUR_SUPABASE_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

2. Generate `env.js` (loaded by `index.html`):

```
npm run build:env
```

`index.html` now loads `env.js` first and uses those values to initialize Supabase. If `.env` is absent, Supabase stays disabled and the app falls back to local stats.

Tip: create a `.env` file manually with `SUPABASE_URL` and `SUPABASE_ANON_KEY`, then run `npm run build:env`.

Options for production:
- Prefer environment variables at build time to generate `env.js`
- Or inject `window.SUPABASE_URL` / `window.SUPABASE_ANON_KEY` directly via your hosting platform before the module snippet runs

### 6) Run locally and test sign‑in
1. Install and start the dev server:
   - `npm install`
   - `npm run serve` → opens at `http://localhost:5173`
2. In the app, open the menu and click “Sign in with Google”
3. After returning to the app, open the console: `await window.supabase.auth.getUser()` should show your user

### 7) Verify stats sync
When signed in, the app will upsert to `stats` and pull the latest on launch. It uses RLS so each user can only read/write their own row. You can inspect requests in the Network tab for calls to the `stats` table.

### Troubleshooting
- Sign‑in not configured message: ensure you set real values for `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `index.html`
- Redirect URL not allowed: add your origin to Supabase Authentication → URL Configuration → Allowed Redirect URLs (both localhost and production)
- Upsert/select to `stats` fails with 401/403: verify you are logged in and that you ran `supabase.sql` to create the table and RLS policies
- Google OAuth consent issues: ensure your Google OAuth client has your domain and localhost in Authorized Redirect URIs

### Notes on security
- The anon key can be public; it is restricted by RLS policies
- The table uses owner‑only RLS policies (select/insert/update/delete where `auth.uid() = user_id`)

### What the app does automatically
- If Supabase is configured and you’re signed in, stats are synced to the cloud
- If Supabase is not configured, the game continues using local storage only

### Quick checklist
- Supabase project created
- Google provider enabled
- Allowed Redirect URLs set (localhost + prod)
- `supabase.sql` executed (table + RLS)
- `index.html` updated with URL + anon key
- Local sign‑in tested successfully


