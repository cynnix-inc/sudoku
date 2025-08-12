// Generates env.js from .env for the static frontend.
// Best practice: keep .env out of source control; commit .env.example instead.

const fs = require('fs');
const path = require('path');

function parseDotEnv(contents) {
  const result = {};
  const lines = contents.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const envPath = path.join(projectRoot, '.env');
  const outPath = path.join(projectRoot, 'env.js');
  const pkgPath = path.join(projectRoot, 'package.json');

  let env = {};
  if (fs.existsSync(envPath)) {
    const contents = fs.readFileSync(envPath, 'utf8');
    env = parseDotEnv(contents);
  } else {
    console.log('No .env found. Generating env.js with defaults and APP_VERSION only.');
  }

  const supabaseUrl = env.SUPABASE_URL || '';
  const supabaseAnonKey = env.SUPABASE_ANON_KEY || '';
  let appVersion = '';
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    appVersion = pkg && pkg.version ? String(pkg.version) : '';
  } catch {}

  const js = `// Generated from .env. Do not commit secrets; .env is gitignored.\n` +
            `(function(){\n` +
            `  try {\n` +
            `    window.SUPABASE_URL = ${JSON.stringify(supabaseUrl)};\n` +
            `    window.SUPABASE_ANON_KEY = ${JSON.stringify(supabaseAnonKey)};\n` +
            `    window.APP_VERSION = ${JSON.stringify(appVersion)};\n` +
            `  } catch {}\n` +
            `})();\n`;

  fs.writeFileSync(outPath, js, 'utf8');
  console.log('Generated env.js');
}

main();


