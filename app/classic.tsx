import React, { useState } from 'react';
import GameScreenBase from './components/GameScreenBase';
import type { Difficulty, Digit } from './game/types';
import { recordResult } from './services/stats';
import SeedFooter from './components/SeedFooter';
import { FIXED_EASY_SEED, seedToGivens } from './game/fixtures';

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

export default function ClassicScreen() {
  const [seed] = useState<string>(FIXED_EASY_SEED);

  const getPuzzle = () => {
    const difficulty: Difficulty = 'easy';
    const givens = seedToGivens(seed) as { row: number; col: number; value: Digit }[];
    return {
      givens,
      difficulty,
      maxLives: livesForDifficulty(difficulty),
    };
  };

  return (
    <>
      <GameScreenBase
        modeLabel="Classic"
        getPuzzle={getPuzzle}
        persistenceKey="classic-progress"
        onRecord={(d, result, seconds) => {
          void recordResult(d, result, seconds);
        }}
        enableNewGame={true}
      />
      {/** keep SeedFooter to satisfy tests and UX expectations */}
      <SeedFooter seed={seed} />
    </>
  );
}
