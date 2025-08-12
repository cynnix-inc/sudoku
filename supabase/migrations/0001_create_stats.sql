-- Migration: Create stats table with RLS for Sudoku app
-- Safe to run multiple times in case of re-push

create table if not exists stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  updated_at timestamp with time zone not null default now(),
  total_played int not null default 0,
  total_wins int not null default 0,
  total_losses int not null default 0,
  best_easy int,
  best_medium int,
  best_hard int,
  best_expert int,
  best_master int,
  best_extreme int,
  by_difficulty jsonb,
  daily_results jsonb
);

alter table stats enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'stats' and policyname = 'stats owners can read'
  ) then
    create policy "stats owners can read" on public.stats
      for select using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'stats' and policyname = 'stats owners can upsert'
  ) then
    create policy "stats owners can upsert" on public.stats
      for insert with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'stats' and policyname = 'stats owners can update'
  ) then
    create policy "stats owners can update" on public.stats
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'stats' and policyname = 'stats owners can delete'
  ) then
    create policy "stats owners can delete" on public.stats
      for delete using (auth.uid() = user_id);
  end if;
end $$;


