import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { DetailedStats } from '../services/stats';

interface TimeHistogramProps {
  stats: DetailedStats;
  theme: {
    foreground: string;
    background: string;
  };
}

interface TimeBin {
  range: string;
  count: number;
  maxCount: number;
}

export default function TimeHistogram({ stats, theme }: TimeHistogramProps) {
  // Create time bins for histogram
  const createTimeBins = (): TimeBin[] => {
    const bins: TimeBin[] = [
      { range: '0-2m', count: 0, maxCount: 0 },
      { range: '2-5m', count: 0, maxCount: 0 },
      { range: '5-10m', count: 0, maxCount: 0 },
      { range: '10-15m', count: 0, maxCount: 0 },
      { range: '15-20m', count: 0, maxCount: 0 },
      { range: '20m+', count: 0, maxCount: 0 },
    ];

    // Count games in each time bin
    stats.gameHistory.forEach((game) => {
      const timeInMinutes = game.secondsElapsed / 60;
      if (timeInMinutes <= 2) bins[0].count++;
      else if (timeInMinutes <= 5) bins[1].count++;
      else if (timeInMinutes <= 10) bins[2].count++;
      else if (timeInMinutes <= 15) bins[3].count++;
      else if (timeInMinutes <= 20) bins[4].count++;
      else bins[5].count++;
    });

    // Find the maximum count for scaling
    const maxCount = Math.max(...bins.map((bin) => bin.count));
    bins.forEach((bin) => (bin.maxCount = maxCount));

    return bins;
  };

  const timeBins = createTimeBins();
  const totalGames = stats.gameHistory.length;

  if (totalGames === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.foreground, opacity: 0.7 }]}>
          No games played yet
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.histogramContainer}>
        {timeBins.map((bin, index) => (
          <View key={index} style={styles.binContainer}>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    height: bin.maxCount > 0 ? (bin.count / bin.maxCount) * 80 : 0,
                    backgroundColor: theme.foreground,
                    opacity: 0.8,
                  },
                ]}
              />
            </View>
            <Text style={[styles.binLabel, { color: theme.foreground, opacity: 0.7 }]}>
              {bin.range}
            </Text>
            <Text style={[styles.binCount, { color: theme.foreground, opacity: 0.9 }]}>
              {bin.count}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.summaryContainer}>
        <Text style={[styles.summaryText, { color: theme.foreground, opacity: 0.8 }]}>
          Total games: {totalGames} • Most common:{' '}
          {timeBins.reduce((max, bin) => (bin.count > max.count ? bin : max)).range}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  histogramContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 10,
  },
  binContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barContainer: {
    width: 20,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 2,
    minHeight: 2,
  },
  binLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
  },
  binCount: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
