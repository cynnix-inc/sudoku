/* eslint-env node */
/** @type {import('eslint').Linter.Config} */
module.exports = {
	extends: ["@ultimate-sudoku/config/eslint"],
	root: true,
	overrides: [
		{
			files: ["src/components/**/*.tsx"],
			rules: { "import/no-default-export": "error" }
		}
	]
};


