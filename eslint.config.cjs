// Added Prettier integration at the end to disable stylistic rules that conflict with Prettier.
// Also preserved existing TypeScript + JS recommended settings.
// Behavior remains the same aside from delegating formatting concerns to Prettier.
const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const prettier = require("eslint-config-prettier");

module.exports = [
	{
		ignores: ["node_modules/**", "dist/**", "build/**", "web-build/**"],
	},
	js.configs.recommended,
	{
		files: ["**/*.{ts,tsx}", "app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				ecmaFeatures: { jsx: true },
			},
			globals: {
				// Browser + RN
				window: "readonly",
				document: "readonly",
				require: "readonly",
				// Node
				module: "readonly",
				process: "readonly",
				console: "readonly",
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
		},
		rules: {
			...tsPlugin.configs.recommended.rules,
			"@typescript-eslint/no-require-imports": "off",
		},
	},
	{
		files: ["**/__tests__/**/*.{ts,tsx,js,jsx}", "jest.setup.ts"],
		languageOptions: {
			globals: {
				describe: "readonly",
				it: "readonly",
				expect: "readonly",
				beforeAll: "readonly",
				afterAll: "readonly",
				jest: "readonly",
			},
		},
	},
	{
		files: [
			"*.config.js",
			"babel.config.js",
			"jest.config.js",
			"tailwind.config.js",
			"scripts/**/*.mjs",
		],
		languageOptions: {
			globals: {
				module: "readonly",
				require: "readonly",
				process: "readonly",
				console: "readonly",
				__dirname: "readonly",
			},
		},
	},
	// Prettier should be last to disable conflicting rules
	prettier,
];
