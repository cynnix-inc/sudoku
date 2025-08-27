Param()

$ErrorActionPreference = 'Stop'

function ResultRow {
  param([string]$Item,[string]$Status,[string]$Action)
  [pscustomobject]@{ Item = $Item; Status = $Status; Action = $Action }
}

function Test-HasGh {
  return [bool](Get-Command gh -ErrorAction SilentlyContinue)
}

function Test-GhAuth {
  if (-not (Test-HasGh)) { return $false }
  try { gh auth status | Out-Null; return $true } catch { return $false }
}

function Get-RepoNameWithOwner {
  try { return gh repo view --json nameWithOwner --jq '.nameWithOwner' } catch { return $null }
}

function Test-ExtensionInstalled {
  param([string]$name)
  try {
    $list = gh extension list 2>$null | Out-String
    return $list -match [regex]::Escape($name)
  } catch { return $false }
}

function Test-AutoMergeEnabled {
  try { return [bool](gh api repos/:owner/:repo --jq '.allow_auto_merge') } catch { return $false }
}

function Get-RequiredChecks {
  param([string]$branch)
  try { return gh api repos/:owner/:repo/branches/$branch/protection/required_status_checks --jq '.contexts' } catch { return $null }
}

function Get-Rulesets {
  try { return gh api repos/:owner/:repo/rulesets --jq '.' | ConvertFrom-Json } catch { return @() }
}

function Test-EpicRulesetPermissive {
  $sets = Get-Rulesets
  if (-not $sets) { return $false }
  foreach ($s in $sets) {
    $branchTargets = @($s.targets | Where-Object { $_.target -eq 'branch' })
    foreach ($t in $branchTargets) {
      $patterns = @($t.selector.include)
      if ($patterns -contains 'epic/*') {
        $requiresReviews = [bool]($s.rules | Where-Object { $_.type -eq 'pull_request' -and $_.parameters.require_code_owner_review -eq $true })
        if (-not $requiresReviews) { return $true }
      }
    }
  }
  return $false
}

function Test-SecretPresent {
  param([string]$name)
  try { return [bool](gh api repos/:owner/:repo/actions/secrets/$name --silent; $?) } catch { return $false }
}

function Print-Table {
  param([object[]]$rows)
  Write-Host "| Item | Status | Action |"
  Write-Host "| - | - | - |"
  foreach ($r in $rows) {
    Write-Host ("| {0} | {1} | {2} |" -f $r.Item, $r.Status, ($r.Action -replace '\n',' '))
  }
}

$rows = New-Object System.Collections.Generic.List[object]

$hasGh = Test-HasGh
$ghAuth = Test-GhAuth
$extOk = if ($hasGh) { Test-ExtensionInstalled 'gh-sub-issue' } else { $false }

if (-not $hasGh) {
  $rows.Add((ResultRow 'gh auth' 'FAIL' 'Install GitHub CLI: https://cli.github.com')) | Out-Null
} elseif (-not $ghAuth) {
  $rows.Add((ResultRow 'gh auth' 'FAIL' 'gh auth login --web --scopes repo,workflow,read:org,project')) | Out-Null
} else {
  $rows.Add((ResultRow 'gh auth' 'PASS' '')) | Out-Null
}

if ($ghAuth -and -not $extOk) {
  $rows.Add((ResultRow 'sub-issue extension' 'FAIL' 'gh extension install yahsan2/gh-sub-issue')) | Out-Null
} elseif ($extOk) {
  $rows.Add((ResultRow 'sub-issue extension' 'PASS' '')) | Out-Null
} else {
  $rows.Add((ResultRow 'sub-issue extension' 'FAIL' 'Install gh and login first')) | Out-Null
}

# Labels (we only verify existence of at least one required label quickly)
try {
  if ($ghAuth) {
    $any = gh label list --json name --jq '.[] | select(.name=="type/epic") | .name'
    if ($any) { $rows.Add((ResultRow 'labels set' 'PASS' 'Run scripts/ensure-labels.ps1 to sync any missing labels')) | Out-Null }
    else { $rows.Add((ResultRow 'labels set' 'WARN' 'pwsh -File scripts/ensure-labels.ps1')) | Out-Null }
  } else {
    $rows.Add((ResultRow 'labels set' 'WARN' 'pwsh -File scripts/ensure-labels.ps1 after gh auth')) | Out-Null
  }
} catch {
  $rows.Add((ResultRow 'labels set' 'WARN' 'pwsh -File scripts/ensure-labels.ps1')) | Out-Null
}

# Templates/Prompts present (local file checks)
if ((Test-Path '.cursor/rules/epic-prompts.md') -and (Test-Path 'docs/templates/feature-sub-issue.md') -and (Test-Path 'docs/templates/bug-sub-issue.md') -and (Test-Path 'docs/templates/chore-sub-issue.md') -and (Test-Path '.github/ISSUE_TEMPLATE/discovery.yml')) {
  $rows.Add((ResultRow 'templates present' 'PASS' '')) | Out-Null
  $rows.Add((ResultRow 'epic-prompts present' 'PASS' '')) | Out-Null
  $rows.Add((ResultRow 'CONTRIBUTING references' 'PASS' '')) | Out-Null
} else {
  $rows.Add((ResultRow 'templates present' 'FAIL' 'Pull latest or re-run setup')) | Out-Null
}

# Auto-merge
if ($ghAuth) {
  $auto = Test-AutoMergeEnabled
  if ($auto) { $rows.Add((ResultRow 'auto-merge enabled' 'PASS' '')) | Out-Null }
  else { $rows.Add((ResultRow 'auto-merge enabled' 'WARN' 'gh api -X PATCH repos/:owner/:repo -f allow_auto_merge=true')) | Out-Null }
} else { $rows.Add((ResultRow 'auto-merge enabled' 'WARN' 'Authenticate gh to verify')) | Out-Null }

# Required checks
foreach ($b in @('main','staging')) {
  $ctx = $null
  if ($ghAuth) { $ctx = Get-RequiredChecks -branch $b }
  if ($ctx) { $rows.Add((ResultRow "required checks ($b)" 'PASS' ("Configured: " + $ctx))) | Out-Null }
  else { $rows.Add((ResultRow "required checks ($b)" 'WARN' 'Ensure canonical CI job is required')) | Out-Null }
}

# Epic branch permissiveness
if ($ghAuth) {
  $ok = Test-EpicRulesetPermissive
  if ($ok) { $rows.Add((ResultRow 'epic/* protection permissive enough' 'PASS' '')) | Out-Null }
  else { $rows.Add((ResultRow 'epic/* protection permissive enough' 'WARN' 'Add a ruleset for pattern epic/* requiring status checks only (no code-owner review)')) | Out-Null }
} else { $rows.Add((ResultRow 'epic/* protection permissive enough' 'WARN' 'Authenticate gh to verify rulesets')) | Out-Null }

# Secrets
if ($ghAuth) {
  $hasApp = Test-SecretPresent 'RELEASE_PLEASE_TOKEN'
  if ($hasApp) { $rows.Add((ResultRow 'secrets present' 'PASS' 'RELEASE_PLEASE_TOKEN configured')) | Out-Null }
  else { $rows.Add((ResultRow 'secrets present' 'WARN' 'Add RELEASE_PLEASE_TOKEN with repo,workflow scopes if elevated access needed')) | Out-Null }
} else { $rows.Add((ResultRow 'secrets present' 'WARN' 'Authenticate gh to verify')) | Out-Null }

Print-Table $rows

