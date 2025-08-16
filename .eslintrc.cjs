/* eslint-env node */
/** @type {import('eslint').Linter.Config} */
module.exports = {
	extends: ["@ultimate-sudoku/config/eslint"],
	root: true,
	overrides: [
		{
			files: ["**/*.test.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],
			env: { jest: true },
		},
	],
};


