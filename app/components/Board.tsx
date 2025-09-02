import React, { useContext } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { Board as BoardType, Digit } from '../game/types';
import { ThemeContext } from '../_layout';

export type BoardProps = {
  board: BoardType;
  selected: { row: number; col: number } | null;
  onSelect: (row: number, col: number) => void;
  highlightDigit?: Digit | null;
  showErrorHighlighting?: boolean;
  cellSize?: number;
};

export default function Board({
  board,
  selected,
  onSelect,
  highlightDigit = null,
  showErrorHighlighting = true,
  cellSize = 36,
}: BoardProps) {
  const theme = useContext(ThemeContext);
  const bandGap = 6;
  return (
    <View accessibilityLabel="Sudoku board" accessibilityRole="none">
      {board.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((cell, c) => {
            const isSelected = selected && selected.row === r && selected.col === c;
            const isHighlighted = highlightDigit != null && cell.value === highlightDigit;
            const showError = cell.isError && showErrorHighlighting;
            const borderColor = showError
              ? '#ef4444'
              : isSelected
                ? '#2563eb'
                : isHighlighted
                  ? '#93c5fd'
                  : theme.isDark
                    ? '#374151'
                    : '#d1d5db';
            const backgroundColor = cell.isGiven
              ? theme.isDark
                ? '#111827'
                : '#f4f4f5'
              : showError
                ? theme.isDark
                  ? '#7f1d1d'
                  : '#fee2e2'
                : theme.isDark
                  ? '#0f1115'
                  : '#ffffff';
            const noteDigits = Object.keys(cell.notes)
              .map((k) => Number(k))
              .sort((a, b) => a - b);
            return (
              <Pressable
                key={c}
                onPress={() => onSelect(r, c)}
                onFocus={() => onSelect(r, c)}
                accessibilityRole="button"
                accessibilityLabel={`Cell ${r + 1},${c + 1}`}
                accessibilityState={{ selected: !!isSelected, disabled: false }}
                accessibilityHint={`${
                  cell.value != null ? `Value ${cell.value}` : 'Empty'
                }${cell.isGiven ? ', given' : ''}${cell.isError ? ', error' : ''}${
                  isHighlighted ? ', highlighted' : ''
                }`}
                accessibilityValue={{
                  text:
                    cell.value != null
                      ? `Value ${cell.value}${cell.isGiven ? ', given' : ''}`
                      : noteDigits.length > 0
                        ? `Notes ${noteDigits.join('')}`
                        : 'Empty',
                }}
                testID={`cell-${r + 1}-${c + 1}${isHighlighted ? '-highlight' : ''}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor,
                  backgroundColor,
                  marginRight: c % 3 === 2 ? bandGap : 0,
                  marginBottom: r % 3 === 2 ? bandGap : 0,
                }}
              >
                {cell.value != null ? (
                  <Text
                    style={{
                      fontSize: Math.max(14, Math.round(cellSize * 0.5)),
                      fontWeight: cell.isGiven ? '700' : '400',
                      color: theme.foreground,
                    }}
                  >
                    {cell.value}
                  </Text>
                ) : noteDigits.length > 0 ? (
                  <Text
                    testID={`cell-${r + 1}-${c + 1}-notes`}
                    style={{ fontSize: 10, color: theme.isDark ? '#9ca3af' : '#6b7280' }}
                  >
                    {noteDigits.join('')}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 18, color: theme.foreground }}>{''}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
