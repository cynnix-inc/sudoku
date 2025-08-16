## Observability

### Sentry (Error + Performance)

Sentry is integrated but disabled by default. It only initializes when a DSN is provided via environment variable.

#### Enable

Set the following public Expo environment variables (at build or runtime):

- `EXPO_PUBLIC_SENTRY_DSN`: Your Sentry DSN. If empty or unset, Sentry stays off.
- `EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` (optional): e.g. `0.1` for 10% tracing. Defaults to `0`.
- `EXPO_PUBLIC_SENTRY_DEBUG` (optional): set to `1` to enable SDK debug logging locally.
- `EXPO_PUBLIC_APP_ENV` (optional): overrides `APP_ENV` for Sentry tags.

Example (local shell):

```bash
EXPO_PUBLIC_SENTRY_DSN="https://example.ingest.sentry.io/123" \
EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1 \
EXPO_PUBLIC_APP_ENV=staging \
pnpm --filter @ultimate-sudoku/app start
```

Example (EAS): configure environment variables in your EAS project or `eas.json` build profile, ensuring the DSN is only set for the desired channels/branches (staging/production). Do not set DSN for CI or local default profiles.

#### Usage

You can manually add breadcrumbs and capture errors using helpers from `apps/app/lib/sentry`:

```ts
import { addBreadcrumb, captureException, captureMessage } from "../lib/sentry";

addBreadcrumb({ category: "auth", message: "User tapped login", level: "info" });
captureMessage("Login button pressed");
try {
  // ... risky work
} catch (e) {
  captureException(e);
}
```

The router root is wrapped with Sentry automatically when enabled.

#### Notes

- Sentry is not enabled in CI or local by default. It is opt-in via `EXPO_PUBLIC_SENTRY_DSN`.
- Be mindful of PII. Avoid including sensitive data in breadcrumbs or error contexts.


