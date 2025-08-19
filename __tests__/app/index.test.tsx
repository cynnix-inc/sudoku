import React from 'react';
import { render, screen } from '@testing-library/react-native';
import IndexScreen from '../../app/index';

describe('IndexScreen', () => {
	it('renders welcome copy', () => {
		render(<IndexScreen />);
		expect(screen.getByText('Hello world')).toBeTruthy();
		expect(screen.getByText('Welcome to Ultimate Sudoku')).toBeTruthy();
	});

	it('has link to Classic screen', () => {
		render(<IndexScreen />);
		const link = screen.getByLabelText('Go to Classic');
		expect(link).toBeTruthy();
	});
});


