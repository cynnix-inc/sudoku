import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
	name: "Ultimate Sudoku",
	slug: "ultimate-sudoku",
	scheme: "ultimate-sudoku",
	userInterfaceStyle: "automatic",
	androidStatusBar: {
		backgroundColor: "#0b0b0d",
		barStyle: "light-content",
	},
	ios: {
		bundleIdentifier: "com.ultimatesudoku.app",
	},
	android: {
		package: "com.ultimatesudoku.app",
		userInterfaceStyle: "automatic",
	},
	experiments: {
		typedRoutes: true,
	},
};

export default config;
