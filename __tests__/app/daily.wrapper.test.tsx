import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import DailyScreen from '../../app/daily.screen';

describe('DailyScreen via GameScreenBase', () => {
  it('saves, loads progress, toggles notes mode and pause', async () => {
    const { unmount } = render(<DailyScreen />);

    const cell12 = screen.getByLabelText('Cell 1,2');
    fireEvent.press(cell12);
    fireEvent.press(screen.getByLabelText('Digit 9'));
    expect(cell12).toHaveTextContent('9');

    // Lock a digit via long press to exercise lock state and highlight
    const d4 = screen.getByLabelText('Digit 4');
    fireEvent(d4, 'onLongPress');
    expect(screen.getByLabelText('Digit 4 locked')).toBeTruthy();

    // Erase and undo/redo to cover action handlers
    fireEvent.press(screen.getByLabelText('Erase cell'));
    fireEvent.press(screen.getByLabelText('Undo move'));

    // Toggle notes mode to cover related state paths
    fireEvent.press(screen.getByLabelText('Enable notes mode'));
    await waitFor(() => expect(screen.getByLabelText('Disable notes mode')).toBeTruthy());

    // Pause to cover timer/paused effect
    fireEvent.press(screen.getByLabelText('Pause timer'));
    await waitFor(() => expect(screen.getByLabelText('Resume timer')).toBeTruthy());

    // Unmount/remount to simulate reload and ensure value persisted under daily progress key
    unmount();
    render(<DailyScreen />);

    await waitFor(() => expect(screen.getByLabelText('Cell 1,2')).toHaveTextContent('9'));
  });
});
