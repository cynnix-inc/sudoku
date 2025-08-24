import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen header/footer', () => {
  it('renders header with product title, mode/difficulty, and time (icon-only timer)', () => {
    render(<ClassicScreen />);
    expect(screen.getByText('Ultimate Sudoku')).toBeTruthy();
    expect(screen.getByText(/Classic\s*•\s*easy/)).toBeTruthy();
    const time = screen.getByLabelText('Elapsed time');
    expect(time).toBeTruthy();
  });

  it('renders numeric seed in footer (tappable to copy)', () => {
    render(<ClassicScreen />);
    const seedFooter = screen.getByLabelText('Seed footer');
    expect(seedFooter).toHaveTextContent(/^\s*\d+\s*$/);
  });

  it('renders hearts-only lives with an accessible label (no textual "Lives" label)', () => {
    render(<ClassicScreen />);
    expect(screen.getByLabelText(/\d+ lives remaining/)).toBeTruthy();
  });
  it('shows timer value with an adjacent icon-only pause control (no textual "Timer" label)', () => {
    render(<ClassicScreen />);
    const time = screen.getByLabelText('Elapsed time');
    expect(time).toBeTruthy();
    // Pause icon control exists with accessible label
    expect(screen.getByLabelText('Pause timer')).toBeTruthy();
  });

  it('right-aligns the timer within header width (@issue-112)', () => {
    render(<ClassicScreen />);
    const time = screen.getByLabelText('Elapsed time');
    // Ensure style positions the timer to the right within the header row container
    expect(time.props.style.position).toBe('absolute');
    // Now offset by 24 to make room for the pause icon
    expect(time.props.style.right).toBe(24);
  });
});
