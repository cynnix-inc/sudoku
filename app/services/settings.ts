import { loadProgress, saveProgress } from './storage';

export type SettingsVersion = 1;

export type SettingsTimestamps = Partial<Record<keyof SettingsData['values'], number>> & {
  updatedAt?: number;
};

export type SettingsValues = {
  errorHighlighting: boolean;
  autoCandidates: 'on' | 'off' | 'default';
  autoAdvance: boolean;
  haptics: boolean;
  teachingPrompts: boolean; // Novice level prompts
  hintPathMode: 'off' | 'skilled'; // Skilled hint path influence
  theme: 'system' | 'light' | 'dark';
  accentColor: string;
  gridSize: number; // 0..2 small/medium/large
  inputSize: number; // 0..2
  notesSize: number; // 0..2
  calendarWeekStartsOn: 'mon' | 'sun';
  calendarFilter: 'all' | 'completed' | 'incomplete';
};

export type SettingsData = {
  settingsVersion: SettingsVersion;
  values: SettingsValues;
  timestamps: SettingsTimestamps;
  lastSyncAttempt?: number;
};

const SETTINGS_KEY = 'sudoku-settings';

const DEFAULT_SETTINGS: SettingsData = {
  settingsVersion: 1 as const,
  values: {
    errorHighlighting: true,
    autoCandidates: 'default',
    autoAdvance: true,
    haptics: true,
    teachingPrompts: true,
    hintPathMode: 'off',
    theme: 'system',
    accentColor: '#22c55e',
    gridSize: 1,
    inputSize: 1,
    notesSize: 1,
    calendarWeekStartsOn: 'mon',
    calendarFilter: 'all',
  },
  timestamps: {},
};

export async function loadSettings(): Promise<SettingsData> {
  const existing = await loadProgress<SettingsData>(SETTINGS_KEY);
  if (!existing) return { ...DEFAULT_SETTINGS };
  // Shallow migrate: ensure new fields exist without dropping user values
  const merged: SettingsData = {
    settingsVersion: 1 as const,
    values: { ...DEFAULT_SETTINGS.values, ...existing.values },
    timestamps: { ...existing.timestamps },
    lastSyncAttempt: existing.lastSyncAttempt,
  };
  return merged;
}

export async function saveSettings(next: SettingsData): Promise<void> {
  await saveProgress(SETTINGS_KEY, next);
}

export async function updateSettings<K extends keyof SettingsValues>(
  key: K,
  value: SettingsValues[K],
  updatedAt: number = Date.now(),
): Promise<SettingsData> {
  const current = await loadSettings();
  const next: SettingsData = {
    ...current,
    values: { ...current.values, [key]: value },
    timestamps: { ...current.timestamps, [key]: updatedAt, updatedAt },
  };
  await saveSettings(next);
  return next;
}

export function settingsKey(): string {
  return SETTINGS_KEY;
}
