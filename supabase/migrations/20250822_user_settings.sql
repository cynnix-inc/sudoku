-- user_settings table for per-user settings sync
create table if not exists public.user_settings (
  user_id uuid primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

-- Policies: user can read/write own row
drop policy if exists "read_own_settings" on public.user_settings;
create policy "read_own_settings" on public.user_settings
  for select using (auth.uid() = user_id);

drop policy if exists "write_own_settings" on public.user_settings;
create policy "write_own_settings" on public.user_settings
  for insert with check (auth.uid() = user_id);

drop policy if exists "update_own_settings" on public.user_settings;
create policy "update_own_settings" on public.user_settings
  for update using (auth.uid() = user_id);


