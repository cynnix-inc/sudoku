#!/usr/bin/env bash

set -euo pipefail

# Utilities
# - wait_for_pr_checks <pr> [timeout_seconds=1200] [interval_seconds=30]
# - finalize_epic_pr (opens PR epic/14-classic-9x9 -> staging with auto-merge)

wait_for_pr_checks() {
	local pr_ref="$1"
	local timeout_seconds="${2:-1200}"
	local interval_seconds="${3:-30}"
	local deadline=$((SECONDS + timeout_seconds))

	if ! command -v gh >/dev/null 2>&1; then
		echo "Error: gh (GitHub CLI) not installed; cannot wait for PR checks." >&2
		return 2
	fi

	while :; do
		local ok
		ok="$(gh pr view "$pr_ref" --json statusCheckRollup --jq 'all(.statusCheckRollup[]?; (.conclusion=="SUCCESS") or (.status=="COMPLETED"))' 2>/dev/null || echo false)"
		if [[ "$ok" == "true" ]]; then
			echo "All checks successful for $pr_ref"
			return 0
		fi
		if (( SECONDS >= deadline )); then
			echo "Timeout waiting for checks on $pr_ref after ${timeout_seconds}s" >&2
			return 1
		fi
		sleep "$interval_seconds"
	done
}

finalize_epic_pr() {
	# Ensure we're up to date and open a PR from epic -> staging with auto-merge
	git fetch --all --prune
	git checkout epic/14-classic-9x9
	git pull --rebase
	git rebase origin/staging || true

	# Run CI if available (reuse ROOT_PKG detection like below if already set)
	local root_pkg=""
	if [[ -f package.json ]]; then
		root_pkg="."
	elif [[ -f ultimate-sudoku/package.json ]]; then
		root_pkg="ultimate-sudoku"
	fi
	if [[ -n "$root_pkg" ]]; then
		pushd "$root_pkg" >/dev/null
		echo "Running: npm ci"
		npm ci --prefer-offline --no-audit || true
		echo "Running: npm run ci"
		npm run -s ci || true
		popd >/dev/null
	else
		echo "No package.json found at repo root or under ultimate-sudoku/. Skipping CI."
	fi

	# Create or reuse PR
	local pr_url
	pr_url="$(gh pr create -B staging -H epic/14-classic-9x9 -t "Epic #14 — Classic Mode: integration to staging" -b "Merge epic/14-classic-9x9 into staging after completing sub-issues for Epic #14." --fill 2>/dev/null \
		|| gh pr view -H epic/14-classic-9x9 --json url --jq .url 2>/dev/null \
		|| echo '')"
	if [[ -n "$pr_url" ]]; then
		echo "Finalize PR: $pr_url"
		gh pr merge "$pr_url" --auto --squash || true
	else
		echo "Could not create or view PR for epic/14-classic-9x9 -> staging" >&2
		return 1
	fi
}

# Subcommands (run early and exit)
if [[ "${1:-}" == "wait-pr" ]]; then
	shift
	if [[ -z "${1:-}" ]]; then
		echo "Usage: scripts/epic-14.sh wait-pr <pr-number-or-url> [timeoutSeconds] [intervalSeconds]" >&2
		exit 2
	fi
	wait_for_pr_checks "$@"
	exit $?
fi

if [[ "${1:-}" == "finalize" ]]; then
	shift
	finalize_epic_pr
	exit $?
fi

if [[ "${1:-}" == "branch" ]]; then
	shift
	if [[ -z "${1:-}" ]]; then
		echo "Usage: scripts/epic-14.sh branch <sub-issue-id>" >&2
		exit 2
	fi
	issue_id="$1"
	if ! command -v gh >/dev/null 2>&1; then
		echo "Error: gh (GitHub CLI) not installed; cannot derive title/slug." >&2
		exit 1
	fi
	title="$(gh issue view "$issue_id" --json title --jq .title 2>/dev/null || echo "sub-issue-$issue_id")"
	slug="$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g;s/^-+|-+$//g')"
	git fetch --all --prune
	git checkout epic/14-classic-9x9
	git pull --rebase
	git checkout -b "feat/14-$slug" || git checkout "feat/14-$slug"
	echo "Created/checked out feature branch: feat/14-$slug (from epic/14-classic-9x9)"
	gh issue view "$issue_id" --json title,body,labels,assignees,state || true
	exit 0
fi

# Epic automation: Epic #14 — Classic Mode: Playable 9×9 slice
# - Ensures gh auth + extension
# - Ensures Node 20.x via Volta
# - Prepares epic branch from staging
# - Runs CI if package.json present
# - Lists sub-issues and attempts to create branch for the first one

echo "== Detect environment =="
OS_ID="$(. /etc/os-release && echo "$ID")"
echo "OS: ${OS_ID}"

echo "== Ensure GitHub CLI =="
if ! command -v gh >/dev/null 2>&1; then
	if command -v apt-get >/dev/null 2>&1; then
		sudo apt-get update -y >/dev/null
		sudo apt-get install -y gh >/dev/null || true
	fi
fi
if ! command -v gh >/dev/null 2>&1; then
	echo "Error: gh (GitHub CLI) not installed and could not be installed automatically." >&2
	exit 1
fi

echo "== Authenticate gh (non-interactive if token embedded in remote) =="
REMOTE_URL="$(git remote get-url origin 2>/dev/null || echo '')"
if [[ -n "$REMOTE_URL" ]]; then
	if echo "$REMOTE_URL" | grep -q "x-access-token:"; then
		GH_TOKEN="$(echo "$REMOTE_URL" | sed -n 's#.*x-access-token:\(ghs_[A-Za-z0-9_-]*\)@github.com/.*#\1#p')"
		if [[ -n "${GH_TOKEN:-}" ]]; then
			echo "$GH_TOKEN" | gh auth login --with-token >/dev/null 2>&1 || true
		fi
	fi
fi
gh auth status || true

echo "== Install gh-sub-issue extension =="
gh extension install yahsan2/gh-sub-issue --force >/dev/null 2>&1 || true
gh extension list || true

echo "== Ensure Volta and Node 20.x =="
if ! command -v volta >/dev/null 2>&1; then
	curl -fsSL https://get.volta.sh | bash -s -- --skip-setup >/dev/null 2>&1 || true
fi
export VOLTA_HOME="${HOME}/.volta"
export PATH="${VOLTA_HOME}/bin:${PATH}"
volta --version || true
volta install node@20 >/dev/null 2>&1 || true
echo "Node version: $(node -v 2>/dev/null || echo 'not found') (expected v20.x)"

echo "== Ensure full checkout =="
if [[ "$(git config --get core.sparseCheckout || echo false)" == true ]]; then
	git sparse-checkout disable
fi
git fetch --all --prune

echo "== Prepare branches =="
git checkout staging
git pull --rebase

if git ls-remote --exit-code --heads origin epic/14-classic-9x9 >/dev/null 2>&1; then
	git checkout -B epic/14-classic-9x9 origin/epic/14-classic-9x9
else
	git checkout -b epic/14-classic-9x9
fi
git branch -vv | sed -n '1,80p'

echo "== Run CI if package.json present =="
ROOT_PKG=""
if [[ -f package.json ]]; then
	ROOT_PKG="."
elif [[ -f ultimate-sudoku/package.json ]]; then
	ROOT_PKG="ultimate-sudoku"
fi
if [[ -n "$ROOT_PKG" ]]; then
	pushd "$ROOT_PKG" >/dev/null
	echo "Running: npm ci"
	npm ci --prefer-offline --no-audit || true
	echo "Running: npm run ci"
	npm run -s ci || true
	popd >/dev/null
else
	echo "No package.json found at repo root or under ultimate-sudoku/. Skipping CI."
fi

echo "== List Epic 14 sub-issues (open) =="
if gh extension list | grep -q "gh-sub-issue"; then
	gh sub-issue list 14 --state open || true
else
	echo "gh-sub-issue extension not available; cannot list sub-issues."
fi

echo "== Attempt to select first open sub-issue and create feature branch =="
FIRST_ID=""
FIRST_TITLE=""
if gh extension list | grep -q "gh-sub-issue"; then
	# Try to parse first ID from the list output (best effort)
	FIRST_LINE="$(gh sub-issue list 14 --state open 2>/dev/null | head -n 1 || true)"
	# Common patterns: starting with an ID or with a checkbox and then #ID
	if echo "$FIRST_LINE" | grep -Eoq '^[0-9]+'; then
		FIRST_ID="$(echo "$FIRST_LINE" | awk '{print $1}')"
	elif echo "$FIRST_LINE" | grep -Eoq '#[0-9]+'; then
		FIRST_ID="$(echo "$FIRST_LINE" | sed -n 's/.*#\([0-9][0-9]*\).*/\1/p')"
	fi
fi

if [[ -n "$FIRST_ID" ]]; then
	FIRST_TITLE="$(gh issue view "$FIRST_ID" --json title --jq .title 2>/dev/null || echo '')"
	if [[ -z "$FIRST_TITLE" ]]; then
		FIRST_TITLE="sub-issue-${FIRST_ID}"
	fi
	SLUG="$(echo "$FIRST_TITLE" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g;s/^-+|-+$//g')"
	git checkout epic/14-classic-9x9
	git pull --rebase
	FEATURE_BRANCH="feat/14-${SLUG}"
	git checkout -b "$FEATURE_BRANCH" || git checkout "$FEATURE_BRANCH"
	echo "Created/checked out feature branch: ${FEATURE_BRANCH} (from epic/14-classic-9x9)"
	gh issue view "$FIRST_ID" --json title,body,labels,assignees,state || true
else
	echo "Could not determine first sub-issue automatically. Please review the list above and create a branch manually with:"
	echo "  git checkout epic/14-classic-9x9 && git checkout -b feat/14-<slug>"
fi

echo "== Done =="

