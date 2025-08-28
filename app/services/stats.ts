import type { GameConfig } from '../game/types';
import { loadProgress, saveProgress } from './storage';

export type StatsResult = 'win' | 'loss';

export type DailyResult = {
  date: string; // YYYYMMDD (UTC)
  result: StatsResult;
  seconds: number;
  usedHints: boolean;
};

export type GameHistoryEntry = {
  id: string; // unique identifier for the game
  date: string; // YYYYMMDD (UTC)
  difficulty: GameConfig['difficulty'];
  result: StatsResult;
  seconds: number;
  usedHints: boolean;
  livesRemaining: number;
  totalMoves: number;
  completedAt: number; // epoch ms
};

export type StatsData = {
  schemaVersion: 3;
  totals: {
    played: number;
    wins: number;
    losses: number;
  };
  bestTimeByDifficulty: Partial<Record<GameConfig['difficulty'], number>>;
  recentDailyResults: DailyResult[];
  gameHistory: GameHistoryEntry[];
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

  type StatsDataV2 = {
    schemaVersion: 2;
    totals?: { played: number; wins: number; losses: number };
    bestTimeByDifficulty?: Partial<Record<GameConfig['difficulty'], number>>;
    recentDailyResults?: DailyResult[];
    lastCalculated?: number;
  };

  function isStatsV2(data: unknown): data is StatsDataV2 {
    if (!data || typeof data !== 'object') return false;
    const maybe = data as { schemaVersion?: unknown };
    return maybe.schemaVersion === 2;
  }

  // Migrate v1 -> v3 (add recentDailyResults, lastCalculated, gameHistory)
  if (isStatsV1(loaded)) {
    const migrated: StatsData = {
      schemaVersion: 3 as const,
      totals: loaded.totals ?? { played: 0, wins: 0, losses: 0 },
      bestTimeByDifficulty: loaded.bestTimeByDifficulty ?? {},
      recentDailyResults: [],
      gameHistory: [],
      lastCalculated: Date.now(),
    };
    return migrated;
  }

  // Migrate v2 -> v3 (add gameHistory)
  if (isStatsV2(loaded)) {
    const migrated: StatsData = {
      schemaVersion: 3 as const,
      totals: loaded.totals ?? { played: 0, wins: 0, losses: 0 },
      bestTimeByDifficulty: loaded.bestTimeByDifficulty ?? {},
      recentDailyResults: loaded.recentDailyResults ?? [],
      gameHistory: [],
      lastCalculated: loaded.lastCalculated ?? Date.now(),
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
    schemaVersion: 3 as const,
    totals: { played: 0, wins: 0, losses: 0 },
    bestTimeByDifficulty: {},
    recentDailyResults: [],
    gameHistory: [],
    lastCalculated: 0,
  };

  const usedHints = options?.usedHints === true;
  const isDaily = options?.isDaily === true && typeof options?.dateUTC === 'string';

  const next: StatsData = {
    schemaVersion: 3 as const,
    totals: {
      played: existing.totals.played + 1,
      wins: existing.totals.wins + (result === 'win' ? 1 : 0),
      losses: existing.totals.losses + (result === 'loss' ? 1 : 0),
    },
    bestTimeByDifficulty: { ...existing.bestTimeByDifficulty },
    recentDailyResults: [...existing.recentDailyResults],
    gameHistory: [...existing.gameHistory],
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

export async function recordGameHistory(
  difficulty: GameConfig['difficulty'],
  result: StatsResult,
  secondsElapsed: number,
  usedHints: boolean,
  livesRemaining: number,
  totalMoves: number,
): Promise<void> {
  const existing = (await loadStats()) ?? {
    schemaVersion: 3 as const,
    totals: { played: 0, wins: 0, losses: 0 },
    bestTimeByDifficulty: {},
    recentDailyResults: [],
    gameHistory: [],
    lastCalculated: 0,
  };

  const now = Date.now();
  const dateUTC = new Date(now).toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

  const historyEntry: GameHistoryEntry = {
    id: `${now}-${Math.random().toString(36).slice(2, 9)}`, // timestamp + random suffix
    date: dateUTC,
    difficulty,
    result,
    seconds: secondsElapsed,
    usedHints,
    livesRemaining,
    totalMoves,
    completedAt: now,
  };

  const next: StatsData = {
    ...existing,
    totals: {
      played: existing.totals.played + 1,
      wins: existing.totals.wins + (result === 'win' ? 1 : 0),
      losses: existing.totals.losses + (result === 'loss' ? 1 : 0),
    },
    bestTimeByDifficulty: { ...existing.bestTimeByDifficulty },
    gameHistory: [historyEntry, ...existing.gameHistory].slice(0, 100), // Keep last 100 games
    lastCalculated: now,
  };

  // Update best time if this is a win without hints
  if (result === 'win' && !usedHints) {
    const currentBest = next.bestTimeByDifficulty[difficulty];
    if (typeof currentBest !== 'number' || secondsElapsed < currentBest) {
      next.bestTimeByDifficulty[difficulty] = secondsElapsed;
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

export async function getStreaks(): Promise<Streaks> {
  const stats = (await loadStats()) ?? {
    schemaVersion: 3 as const,
    totals: { played: 0, wins: 0, losses: 0 },
    bestTimeByDifficulty: {},
    recentDailyResults: [],
    gameHistory: [],
    lastCalculated: 0,
  };
  return computeStreaks(stats.recentDailyResults);
}

export async function getGameHistory(limit: number = 50): Promise<GameHistoryEntry[]> {
  const stats = await loadStats();
  if (!stats) return [];
  return stats.gameHistory.slice(0, limit);
}

export type DifficultyStats = {
  played: number;
  wins: number;
  winRate: number;
  bestTime: number | null;
  averageTime: number | null;
  medianTime: number | null;
  fastestTime: number | null;
  slowestTime: number | null;
  totalPlayTime: number; // in seconds
  averageMoves: number | null;
  hintsUsageRate: number; // percentage of games where hints were used
};

export type DetailedStats = {
  overall: {
    played: number;
    wins: number;
    winRate: number;
    averageTime: number | null;
    medianTime: number | null;
    fastestTime: number | null;
    slowestTime: number | null;
    totalPlayTime: number; // in seconds
    averageMovesPerGame: number | null;
    hintsUsageRate: number; // percentage of games where hints were used
  };
  byDifficulty: Partial<Record<GameConfig['difficulty'], DifficultyStats>>;
  streaks: Streaks;
  trends: {
    recentWinRate: number; // win rate for last 10 games
    recentAverageTime: number | null; // average time for last 10 wins
    improvementTrend: 'improving' | 'declining' | 'stable';
  };
};

/**
 * Calculate percentile value from an array of numbers
 */
function calculatePercentile(values: number[], percentile: number): number | null {
  if (values.length === 0) return null;
  if (values.length === 1) return values[0];

  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);

  if (Number.isInteger(index)) {
    return sorted[index];
  }

  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Calculate detailed statistics by difficulty from game history
 */
export function calculateDifficultyStats(
  bestTimes: Partial<Record<GameConfig['difficulty'], number>>,
  gameHistory: GameHistoryEntry[],
): Partial<Record<GameConfig['difficulty'], DifficultyStats>> {
  const result: Partial<Record<GameConfig['difficulty'], DifficultyStats>> = {};

  const difficulties: GameConfig['difficulty'][] = [
    'easy',
    'medium',
    'hard',
    'expert',
    'master',
    'extreme',
  ];

  for (const difficulty of difficulties) {
    const gamesForDifficulty = gameHistory.filter((g) => g.difficulty === difficulty);
    const wins = gamesForDifficulty.filter((g) => g.result === 'win');
    const winTimes = wins.map((g) => g.seconds);
    const allTimes = gamesForDifficulty.map((g) => g.seconds);
    const moves = gamesForDifficulty.map((g) => g.totalMoves);
    const hintsUsed = gamesForDifficulty.filter((g) => g.usedHints).length;

    const bestTime = bestTimes[difficulty] || null;
    const averageTime =
      winTimes.length > 0
        ? Math.round(winTimes.reduce((sum, time) => sum + time, 0) / winTimes.length)
        : null;

    const medianTime = calculatePercentile(winTimes, 50);
    const fastestTime = winTimes.length > 0 ? Math.min(...winTimes) : null;
    const slowestTime = winTimes.length > 0 ? Math.max(...winTimes) : null;
    const totalPlayTime = allTimes.reduce((sum, time) => sum + time, 0);
    const averageMoves =
      moves.length > 0
        ? Math.round(moves.reduce((sum, move) => sum + move, 0) / moves.length)
        : null;
    const hintsUsageRate =
      gamesForDifficulty.length > 0 ? (hintsUsed / gamesForDifficulty.length) * 100 : 0;

    result[difficulty] = {
      played: gamesForDifficulty.length,
      wins: wins.length,
      winRate: gamesForDifficulty.length > 0 ? (wins.length / gamesForDifficulty.length) * 100 : 0,
      bestTime,
      averageTime,
      medianTime,
      fastestTime,
      slowestTime,
      totalPlayTime,
      averageMoves,
      hintsUsageRate,
    };
  }

  return result;
}

/**
 * Calculate trend analysis for recent performance
 */
function calculateTrends(gameHistory: GameHistoryEntry[]): DetailedStats['trends'] {
  const recentGames = gameHistory.slice(0, 10); // Last 10 games
  const recentWins = recentGames.filter((g) => g.result === 'win');
  const recentWinRate = recentGames.length > 0 ? (recentWins.length / recentGames.length) * 100 : 0;

  const recentWinTimes = recentWins.map((g) => g.seconds);
  const recentAverageTime =
    recentWinTimes.length > 0
      ? Math.round(recentWinTimes.reduce((sum, time) => sum + time, 0) / recentWinTimes.length)
      : null;

  // Compare recent performance with overall performance
  const allWins = gameHistory.filter((g) => g.result === 'win');
  const overallWinRate = gameHistory.length > 0 ? (allWins.length / gameHistory.length) * 100 : 0;

  let improvementTrend: 'improving' | 'declining' | 'stable' = 'stable';
  if (recentGames.length >= 5) {
    // Need enough data for trend analysis
    if (recentWinRate > overallWinRate + 5) {
      improvementTrend = 'improving';
    } else if (recentWinRate < overallWinRate - 5) {
      improvementTrend = 'declining';
    }
  }

  return {
    recentWinRate,
    recentAverageTime,
    improvementTrend,
  };
}

/**
 * Get comprehensive statistics including per-difficulty breakdown and trends
 */
export async function getDetailedStats(): Promise<DetailedStats> {
  const stats = await loadStats();
  if (!stats) {
    return {
      overall: {
        played: 0,
        wins: 0,
        winRate: 0,
        averageTime: null,
        medianTime: null,
        fastestTime: null,
        slowestTime: null,
        totalPlayTime: 0,
        averageMovesPerGame: null,
        hintsUsageRate: 0,
      },
      byDifficulty: {},
      streaks: { current: 0, best: 0 },
      trends: {
        recentWinRate: 0,
        recentAverageTime: null,
        improvementTrend: 'stable',
      },
    };
  }

  const winGames = stats.gameHistory.filter((g) => g.result === 'win');
  const winTimes = winGames.map((g) => g.seconds);
  const allTimes = stats.gameHistory.map((g) => g.seconds);
  const allMoves = stats.gameHistory.map((g) => g.totalMoves);
  const hintsUsed = stats.gameHistory.filter((g) => g.usedHints).length;

  const averageTime =
    winTimes.length > 0
      ? Math.round(winTimes.reduce((sum, time) => sum + time, 0) / winTimes.length)
      : null;

  const medianTime = calculatePercentile(winTimes, 50);
  const fastestTime = winTimes.length > 0 ? Math.min(...winTimes) : null;
  const slowestTime = winTimes.length > 0 ? Math.max(...winTimes) : null;
  const totalPlayTime = allTimes.reduce((sum, time) => sum + time, 0);
  const averageMovesPerGame =
    allMoves.length > 0
      ? Math.round(allMoves.reduce((sum, move) => sum + move, 0) / allMoves.length)
      : null;
  const hintsUsageRate =
    stats.gameHistory.length > 0 ? (hintsUsed / stats.gameHistory.length) * 100 : 0;

  const overall = {
    played: stats.gameHistory.length,
    wins: winGames.length,
    winRate: stats.gameHistory.length > 0 ? (winGames.length / stats.gameHistory.length) * 100 : 0,
    averageTime,
    medianTime,
    fastestTime,
    slowestTime,
    totalPlayTime,
    averageMovesPerGame,
    hintsUsageRate,
  };

  const byDifficulty = calculateDifficultyStats(stats.bestTimeByDifficulty, stats.gameHistory);
  const streaks = await getStreaks();
  const trends = calculateTrends(stats.gameHistory);

  return {
    overall,
    byDifficulty,
    streaks,
    trends,
  };
}

/**
 * Detect statistical outliers using the IQR method
 */
export function detectOutliers(values: number[]): {
  outliers: number[];
  bounds: { lower: number; upper: number };
} {
  if (values.length < 4) {
    return { outliers: [], bounds: { lower: 0, upper: 0 } };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const q1 = calculatePercentile(sorted, 25) || 0;
  const q3 = calculatePercentile(sorted, 75) || 0;
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers = values.filter((value) => value < lowerBound || value > upperBound);

  return {
    outliers,
    bounds: { lower: lowerBound, upper: upperBound },
  };
}

/**
 * Calculate performance benchmarks for a given difficulty
 */
export function calculatePerformanceBenchmarks(
  gameHistory: GameHistoryEntry[],
  difficulty: GameConfig['difficulty'],
): {
  beginner: number; // 25th percentile
  intermediate: number; // 50th percentile (median)
  advanced: number; // 75th percentile
  expert: number; // 90th percentile
} | null {
  const difficultyGames = gameHistory
    .filter((g) => g.difficulty === difficulty && g.result === 'win')
    .map((g) => g.seconds);

  if (difficultyGames.length < 4) return null;

  return {
    beginner: calculatePercentile(difficultyGames, 25) || 0,
    intermediate: calculatePercentile(difficultyGames, 50) || 0,
    advanced: calculatePercentile(difficultyGames, 75) || 0,
    expert: calculatePercentile(difficultyGames, 90) || 0,
  };
}

/**
 * Get performance insights and recommendations
 */
export async function getPerformanceInsights(): Promise<{
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
}> {
  const stats = await getDetailedStats();
  const insights = {
    strengths: [] as string[],
    areasForImprovement: [] as string[],
    recommendations: [] as string[],
  };

  // Analyze overall performance
  if (stats.overall.winRate >= 80) {
    insights.strengths.push('Excellent win rate');
  } else if (stats.overall.winRate >= 60) {
    insights.strengths.push('Good win rate');
  } else {
    insights.areasForImprovement.push('Win rate could be improved');
  }

  // Analyze difficulty performance
  const difficulties = ['easy', 'medium', 'hard', 'expert', 'master', 'extreme'] as const;
  for (const difficulty of difficulties) {
    const diffStats = stats.byDifficulty[difficulty];
    if (diffStats && diffStats.played > 0) {
      if (diffStats.winRate < 50) {
        insights.areasForImprovement.push(
          `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} difficulty needs work`,
        );
      }
      if (diffStats.hintsUsageRate > 80) {
        insights.recommendations.push(
          `Try to solve ${difficulty} puzzles without hints more often`,
        );
      }
    }
  }

  // Analyze trends
  if (stats.trends.improvementTrend === 'declining') {
    insights.areasForImprovement.push('Recent performance is declining');
    insights.recommendations.push('Consider taking a break or practicing easier puzzles');
  } else if (stats.trends.improvementTrend === 'improving') {
    insights.strengths.push('Performance is improving');
  }

  // Add general recommendations
  if (stats.overall.hintsUsageRate > 70) {
    insights.recommendations.push('Try to solve puzzles without hints to improve your skills');
  }

  if (stats.overall.played < 10) {
    insights.recommendations.push('Play more games to get better statistics');
  }

  return insights;
}

/**
 * Validate stats data integrity
 */
export async function validateStatsData(): Promise<{
  isValid: boolean;
  issues: string[];
  warnings: string[];
}> {
  const stats = await loadStats();
  if (!stats) {
    return { isValid: false, issues: ['No stats data found'], warnings: [] };
  }

  const issues: string[] = [];
  const warnings: string[] = [];

  // Check for data consistency - calculate actual totals from game history
  const actualPlayed = stats.gameHistory.length;
  const actualWins = stats.gameHistory.filter((g) => g.result === 'win').length;
  const actualLosses = stats.gameHistory.filter((g) => g.result === 'loss').length;

  if (stats.totals.played !== actualPlayed) {
    issues.push('Total games count does not match game history length');
  }

  if (stats.totals.wins !== actualWins || stats.totals.losses !== actualLosses) {
    issues.push('Win/loss counts do not match game history');
  }

  if (actualWins + actualLosses !== actualPlayed) {
    issues.push('Win/loss counts do not add up to total games played');
  }

  // Check for unrealistic values
  if (stats.totals.played > 10000) {
    warnings.push('Very high number of games played - may indicate data corruption');
  }

  // Check game history consistency
  for (const game of stats.gameHistory) {
    if (game.seconds < 0 || game.seconds > 86400) {
      // More than 24 hours
      issues.push(`Invalid game duration: ${game.seconds} seconds`);
    }
    if (game.totalMoves < 0 || game.totalMoves > 10000) {
      issues.push(`Invalid move count: ${game.totalMoves}`);
    }
    if (game.livesRemaining < 0 || game.livesRemaining > 3) {
      issues.push(`Invalid lives remaining: ${game.livesRemaining}`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
}
