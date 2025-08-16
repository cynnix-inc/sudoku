#!/usr/bin/env node
import { statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { execSync } from 'node:child_process';

/**
 * Fails CI if a NEW component/page under watched dirs lacks a matching test file.
 * Watched: packages/ui/src/components, apps/app/app/(tabs)
 * Only checks files ADDED in the current PR/commit range.
 */

const WATCH_DIRS = [
  { root: 'packages/ui/src/components', exts: ['.tsx'] },
  { root: 'apps/app/app/(tabs)', exts: ['.tsx', '.ts'] },
];

function hasTestFor(root, filePath) {
  const rel = relative(root, filePath).replace(/\\/g, '/');
  const withoutExt = rel.replace(/\.[^.]+$/, '');
  const candidates = [
    join(root, '__tests__', `${withoutExt}.test.ts`),
    join(root, '__tests__', `${withoutExt}.test.tsx`),
    join(root, `${withoutExt}.test.ts`),
    join(root, `${withoutExt}.test.tsx`),
    join(process.cwd(), 'apps/app/__tests__', `${withoutExt.split('/').pop()}.test.ts`),
    join(process.cwd(), 'apps/app/__tests__', `${withoutExt.split('/').pop()}.test.tsx`),
  ];
  return candidates.some((c) => {
    try {
      return statSync(c).isFile();
    } catch {
      return false;
    }
  });
}

function getAddedFiles() {
  try {
    // In CI, use GitHub's provided SHA values
    if (process.env.GITHUB_SHA && process.env.GITHUB_BASE_SHA) {
      const diff = execSync(`git diff --name-only --diff-filter=A ${process.env.GITHUB_BASE_SHA}...${process.env.GITHUB_SHA}`, { encoding: 'utf8' });
      return diff.split('\n').filter(Boolean);
    }
    
    // Prefer PR base for local development
    const base = process.env.GITHUB_BASE_REF || 'origin/main';
    execSync('git fetch --depth=1 origin +refs/heads/*:refs/remotes/origin/*', { stdio: 'ignore' });
    const diff = execSync(`git diff --name-only --diff-filter=A ${base}...HEAD`, { encoding: 'utf8' });
    return diff.split('\n').filter(Boolean);
  } catch (error) {
    // Fallback: no-op, but log the error for debugging
    console.warn('Warning: Could not determine added files:', error.message);
    return [];
  }
}

const addedFiles = new Set(getAddedFiles());
const missing = [];

for (const { root, exts } of WATCH_DIRS) {
  for (const file of addedFiles) {
    if (!file.startsWith(root + '/')) continue;
    if (!exts.includes(extname(file))) continue;
    if (/\/(?:index|_layout|\+html|\+not-found)\.[^.]+$/.test(file)) continue;
    if (!hasTestFor(root, file)) missing.push(file);
  }
}

if (missing.length) {
  console.error('\u274c Missing tests for newly added files:\n' + missing.map((m) => ` - ${m}`).join('\n'));
  process.exit(1);
}
console.log('\u2705 Test presence check passed for new files.');


