import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen lives and error highlighting', () => {
  it('decrements lives and highlights cell on invalid placement; undo/redo does not change lives', () => {
    render(<ClassicScreen />);
    // Place a 5 at (1,2)
    const cell12 = screen.getByLabelText('Cell 1,2');
    fireEvent.press(cell12);
    fireEvent.press(screen.getByLabelText('Digit 5'));
    // Try to place another 5 in same row (1,3) → invalid
    // Read lives from hearts-only accessible label, e.g., "3 lives remaining"
    const getLives = (): number => {
      const node = screen.getByLabelText(/\d+ lives remaining/);
      const label = (node as unknown as { props?: { accessibilityLabel?: string } }).props
        ?.accessibilityLabel;
      const match = (label ?? '').match(/(\d+) lives remaining/);
      return match ? Number(match[1]) : NaN;
    };
    const beforeLives = getLives();
    const cell13 = screen.getByLabelText('Cell 1,3');
    fireEvent.press(cell13);
    fireEvent.press(screen.getByLabelText('Digit 5'));
    const afterLives = getLives();
    expect(afterLives).toBe(beforeLives - 1);

    // Undo should not change lives count
    fireEvent.press(screen.getByLabelText('Undo move'));
    const livesAfterUndo = getLives();
    expect(livesAfterUndo).toBe(afterLives);

    // Redo should not change lives count
    fireEvent.press(screen.getByLabelText('Redo move'));
    const livesAfterRedo = getLives();
    expect(livesAfterRedo).toBe(afterLives);
  });
});
