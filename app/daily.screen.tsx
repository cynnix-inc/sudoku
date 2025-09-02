import React, { useCallback, useMemo } from 'react';
import { createDailySeed, formatDailySeed } from './game/daily';
import type { Digit, Difficulty } from './game/types';
import GameScreenBase, { type BasePuzzle } from './components/GameScreenBase';
import { storageKeys } from './services/storage';
import { recordDailyResult } from './services/stats';
import { loadDailyPuzzle, dailyCacheKey } from './services/daily';
import SeedFooter from './components/SeedFooter';

// Router params not available in tests; default to today or to ?date=YYYYMMDD when router exists

function livesForDifficulty(d: Difficulty): number {
  switch (d) {
    case 'easy':
      return 6;
    case 'medium':
      return 5;
    case 'hard':
      return 4;
    case 'expert':
      return 3;
    case 'master':
      return 2;
    case 'extreme':
      return 1;
  }
}

export default function DailyScreen() {
  const selectedDate = useMemo(() => {
    try {
      const exp = require('expo-router');
      const useLocalSearchParams = exp?.useLocalSearchParams as
        | undefined
        | (() => Record<string, unknown>);
      if (typeof useLocalSearchParams === 'function') {
        const params = useLocalSearchParams() as { date?: unknown };
        const raw = typeof params?.date === 'string' ? params.date : undefined;
        if (raw && /^\d{8}$/.test(raw)) {
          const y = Number(raw.slice(0, 4));
          const m = Number(raw.slice(4, 6)) - 1;
          const d = Number(raw.slice(6, 8));
          return new Date(Date.UTC(y, m, d));
        }
      }
    } catch {
      // Router not available (tests/web without expo-router); fall back to today
    }
    return new Date();
  }, []);
  const seedObj = useMemo(() => createDailySeed(selectedDate), [selectedDate]);
  const seed = useMemo(() => formatDailySeed(seedObj), [seedObj]);

  const getPuzzle = useCallback((): BasePuzzle => {
    // Warm cache; ignore promise
    void loadDailyPuzzle(selectedDate);
    const { generateDailyPuzzle } = require('./game/daily');
    const p = generateDailyPuzzle(selectedDate);
    return {
      givens: p.givens as { row: number; col: number; value: Digit }[],
      difficulty: seedObj.difficulty,
      seed,
      maxLives: livesForDifficulty(seedObj.difficulty),
    };
  }, [selectedDate, seedObj.difficulty, seed]);

  const onRecord = useCallback(
    (difficulty: Difficulty, result: 'win' | 'loss', secondsElapsed: number) => {
      // Hints not yet implemented; record usedHints=false for now
      void recordDailyResult(seedObj.utcDate, difficulty, result, secondsElapsed, false);
    },
    [seedObj.utcDate],
  );

  const persistenceKey = useMemo(() => {
    const utc = seedObj.utcDate;
    // Avoid colliding with the daily cache key; use a dedicated progress key
    void dailyCacheKey(utc);
    return storageKeys.dailyProgress(utc);
  }, [seedObj.utcDate]);

  return (
    <>
      <GameScreenBase
        modeLabel="Daily"
        getPuzzle={getPuzzle}
        persistenceKey={persistenceKey}
        onRecord={onRecord}
        enableNewGame={false}
      />
      <SeedFooter seed={seed} />
    </>
  );
}
