/* eslint-env jest */
import React from 'react';
import { render, screen, act } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';
import { AppState } from 'react-native';

jest.useFakeTimers();

describe('ClassicScreen auto-pause on AppState (native path)', () => {
  it('pauses when AppState changes to background', () => {
    let changeHandler: ((state: unknown) => void) | null = null;
    jest
      .spyOn(AppState, 'addEventListener')

      .mockImplementation(((type: unknown, handler: unknown) => {
        if (type === 'change' && typeof handler === 'function') {
          changeHandler = handler as (state: unknown) => void;
        }
        return { remove: () => {} } as unknown as ReturnType<typeof AppState.addEventListener>;
      }) as unknown as typeof AppState.addEventListener);

    render(<ClassicScreen />);
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    const beforeNode = screen.getByLabelText('Elapsed time') as unknown as {
      props?: { children?: unknown };
    };
    const before = Array.isArray(beforeNode?.props?.children)
      ? (beforeNode.props!.children as unknown[]).join('')
      : String(beforeNode?.props?.children ?? '');

    act(() => {
      if (changeHandler) changeHandler('background');
      jest.advanceTimersByTime(2000);
    });

    const afterNode = screen.getByLabelText('Elapsed time') as unknown as {
      props?: { children?: unknown };
    };
    const after = Array.isArray(afterNode?.props?.children)
      ? (afterNode.props!.children as unknown[]).join('')
      : String(afterNode?.props?.children ?? '');
    expect(after).toBe(before);

    (AppState.addEventListener as unknown as jest.SpyInstance).mockRestore();
  });
});
