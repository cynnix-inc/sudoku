import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import HelpScreen from '../../app/help.screen';

describe('HelpScreen', () => {
  it('renders and navigates between sections by accessibility labels', () => {
    const { getByText, getByLabelText } = render(<HelpScreen />);

    // Default section is Rules — verify heading
    expect(getByText('How to Play Sudoku')).toBeTruthy();

    // Navigate to Techniques
    fireEvent.press(getByLabelText('Techniques Primer section'));
    expect(getByText('Solving Techniques')).toBeTruthy();

    // Navigate to Controls
    fireEvent.press(getByLabelText('Controls Guide section'));
    expect(getByText('Game Controls')).toBeTruthy();

    // Navigate to Stats
    fireEvent.press(getByLabelText('Stats Explainer section'));
    expect(getByText('Understanding Your Stats')).toBeTruthy();

    // Navigate to About
    fireEvent.press(getByLabelText('About section'));
    expect(getByText('About Ultimate Sudoku')).toBeTruthy();
  });
});
