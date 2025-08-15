# Architecture

Directory layout (single repo)
- app/                Expo Router v5 routes
- components/         Shared presentational components
- features/           Future feature modules (e.g., theme, profile, flags)
- hooks/              Reusable hooks
- lib/                Platform and service clients (e.g., supabase.ts)
- theme/              Tokens, NativeWind preset, fonts
- scripts/            Dev scripts
- __tests__/          Cross‑cutting tests or helpers

Rules
- Routes: keep screens thin. Data and effects live in hooks under /hooks or /features/*/hooks.
- State: prefer local state and simple hooks. Avoid heavy global state for v1.
- Services: one client per service (e.g., a singleton Supabase client).
- Environment: read only from typed helpers. No direct process.env usage in components.
- Theming: dark and light supported. Glass effects only for overlays.
- Navigation: Expo Router v5 segments with clear names. Avoid deep prop threading; use context hooks.

Error handling
- Fail fast in dev. Friendly error surfaces in UI.
- Wrap async calls. Return typed results and handle errors in the caller.
- No swallowing exceptions. Log through a single helper that can switch to Sentry later.
