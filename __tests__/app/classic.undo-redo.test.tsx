import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen undo/redo', () => {
    it('undoes and redoes moves', () => {
        render(<ClassicScreen />);
        const cell12 = screen.getByLabelText('Cell 1,2');
        fireEvent.press(cell12);
        fireEvent.press(screen.getByLabelText('Digit 4'));
        expect(cell12).toHaveTextContent('4');
        fireEvent.press(screen.getByLabelText('Undo move'));
        expect(cell12).toHaveTextContent('');
        fireEvent.press(screen.getByLabelText('Redo move'));
        expect(cell12).toHaveTextContent('4');
    });
});

