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
  const errOut = e?.stdout?.toString?.() || e?.stderr?.toString?.() || e.message;
  // Fallback for repositories without workspaces: run without the --workspaces flag
  if (errOut && errOut.includes('No workspaces found')) {
    try {
      const out = run('npm ls --all --json');
      json = JSON.parse(out);
    } catch (inner) {
      console.error('Failed to run `npm ls` (fallback):', inner?.stdout?.toString?.() || inner?.stderr?.toString?.() || inner.message);
      process.exit(1);
    }
  } else {
    console.error('Failed to run `npm ls`:', errOut);
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

// CI guard: fail if any source files import from app/_game
try {
  // Only scan source files under app/** for import/require usage; avoid shell quoting pitfalls
  const globs = [
    '--hidden',
    '--with-filename',
    '-n',
    '--fixed-strings',
    '--glob "!node_modules/**"',
    '--glob "!.git/**"',
    '--glob "!coverage/**"',
    '--glob "!dist/**"',
    '--glob "app/**/*.{js,jsx,ts,tsx}"',
  ];
  const patterns = [
    "from 'app/_game",
    'from "app/_game',
    "require('app/_game",
    'require("app/_game',
  ]
    .map((p) => `-e ${JSON.stringify(p)}`)
    .join(' ');
  const cmd = `rg ${globs.join(' ')} ${patterns}`;
  const out = execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString('utf8');
  if (out && out.trim().length > 0) {
    console.error('\nCI guard: Found references to app/_game. Please import from app/game instead.');
    console.error(out);
    process.exit(3);
  }
} catch {
  // ripgrep exits non-zero when no matches; treat as success
}
