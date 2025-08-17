const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

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
			},
		},
	},
];
