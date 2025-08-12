#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readAppVersion() {
  const p = path.resolve(process.cwd(), 'src/version.js');
  const src = fs.readFileSync(p, 'utf8');
  const m = src.match(/APP_VERSION\s*=\s*'([^']+)'/);
  if (!m) throw new Error('APP_VERSION not found in src/version.js');
  return m[1];
}

function syncServiceWorker(version) {
  const swPath = path.resolve(process.cwd(), 'service-worker.js');
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const VERSION = '[^']+';/, `const VERSION = 'v${version}';`);
  fs.writeFileSync(swPath, sw);
  console.log(`[sw] Synced service-worker VERSION to v${version}`);
}

try {
  const v = readAppVersion();
  syncServiceWorker(v);
} catch (e) {
  console.error('[sw] sync failed:', e.message);
  process.exit(1);
}
