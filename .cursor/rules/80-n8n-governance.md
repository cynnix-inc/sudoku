# n8n Workflow Governance

When to use: before creating or modifying automation workflows.

- Principles
  - Minimum required permissions per node; never store secrets inline.
  - Idempotent jobs; retries safe; DLQ or alerting on failure.
  - Version every workflow; document owner, summary, inputs/outputs.
- Naming & Structure
  - Workflows: [domain]-[purpose]-v[semver] (e.g., billing-sync-v1.2.0)
  - Nodes: verb-noun (fetch-orders, upsert-user)
  - Folders by domain; prod/staging separated.
- Secrets & Connections
  - All credentials via n8n credentials store; rotate quarterly.
  - Never echo secrets in logs; mask sensitive fields.
- Triggers & Scheduling
  - Use fixed schedules in UTC; add jitter if external APIs have rate limits.
  - Webhooks: validate HMAC/signature; time-box execution.
- Error Handling
  - Catch nodes around network calls; emit structured error payloads.
  - Send to DLQ topic/collection with correlationId and retryCount.
- Observability
  - Emit success/failure metric per run; log key business identifiers.
  - Surface alerts to on-call channel with run URL and summary.
- Change Management
  - PR-style change record in repo docs: reason, diagram, inputs/outputs, risks.
  - Keep a rollback note; link issues/epics.

CI expectations

- Lint the exported JSON (schema present) and forbid secrets in export.
- Optional: smoke test critical workflows via API in staging.
