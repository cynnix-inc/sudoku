import React from 'react';
import { jest } from '@jest/globals';

// Mock expo-system-ui to avoid touching real system UI in tests
jest.mock('expo-system-ui', () => ({
	setBackgroundColorAsync: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-safe-area-context SafeAreaView as a plain View
jest.mock('react-native-safe-area-context', () => {
	const React = require('react');
	const { View } = require('react-native');
	return {
		SafeAreaView: View,
		SafeAreaProvider: ({ children }: { children: React.ReactNode }) => React.createElement(View, null, children),
		useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
	};
});

// Silence console.warn from env guards in tests, but keep others
const originalWarn = console.warn;
beforeAll(() => {
	console.warn = (...args: unknown[]) => {
		const first = String(args[0] ?? '');
		if (first.includes('Supabase env is missing')) return;
		(originalWarn as (...args: unknown[]) => void)(...args as unknown[]);
	};
});

afterAll(() => {
	console.warn = originalWarn;
});


