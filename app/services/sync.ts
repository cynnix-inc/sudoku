import { supabase } from './supabase';
import { loadSettings, saveSettings, type SettingsData } from './settings';

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

// -----------------
// Settings syncing
// -----------------

type SettingsRow = {
  user_id: string;
  data: SettingsData;
  updated_at: string;
};

function pickNewestSettings(local: SettingsData, remote: SettingsData): SettingsData {
  const merged: SettingsData = {
    settingsVersion: local.settingsVersion,
    values: { ...local.values },
    timestamps: { ...local.timestamps },
    lastSyncAttempt:
      Math.max(local.lastSyncAttempt ?? 0, remote.lastSyncAttempt ?? 0) || Date.now(),
  };

  // Merge per-field by timestamp; default to local if timestamps missing
  const allKeys = new Set<keyof SettingsData['values']>([
    ...Object.keys(local.values),
    ...Object.keys(remote.values),
  ] as (keyof SettingsData['values'])[]);

  for (const key of allKeys) {
    const lts = (local.timestamps as Record<string, number | undefined>)[key] ?? 0;
    const rts = (remote.timestamps as Record<string, number | undefined>)[key] ?? 0;
    if (rts > lts) {
      merged.values[key] = remote.values[key] as never;
      merged.timestamps[key] = rts;
    } else {
      merged.values[key] = local.values[key] as never;
      merged.timestamps[key] = lts;
    }
  }

  // Stamp global updatedAt
  const latestStamp = Math.max(
    ...Object.values(merged.timestamps).map((n) => (typeof n === 'number' ? n : 0)),
  );
  merged.timestamps.updatedAt = latestStamp || Date.now();
  return merged;
}

export function mergeSettingsByTimestamps(local: SettingsData, remote: SettingsData): SettingsData {
  return pickNewestSettings(local, remote);
}

export async function syncSettings(): Promise<
  { ok: true; data: SettingsData } | { ok: false; error: string }
> {
  if (!supabase) return { ok: false, error: 'Sync disabled: missing Supabase env' };
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) return { ok: false, error: userErr.message };
  const userId = userData?.user?.id;
  if (!userId) return { ok: false, error: 'Not signed in' };

  const local = await loadSettings();

  const { data: remoteRow, error: fetchErr } = await supabase
    .from('user_settings')
    .select('user_id, data, updated_at')
    .eq('user_id', userId)
    .maybeSingle<SettingsRow>();
  if (fetchErr) return { ok: false, error: fetchErr.message };

  const merged = remoteRow ? pickNewestSettings(local, remoteRow.data) : local;

  // Upsert merged to remote
  const { error: upsertErr } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, data: merged })
    .select('user_id')
    .single();
  if (upsertErr) return { ok: false, error: upsertErr.message };

  await saveSettings(merged);
  return { ok: true, data: merged };
}
