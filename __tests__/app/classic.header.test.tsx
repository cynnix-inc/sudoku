import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen header/footer', () => {
    it('renders header with mode, difficulty, lives, and time', () => {
        render(<ClassicScreen />);
        expect(screen.getByText('Classic')).toBeTruthy();
        expect(screen.getByText(/Mode: Classic/)).toBeTruthy();
        expect(screen.getByLabelText('Elapsed time')).toBeTruthy();
        expect(screen.getByLabelText('Lives remaining')).toBeTruthy();
    });
});

