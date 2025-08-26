import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import DailyScreen from '../../app/daily.screen';

describe('GameScreenBase pause and keyboard guards', () => {
  it('pauses on visibility/blur in web-like envs', async () => {
    render(<DailyScreen />);

    // Trigger visibility change
    try {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    } catch {
      /* ignore define errors */
    }
    const hasEventCtor =
      typeof (globalThis as unknown as { Event?: new (t: string) => unknown }).Event !==
      'undefined';
    const visEvt = hasEventCtor
      ? new (globalThis as unknown as { Event: new (t: string) => unknown }).Event(
          'visibilitychange',
        )
      : ({ type: 'visibilitychange' } as unknown);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.dispatchEvent(visEvt as any);
    await waitFor(() => expect(screen.getByLabelText('Resume timer')).toBeTruthy());

    // Trigger blur pause as well
    const blurEvt = hasEventCtor
      ? new (globalThis as unknown as { Event: new (t: string) => unknown }).Event('blur')
      : ({ type: 'blur' } as unknown);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.dispatchEvent(blurEvt as any);
    await waitFor(() => expect(screen.getByLabelText('Resume timer')).toBeTruthy());
  });
});
