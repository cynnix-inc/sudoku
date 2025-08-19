import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Numpad from '../../app/components/Numpad';

describe('Numpad component', () => {
	it('renders digits and calls handlers', () => {
		const onDigit = jest.fn();
		const onToggleLock = jest.fn();
		render(<Numpad lockedDigit={null} onDigit={onDigit} onToggleLock={onToggleLock} />);
		const d5 = screen.getByLabelText('Digit 5');
		fireEvent.press(d5);
		expect(onDigit).toHaveBeenCalledWith(5);
		fireEvent(d5, 'onLongPress');
		expect(onToggleLock).toHaveBeenCalledWith(5);
	});
});


