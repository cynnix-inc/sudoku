import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { makeRedirectUri } from "expo-auth-session";

type AppExtra = {
	appEnv?: string;
	supabaseUrl?: string;
	supabaseAnonKey?: string;
};

const extra = (Constants?.expoConfig?.extra ?? {}) as AppExtra;

if (!extra.supabaseUrl || !extra.supabaseAnonKey) {
	// Intentionally silent; values will be empty in example envs.
}

export const supabase = createClient(extra.supabaseUrl ?? "", extra.supabaseAnonKey ?? "", {
	auth: {
		storage: AsyncStorage,
		autoRefreshToken: true,
		persistSession: true,
		flowType: "pkce",
		// We handle code exchange via Linking in index.ts
		detectSessionInUrl: false,
	},
});

export function getOAuthRedirectUri(): string {
	return makeRedirectUri({
		scheme: "ultimate-sudoku",
		isTripleSlashed: true,
		preferLocalhost: true,
	});
}

export async function signInWithProvider(
	provider: "github" | "google" | "apple" | "discord",
): Promise<unknown> {
	return supabase.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: getOAuthRedirectUri(),
			scopes: "email profile",
		},
	});
}

export type FeatureFlag = {
	key: string;
	value: unknown;
	enabled: boolean;
};


