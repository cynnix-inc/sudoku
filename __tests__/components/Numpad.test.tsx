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

  it('renders single-row numpad aligned to grid width', () => {
    render(<Numpad lockedDigit={null} onDigit={jest.fn()} onToggleLock={jest.fn()} />);
    const row = screen.getByTestId('numpad-row');
    expect(row.props.style.flexDirection).toBe('row');
    expect(row.props.style.width).toBe(36 * 9 + 2 * 6);
  });
});
