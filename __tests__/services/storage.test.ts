import { saveProgress, loadProgress, __TEST_ONLY__clearProgress } from '../../app/services/storage';

describe('services/storage', () => {
  it('saves and loads simple JSON payloads', async () => {
    __TEST_ONLY__clearProgress('test-key');
    await saveProgress('test-key', { a: 1, b: 'two' });
    const loaded = await loadProgress<{ a: number; b: string }>('test-key');
    expect(loaded).toEqual({ a: 1, b: 'two' });
  });
});
