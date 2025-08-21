import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen storage', () => {
  it('saves and loads progress (board values)', async () => {
    // JSDOM localStorage is available
    const { unmount } = render(<ClassicScreen />);
    const cell12 = screen.getByLabelText('Cell 1,2');
    fireEvent.press(cell12);
    fireEvent.press(screen.getByLabelText('Digit 9'));
    expect(cell12).toHaveTextContent('9');
    // Trigger unmount/mount to simulate reload
    unmount();
    render(<ClassicScreen />);
    // Value should be restored (loaded async)
    await waitFor(() => expect(screen.getByLabelText('Cell 1,2')).toHaveTextContent('9'));
  });

  it('persists notesMode, paused, and lockedDigit', async () => {
    const { unmount } = render(<ClassicScreen />);
    // Enable notes mode
    fireEvent.press(screen.getByLabelText('Enable notes mode'));
    // Lock 4 via long press
    const d4 = screen.getByLabelText('Digit 4');
    fireEvent(d4, 'onLongPress');
    // Pause
    fireEvent.press(screen.getByLabelText('Pause timer'));

    // Unmount/remount to simulate reload
    unmount();
    render(<ClassicScreen />);

    // notes mode restored
    await waitFor(() => expect(screen.getByLabelText('Disable notes mode')).toBeTruthy());
    // locked digit reflected in accessibility label
    expect(screen.getByLabelText('Digit 4 locked')).toBeTruthy();
    // paused restored
    expect(screen.getByLabelText('Resume timer')).toBeTruthy();
  });
});
