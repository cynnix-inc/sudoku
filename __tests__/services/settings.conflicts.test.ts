import { jest } from '@jest/globals';

jest.mock('@supabase/supabase-js', () => {
  const createClient = jest.fn(() => ({
    auth: { getUser: jest.fn(async () => ({ data: { user: { id: 'u_1' } }, error: null })) },
  }));
  return { createClient };
});

import { mergeSettingsByTimestamps } from '../../app/services/sync';

describe('settings conflict detection (#52)', () => {
  it('prefers newer per-field timestamps', () => {
    const base = {
      settingsVersion: 1 as const,
      values: {
        errorHighlighting: true,
        autoCandidates: 'default' as const,
        autoAdvance: false,
        haptics: true,
        teachingPrompts: true,
        hintPathMode: 'off' as const,
        timedChallenge: 'off' as const,
        theme: 'system' as const,
        accentColor: '#22c55e',
        gridSize: 1,
        inputSize: 1,
        notesSize: 1,
        calendarWeekStartsOn: 'mon' as const,
        calendarFilter: 'all' as const,
      },
      timestamps: {},
      lastSyncAttempt: 0,
    };

    const local = {
      ...base,
      values: { ...base.values, autoAdvance: false },
      timestamps: { autoAdvance: 1000, updatedAt: 1000 },
    };
    const remote = {
      ...base,
      values: { ...base.values, autoAdvance: true },
      timestamps: { autoAdvance: 2000, updatedAt: 2000 },
    };

    const merged = mergeSettingsByTimestamps(local, remote);
    expect(merged.values.autoAdvance).toBe(true);
    expect(merged.timestamps.autoAdvance).toBe(2000);
    expect(merged.timestamps.updatedAt).toBeGreaterThanOrEqual(2000);
  });
});
