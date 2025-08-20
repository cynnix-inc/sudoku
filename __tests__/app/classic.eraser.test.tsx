import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen eraser', () => {
    it('erases value and notes from selected cell', () => {
        render(<ClassicScreen />);
        // Select a cell and place a value
        const cell12 = screen.getByLabelText('Cell 1,2');
        fireEvent.press(cell12);
        fireEvent.press(screen.getByLabelText('Digit 7'));
        expect(cell12).toHaveTextContent('7');
        // Erase value
        fireEvent.press(screen.getByLabelText('Erase cell'));
        expect(cell12).toHaveTextContent('');
        // Add notes then erase
        const notesToggle = screen.getByLabelText('Enable notes mode');
        fireEvent.press(notesToggle);
        fireEvent.press(screen.getByLabelText('Digit 1'));
        fireEvent.press(screen.getByLabelText('Digit 2'));
        const notesEl = screen.getByTestId('cell-1-2-notes');
        expect(notesEl).toHaveTextContent('12');
        fireEvent.press(screen.getByLabelText('Erase cell'));
        expect(cell12).toHaveTextContent('');
    });
});

