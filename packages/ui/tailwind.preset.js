/** @type {import('tailwindcss').Config} */
module.exports = {
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: {
				background: {
					DEFAULT: '#0B0B0C',
					light: '#FFFFFF',
					dark: '#0B0B0C',
				},
				foreground: {
					DEFAULT: '#111827',
					light: '#111827',
					dark: '#F3F4F6',
				},
				primary: {
					DEFAULT: '#2563EB',
					contrast: '#FFFFFF',
				},
				muted: {
					DEFAULT: '#6B7280',
					dark: '#9CA3AF',
				},
				success: { DEFAULT: '#16A34A', contrast: '#FFFFFF' },
				warn: { DEFAULT: '#D97706', contrast: '#111827' },
				error: { DEFAULT: '#DC2626', contrast: '#FFFFFF' },
			},
			borderRadius: {
				xs: '6px',
				sm: '8px',
				md: '12px',
				lg: '16px',
				xl: '24px',
				'2xl': '32px',
				full: '9999px',
			},
			fontSize: {
				xs: ['12px', { lineHeight: '16px' }],
				sm: ['14px', { lineHeight: '20px' }],
				base: ['16px', { lineHeight: '24px' }],
				lg: ['18px', { lineHeight: '28px' }],
				xl: ['20px', { lineHeight: '28px' }],
				'2xl': ['24px', { lineHeight: '32px' }],
				'3xl': ['30px', { lineHeight: '36px' }],
				'4xl': ['36px', { lineHeight: '40px' }],
				'5xl': ['48px', { lineHeight: '1' }],
				'6xl': ['60px', { lineHeight: '1' }],
				// Sudoku numerals
				'sudoku-sm': ['24px', { lineHeight: '28px' }],
				'sudoku': ['32px', { lineHeight: '36px' }],
				'sudoku-lg': ['40px', { lineHeight: '44px' }],
				'sudoku-xl': ['48px', { lineHeight: '52px' }],
				'sudoku-2xl': ['56px', { lineHeight: '60px' }],
			},
		},
	},
	darkMode: ['class', '[data-theme=dark]'],
};


