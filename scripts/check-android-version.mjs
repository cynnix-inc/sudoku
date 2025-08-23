#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function readJson(filePath) {
  try {
    const contents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(contents);
  } catch (error) {
    console.error(`Failed to read JSON: ${filePath}`);
    console.error(error.message);
    process.exit(2);
  }
}

function computeAndroidVersionCode(versionString) {
  const base = (versionString || '0.0.0').split('-')[0];
  const parts = base.split('.').map((n) => Number.parseInt(n, 10) || 0);
  const major = parts[0] ?? 0;
  const minor = parts[1] ?? 0;
  const patch = parts[2] ?? 0;
  return major * 10000 + minor * 100 + patch;
}

function readGradleVersionCode(gradlePath) {
  try {
    const contents = fs.readFileSync(gradlePath, 'utf8');
    const match = contents.match(/\bversionCode\s+(\d+)/);
    if (!match) {
      console.error(`versionCode not found in ${gradlePath}`);
      process.exit(2);
    }
    return Number.parseInt(match[1], 10);
  } catch (error) {
    console.error(`Failed to read Gradle file: ${gradlePath}`);
    console.error(error.message);
    process.exit(2);
  }
}

const repoRoot = process.cwd();
const pkgPath = path.join(repoRoot, 'package.json');
const gradlePath = path.join(repoRoot, 'android', 'app', 'build.gradle');

// If there is no Android project, skip the check (useful for web-only CI environments)
if (!fs.existsSync(gradlePath)) {
  console.log(`Android project not found at ${gradlePath}. Skipping Android version check.`);
  process.exit(0);
}

const pkg = readJson(pkgPath);
const version = pkg.version || '0.0.0';
const expectedCode = computeAndroidVersionCode(version);
const actualCode = readGradleVersionCode(gradlePath);

if (expectedCode !== actualCode) {
  console.error(
    `Android versionCode mismatch. Expected ${expectedCode} from package.json version ${version}, but found ${actualCode} in android/app/build.gradle.\n` +
      'Fix by syncing native files: npx expo prebuild -p android --non-interactive'
  );
  process.exit(1);
}

console.log(
  `Android versionCode OK: ${actualCode} matches computed ${expectedCode} from package.json version ${version}`
);
