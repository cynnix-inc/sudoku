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
        fireEvent.keyDown(window, { key: '7' });
        expect(cell12).toHaveTextContent('7');
        // N toggle
        fireEvent.keyDown(window, { key: 'n' });
        fireEvent.keyDown(window, { key: '3' });
        const notesEl = screen.getByTestId('cell-1-2-notes');
        expect(notesEl).toHaveTextContent('3');
        // Backspace erase
        fireEvent.keyDown(window, { key: 'Backspace' });
        expect(cell12).toHaveTextContent('');
        // Arrows move selection
        fireEvent.keyDown(window, { key: 'ArrowRight' });
        fireEvent.keyDown(window, { key: '7' });
        const cell13 = screen.getByLabelText('Cell 1,3');
        expect(cell13).toHaveTextContent('7');
    });
});

