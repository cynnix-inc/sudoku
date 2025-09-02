import React from 'react';
import { View, Text } from 'react-native';

type ConfettiProps = {
  visible: boolean;
};

export default function Confetti({ visible }: ConfettiProps) {
  if (!visible) return null;
  const pieces = [
    { x: '10%', y: '10%', r: 0, e: '🎉' },
    { x: '80%', y: '12%', r: 0, e: '🎊' },
    { x: '25%', y: '20%', r: 0, e: '✨' },
    { x: '60%', y: '25%', r: 0, e: '🎉' },
    { x: '15%', y: '40%', r: 0, e: '🎊' },
    { x: '70%', y: '45%', r: 0, e: '✨' },
    { x: '35%', y: '60%', r: 0, e: '🎉' },
    { x: '85%', y: '65%', r: 0, e: '🎊' },
    { x: '20%', y: '75%', r: 0, e: '✨' },
    { x: '55%', y: '80%', r: 0, e: '🎉' },
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
