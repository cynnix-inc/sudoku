module.exports = {
  preset: 'jest-expo',
  rootDir: '../../',
  testMatch: ['**/__tests__/bdd/**/*.steps.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@cucumber/.*|@cucumber|uuid/.*)',
  ],
  // Map uuid ESM builds to CJS where required by jest-cucumber/@cucumber packages
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid'),
  },
};
