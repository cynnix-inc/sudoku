import { beforeEach } from '@jest/globals';
import { __TEST_ONLY__clearProgress } from '../../app/services/storage';
import {
  loadStats,
  recordResult,
  recordDailyResult,
  recordGameHistory,
  getDetailedStats,
  detectOutliers,
  calculatePerformanceBenchmarks,
  getPerformanceInsights,
  validateStatsData,
} from '../../app/services/stats';

describe('services/stats (#51)', () => {
  beforeEach(() => {
    __TEST_ONLY__clearProgress('sudoku-stats');
  });

  it('updates best times on win', async () => {
    await recordResult('easy', 'win', 120);
    const stats = await loadStats();
    expect(stats?.bestTimeByDifficulty['easy']).toBe(120);
  });

  it('does not update best time when hints used', async () => {
    await recordResult('easy', 'win', 150, { usedHints: true });
    const stats = await loadStats();
    expect(stats?.bestTimeByDifficulty['easy']).toBeUndefined();
  });

  it('records daily results and caps recent list', async () => {
    for (let i = 0; i < 65; i++) {
      const day = 20240101 + i;
      await recordDailyResult(String(day), 'medium', 'win', 200 + i, false);
    }
    const stats = await loadStats();
    expect(stats).toBeTruthy();
    const recent = (stats as NonNullable<typeof stats>).recentDailyResults;
    expect(recent.length).toBeLessThanOrEqual(60);
    const first = recent[0];
    if (!first) throw new Error('recentDailyResults empty');
    expect(first.date).toBe(String(20240101 + 64));
  });

  it('records game history with enhanced statistics', async () => {
    // Record several games to test enhanced stats
    await recordGameHistory('easy', 'win', 120, false, 3, 45);
    await recordGameHistory('easy', 'win', 180, true, 2, 52);
    await recordGameHistory('easy', 'loss', 300, true, 0, 67);
    await recordGameHistory('medium', 'win', 240, false, 3, 58);

    const detailedStats = await getDetailedStats();

    expect(detailedStats.overall.played).toBe(4);
    expect(detailedStats.overall.wins).toBe(3);
    expect(detailedStats.overall.winRate).toBe(75);
    expect(detailedStats.overall.hintsUsageRate).toBe(50); // 2 out of 4 games used hints
    expect(detailedStats.overall.averageMovesPerGame).toBe(56); // (45+52+67+58)/4 = 222/4 = 55.5 rounded to 56

    // Check difficulty-specific stats
    const easyStats = detailedStats.byDifficulty.easy;
    expect(easyStats).toBeDefined();
    if (easyStats) {
      expect(easyStats.played).toBe(3);
      expect(easyStats.wins).toBe(2);
      expect(easyStats.winRate).toBeCloseTo(66.67, 1);
      expect(easyStats.hintsUsageRate).toBeCloseTo(66.67, 1); // 2 out of 3 games used hints
      expect(easyStats.fastestTime).toBe(120);
      expect(easyStats.slowestTime).toBe(180); // Only considers winning games (120, 180)
      expect(easyStats.totalPlayTime).toBe(600); // 120+180+300 (all games)
    }

    // Check trends
    expect(detailedStats.trends.recentWinRate).toBe(75);
    expect(detailedStats.trends.improvementTrend).toBe('stable');
  });

  it('detects statistical outliers correctly', () => {
    const values = [10, 12, 15, 18, 20, 25, 30, 35, 40, 100];
    const result = detectOutliers(values);

    expect(result.outliers).toContain(100); // 100 is clearly an outlier
    expect(result.outliers.length).toBeGreaterThan(0);
    expect(result.bounds.lower).toBeLessThan(result.bounds.upper);
  });

  it('calculates performance benchmarks', async () => {
    // Record several games for a specific difficulty
    await recordGameHistory('medium', 'win', 200, false, 3, 50);
    await recordGameHistory('medium', 'win', 220, false, 3, 52);
    await recordGameHistory('medium', 'win', 240, false, 3, 55);
    await recordGameHistory('medium', 'win', 260, false, 3, 58);
    await recordGameHistory('medium', 'win', 280, false, 3, 60);

    const stats = await loadStats();
    if (!stats) throw new Error('Stats not loaded');

    const benchmarks = calculatePerformanceBenchmarks(stats.gameHistory, 'medium');
    expect(benchmarks).toBeDefined();
    if (benchmarks) {
      expect(benchmarks.beginner).toBeLessThanOrEqual(benchmarks.intermediate);
      expect(benchmarks.intermediate).toBeLessThanOrEqual(benchmarks.advanced);
      expect(benchmarks.advanced).toBeLessThanOrEqual(benchmarks.expert);
    }
  });

  it('provides performance insights', async () => {
    // Record some games to generate insights
    await recordGameHistory('easy', 'win', 120, false, 3, 45);
    await recordGameHistory('easy', 'win', 180, true, 2, 52);
    await recordGameHistory('hard', 'loss', 300, true, 0, 67);

    const insights = await getPerformanceInsights();

    expect(insights.strengths).toBeInstanceOf(Array);
    expect(insights.areasForImprovement).toBeInstanceOf(Array);
    expect(insights.recommendations).toBeInstanceOf(Array);

    // Should have some insights based on the data
    expect(
      insights.strengths.length +
        insights.areasForImprovement.length +
        insights.recommendations.length,
    ).toBeGreaterThan(0);
  });

  it('validates stats data integrity', async () => {
    // Record some valid games
    await recordGameHistory('easy', 'win', 120, false, 3, 45);
    await recordGameHistory('easy', 'loss', 300, true, 0, 67);

    const validation = await validateStatsData();
    expect(validation.isValid).toBe(true);
    expect(validation.issues).toHaveLength(0);

    // Test with corrupted data (this would require mocking the storage)
    // For now, just verify the function works with valid data
  });
});
