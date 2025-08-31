import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import SettingsScreen from '../../app/settings.screen';

describe('SettingsScreen accessibility', () => {
  it('exposes accessible switch for Auto advance input', async () => {
    render(<SettingsScreen />);
    const toggle = await waitFor(() => screen.getByLabelText('Auto advance input'));
    expect(toggle).toBeTruthy();
    expect(toggle.props?.accessibilityRole).toBe('switch');
  });
});


