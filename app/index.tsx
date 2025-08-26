import React, { useContext, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ThemeContext } from './_layout';
import ClassicScreen from './classic';
import SettingsScreen from './settings.screen';
import DailyScreen from './daily.screen';

export default function IndexScreen() {
  const theme = useContext(ThemeContext);
  const [screen, setScreen] = useState<'home' | 'classic' | 'daily' | 'settings'>('home');

  if (screen === 'classic') {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 12, alignItems: 'flex-start' }}>
          <Pressable
            onPress={() => setScreen('home')}
            accessibilityRole="button"
            accessibilityLabel="Return Home"
            hitSlop={10}
            style={{ paddingHorizontal: 12, paddingVertical: 6 }}
          >
            <Text style={{ color: theme.foreground, fontSize: 16 }}>{'← Home'}</Text>
          </Pressable>
        </View>
        <ClassicScreen />
      </View>
    );
  }

  if (screen === 'daily') {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 12, alignItems: 'flex-start' }}>
          <Pressable
            onPress={() => setScreen('home')}
            accessibilityRole="button"
            accessibilityLabel="Return Home"
            hitSlop={10}
            style={{ paddingHorizontal: 12, paddingVertical: 6 }}
          >
            <Text style={{ color: theme.foreground, fontSize: 16 }}>{'← Home'}</Text>
          </Pressable>
        </View>
        <DailyScreen />
      </View>
    );
  }

  if (screen === 'settings') {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 12, alignItems: 'flex-start' }}>
          <Pressable
            onPress={() => setScreen('home')}
            accessibilityRole="button"
            accessibilityLabel="Return Home"
            hitSlop={10}
            style={{ paddingHorizontal: 12, paddingVertical: 6 }}
          >
            <Text style={{ color: theme.foreground, fontSize: 16 }}>{'← Home'}</Text>
          </Pressable>
        </View>
        <SettingsScreen />
      </View>
    );
  }

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

      <Pressable
        onPress={() => setScreen('classic')}
        accessibilityRole="button"
        accessibilityLabel="Go to Classic"
      >
        <Text style={{ fontSize: 18, marginTop: 20, color: theme.isDark ? '#93c5fd' : '#2563eb' }}>
          Play Classic 9×9
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setScreen('daily')}
        accessibilityRole="button"
        accessibilityLabel="Go to Daily"
      >
        <Text style={{ fontSize: 18, marginTop: 12, color: theme.isDark ? '#93c5fd' : '#2563eb' }}>
          Play Daily
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setScreen('settings')}
        accessibilityRole="button"
        accessibilityLabel="Go to Settings"
      >
        <Text style={{ fontSize: 18, marginTop: 12, color: theme.isDark ? '#93c5fd' : '#2563eb' }}>
          Settings
        </Text>
      </Pressable>
    </View>
  );
}
