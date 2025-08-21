import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import SeedFooter from '../../app/components/SeedFooter';
import { ThemeContext, type ThemeContextValue } from '../../app/_layout';

const theme: ThemeContextValue = {
  isDark: false,
  foreground: '#111827',
  background: '#ffffff',
  toggle: () => {},
};

describe('SeedFooter', () => {
  it('copies seed to clipboard and shows confirmation', async () => {
    const seed = 'r1c1=1;r1c2=2';
    const writeText = jest.fn().mockResolvedValue(undefined);
    (
      globalThis as unknown as {
        navigator?: { clipboard?: { writeText?: (t: string) => Promise<void> | void } };
      }
    ).navigator = {
      clipboard: { writeText },
    };

    render(
      <ThemeContext.Provider value={theme}>
        <SeedFooter seed={seed} />
      </ThemeContext.Provider>,
    );

    fireEvent.press(screen.getByLabelText('Copy seed'));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(seed));
    expect(await screen.findByLabelText('Seed copied')).toBeTruthy();
  });

  it('falls back gracefully if Clipboard API is missing (no throw)', async () => {
    const seed = 'abc123';
    (globalThis as unknown as { navigator?: unknown }).navigator = undefined;

    render(
      <ThemeContext.Provider value={theme}>
        <SeedFooter seed={seed} />
      </ThemeContext.Provider>,
    );

    expect(() => fireEvent.press(screen.getByLabelText('Copy seed'))).not.toThrow();
    expect(await screen.findByLabelText('Seed copied')).toBeTruthy();
  });
});
