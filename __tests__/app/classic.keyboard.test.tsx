import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen keyboard', () => {
    it('handles arrow keys, digits, N toggle, and Backspace on web', () => {
        // JSDOM simulates web
        render(<ClassicScreen />);
        const cell12 = screen.getByLabelText('Cell 1,2');
        fireEvent.press(cell12);
        // Digit
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '7' }));
        expect(cell12).toHaveTextContent('7');
        // N toggle
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }));
        const notesEl = screen.getByTestId('cell-1-2-notes');
        expect(notesEl).toHaveTextContent('3');
        // Backspace erase
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
        expect(cell12).toHaveTextContent('');
        // Arrows move selection
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '7' }));
        const cell13 = screen.getByLabelText('Cell 1,3');
        expect(cell13).toHaveTextContent('7');
    });
});

