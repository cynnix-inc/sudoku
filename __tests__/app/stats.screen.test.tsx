import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { beforeEach } from '@jest/globals';
import StatsScreen from '../../app/stats.screen';
import { getDetailedStats } from '../../app/services/stats';

// Mock the stats service
jest.mock('../../app/services/stats');
const mockGetDetailedStats = getDetailedStats as jest.MockedFunction<typeof getDetailedStats>;

// Mock the theme context
jest.mock('../../app/_layout', () => ({
  ThemeContext: {
    Consumer: ({ children }: { children: (value: unknown) => React.ReactElement }) =>
      children({
        background: '#ffffff',
        foreground: '#000000',
        isDark: false,
        toggle: jest.fn(),
      }),
  },
}));

describe('StatsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockGetDetailedStats.mockResolvedValue(null);

    const { getByText } = render(<StatsScreen />);
    expect(getByText('Loading…')).toBeTruthy();
  });

  it('renders stats when data is loaded', async () => {
    const mockStats = {
      overall: {
        played: 10,
        wins: 7,
        winRate: 70,
        averageTime: null,
      },
      byDifficulty: {
        easy: {
          played: 5,
          wins: 4,
          winRate: 80,
          bestTime: 120,
          averageTime: null,
        },
        medium: {
          played: 3,
          wins: 2,
          winRate: 66.7,
          bestTime: 300,
          averageTime: null,
        },
      },
      streaks: {
        current: 3,
        best: 5,
      },
    };

    mockGetDetailedStats.mockResolvedValue(mockStats);

    const { getByText } = render(<StatsScreen />);

    await waitFor(() => {
      expect(getByText('Statistics')).toBeTruthy();
      expect(getByText('Overall')).toBeTruthy();
      expect(getByText('10')).toBeTruthy(); // Games played
      expect(getByText('7')).toBeTruthy(); // Total wins
      expect(getByText('70.0%')).toBeTruthy(); // Win rate
      expect(getByText('Daily Streaks')).toBeTruthy();
      expect(getByText('3')).toBeTruthy(); // Current streak
      expect(getByText('5')).toBeTruthy(); // Best streak
      expect(getByText('By Difficulty')).toBeTruthy();
      expect(getByText('Easy')).toBeTruthy();
      expect(getByText('Medium')).toBeTruthy();
    });
  });

  it('handles empty stats gracefully', async () => {
    const mockStats = {
      overall: {
        played: 0,
        wins: 0,
        winRate: 0,
        averageTime: null,
      },
      byDifficulty: {},
      streaks: {
        current: 0,
        best: 0,
      },
    };

    mockGetDetailedStats.mockResolvedValue(mockStats);

    const { getByText } = render(<StatsScreen />);

    await waitFor(() => {
      expect(getByText('Statistics')).toBeTruthy();
      expect(getByText('0')).toBeTruthy(); // Games played
      expect(getByText('0.0%')).toBeTruthy(); // Win rate
      expect(getByText('0')).toBeTruthy(); // Current streak
      expect(getByText('0')).toBeTruthy(); // Best streak
    });
  });

  it('formats time correctly', async () => {
    const mockStats = {
      overall: {
        played: 1,
        wins: 1,
        winRate: 100,
        averageTime: null,
      },
      byDifficulty: {
        easy: {
          played: 1,
          wins: 1,
          winRate: 100,
          bestTime: 125, // 2:05
          averageTime: null,
        },
      },
      streaks: {
        current: 1,
        best: 1,
      },
    };

    mockGetDetailedStats.mockResolvedValue(mockStats);

    const { getByText } = render(<StatsScreen />);

    await waitFor(() => {
      expect(getByText('2:05')).toBeTruthy(); // Formatted time
    });
  });
});
