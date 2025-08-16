import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, ColorSchemeName, View, useColorScheme } from "react-native";

export type Theme = "light" | "dark" | "system";

type ThemeStorage = {
	get: () => Promise<Theme | null | undefined>;
	set: (theme: Theme) => Promise<void>;
};

type ThemeContextValue = {
	currentTheme: Theme;
	resolvedColorScheme: Exclude<ColorSchemeName, null>;
	setTheme: (theme: Theme) => void;
};

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storage?: ThemeStorage;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children, defaultTheme = "system", storage }: ThemeProviderProps): JSX.Element {
	const system = useColorScheme() ?? "light";
	const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);
	const resolved: Exclude<ColorSchemeName, null> = currentTheme === "system" ? system : currentTheme;

	// Follow OS changes when using system theme
	useEffect(() => {
		const sub = Appearance.addChangeListener(({ colorScheme }) => {
			if (currentTheme === "system" && colorScheme) {
				setCurrentTheme("system");
			}
		});
		return () => sub.remove();
	}, [currentTheme]);

	// Load saved preference
	useEffect(() => {
		let cancelled = false;
		if (!storage) return;
		(async () => {
			try {
				const saved = await storage.get();
				if (!cancelled && saved) setCurrentTheme(saved);
			} catch {
				// ignore
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [storage]);

	const setTheme = useCallback(
		(theme: Theme) => {
			setCurrentTheme(theme);
			if (storage) storage.set(theme).catch(() => {});
		},
		[storage],
	);

	const value = useMemo<ThemeContextValue>(
		() => ({ currentTheme, resolvedColorScheme: resolved, setTheme }),
		[currentTheme, resolved, setTheme],
	);

	return (
		<ThemeContext.Provider value={value}>
			<View className={resolved === "dark" ? "dark" : undefined}>{children}</View>
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
}


