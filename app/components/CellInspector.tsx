import React, { useContext } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Cell } from '../game/types';
import { ThemeContext } from '../_layout';

export type CellInspectorProps = {
  cell: Cell;
  visible: boolean;
  onClose: () => void;
};

export default function CellInspector({ cell, visible, onClose }: CellInspectorProps) {
  const theme = useContext(ThemeContext);
  if (!visible) return null;
  const notes = Object.keys(cell.notes)
    .map((k) => Number(k))
    .sort((a, b) => a - b);
  return (
    <View
      accessibilityLabel="Cell inspector"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <View
        style={{
          width: 280,
          maxWidth: '90%',
          padding: 12,
          borderWidth: 1,
          borderColor: theme.isDark ? '#374151' : '#d1d5db',
          borderRadius: 8,
          backgroundColor: theme.isDark ? '#0f1115' : '#ffffff',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700', color: theme.foreground }}>
          Cell ({cell.row + 1},{cell.col + 1})
        </Text>
        <View style={{ height: 8 }} />
        <Text style={{ fontSize: 14, color: theme.foreground }}>
          Value: {cell.value ?? 'Empty'} {cell.isGiven ? '(given)' : ''}
        </Text>
        <Text style={{ fontSize: 14, color: theme.foreground }}>
          Error: {cell.isError ? 'Yes' : 'No'}
        </Text>
        <Text style={{ fontSize: 14, color: theme.foreground }}>
          Notes: {notes.length > 0 ? notes.join('') : '—'}
        </Text>
        <View style={{ height: 12 }} />
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close inspector"
          style={{
            alignSelf: 'flex-end',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: theme.isDark ? '#374151' : '#d1d5db',
            borderRadius: 6,
            backgroundColor: theme.isDark ? '#0f1115' : '#ffffff',
          }}
        >
          <Text style={{ color: theme.foreground }}>Close</Text>
        </Pressable>
      </View>
    </View>
  );
}
