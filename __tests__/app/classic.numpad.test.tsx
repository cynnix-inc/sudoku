import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen + Numpad integration', () => {
  it('places a digit on selected cell and supports lock', () => {
    render(<ClassicScreen />);
    // Choose a non-given cell (1,2), then place 7
    const cell12 = screen.getByLabelText('Cell 1,2');
    fireEvent.press(cell12);
    const d7 = screen.getByLabelText('Digit 7');
    fireEvent.press(d7);
    expect(cell12).toHaveTextContent('7');
    // Lock 3 via long press, select another cell and ensure placement applies on select
    const d3 = screen.getByLabelText('Digit 3');
    fireEvent(d3, 'onLongPress');
    const target = screen.getByLabelText('Cell 1,3');
    fireEvent.press(target);
    expect(target).toHaveTextContent('3');
  });

  it('renders digits 1..9 (single-row visual policy covered in docs)', () => {
    render(<ClassicScreen />);
    for (let i = 1; i <= 9; i++) {
      expect(screen.getByLabelText(`Digit ${i}`)).toBeTruthy();
    }
  });
});
