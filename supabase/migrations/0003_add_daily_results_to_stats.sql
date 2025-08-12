-- Migration: Add daily_results to stats for syncing daily progress across devices
-- Safe to run multiple times

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'stats' and column_name = 'daily_results'
  ) then
    alter table public.stats add column daily_results jsonb;
  end if;
end $$;



