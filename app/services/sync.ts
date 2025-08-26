import { supabase } from './supabase';

export type SavedPuzzleInsert = {
  puzzle: string;
  solution: string;
  difficulty: string;
};

export type SavedPuzzleRecord = SavedPuzzleInsert & {
  id: string;
  user_id: string;
  created_at: string;
};

export async function pushSavedPuzzle(
  data: SavedPuzzleInsert,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!supabase) return { ok: false, error: 'Sync disabled: missing Supabase env' };
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) return { ok: false, error: userErr.message };
  const userId = userData?.user?.id;
  if (!userId) return { ok: false, error: 'Not signed in' };

  const payload = { ...data, user_id: userId } as const;
  const { data: inserted, error } = await supabase
    .from('saved_puzzles')
    .insert(payload)
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: inserted!.id as string };
}

export async function listSavedPuzzles(): Promise<
  { ok: true; items: SavedPuzzleRecord[] } | { ok: false; error: string }
> {
  if (!supabase) return { ok: false, error: 'Sync disabled: missing Supabase env' };
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) return { ok: false, error: userErr.message };
  const userId = userData?.user?.id;
  if (!userId) return { ok: false, error: 'Not signed in' };

  const { data, error } = await supabase
    .from('saved_puzzles')
    .select('id, user_id, puzzle, solution, difficulty, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return { ok: false, error: error.message };
  return { ok: true, items: (data ?? []) as SavedPuzzleRecord[] };
}
