import "react-native-gesture-handler";
import "react-native-url-polyfill/auto";
import "expo-router/entry";
import * as Linking from "expo-linking";
import { supabase } from "./lib/supabase";
import { initSentry, addBreadcrumb } from "./lib/sentry";

// Handle OAuth redirects from providers via deep links
async function handleInitialUrl() {
	const url = await Linking.getInitialURL();
	if (url) {
		try {
			await supabase.auth.exchangeCodeForSession(url);
		} catch {}
	}
}

initSentry();
handleInitialUrl();

Linking.addEventListener("url", ({ url }: { url: string }) => {
	addBreadcrumb({ category: "deep-link", message: url, level: "info" });
	void supabase.auth.exchangeCodeForSession(url).catch(() => {});
});


