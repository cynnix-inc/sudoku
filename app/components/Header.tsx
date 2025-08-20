import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { ThemeContext } from '../_layout';
import type { GameConfig } from '../game/types';

type HeaderProps = {
  mode?: string;
  difficulty: GameConfig['difficulty'];
  livesRemaining: number;
  seconds: number;
};

export default function Header({
  mode = 'Classic',
  difficulty,
  livesRemaining,
  seconds,
}: HeaderProps) {
  const theme = useContext(ThemeContext);
  return (
    <View style={{ alignItems: 'center', marginBottom: 8 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 4, color: theme.foreground }}>
        {mode}
      </Text>
      <Text style={{ fontSize: 12, opacity: 0.7, marginBottom: 2, color: theme.foreground }}>
        Mode: {mode} • Difficulty: {difficulty}
      </Text>
      <Text
        accessibilityLabel="Elapsed time"
        style={{ fontSize: 12, opacity: 0.8, color: theme.foreground }}
      >
        Time: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')} • Lives:{' '}
        {livesRemaining}
      </Text>
    </View>
  );
}
