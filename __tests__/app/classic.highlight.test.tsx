import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen highlight same digit (#115)', () => {
  it('highlights same digits when selecting a cell with a value', () => {
    render(<ClassicScreen />);
    // Place 6 at (1,2) and (1,3), then selecting one highlights both borders and numpad key
    const cell12 = screen.getByLabelText('Cell 1,2');
    fireEvent.press(cell12);
    fireEvent.press(screen.getByLabelText('Digit 6'));
    const cell13 = screen.getByLabelText('Cell 1,3');
    fireEvent.press(cell13);
    fireEvent.press(screen.getByLabelText('Digit 6'));

    // Select (1,2) which has value 6
    fireEvent.press(cell12);
    // Expect highlighted testIDs present for both cells
    expect(screen.getByTestId('cell-1-2-highlight')).toBeTruthy();
    expect(screen.getByTestId('cell-1-3-highlight')).toBeTruthy();
    // Numpad key 6 should reflect highlighted in its a11y label
    expect(screen.getByLabelText('Digit 6 highlighted')).toBeTruthy();
  });

  it('highlights by locked numpad digit when no cell value is selected', () => {
    render(<ClassicScreen />);
    // Lock 4 via long press
    const d4 = screen.getByLabelText('Digit 4');
    fireEvent(d4, 'onLongPress');
    // With lock active, numpad 4 should be highlighted (locked implies highlighted)
    expect(screen.getByLabelText('Digit 4 locked')).toBeTruthy();
  });
});
