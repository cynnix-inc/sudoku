// Provide default placeholders if env.js did not define these
try {
  if (typeof window !== 'undefined') {
    window.SUPABASE_URL = window.SUPABASE_URL || 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co';
    window.SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
  }
} catch {}
