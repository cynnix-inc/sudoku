// Added Prettier integration at the end to disable stylistic rules that conflict with Prettier.
// Also preserved existing TypeScript + JS recommended settings.
// Behavior remains the same aside from delegating formatting concerns to Prettier.
const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const prettier = require("eslint-config-prettier");

module.exports = [
	{
		ignores: [
			"node_modules/**",
			"dist/**",
			"build/**",
			"web-build/**",
			".expo/**",
			"**/*.d.ts",
		],
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
			"@typescript-eslint/consistent-type-imports": [
				"warn",
				{ prefer: "type-imports", fixStyle: "inline-type-imports" },
			],
			"sort-imports": [
				"warn",
				{
					ignoreCase: true,
					ignoreDeclarationSort: false,
					ignoreMemberSort: false,
					allowSeparatedGroups: true,
				},
			],
			"no-console": ["error", { allow: ["warn", "error"] }],
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							group: ["**/_game/**", "**/../_game/**", "**/../../_game/**"],
							message:
								"Do not import from app/_game; use app/game as the canonical module.",
						},
					],
				},
			],
		},
	},

	// Typed linting for selected TS sources only
	{
		files: ["app/**/*.{ts,tsx}", "scripts/**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				projectService: true,
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
		},
		rules: {
			"@typescript-eslint/no-floating-promises": [
				"warn",
				{ ignoreVoid: true, ignoreIIFE: true },
			],
		},
	},

	// UI boundaries (warnings) for screens/components
	{
		files: [
			"app/*.screen.tsx",
			"app/components/**/*.{ts,tsx}",
		],
		rules: {
			"no-restricted-imports": [
				"warn",
				{
					paths: [
						{
							name: "app/services/storage",
							message:
								"UI should not import storage directly; prefer a container/hook boundary.",
						},
						{
							name: "app/services/supabase",
							message:
								"UI should not import Supabase/network directly; prefer a container/hook boundary.",
						},
						{
							name: "app/services/sync",
							message:
								"UI should not import network sync directly; prefer a container/hook boundary.",
						},
					],
					patterns: [
						{
							group: [
								"app/services/storage*",
								"app/services/supabase*",
								"app/services/sync*",
							],
							message:
								"UI should not import storage/network services directly.",
						},
					],
				},
			],
		},
	},

	// Tests
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
		rules: {
			"no-console": "off",
		},
	},

	// Tooling/configs/scripts
	{
		files: [
			"*.config.js",
			"**/*.config.js",
			"*.config.cjs",
			"**/*.config.cjs",
			"babel.config.js",
			"jest.config.js",
			"**/jest.config.*.js",
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
