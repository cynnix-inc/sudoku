import type { GameConfig } from '../game/types';
import { loadProgress, saveProgress } from './storage';

export type StatsResult = 'win' | 'loss';

export type StatsData = {
  schemaVersion: 1;
  totals: {
    played: number;
    wins: number;
    losses: number;
  };
  bestTimeByDifficulty: Partial<Record<GameConfig['difficulty'], number>>;
};

const STATS_KEY = 'sudoku-stats';

export async function loadStats(): Promise<StatsData | null> {
  return loadProgress<StatsData>(STATS_KEY);
}

export async function saveStats(data: StatsData): Promise<void> {
  await saveProgress(STATS_KEY, data);
}

export async function recordResult(
  difficulty: GameConfig['difficulty'],
  result: StatsResult,
  secondsElapsed: number,
): Promise<void> {
  const existing = (await loadStats()) ?? {
    schemaVersion: 1 as const,
    totals: { played: 0, wins: 0, losses: 0 },
    bestTimeByDifficulty: {},
  };

  const next: StatsData = {
    schemaVersion: 1 as const,
    totals: {
      played: existing.totals.played + 1,
      wins: existing.totals.wins + (result === 'win' ? 1 : 0),
      losses: existing.totals.losses + (result === 'loss' ? 1 : 0),
    },
    bestTimeByDifficulty: { ...existing.bestTimeByDifficulty },
  };

  if (result === 'win') {
    const currentBest = next.bestTimeByDifficulty[difficulty];
    if (typeof currentBest !== 'number' || secondsElapsed < currentBest) {
      next.bestTimeByDifficulty[difficulty] = secondsElapsed;
    }
  }

  await saveStats(next);
}
