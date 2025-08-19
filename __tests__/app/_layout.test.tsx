import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import RootLayout from '../../app/_layout';

describe('RootLayout', () => {
	it('renders text and allows theme toggle', () => {
		render(<RootLayout />);
		expect(screen.getByText('Hello world')).toBeTruthy();
		expect(screen.getByText('Welcome to Ultimate Sudoku')).toBeTruthy();
		// Toggle exists and can be pressed
		const toggle = screen.getByLabelText('Toggle color theme');
		fireEvent.press(toggle);
		// Index should include a Classic link rendered by nested route
		// Note: we only assert that label exists when Index is mounted within router
	});
});


