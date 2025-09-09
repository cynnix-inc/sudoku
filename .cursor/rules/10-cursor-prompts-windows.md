# Cursor Prompts on Windows — Stability Rules

- Use PowerShell syntax; avoid non-portable pipes like `| cat`. Prefer assigning JSON to a variable and `ConvertFrom-Json`.
- Quote carefully in background watchers; escape inner quotes (use `\"` inside JSON strings) or build strings with PowerShell here-strings when possible.
- Long-running watchers must be non-interactive and resilient: loop with `Start-Sleep`, break on target state, then run close/cleanup commands.
- Keep outputs small and structured; redirect logs to files if needed to avoid console buffering issues.
- Prefer `--json` flags in `gh` commands; avoid `--jq` unless necessary. When used, ensure it returns a scalar to simplify parsing.
- Ensure Node version parity (Node 20.x) across local/CI/Volta to reduce environment drift.

Examples

- Close an issue when PR merges (non-interactive):

```powershell
$ErrorActionPreference='Stop'
while ($true) {
  $state = (gh pr view 123 -R cynnix-inc/sudoku --json state | ConvertFrom-Json).state
  if ($state -eq 'MERGED') { break }
  Start-Sleep -Seconds 20
}
gh issue close 456 -R cynnix-inc/sudoku -c "Verified via PR #123"
```
