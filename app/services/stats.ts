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
