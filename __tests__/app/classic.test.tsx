import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen', () => {
  it('renders header', () => {
    render(<ClassicScreen />);
    expect(screen.getAllByText(/Classic/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Mode:\s*Classic[\s\S]*Difficulty:\s*easy/)).toBeTruthy();
    expect(screen.getByLabelText('Elapsed time')).toBeTruthy();
  });

  it('shows solved banner and can restart', () => {
    render(<ClassicScreen />);
    const rules = require('../../app/game/rules');
    jest.spyOn(rules, 'isSolved').mockReturnValue(true);
    // Re-render by rendering again
    render(<ClassicScreen />);
    expect(screen.getByLabelText('Puzzle solved')).toBeTruthy();
    const restart = screen.getByLabelText('Restart puzzle');
    (rules.isSolved as jest.Mock).mockReturnValue(false);
    fireEvent.press(restart);
    expect(screen.queryByLabelText('Puzzle solved')).toBeNull();
    (rules.isSolved as jest.Mock).mockRestore();
  });
});
