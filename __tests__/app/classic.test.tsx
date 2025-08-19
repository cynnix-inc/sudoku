import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen', () => {
	it('renders heading and copy', () => {
		render(<ClassicScreen />);
		expect(screen.getByText('Classic')).toBeTruthy();
		expect(screen.getByText('9×9 Classic Sudoku')).toBeTruthy();
	});
});



