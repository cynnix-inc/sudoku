import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@ultimate-sudoku/ui$': '<rootDir>/../..//packages/ui/src',
    '^@sentry/react-native$': '<rootDir>/__mocks__/empty.js',
    '^@react-native/js-polyfills/.*$': '<rootDir>/__mocks__/empty.js',
    '^react-native$': '<rootDir>/../..//packages/ui/__mocks__/react-native.tsx',
    // Ignore style and asset imports in tests
    '\\\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/empty.js',
    '\\\\.(png|jpg|jpeg|gif|webp|svg)$': '<rootDir>/__mocks__/empty.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(nativewind|tailwind-merge)/)'
  ],
  testEnvironment: 'jsdom',
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

export default config;


