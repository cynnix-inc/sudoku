import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import IndexScreen from '../../app/index';

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

describe('IndexScreen (SPA navigation)', () => {
  it('renders play options', () => {
    render(<IndexScreen />);
    expect(screen.getByText('Play Classic 9×9')).toBeTruthy();
    expect(screen.getByText('Play Daily')).toBeTruthy();
  });

  it('navigates to Classic via state and back home', () => {
    render(<IndexScreen />);
    fireEvent.press(screen.getByLabelText('Go to Classic'));
    expect(screen.getByLabelText('New game')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Return Home'));
    expect(screen.getByText('Play Classic 9×9')).toBeTruthy();
  });

  it('navigates to Daily via state and back home', () => {
    render(<IndexScreen />);
    fireEvent.press(screen.getByLabelText('Go to Daily'));
    expect(screen.queryByLabelText('New game')).toBeNull();
    fireEvent.press(screen.getByLabelText('Return Home'));
    expect(screen.getByText('Play Daily')).toBeTruthy();
  });
});
