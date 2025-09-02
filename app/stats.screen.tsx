import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ThemeContext } from './_layout';
import { loadStats, type StatsData } from './services/stats';

export default function StatsScreen() {
  const theme = useContext(ThemeContext);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const loadedStats = await loadStats();
        if (mounted) {
          setStats(loadedStats);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.foreground, opacity: 0.7 }}>Loading stats…</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.foreground, opacity: 0.7 }}>No stats available</Text>
      </View>
    );
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const difficulties: Array<keyof StatsData['bestTimeByDifficulty']> = [
    'easy',
    'medium',
    'hard',
    'expert',
    'master',
    'extreme',
  ];

  // Build a simple histogram of recent daily completion times (wins only)
  const buckets = [
    { label: '0–2m', max: 120 },
    { label: '2–5m', max: 300 },
    { label: '5–10m', max: 600 },
    { label: '10–20m', max: 1200 },
    { label: '20m+', max: Infinity },
  ];
  const histCounts = buckets.map(() => 0);
  for (const r of stats.recentDailyResults) {
    if (r.result !== 'win') continue;
    const secs = r.seconds;
    const idx = buckets.findIndex((b) => secs <= b.max);
    if (idx >= 0) histCounts[idx]! += 1;
  }
  const maxCount = Math.max(1, ...histCounts);

  const winRate =
    stats.totals.played > 0 ? ((stats.totals.wins / stats.totals.played) * 100).toFixed(1) : '0.0';

  return (
    <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 16, color: theme.foreground }}>
        Game Statistics
      </Text>

      {/* Overall Stats */}
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: theme.foreground }}
        >
          Overall Performance
        </Text>
        <View
          style={{
            backgroundColor: theme.isDark ? '#1f2937' : '#f3f4f6',
            padding: 16,
            borderRadius: 8,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: theme.foreground }}>Games Played:</Text>
            <Text style={{ color: theme.foreground, fontWeight: '600' }}>
              {stats.totals.played}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: theme.foreground }}>Wins:</Text>
            <Text style={{ color: theme.foreground, fontWeight: '600' }}>{stats.totals.wins}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: theme.foreground }}>Losses:</Text>
            <Text style={{ color: theme.foreground, fontWeight: '600' }}>
              {stats.totals.losses}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.foreground }}>Win Rate:</Text>
            <Text style={{ color: theme.foreground, fontWeight: '600' }}>{winRate}%</Text>
          </View>
        </View>
      </View>

      {/* Best Times by Difficulty */}
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: theme.foreground }}
        >
          Best Times (Unassisted)
        </Text>
        <View
          style={{
            backgroundColor: theme.isDark ? '#1f2937' : '#f3f4f6',
            padding: 16,
            borderRadius: 8,
          }}
        >
          {difficulties.map((d) => (
            <View
              key={d}
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}
            >
              <Text style={{ color: theme.foreground, textTransform: 'capitalize' }}>{d}:</Text>
              <Text style={{ color: theme.foreground, fontWeight: '600' }}>
                {typeof stats.bestTimeByDifficulty[d] === 'number'
                  ? formatTime(stats.bestTimeByDifficulty[d] as number)
                  : '—'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Time Distribution (Recent Daily Wins) */}
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: theme.foreground }}
        >
          Time Distribution (Recent Daily Wins)
        </Text>
        <View
          style={{
            backgroundColor: theme.isDark ? '#1f2937' : '#f3f4f6',
            padding: 16,
            borderRadius: 8,
            gap: 8,
          }}
        >
          {buckets.map((b, i) => {
            const count = histCounts[i]!;
            const widthPct = Math.max(6, Math.round((count / maxCount) * 100));
            return (
              <View key={b.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ width: 64, color: theme.foreground }}>{b.label}</Text>
                <View
                  style={{
                    flex: 1,
                    height: 12,
                    backgroundColor: theme.isDark ? '#111827' : '#e5e7eb',
                    borderRadius: 6,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${widthPct}%`,
                      height: '100%',
                      backgroundColor: theme.isDark ? '#60a5fa' : '#2563eb',
                    }}
                  />
                </View>
                <Text style={{ color: theme.foreground, width: 24, textAlign: 'right' }}>
                  {count}
                </Text>
              </View>
            );
          })}
          {histCounts.every((c) => c === 0) ? (
            <Text style={{ color: theme.foreground, opacity: 0.7, fontStyle: 'italic' }}>
              No recent daily wins to chart
            </Text>
          ) : null}
        </View>
      </View>

      {/* Recent Daily Results */}
      {stats.recentDailyResults.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: theme.foreground }}
          >
            Recent Daily Results
          </Text>
          <View
            style={{
              backgroundColor: theme.isDark ? '#1f2937' : '#f3f4f6',
              padding: 16,
              borderRadius: 8,
            }}
          >
            {stats.recentDailyResults.slice(0, 10).map((result, index) => (
              <View
                key={index}
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}
              >
                <Text style={{ color: theme.foreground }}>
                  {result.date.slice(0, 4)}-{result.date.slice(4, 6)}-{result.date.slice(6, 8)}:
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={{
                      color: result.result === 'win' ? '#10b981' : '#ef4444',
                      fontWeight: '600',
                      marginRight: 8,
                    }}
                  >
                    {result.result === 'win' ? '✓' : '✗'}
                  </Text>
                  <Text style={{ color: theme.foreground, fontWeight: '600' }}>
                    {formatTime(result.seconds)}
                  </Text>
                  {result.usedHints && (
                    <Text style={{ color: theme.foreground, opacity: 0.7, marginLeft: 8 }}>💡</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Last Updated */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 14, color: theme.foreground, opacity: 0.7, textAlign: 'center' }}>
          Last updated: {new Date(stats.lastCalculated).toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
  );
}
