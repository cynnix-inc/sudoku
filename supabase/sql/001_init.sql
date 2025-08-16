-- Bootstrap schema for Ultimate Sudoku (no gameplay data yet)

-- Profiles table referencing auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Feature flags table
create table if not exists public.feature_flags (
  key text primary key,
  value jsonb,
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.feature_flags enable row level security;

-- Safe default policies
-- Profiles: users can read and update their own row; no insert/delete by default
create policy if not exists "Profiles: read own" on public.profiles
  for select using (auth.uid() = id);

create policy if not exists "Profiles: update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Feature flags: anyone (anon) can read enabled flags; no writes by default
create policy if not exists "Flags: read enabled" on public.feature_flags
  for select using (enabled = true);

-- Optionally, maintain updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_feature_flags on public.feature_flags;
create trigger set_updated_at_feature_flags
before update on public.feature_flags
for each row execute function public.set_updated_at();


