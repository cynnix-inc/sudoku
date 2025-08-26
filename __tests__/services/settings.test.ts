import { beforeEach } from '@jest/globals';
import { __TEST_ONLY__clearProgress } from '../../app/services/storage';
import {
  loadSettings,
  saveSettings,
  updateSettings,
  settingsKey,
  type SettingsData,
} from '../../app/services/settings';

describe('services/settings', () => {
  beforeEach(() => {
    __TEST_ONLY__clearProgress(settingsKey());
  });

  it('loads defaults when none saved', async () => {
    const loaded = await loadSettings();
    expect(loaded.settingsVersion).toBe(1);
    expect(loaded.values.theme).toBe('system');
  });

  it('saves and loads roundtrip', async () => {
    const data: SettingsData = await loadSettings();
    data.values.theme = 'dark';
    await saveSettings(data);
    const again = await loadSettings();
    expect(again.values.theme).toBe('dark');
  });

  it('updates single field and stamps timestamp', async () => {
    const before = await loadSettings();
    expect(before.timestamps['autoAdvance']).toBeUndefined();
    const fixedTime = 1111111111111;
    const after = await updateSettings('autoAdvance', false, fixedTime);
    expect(after.values.autoAdvance).toBe(false);
    expect(after.timestamps['autoAdvance']).toBe(fixedTime);
    const reloaded = await loadSettings();
    expect(reloaded.values.autoAdvance).toBe(false);
    expect(reloaded.timestamps['autoAdvance']).toBe(fixedTime);
  });
});
