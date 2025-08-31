/* eslint-env node */
const headRef = process.env.GITHUB_HEAD_REF || '';
const baseRef = process.env.GITHUB_BASE_REF || '';
const isEpic = headRef.startsWith('epic/') || baseRef.startsWith('epic/');

/**
 * On epic/* branches, relax strictness to unblock iterative hardening PRs.
 * Everywhere else, enforce conventional commits strictly.
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: isEpic
    ? {
        // Relax to warnings or disable in epic context to prevent CI failures on long-running workstreams
        'type-enum': [1, 'always', ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test', 'Merge', 'CI']],
        'type-case': [0],
        'subject-case': [1, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
        'header-max-length': [1, 'always', 120],
        'footer-max-line-length': [1, 'always', 200],
        'subject-empty': [1, 'never'],
        'type-empty': [1, 'never'],
      }
    : {
        'type-enum': [2, 'always', ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test']],
        'type-case': [2, 'always', 'lower-case'],
        'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
        'header-max-length': [2, 'always', 100],
        'footer-max-line-length': [2, 'always', 100],
        'subject-empty': [2, 'never'],
        'type-empty': [2, 'never'],
      },
};


