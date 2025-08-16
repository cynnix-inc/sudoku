import { useEffect, useMemo, useState } from "react";
import { supabase, type FeatureFlag } from "./supabase";

let cachedFlags: FeatureFlag[] | null = null;
let lastFetchedAt: number | null = null;

export function useRemoteFlags(): { flags: FeatureFlag[]; isEnabled: (key: string) => boolean } {
	const [flags, setFlags] = useState<FeatureFlag[]>(cachedFlags ?? []);

	useEffect(() => {
		let isMounted = true;
		const shouldRefresh = !lastFetchedAt || Date.now() - lastFetchedAt > 60_000; // 1 min TTL
		if (cachedFlags && !shouldRefresh) return;

		void (async () => {
			const { data, error } = await supabase
				.from("feature_flags")
				.select("key, value, enabled")
				.eq("enabled", true);
			if (error) return;
			if (!isMounted) return;
			cachedFlags = data as FeatureFlag[];
			lastFetchedAt = Date.now();
			setFlags(cachedFlags);
		})();

		return () => {
			isMounted = false;
		};
	}, []);

	const isEnabled = useMemo(() => {
		const map = new Map(flags.map((f) => [f.key, f.enabled] as const));
		return (key: string) => map.get(key) === true;
	}, [flags]);

	return { flags, isEnabled } as const;
}


