import React, { useContext } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { Digit } from '../_game/types';
import { ThemeContext } from '../_layout';

export type NumpadProps = {
  lockedDigit: Digit | null;
  onDigit: (digit: Digit) => void;
  onToggleLock: (digit: Digit) => void;
  highlightDigit?: Digit | null;
  cellSize?: number;
};

const digits: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function Numpad({
  lockedDigit,
  onDigit,
  onToggleLock,
  highlightDigit = null,
  cellSize = 36,
}: NumpadProps) {
  const theme = useContext(ThemeContext);
  const minHit = 44; // ensure adequate hit size on small screens
  const size = Math.max(minHit, cellSize);
  const bandGap = 6;
  return (
    <View style={{ marginTop: 16 }}>
      <View testID="numpad-row" style={{ flexDirection: 'row', width: size * 9 + 2 * bandGap }}>
        {digits.map((d, idx) => {
          const isLocked = lockedDigit === d;
          const isHighlighted = highlightDigit === d;
          return (
            <View key={d} style={{ marginRight: idx % 3 === 2 ? bandGap : 0, marginBottom: 0 }}>
              <Pressable
                onPress={() => onDigit(d)}
                onLongPress={() => onToggleLock(d)}
                accessibilityRole="button"
                accessibilityLabel={`Digit ${d}${isLocked ? ' locked' : isHighlighted ? ' highlighted' : ''}`}
                style={{
                  width: size,
                  height: size,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: isLocked
                    ? '#60a5fa'
                    : isHighlighted
                      ? '#93c5fd'
                      : theme.isDark
                        ? '#374151'
                        : '#d1d5db',
                  borderRadius: 6,
                  backgroundColor: isLocked
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
                    fontSize: Math.max(16, Math.round(size * 0.5)),
                    fontWeight: isLocked ? '700' : '500',
                    color: theme.foreground,
                  }}
                >
                  {d}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
      <Text style={{ fontSize: 12, opacity: 0.7, color: theme.foreground }}>
        Long-press to lock a digit
      </Text>
    </View>
  );
}
