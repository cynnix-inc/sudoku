Param(
  [Parameter(Mandatory=$false)]
  [int]$EpicNumber
)

$ErrorActionPreference = 'Stop'

function Write-Section {
  param([string]$Title)
  Write-Host ("== {0} ==" -f $Title)
}

function Test-CommandPresent {
  param([string]$Name)
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Test-GhAuth {
  if (-not (Test-CommandPresent 'gh')) { return $false }
  try {
    gh auth status | Out-Null
    return $true
  } catch {
    return $false
  }
}

function Get-DefaultBranch {
  if ($env:EPIC_BASE_BRANCH) { return $env:EPIC_BASE_BRANCH }
  # Prefer 'staging' if it exists
  if (Test-GhAuth) {
    try {
      $staging = gh api repos/:owner/:repo/branches/staging --jq '.name' 2>$null
      if ($staging) { return 'staging' }
    } catch {}
    try {
      $branch = gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'
      if ($branch) { return $branch }
    } catch {}
  }
  try {
    if (Test-CommandPresent 'git') {
      $null = git ls-remote --heads origin staging 2>$null
      if ($LASTEXITCODE -eq 0) { return 'staging' }
    }
  } catch {}
  return 'staging'
}

function Get-IsDryRun {
  $v = "$env:DRY_RUN".ToLower()
  return @('1','true','yes','y').Contains($v)
}

function Select-NextEpicByPriority {
  if (-not (Test-GhAuth)) { return $null }
  $items = gh issue list --label "type/epic" --state open --limit 100 --json number,title,labels,createdAt 2>$null | ConvertFrom-Json
  if (-not $items) { return $null }
  $priorityWeight = @{ 'priority/p0' = 0; 'priority/p1' = 1; 'priority/p2' = 2; 'priority/p3' = 3 }
  $Scored = foreach ($i in $items) {
    $labels = @($i.labels | ForEach-Object { $_.name })
    $score = 99
    foreach ($k in $priorityWeight.Keys) { if ($labels -contains $k) { $score = $priorityWeight[$k]; break } }
    [pscustomobject]@{ number=$i.number; title=$i.title; labels=$labels; created=[datetime]$i.createdAt; score=$score }
  }
  $pick = $Scored | Sort-Object score, created | Select-Object -First 1
  return $pick.number
}

function Ensure-GitIntegrationBranch {
  param([string]$BaseBranch,[string]$EpicBranch)
  if (-not (Test-CommandPresent 'git')) { Write-Warning 'git not found'; return }
  git fetch --all --prune | Out-Null
  if (-not (git show-ref --verify --quiet "refs/heads/$BaseBranch")) { git switch -c $BaseBranch "origin/$BaseBranch" | Out-Null }
  git switch $BaseBranch | Out-Null
  git pull --ff-only | Out-Null
  if (git show-ref --verify --quiet "refs/heads/$EpicBranch") {
    git switch $EpicBranch | Out-Null
    git fetch origin $BaseBranch | Out-Null
    try { git rebase "origin/$BaseBranch" | Out-Null } catch { Write-Warning "Rebase failed on $EpicBranch; manual intervention may be required." }
  } else {
    git switch -c $EpicBranch "origin/$BaseBranch" | Out-Null
  }
  # Ensure remote branch exists for PR base
  try { git push -u origin $EpicBranch | Out-Null } catch { Write-Warning "Could not push $EpicBranch to origin (may already exist)." }
}

function Get-SubIssuesForEpic {
  param([int]$EpicNumber)
  # Prefer gh-sub-issue if present
  if ((Test-CommandPresent 'gh') -and (gh extension list | Select-String -Quiet 'gh-sub-issue')) {
    try { return gh sub-issue list --parent $EpicNumber --json number,title,state,labels | ConvertFrom-Json } catch {}
  }
  # Fallback: search linked issues or those containing Parent: #<epic>
  try {
    $q = "repo:" + (gh repo view --json nameWithOwner --jq '.nameWithOwner') + " is:issue state:open in:body \"Parent: #$EpicNumber\""
    return gh search issues --json number,title,state,labels --limit 100 --query $q | ConvertFrom-Json
  } catch { return @() }
}

function Get-CIScript {
  if (-not (Test-Path -LiteralPath 'package.json')) { return $null }
  $pkg = Get-Content -LiteralPath 'package.json' -Raw | ConvertFrom-Json
  if ($pkg.scripts.ci) { return 'npm run ci' }
  if ($pkg.scripts.test) { return 'npm test' }
  return $null
}

function Update-EpicChecklistComment {
  param([int]$EpicNumber,[string[]]$Lines)
  if (-not (Test-GhAuth)) { return }
  $marker = "[epic-runner-checklist]"
  $body = "${marker}`n" + ($Lines -join "`n")
  # Try to update last comment with marker; else create
  $existingId = gh issue view $EpicNumber --json comments --jq '.comments | map(select(.body|contains("[epic-runner-checklist]"))) | last?.id'
  if ($existingId) {
    gh api repos/:owner/:repo/issues/comments/$existingId -X PATCH -f body="$body" | Out-Null
  } else {
    gh issue comment $EpicNumber --body "$body" | Out-Null
  }
}

function Enable-AutoMergeForPR {
  param([string]$PrNumber)
  try { gh pr merge $PrNumber --squash --auto | Out-Null } catch { Write-Warning "Auto-merge could not be enabled for PR #$PrNumber" }
}

function Label-NeedsHuman {
  param([int]$IssueNumber,[string]$Reason)
  try {
    gh issue edit $IssueNumber --add-label "needs-human"
    gh issue comment $IssueNumber --body "Automation paused: $Reason"
  } catch {}
}

$isDry = Get-IsDryRun
$ghOk = Test-GhAuth
$defaultBranch = Get-DefaultBranch

if (-not $EpicNumber) {
  $EpicNumber = Select-NextEpicByPriority
}

Write-Section "Epic Runner"
Write-Host ("Dry-Run: {0}" -f $isDry)
Write-Host ("gh auth: {0}" -f ($ghOk))
Write-Host ("Default base branch: {0}" -f $defaultBranch)
Write-Host ("Epic number: {0}" -f ($EpicNumber | ForEach-Object { if ($_){$_} else {'<auto-select pending>'} }))

if (-not $EpicNumber) {
  Write-Warning 'No epic selected or found.'
  exit 0
}

$epicBranch = "epic/$EpicNumber"

if ($isDry) {
  Write-Host "[DRY] Would create/refresh integration branch '$epicBranch' from '$defaultBranch'"
} else {
  Ensure-GitIntegrationBranch -BaseBranch $defaultBranch -EpicBranch $epicBranch
}

$subIssues = @()
if ($ghOk) { $subIssues = Get-SubIssuesForEpic -EpicNumber $EpicNumber } else { Write-Warning 'gh not authenticated; cannot enumerate sub-issues.' }

$checklist = New-Object System.Collections.Generic.List[string]
$checklist.Add("Epic #$EpicNumber → Branch '$epicBranch'") | Out-Null

foreach ($issue in $subIssues) {
  $n = [int]$issue.number
  $title = $issue.title
  $branch = "epic/$EpicNumber/issue-$n"
  if ($isDry) {
    $checklist.Add("- ⏳ #$n $title") | Out-Null
    Write-Host "[DRY] Would process sub-issue #$n on branch '$branch'"
    continue
  }

  try {
    if (Test-CommandPresent 'git') {
      git fetch origin $epicBranch | Out-Null
      if (git show-ref --verify --quiet "refs/heads/$branch") {
        git switch $branch | Out-Null
        git rebase "origin/$epicBranch" | Out-Null
      } else {
        git switch -c $branch "origin/$epicBranch" | Out-Null
      }
    }

    $ci = Get-CIScript
    if ($ci) {
      Write-Host "Running CI: $ci"
      iex $ci
    }

    $prUrl = gh pr view --head $branch --json number,url --jq '.url' 2>$null
    if (-not $prUrl) {
      $prUrl = gh pr create --base $epicBranch --head $branch --title "issue #$n → epic #$EpicNumber" --body "Automated PR for #$n into $epicBranch" --draft=false --fill | Select-String -Pattern 'https?://\S+' | ForEach-Object { $_.Matches[0].Value } | Select-Object -First 1
    }
    if ($prUrl) {
      $prNum = gh pr view $prUrl --json number --jq '.number'
      Enable-AutoMergeForPR -PrNumber $prNum
      # Poll until merged or timeout
      $deadline = (Get-Date).AddMinutes(30)
      do {
        Start-Sleep -Seconds 10
        $state = gh pr view $prNum --json state,mergeStateStatus,isDraft --jq '{state:.state,merge:.mergeStateStatus}' | ConvertFrom-Json
        if ($state.state -eq 'MERGED') { break }
      } while ((Get-Date) -lt $deadline)

      if ($state.state -ne 'MERGED') {
        Label-NeedsHuman -IssueNumber $n -Reason "PR #$prNum did not merge automatically."
        $checklist.Add("- ⛔ #$n $title") | Out-Null
        continue
      }

      # Close sub-issue
      gh issue close $n --comment "Merged via PR #$prNum into $epicBranch" | Out-Null
      $checklist.Add("- ✅ #$n $title") | Out-Null
    } else {
      Label-NeedsHuman -IssueNumber $n -Reason "PR could not be created."
      $checklist.Add("- ⛔ #$n $title") | Out-Null
    }
  } catch {
    Label-NeedsHuman -IssueNumber $n -Reason ("Error: " + $_.Exception.Message)
    $checklist.Add("- ⛔ #$n $title") | Out-Null
  }
}

Update-EpicChecklistComment -EpicNumber $EpicNumber -Lines $checklist
Write-Host "Done."

