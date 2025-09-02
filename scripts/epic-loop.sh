#!/usr/bin/env bash
set -euo pipefail

# Epic processing automation
# - Lists open sub-issues referencing the epic
# - Creates feature branches from the epic branch
# - Opens PRs into the epic branch, enables auto-merge
# - Polls PR status until merged; if blocked by review, comments and keeps polling
# - Rebases epic branch on latest staging after each merge

# Requirements:
# - gh CLI authenticated
# - git configured with origin remote
# - bash, awk, jq available (jq optional; we fallback to grep/sed for minimal parsing)

EPIC_NUMBER="${EPIC_NUMBER:-${1:-227}}"
STAGING_BRANCH="${STAGING_BRANCH:-staging}"
EPIC_BRANCH="${EPIC_BRANCH:-epic/${EPIC_NUMBER}-staging-code-review}"
POLL_INTERVAL_SECONDS="${POLL_INTERVAL_SECONDS:-45}"
MAX_WAIT_MINUTES="${MAX_WAIT_MINUTES:-120}"

# Resolve repo owner/name
REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
if [[ -z "${REPO}" ]]; then
  echo "Error: Unable to determine repo (gh auth or remotes not configured)." >&2
  exit 1
fi

echo "Repo: ${REPO} | Epic: #${EPIC_NUMBER} | Epic branch: ${EPIC_BRANCH} | Staging: ${STAGING_BRANCH}" >&2

# Ensure local epic branch tracks remote and exists
if ! git rev-parse --verify "${EPIC_BRANCH}" >/dev/null 2>&1; then
  echo "Creating local epic branch ${EPIC_BRANCH} from origin/${STAGING_BRANCH}..." >&2
  git fetch origin "${STAGING_BRANCH}"
  git checkout -b "${EPIC_BRANCH}" "origin/${STAGING_BRANCH}"
  git push -u origin "${EPIC_BRANCH}" || true
else
  echo "Refreshing ${EPIC_BRANCH} from origin/${STAGING_BRANCH}..." >&2
  git fetch origin "${STAGING_BRANCH}" "${EPIC_BRANCH}"
  git checkout "${EPIC_BRANCH}"
  git reset --hard "origin/${EPIC_BRANCH}" || git reset --hard "origin/${STAGING_BRANCH}"
fi

# Helper: sanitize string to branch-safe slug
slugify() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g' | cut -c1-60
}

# Helper: poll PR until merged or timeout. Emits final state.
poll_pr_until_merged() {
  local pr_number="$1"
  local start_epoch now_epoch elapsed state
  start_epoch=$(date +%s)
  while true; do
    state=$(gh pr view "$pr_number" --json state,isDraft,mergeStateStatus -q '.state' 2>/dev/null || echo "UNKNOWN")
    if [[ "$state" == "MERGED" ]]; then
      echo "MERGED"
      return 0
    fi
    # Try to surface failing checks succinctly
    if gh pr view "$pr_number" --json statusCheckRollup -q '.statusCheckRollup[] | select(.conclusion=="FAILURE") | .name' >/dev/null 2>&1; then
      echo "Checks failing for PR #$pr_number:" >&2
      gh pr view "$pr_number" --json statusCheckRollup -q '.statusCheckRollup[] | select(.conclusion=="FAILURE") | [.name, .conclusion] | @tsv' || true
    fi
    now_epoch=$(date +%s)
    elapsed=$(( (now_epoch - start_epoch) / 60 ))
    if (( elapsed >= MAX_WAIT_MINUTES )); then
      echo "TIMEOUT"
      return 1
    fi
    sleep "$POLL_INTERVAL_SECONDS"
  done
}

# Discover open sub-issues referencing the epic
# Strategy: search by label first, then by body reference to #<epic>

echo "Discovering open sub-issues..." >&2
if gh issue list --repo "$REPO" --state open --limit 200 --json number,title,url,labels --search "label:sub-issue" >/tmp/subissues.json 2>/dev/null; then
  true
else
  # Fallback: body reference
  gh issue list --repo "$REPO" --state open --limit 200 --json number,title,url,labels --search "in:body #${EPIC_NUMBER}" >/tmp/subissues.json
fi

if [[ ! -s /tmp/subissues.json ]]; then
  echo "No open sub-issues found for epic #${EPIC_NUMBER}. Nothing to do." >&2
  exit 0
fi

# Iterate in the order returned
count=$(jq 'length' /tmp/subissues.json 2>/dev/null || echo 0)
if [[ "$count" -eq 0 ]]; then
  echo "No open sub-issues to process." >&2
  exit 0
fi

echo "Found $count open sub-issue(s)." >&2

for row in $(jq -c '.[]' /tmp/subissues.json); do
  issue_number=$(echo "$row" | jq -r '.number')
  title=$(echo "$row" | jq -r '.title')
  url=$(echo "$row" | jq -r '.url')
  branch_slug=$(slugify "$title")
  feature_branch="feat/epic${EPIC_NUMBER}-${issue_number}-${branch_slug}"

  echo "\n=== Processing sub-issue #${issue_number}: ${title}" >&2

  # Create feature branch off epic branch
  git fetch origin "${EPIC_BRANCH}"
  git checkout -B "${feature_branch}" "origin/${EPIC_BRANCH}"

  # Commit a no-op if there are no changes to trigger CI; real edits should replace this
  if ! git diff --quiet; then
    echo "Local changes present; proceeding to push." >&2
  else
    echo "chore(epic:${EPIC_NUMBER}): initialize branch for #${issue_number}" > .epic-${EPIC_NUMBER}-${issue_number}.md
    git add .epic-*.md || true
    git commit -m "chore(epic:${EPIC_NUMBER}): init #${issue_number} - ${title}" || true
  fi

  git push -u origin "${feature_branch}" --force-with-lease || git push -u origin "${feature_branch}"

  # Open or reuse PR into epic branch
  pr_url=$(gh pr list --repo "$REPO" --head "$feature_branch" --json url -q '.[0].url' 2>/dev/null || true)
  if [[ -z "$pr_url" ]]; then
    pr_url=$(gh pr create \
      --repo "$REPO" \
      --base "$EPIC_BRANCH" \
      --head "$feature_branch" \
      --title "feat(epic:${EPIC_NUMBER}): ${title} (#${issue_number})" \
      --body "Automated PR for sub-issue #${issue_number} linked to epic #${EPIC_NUMBER}.\n\n- Epic: #${EPIC_NUMBER}\n- Sub-issue: #${issue_number} (${url})\n\nAuto-merge is enabled; this PR will be monitored until merged." 2>/dev/null)
  fi
  pr_number=$(basename "$pr_url" | sed 's/[^0-9]//g')
  echo "Opened PR: ${pr_url}" >&2

  # Enable auto-merge (squash) if possible
  gh pr merge "$pr_number" --auto --squash --delete-branch || true

  # If reviews required, leave a concise comment
  gh pr comment "$pr_number" --body "Auto-merge enabled. Awaiting required checks/reviews. Epic #${EPIC_NUMBER}." || true

  # Poll until merged
  final_state="$(poll_pr_until_merged "$pr_number" || true)"
  if [[ "$final_state" != "MERGED" ]]; then
    echo "PR #$pr_number not merged (state=$final_state). Skipping rebase and continuing to next sub-issue." >&2
    continue
  fi

  # Rebase epic branch on latest staging
  echo "Rebasing ${EPIC_BRANCH} on origin/${STAGING_BRANCH}..." >&2
  git fetch origin "$STAGING_BRANCH" "$EPIC_BRANCH"
  git checkout "$EPIC_BRANCH"
  git reset --hard "origin/${EPIC_BRANCH}"
  if git rebase "origin/${STAGING_BRANCH}"; then
    git push --force-with-lease
  else
    echo "Rebase conflict encountered. Aborting rebase and pushing merge commit." >&2
    git rebase --abort || true
    git merge --no-edit "origin/${STAGING_BRANCH}" || true
    git push
  fi

done

echo "All sub-issues processed (or queued)." >&2