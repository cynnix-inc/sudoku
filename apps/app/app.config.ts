declare const process: { env: Record<string, string | undefined> };
// App config reads environment variables from the shell/EAS. No dotenv import here.

const PROJECT_ID = process.env.EAS_PROJECT_ID ?? "00000000-0000-0000-0000-000000000000"; // placeholder

export default () => ({
	name: "Ultimate Sudoku",
	slug: "ultimate-sudoku",
	version: "0.1.0",
	orientation: "portrait",
	userInterfaceStyle: "automatic",
	assetBundlePatterns: ["**/*"],
	plugins: ["expo-router"],
	scheme: "ultimate-sudoku",
	extra: {
		eas: {
			projectId: PROJECT_ID,
			channel: process.env.EAS_CHANNEL ?? "development",
		},
		appEnv: process.env.APP_ENV ?? "development",
		// Public envs get exposed through expo to the app runtime
		sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? "",
		sentryTracesSampleRate: process.env.EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? "0",
		supabaseUrl: process.env.SUPABASE_URL ?? "",
		supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
	},
	updates: {
		url: `https://u.expo.dev/${PROJECT_ID}`,
	},
	runtimeVersion: {
		policy: "sdkVersion",
	},
	ios: {
		supportsTablet: true,
	},
	android: {
		permissions: [],
	},
	web: {
		bundler: "metro"
	},
});


