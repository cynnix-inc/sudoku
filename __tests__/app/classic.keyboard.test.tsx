import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import ClassicScreen from '../../app/classic';
import { __TEST_ONLY__clearProgress } from '../../app/services/storage';

describe('ClassicScreen keyboard', () => {
  it('handles arrow keys, digits, N toggle, and Backspace on web', async () => {
    __TEST_ONLY__clearProgress('sudoku-progress');
    const originalOS = Platform.OS;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Platform as any).OS = 'web';

    try {
      let saved: ((e: { key: string }) => void) | null = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(window, 'addEventListener').mockImplementation(((type: string, handler: any) => {
        if (type === 'keydown') saved = handler as (e: { key: string }) => void;
      }) as unknown as typeof window.addEventListener);

      render(<ClassicScreen />);
      const cell12 = screen.getByLabelText('Cell 1,2');
      fireEvent.press(cell12);

      act(() => {
        if (saved) saved({ key: '7' });
      });
      expect(cell12).toHaveTextContent('7');

      act(() => {
        if (saved) saved({ key: 'n' });
        if (saved) saved({ key: '3' });
      });
      await waitFor(() => expect(screen.getByTestId('cell-1-2-notes')).toBeTruthy());
      const notesEl = screen.getByTestId('cell-1-2-notes');
      expect(notesEl).toHaveTextContent('3');

      act(() => {
        if (saved) saved({ key: 'Backspace' });
      });
      expect(cell12).toHaveTextContent('');

      act(() => {
        if (saved) saved({ key: 'ArrowRight' });
        if (saved) saved({ key: '7' });
      });
      const cell13 = screen.getByLabelText('Cell 1,3');
      expect(cell13).toHaveTextContent('7');
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Platform as any).OS = originalOS;
    }
  });
});

describe('ClassicScreen keyboard preventDefault on web', () => {
  it('calls preventDefault for handled keys, including when target is interactive', () => {
    const originalOS = Platform.OS;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Platform as any).OS = 'web';

    try {
      let keyHandler: (e: {
        key: string;
        preventDefault: jest.Mock;
        target: { tagName: string };
        ctrlKey?: boolean;
        metaKey?: boolean;
        altKey?: boolean;
        shiftKey?: boolean;
      }) => void = (() => {}) as unknown as (e: {
        key: string;
        preventDefault: jest.Mock;
        target: { tagName: string };
        ctrlKey?: boolean;
        metaKey?: boolean;
        altKey?: boolean;
        shiftKey?: boolean;
      }) => void;
      // Capture the keydown listener registered by ClassicScreen
      jest.spyOn(window, 'addEventListener').mockImplementation(((
        type: string,
        handler: unknown,
      ) => {
        if (type === 'keydown' && typeof handler === 'function')
          keyHandler = handler as typeof keyHandler;
      }) as unknown as typeof window.addEventListener);

      render(<ClassicScreen />);

      const mkEvt = (overrides: Partial<{
        key: string;
        preventDefault: jest.Mock;
        target: { tagName: string };
        ctrlKey?: boolean;
        metaKey?: boolean;
        altKey?: boolean;
        shiftKey?: boolean;
      }> = {}) => ({
        key: 'ArrowDown',
        preventDefault: jest.fn(),
        target: { tagName: 'DIV' },
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        ...overrides,
      });

      const cases: Array<Record<string, unknown>> = [
        { key: 'ArrowUp' },
        { key: 'ArrowDown' },
        { key: 'ArrowLeft' },
        { key: 'ArrowRight' },
        { key: '1' },
        { key: '9' },
        { key: 'Backspace' },
        { key: 'n' },
        { key: 'Tab' },
        { key: ' ' },
        { key: 'r', ctrlKey: true },
        { key: 'w', ctrlKey: true },
        { key: 'f', ctrlKey: true },
        { key: 'p', ctrlKey: true },
        { key: 's', ctrlKey: true },
        // Interactive target (e.g., input)
        { key: 'Backspace', target: { tagName: 'INPUT' } },
      ];

      for (const cfg of cases) {
        const evt = mkEvt(cfg as Partial<{
          key: string;
          preventDefault: jest.Mock;
          target: { tagName: string };
          ctrlKey?: boolean;
          metaKey?: boolean;
          altKey?: boolean;
          shiftKey?: boolean;
        }>);
        keyHandler(evt);
        expect(evt.preventDefault).toHaveBeenCalled();
      }
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Platform as any).OS = originalOS;
      (window.addEventListener as unknown as jest.SpyInstance)?.mockRestore?.();
    }
  });
});

describe('ClassicScreen web shortcuts prevention', () => {
  it('prevents default for common browser shortcuts', () => {
    const originalOS = Platform.OS;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Platform as any).OS = 'web';
    try {
      const addSpy = jest.spyOn(window, 'addEventListener');
      let keyHandler:
        | ((e: {
            key: string;
            preventDefault?: () => void;
            ctrlKey?: boolean;
            metaKey?: boolean;
          }) => void)
        | null = null;
      addSpy.mockImplementation(((type: string, listener: unknown) => {
        if (type === 'keydown' && typeof listener === 'function') {
          keyHandler = listener as typeof keyHandler extends infer T ? T : never;
        }
        return undefined as unknown as void;
      }) as unknown as typeof window.addEventListener);

      render(<ClassicScreen />);

      const prevented: string[] = [];
      const mkEvt = (key: string, ctrl = false, meta = false) => ({
        key,
        ctrlKey: ctrl,
        metaKey: meta,
        preventDefault: () => prevented.push(key),
      });

      act(() => {
        keyHandler?.(mkEvt('r', true, false));
        keyHandler?.(mkEvt('R', false, true));
        keyHandler?.(mkEvt('w', true, false));
        keyHandler?.(mkEvt('f', true, false));
        keyHandler?.(mkEvt('p', true, false));
        keyHandler?.(mkEvt('s', true, false));
        keyHandler?.(mkEvt('Tab', false, false));
        keyHandler?.(mkEvt(' ', false, false));
      });

      expect(prevented).toEqual(
        expect.arrayContaining(['r', 'R', 'w', 'f', 'p', 's', 'Tab', ' ']),
      );

      (window.addEventListener as unknown as jest.SpyInstance).mockRestore();
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Platform as any).OS = originalOS;
    }
  });
});
