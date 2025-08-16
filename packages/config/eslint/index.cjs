/* eslint-env node */
/** @type {import('eslint').Linter.Config} */
module.exports = {
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/stylistic",
		"prettier"
	],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "simple-import-sort", "import"],
	reportUnusedDisableDirectives: true,
	rules: {
		"@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
		"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
		"@typescript-eslint/explicit-module-boundary-types": "error",
		"simple-import-sort/imports": "error",
		"simple-import-sort/exports": "error",
		"import/order": ["error", { "newlines-between": "always" }]
	},
	overrides: [
		{
			files: ["**/*.js", "**/*.cjs"],
			rules: { "@typescript-eslint/no-var-requires": "off" }
		},
		{
			files: ["packages/ui/src/components/**/*.tsx"],
			rules: {
				"import/no-default-export": "error"
			}
		}
	]
};


