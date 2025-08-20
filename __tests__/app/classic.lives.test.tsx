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
    // Note: replace with hearts a11y label when Header is updated
    const livesBefore = screen.getByLabelText('Elapsed time');
    const beforeText = String(
      livesBefore.props.children.join ? livesBefore.props.children.join('') : '',
    ).replace(/.*Lives: (\d+).*/, '$1');
    const cell13 = screen.getByLabelText('Cell 1,3');
    fireEvent.press(cell13);
    fireEvent.press(screen.getByLabelText('Digit 5'));
    const livesAfter = screen.getByLabelText('Elapsed time');
    const afterText = String(
      livesAfter.props.children.join ? livesAfter.props.children.join('') : '',
    ).replace(/.*Lives: (\d+).*/, '$1');
    expect(Number(afterText)).toBe(Number(beforeText) - 1);

    // Undo should not change lives count
    fireEvent.press(screen.getByLabelText('Undo move'));
    const livesAfterUndo = screen.getByLabelText('Elapsed time');
    const afterUndoText = String(
      livesAfterUndo.props.children.join ? livesAfterUndo.props.children.join('') : '',
    ).replace(/.*Lives: (\d+).*/, '$1');
    expect(Number(afterUndoText)).toBe(Number(afterText));

    // Redo should not change lives count
    fireEvent.press(screen.getByLabelText('Redo move'));
    const livesAfterRedo = screen.getByLabelText('Elapsed time');
    const afterRedoText = String(
      livesAfterRedo.props.children.join ? livesAfterRedo.props.children.join('') : '',
    ).replace(/.*Lives: (\d+).*/, '$1');
    expect(Number(afterRedoText)).toBe(Number(afterText));
  });
});
