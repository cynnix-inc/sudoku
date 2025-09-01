import React, { useCallback, useMemo, useState, useContext } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Platform } from 'react-native';
import { ThemeContext } from './_layout';
import type { Difficulty, Digit } from './game/types';
import { generatePuzzle } from './game/engine/generator';
import GameScreenBase, { type BasePuzzle } from './components/GameScreenBase';
import SeedFooter from './components/SeedFooter';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'master', 'extreme'];

export default function SeededLoaderScreen() {
  const theme = useContext(ThemeContext);
  const [seed, setSeed] = useState<string>(() => String(Math.floor(Date.now() / 1000)));
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameKey, setGameKey] = useState<string>('');

  const onStart = useCallback(() => {
    setGameKey(`${seed}:${difficulty}:${Date.now()}`);
  }, [seed, difficulty]);

  const getPuzzle = useCallback((): BasePuzzle => {
    const p = generatePuzzle({ seed, difficulty });
    return {
      givens: p.givens as { row: number; col: number; value: Digit }[],
      difficulty,
      seed,
      maxLives: livesForDifficulty(difficulty),
    };
  }, [seed, difficulty]);

  const persistenceKey = useMemo(() => `seeded-progress:${seed}:${difficulty}`, [seed, difficulty]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Text style={{ color: theme.foreground, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
        DevTools · Seeded Loader
      </Text>

      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: theme.foreground, fontSize: 14, marginBottom: 6 }}>Seed</Text>
        <TextInput
          value={seed}
          onChangeText={setSeed}
          placeholder="Enter seed string"
          placeholderTextColor={theme.isDark ? '#6b7280' : '#9ca3af'}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            color: theme.foreground,
            backgroundColor: theme.isDark ? '#0f1115' : '#ffffff',
            borderWidth: 1,
            borderColor: theme.isDark ? '#374151' : '#d1d5db',
            borderRadius: 6,
            paddingHorizontal: 10,
            paddingVertical: Platform.OS === 'web' ? 8 : 10,
          }}
        />
      </View>

      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: theme.foreground, fontSize: 14, marginBottom: 6 }}>Difficulty</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {DIFFICULTIES.map((d) => (
            <Pressable
              key={d}
              onPress={() => setDifficulty(d)}
              accessibilityRole="button"
              accessibilityLabel={`Set difficulty to ${d}`}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: d === difficulty ? '#60a5fa' : theme.isDark ? '#374151' : '#d1d5db',
                borderRadius: 6,
                backgroundColor:
                  d === difficulty
                    ? theme.isDark
                      ? '#0b3a64'
                      : '#dbeafe'
                    : theme.isDark
                      ? '#0f1115'
                      : '#ffffff',
              }}
            >
              <Text
                style={{
                  color: theme.foreground,
                  fontSize: 12,
                  fontWeight: d === difficulty ? '700' : '500',
                }}
              >
                {d}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <Pressable
          onPress={() => setSeed(String(Math.floor(Date.now() / 1000)))}
          accessibilityRole="button"
          accessibilityLabel="Use current timestamp as seed"
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: theme.isDark ? '#374151' : '#d1d5db',
            borderRadius: 6,
            backgroundColor: theme.isDark ? '#0f1115' : '#ffffff',
          }}
        >
          <Text style={{ color: theme.foreground, fontSize: 12 }}>Use timestamp</Text>
        </Pressable>

        <Pressable
          onPress={onStart}
          accessibilityRole="button"
          accessibilityLabel="Start seeded game"
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: '#60a5fa',
            borderRadius: 6,
            backgroundColor: theme.isDark ? '#0b3a64' : '#dbeafe',
          }}
        >
          <Text style={{ color: theme.foreground, fontSize: 14, fontWeight: '700' }}>Start</Text>
        </Pressable>
      </View>

      {gameKey ? (
        <View>
          <GameScreenBase
            key={gameKey}
            modeLabel="Seeded"
            getPuzzle={getPuzzle}
            persistenceKey={persistenceKey}
            onRecord={() => {}}
            enableNewGame={false}
          />
          <SeedFooter seed={seed} />
        </View>
      ) : null}
    </ScrollView>
  );
}

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
