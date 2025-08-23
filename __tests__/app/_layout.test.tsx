import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import RootLayout from '../../app/_layout';

jest.mock('expo-router', () => ({ Slot: () => null }));

describe('RootLayout', () => {
  it('renders Slot and allows theme toggle', () => {
    render(<RootLayout />);
    // Toggle exists and can be pressed (we don't have a router context here)
    const toggle = screen.getByLabelText('Toggle color theme');
    fireEvent.press(toggle);
  });
});
