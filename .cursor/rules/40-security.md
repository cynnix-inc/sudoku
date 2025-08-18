Rule: Security and privacy
Applies to: entire repository
Use when: handling data, auth, storage, network, analytics

Purpose
- Protect users and the project by default.

Out of scope
- CI mechanics and workflow (see `50-devops.md`).

Priority
- Wins over other files for data/secrets/privacy decisions.

Definition of Done
  - No secrets in code or logs
  - Data minimized and encrypted in transit
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

# Self-check
- No secrets introduced in code, tests, or logs.
- Network calls use HTTPS; PII not collected or transmitted.
- Permissions reviewed for least privilege.
- Dependency changes include license/size/vulnerability review.
