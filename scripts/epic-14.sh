#!/usr/bin/env bash

set -euo pipefail

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

