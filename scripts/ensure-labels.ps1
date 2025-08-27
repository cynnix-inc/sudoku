Param()

$ErrorActionPreference = 'Stop'

function Ensure-Gh() {
  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "gh CLI not found. Install: https://cli.github.com/"
  }
}

function Ensure-Label {
  param([string]$name,[string]$color='#ededed',[string]$description='')
  $exists = gh label list --json name --jq ".[] | select(.name == '$name') | .name" 2>$null
  if ($exists) {
    Write-Host "exists: $name"
  } else {
    gh label create "$name" --color "$color" --description "$description" | Out-Null
    Write-Host "created: $name"
  }
}

Ensure-Gh

# Types
Ensure-Label 'type/epic' '5319e7' 'Epic tracking issue'
Ensure-Label 'type/feature' '0e8a16' 'Feature work'
Ensure-Label 'type/bug' 'd73a4a' 'Bug report'
Ensure-Label 'type/chore' 'c5def5' 'Chore or maintenance'
Ensure-Label 'type/refactor' 'bfd4f2' 'Refactor work'

# Status
Ensure-Label 'status/ready' '5319e7' 'Ready to start'
Ensure-Label 'status/in-progress' '5319e7' 'In progress'
Ensure-Label 'status/blocked' 'b60205' 'Blocked'
Ensure-Label 'status/done' '0e8a16' 'Completed'
Ensure-Label 'needs-human' 'fbca04' 'Requires human intervention'

# Priority
Ensure-Label 'priority/p0' 'b60205' 'Highest priority'
Ensure-Label 'priority/p1' 'd93f0b' 'High priority'
Ensure-Label 'priority/p2' 'fbca04' 'Medium priority'
Ensure-Label 'priority/p3' 'c5def5' 'Low priority'

# Meta signals used for auto-select (Prompt 4)
Ensure-Label 'mvp-critical' 'b60205' 'Blocks MVP progress'
Ensure-Label 'hotfix' 'd73a4a' 'Hotfix scope'
Ensure-Label 'security' 'b60205' 'Security-related work'
Ensure-Label 'dep/unblocker' '1d76db' 'Unblocks dependencies or other epics'

# Area
Ensure-Label 'area/core' '1d76db' 'Core systems'
Ensure-Label 'area/ui' '5319e7' 'User interface'
Ensure-Label 'area/ci' '0e8a16' 'Continuous integration'
Ensure-Label 'area/build' '5319e7' 'Build tooling'

