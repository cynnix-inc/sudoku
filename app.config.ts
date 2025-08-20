import type { ExpoConfig } from 'expo/config';
import pkg from './package.json';

const versionString = (pkg as { version?: string }).version ?? '0.0.0';
const baseVersion = versionString.split('-')[0] ?? '0.0.0';
const versionParts = baseVersion.split('.').map((n) => Number.parseInt(n, 10) || 0);
const major = versionParts[0] ?? 0;
const minor = versionParts[1] ?? 0;
const patch = versionParts[2] ?? 0;

const androidVersionCode = major * 10000 + minor * 100 + patch;
const iosBuildNumber = String(androidVersionCode);

const config: ExpoConfig = {
  name: 'Ultimate Sudoku',
  slug: 'ultimate-sudoku',
  scheme: 'ultimate-sudoku',
  version: pkg.version,
  userInterfaceStyle: 'automatic',
  androidStatusBar: {
    backgroundColor: '#0b0b0d',
    barStyle: 'light-content',
  },
  ios: {
    bundleIdentifier: 'com.ultimatesudoku.app',
    buildNumber: iosBuildNumber,
  },
  android: {
    package: 'com.ultimatesudoku.app',
    userInterfaceStyle: 'automatic',
    versionCode: androidVersionCode,
  },
  experiments: {
    typedRoutes: true,
  },
};

export default config;
