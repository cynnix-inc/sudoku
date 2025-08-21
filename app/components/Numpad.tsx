import React, { useContext } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { Digit } from '../game/types';
import { ThemeContext } from '../_layout';

export type NumpadProps = {
  lockedDigit: Digit | null;
  onDigit: (digit: Digit) => void;
  onToggleLock: (digit: Digit) => void;
  highlightDigit?: Digit | null;
};

const digits: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function Numpad({
  lockedDigit,
  onDigit,
  onToggleLock,
  highlightDigit = null,
}: NumpadProps) {
  const theme = useContext(ThemeContext);
  return (
    <View style={{ marginTop: 16 }}>
      <View testID="numpad-row" style={{ flexDirection: 'row', width: 36 * 9 + 2 * 6 }}>
        {digits.map((d, idx) => {
          const isLocked = lockedDigit === d;
          const isHighlighted = highlightDigit === d;
          return (
            <View key={d} style={{ marginRight: idx % 3 === 2 ? 6 : 0, marginBottom: 0 }}>
              <Pressable
                onPress={() => onDigit(d)}
                onLongPress={() => onToggleLock(d)}
                accessibilityRole="button"
                accessibilityLabel={`Digit ${d}${isLocked ? ' locked' : isHighlighted ? ' highlighted' : ''}`}
                style={{
                  width: 36,
                  height: 36,
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
                    fontSize: 18,
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
