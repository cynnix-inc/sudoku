import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { buildMonthMatrix } from './services/dailyCalendar';
import { ThemeContext } from './_layout';

export default function DailyCalendarScreen() {
  const theme = React.useContext(ThemeContext);
  const now = useMemo(() => new Date(), []);
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const grid = useMemo(() => buildMonthMatrix(year, month, null, now), [year, month, now]);

  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12, color: theme.foreground }}>
        Daily Calendar (UTC)
      </Text>
      <View style={{ gap: 6 }}>
        {grid.map((week, wi) => (
          <View key={`w-${wi}`} style={{ flexDirection: 'row', gap: 6 }}>
            {week.map((day) => (
              <Pressable
                key={day.utcDate}
                accessibilityRole="button"
                accessibilityLabel={`${day.utcDate}${day.completed ? ' completed' : ''}${day.isFuture ? ' locked' : ''}`}
                accessibilityHint={day.isFuture ? 'Future dates are locked' : undefined}
                disabled={day.isFuture}
                // Navigation to Daily with a selected date is handled elsewhere
                style={{
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
                  backgroundColor: day.isToday
                    ? theme.isDark
                      ? '#1f2937'
                      : '#dbeafe'
                    : day.completed
                      ? theme.isDark
                        ? '#065f46'
                        : '#bbf7d0'
                      : theme.isDark
                        ? '#111827'
                        : '#f3f4f6',
                  opacity: day.isInMonth ? 1 : 0.5,
                }}
              >
                <Text style={{ color: theme.isDark ? '#e5e7eb' : '#111827', fontSize: 12 }}>
                  {day.utcDate.slice(6, 8)}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
