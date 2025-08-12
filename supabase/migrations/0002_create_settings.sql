-- Migration: Create settings table with RLS for Sudoku app (sync gameplay/calendar settings)
-- Safe to run multiple times

create table if not exists settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  updated_at timestamp with time zone not null default now(),
  prefs jsonb
);

alter table settings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'settings' and policyname = 'settings owners can read'
  ) then
    create policy "settings owners can read" on public.settings
      for select using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'settings' and policyname = 'settings owners can upsert'
  ) then
    create policy "settings owners can upsert" on public.settings
      for insert with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'settings' and policyname = 'settings owners can update'
  ) then
    create policy "settings owners can update" on public.settings
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'settings' and policyname = 'settings owners can delete'
  ) then
    create policy "settings owners can delete" on public.settings
      for delete using (auth.uid() = user_id);
  end if;
end $$;


