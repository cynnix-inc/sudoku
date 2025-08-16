#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT_DIR = resolve(process.cwd());
const README_PATH = resolve(ROOT_DIR, 'README.md');
const ROOT_PACKAGE_JSON_PATH = resolve(ROOT_DIR, 'package.json');
const APP_EAS_JSON_PATH = resolve(ROOT_DIR, 'apps', 'app', 'eas.json');

const MARKER_SCRIPTS_START = '<!-- AUTOGEN: SCRIPTS -->';
const MARKER_EAS_START = '<!-- AUTOGEN: EAS-CHANNELS -->';
const MARKER_END = '<!-- /AUTOGEN -->';

function sanitizeInline(text) {
  return String(text ?? '').replace(/\r?\n/g, ' ').trim();
}

function renderScriptsTable(scripts) {
  const seen = new Set();
  const entries = Object.entries(scripts || {})
    .filter(([name]) => {
      if (name === 'prepare') return false;
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    })
    .sort(([a], [b]) => a.localeCompare(b));

  if (entries.length === 0) return '_No scripts found_';

  const header = ['| Script | Command |', '| --- | --- |'];
  const rows = entries.map(([name, command]) => `| \`${name}\` | ${sanitizeInline(command)} |`);
  return [...header, ...rows].join('\n');
}

function renderEasChannels(easJson) {
  const profiles = easJson && typeof easJson === 'object' ? easJson.build || {} : {};
  const entries = Object.entries(profiles).sort(([a], [b]) => a.localeCompare(b));
  if (entries.length === 0) return '_No EAS build profiles found_';

  const header = ['| Profile | Channel | Distribution | Dev Client |', '| --- | --- | --- | --- |'];
  const rows = entries.map(([profile, cfg]) => {
    const channel = sanitizeInline(cfg?.channel || '');
    const distribution = sanitizeInline(cfg?.distribution || '');
    const devClient = cfg?.developmentClient ? 'yes' : '';
    return `| \`${profile}\` | ${channel} | ${distribution} | ${devClient} |`;
  });
  return [...header, ...rows].join('\n');
}

function replaceSection(fullText, startMarker, newBody) {
  const startIdx = fullText.indexOf(startMarker);
  if (startIdx === -1) throw new Error(`Missing marker: ${startMarker}`);
  const from = startIdx + startMarker.length;
  const endIdx = fullText.indexOf(MARKER_END, from);
  if (endIdx === -1) throw new Error(`Missing end marker after ${startMarker}`);
  const before = fullText.slice(0, startIdx);
  const after = fullText.slice(endIdx);
  return `${before}${startMarker}\n${newBody}\n${after}`;
}

async function main() {
  const [readme, pkgRaw, easRaw] = await Promise.all([
    readFile(README_PATH, 'utf8'),
    readFile(ROOT_PACKAGE_JSON_PATH, 'utf8'),
    readFile(APP_EAS_JSON_PATH, 'utf8').catch(() => null),
  ]);

  const pkg = JSON.parse(pkgRaw);
  const eas = easRaw ? JSON.parse(easRaw) : {};

  const scriptsTable = renderScriptsTable(pkg.scripts || {});
  const easTable = renderEasChannels(eas);

  let updated = readme;
  updated = replaceSection(updated, MARKER_SCRIPTS_START, scriptsTable);
  updated = replaceSection(updated, MARKER_EAS_START, easTable);

  if (updated !== readme) {
    await writeFile(README_PATH, updated, 'utf8');
    process.stdout.write('README.md updated\n');
  } else {
    process.stdout.write('README.md already up to date\n');
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


