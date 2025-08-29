import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('Storage error handling', () => {
  it('gracefully handles corrupted storage on load', async () => {
    const key = 'sudoku-progress';
    // Corrupt localStorage entry
    globalThis.localStorage?.setItem(key, '{ not: json');

    render(<ClassicScreen />);
    // App should still render and not crash; header title visible
    expect(await screen.findByText('Ultimate Sudoku')).toBeTruthy();
    // Timer still mounts despite storage parse failure
    await waitFor(() => expect(screen.getByLabelText('Elapsed time')).toBeTruthy());
  });
});


