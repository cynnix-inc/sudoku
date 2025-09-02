import { loadSettings, updateSettings } from '../../app/services/settings';

describe('timed challenge setting', () => {
  it('defaults to off and can be toggled on', async () => {
    const s = await loadSettings();
    expect(s.values.timedChallenge).toBe('off');
    const next = await updateSettings('timedChallenge', 'on');
    expect(next.values.timedChallenge).toBe('on');
  });
});
