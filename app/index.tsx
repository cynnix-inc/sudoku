import React, { useContext } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import type { Href } from 'expo-router';
import { ThemeContext } from './_layout';

export default function IndexScreen() {
  const theme = useContext(ThemeContext);
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8, color: theme.foreground }}>
        Hello world
      </Text>
      <Text style={{ fontSize: 16, opacity: 0.7, color: theme.foreground }}>
        Welcome to Ultimate Sudoku
      </Text>
      {(() => {
        const classicHref = '/classic' as unknown as Href;
        return (
          <Link href={classicHref} asChild>
            <Pressable accessibilityRole="button" accessibilityLabel="Go to Classic">
              <Text
                style={{ fontSize: 18, marginTop: 20, color: theme.isDark ? '#93c5fd' : '#2563eb' }}
              >
                Play Classic 9×9
              </Text>
            </Pressable>
          </Link>
        );
      })()}

      {(() => {
        const dailyHref = '/daily' as unknown as Href;
        return (
          <Link href={dailyHref} asChild>
            <Pressable accessibilityRole="button" accessibilityLabel="Go to Daily">
              <Text
                style={{ fontSize: 18, marginTop: 12, color: theme.isDark ? '#93c5fd' : '#2563eb' }}
              >
                Play Daily
              </Text>
            </Pressable>
          </Link>
        );
      })()}
    </View>
  );
}
