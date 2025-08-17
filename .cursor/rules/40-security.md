Rule: Security and Privacy
Applies to: apps/**, packages/**
Use when: handling data, adding auth, integrating storage or network
Avoid: logging secrets, weakening policies, unnecessary permissions
Definition of Done:
  - No secrets in code or logs
  - Data is minimized and encrypted in transit
  - Permissions reviewed and least-privilege applied
  - Security checklist passed

# Secrets and Config
- Use platform secret stores and environment files excluded from VCS.
- Rotate keys regularly. Never echo tokens in logs or errors.

# Data Practices
- Minimize PII. Keep Sudoku data anonymous and local where possible.
- Encrypt in transit (HTTPS). Validate all inputs at boundaries.

# Dependency Review
- Before adding a dependency, verify:
  - License compatibility
  - Package size and tree-shakeability
  - Known vulnerabilities (check advisories)
  - Bundle impact in CI

# Always / Never
- Always validate deep links and intent URLs.
- Always clear sensitive data from memory when not needed.
- Never commit API keys, credentials, or tokens.
- Never weaken security rules without an ADR.

## Example
- Adding analytics: ensure no PII is sent, provide user opt-out, document data flow.
