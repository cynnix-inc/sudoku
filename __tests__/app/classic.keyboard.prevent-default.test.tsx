/* eslint-env jest */
import React from 'react';
import { render } from '@testing-library/react-native';
import { Platform } from 'react-native';
import ClassicScreen from '../../app/classic';

type TestKeyEvent = {
  key: string;
  preventDefault: jest.Mock;
  target: { tagName: string };
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
};

describe('ClassicScreen keyboard preventDefault on web', () => {
  it('calls preventDefault for handled keys, including when target is interactive', () => {
    const originalOS = Platform.OS;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Platform as any).OS = 'web';

    try {
      let keyHandler: (e: TestKeyEvent) => void = () => {};
      // Capture the keydown listener registered by ClassicScreen
      jest.spyOn(window, 'addEventListener').mockImplementation(((
        type: string,
        handler: unknown,
      ) => {
        if (type === 'keydown' && typeof handler === 'function')
          keyHandler = handler as (e: TestKeyEvent) => void;
      }) as unknown as typeof window.addEventListener);

      render(<ClassicScreen />);

      const mkEvt = (overrides: Partial<TestKeyEvent> = {}): TestKeyEvent => ({
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
        const evt = mkEvt(cfg as Partial<TestKeyEvent>);
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
