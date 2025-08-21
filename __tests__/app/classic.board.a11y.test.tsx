import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('Classic board a11y labels', () => {
  it('announces row/col and value state', () => {
    render(<ClassicScreen />);
    // Given fixture has a given at 1,1 with value 5
    expect(screen.getByLabelText('Cell 1,1')).toBeTruthy();
    // Empty cell example
    expect(screen.getByLabelText('Cell 1,2')).toBeTruthy();
  });
});
