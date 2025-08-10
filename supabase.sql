-- Supabase schema for Sudoku stats syncing

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
  by_difficulty jsonb
);

alter table stats enable row level security;

create policy if not exists "stats owners can read" on stats
  for select using (auth.uid() = user_id);

create policy if not exists "stats owners can upsert" on stats
  for insert with check (auth.uid() = user_id);

create policy if not exists "stats owners can update" on stats
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "stats owners can delete" on stats
  for delete using (auth.uid() = user_id);


