import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen notes mode', () => {
    it('toggles notes mode and enters notes instead of values', () => {
        render(<ClassicScreen />);
        // Select a clear cell
        const cell12 = screen.getByLabelText('Cell 1,2');
        fireEvent.press(cell12);
        // Enable notes mode
        const notesToggle = screen.getByLabelText('Enable notes mode');
        fireEvent.press(notesToggle);
        // Enter digits 1 and 3 as notes
        fireEvent.press(screen.getByLabelText('Digit 1'));
        fireEvent.press(screen.getByLabelText('Digit 3'));
        // Expect notes to render (joined as small text)
        const notesEl = screen.getByTestId('cell-1-2-notes');
        expect(notesEl).toHaveTextContent('13');
        // Disable notes mode, placing should now set value
        const notesDisable = screen.getByLabelText('Disable notes mode');
        fireEvent.press(notesDisable);
        fireEvent.press(screen.getByLabelText('Digit 5'));
        expect(cell12).toHaveTextContent('5');
    });
});

