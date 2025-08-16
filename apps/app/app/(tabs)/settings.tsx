import React from "react";
import { View, Switch, Pressable } from "react-native";
import { Text, useTheme } from "@ultimate-sudoku/ui";

export default function SettingsScreen(): JSX.Element {
	const { currentTheme, setTheme, resolvedColorScheme } = useTheme();
	const isDark = resolvedColorScheme === "dark";
	return (
		<View className="flex-1 items-center justify-center bg-background">
			<Text className="mb-4 text-xl font-semibold text-foreground">Settings</Text>
			<View className="flex-row items-center gap-3">
				<Text className="text-foreground">Dark Mode</Text>
				<Switch value={isDark} onValueChange={(v) => setTheme(v ? "dark" : "light")} />
			</View>
			{/* Quick theme picks */}
			<View className="mt-6 flex-row items-center gap-2">
				{(["light", "dark", "system"] as const).map((opt) => {
					const selected = currentTheme === opt;
					return (
						<Pressable
							key={opt}
							onPress={() => setTheme(opt)}
							android_ripple={{ color: "rgba(37,99,235,0.2)", borderless: false }}
							className={`px-3 py-2 rounded-md border ${
								selected ? "border-primary bg-primary/10" : "border-muted"
							} pressed:opacity-80`}
						>
							<Text className={`text-foreground ${selected ? "font-semibold" : ""}`}>{opt}</Text>
						</Pressable>
					);
				})}
			</View>
			<Text className="mt-2 text-muted">Theme: {currentTheme}</Text>
		</View>
	);
}


