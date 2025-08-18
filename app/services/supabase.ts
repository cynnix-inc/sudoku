import { createClient } from "@supabase/supabase-js";

const url = process.env["EXPO_PUBLIC_SUPABASE_URL"];
const anon = process.env["EXPO_PUBLIC_SUPABASE_ANON_KEY"];

if (!url || !anon) {
	console.warn(
		"Supabase env is missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
	);
}

export const supabase = createClient(url ?? "", anon ?? "");


