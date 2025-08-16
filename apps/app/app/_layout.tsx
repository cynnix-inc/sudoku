import { DarkTheme, DefaultTheme, ThemeProvider as RNThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";
import { AppThemeProvider } from "../providers/theme-provider";
import { withSentry } from "../lib/sentry";

function RootLayoutComponent(): JSX.Element {
	const scheme = useColorScheme();
	return (
		<AppThemeProvider>
			<RNThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
				<Stack>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen name="about" options={{ title: "About" }} />
				</Stack>
			</RNThemeProvider>
		</AppThemeProvider>
	);
}

const RootLayout = withSentry(RootLayoutComponent);
export default RootLayout;


