import React, { useContext, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ThemeContext } from './_layout';
import ClassicScreen from './classic';
import SettingsScreen from './settings.screen';
import DailyScreen from './daily.screen';
import DailyCalendarScreen from './daily.calendar.screen';
import StatsScreen from './stats.screen';
<<<<<<< HEAD
import HelpScreen from './help.screen';
=======
>>>>>>> 753225f (feat: implement stats screen for issue #46)

export default function IndexScreen() {
  const theme = useContext(ThemeContext);
  const [screen, setScreen] = useState<
<<<<<<< HEAD
    'home' | 'classic' | 'daily' | 'calendar' | 'settings' | 'stats' | 'help'
  >('home');

  const renderBackButton = () => (
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
  );
=======
    'home' | 'classic' | 'daily' | 'calendar' | 'settings' | 'stats'
  >('home');
>>>>>>> 753225f (feat: implement stats screen for issue #46)

  if (screen === 'classic') {
    return (
      <View style={{ flex: 1 }}>
        {renderBackButton()}
        <ClassicScreen />
      </View>
    );
  }

  if (screen === 'daily') {
    return (
      <View style={{ flex: 1 }}>
        {renderBackButton()}
        <DailyScreen />
      </View>
    );
  }

  if (screen === 'calendar') {
    return (
      <View style={{ flex: 1 }}>
        {renderBackButton()}
        <DailyCalendarScreen />
      </View>
    );
  }

  if (screen === 'settings') {
    return (
      <View style={{ flex: 1 }}>
        {renderBackButton()}
        <SettingsScreen />
      </View>
    );
  }

  if (screen === 'stats') {
    return (
      <View style={{ flex: 1 }}>
<<<<<<< HEAD
        {renderBackButton()}
=======
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
>>>>>>> 753225f (feat: implement stats screen for issue #46)
        <StatsScreen />
      </View>
    );
  }

<<<<<<< HEAD
  if (screen === 'help') {
    return (
      <View style={{ flex: 1 }}>
        {renderBackButton()}
        <HelpScreen />
      </View>
    );
  }

=======
>>>>>>> 753225f (feat: implement stats screen for issue #46)
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8, color: theme.foreground }}>
        Ultimate Sudoku
      </Text>
      <Text
        style={{
          fontSize: 16,
          opacity: 0.7,
          color: theme.foreground,
          textAlign: 'center',
          marginBottom: 40,
        }}
      >
        Welcome to the ultimate Sudoku experience
      </Text>

      {/* Game Modes */}
      <View style={{ width: '100%', marginBottom: 32 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 16,
            color: theme.foreground,
            textAlign: 'center',
          }}
        >
          Game Modes
        </Text>

        <Pressable
          onPress={() => setScreen('classic')}
          accessibilityRole="button"
          accessibilityLabel="Go to Classic Sudoku"
          style={{
            backgroundColor: theme.isDark ? '#1f2937' : '#f3f4f6',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 12,
            marginBottom: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.foreground }}>
            🎯 Play Classic 9×9
          </Text>
          <Text style={{ fontSize: 14, color: theme.foreground, opacity: 0.7, marginTop: 4 }}>
            Traditional Sudoku puzzles with multiple difficulty levels
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setScreen('daily')}
          accessibilityRole="button"
          accessibilityLabel="Go to Daily Challenge"
          style={{
            backgroundColor: theme.isDark ? '#1f2937' : '#f3f4f6',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 12,
            marginBottom: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.foreground }}>
            📅 Daily Challenge
          </Text>
          <Text style={{ fontSize: 14, color: theme.foreground, opacity: 0.7, marginTop: 4 }}>
            New puzzle every day - same for everyone worldwide
          </Text>
        </Pressable>

<<<<<<< HEAD
        <Pressable
          onPress={() => setScreen('calendar')}
          accessibilityRole="button"
          accessibilityLabel="Go to Daily Calendar"
          style={{
            backgroundColor: theme.isDark ? '#1f2937' : '#f3f4f6',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 12,
            marginBottom: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.foreground }}>
            📆 Daily Calendar
          </Text>
          <Text style={{ fontSize: 14, color: theme.foreground, opacity: 0.7, marginTop: 4 }}>
            View and play past daily puzzles
          </Text>
        </Pressable>
      </View>

      {/* Tools & Info */}
      <View style={{ width: '100%' }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 16,
            color: theme.foreground,
            textAlign: 'center',
          }}
        >
          Tools & Information
=======
      <Pressable
        onPress={() => setScreen('stats')}
        accessibilityRole="button"
        accessibilityLabel="Go to Stats"
      >
        <Text style={{ fontSize: 18, marginTop: 12, color: theme.isDark ? '#93c5fd' : '#2563eb' }}>
          Statistics
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setScreen('settings')}
        accessibilityRole="button"
        accessibilityLabel="Go to Settings"
      >
        <Text style={{ fontSize: 18, marginTop: 12, color: theme.isDark ? '#93c5fd' : '#2563eb' }}>
          Settings
>>>>>>> 753225f (feat: implement stats screen for issue #46)
        </Text>

        <Pressable
          onPress={() => setScreen('stats')}
          accessibilityRole="button"
          accessibilityLabel="View Game Statistics"
          style={{
            backgroundColor: theme.isDark ? '#1f2937' : '#f3f4f6',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 12,
            marginBottom: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.foreground }}>
            📊 Statistics
          </Text>
          <Text style={{ fontSize: 14, color: theme.foreground, opacity: 0.7, marginTop: 4 }}>
            Track your progress and best times
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setScreen('settings')}
          accessibilityRole="button"
          accessibilityLabel="Go to Settings"
          style={{
            backgroundColor: theme.isDark ? '#1f2937' : '#f3f4f6',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 12,
            marginBottom: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.foreground }}>
            ⚙️ Settings
          </Text>
          <Text style={{ fontSize: 14, color: theme.foreground, opacity: 0.7, marginTop: 4 }}>
            Customize your game experience
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setScreen('help')}
          accessibilityRole="button"
          accessibilityLabel="Get Help and Information"
          style={{
            backgroundColor: theme.isDark ? '#1f2937' : '#f3f4f6',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 12,
            marginBottom: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.foreground }}>
            ❓ Help & About
          </Text>
          <Text style={{ fontSize: 14, color: theme.foreground, opacity: 0.7, marginTop: 4 }}>
            Learn how to play and get support
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
