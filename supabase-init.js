import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supaUrl = (typeof window !== 'undefined' && window.SUPABASE_URL) ? window.SUPABASE_URL : '';
const supaKey = (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) ? window.SUPABASE_ANON_KEY : '';

if (supaUrl && supaKey && !/YOUR_SUPABASE/i.test(supaUrl) && !/YOUR_SUPABASE/i.test(supaKey)) {
  window.supabase = createClient(supaUrl, supaKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'sudoku-auth',
      storage: (typeof window !== 'undefined' ? window.localStorage : undefined),
      flowType: 'pkce'
    }
  });
} else {
  window.supabase = undefined;
} 