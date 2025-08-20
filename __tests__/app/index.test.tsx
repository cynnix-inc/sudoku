import React from 'react';
import { render, screen } from '@testing-library/react-native';
import IndexScreen from '../../app/index';

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

describe('IndexScreen', () => {
  it('renders links', () => {
    render(<IndexScreen />);
    expect(screen.getByText('Play Classic 9×9')).toBeTruthy();
  });
});
