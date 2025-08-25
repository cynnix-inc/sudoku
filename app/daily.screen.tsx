import React, { useMemo } from 'react';
import { View } from 'react-native';
import Header from './components/Header';
import Board from './components/Board';
import SeedFooter from './components/SeedFooter';
import { initializeGame } from './game/state';
import type { Digit } from './game/types';
import { generateDailyPuzzle } from './game/daily';

export default function DailyScreen() {
  const daily = useMemo(() => generateDailyPuzzle(new Date()), []);
  const seed = useMemo(() => {
    // Derive a stable seed string for footer from today's daily
    // Use ISO date + count of givens to make it deterministic but simple
    const d = new Date();
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}${m}${day}-D-${daily.givens.length}`;
  }, [daily.givens.length]);

  const game = useMemo(
    () =>
      initializeGame(daily.givens as { row: number; col: number; value: Digit }[], {
        difficulty: 'easy',
        maxLives: 3,
      }),
    [daily.givens],
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
