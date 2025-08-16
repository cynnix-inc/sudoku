param(
  [ValidateSet("feat","fix","chore","docs","refactor","test","ci","build","perf")]
  [string]$type,
  [string]$scope = "",
  [Parameter(Mandatory=$true)]
  [string]$desc
)

$slug = $desc.ToLower() -replace '[^a-z0-9]','-' -replace '[-]+','-' -replace '^-|-$',''
$sc = if ($scope) { "$scope/" } else { "" }
$branch = "$type/$sc$slug"

git fetch origin
git switch -c $branch
git push -u origin $branch
Write-Host "Created and published $branch"
