Security and data handling

When to use: handling data, adding auth, or integrating storage/network.

Avoid

- Logging secrets, weakening policies, or adding unnecessary permissions.

Definition of Done

- No secrets in code or logs
- Data is minimized and encrypted in transit
- Permissions reviewed and least-privilege applied
- Security checklist passed

# Secrets and config

- Use platform secret stores and env files excluded from VCS.
- Rotate keys regularly. Never echo tokens in logs or errors.

# Data practices

- Minimize PII. Keep Sudoku data anonymous and local where possible.
- Encrypt in transit (HTTPS). Validate inputs at boundaries.

# Dependencies

- Verify license, size, vulnerabilities, and bundle impact before adding.

# Always / Never

- Always validate deep links and intent URLs.
- Always clear sensitive data from memory when not needed.
- Never commit API keys, credentials, or tokens.
- Never weaken security rules without an ADR (`docs/adr/`).

## Example

- Adding analytics: ensure no PII is sent, provide user opt-out, and document data flow.
