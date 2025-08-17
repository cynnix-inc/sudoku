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
  const out = run('npm ls --workspaces --all --json');
  json = JSON.parse(out);
} catch (e) {
  console.error('Failed to run `npm ls`:', e?.stdout?.toString?.() || e.message);
  process.exit(1);
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
  for (const [, depNode] of Object.entries(deps)) {
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
