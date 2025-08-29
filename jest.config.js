const isEpicPr = process.env['EPIC_PR'] === '1';

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', '<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@cucumber/.*|@cucumber|uuid/.*)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/utils/',
    '/__tests__/bdd/',
    '/__tests__/fixtures/',
  ],
  collectCoverage: !isEpicPr,
  coverageThreshold: isEpicPr
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
