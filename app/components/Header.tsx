import React, { useContext } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeContext } from '../_layout';
import type { GameConfig } from '../_game/types';

type HeaderProps = {
  mode?: string;
  difficulty: GameConfig['difficulty'];
  livesRemaining: number;
  seconds: number;
  paused?: boolean;
  onTogglePause?: () => void;
  boardPixelWidth?: number;
};

export default function Header({
  mode = 'Classic',
  difficulty,
  livesRemaining,
  seconds,
  paused = false,
  onTogglePause,
  boardPixelWidth,
}: HeaderProps) {
  const theme = useContext(ThemeContext);
  return (
    <View style={{ alignItems: 'center', marginBottom: 8 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 4, color: theme.foreground }}>
        {mode}
      </Text>
      {/* Row with centered mode/difficulty and right-aligned timer + icon-only pause */}
      <View
        style={{ width: boardPixelWidth ?? 36 * 9, position: 'relative', alignItems: 'center' }}
      >
        <Text style={{ fontSize: 12, opacity: 0.7, marginBottom: 2, color: theme.foreground }}>
          Mode: {mode} • Difficulty: {difficulty}
        </Text>
        <Text
          accessibilityLabel="Elapsed time"
          style={{
            position: 'absolute',
            right: 24,
            top: 0,
            fontSize: 12,
            opacity: 0.8,
            color: theme.foreground,
          }}
        >
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
        </Text>
        <Pressable
          onPress={() => onTogglePause && onTogglePause()}
          accessibilityRole="button"
          accessibilityLabel={paused ? 'Resume timer' : 'Pause timer'}
          accessibilityHint={paused ? 'Resumes the game timer' : 'Pauses the game timer'}
          style={{
            position: 'absolute',
            right: 0,
            top: -2,
            width: 20,
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons
            name={paused ? 'play-arrow' : 'pause'}
            size={18}
            color={theme.foreground}
          />
        </Pressable>
      </View>
      {/* Hearts-only lives row with accessible label */}
      <View
        accessibilityLabel={`${livesRemaining} lives remaining`}
        style={{ flexDirection: 'row', gap: 4, marginTop: 2 }}
      >
        {[0, 1, 2].map((i) => (
          <MaterialIcons
            key={i}
            name={i < livesRemaining ? 'favorite' : 'favorite-border'}
            size={16}
            color={theme.isDark ? '#f87171' : '#ef4444'}
          />
        ))}
      </View>
    </View>
  );
}
