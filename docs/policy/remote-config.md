## Remote Config and Feature Flags

### What are feature flags?

Flags let us toggle features on/off at runtime without shipping a new binary. They are stored in Supabase and fetched at app startup via `useRemoteFlags`.

### Schema in Supabase

Table: `public.feature_flags`

- `key text primary key`
- `value jsonb` (arbitrary configuration payload)
- `enabled boolean` (controls exposure)

RLS policy allows anonymous read of flags where `enabled = true`.

### Adding a new flag

1) In Supabase SQL editor (or via dashboard), insert a row:

```sql
insert into public.feature_flags(key, value, enabled)
values ('new-ui', '{"bucket":"alpha"}', false);
```

2) Default state is off for v1. Only flip to `enabled = true` when ready for preview or production exposure.

3) Document the flag name and intended behavior in your PR under the AC template section.

### Consuming flags in the app

- Hook: `apps/app/lib/useRemoteFlags.ts`

```ts
const { isEnabled } = useRemoteFlags();
if (isEnabled('new-ui')) {
  // render gated UI
}
```

Details:

- The hook caches results for ~1 minute to reduce network calls.
- Only flags with `enabled = true` are fetched.
- `isEnabled(key)` returns `true` only when the flag exists and is enabled.

### Operational guidelines

- Use flags for UI exposure and staged rollouts; do not rely on flags for hard security boundaries.
- Keep the number of live flags small; remove flags that are fully rolled out.
- For multi-step rollouts, store additional metadata in `value` (e.g., `{ "bucket": "beta" }`).


