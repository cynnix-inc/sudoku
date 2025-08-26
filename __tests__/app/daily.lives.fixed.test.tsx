import React from 'react';
import { render, screen } from '@testing-library/react-native';
import DailyScreen from '../../app/daily.screen';
import { __TEST_ONLY__clearProgress } from '../../app/services/storage';
import { beforeEach } from '@jest/globals';

// Mock the daily module to force a deterministic difficulty → lives mapping
// We pick 'hard' → livesForDifficulty returns 4 for Daily
jest.mock('../../app/game/daily', () => {
  return {
    createDailySeed: () => ({ utcDate: '20250113', patternId: 'A', difficulty: 'hard' }),
    formatDailySeed: () => '20250113-A-hard',
    generateDailyPuzzle: () => ({ givens: [] }),
    __esModule: true,
    default: jest.fn(),
  };
});

describe('DailyScreen fixed lives by difficulty (#50)', () => {
  beforeEach(() => {
    __TEST_ONLY__clearProgress();
  });

  it('initializes lives from difficulty (hard → 4 lives)', () => {
    render(<DailyScreen />);
    const node = screen.getByLabelText(/\d+ lives remaining/);
    const label = String(node?.props?.accessibilityLabel ?? ''); // RN testing lib stores label here
    const match = label.match(/(\d+) lives remaining/);
    const lives = match ? Number(match[1]) : NaN;
    expect(lives).toBe(4);
  });
});
