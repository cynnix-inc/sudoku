module.exports = {
	preset: "jest-expo",
	setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
	transformIgnorePatterns: [
		"node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base)",
	],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
  },
};
