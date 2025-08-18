-- Initial schema for Ultimate Sudoku
-- Ensure required extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- Saved puzzles (per-user)
create table if not exists public.saved_puzzles (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null,
	puzzle text not null,
	solution text not null,
	difficulty text not null,
	created_at timestamptz not null default now()
);

alter table public.saved_puzzles enable row level security;

-- Policies: user can read/write only their own rows
drop policy if exists "read_own_saved" on public.saved_puzzles;
create policy "read_own_saved" on public.saved_puzzles
  for select using (auth.uid() = user_id);

drop policy if exists "write_own_saved" on public.saved_puzzles;
create policy "write_own_saved" on public.saved_puzzles
  for insert with check (auth.uid() = user_id);

-- Leaderboard
create table if not exists public.leaderboard (
	id uuid primary key default gen_random_uuid(),
	username text not null,
	difficulty text not null,
	time_seconds integer not null,
	created_at timestamptz not null default now(),
	unique (username, difficulty, time_seconds)
);

alter table public.leaderboard enable row level security;

-- Policy: read allowed to all; writes to be managed later via RPC or auth guard
drop policy if exists "read_all_leaderboard" on public.leaderboard;
create policy "read_all_leaderboard" on public.leaderboard
  for select using (true);


