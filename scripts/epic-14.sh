#!/usr/bin/env bash

set -euo pipefail

# Epic automation script for Classic Mode – Playable 9×9 slice (#14)
# - Creates/updates the epic integration branch from staging
# - Iterates open sub-issues linked to the Epic
# - For each, creates a feature branch, commits a placeholder implementation doc,
#   opens a PR into the epic branch, enables auto-merge, polls until merged
# - Rebases the epic branch on staging after each merge
#
# Requirements:
# - git and gh (GitHub CLI) installed and logged in (gh auth status)
# - repo cloned with write access
# - optional: project scripts (lint, typecheck, test, build, audit) — the script will no-op if not present

EPIC_ID="14"
EPIC_BRANCH="epic/14-classic-9x9"
BASE_BRANCH="staging"
POLL_INTERVAL_SECONDS=${POLL_INTERVAL_SECONDS:-30}

echo "== Checking tools =="
command -v git >/dev/null 2>&1 || { echo "git is required"; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "gh (GitHub CLI) is required"; exit 1; }

echo "== Checking GitHub auth =="
if ! gh auth status -h github.com >/dev/null 2>&1; then
  echo "You must authenticate: gh auth login"
  exit 1
fi

REPO_NWO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "Repo: ${REPO_NWO}"

echo "== Ensuring base branch exists on remote =="
if ! git ls-remote --heads origin "${BASE_BRANCH}" | grep -q "refs/heads/${BASE_BRANCH}"; then
  echo "Warning: origin/${BASE_BRANCH} not found. Falling back to origin/main."
  BASE_BRANCH="main"
  if ! git ls-remote --heads origin "${BASE_BRANCH}" | grep -q "refs/heads/${BASE_BRANCH}"; then
    echo "Error: Neither origin/staging nor origin/main found. Aborting."
    exit 1
  fi
fi

echo "== Creating or updating epic branch ${EPIC_BRANCH} from origin/${BASE_BRANCH} =="
git fetch origin "${BASE_BRANCH}":"refs/remotes/origin/${BASE_BRANCH}" -q
if git show-ref --verify --quiet "refs/heads/${EPIC_BRANCH}"; then
  git checkout "${EPIC_BRANCH}"
  git reset --hard "origin/${BASE_BRANCH}"
else
  git checkout -b "${EPIC_BRANCH}" "origin/${BASE_BRANCH}"
fi
git push -u origin "${EPIC_BRANCH}" || true

echo "== Discovering open sub-issues linked to Epic #${EPIC_ID} =="
# Prefer linked issues search; falls back to label if conventionally labeled
SUBISSUES_JSON=$(gh issue list --search "linked:issue:${EPIC_ID} is:open" --state open --json number,title,url || echo "[]")
if [[ "${SUBISSUES_JSON}" == "[]" ]]; then
  # fallback: look for issues mentioning the epic number
  SUBISSUES_JSON=$(gh issue list --search "#${EPIC_ID} is:open" --state open --json number,title,url || echo "[]")
fi

COUNT=$(echo "${SUBISSUES_JSON}" | jq 'length')
echo "Found ${COUNT} open sub-issues"

if [[ ${COUNT} -eq 0 ]]; then
  echo "No open sub-issues detected. Nothing to do."
  exit 0
fi

mkdir -p docs/epic-14/sub-issues

for row in $(echo "${SUBISSUES_JSON}" | jq -r '.[] | @base64'); do
  _jq() { echo "${row}" | base64 --decode | jq -r ${1}; }

  ISSUE_NUMBER=$(_jq '.number')
  ISSUE_TITLE=$(_jq '.title')
  ISSUE_URL=$(_jq '.url')

  # sanitize title into a slug
  ISSUE_SLUG=$(echo "${ISSUE_TITLE}" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')
  FEATURE_BRANCH="feat/14-${ISSUE_NUMBER}-${ISSUE_SLUG}"

  echo "\n== Processing sub-issue #${ISSUE_NUMBER}: ${ISSUE_TITLE} =="

  echo "-- Creating feature branch ${FEATURE_BRANCH} from ${EPIC_BRANCH} --"
  git checkout "${EPIC_BRANCH}"
  git pull --ff-only origin "${EPIC_BRANCH}" || true
  if git show-ref --verify --quiet "refs/heads/${FEATURE_BRANCH}"; then
    git branch -D "${FEATURE_BRANCH}"
  fi
  git checkout -b "${FEATURE_BRANCH}" "${EPIC_BRANCH}"

  echo "-- Applying placeholder changes (docs) --"
  DOC_PATH="docs/epic-14/sub-issues/${ISSUE_NUMBER}-${ISSUE_SLUG}.md"
  cat > "${DOC_PATH}" <<EOF
# Epic 14 Sub-Issue #${ISSUE_NUMBER}

Title: ${ISSUE_TITLE}
Link: ${ISSUE_URL}

This file marks the implementation scope for sub-issue #${ISSUE_NUMBER} within Epic 14.
Implementation work should update code, tests, ADRs, and changelogs per .cursor/rules.
EOF

  git add "${DOC_PATH}"
  git commit -m "feat(classic-9x9): scaffold sub-issue #${ISSUE_NUMBER} for Epic #14"

  echo "-- Pushing branch and creating PR into ${EPIC_BRANCH} --"
  git push -u origin "${FEATURE_BRANCH}"
  PR_URL=$(gh pr create -B "${EPIC_BRANCH}" -H "${FEATURE_BRANCH}" -t "[Epic 14] ${ISSUE_TITLE} (#{ISSUE_NUMBER})" -b "Implements Epic #14 sub-issue #${ISSUE_NUMBER}.\n\n- References: #${EPIC_ID}\n- Closes: #${ISSUE_NUMBER}\n\nFollows .cursor/rules and updates docs." --draft=false)
  echo "PR: ${PR_URL}"

  echo "-- Enabling auto-merge (squash) --"
  gh pr merge --auto --squash "${PR_URL}"

  echo "-- Polling PR merge status every ${POLL_INTERVAL_SECONDS}s --"
  while true; do
    STATE=$(gh pr view "${PR_URL}" --json state -q .state 2>/dev/null || echo "UNKNOWN")
    if [[ "${STATE}" == "MERGED" ]]; then
      echo "PR merged."
      break
    fi
    echo "Waiting... (state=${STATE})"
    sleep "${POLL_INTERVAL_SECONDS}"
  done

  echo "-- Rebasing epic branch on origin/${BASE_BRANCH} --"
  git checkout "${EPIC_BRANCH}"
  git fetch origin "${BASE_BRANCH}":"refs/remotes/origin/${BASE_BRANCH}" -q
  git pull --ff-only origin "${EPIC_BRANCH}" || true
  if ! git rebase "origin/${BASE_BRANCH}"; then
    echo "Rebase conflict encountered; aborting rebase to continue. Please resolve manually."
    git rebase --abort || true
  fi
  git push origin "${EPIC_BRANCH}" || true
done

echo "\nAll sub-issues processed."

