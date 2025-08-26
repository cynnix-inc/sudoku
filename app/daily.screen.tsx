import React, { useCallback, useMemo } from 'react';
import { createDailySeed, formatDailySeed } from './game/daily';
import type { Digit, Difficulty } from './game/types';
import GameScreenBase, { type BasePuzzle } from './components/GameScreenBase';
import { storageKeys } from './services/storage';
import { recordResult } from './services/stats';
import { loadDailyPuzzle, dailyCacheKey } from './services/daily';

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
  const today = useMemo(() => new Date(), []);
  const seedObj = useMemo(() => createDailySeed(today), [today]);
  const seed = useMemo(() => formatDailySeed(seedObj), [seedObj]);

  const getPuzzle = useCallback((): BasePuzzle => {
    // Warm cache; ignore promise
    void loadDailyPuzzle(today);
    const { generateDailyPuzzle } = require('./game/daily');
    const p = generateDailyPuzzle(today);
    return {
      givens: p.givens as { row: number; col: number; value: Digit }[],
      difficulty: seedObj.difficulty,
      seed,
      maxLives: livesForDifficulty(seedObj.difficulty),
    };
  }, [today, seedObj.difficulty, seed]);

  const onRecord = useCallback(
    (difficulty: Difficulty, result: 'win' | 'loss', secondsElapsed: number) => {
      void recordResult(difficulty, result, secondsElapsed);
    },
    [],
  );

  const persistenceKey = useMemo(() => {
    const utc = seedObj.utcDate;
    // Avoid colliding with the daily cache key; use a dedicated progress key
    void dailyCacheKey(utc);
    return storageKeys.dailyProgress(utc);
  }, [seedObj.utcDate]);

  return (
    <GameScreenBase
      modeLabel="Daily"
      getPuzzle={getPuzzle}
      persistenceKey={persistenceKey}
      onRecord={onRecord}
      enableNewGame={false}
    />
  );
}
