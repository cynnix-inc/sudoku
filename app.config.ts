import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
	name: "Ultimate Sudoku",
	slug: "ultimate-sudoku",
	scheme: "ultimate-sudoku",
	ios: {
		bundleIdentifier: "com.ultimatesudoku.app",
	},
	android: {
		package: "com.ultimatesudoku.app",
	},
	experiments: {
		typedRoutes: true,
	},
};

export default config;
