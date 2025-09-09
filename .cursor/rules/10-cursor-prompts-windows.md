# Cursor Prompts on Windows — Stability Rules

- Use PowerShell syntax; avoid non-portable pipes like `| cat`. Prefer assigning JSON to a variable and `ConvertFrom-Json`.
- Quote carefully in background watchers; escape inner quotes (use `\"` inside JSON strings) or build strings with here-strings.
- Long-running watchers must be non-interactive and resilient: loop with `Start-Sleep`, break on target state, then run close/cleanup commands.
- Keep outputs small and structured; redirect logs to files if needed to avoid console buffering issues.
- Prefer `--json` flags in `gh` commands; avoid `--jq` unless necessary. When used, ensure it returns a scalar to simplify parsing.
- Ensure Node version parity (Node 20.x) across local/CI/Volta to reduce environment drift.

Examples

Close an issue when a PR merges

```powershell
$pr = 513
$issue = 443
while ($true) {
  $state = (gh pr view $pr -R cynnix-inc/sudoku --json state | ConvertFrom-Json).state
  if ($state -eq 'MERGED') { break }
  Start-Sleep -Seconds 20
}
gh issue close $issue -R cynnix-inc/sudoku -c "Verified: merged via PR #$pr."
```
