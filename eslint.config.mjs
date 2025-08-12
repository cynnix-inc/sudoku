// ESLint flat config (v9+) - ESM file
import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'after-used', ignoreRestSiblings: true }],
      'no-undef': 'error',
      eqeqeq: ['warn', 'always', { null: 'ignore' }],
      curly: ['warn', 'multi-line'],
      'max-depth': ['warn', 4],
      complexity: ['warn', 15],
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-useless-escape': 'warn',
    },
  },
  {
    files: ['src/**/*.js'],
    rules: {
      'max-lines': ['warn', { max: 350, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['warn', { max: 80, skipBlankLines: true, skipComments: true }],
      complexity: ['warn', 12],
    },
  },
  {
    files: ['script.js'],
    rules: {
      'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['warn', { max: 120, skipBlankLines: true, skipComments: true }],
    },
  },
  // Node-based tooling
  {
    files: ['tools/**/*.js', 'jest.config.cjs', 'playwright.config.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-undef': 'off',
    },
  },
  // Service worker environment
  {
    files: ['service-worker.js'],
    languageOptions: {
      globals: { ...globals.serviceworker },
    },
  },
  {
    files: ['tests/**/*'],
    languageOptions: { globals: { ...globals.jest, ...globals.browser } },
    rules: { 'no-undef': 'off', 'no-empty': ['warn', { allowEmptyCatch: true }] },
  },
];


