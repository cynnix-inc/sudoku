import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, Switch } from 'react-native';
import { ThemeContext } from './_layout';
import { loadSettings, updateSettings, type SettingsData } from './services/settings';

export default function SettingsScreen() {
  const theme = useContext(ThemeContext);
  const [settings, setSettings] = useState<SettingsData | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const s = await loadSettings();
      if (mounted) setSettings(s);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onToggle = useCallback(
    async (key: 'autoAdvance' | 'haptics' | 'errorHighlighting', value: boolean) => {
      const next = await updateSettings(key, value);
      setSettings(next);
    },
    [],
  );

  if (!settings) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.foreground, opacity: 0.7 }}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 16, color: theme.foreground }}>
        Settings
      </Text>

      <View style={{ paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text
          style={{ fontSize: 16, color: theme.foreground }}
          accessibilityLabel="Auto advance input label"
        >
          Auto advance input
        </Text>
        <Switch
          accessibilityLabel="Auto advance input"
          value={settings.values.autoAdvance}
          onValueChange={(v) => onToggle('autoAdvance', v)}
        />
      </View>

      <View style={{ paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 16, color: theme.foreground }} accessibilityLabel="Haptics label">
          Haptics
        </Text>
        <Switch
          accessibilityLabel="Haptics"
          value={settings.values.haptics}
          onValueChange={(v) => onToggle('haptics', v)}
        />
      </View>

      <View style={{ paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text
          style={{ fontSize: 16, color: theme.foreground }}
          accessibilityLabel="Error highlighting label"
        >
          Error highlighting
        </Text>
        <Switch
          accessibilityLabel="Error highlighting"
          value={settings.values.errorHighlighting}
          onValueChange={(v) => onToggle('errorHighlighting', v)}
        />
      </View>
    </View>
  );
}
