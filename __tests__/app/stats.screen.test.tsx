import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { beforeEach } from '@jest/globals';
import StatsScreen from '../../app/stats.screen';
import { getDetailedStats, type DetailedStats } from '../../app/services/stats';
import { ThemeContext } from '../../app/_layout';

// Mock the stats service
jest.mock('../../app/services/stats');
const mockGetDetailedStats = getDetailedStats as jest.MockedFunction<typeof getDetailedStats>;

// Create a mock theme context value
const mockTheme = {
  background: '#ffffff',
  foreground: '#000000',
  isDark: false,
  toggle: jest.fn(),
};

// Helper to render with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeContext.Provider value={mockTheme}>{component}</ThemeContext.Provider>);
};

describe('StatsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Return a pending promise to keep loading state
    mockGetDetailedStats.mockImplementation(() => new Promise(() => {}));

    const { getByText } = renderWithTheme(<StatsScreen />);
    expect(getByText('Loading…')).toBeTruthy();
  });

  it('renders stats when data is loaded', async () => {
    const mockStats = {
      overall: {
        played: 10,
        wins: 7,
        winRate: 70,
        averageTime: null,
        medianTime: null,
        fastestTime: null,
        slowestTime: null,
        totalPlayTime: 0,
        averageMovesPerGame: null,
        hintsUsageRate: 0,
      },
      byDifficulty: {
        easy: {
          played: 5,
          wins: 4,
          winRate: 80,
          bestTime: 120,
          averageTime: null,
          medianTime: null,
          fastestTime: null,
          slowestTime: null,
          totalPlayTime: 0,
          averageMoves: null,
          hintsUsageRate: 0,
        },
        medium: {
          played: 3,
          wins: 2,
          winRate: 66.7,
          bestTime: 300,
          averageTime: null,
          medianTime: null,
          fastestTime: null,
          slowestTime: null,
          totalPlayTime: 0,
          averageMoves: null,
          hintsUsageRate: 0,
        },
      },
      streaks: { current: 3, best: 5 },
      trends: { recentWinRate: 70, recentAverageTime: null, improvementTrend: 'stable' as const },
      gameHistory: [],
    } as unknown as DetailedStats;

    mockGetDetailedStats.mockResolvedValue(mockStats);

    const { getByText } = renderWithTheme(<StatsScreen />);

    await waitFor(() => {
      expect(getByText('Statistics')).toBeTruthy();
      expect(getByText('Overall')).toBeTruthy();
      expect(getByText('Games Played')).toBeTruthy();
      expect(getByText('Total Wins')).toBeTruthy();
      expect(getByText('Daily Streaks')).toBeTruthy();
      expect(getByText('By Difficulty')).toBeTruthy();
      expect(getByText('Easy')).toBeTruthy();
      expect(getByText('Medium')).toBeTruthy();
      expect(getByText('Recent Trends')).toBeTruthy();
      expect(getByText('Time Distribution')).toBeTruthy();
    });
  });

  it('handles empty stats gracefully', async () => {
    const mockStats = {
      overall: {
        played: 0,
        wins: 0,
        winRate: 0,
        averageTime: null,
        medianTime: null,
        fastestTime: null,
        slowestTime: null,
        totalPlayTime: 0,
        averageMovesPerGame: null,
        hintsUsageRate: 0,
      },
      byDifficulty: {},
      streaks: { current: 0, best: 0 },
      trends: { recentWinRate: 0, recentAverageTime: null, improvementTrend: 'stable' as const },
      gameHistory: [],
    } as unknown as DetailedStats;

    mockGetDetailedStats.mockResolvedValue(mockStats);

    const { getByText, getAllByText } = renderWithTheme(<StatsScreen />);

    await waitFor(() => {
      expect(getByText('Statistics')).toBeTruthy();
      expect(getByText('Games Played')).toBeTruthy();
      expect(getByText('Total Wins')).toBeTruthy();
      expect(getByText('Win Rate')).toBeTruthy();
      expect(getByText('Current')).toBeTruthy();
      expect(getByText('Best')).toBeTruthy();
      expect(getByText('Recent Trends')).toBeTruthy();
      const zeros = getAllByText('0');
      expect(zeros.length).toBeGreaterThan(0);
    });
  });

  it('formats time correctly', async () => {
    const mockStats = {
      overall: {
        played: 1,
        wins: 1,
        winRate: 100,
        averageTime: null,
        medianTime: null,
        fastestTime: null,
        slowestTime: null,
        totalPlayTime: 0,
        averageMovesPerGame: null,
        hintsUsageRate: 0,
      },
      byDifficulty: {
        easy: {
          played: 1,
          wins: 1,
          winRate: 100,
          bestTime: 125,
          averageTime: null,
          medianTime: null,
          fastestTime: null,
          slowestTime: null,
          totalPlayTime: 0,
          averageMoves: null,
          hintsUsageRate: 0,
        },
      },
      streaks: { current: 1, best: 1 },
      trends: { recentWinRate: 100, recentAverageTime: null, improvementTrend: 'stable' as const },
      gameHistory: [
        {
          id: '1',
          date: '20240101',
          difficulty: 'easy',
          result: 'win',
          seconds: 125,
          usedHints: false,
          livesRemaining: 3,
          totalMoves: 40,
          completedAt: Date.now(),
        },
      ],
    } as unknown as DetailedStats;

    mockGetDetailedStats.mockResolvedValue(mockStats);

    const { getByText } = renderWithTheme(<StatsScreen />);

    await waitFor(() => {
      expect(getByText('2:05')).toBeTruthy();
    });
  });
});
