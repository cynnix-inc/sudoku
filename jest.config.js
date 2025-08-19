module.exports = {
	preset: "jest-expo",
	setupFilesAfterEnv: [
		"@testing-library/jest-native/extend-expect",
		"<rootDir>/jest.setup.ts"
	],
	transformIgnorePatterns: [
		"node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base)",
	],
	testPathIgnorePatterns: [
		"/node_modules/",
		"/__tests__/utils/",
		"/__tests__/bdd/"
	],
	collectCoverage: true,
	coverageThreshold: {
		global: {
			statements: 80,
			branches: 68,
			functions: 70,
			lines: 80,
		},
	},
};
