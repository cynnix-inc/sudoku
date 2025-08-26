import React from 'react';
import { beforeEach } from '@jest/globals';
import { fireEvent, render, waitFor, screen } from '@testing-library/react-native';
import SettingsScreen from '../../app/settings.screen';
import { __TEST_ONLY__clearProgress, loadProgress } from '../../app/services/storage';
import { settingsKey } from '../../app/services/settings';
import type { SettingsData } from '../../app/services/settings';

describe('SettingsScreen (#61)', () => {
  beforeEach(() => {
    __TEST_ONLY__clearProgress(settingsKey());
  });

  it('toggles auto advance and persists', async () => {
    render(<SettingsScreen />);
    const toggle = await waitFor(() => screen.getByLabelText('Auto advance input'));
    // default is true per defaults
    fireEvent(toggle, 'valueChange', false);
    await waitFor(async () => {
      const saved = await loadProgress<SettingsData>(settingsKey());
      expect(saved && saved.values.autoAdvance).toBe(false);
    });
  });
});
