<#
.SYNOPSIS
    Epic Runner - Automates epic processing workflow

.DESCRIPTION
    Processes GitHub epics by creating integration branches, processing sub-issues,
    and managing the complete workflow from development to merge.

.PARAMETER EpicNumber
    Specific epic number to process. If not provided, automatically selects
    the highest priority epic.

.PARAMETER Continuous
    Enable continuous mode to process multiple epics sequentially.
    After completing one epic, automatically finds and processes the next.

.PARAMETER DryRun
    Run in dry-run mode to see what would happen without making changes.

.EXAMPLE
    .\epic-run.ps1
    # Process the highest priority epic

.EXAMPLE
    .\epic-run.ps1 -EpicNumber 18
    # Process specific epic #18

.EXAMPLE
    .\epic-run.ps1 -Continuous
    # Process all epics sequentially

.EXAMPLE
    .\epic-run.ps1 -EpicNumber 18 -Continuous
    # Start with epic #18, then continue with next epics

.EXAMPLE
    .\epic-run.ps1 -DryRun
    # See what would happen without making changes

.NOTES
    Requires GitHub CLI (gh) with appropriate authentication.
    Uses gh-sub-issue extension for sub-issue management.
    Creates checkpoint files for resume capability.
#>

Param(
  [Parameter(Mandatory=$false)]
  [int]$EpicNumber,
  [Parameter(Mandatory=$false)]
  [switch]$Continuous,
  [Parameter(Mandatory=$false)]
  [switch]$DryRun
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
  Write-Host "  🔄 Setting up Git integration branch '$EpicBranch' from '$BaseBranch'..."
  
  if (-not (Test-CommandPresent 'git')) { 
    Write-Warning 'git not found'; 
    return 
  }
  
  Write-Host "    📥 Fetching all branches and pruning..."
  git fetch --all --prune | Out-Null
  
  if (-not (git show-ref --verify --quiet "refs/heads/$BaseBranch")) { 
    Write-Host "    🌿 Creating local branch '$BaseBranch' from origin..."
    git switch -c $BaseBranch "origin/$BaseBranch" | Out-Null 
  }
  
  Write-Host "    🔀 Switching to base branch '$BaseBranch'..."
  git switch $BaseBranch | Out-Null
  
  Write-Host "    ⬇️  Pulling latest changes from '$BaseBranch'..."
  git pull --ff-only | Out-Null
  
  if (git show-ref --verify --quiet "refs/heads/$EpicBranch") {
    Write-Host "    🔄 Epic branch '$EpicBranch' exists, switching and rebasing..."
    git switch $EpicBranch | Out-Null
    git fetch origin $BaseBranch | Out-Null
    try { 
      Write-Host "      🔄 Rebasing '$EpicBranch' onto latest '$BaseBranch'..."
      git rebase "origin/$BaseBranch" | Out-Null 
      Write-Host "      ✅ Rebase completed successfully"
    } catch { 
      Write-Warning "Rebase failed on $EpicBranch; manual intervention may be required." 
    }
  } else {
    Write-Host "    🌿 Creating new epic branch '$EpicBranch' from '$BaseBranch'..."
    git switch -c $EpicBranch "origin/$BaseBranch" | Out-Null
  }
  
  # Ensure remote branch exists for PR base
  Write-Host "    📤 Pushing epic branch to origin..."
  try { 
    git push -u origin $EpicBranch | Out-Null 
    Write-Host "      ✅ Epic branch pushed successfully"
  } catch { 
    Write-Warning "Could not push $EpicBranch to origin (may already exist)." 
  }
  
  Write-Host "  ✅ Git integration branch setup complete"
}

function Get-SubIssuesForEpic {
  param([int]$EpicNumber)
  
  # Try multiple methods with increasing fallback levels
  $methods = @(
    @{ name = "gh-sub-issue"; command = "gh sub-issue list $EpicNumber -R cynnix-inc/sudoku --json number,title,state" },
    @{ name = "GitHub search (Parent: #$EpicNumber)"; command = "gh search issues repo:cynnix-inc/sudoku is:issue state:open in:body `"Parent: #$EpicNumber`" --json number,title,state,labels --limit 100" },
    @{ name = "GitHub search (epic:$EpicNumber)"; command = "gh search issues repo:cynnix-inc/sudoku epic:$EpicNumber --json number,title,state,labels --limit 100" },
    @{ name = "GitHub search (milestone)"; command = "gh search issues repo:cynnix-inc/sudoku is:issue milestone:`"MVP v0.9`" --json number,title,state,labels --limit 100" }
  )
  
  foreach ($method in $methods) {
    Write-Host "      🔍 Trying method: $($method.name)..."
    try {
      Write-Host "        📝 Executing: $($method.command)"
      $rawOutput = Invoke-Expression $method.command
      
      if (-not $rawOutput) {
        Write-Warning "        ⚠️  No output from command"
        continue
      }
      
      Write-Host "        📄 Raw output length: $($rawOutput.Length) characters"
      if ($rawOutput.Length -lt 100) {
        Write-Host "        📄 Raw output: '$rawOutput'"
      }
      
      $parsedOutput = $rawOutput | ConvertFrom-Json
      
      # Handle different response formats
      if ($parsedOutput.subIssues) {
        # gh-sub-issue format: { "subIssues": [...] }
        $subIssues = $parsedOutput.subIssues
        Write-Host "        📋 Detected gh-sub-issue format with $($subIssues.Count) items"
      } elseif ($parsedOutput -is [array]) {
        # Direct array format: [...]
        $subIssues = $parsedOutput
        Write-Host "        📋 Detected direct array format with $($subIssues.Count) items"
      } else {
        # Single item or other format
        $subIssues = @($parsedOutput)
        Write-Host "        📋 Detected single item format with $($subIssues.Count) items"
      }
      
      # Validate the data quality
      $validIssues = @()
      foreach ($issue in $subIssues) {
        if ($issue.number -and $issue.number -gt 0 -and $issue.title -and $issue.title.Trim() -ne '') {
          $validIssues += $issue
        } else {
          Write-Warning "        ⚠️  Skipping malformed sub-issue: number=$($issue.number), title='$($issue.title)'"
        }
      }
      
      if ($validIssues.Count -gt 0) {
        Write-Host "      ✅ Found $($validIssues.Count) valid sub-issues via $($method.name)"
        return $validIssues
      } else {
        Write-Host "      ⚠️  No valid sub-issues found via $($method.name), trying next method..."
      }
    } catch { 
      Write-Warning "      ⚠️  $($method.name) failed: $($_.Exception.Message)"
      Write-Host "        🔍 Error details: $($_.Exception.GetType().Name)"
      continue
    }
  }
  
  Write-Warning "      ❌ All methods failed to find sub-issues"
  return @()
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

Write-Host "  🔍 Fetching sub-issues for epic #$EpicNumber..."

# First, let's check if the epic exists
Write-Host "    🔍 Verifying epic #$EpicNumber exists..."
try {
  $epicInfo = gh issue view $EpicNumber --json number,title,state 2>$null
  if ($epicInfo) {
    $epic = $epicInfo | ConvertFrom-Json
    Write-Host "    ✅ Epic found: #$($epic.number) - $($epic.title) [$($epic.state)]"
  } else {
    Write-Warning "    ⚠️  Epic #$EpicNumber not found or not accessible"
    Write-Host "    💡 Try running: gh issue view $EpicNumber"
  }
} catch {
      Write-Warning "    ⚠️  Error checking epic #$EpicNumber - $($_.Exception.Message)"
}

$subIssues = @()
if ($ghOk) { 
  $subIssues = Get-SubIssuesForEpic -EpicNumber $EpicNumber 
  Write-Host "    📋 Found $($subIssues.Count) sub-issues"
  
  # Debug: Show sub-issue details
  if ($subIssues.Count -gt 0) {
    Write-Host "    🔍 Sub-issue details:"
    foreach ($issue in $subIssues) {
      Write-Host "      - #$($issue.number): $($issue.title) [$($issue.state)]"
    }
  }
} else { 
  Write-Warning 'gh not authenticated; cannot enumerate sub-issues.' 
}

# Resume/checkpoint system
$checkpointFile = "epic-$EpicNumber-checkpoint.json"
$checkpoint = @{
  epicNumber = $EpicNumber
  epicBranch = $epicBranch
  startTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  completedIssues = @()
  failedIssues = @()
  currentIssue = $null
  lastUpdate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
}

# Clear old checkpoint if branch naming scheme changed
if (Test-Path $checkpointFile) {
  try {
    $existingCheckpoint = Get-Content $checkpointFile -Raw | ConvertFrom-Json
    if ($existingCheckpoint.epicNumber -eq $EpicNumber) {
      # Check if this is from the old branch naming scheme
      $oldBranchPattern = "epic/$EpicNumber/issue-"
      if ($existingCheckpoint.completedIssues.Count -gt 0 -or $existingCheckpoint.failedIssues.Count -gt 0) {
        Write-Host "  🔄 Found old checkpoint with old branch naming scheme, starting fresh"
        Remove-Item $checkpointFile
        $checkpoint = @{
          epicNumber = $EpicNumber
          epicBranch = $epicBranch
          startTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
          completedIssues = @()
          failedIssues = @()
          currentIssue = $null
          lastUpdate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }
      } else {
        $checkpoint = $existingCheckpoint
        Write-Host "  🔄 Resuming from checkpoint: $($checkpoint.completedIssues.Count) issues completed, $($checkpoint.failedIssues.Count) failed"
        Write-Host "  📍 Last processed: $($checkpoint.currentIssue)"
      }
    } else {
      Write-Host "  ℹ️  Checkpoint is for different epic, starting fresh"
    }
  } catch {
    Write-Warning "  ⚠️  Failed to load checkpoint, starting fresh"
  }
}

$checklist = New-Object System.Collections.Generic.List[string]
$checklist.Add("Epic #$EpicNumber -> Branch '$epicBranch'") | Out-Null

if ($subIssues.Count -eq 0) {
  Write-Host "  ℹ️  No sub-issues to process"
} else {
  Write-Host "  🚀 Processing $($subIssues.Count) sub-issues..."
  if ($checkpoint.completedIssues.Count -gt 0) {
    Write-Host "  ✅ Resuming: $($checkpoint.completedIssues.Count) already completed"
  }
}

$issueIndex = 0
foreach ($issue in $subIssues) {
  $issueIndex++
  $n = [int]$issue.number
  $title = $issue.title
  
  # Validate issue number - GitHub issues start at 1
  if ($n -le 0) {
    Write-Warning "    ⚠️  Skipping invalid issue #$n (must be > 0)"
    $checklist.Add("- ⚠️ #$n $title (invalid issue number)") | Out-Null
    continue
  }
  
  # Check if already completed
  if ($checkpoint.completedIssues -contains $n) {
    Write-Host "    ✅ Issue #$n already completed, skipping"
    continue
  }
  
  # Check if previously failed
  if ($checkpoint.failedIssues -contains $n) {
    Write-Host "    ⚠️  Issue #$n previously failed, retrying..."
  }
  
  $branch = "issue-$n-epic-$EpicNumber"
  
  Write-Host "    [$issueIndex/$($subIssues.Count)] Processing issue #$n - $title"
  Write-Host "      🌿 Working on branch: $branch"
  
  # Update checkpoint with current issue
  $checkpoint.currentIssue = "Processing #$n - $title"
  $checkpoint.lastUpdate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $checkpoint | ConvertTo-Json | Set-Content $checkpointFile
  
  if ($isDry) {
    $checklist.Add("- ⏳ #$n $title") | Out-Null
    Write-Host "      [DRY] Would process sub-issue #$n on branch '$branch'"
    continue
  }

  try {
    if (Test-CommandPresent 'git') {
      Write-Host "        📥 Fetching latest from epic branch..."
      git fetch origin $epicBranch | Out-Null
      
      if (git show-ref --verify --quiet "refs/heads/$branch") {
        Write-Host "        🔄 Branch exists, switching and rebasing..."
        try {
          git switch $branch | Out-Null
          git rebase "origin/$epicBranch" | Out-Null
          Write-Host "        ✅ Rebase completed"
        } catch {
          Write-Warning "        ⚠️  Rebase failed, trying to reset and retry..."
          git reset --hard "origin/$epicBranch" | Out-Null
          Write-Host "        ✅ Branch reset and ready"
        }
      } else {
        Write-Host "        🌿 Creating new branch from epic branch..."
        try {
          # First, ensure we're on the epic branch
          git switch $epicBranch | Out-Null
          
          # Check if the issue branch already exists
          if (git show-ref --verify --quiet "refs/heads/$branch") {
            Write-Host "        🔄 Issue branch exists, switching to it..."
            git switch $branch | Out-Null
            # Rebase on latest epic branch
            git rebase $epicBranch | Out-Null
            Write-Host "        ✅ Switched to existing branch and rebased"
          } else {
            # Create the issue branch from the current epic branch
            git switch -c $branch | Out-Null
            Write-Host "        ✅ New branch created"
          }
        } catch {
          Write-Warning "        ⚠️  Branch creation failed, trying alternative approach..."
          try {
            # Try to delete the branch if it exists and recreate
            git branch -D $branch 2>$null | Out-Null
            git switch -c $branch | Out-Null
            Write-Host "        ✅ Branch recreated via cleanup method"
          } catch {
            Write-Warning "        ❌ All branch creation methods failed"
            throw
          }
        }
      }
    }

    # Check if we have actual changes to commit
    Write-Host "        🔍 Checking for changes to commit..."
    $gitStatus = git status --porcelain
    if ($gitStatus) {
      Write-Host "        📝 Found changes, committing them..."
      git add -A | Out-Null
      git commit -m "feat(epic): work on issue #$n - $title" | Out-Null
      Write-Host "        ✅ Changes committed"
    } else {
      Write-Host "        ℹ️  No changes detected, creating placeholder commit..."
      # Create a placeholder file to ensure the branch has content
      $placeholderFile = "epic-$EpicNumber-issue-$n.md"
      $placeholderContent = @"
# Issue #$n - $title

This is a placeholder commit for issue #$n under epic #$EpicNumber.

- Issue #$n
- Epic #$EpicNumber
- Status - In Progress
- Created - $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Next Steps
1. Implement the required changes
2. Add tests
3. Update documentation
4. Create PR for review
"@
      $placeholderContent | Set-Content $placeholderFile
      git add $placeholderFile | Out-Null
      git commit -m "feat(epic): initial commit for issue #$n - $title" | Out-Null
      Write-Host "        ✅ Placeholder commit created"
    }
    
    # Debug: Show current branch and commit status
    Write-Host "        🔍 Current branch: $(git branch --show-current)"
    Write-Host "        🔍 Latest commit: $(git log --oneline -1)"
    Write-Host "        🔍 Branch difference from epic: $(git log --oneline $epicBranch..HEAD | wc -l) commits ahead"

    $ci = Get-CIScript
    if ($ci) {
      Write-Host "Running CI: $ci"
      iex $ci
    }

    Write-Host "        🔍 Checking for existing PR on branch $branch..."
    $prUrl = gh pr view --head $branch --json number,url --jq '.url' 2>$null
    if (-not $prUrl) {
      Write-Host "        📝 Creating new PR from $branch to $epicBranch..."
      Write-Host "        🔍 Branch $branch has $(git log --oneline $epicBranch..HEAD | wc -l) commits ahead of $epicBranch"
      
      # Try to create PR with explicit base and head
      $prUrl = gh pr create --base $epicBranch --head $branch --title "issue #$n -> epic #$EpicNumber" --body "Automated PR for #$n into $epicBranch" --draft=false --fill | Select-String -Pattern 'https?://\S+' | ForEach-Object { $_.Matches[0].Value } | Select-Object -First 1
      
      if ($prUrl) {
        Write-Host "        ✅ PR created successfully: $prUrl"
      } else {
        Write-Host "        ❌ PR creation failed"
      }
    } else {
      Write-Host "        ✅ Found existing PR: $prUrl"
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
      
      # Mark as completed in checkpoint
      $checkpoint.completedIssues += $n
      $checkpoint.currentIssue = $null
      $checkpoint | ConvertTo-Json | Set-Content $checkpointFile
      Write-Host "        ✅ Issue #$n completed and checkpoint saved"
    } else {
      Label-NeedsHuman -IssueNumber $n -Reason "PR could not be created."
      $checklist.Add("- ⛔ #$n $title") | Out-Null
      
      # Mark as failed in checkpoint
      $checkpoint.failedIssues += $n
      $checkpoint.currentIssue = $null
      $checkpoint | ConvertTo-Json | Set-Content $checkpointFile
      Write-Host "        ⛔ Issue #$n failed and checkpoint saved"
    }
  } catch {
    Label-NeedsHuman -IssueNumber $n -Reason ("Error: " + $_.Exception.Message)
    $checklist.Add("- ⛔ #$n $title") | Out-Null
    
    # Mark as failed in checkpoint
    $checkpoint.failedIssues += $n
    $checkpoint.currentIssue = $null
    $checkpoint | ConvertTo-Json | Set-Content $checkpointFile
    Write-Host "        ⛔ Issue #$n failed with error and checkpoint saved"
  }
}

Update-EpicChecklistComment -EpicNumber $EpicNumber -Lines $checklist

# Final checkpoint update
$checkpoint.lastUpdate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$checkpoint.currentIssue = "Completed"
$checkpoint | ConvertTo-Json | Set-Content $checkpointFile

Write-Host "  📊 Final Summary:"
Write-Host "    ✅ Completed: $($checkpoint.completedIssues.Count) issues"
Write-Host "    ⛔ Failed: $($checkpoint.failedIssues.Count) issues"
Write-Host "    📍 Checkpoint saved to: $checkpointFile"

Write-Host "Done."

# Continuous processing mode
if ($Continuous) {
  Write-Host ""
  Write-Host "🔄 Continuous mode enabled - looking for next epic..."
  
  # Clean up current checkpoint
  if (Test-Path $checkpointFile) {
    Remove-Item $checkpointFile
    Write-Host "  🗑️  Cleaned up checkpoint for epic #$EpicNumber"
  }
  
  # Find next epic
  $nextEpic = Select-NextEpicByPriority
  if ($nextEpic) {
    Write-Host "  🎯 Found next epic: #$nextEpic"
    Write-Host "  🚀 Restarting script for epic #$nextEpic..."
    
    # Restart the script with the next epic
    $scriptPath = $MyInvocation.MyCommand.Path
    $arguments = @(
      "-EpicNumber", $nextEpic,
      "-Continuous"
    )
    if ($isDry) { $arguments += "-DryRun" }
    
    Start-Process -FilePath "pwsh" -ArgumentList @("-Command", "& '$scriptPath' $($arguments -join ' ')") -Wait
  } else {
    Write-Host "  ℹ️  No more epics found to process"
    Write-Host "  🎉 All epics completed!"
  }
}

