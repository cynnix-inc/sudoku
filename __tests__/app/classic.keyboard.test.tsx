import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen keyboard', () => {
    it('handles arrow keys, digits, N toggle, and Backspace on web', () => {
        let saved: ((e: { key: string }) => void) | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn(window, 'addEventListener').mockImplementation(((type: string, handler: any) => {
            if (type === 'keydown') saved = handler as (e: { key: string }) => void;
        }) as unknown as typeof window.addEventListener);

        render(<ClassicScreen />);
        const cell12 = screen.getByLabelText('Cell 1,2');
        fireEvent.press(cell12);
        // Digit
        saved && saved({ key: '7' });
        expect(cell12).toHaveTextContent('7');
        // N toggle
        saved && saved({ key: 'n' });
        saved && saved({ key: '3' });
        const notesEl = screen.getByTestId('cell-1-2-notes');
        expect(notesEl).toHaveTextContent('3');
        // Backspace erase
        saved && saved({ key: 'Backspace' });
        expect(cell12).toHaveTextContent('');
        // Arrows move selection
        saved && saved({ key: 'ArrowRight' });
        saved && saved({ key: '7' });
        const cell13 = screen.getByLabelText('Cell 1,3');
        expect(cell13).toHaveTextContent('7');
    });
});