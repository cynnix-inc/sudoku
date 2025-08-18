#!/usr/bin/env node
/**
 * verify-deps.mjs
 * Checks all workspaces for missing/extraneous dependencies using `npm ls --workspaces --json`.
 * Exits non-zero if issues found. No external deps required.
 */
import { execSync } from 'node:child_process';

function runAllowError(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString('utf8');
  } catch (e) {
    const stdout = e?.stdout?.toString?.();
    if (stdout && stdout.trim().length > 0) return stdout;
    throw e;
  }
}

let json;
try {
  let out = runAllowError('npm ls --workspaces --all --json');
  let parsed = JSON.parse(out || '{}');
  const summary = parsed?.error?.summary || '';
  if (summary.includes('No workspaces found')) {
    out = runAllowError('npm ls --all --json');
    parsed = JSON.parse(out || '{}');
  }
  json = parsed;
} catch (e) {
  const stdout = e?.stdout?.toString?.() || e.message;
  console.error('Failed to run `npm ls`:', stdout);
  process.exit(1);
}

let issues = [];

function walk(node, workspaceName, depKey) {
  if (!node) return;
  const name = node.name || depKey || workspaceName || 'root';

  // npm marks extraneous = true on nodes that are not in package.json
  if (node.extraneous) {
    issues.push(`[${name}] extraneous dependency: ${name}@${node.version || 'unknown'}`);
  }
  if (node.invalid) {
    // Ignore known peer mismatch noise: nativewind/react-native-css-interop expects tailwindcss ~3
    const invalidReason = typeof node.invalid === 'string' ? node.invalid : '';
    const isKnownTailwindPeerMismatch =
      name === 'tailwindcss' && invalidReason.includes('react-native-css-interop');
    if (!isKnownTailwindPeerMismatch) {
      issues.push(`[${name}] invalid dependency: ${name}@${node.version || 'unknown'}${invalidReason ? ` (${invalidReason})` : ''}`);
    }
  }

  const deps = node.dependencies || {};
  for (const [childKey, depNode] of Object.entries(deps)) {
    walk(depNode, name, childKey);
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
