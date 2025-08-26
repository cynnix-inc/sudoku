import { jest } from '@jest/globals';

jest.mock('@supabase/supabase-js', () => {
  const auth = {
    signInWithPassword: jest.fn(async ({ email, password }) => {
      if (email === 'ok@example.com' && password === 'pass') {
        return { data: { user: { id: 'u_123', email } }, error: null };
      }
      return { data: { user: null }, error: { message: 'Invalid credentials' } };
    }),
    signOut: jest.fn(async () => ({ error: null })),
    getUser: jest.fn(async () => ({
      data: { user: { id: 'u_123', email: 'ok@example.com' } },
      error: null,
    })),
  };
  const createClient = jest.fn(() => ({ auth }));
  return { createClient };
});

describe('auth service (#54)', () => {
  it('signs in with email/password and returns user id', async () => {
    process.env['EXPO_PUBLIC_SUPABASE_URL'] = 'https://example.supabase.co';
    process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] = 'anon';
    jest.resetModules();
    const { signInWithEmail } = require('../../app/services/auth');
    const res = await signInWithEmail('ok@example.com', 'pass');
    expect(res.userId).toBe('u_123');
    expect(res.error).toBeUndefined();
  });

  it('fails sign in with invalid credentials', async () => {
    process.env['EXPO_PUBLIC_SUPABASE_URL'] = 'https://example.supabase.co';
    process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] = 'anon';
    jest.resetModules();
    const { signInWithEmail } = require('../../app/services/auth');
    const res = await signInWithEmail('bad@example.com', 'nope');
    expect(res.userId).toBeNull();
    expect(res.error).toBeTruthy();
  });

  it('getCurrentUser returns null when env missing', async () => {
    delete process.env['EXPO_PUBLIC_SUPABASE_URL'];
    delete process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'];
    (process as unknown as { env: Record<string, string | undefined> }).env['NODE_ENV'] =
      'development';
    jest.resetModules();
    const { getCurrentUser } = require('../../app/services/auth');
    const u = await getCurrentUser();
    expect(u).toBeNull();
  });
});
