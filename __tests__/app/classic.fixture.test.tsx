import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen fixtures', () => {
  it('loads fixed easy seed givens and allows placement', () => {
    render(<ClassicScreen />);
    // Cell 1,1 should be given 5 (from fixtures seed)
    const cell11 = screen.getByLabelText('Cell 1,1');
    expect(cell11).toHaveTextContent('5');
    // Select 1,3 and place 7
    const cell13 = screen.getByLabelText('Cell 1,3');
    fireEvent.press(cell13);
    fireEvent.press(screen.getByLabelText('Digit 7'));
    expect(cell13).toHaveTextContent('7');
  });
});
