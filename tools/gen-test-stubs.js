#!/usr/bin/env node
/*
 Generates Jest test TODO stubs for new public methods on SudokuGame.
 - Scans script.js for methods declared on class SudokuGame
 - Compares with tools/known-methods.json
 - Appends test.todo stubs to tests/unit/sudoku.auto.test.js for any new methods
 - Updates tools/known-methods.json
*/
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'script.js');
const KNOWN = path.join(ROOT, 'tools', 'known-methods.json');
const OUT = path.join(ROOT, 'tests', 'unit', 'sudoku.auto.test.js');

function read(file) { return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''; }

function extractMethods(source) {
  // Naive parse of class SudokuGame body and method names.
  const startIdx = source.indexOf('class SudokuGame');
  if (startIdx === -1) return [];
  const braceStart = source.indexOf('{', startIdx);
  if (braceStart === -1) return [];
  // Scan forward and roughly capture until export end
  const body = source.slice(braceStart + 1);
  const methodRegex = /^\s*([a-zA-Z_$][\w$]*)\s*\(/gm;
  const ignore = new Set(['constructor']);
  const methods = new Set();
  let m;
  while ((m = methodRegex.exec(body))) {
    const name = m[1];
    // Filter likely non-method matches by excluding control keywords and nested function names attached to consts
    if (ignore.has(name)) continue;
    // crude filter: skip names that look like 'if' 'for' etc, or are likely nested function names like requestAnimationFrame callback
    if (/^(if|for|while|switch|try|catch|finally|return)$/.test(name)) continue;
    // Also skip single-underscore private helpers if desired; include all for coverage
    methods.add(name);
  }
  return Array.from(methods);
}

function loadKnown(file) {
  try { return JSON.parse(read(file) || '[]'); } catch { return []; }
}

function saveKnown(file, arr) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(arr.sort(), null, 2) + '\n');
}

function ensureTestFileHeader(file) {
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, "const exported = require('../../script.js');\nconst SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;\n\ndescribe('Sudoku auto-generated stubs', () => {\n});\n");
  }
}

function appendTodos(file, methodNames) {
  let content = read(file);
  const insertPoint = content.lastIndexOf('});');
  if (insertPoint === -1) return; // malformed
  const before = content.slice(0, insertPoint);
  const after = content.slice(insertPoint);
  const lines = [];
  methodNames.forEach((name) => {
    const todoLine = `  test.todo('${name} behavior');`;
    if (!content.includes(todoLine)) lines.push(todoLine);
  });
  if (lines.length) {
    const next = `${before}${lines.join('\n')}\n${after}`;
    fs.writeFileSync(file, next);
  }
}

function main() {
  const src = read(SRC);
  if (!src) {
    console.error('script.js not found.');
    process.exit(0);
  }
  const methods = extractMethods(src);
  const known = new Set(loadKnown(KNOWN));
  const newOnes = methods.filter((m) => !known.has(m));
  if (!newOnes.length) {
    console.log('No new methods to stub.');
    return;
  }
  ensureTestFileHeader(OUT);
  appendTodos(OUT, newOnes);
  // Update known list
  const union = Array.from(new Set([...known, ...methods]));
  saveKnown(KNOWN, union);
  console.log(`Added ${newOnes.length} test todo stub(s): ${newOnes.join(', ')}`);
}

main();



