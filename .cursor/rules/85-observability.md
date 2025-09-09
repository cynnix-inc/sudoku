# Observability & DLQ Standards

When to use: any service or workflow emitting logs/metrics/traces or handling errors.

- Logging
  - Structured JSON; include timestamp, level, service, environment, correlationId.
  - No PII; redact tokens/keys; limit payload sizes.
  - Levels: error (pager), warn (actionable), info (business flow), debug (local).
- Metrics
  - RED/USE where applicable; publish counters, gauges, histograms.
  - SLO-aligned alerts with burn-rate policies; label by env/service/version.
- Tracing
  - Propagate traceId/spanId via W3C headers; sample at gateways; export to APM.
  - Annotate spans with key business identifiers (never PII).
- Error Taxonomy
  - Retryable (5xx, network) vs non-retryable (4xx validation); include error.code.
  - Attach correlationId and user/session identifiers (non-PII) to errors.
- DLQ Policy
  - Guaranteed delivery for retry-exhausted messages; persist full context (sanitized).
  - Expose reprocessor with backoff; cap attempts; track retryCount and lastError.
- Alerting
  - Page on SLO violations, DLQ growth, crash loops; route to on-call with run links.
  - Include runbook URL and recent changes (deploy/PR) in alert annotations.
- Review & Docs
  - Maintain a service.md with emitted signals, SLOs, alert policies, DLQs.
  - Link issues/PRs and diagrams; keep rollback steps ready.
