#!/usr/bin/env node
/**
 * verify-deps.mjs
 * Checks all workspaces for missing/extraneous dependencies using `npm ls --workspaces --json`.
 * Exits non-zero if issues found. No external deps required.
 */
import { execSync } from 'node:child_process';

function run(cmd) {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString('utf8');
}

let json;
try {
  // Attempt to get a workspaces tree first (monorepo friendly)
  const out = run('npm ls --workspaces --all --json');
  const parsed = JSON.parse(out);
  if (parsed?.error?.summary && /No workspaces found/i.test(parsed.error.summary)) {
    // Fallback for single-package repos where npm reports no workspaces
    const singleOut = run('npm ls --all --json');
    json = JSON.parse(singleOut);
  } else if (parsed?.error) {
    // Surface other npm ls errors
    console.error('Failed to run `npm ls`:', JSON.stringify(parsed, null, 2));
    process.exit(1);
  } else {
    json = parsed;
  }
} catch (e) {
  // When npm exits non-zero, try to parse stdout to detect the no-workspaces case
  const stdout = e?.stdout?.toString?.() || '';
  try {
    const parsed = JSON.parse(stdout);
    if (parsed?.error?.summary && /No workspaces found/i.test(parsed.error.summary)) {
      const singleOut = run('npm ls --all --json');
      json = JSON.parse(singleOut);
    } else {
      console.error('Failed to run `npm ls`:', stdout || e.message);
      process.exit(1);
    }
  } catch {
    console.error('Failed to run `npm ls`:', stdout || e.message);
    process.exit(1);
  }
}

let issues = [];

function walk(node, workspaceName) {
  if (!node) return;
  const name = node.name || workspaceName || 'root';

  // npm marks extraneous = true on nodes that are not in package.json
  if (node.extraneous) {
    issues.push(`[${name}] extraneous dependency: ${node.name}@${node.version || 'unknown'}`);
  }
  if (node.invalid) {
    issues.push(`[${name}] invalid dependency: ${node.name}@${node.version || 'unknown'}`);
  }

  const deps = node.dependencies || {};
  for (const depNode of Object.values(deps)) {
    walk(depNode, name);
  }
}

// Root may have a "dependencies" object with all nested workspaces and their deps.
walk(json);

if (issues.length) {
  console.error('Dependency verification failed:');
  for (const line of issues) console.error(' -', line);
  process.exit(2);
} else {
  console.log('Dependency verification passed: no extraneous/invalid deps detected across workspaces.');
}
