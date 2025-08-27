Param(
  [Parameter(Mandatory=$false)]
  [int]$EpicNumber,
  [Parameter(Mandatory=$false)]
  [switch]$Prepare
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

  function Get-OpenClosedCountsForEpic {
    param([int]$Epic)
    # Prefer gh-sub-issue if available
    $openCount = 0; $closedCount = 0
    try {
      if ((gh extension list | Select-String -Quiet 'gh-sub-issue')) {
        $all = gh sub-issue list --parent $Epic --json number,state 2>$null | ConvertFrom-Json
        if ($all) {
          $openCount = ($all | Where-Object { $_.state -eq 'OPEN' -or $_.state -eq 'open' }).Count
          $closedCount = ($all | Where-Object { $_.state -eq 'CLOSED' -or $_.state -eq 'closed' }).Count
        }
      }
    } catch {}
    # Fallback via search if counts look zero
    if (($openCount + $closedCount) -eq 0) {
      try {
        $repo = gh repo view --json nameWithOwner --jq '.nameWithOwner'
        $qOpen = "repo:$repo is:issue state:open in:body `"Parent: #$Epic`""
        $qClosed = "repo:$repo is:issue state:closed in:body `"Parent: #$Epic`""
        $openCount = (gh search issues --json number --limit 100 --query $qOpen 2>$null | ConvertFrom-Json).Count
        $closedCount = (gh search issues --json number --limit 100 --query $qClosed 2>$null | ConvertFrom-Json).Count
      } catch {}
    }
    return @{ open=$openCount; closed=$closedCount; total=($openCount + $closedCount) }
  }

  $Scored = foreach ($i in $items) {
    $labels = @($i.labels | ForEach-Object { $_.name })
    $created = [datetime]$i.createdAt
    $counts = Get-OpenClosedCountsForEpic -Epic $i.number
    $open = [int]$counts.open; $closed = [int]$counts.closed; $total = [int]$counts.total

    $hasMvp = ($labels -contains 'mvp-critical')
    $isHotfixCiSec = (($labels -contains 'hotfix') -or ($labels -contains 'security') -or ($labels -contains 'area/ci') -or ($labels -contains 'type/bug'))
    $isDepUnblock = (($labels -contains 'dep/unblocker') -or ($labels -contains 'dependency/unblocker') -or ($labels -contains 'unblocker'))
    $isInProgress = (($labels -contains 'status/in-progress') -or ($open -gt 0 -and $closed -gt 0))
    $isNearDone = ($total -gt 0 -and $open -le 1)

    # Tier per Prompt 4
    $tier = 4
    if ($hasMvp) { $tier = 0 }
    elseif ($isHotfixCiSec) { $tier = 1 }
    elseif ($isDepUnblock) { $tier = 2 }
    elseif ($isInProgress -or $isNearDone) { $tier = 3 }

    # Fallback to priority/pN if present to refine within same tier
    $priorityWeight = @{ 'priority/p0' = 0; 'priority/p1' = 1; 'priority/p2' = 2; 'priority/p3' = 3 }
    $pScore = 99
    foreach ($k in $priorityWeight.Keys) { if ($labels -contains $k) { $pScore = $priorityWeight[$k]; break } }

    [pscustomobject]@{
      number=$i.number;
      title=$i.title;
      labels=$labels;
      created=$created;
      tier=$tier;
      nearDone=$isNearDone;
      open=$open;
      total=$total;
      pScore=$pScore
    }
  }

  # Sort: tier, near-done (true first), oldest first, smaller epic (total), then priority score
  $pick = $Scored | Sort-Object @{Expression='tier';Ascending=$true}, @{Expression='nearDone';Ascending=$false}, @{Expression='created';Ascending=$true}, @{Expression='total';Ascending=$true}, @{Expression='pScore';Ascending=$true} | Select-Object -First 1
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
  $pushFlag = "$env:EPIC_PUSH".ToLower()
  if (@('1','true','yes','y') -contains $pushFlag) {
    try { git push -u origin $EpicBranch | Out-Null } catch { Write-Warning "Could not push $EpicBranch to origin (may already exist)." }
  } else {
    Write-Host "Skipping push of '$EpicBranch' (set EPIC_PUSH=1 to enable)"
  }
}

function Get-SubIssuesForEpic {
  param([int]$EpicNumber)
  # Prefer gh-sub-issue if present
  if ((Test-CommandPresent 'gh') -and (gh extension list | Select-String -Quiet 'gh-sub-issue')) {
    try { return gh sub-issue list $EpicNumber --json number,title,state,url | ConvertFrom-Json } catch {}
  }
  # Fallback: search linked issues or those containing Parent: #<epic>
  try {
    $q = "repo:" + (gh repo view --json nameWithOwner --jq '.nameWithOwner') + " is:issue state:open in:body `"Parent: #$EpicNumber`""
    return gh search issues --json number,title,state,labels --limit 100 --query $q | ConvertFrom-Json
  } catch { return @() }
}

# Enumerate sub-issues for a given issue (children), used for nested-first ordering
function Get-SubIssuesForIssue {
  param([int]$IssueNumber)
  if ((Test-CommandPresent 'gh') -and (gh extension list | Select-String -Quiet 'gh-sub-issue')) {
    try { return gh sub-issue list $IssueNumber --json number,title,state,url 2>$null | ConvertFrom-Json } catch { return @() }
  }
  try {
    $q = "repo:" + (gh repo view --json nameWithOwner --jq '.nameWithOwner') + " is:issue state:open in:body `"Parent: #$IssueNumber`""
    return gh search issues --json number,title,state,labels --limit 100 --query $q | ConvertFrom-Json
  } catch { return @() }
}

# Produce a nested-first flattened ordering of sub-issues
function Get-NestedFirstOrder {
  param([object[]]$TopLevel)
  $ordered = New-Object System.Collections.Generic.List[object]
  $visited = New-Object 'System.Collections.Generic.HashSet[int]'
  function Visit {
    param([object]$item)
    $id = [int]$item.number
    if ($visited.Contains($id)) { return }
    $visited.Add($id) | Out-Null
    $children = Get-SubIssuesForIssue -IssueNumber $id
    foreach ($c in $children) { Visit -item $c }
    $ordered.Add($item) | Out-Null
  }
  foreach ($i in $TopLevel) { Visit -item $i }
  return ,$ordered
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
if ($subIssues.Count -gt 0) { $subIssues = Get-NestedFirstOrder -TopLevel $subIssues }

# Prepare-only mode: switch/create the next sub-issue branch and exit without PRs
if ($Prepare) {
  $prepared = $false
  foreach ($issue in $subIssues) {
    $n = [int]$issue.number
    $title = $issue.title
    $branch = "epic/$EpicNumber/issue-$n"
    # Skip if PR already exists and is merged or open
    $prState = $null
    try { $prState = gh pr view --head $branch --json state --jq '.state' 2>$null } catch {}
    if ($prState -eq 'MERGED' -or $prState -eq 'OPEN') { continue }

    if ($isDry) {
      Write-Host "[DRY] Would prepare branch '$branch' for sub-issue #$n — $title"
      $prepared = $true
      break
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
      $checklist = New-Object System.Collections.Generic.List[string]
      $checklist.Add("Epic #$EpicNumber → Branch '$epicBranch'") | Out-Null
      $checklist.Add("- ⏳ prepared #$n $title") | Out-Null
      Update-EpicChecklistComment -EpicNumber $EpicNumber -Lines $checklist
      Write-Host ("Prepared branch '{0}' for sub-issue #{1} — {2}" -f $branch,$n,$title)
      $prepared = $true
      break
    } catch {
      Write-Warning ("Failed to prepare branch {0}: {1}" -f $branch, $_.Exception.Message)
      continue
    }
  }
  if (-not $prepared) { Write-Host 'No sub-issue requires preparation. Nothing to do.' }
  return
}

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
      Invoke-Expression $ci
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

# Finalize: open PR from epic branch into base branch and enable auto-merge
function Finalize-EpicBranch {
  param([string]$EpicBranch,[string]$BaseBranch)
  if (-not (Test-GhAuth)) { return }
  if (-not (Test-CommandPresent 'git')) { return }
  try {
    git fetch --all --prune | Out-Null
    git switch $EpicBranch | Out-Null
    git fetch origin $BaseBranch | Out-Null
    try { git rebase "origin/$BaseBranch" | Out-Null } catch {}
  } catch {}
  try {
    $prUrl = gh pr view --head $EpicBranch --base $BaseBranch --json url --jq '.url' 2>$null
    if (-not $prUrl) {
      $title = "Epic #$EpicNumber — Integration to $BaseBranch"
      $body = "Merge $EpicBranch into $BaseBranch after completing sub-issues for Epic #$EpicNumber."
      $prUrl = gh pr create --base $BaseBranch --head $EpicBranch --title "$title" --body "$body" --fill 2>$null | Select-String -Pattern 'https?://\S+' | ForEach-Object { $_.Matches[0].Value } | Select-Object -First 1
    }
    if ($prUrl) {
      $prNum = gh pr view $prUrl --json number --jq '.number'
      Enable-AutoMergeForPR -PrNumber $prNum
    }
  } catch {}
}

Update-EpicChecklistComment -EpicNumber $EpicNumber -Lines $checklist
Finalize-EpicBranch -EpicBranch $epicBranch -BaseBranch $defaultBranch
Write-Host "Done."

