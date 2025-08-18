-- Seed data only; schema is created in migrations.

-- Ensure required extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Demo user (example; typically created via auth API)
-- If you manage users via Supabase Auth, consider inserting into a public profile table instead.

-- Example saved puzzle row

-- Example leaderboard row

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


