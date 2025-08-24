import React, { useContext, useState } from 'react';
import { Text, View, Pressable, Platform } from 'react-native';
import { ThemeContext } from '../_layout';

type SeedFooterProps = {
  seed: string;
};

type MinimalClipboard = { writeText?: (text: string) => Promise<void> | void };
type MinimalNavigator = { clipboard?: MinimalClipboard };

export default function SeedFooter({ seed }: SeedFooterProps) {
  const theme = useContext(ThemeContext);
  const [copied, setCopied] = useState(false);

  async function copySeedToClipboard(text: string) {
    try {
      // Prefer web Clipboard API when available (also works in jsdom tests)
      const nav: MinimalNavigator | undefined =
        typeof globalThis !== 'undefined'
          ? (globalThis as unknown as { navigator?: MinimalNavigator }).navigator
          : undefined;
      const clipboard: MinimalClipboard | undefined = nav?.clipboard;
      if (clipboard && typeof clipboard.writeText === 'function') {
        await clipboard.writeText(text);
      } else if (Platform.OS !== 'web') {
        // Fallback to expo-clipboard on native
        try {
          const mod = await import('expo-clipboard');
          if ('setStringAsync' in mod && typeof mod.setStringAsync === 'function') {
            await mod.setStringAsync(text);
          } else if (
            'setString' in mod &&
            typeof (mod as unknown as { setString: (t: string) => void }).setString === 'function'
          ) {
            (mod as unknown as { setString: (t: string) => void }).setString(text);
          }
        } catch {
          // Clipboard not available; ignore
        }
      } else {
        // Last resort: execCommand (legacy)
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      globalThis.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Swallow copy errors to avoid crashing UI
    }
  }

  return (
    <View style={{ marginTop: 12, alignItems: 'center' }}>
      <Pressable
        onPress={() => copySeedToClipboard(seed)}
        accessibilityRole="button"
        accessibilityLabel="Seed footer"
        accessibilityHint="Tap to copy the puzzle seed to the clipboard"
        style={{ paddingHorizontal: 4, paddingVertical: 2 }}
      >
        <Text
          style={{
            fontSize: 12,
            opacity: 0.6,
            color: theme.foreground,
            textDecorationLine: 'underline',
          }}
        >
          {seed}
        </Text>
      </Pressable>
      {copied ? (
        <Text
          accessibilityLabel="Seed copied"
          style={{ fontSize: 12, marginTop: 6, color: theme.isDark ? '#34d399' : '#065f46' }}
        >
          Copied!
        </Text>
      ) : null}
    </View>
  );
}
