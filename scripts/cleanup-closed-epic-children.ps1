param(
  [int]$Parent,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

if (-not $Parent) {
  Write-Error "Provide -Parent <issue-number>"
  exit 1
}

# List open issues and filter by Parent metadata
$issuesJson = gh issue list -R cynnix-inc/sudoku --state all --limit 300 --json number,title,body,state
$issues = $issuesJson | ConvertFrom-Json
$children = $issues | Where-Object { $_.body -match ("Parent:\\s*#" + $Parent) }

if (-not $children) {
  Write-Output "No children found for Parent: #$Parent"
  exit 0
}

Write-Output ("Found {0} children for Parent: #{1}" -f $children.Count, $Parent)

# Get parent state
$parentState = (gh issue view $Parent -R cynnix-inc/sudoku --json state | ConvertFrom-Json).state
Write-Output ("Parent state: {0}" -f $parentState)

foreach ($c in $children) {
  $n = $c.number
  $state = $c.state
  if ($parentState -eq 'CLOSED' -and $state -eq 'OPEN') {
    if ($DryRun) {
      Write-Output "Would close #$n (parent closed)"
    } else {
      gh issue close $n -R cynnix-inc/sudoku -c "Closing as child of closed epic #$Parent. Verified via cleanup script."
    }
  } elseif ($parentState -ne 'CLOSED' -and $state -eq 'CLOSED') {
    if ($DryRun) {
      Write-Output "Would reopen #$n (parent open)"
    } else {
      gh issue reopen $n -R cynnix-inc/sudoku -c "Reopening: parent epic #$Parent is open."
    }
  } else {
    Write-Output "No action for #$n (state=$state)"
  }
}
