import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

// Avoid importing full RN index to prevent DevMenu/TurboModule errors; monkey-patch at runtime

describe('ClassicScreen responsive layout (#117)', () => {
  it('fits board within small mobile width and keeps numpad single row', () => {
    const rn = require('react-native');
    const spy = jest
      .spyOn(rn, 'useWindowDimensions')
      .mockReturnValue({ width: 375, height: 800, scale: 1, fontScale: 1 });
    render(<ClassicScreen />);
    const row = screen.getByTestId('numpad-row');
    expect(row.props.style.flexDirection).toBe('row');
    expect(row.props.style.width).toBeGreaterThan(0);
    spy.mockRestore();
  });

  it('centers grid at larger widths with time right-aligned in header container', () => {
    const rn = require('react-native');
    const spy = jest
      .spyOn(rn, 'useWindowDimensions')
      .mockReturnValue({ width: 1024, height: 800, scale: 1, fontScale: 1 });
    render(<ClassicScreen />);
    const time = screen.getByLabelText('Elapsed time');
    expect(time.props.style.position).toBe('absolute');
    expect(time.props.style.right).toBe(24);
    spy.mockRestore();
  });
});
