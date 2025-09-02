import type { GameConfig } from '../game/types';
import { loadProgress, saveProgress } from './storage';

export type StatsResult = 'win' | 'loss';

export type DailyResult = {
  date: string; // YYYYMMDD (UTC)
  result: StatsResult;
  seconds: number;
  usedHints: boolean;
};

export type StatsData = {
  schemaVersion: 2;
  totals: {
    played: number;
    wins: number;
    losses: number;
  };
  bestTimeByDifficulty: Partial<Record<GameConfig['difficulty'], number>>;
  recentDailyResults: DailyResult[];
  lastCalculated: number; // epoch ms
};

const STATS_KEY = 'sudoku-stats';
const RECENT_DAILY_MAX = 60;

// Forward declaration for TS
export async function getStreaks(): Promise<{ current: number; best: number }> {
  // implementation defined later; this is just to satisfy type usage before definition
  return { current: 0, best: 0 };
}

export async function loadStats(): Promise<StatsData | null> {
  const loaded = await loadProgress<unknown>(STATS_KEY);
  if (!loaded) return null;

  type StatsDataV1 = {
    schemaVersion: 1;
    totals?: { played: number; wins: number; losses: number };
    bestTimeByDifficulty?: Partial<Record<GameConfig['difficulty'], number>>;
  };

  function isStatsV1(data: unknown): data is StatsDataV1 {
    if (!data || typeof data !== 'object') return false;
    const maybe = data as { schemaVersion?: unknown };
    return maybe.schemaVersion === 1;
  }

  // Migrate v1 -> v2 (add recentDailyResults, lastCalculated)
  if (isStatsV1(loaded)) {
    const migrated: StatsData = {
      schemaVersion: 2 as const,
      totals: loaded.totals ?? { played: 0, wins: 0, losses: 0 },
      bestTimeByDifficulty: loaded.bestTimeByDifficulty ?? {},
      recentDailyResults: [],
      lastCalculated: Date.now(),
    };
    return migrated;
  }
  return loaded as StatsData;
}

export async function saveStats(data: StatsData): Promise<void> {
  await saveProgress(STATS_KEY, data);
}

type RecordOptions = {
  usedHints?: boolean;
  isDaily?: boolean;
  dateUTC?: string; // YYYYMMDD
};

export async function recordResult(
  difficulty: GameConfig['difficulty'],
  result: StatsResult,
  secondsElapsed: number,
  options?: RecordOptions,
): Promise<void> {
  const existing = (await loadStats()) ?? {
    schemaVersion: 2 as const,
    totals: { played: 0, wins: 0, losses: 0 },
    bestTimeByDifficulty: {},
    recentDailyResults: [],
    lastCalculated: 0,
  };

  const usedHints = options?.usedHints === true;
  const isDaily = options?.isDaily === true && typeof options?.dateUTC === 'string';

  const next: StatsData = {
    schemaVersion: 2 as const,
    totals: {
      played: existing.totals.played + 1,
      wins: existing.totals.wins + (result === 'win' ? 1 : 0),
      losses: existing.totals.losses + (result === 'loss' ? 1 : 0),
    },
    bestTimeByDifficulty: { ...existing.bestTimeByDifficulty },
    recentDailyResults: [...existing.recentDailyResults],
    lastCalculated: Date.now(),
  };

  if (result === 'win' && !usedHints) {
    const currentBest = next.bestTimeByDifficulty[difficulty];
    if (typeof currentBest !== 'number' || secondsElapsed < currentBest) {
      next.bestTimeByDifficulty[difficulty] = secondsElapsed;
    }
  }

  if (isDaily) {
    next.recentDailyResults.unshift({
      date: options!.dateUTC!,
      result,
      seconds: secondsElapsed,
      usedHints,
    });
    if (next.recentDailyResults.length > RECENT_DAILY_MAX) {
      next.recentDailyResults.length = RECENT_DAILY_MAX;
    }
  }

  await saveStats(next);
}

export async function recordDailyResult(
  dateUTC: string,
  difficulty: GameConfig['difficulty'],
  result: StatsResult,
  secondsElapsed: number,
  usedHints: boolean,
): Promise<void> {
  await recordResult(difficulty, result, secondsElapsed, {
    usedHints,
    isDaily: true,
    dateUTC,
  });
}

export type Streaks = { current: number; best: number };

function parseUTCDateToDayIndex(yyyyMMdd: string): number | null {
  if (!/^\d{8}$/.test(yyyyMMdd)) return null;
  const y = Number(yyyyMMdd.slice(0, 4));
  const m = Number(yyyyMMdd.slice(4, 6)) - 1;
  const d = Number(yyyyMMdd.slice(6, 8));
  const ms = Date.UTC(y, m, d);
  return Math.floor(ms / 86400000);
}

/**
 * Compute current and best daily win streaks (by UTC date) from a list of results.
 * - Multiple entries per day are collapsed: a day counts as a win if any result is a win.
 * - Current streak counts consecutive winning days starting from the most recent winning day
 *   and stops at the first gap.
 */
export function computeStreaks(results: DailyResult[]): Streaks {
  if (!Array.isArray(results) || results.length === 0) return { current: 0, best: 0 };

  // Collapse to per-day win flags
  const dayToWin = new Map<number, boolean>();
  for (const r of results) {
    const day = parseUTCDateToDayIndex(r.date);
    if (day == null) continue;
    if (r.result === 'win') {
      dayToWin.set(day, true);
    } else if (!dayToWin.has(day)) {
      dayToWin.set(day, false);
    }
  }

  // Keep only winning days; gaps implicitly break streaks
  const winDays = Array.from(dayToWin.entries())
    .filter(([, isWin]) => isWin)
    .map(([day]) => day)
    .sort((a, b) => b - a); // newest first

  if (winDays.length === 0) return { current: 0, best: 0 };

  let best = 0;
  let current = 0;
  let temp = 0;
  let prev: number | null = null;
  let atHead = true;

  for (const day of winDays) {
    if (prev == null) {
      temp = 1;
      current = 1; // first winning day always sets current streak to at least 1
    } else if (day === prev - 1) {
      temp += 1;
      if (atHead) current = temp;
    } else {
      // gap encountered; end of current streak window
      atHead = false;
      temp = 1;
    }
    if (temp > best) best = temp;
    prev = day;
  }

  return { current, best };
}

export type DifficultyStats = {
  played: number;
  wins: number;
  winRate: number;
  bestTime: number | null;
  averageTime: number | null;
};

export type DetailedStats = {
  overall: {
    played: number;
    wins: number;
    winRate: number;
    averageTime: number | null;
  };
  byDifficulty: Partial<Record<GameConfig['difficulty'], DifficultyStats>>;
  streaks: Streaks;
};

/**
 * Calculate detailed statistics by difficulty from game history
 * This is a placeholder - in a real implementation, you'd need to track
 * individual game results by difficulty, not just best times
 */
export function calculateDifficultyStats(
  bestTimes: Partial<Record<GameConfig['difficulty'], number>>,
): Partial<Record<GameConfig['difficulty'], DifficultyStats>> {
  const result: Partial<Record<GameConfig['difficulty'], DifficultyStats>> = {};

  // For now, we only have best times, so we'll show placeholder data
  // In a real implementation, you'd need to track individual game results
  const difficulties: GameConfig['difficulty'][] = [
    'easy',
    'medium',
    'hard',
    'expert',
    'master',
    'extreme',
  ];

  for (const difficulty of difficulties) {
    const bestTime = bestTimes[difficulty] || null;
    result[difficulty] = {
      played: 0, // Would need to be calculated from game history
      wins: 0, // Would need to be calculated from game history
      winRate: 0, // Would need to be calculated from game history
      bestTime,
      averageTime: null, // Would need to be calculated from game history
    };
  }

  return result;
}

/**
 * Get comprehensive statistics including per-difficulty breakdown
 */
export async function getDetailedStats(): Promise<DetailedStats | null> {
  const stats = await loadStats();
  if (!stats) {
    return {
      overall: { played: 0, wins: 0, winRate: 0, averageTime: null },
      byDifficulty: {},
      streaks: { current: 0, best: 0 },
    };
  }

  const overall = {
    played: stats.totals.played,
    wins: stats.totals.wins,
    winRate: stats.totals.played > 0 ? (stats.totals.wins / stats.totals.played) * 100 : 0,
    averageTime: null, // Would need to be calculated from game history
  };

  const byDifficulty = calculateDifficultyStats(stats.bestTimeByDifficulty);
  const streaks = await (async () => getStreaks())();

  return {
    overall,
    byDifficulty,
    streaks,
  };
}
