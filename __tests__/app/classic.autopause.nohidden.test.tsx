/* eslint-env jest */
import React from 'react';
import { render, screen, act } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

jest.useFakeTimers();

describe('ClassicScreen visibilitychange with no document.hidden', () => {
  it('does not pause when visibilitychange fires but hidden is undefined', () => {
    // Capture visibility handler
    let visibilityHandler: ((e?: unknown) => void) | null = null;
    jest.spyOn(document, 'addEventListener').mockImplementation(((
      type: string,
      listener: unknown,
    ) => {
      if (type === 'visibilitychange' && typeof listener === 'function') {
        visibilityHandler = listener as (e?: unknown) => void;
      }
      return undefined as unknown as void;
    }) as unknown as typeof document.addEventListener);

    render(<ClassicScreen />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    const beforeNode = screen.getByLabelText('Elapsed time') as unknown as {
      props?: { children?: unknown };
    };
    const before = String(beforeNode?.props?.children ?? '');

    // Ensure hidden is undefined
    delete (document as unknown as { hidden?: boolean }).hidden;
    act(() => {
      if (visibilityHandler) visibilityHandler({ type: 'visibilitychange' });
      jest.advanceTimersByTime(2000);
    });

    const afterNode = screen.getByLabelText('Elapsed time') as unknown as {
      props?: { children?: unknown };
    };
    const after = String(afterNode?.props?.children ?? '');
    expect(after).not.toBe(before);

    (document.addEventListener as unknown as jest.SpyInstance).mockRestore();
  });
});
