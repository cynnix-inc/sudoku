const headRef = process.env['GITHUB_HEAD_REF'] || '';
const baseRef = process.env['GITHUB_BASE_REF'] || '';
const isEpicContext =
  process.env['EPIC_PR'] === '1' || headRef.startsWith('epic/') || baseRef.startsWith('epic/');

module.exports = {
  preset: 'jest-expo',
  rootDir: '../../',
  // On epic PRs, explicitly match nothing to avoid Jest default patterns scanning non-test files
  testMatch: isEpicContext ? ['^$'] : ['**/__tests__/bdd/**/*.steps.ts'],
  testRegex: isEpicContext ? 'a^' : undefined,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@cucumber/.*|@cucumber|uuid/.*)',
  ],
  // Map uuid ESM builds to CJS where required by jest-cucumber/@cucumber packages
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid'),
  },
};
