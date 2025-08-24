import { createClient } from '@supabase/supabase-js';

const url = process.env['EXPO_PUBLIC_SUPABASE_URL'];
const anon = process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'];

const isTest = process.env['NODE_ENV'] === 'test';
if (!url || !anon) {
  console.warn(
    'Supabase env is missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
  );
}

export const supabase =
  !url || !anon ? (isTest ? createClient('', '') : null) : createClient(url, anon);
