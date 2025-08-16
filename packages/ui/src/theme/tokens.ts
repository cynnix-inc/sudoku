export const spacing = {
	0: 0,
	0.5: 2,
	1: 4,
	1.5: 6,
	2: 8,
	2.5: 10,
	3: 12,
	3.5: 14,
	4: 16,
	5: 20,
	6: 24,
	7: 28,
	8: 32,
	9: 36,
	10: 40,
	11: 44,
	12: 48,
	14: 56,
	16: 64,
	20: 80,
	24: 96,
	28: 112,
	32: 128,
	36: 144,
	40: 160,
} as const;

export const radii = {
	none: 0,
	xs: 6,
	sm: 8,
	md: 12,
	lg: 16,
	xl: 24,
	"2xl": 32,
	full: 9999,
} as const;

export const durations = {
	instant: 0,
	fast: 100,
	moderate: 200,
	slow: 300,
	"very-slow": 500,
} as const;

// Accessible palette designed for WCAG AA+ contrast in light and dark
export const colors = {
	// Surfaces
	background: {
		DEFAULT: "#0B0B0C", // dark
		light: "#FFFFFF",
		dark: "#0B0B0C",
	},
	foreground: {
		DEFAULT: "#111827", // slate-900
		light: "#111827",
		dark: "#F3F4F6", // gray-100
	},
	// Brand
	primary: {
		DEFAULT: "#2563EB", // blue-600
		contrast: "#FFFFFF",
	},
	// Secondary text / borders
	muted: {
		DEFAULT: "#6B7280", // gray-500
		dark: "#9CA3AF", // gray-400
	},
	// States
	success: { DEFAULT: "#16A34A", contrast: "#FFFFFF" },
	warn: { DEFAULT: "#D97706", contrast: "#111827" },
	error: { DEFAULT: "#DC2626", contrast: "#FFFFFF" },
} as const;

export const fontSizes = {
	xs: 12,
	sm: 14,
	base: 16,
	lg: 18,
	xl: 20,
	"2xl": 24,
	"3xl": 30,
	"4xl": 36,
	"5xl": 48,
	"6xl": 60,
	// Sudoku numerals for legibility in grid cells
	"sudoku-sm": 24,
	"sudoku": 32,
	"sudoku-lg": 40,
	"sudoku-xl": 48,
	"sudoku-2xl": 56,
} as const;

export type Tokens = {
	spacing: typeof spacing;
	radii: typeof radii;
	durations: typeof durations;
	colors: typeof colors;
	fontSizes: typeof fontSizes;
};

export const tokens: Tokens = {
	spacing,
	radii,
	durations,
	colors,
	fontSizes,
};


