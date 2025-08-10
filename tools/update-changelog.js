#!/usr/bin/env node
"use strict";

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function runGitLog() {
  const args = [
    "log",
    "--date=short",
    "--pretty=format:%h\t%ad\t%s",
    "--no-merges",
    "-n",
    "300",
  ];
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`git log failed: ${result.stderr || result.stdout}`);
  }
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [hash, date, ...rest] = line.split("\t");
      const message = (rest || []).join("\t");
      return { hash, date, message };
    });
}

function readPackageVersion() {
  const pkgPath = path.resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  return pkg.version || "0.0.0";
}

function findFirstReleaseIndex(commits) {
  const releaseIdx = commits.findIndex((c) => /first\s+release/i.test(c.message));
  return releaseIdx; // -1 if not found
}

function categorizeCommit(message) {
  const msg = message.toLowerCase();
  if (/(fix|bug|hotfix|patch)/.test(msg)) return "Fixed";
  if (/(new|add|introduc|implement|feature)/.test(msg)) return "Added";
  if (/(overhaul|change|update|refactor|enhancement|improve)/.test(msg)) return "Changed";
  if (/(perf|optimi)/.test(msg)) return "Performance";
  if (/(doc|readme)/.test(msg)) return "Docs";
  if (/(test|jest|playwright)/.test(msg)) return "Tests";
  return "Changed";
}

function groupByCategory(commits) {
  const groups = new Map();
  for (const c of commits) {
    const key = categorizeCommit(c.message);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(c);
  }
  // stable order
  const order = ["Added", "Changed", "Fixed", "Performance", "Docs", "Tests"];
  return order
    .filter((k) => groups.has(k))
    .map((k) => [k, groups.get(k)]);
}

function renderSection(title, commits) {
  if (!commits.length) return "";
  const groups = groupByCategory(commits);
  let out = `\n### ${title}\n`;
  for (const [group, items] of groups) {
    out += `\n- **${group}**:\n`;
    for (const c of items) {
      const msg = c.message.replace(/\s+/g, " ").trim();
      out += `  - ${msg} (${c.hash})\n`;
    }
  }
  return out;
}

function generateChangelog() {
  const commits = runGitLog();
  const version = readPackageVersion();

  const firstReleaseIdx = findFirstReleaseIndex(commits);

  const unreleasedCommits = firstReleaseIdx === -1 ? commits : commits.slice(0, firstReleaseIdx);
  const releaseCommit = firstReleaseIdx !== -1 ? commits[firstReleaseIdx] : commits[commits.length - 1];
  const releaseDate = releaseCommit ? releaseCommit.date : new Date().toISOString().slice(0, 10);

  let content = "";
  content += "# Changelog\n\n";
  content += "All notable changes to this project will be documented in this file.\n\n";
  content += "This format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n";

  // Unreleased
  content += `## [Unreleased] - ${new Date().toISOString().slice(0, 10)}\n`;
  content += renderSection("Changes", unreleasedCommits);

  // First release section
  content += `\n\n## [${version}] - ${releaseDate}\n`;
  const releaseSlice = firstReleaseIdx === -1 ? [] : commits.slice(firstReleaseIdx, firstReleaseIdx + 1);
  content += renderSection("Initial release", releaseSlice);

  return content.trim() + "\n";
}

function writeChangelog(text) {
  const target = path.resolve(process.cwd(), "CHANGELOG.md");
  fs.writeFileSync(target, text, "utf8");
}

try {
  const changelog = generateChangelog();
  writeChangelog(changelog);
  console.log("CHANGELOG.md updated.");
} catch (err) {
  console.error("Failed to update CHANGELOG:", err.message);
  process.exit(1);
}


