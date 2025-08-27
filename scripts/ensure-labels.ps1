param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Ensure-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Missing required command: $Name"
  }
}

Ensure-Command gh

$existing = @{}
try {
  $labelsJson = gh label list --json name
  if ($labelsJson) {
    ($labelsJson | ConvertFrom-Json) | ForEach-Object { $existing[$_.name] = $true }
  }
} catch { }

$defs = @(
  @{ name='type/epic';        color='7f3fbf'; desc='Epic (multi-issue initiative)'}
  @{ name='type/feature';     color='1d76db'; desc='Feature work'}
  @{ name='type/bug';         color='d73a4a'; desc='Bug fix'}
  @{ name='type/chore';       color='c2e0c6'; desc='Chore / maintenance'}
  @{ name='type/refactor';    color='fbca04'; desc='Refactor / internal improvement'}

  @{ name='status/ready';       color='0e8a16'; desc='Ready to start'}
  @{ name='status/in-progress'; color='5319e7'; desc='In progress'}
  @{ name='status/blocked';     color='b60205'; desc='Blocked'}
  @{ name='status/done';        color='006b75'; desc='Done'}
  @{ name='needs-human';        color='c5def5'; desc='Requires manual attention'}

  @{ name='priority/p0'; color='e11d48'; desc='Highest priority'}
  @{ name='priority/p1'; color='f97316'; desc='High priority'}
  @{ name='priority/p2'; color='f59e0b'; desc='Medium priority'}
  @{ name='priority/p3'; color='84cc16'; desc='Low priority'}

  @{ name='area/core';  color='0366d6'; desc='Core logic'}
  @{ name='area/ui';    color='a2eeef'; desc='UI'}
  @{ name='area/ci';    color='7057ff'; desc='CI/CD'}
  @{ name='area/build'; color='d4c5f9'; desc='Build/infra'}
)

$created = @()
foreach ($d in $defs) {
  if ($existing.ContainsKey($d.name)) { continue }
  try {
    gh label create $d.name --color $d.color --description $d.desc | Out-Null
    $created += $d.name
  } catch {
    Write-Warning "Failed to create label $($d.name): $($_.Exception.Message)"
  }
}

if ($created.Count -gt 0) {
  Write-Host "Created labels:" ($created -join ', ')
} else {
  Write-Host "All labels already present or could not be verified."
}

