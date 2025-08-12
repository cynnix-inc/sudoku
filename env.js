// Fallback env.js committed for static hosting. Safe defaults only.
// A CI or local build may overwrite this file via `npm run build:env`.
(function(){
  try {
    // Empty values keep Supabase disabled unless provided via generated env.js
    window.SUPABASE_URL = window.SUPABASE_URL || '';
    window.SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';
    // Allow showing app version if generated later; keep empty by default
    window.APP_VERSION = window.APP_VERSION || '';
  } catch {}
})();

// Generated from .env. Do not commit secrets; .env is gitignored.
(function(){
  try {
    window.SUPABASE_URL = "https://lfxdjfemyinnnnkpedgm.supabase.co";
    window.SUPABASE_ANON_KEY = "sb_publishable_tDaDAPdDDidpP63D7ZKJzQ_rPW0Qbks";
    window.APP_VERSION = "1.0.1";
  } catch {}
})();
