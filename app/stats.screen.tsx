import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ThemeContext } from './_layout';
import { getDetailedStats, type DetailedStats } from './services/stats';
import type { GameConfig } from './game/types';
import TimeHistogram from './components/TimeHistogram';

export default function StatsScreen() {
  const theme = useContext(ThemeContext);
  const [stats, setStats] = useState<DetailedStats | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const s = await getDetailedStats();
      if (mounted) setStats(s);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!stats) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.foreground, opacity: 0.7 }]}>
          Loading…
        </Text>
      </View>
    );
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
          </View>
          {stats.overall.medianTime && (
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.foreground }]}>
                {formatTime(stats.overall.medianTime)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.foreground, opacity: 0.7 }]}>
                Median Time
              </Text>
            </View>
          )}
          {stats.overall.fastestTime && (
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.foreground }]}>
                {formatTime(stats.overall.fastestTime)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.foreground, opacity: 0.7 }]}>
                Fastest
              </Text>
            </View>
          )}
          {stats.overall.slowestTime && (
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.foreground }]}>
                {formatTime(stats.overall.slowestTime)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.foreground, opacity: 0.7 }]}>
                Slowest
              </Text>
            </View>
          )}
          {stats.overall.averageMovesPerGame && (
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.foreground }]}>
                {stats.overall.averageMovesPerGame}
              </Text>
              <Text style={[styles.statLabel, { color: theme.foreground, opacity: 0.7 }]}>
                Avg Moves
              </Text>
            </View>
          )}
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.foreground }]}>
              {stats.overall.hintsUsageRate.toFixed(1)}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.foreground, opacity: 0.7 }]}>
              Hints Used
            </Text>
          </View>
        </View>
      </View>

      {/* Trends */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Recent Trends</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.foreground }]}>
              {stats.trends.recentWinRate.toFixed(1)}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.foreground, opacity: 0.7 }]}>
              Recent Win Rate
            </Text>
          </View>
          {stats.trends.recentAverageTime && (
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.foreground }]}>
                {formatTime(stats.trends.recentAverageTime)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.foreground, opacity: 0.7 }]}>
                Recent Avg Time
              </Text>
            </View>
          )}
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.foreground }]}>
              {stats.trends.improvementTrend === 'improving'
                ? '↗️'
                : stats.trends.improvementTrend === 'declining'
                  ? '↘️'
                  : '→'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.foreground, opacity: 0.7 }]}>
              {stats.trends.improvementTrend.charAt(0).toUpperCase() +
                stats.trends.improvementTrend.slice(1)}
            </Text>
          </View>
        </View>
      </View>

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
                {diffStats.averageTime && (
                  <Text style={[styles.difficultyStat, { color: theme.foreground, opacity: 0.7 }]}>
                    Avg: {formatTime(diffStats.averageTime)}
                  </Text>
                )}
                {diffStats.hintsUsageRate > 0 && (
                  <Text style={[styles.difficultyStat, { color: theme.foreground, opacity: 0.7 }]}>
                    Hints: {diffStats.hintsUsageRate.toFixed(1)}%
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Time Distribution */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Time Distribution</Text>
        <TimeHistogram stats={stats} theme={theme} />
      </View>
    </ScrollView>
  );
}

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
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
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
