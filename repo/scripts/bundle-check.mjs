#!/usr/bin/env node
/* eslint-env node */
/**
 * scripts/bundle-check.mjs
 * Compares built bundle sizes in ./dist to previous baseline in ./dist-baseline (or a JSON file).
 * Fails if any delta > 5%.
 * Intended for CI enforcement of bundle budgets.
 */

import fs from 'fs';
import path from 'path';

const DIST_DIR = './dist';
const BASELINE_FILE = './dist/bundle-baseline.json';

function getSizes(dir) {
  if (!fs.existsSync(dir)) return {};
  const files = fs.readdirSync(dir);
  let sizes = {};
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isFile()) {
      sizes[file] = fs.statSync(full).size;
    }
  }
  return sizes;
}

const currentSizes = getSizes(DIST_DIR);
let baseline = {};
if (fs.existsSync(BASELINE_FILE)) {
  try {
    baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
  } catch (e) {
    console.error('Could not parse baseline JSON:', e.message);
  }
}

// Compare
let failed = false;
for (const [file, size] of Object.entries(currentSizes)) {
  const base = baseline[file];
  if (base) {
    const delta = (size - base) / base;
    if (delta > 0.05) {
      console.error(`Bundle size regression: ${file} grew ${(delta*100).toFixed(1)}% (${base} -> ${size} bytes)`);
      failed = true;
    } else {
      console.log(`OK: ${file} (${size} bytes, delta ${(delta*100).toFixed(1)}%)`);
    }
  } else {
    console.warn(`No baseline for ${file}. Size=${size}`);
  }
}

if (failed) {
  process.exit(3);
}

// Optionally update baseline if env var set
if (process.env.UPDATE_BUNDLE_BASELINE === '1') {
  fs.writeFileSync(BASELINE_FILE, JSON.stringify(currentSizes, null, 2));
  console.log('Updated baseline at', BASELINE_FILE);
}
