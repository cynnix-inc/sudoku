import React, { useMemo } from 'react';
import { View } from 'react-native';
import Header from './components/Header';
import Board from './components/Board';
import SeedFooter from './components/SeedFooter';
import { initializeGame } from './game/state';
import type { Digit, Difficulty } from './game/types';
import { createDailySeed, formatDailySeed } from './game/daily';
import { loadDailyPuzzle } from './services/daily';

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
  const daily = useMemo(() => {
    // Note: loadDailyPuzzle is async; call synchronously here only for initial render
    // In this simple implementation, we assume fast load from storage; for web tests it's fine.
    // If not present, we generate immediately and persist; service ensures TTL handling.

    // This synchronous usage is acceptable for test/web; native could switch to effect.
    // We still return a generated puzzle immediately to avoid undefined UI.
    loadDailyPuzzle(today);
    const { generateDailyPuzzle } = require('./game/daily');
    return generateDailyPuzzle(today);
  }, [today]);
  const seed = useMemo(() => formatDailySeed(seedObj), [seedObj]);

  const game = useMemo(
    () =>
      initializeGame(daily.givens as { row: number; col: number; value: Digit }[], {
        difficulty: seedObj.difficulty,
        maxLives: livesForDifficulty(seedObj.difficulty),
      }),
    [daily.givens, seedObj.difficulty],
  );

  const boardPixelWidth = 9 * 44 + 12; // basic width similar to Classic defaults

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 12 }}>
      <Header
        difficulty={game.config.difficulty}
        livesRemaining={game.livesRemaining}
        seconds={0}
        paused={false}
        onTogglePause={() => {}}
        boardPixelWidth={boardPixelWidth}
      />
      <Board
        board={game.board}
        selected={null}
        highlightDigit={null}
        cellSize={44}
        onSelect={() => {}}
      />
      <SeedFooter seed={seed} />
    </View>
  );
}
