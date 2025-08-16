import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider, Theme } from "@ultimate-sudoku/ui";

const STORAGE_KEY = "theme.preference";

export function AppThemeProvider({ children }: { children: React.ReactNode }): JSX.Element {
	return (
		<ThemeProvider
			defaultTheme="system"
			storage={{
				get: async () => {
					try {
						const raw = await AsyncStorage.getItem(STORAGE_KEY);
						return (raw as Theme) ?? undefined;
					} catch {
						return undefined;
					}
				},
				set: async (theme) => {
					try {
						await AsyncStorage.setItem(STORAGE_KEY, theme);
					} catch {
						// ignore persistence failure
					}
				},
			}}
		>
			{children}
		</ThemeProvider>
	);
}


