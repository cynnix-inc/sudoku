-- Seed data for Ultimate Sudoku (deterministic). Safe to run multiple times.
-- Uses ON CONFLICT DO NOTHING to avoid duplicate inserts.
-- Tables assumed: auth.users (managed), public.saved_puzzles, public.leaderboard

-- Ensure required extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Demo user (example; typically created via auth API)
-- If you manage users via Supabase Auth, consider inserting into a public profile table instead.

-- Saved puzzle
CREATE TABLE IF NOT EXISTS public.saved_puzzles (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL,
	puzzle text NOT NULL,
	solution text NOT NULL,
	difficulty text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT now()
);

-- Leaderboard
CREATE TABLE IF NOT EXISTS public.leaderboard (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	username text NOT NULL,
	difficulty text NOT NULL,
	time_seconds integer NOT NULL,
	created_at timestamptz NOT NULL DEFAULT now(),
	UNIQUE (username, difficulty, time_seconds)
);

-- Insert one saved puzzle for a demo user (use a stable UUID for demo purposes)
INSERT INTO public.saved_puzzles (id, user_id, puzzle, solution, difficulty)
VALUES (
	'00000000-0000-0000-0000-000000000001',
	'00000000-0000-0000-0000-0000000000aa',
	'530070000600195000098000060800060003400803001700020006060000280000419005000080079',
	'534678912672195348198342567859761423426853791713924856961537284287419635345286179',
	'normal'
)
ON CONFLICT (id) DO NOTHING;

-- Insert one leaderboard row
INSERT INTO public.leaderboard (id, username, difficulty, time_seconds)
VALUES (
	'00000000-0000-0000-0000-0000000000bb',
	'guest',
	'normal',
	600
)
ON CONFLICT (username, difficulty, time_seconds) DO NOTHING;


