import React, { useEffect, useMemo, useState } from "react";
import { Platform, useColorScheme, Pressable, Text, View, Appearance } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
 
if (Platform.OS === "web") {
	// Import Tailwind styles only on web
	require("./global.css");
}
const DARK_BG = "#0b0b0d";
const DARK_FG = "#e8e8ea";
const LIGHT_BG = "#ffffff";
const LIGHT_FG = "#111113";

// Pre-render: set Android/system background ASAP to avoid light flash on dark devices
try {
	const initialScheme = Appearance.getColorScheme?.() ?? null;
	const initialPreferred = initialScheme === "dark" ? "dark" : initialScheme === "light" ? "light" : "dark";
	SystemUI.setBackgroundColorAsync(initialPreferred === "dark" ? DARK_BG : LIGHT_BG).catch(() => {});
} catch {}

export type ThemeContextValue = {
	isDark: boolean;
	background: string;
	foreground: string;
	toggle: () => void;
};

export const ThemeContext = React.createContext<ThemeContextValue>({
	isDark: false,
	background: LIGHT_BG,
	foreground: LIGHT_FG,
	toggle: () => {},
});

export default function RootLayout() {
	const scheme = useColorScheme();
	const preferred = scheme === "dark" ? "dark" : scheme === "light" ? "light" : "dark";
	const osScheme = Appearance.getColorScheme?.() ?? null;
	const [themeName, setThemeName] = useState<"light" | "dark">(
		osScheme === "dark" ? "dark" : osScheme === "light" ? "light" : preferred
	);

	// If system changes (or first Android render resolves), sync the theme
	useEffect(() => {
		setThemeName(preferred);
	}, [preferred]);

	const theme = useMemo<ThemeContextValue>(() => {
		const isDark = themeName === "dark";
		return {
			isDark,
			background: isDark ? DARK_BG : LIGHT_BG,
			foreground: isDark ? DARK_FG : LIGHT_FG,
			toggle: () => {
				setThemeName((prev) => (prev === "light" ? "dark" : "light"));
			},
		};
	}, [themeName]);

	// Keep Android/system background in sync to avoid flash
	useEffect(() => {
		SystemUI.setBackgroundColorAsync(theme.background).catch(() => {});
	}, [theme.background]);

	return (
		<ThemeContext.Provider value={theme}>
			<View style={{ flex: 1, backgroundColor: theme.background }}>
				<StatusBar style={theme.isDark ? "light" : "dark"} />
				<SafeAreaView edges={["top"]} style={{ paddingHorizontal: 20, paddingTop: 12 }}>
					<View style={{ alignItems: 'flex-end' }}>
						<Pressable
							onPress={theme.toggle}
							accessibilityRole="button"
							accessibilityLabel="Toggle color theme"
							style={{ paddingHorizontal: 12, paddingVertical: 6 }}
							hitSlop={10}
						>
							<Text style={{ color: theme.foreground, fontSize: 18 }}>
								{theme.isDark ? "☀️" : "🌙"}
							</Text>
						</Pressable>
					</View>
				</SafeAreaView>
				<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
					<Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 8, color: theme.foreground }}>
						Hello world
					</Text>
					<Text style={{ fontSize: 16, opacity: 0.7, color: theme.foreground }}>
						Welcome to Ultimate Sudoku
					</Text>
				</View>
			</View>
		</ThemeContext.Provider>
	);
}
