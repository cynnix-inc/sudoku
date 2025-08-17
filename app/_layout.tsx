import React, { useMemo, useState } from "react";
import { Platform, useColorScheme, Pressable, Text, View } from "react-native";
 
if (Platform.OS === "web") {
	// Import Tailwind styles only on web
	require("./global.css");
}
const DARK_BG = "#0b0b0d";
const DARK_FG = "#e8e8ea";
const LIGHT_BG = "#ffffff";
const LIGHT_FG = "#111113";

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
	const systemScheme = useColorScheme();
	const [isDark, setIsDark] = useState<boolean>(systemScheme === "dark");

	const theme = useMemo<ThemeContextValue>(() => {
		return {
			isDark,
			background: isDark ? DARK_BG : LIGHT_BG,
			foreground: isDark ? DARK_FG : LIGHT_FG,
			toggle: () => setIsDark((prev) => !prev),
		};
	}, [isDark]);

	return (
		<ThemeContext.Provider value={theme}>
			<View style={{ flex: 1, backgroundColor: theme.background }}>
				<View style={{ padding: 20, alignItems: 'flex-end' }}>
					<Pressable
						onPress={theme.toggle}
						accessibilityRole="button"
						accessibilityLabel="Toggle color theme"
						style={{ paddingHorizontal: 12, paddingVertical: 6 }}
					>
						<Text style={{ color: theme.foreground, fontSize: 18 }}>
							{theme.isDark ? "☀️" : "🌙"}
						</Text>
					</Pressable>
				</View>
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
