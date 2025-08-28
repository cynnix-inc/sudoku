import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import IndexScreen from '../../app/index';

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the stats service
jest.mock('../../app/services/stats', () => ({
  loadStats: jest.fn().mockResolvedValue({
    schemaVersion: 2,
    totals: { played: 10, wins: 7, losses: 3 },
    bestTimeByDifficulty: { easy: 120, medium: 300 },
    recentDailyResults: [],
    lastCalculated: Date.now(),
  }),
}));

// Mock the settings service
jest.mock('../../app/services/settings', () => ({
  loadSettings: jest.fn().mockResolvedValue({
    values: { autoAdvance: true, haptics: true, errorHighlighting: true },
  }),
  updateSettings: jest.fn(),
}));

describe('IndexScreen (SPA navigation)', () => {
  it('renders play options', () => {
    render(<IndexScreen />);
    expect(screen.getByText('🎯 Play Classic 9×9')).toBeTruthy();
    expect(screen.getByText('📅 Daily Challenge')).toBeTruthy();
  });

  it('navigates to Classic via state and back home', () => {
    render(<IndexScreen />);
    fireEvent.press(screen.getByLabelText('Go to Classic Sudoku'));
    expect(screen.getByLabelText('New game')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Return Home'));
    expect(screen.getByText('🎯 Play Classic 9×9')).toBeTruthy();
  });

  it('navigates to Daily via state and back home', () => {
    render(<IndexScreen />);
    fireEvent.press(screen.getByLabelText('Go to Daily Challenge'));
    expect(screen.queryByLabelText('New game')).toBeNull();
    fireEvent.press(screen.getByLabelText('Return Home'));
    expect(screen.getByText('📅 Daily Challenge')).toBeTruthy();
  });

  it('renders all navigation options', () => {
    render(<IndexScreen />);

    // Game Modes
    expect(screen.getByText('Game Modes')).toBeTruthy();
    expect(screen.getByText('🎯 Play Classic 9×9')).toBeTruthy();
    expect(screen.getByText('📅 Daily Challenge')).toBeTruthy();
    expect(screen.getByText('📆 Daily Calendar')).toBeTruthy();

    // Tools & Information
    expect(screen.getByText('Tools & Information')).toBeTruthy();
    expect(screen.getByText('📊 Statistics')).toBeTruthy();
    expect(screen.getByText('⚙️ Settings')).toBeTruthy();
    expect(screen.getByText('❓ Help & About')).toBeTruthy();
  });

  it('navigates to Stats screen', async () => {
    render(<IndexScreen />);
    fireEvent.press(screen.getByLabelText('View Game Statistics'));

    // Wait for the stats to load
    expect(await screen.findByText('Game Statistics')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Return Home'));
    expect(screen.getByText('Ultimate Sudoku')).toBeTruthy();
  });

  it('navigates to Help screen', () => {
    render(<IndexScreen />);
    fireEvent.press(screen.getByLabelText('Get Help and Information'));
    expect(screen.getByText('Help & About')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Return Home'));
    expect(screen.getByText('Ultimate Sudoku')).toBeTruthy();
  });
});
