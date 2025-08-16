declare const process: {
	env: Record<string, string | undefined> & {
		EXPO_PUBLIC_SENTRY_DSN?: string;
		EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE?: string;
		EXPO_PUBLIC_SENTRY_DEBUG?: string;
		EXPO_PUBLIC_APP_ENV?: string;
	};
};


