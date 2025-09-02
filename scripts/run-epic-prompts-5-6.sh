#!/usr/bin/env bash

set -euo pipefail

echo "== Setup =="
git fetch --all --prune >/dev/null 2>&1 || true

# Ensure gh-sub-issue extension is available
if ! gh extension list | grep -q "gh-sub-issue"; then
  gh extension install yahsan2/gh-sub-issue >/dev/null 2>&1 || true
fi

# Get closed epics as TSV: number<TAB>title
mapfile -t EPICS < <(gh issue list --label "type/epic" --state closed --limit 200 \
  --json number,title,closedAt --jq '.[] | [(.number|tostring), .title] | @tsv' 2>/dev/null || true)

for row in "${EPICS[@]}"; do
  n="${row%%$'\t'*}"
  title="${row#*$'\t'}"
  [[ -z "${n:-}" ]] && continue

  echo "== Epic #${n} — ${title} =="

  # Find a matching epic branch on origin
  branch="$(git branch -r --format='%(refname:short)' | sed 's#^origin/##' | grep -E "^epic/${n}(|-.+)$" | head -n1 || true)"
  echo "branch=${branch:-<none>}"

  echo "-- Prompt 5: Epic Review --"
  if gh extension list | grep -q "gh-sub-issue"; then
    gh sub-issue list "$n" --state all 2>/dev/null | sed -n '1,80p' || true
  fi

  echo "-- Local checks (non-fatal) --"
  npm run -s lint || true
  npm run -s typecheck || true
  npm test -- --ci || true

  echo "-- Prompt 6: Finalize Epic --"
  if [[ -n "${branch}" ]]; then
    git switch -C "${branch}" "origin/${branch}" >/dev/null 2>&1 || true
    git fetch origin staging >/dev/null 2>&1 || true
    git rebase origin/staging >/dev/null 2>&1 || true
    git push -u origin "${branch}" >/dev/null 2>&1 || true

    pr_url="$(gh pr create -B staging -H "${branch}" -t "Epic #${n} — finalize to staging" \
      -b "Merge ${branch} into staging to finalize Epic #${n} — ${title}." --fill 2>/dev/null \
      || gh pr view -H "${branch}" --json url --jq .url 2>/dev/null \
      || echo '')"
    if [[ -n "${pr_url}" ]]; then
      echo "PR: ${pr_url}"
      gh pr merge "${pr_url}" --auto --squash >/dev/null 2>&1 || true
      gh issue comment "${n}" --body "Finalize PR opened: ${pr_url} (auto-merge enabled)." >/dev/null 2>&1 || true
    else
      echo "No PR could be created for ${branch}"
      gh issue comment "${n}" --body "Could not create or find finalize PR for branch ${branch}." >/dev/null 2>&1 || true
    fi
  else
    gh issue comment "${n}" --body "No epic branch found matching pattern epic/${n}*. Skipping finalize step." >/dev/null 2>&1 || true
  fi

  echo
done

echo "All done."

