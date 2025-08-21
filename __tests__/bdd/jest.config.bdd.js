module.exports = {
  preset: 'jest-expo',
  rootDir: '../../',
  testMatch: ['**/__tests__/bdd/**/*.steps.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    // Allow ESM packages used by jest-cucumber to be transformed
    'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@cucumber/.*|uuid)',
  ],
};
