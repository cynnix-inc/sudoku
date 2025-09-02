import { Platform } from 'react-native';

// Dynamically require to avoid runtime issues in non-native/test environments

let Haptics: undefined | typeof import('expo-haptics');
try {
  Haptics = require('expo-haptics');
} catch {
  Haptics = undefined;
}

function isSupportedEnvironment(): boolean {
  // Disable on web and when module is unavailable (e.g., tests)
  return Platform.OS !== 'web' && !!Haptics;
}

export async function hapticSuccess(): Promise<void> {
  try {
    if (!isSupportedEnvironment() || !Haptics) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // no-op
  }
}

export async function hapticError(): Promise<void> {
  try {
    if (!isSupportedEnvironment() || !Haptics) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // no-op
  }
}
