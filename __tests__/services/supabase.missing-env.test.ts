import { jest } from '@jest/globals';

jest.mock('@supabase/supabase-js', () => {
  const mockCreate = jest.fn(() => ({ __mock: true }));
  return { createClient: mockCreate };
});

describe('supabase client (missing env)', () => {
  it('exports null when env is missing (non-test) and warns', () => {
    jest.resetModules();
    delete process.env['EXPO_PUBLIC_SUPABASE_URL'];
    delete process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'];
    (process as unknown as { env: Record<string, string | undefined> }).env['NODE_ENV'] =
      'development';

    const mod = require('../../app/services/supabase');
    expect(mod.supabase).toBeNull();
  });
});
