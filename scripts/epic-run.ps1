param(
    [int] $EpicNumber = 0,
    [switch] $DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Log {
    param([string] $Message)
    Write-Host ("[{0}] {1}" -f (Get-Date -Format s), $Message)
}

function Ensure-Command {
    param([string] $Name)
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if (-not $cmd) { throw "Missing required command: $Name" }
}

try {
    Ensure-Command -Name "gh"
} catch {
    Write-Error "GitHub CLI (gh) is required. Install: https://cli.github.com/"
    exit 2
}

# Validate auth
try {
    gh auth status -h github.com | Out-Null
} catch {
    Write-Error "gh is not authenticated. Run: gh auth login"
    exit 3
}

$repo = gh repo view --json nameWithOwner --jq .nameWithOwner
if (-not $repo) { throw "Unable to resolve current repository." }

Write-Log "Repository: $repo"

function Get-CIScript {
    $pkgPath = Join-Path (Get-Location) 'package.json'
    if (-not (Test-Path $pkgPath)) { return $null }
    $json = Get-Content $pkgPath -Raw | ConvertFrom-Json
    if ($null -ne $json.scripts."ci") { return "npm run ci" }
    if ($null -ne $json.scripts."test") { return "npm test" }
    return $null
}

$ciScript = Get-CIScript
if ($null -eq $ciScript) { $ciScript = "npm test" }
Write-Log "CI script: $ciScript"

function Select-NextEpic {
    # Placeholder selection; list open epics and pick first
    $issuesJson = gh issue list --label "type/epic" --state open --limit 100 --json number,labels,createdAt
    $issues = $issuesJson | ConvertFrom-Json
    if (-not $issues -or $issues.Count -eq 0) { return $null }
    # Simple sort by createdAt asc
    $sorted = $issues | Sort-Object { $_.createdAt }
    return $sorted[0].number
}

if ($EpicNumber -le 0) {
    $EpicNumber = Select-NextEpic
}

if (-not $EpicNumber) {
    Write-Log "No open epics found. Exiting."
    exit 0
}

Write-Log "Processing Epic #$EpicNumber"

function Ensure-Branch {
    param([string] $Name, [string] $From)
    $exists = git rev-parse --verify $Name 2>$null
    if (-not $?) {
        git fetch origin $From
        git branch $Name origin/$From
    }
}

Ensure-Command -Name "git"

$epicBranch = "epic/$EpicNumber"
if ($DryRun) { Write-Log "[DRY RUN] Would create/update epic branch from staging: $epicBranch" }
else {
    Ensure-Branch -Name $epicBranch -From "staging"
}

# Enumerate sub-issues
$subIssuesJson = gh issue list --search "linked:#$EpicNumber state:open" --json number,title,state,labels
$subIssues = @()
if ($subIssuesJson) { $subIssues = $subIssuesJson | ConvertFrom-Json }

if (-not $subIssues -or $subIssues.Count -eq 0) {
    Write-Log "No open sub-issues linked to epic."
}

foreach ($issue in $subIssues) {
    $n = $issue.number
    $branch = "feature/$EpicNumber-$n"
    if ($DryRun) {
        Write-Log "[DRY RUN] Would process sub-issue #$n on branch $branch"
        continue
    }
    Write-Log "Processing sub-issue #$n"
    # Create or checkout feature branch
    git fetch origin $epicBranch
    if (-not (git rev-parse --verify $branch 2>$null)) {
        git checkout -b $branch origin/$epicBranch
    } else {
        git checkout $branch
        git rebase origin/$epicBranch
    }

    # Run CI locally
    try {
        Write-Log "Running CI: $ciScript"
        iex $ciScript
    } catch {
        Write-Warning "CI failed locally for #$n. Labeling needs-human and continuing."
        gh issue edit $n --add-label "needs-human" | Out-Null
        gh issue comment $n --body "CI failed during epic automation. Marked needs-human and skipped."
        continue
    }

    # Open PR into epic branch
    $prTitle = "feat(epic-$EpicNumber): Sub-issue #$n"
    $pr = gh pr view --head $branch --json number --jq .number 2>$null
    if (-not $pr) {
        $pr = gh pr create --base $epicBranch --head $branch --title $prTitle --body "Automated PR for sub-issue #$n" --fill --draft=false
    }

    # Try enabling auto-merge
    try { gh pr merge $pr --auto --merge | Out-Null } catch { }

    # Poll until merged or timeout
    $max = 30
    for ($i=0; $i -lt $max; $i++) {
        Start-Sleep -Seconds 10
        $state = gh pr view $pr --json state,isCrossRepository,mergeStateStatus --jq .state
        if ($state -eq "MERGED") { break }
    }

    $finalState = gh pr view $pr --json state --jq .state
    if ($finalState -eq "MERGED") {
        gh issue close $n --comment "Merged via epic automation into $epicBranch"
    } else {
        gh issue edit $n --add-label "needs-human" | Out-Null
        gh issue comment $n --body "Auto-merge did not complete within timeout. Marked needs-human."
    }
}

# Update epic progress comment (simple checklist)
$progress = "Epic #$EpicNumber automation pass complete."
if ($DryRun) { $progress = "[DRY RUN] " + $progress }
gh issue comment $EpicNumber --body $progress

Write-Log "Done."

