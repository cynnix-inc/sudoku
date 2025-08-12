#!/usr/bin/env node
/*
  Sync the service worker cache VERSION with the release or package version.
  Usage: node tools/update-sw-version.js [version]
*/
const fs = require('fs');
const path = require('path');

function main() {
  const root = process.cwd();
  const swPath = path.join(root, 'service-worker.js');
  const pkgPath = path.join(root, 'package.json');

  const argVersion = process.argv[2] && String(process.argv[2]).trim();
  let version = argVersion;
  if (!version) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      version = pkg.version;
    } catch {}
  }
  if (!version) version = '0.0.0';

  const tag = `v${version}`;
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const VERSION = 'v[^']*';/g, `const VERSION = '${tag}';`);
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log(`Synced service-worker VERSION -> ${tag}`);
}

try { main(); } catch (e) { console.error(e); process.exit(1); }


