import { supabase } from './supabase';

export type AuthUser = {
  id: string;
  email?: string | null;
};

export type SignInResult = {
  userId: string | null;
  error?: string;
};

export async function signInWithEmail(email: string, password: string): Promise<SignInResult> {
  if (!supabase) {
    return { userId: null, error: 'Auth disabled: missing Supabase env' };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { userId: null, error: error.message };
  return { userId: data.user?.id ?? null };
}

export async function signOut(): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: true };
  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  const user = data.user;
  if (!user) return null;
  return { id: user.id, email: (user as { email?: string | null }).email };
}
