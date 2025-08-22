/** @jest-environment jsdom */
/* eslint-env jest */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';
import {
  __TEST_ONLY__clearProgress,
  __TEST_ONLY__clearMemoryStore,
  loadProgress,
} from '../../app/services/storage';
import type { StatsData } from '../../app/services/stats';

describe('Classic stats persistence (#166)', () => {
  it('records a loss when lives reach zero', async () => {
    __TEST_ONLY__clearMemoryStore();
    __TEST_ONLY__clearProgress('sudoku-stats');
    __TEST_ONLY__clearProgress('sudoku-progress');
    render(<ClassicScreen />);
    // Force three mistakes to deplete lives
    const cell12 = screen.getByLabelText('Cell 1,2');
    fireEvent.press(cell12);
    // Place 5 in (1,2)
    fireEvent.press(screen.getByLabelText(/Digit 5( highlighted)?/));

    const makeMistake = () => {
      const cell13 = screen.getByLabelText('Cell 1,3');
      fireEvent.press(cell13);
      // Place another 5 in same row is invalid
      fireEvent.press(screen.getByLabelText(/Digit 5( highlighted)?/));
    };

    makeMistake();
    makeMistake();
    makeMistake();

    // Finished overlay should show Game over
    expect(screen.getByLabelText('Game over')).toBeTruthy();

    // Wait for async stats write to complete, then assert
    await waitFor(async () => {
      const parsed = await loadProgress<StatsData>('sudoku-stats');
      expect(parsed?.totals?.played).toBe(1);
      expect(parsed?.totals?.losses).toBe(1);
    });
  });
});
