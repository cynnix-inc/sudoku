// __tests__/services/auth.test.ts
import { jest } from '@jest/globals';

jest.mock('../../app/services/supabase', () => {
  const signInWithPassword = jest.fn(
    async ({ email, password }: { email: string; password: string }) => {
      if (email === 'user@example.com' && password === 'correct') {
        return { data: { user: { id: 'u1', email } }, error: null };
      }
      return { data: { user: null }, error: { message: 'Invalid login credentials' } };
    },
  );
  const signOut = jest.fn(async () => ({ error: null }));
  return {
    __esModule: true,
    supabase: {
      auth: {
        signInWithPassword,
        signOut,
      },
    },
  };
});

import { signInWithEmail, signOut as signOutSvc } from '../../app/services/auth';

describe('auth service', () => {
  it('signInWithEmail succeeds with correct credentials', async () => {
    const res = await signInWithEmail('user@example.com', 'correct');
    expect(res.userId).toBe('u1');
    expect(res.error).toBeUndefined();
  });

  it('signInWithEmail fails with incorrect credentials', async () => {
    const res = await signInWithEmail('user@example.com', 'wrong');
    expect(res.userId).toBeNull();
    expect(res.error).toMatch(/invalid/i);
  });

  it('signOut succeeds', async () => {
    const res = await signOutSvc();
    expect(res.ok).toBe(true);
  });
});
