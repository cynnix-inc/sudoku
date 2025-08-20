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
