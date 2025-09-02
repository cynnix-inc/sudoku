import React from 'react';
import { View, Text } from 'react-native';

type ConfettiProps = {
  visible: boolean;
};

export default function Confetti({ visible }: ConfettiProps) {
  if (!visible) return null;
  const pieces: { x: number; y: number; e: string }[] = [
    { x: 20, y: 20, e: '🎉' },
    { x: 280, y: 24, e: '🎊' },
    { x: 90, y: 60, e: '✨' },
    { x: 200, y: 80, e: '🎉' },
    { x: 40, y: 140, e: '🎊' },
    { x: 230, y: 160, e: '✨' },
    { x: 120, y: 220, e: '🎉' },
    { x: 300, y: 240, e: '🎊' },
    { x: 60, y: 280, e: '✨' },
    { x: 180, y: 320, e: '🎉' },
  ];
  return (
    <View
      pointerEvents="none"
      accessibilityLabel="Confetti overlay"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {pieces.map((p, i) => (
        <Text key={i} style={{ position: 'absolute', left: p.x, top: p.y, fontSize: 28 }}>
          {p.e}
        </Text>
      ))}
    </View>
  );
}
