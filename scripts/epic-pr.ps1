Param(
  [Parameter(Mandatory=$true)]
  [int]$EpicNumber,
  [Parameter(Mandatory=$true)]
  [int]$IssueNumber
)

$ErrorActionPreference = 'Stop'

function Test-CommandPresent {
  param([string]$Name)
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Test-GhAuth {
  if (-not (Test-CommandPresent 'gh')) { return $false }
  try { gh auth status | Out-Null; return $true } catch { return $false }
}

function Enable-AutoMergeForPR {
  param([string]$PrNumber)
  try { gh pr merge $PrNumber --squash --auto | Out-Null } catch { Write-Warning "Auto-merge could not be enabled for PR #$PrNumber" }
}

if (-not (Test-GhAuth)) { Write-Error 'gh not authenticated'; exit 1 }
if (-not (Test-CommandPresent 'git')) { Write-Error 'git not found'; exit 1 }

$epicBranch = "epic/$EpicNumber"
$branch = "epic/$EpicNumber/issue-$IssueNumber"

git fetch origin $epicBranch | Out-Null
if (git show-ref --verify --quiet "refs/heads/$branch") {
  git switch $branch | Out-Null
  git rebase "origin/$epicBranch" | Out-Null
} else {
  git switch -c $branch "origin/$epicBranch" | Out-Null
}

# Ensure there are changes to PR (skip empty)
try {
  $diff = git diff --name-only --relative HEAD "origin/$epicBranch"
  if (-not $diff) {
    Write-Host "No changes to PR for $branch compared to origin/$epicBranch. Skipping."
    exit 0
  }
} catch {}

$prUrl = gh pr view --head $branch --json url --jq '.url' 2>$null
if (-not $prUrl) {
  $title = "issue #$IssueNumber → epic #$EpicNumber"
  $body = "Automated PR for #$IssueNumber into epic/$EpicNumber"
  $prUrl = gh pr create --base $epicBranch --head $branch --title "$title" --body "$body" --draft=false --fill 2>$null |
    Select-String -Pattern 'https?://\S+' | ForEach-Object { $_.Matches[0].Value } | Select-Object -First 1
}

if (-not $prUrl) { Write-Error "Failed to create/view PR for $branch"; exit 1 }
$prNum = gh pr view $prUrl --json number --jq '.number'
Enable-AutoMergeForPR -PrNumber $prNum
Write-Host ("PR ready: {0} (#{1})" -f $prUrl,$prNum)


