import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { Board as BoardType } from '../game/types';

export type BoardProps = {
  board: BoardType;
  selected: { row: number; col: number } | null;
  onSelect: (row: number, col: number) => void;
};

export default function Board({ board, selected, onSelect }: BoardProps) {
  return (
    <View>
      {board.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((cell, c) => {
            const isSelected = selected && selected.row === r && selected.col === c;
            const borderColor = cell.isError ? '#ef4444' : isSelected ? '#2563eb' : '#d1d5db';
            const backgroundColor = cell.isGiven ? '#f4f4f5' : cell.isError ? '#fee2e2' : '#ffffff';
            const noteDigits = Object.keys(cell.notes)
              .map((k) => Number(k))
              .sort((a, b) => a - b);
            return (
              <Pressable
                key={c}
                onPress={() => onSelect(r, c)}
                accessibilityRole="button"
                accessibilityLabel={`Cell ${r + 1},${c + 1}`}
                style={{
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor,
                  backgroundColor,
                  marginRight: c % 3 === 2 ? 6 : 0,
                  marginBottom: r % 3 === 2 ? 6 : 0,
                }}
              >
                {cell.value != null ? (
                  <Text style={{ fontSize: 18, fontWeight: cell.isGiven ? '700' : '400' }}>
                    {cell.value}
                  </Text>
                ) : noteDigits.length > 0 ? (
                  <Text
                    testID={`cell-${r + 1}-${c + 1}-notes`}
                    style={{ fontSize: 10, color: '#6b7280' }}
                  >
                    {noteDigits.join('')}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 18 }}>{''}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
