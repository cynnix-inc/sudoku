# Security

Secrets
- Never commit service role keys. Client uses anon key only.
- Env is loaded through a typed helper. .env.example must be current.

Database
- Supabase tables use RLS. Policies default to least privilege.
- No unauthenticated writes. Public read only when explicitly required.

Platform
- Deep links limited to the app scheme and trusted hosts.
- WebView (if added later) uses a strict allowlist and disables JS by default.
- Dependency checks run in CI. Keep dependencies minimal.

Data
- Store minimal local data. Avoid device IDs. No raw IP storage in analytics.
- PII: keep out of logs. Redact before sending to any external system.

Error reporting
- Sentry is stubbed. Off by default. Enable only when configured with DSN.
