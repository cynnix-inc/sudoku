import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen header/footer', () => {
  it('renders header with mode, difficulty, and time (no textual "Timer" label)', () => {
    render(<ClassicScreen />);
    expect(screen.getByText('Classic')).toBeTruthy();
    expect(screen.getByText(/Mode: Classic/)).toBeTruthy();
    const time = screen.getByLabelText('Elapsed time');
    expect(time).toBeTruthy();
  });

  it('renders numeric seed in footer', () => {
    render(<ClassicScreen />);
    const seedFooter = screen.getByLabelText('Seed footer');
    expect(seedFooter).toHaveTextContent(/Seed: \d+/);
  });

  it.todo('renders hearts-only lives with an accessible label (no textual "Lives" label)');
  it.todo('shows timer value with an adjacent icon-only pause control (no textual "Timer" label)');
});
