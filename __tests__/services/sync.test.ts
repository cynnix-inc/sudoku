import { jest } from '@jest/globals';

jest.mock('@supabase/supabase-js', () => {
  const rows: {
    id: string;
    user_id: string;
    puzzle: string;
    solution: string;
    difficulty: string;
    created_at: string;
  }[] = [];
  let signedIn = true;
  const auth = {
    getUser: jest.fn(async () =>
      signedIn
        ? { data: { user: { id: 'u_1' } }, error: null }
        : { data: { user: null }, error: null },
    ),
  };
  const from = jest.fn((table: string) => {
    return {
      insert: (payload: {
        user_id: string;
        puzzle: string;
        solution: string;
        difficulty: string;
      }) => ({
        select: () => ({
          single: async () => {
            if (table !== 'saved_puzzles') return { data: null, error: null };
            const id = `id_${rows.length + 1}`;
            rows.push({
              id,
              user_id: payload.user_id,
              puzzle: payload.puzzle,
              solution: payload.solution,
              difficulty: payload.difficulty,
              created_at: new Date().toISOString(),
            });
            return { data: { id }, error: null };
          },
        }),
      }),
      select: () => ({
        eq: (
          col: 'user_id' | 'id' | 'puzzle' | 'solution' | 'difficulty' | 'created_at',
          val: string,
        ) => ({
          order: () => {
            const filtered =
              table === 'saved_puzzles' ? rows.filter((r) => String(r[col]) === val) : [];
            return Promise.resolve({ data: filtered, error: null });
          },
        }),
      }),
    };
  });
  const createClient = jest.fn(() => ({ auth, from }));
  return { createClient };
});

describe('sync service (#53)', () => {
  it('pushes and lists saved puzzles for the signed-in user', async () => {
    process.env['EXPO_PUBLIC_SUPABASE_URL'] = 'https://example.supabase.co';
    process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] = 'anon';
    process.env['NODE_ENV'] = 'test';
    jest.resetModules();
    const { pushSavedPuzzle, listSavedPuzzles } = require('../../app/services/sync');

    const push = await pushSavedPuzzle({ puzzle: 'p', solution: 's', difficulty: 'easy' });
    expect(push.ok).toBe(true);

    const list = await listSavedPuzzles();
    expect(list.ok).toBe(true);
  });
});
