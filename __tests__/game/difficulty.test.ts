import { DIFFICULTY_THRESHOLDS, isClueCountInDifficulty } from '../../app/game/engine/difficulty';

describe('difficulty thresholds (#160)', () => {
  it('defines thresholds for easy/medium/hard', () => {
    expect(DIFFICULTY_THRESHOLDS.easy.minClues).toBeGreaterThanOrEqual(34);
    expect(DIFFICULTY_THRESHOLDS.medium.minClues).toBe(28);
    expect(DIFFICULTY_THRESHOLDS.medium.maxClues).toBe(33);
    expect(DIFFICULTY_THRESHOLDS.hard.minClues).toBe(24);
    expect(DIFFICULTY_THRESHOLDS.hard.maxClues).toBe(27);
  });

  it('validates clue counts within ranges', () => {
    expect(isClueCountInDifficulty('easy', 40)).toBe(true);
    expect(isClueCountInDifficulty('medium', 30)).toBe(true);
    expect(isClueCountInDifficulty('hard', 25)).toBe(true);
    expect(isClueCountInDifficulty('hard', 33)).toBe(false);
  });
});
