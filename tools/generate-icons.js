#!/usr/bin/env node
/*
  Generates placeholder PNG icons if missing.
  These are minimal 1x1 PNGs just to satisfy manifest/apple requirements until real assets are added.
*/
const fs = require('fs');
const path = require('path');

const ensureDir = (p) => { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); };

// 1x1 transparent PNG base64 (very small)
const PNG_1x1_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';

function writeIcon(relPath) {
  const outPath = path.resolve(process.cwd(), relPath);
  ensureDir(path.dirname(outPath));
  if (fs.existsSync(outPath)) {
    console.log(`[icons] Exists, skipping: ${relPath}`);
    return;
  }
  fs.writeFileSync(outPath, Buffer.from(PNG_1x1_BASE64, 'base64'));
  console.log(`[icons] Wrote placeholder: ${relPath}`);
}

writeIcon('icons/icon-192.png');
writeIcon('icons/icon-512.png');
