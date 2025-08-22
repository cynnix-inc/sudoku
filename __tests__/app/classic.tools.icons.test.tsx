import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen tools as icon-only below numpad (ordered)', () => {
  it('renders tools row and Pause is in header', () => {
    render(<ClassicScreen />);

    const row = screen.getByTestId('tools-row');
    expect(row).toBeTruthy();

    // Ensure header pause control exists (icon-only near timer)
    expect(screen.getByLabelText('Pause timer')).toBeTruthy();

    // The exact order may vary by viewport; verify key tools exist
    const labels = Array.isArray(row.props.children)
      ? row.props.children
          .filter((c: unknown) => !!c)
          .map(
            (c: unknown) =>
              (c as { props?: { accessibilityLabel?: string } }).props?.accessibilityLabel,
          )
          .filter(Boolean)
      : [];

    expect(labels).toEqual([
      'Enable notes mode',
      expect.stringMatching(/^Enable lock|^Disable lock/),
      'Erase cell',
      'Undo move',
      'Redo move',
    ]);
  });
});
