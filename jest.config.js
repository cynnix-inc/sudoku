const isEpicPr = process.env['EPIC_PR'] === '1';
const headRef = process.env['GITHUB_HEAD_REF'] || '';
const baseRef = process.env['GITHUB_BASE_REF'] || '';
const isEpicContext = isEpicPr || headRef.startsWith('epic/') || baseRef.startsWith('epic/');

// For release/staging merge housekeeping PRs, do not enforce global coverage thresholds.
// These PRs are intended to synchronize branches and should not be blocked by coverage.
const isReleaseMergeContext =
  headRef.startsWith('chore/staging-merge') ||
  headRef.startsWith('chore/release') ||
  headRef === 'staging' ||
  baseRef === 'staging';

const shouldEnforceCoverage = !(isEpicContext || isReleaseMergeContext);
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', '<rootDir>/jest.setup.ts'],
  // Only run files explicitly marked as tests to avoid picking up helper files in __tests__
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@cucumber/.*|@cucumber|uuid/.*)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/utils/',
    '/__tests__/bdd/',
    '/__tests__/fixtures/',
  ],
  collectCoverage: shouldEnforceCoverage,
  coverageThreshold: shouldEnforceCoverage
    ? undefined
    : {
        global: {
          statements: 85,
          branches: 80,
          functions: 85,
          lines: 85,
        },
      },
};
