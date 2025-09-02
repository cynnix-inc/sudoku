import React, { useEffect, useState, useContext } from 'react';
<<<<<<< HEAD
import { View, Text, ScrollView } from 'react-native';
import { ThemeContext } from './_layout';
import { loadStats, type StatsData } from './services/stats';

export default function StatsScreen() {
  const theme = useContext(ThemeContext);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
=======
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ThemeContext } from './_layout';
import { getDetailedStats, type DetailedStats } from './services/stats';
import type { GameConfig } from './game/types';

export default function StatsScreen() {
  const theme = useContext(ThemeContext);
  const [stats, setStats] = useState<DetailedStats | null>(null);
>>>>>>> 753225f (feat: implement stats screen for issue #46)

  useEffect(() => {
    let mounted = true;
    (async () => {
<<<<<<< HEAD
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
=======
      const s = await getDetailedStats();
      if (mounted) setStats(s);
>>>>>>> 753225f (feat: implement stats screen for issue #46)
    })();
    return () => {
      mounted = false;
    };
  }, []);

<<<<<<< HEAD
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
=======
  if (!stats) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.foreground, opacity: 0.7 }]}>
          Loading…
        </Text>
>>>>>>> 753225f (feat: implement stats screen for issue #46)
      </View>
    );
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

<<<<<<< HEAD
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
=======
  const difficulties: GameConfig['difficulty'][] = [
    'easy',
    'medium',
    'hard',
    'expert',
    'master',
    'extreme',
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.foreground }]}>Statistics</Text>

      {/* Overall Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Overall</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.foreground }]}>
              {stats.overall.played}
            </Text>
            <Text style={[styles.statLabel, { color: theme.foreground, opacity: 0.7 }]}>
              Games Played
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.foreground }]}>
              {stats.overall.wins}
            </Text>
            <Text style={[styles.statLabel, { color: theme.foreground, opacity: 0.7 }]}>
              Total Wins
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.foreground }]}>
              {stats.overall.winRate.toFixed(1)}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.foreground, opacity: 0.7 }]}>
              Win Rate
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.foreground }]}>
              {stats.overall.averageTime ? formatTime(stats.overall.averageTime) : '--'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.foreground, opacity: 0.7 }]}>
              Avg Time
            </Text>
>>>>>>> 753225f (feat: implement stats screen for issue #46)
          </View>
        </View>
      </View>

<<<<<<< HEAD
      {/* Best Times */}
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: theme.foreground }}
        >
          Best Times
        </Text>
        <View
          style={{
            backgroundColor: theme.isDark ? '#1f2937' : '#f3f4f6',
            padding: 16,
            borderRadius: 8,
          }}
        >
          {Object.entries(stats.bestTimeByDifficulty).length > 0 ? (
            Object.entries(stats.bestTimeByDifficulty).map(([difficulty, time]) => (
              <View
                key={difficulty}
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}
              >
                <Text style={{ color: theme.foreground, textTransform: 'capitalize' }}>
                  {difficulty}:
                </Text>
                <Text style={{ color: theme.foreground, fontWeight: '600' }}>
                  {formatTime(time)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ color: theme.foreground, opacity: 0.7, fontStyle: 'italic' }}>
              No best times recorded yet
            </Text>
          )}
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
=======
      {/* Streaks */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Daily Streaks</Text>
        <View style={styles.streaksContainer}>
          <View style={styles.streakItem}>
            <Text style={[styles.streakValue, { color: theme.foreground }]}>
              {stats.streaks.current}
            </Text>
            <Text style={[styles.streakLabel, { color: theme.foreground, opacity: 0.7 }]}>
              Current
            </Text>
          </View>
          <View style={styles.streakItem}>
            <Text style={[styles.streakValue, { color: theme.foreground }]}>
              {stats.streaks.best}
            </Text>
            <Text style={[styles.streakLabel, { color: theme.foreground, opacity: 0.7 }]}>
              Best
            </Text>
          </View>
        </View>
      </View>

      {/* By Difficulty */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>By Difficulty</Text>
        {difficulties.map((difficulty) => {
          const diffStats = stats.byDifficulty[difficulty];
          if (!diffStats) return null;

          return (
            <View key={difficulty} style={styles.difficultyRow}>
              <Text style={[styles.difficultyName, { color: theme.foreground }]}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Text>
              <View style={styles.difficultyStats}>
                <Text style={[styles.difficultyStat, { color: theme.foreground, opacity: 0.7 }]}>
                  {diffStats.played} played
                </Text>
                <Text style={[styles.difficultyStat, { color: theme.foreground, opacity: 0.7 }]}>
                  {diffStats.wins} wins
                </Text>
                <Text style={[styles.difficultyStat, { color: theme.foreground, opacity: 0.7 }]}>
                  {diffStats.winRate.toFixed(1)}%
                </Text>
                <Text style={[styles.difficultyStat, { color: theme.foreground, opacity: 0.7 }]}>
                  {diffStats.bestTime ? formatTime(diffStats.bestTime) : '--'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Time Distribution */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Time Distribution</Text>
        <Text style={[styles.placeholderText, { color: theme.foreground, opacity: 0.7 }]}>
          Histogram visualization coming soon...
>>>>>>> 753225f (feat: implement stats screen for issue #46)
        </Text>
      </View>
    </ScrollView>
  );
}
<<<<<<< HEAD
=======

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  streaksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    minWidth: 80,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  difficultyName: {
    fontSize: 16,
    fontWeight: '500',
    width: '30%',
  },
  difficultyStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyStat: {
    fontSize: 14,
    textAlign: 'center',
    flex: 1,
  },
  placeholderText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
>>>>>>> 753225f (feat: implement stats screen for issue #46)
