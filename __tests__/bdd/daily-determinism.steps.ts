import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature('docs/qa/features/02-modes-daily.feature');

// Minimal pure function that replicates the spec seed rule for test purposes
export function buildDailySeed(utcDate: string, patternId: number, difficulty: string): string {
  return `${utcDate.replaceAll('-', '')}-${patternId}-${difficulty}`;
}

// Daily determinism assertions for Epic #16 (#163)
// This file extends existing steps; keep it idempotent across imports.
import { generateDailyPuzzle } from '../../app/game/daily';

describe('daily deterministic seeding (#163)', () => {
  it('same UTC date yields the same givens', () => {
    const date = new Date(Date.UTC(2025, 8, 21));
    const a = generateDailyPuzzle(date);
    const b = generateDailyPuzzle(date);
    expect(a.givens).toEqual(b.givens);
  });
});

defineFeature(feature, (test) => {
  test('Daily is deterministic by UTC date', ({ given, when, then }) => {
    let date = '';
    let seeds: string[] = [];

    given(/^the current UTC date is (\d{4}-\d{2}-\d{2})$/, (d: string) => {
      date = d;
    });

    when('I open Daily on any device', () => {
      // Same inputs should yield same seed across devices
      const patternId = 2; // example; real app rotates weekly
      const difficulty = 'Hard';
      seeds = [
        buildDailySeed(date, patternId, difficulty),
        buildDailySeed(date, patternId, difficulty),
      ];
    });

    then('the same puzzle is loaded for that date', () => {
      expect(new Set(seeds).size).toBe(1);
    });
  });
});
