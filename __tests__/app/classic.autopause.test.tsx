/* eslint-env jest */
import React from 'react';
import { render, screen, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import ClassicScreen from '../../app/classic';

jest.useFakeTimers();

describe('ClassicScreen auto-pause on visibility', () => {
  it('pauses when document becomes hidden (web)', () => {
    // Capture visibility change listener added by the component
    let visibilityHandler: ((e?: unknown) => void) | null = null;
    jest.spyOn(document, 'addEventListener').mockImplementation(((
      type: string,
      listener: unknown,
    ) => {
      if (type === 'visibilitychange' && typeof listener === 'function') {
        visibilityHandler = listener as (e?: unknown) => void;
      }
      // No-op for other listeners; test will invoke captured handler directly
      return undefined as unknown as void;
    }) as unknown as typeof document.addEventListener);

    render(<ClassicScreen />);
    // Run the timer a bit
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    const beforeNode = screen.getByLabelText('Elapsed time') as unknown as {
      props?: { children?: unknown };
    };
    const before = Array.isArray(beforeNode?.props?.children)
      ? (beforeNode.props!.children as unknown[]).join('')
      : String(beforeNode?.props?.children ?? '');

    // Simulate hidden and call captured handler
    (document as unknown as { hidden?: boolean }).hidden = true;
    act(() => {
      if (visibilityHandler) visibilityHandler({ type: 'visibilitychange' });
      jest.advanceTimersByTime(2000);
    });

    const afterNode = screen.getByLabelText('Elapsed time') as unknown as {
      props?: { children?: unknown };
    };
    const after = Array.isArray(afterNode?.props?.children)
      ? (afterNode.props!.children as unknown[]).join('')
      : String(afterNode?.props?.children ?? '');
    expect(after).toBe(before);

    // Simulate window blur path; time should remain paused
    let blurHandler: ((e?: unknown) => void) | null = null;
    jest.spyOn(window, 'addEventListener').mockImplementation(((
      type: string,
      listener: unknown,
    ) => {
      if (type === 'blur' && typeof listener === 'function')
        blurHandler = listener as (e?: unknown) => void;
      return undefined as unknown as void;
    }) as unknown as typeof window.addEventListener);
    act(() => {
      if (blurHandler) blurHandler({});
      jest.advanceTimersByTime(2000);
    });
    const afterBlurNode = screen.getByLabelText('Elapsed time') as unknown as {
      props?: { children?: unknown };
    };
    const afterBlur = Array.isArray(afterBlurNode?.props?.children)
      ? (afterBlurNode.props!.children as unknown[]).join('')
      : String(afterBlurNode?.props?.children ?? '');
    expect(afterBlur).toBe(before);
    (window.addEventListener as unknown as jest.SpyInstance).mockRestore();

    // Restore original addEventListener
    (document.addEventListener as unknown as jest.SpyInstance).mockRestore();
  });

  it('does not pause when visibilitychange fires but hidden is undefined', () => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (document as any).hidden;
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

  it('does not throw if window.addEventListener is missing', () => {
    const g = globalThis as unknown as { window?: unknown };
    const original = g.window;
    // Provide a window object without addEventListener
    (g as unknown as { window: Record<string, unknown> }).window = {};
    expect(() => render(<ClassicScreen />)).not.toThrow();
    // Restore
    (g as unknown as { window?: unknown }).window = original;
  });

  it('does not throw if document.addEventListener is missing', () => {
    const g = globalThis as unknown as { document?: unknown };
    const original = g.document;
    // Provide a document object without addEventListener
    (g as unknown as { document: { hidden?: boolean } }).document = { hidden: false };
    expect(() => render(<ClassicScreen />)).not.toThrow();
    // Restore
    (g as unknown as { document?: unknown }).document = original;
  });

  it('pauses when AppState changes to background (native path)', () => {
    let changeHandler: ((state: unknown) => void) | null = null;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((
      type: unknown,
      handler: unknown,
    ) => {
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
