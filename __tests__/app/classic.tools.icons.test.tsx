import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen tools as icon-only below numpad', () => {
  it('renders tools row with accessible labels and works', () => {
    render(<ClassicScreen />);
    // Tools row exists
    expect(screen.getByTestId('tools-row')).toBeTruthy();
    // Accessible labels
    const notesToggle = screen.getByLabelText('Enable notes mode');
    const pauseBtn = screen.getByLabelText('Pause timer');
    const eraseBtn = screen.getByLabelText('Erase cell');
    const undoBtn = screen.getByLabelText('Undo move');
    const redoBtn = screen.getByLabelText('Redo move');
    expect(notesToggle && pauseBtn && eraseBtn && undoBtn && redoBtn).toBeTruthy();

    // Basic behavior remains
    const cell12 = screen.getByLabelText('Cell 1,2');
    fireEvent.press(cell12);
    fireEvent.press(notesToggle);
    fireEvent.press(screen.getByLabelText('Digit 1'));
    const notesEl = screen.getByTestId('cell-1-2-notes');
    expect(notesEl).toHaveTextContent('1');
    fireEvent.press(eraseBtn);
    expect(screen.getByLabelText('Cell 1,2')).toHaveTextContent('');
  });

  it('does not render inline long-press instructional text (ADR-0004)', () => {
    render(<ClassicScreen />);
    // Ensure instructional hint is not present in default surfaces
    const query = screen.queryByText(/long-press to lock a digit/i);
    expect(query).toBeNull();
  });
});
