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
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

// Provide a minimal window event API for tests that spy on addEventListener
// Node test env lacks window; this shim enables keyboard tests.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g: any = globalThis as any;
if (typeof g.window === 'undefined') {
  g.window = {};
}
if (typeof g.window.addEventListener !== 'function') {
  const listeners: Record<string, Array<(e: unknown) => void>> = {};
  g.window.addEventListener = (type: string, handler: (e: unknown) => void) => {
    listeners[type] = listeners[type] || [];
    listeners[type].push(handler);
  };
  g.window.removeEventListener = (type: string, handler: (e: unknown) => void) => {
    const arr = listeners[type];
    if (!arr) return;
    const idx = arr.indexOf(handler);
    if (idx !== -1) arr.splice(idx, 1);
  };
  g.window.dispatchEvent = (evt: { type: string }) => {
    const arr = listeners[evt.type] || [];
    for (const h of arr) h(evt);
    return true;
  };
}

// Silence console.warn from env guards in tests, but keep others
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args: unknown[]) => {
    const first = String(args[0] ?? '');
    if (first.includes('Supabase env is missing')) return;
    (originalWarn as (...args: unknown[]) => void)(...(args as unknown[]));
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
