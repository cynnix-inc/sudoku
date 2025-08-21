/* eslint-env jest */
import React from 'react';
import { render } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen blur listener when window.addEventListener missing', () => {
  it('does not throw if window.addEventListener is missing', () => {
    const g = globalThis as unknown as { window?: unknown };
    const original = g.window;
    // Provide a window object without addEventListener
    (g as unknown as { window: Record<string, unknown> }).window = {};
    expect(() => render(<ClassicScreen />)).not.toThrow();
    // Restore
    (g as unknown as { window?: unknown }).window = original;
  });
});
