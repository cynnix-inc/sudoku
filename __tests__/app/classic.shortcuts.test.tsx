import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Platform } from 'react-native';
import ClassicScreen from '../../app/classic';

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

      expect(prevented).toEqual(expect.arrayContaining(['r', 'R', 'w', 'f', 'p', 's', 'Tab', ' ']));

      (window.addEventListener as unknown as jest.SpyInstance).mockRestore();
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Platform as any).OS = originalOS;
    }
  });
});
