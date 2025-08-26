import React, { useContext } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ThemeContext } from './_layout';
import { router } from 'expo-router';

export default function NotFoundScreen() {
  const theme = useContext(ThemeContext);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text
        accessibilityRole="header"
        style={{ fontSize: 24, fontWeight: '700', marginBottom: 12, color: theme.foreground }}
      >
        Page not found
      </Text>
      <Text
        style={{
          fontSize: 14,
          opacity: 0.8,
          textAlign: 'center',
          marginBottom: 16,
          color: theme.foreground,
        }}
      >
        The page you’re looking for doesn’t exist. You can return to Home.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go home"
        onPress={() => router.replace('/')}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.foreground,
        }}
      >
        <Text style={{ color: theme.foreground, fontWeight: '600' }}>Return Home</Text>
      </Pressable>
    </View>
  );
}
