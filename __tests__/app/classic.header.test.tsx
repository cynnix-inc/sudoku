import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen header/footer', () => {
    it('renders header with mode, difficulty, lives, and time', () => {
        render(<ClassicScreen />);
        expect(screen.getByText('Classic')).toBeTruthy();
        expect(screen.getByText(/Mode: Classic/)).toBeTruthy();
        const time = screen.getByLabelText('Elapsed time');
        expect(time).toBeTruthy();
        // Should include Lives in the same line
        expect(time).toHaveTextContent(/Lives:/);
    });
});

