/* eslint-env jest */
import React from 'react';
import { render } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen visibility listeners when not available', () => {
  it('does not throw if document.addEventListener is missing', () => {
    const g = globalThis as unknown as { document?: unknown };
    const original = g.document;
    // Provide a document object without addEventListener
    (g as unknown as { document: { hidden?: boolean } }).document = { hidden: false };
    expect(() => render(<ClassicScreen />)).not.toThrow();
    // Restore
    (g as unknown as { document?: unknown }).document = original;
  });
});
