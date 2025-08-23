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

  it('defines thresholds for expert/master/extreme', () => {
    expect(DIFFICULTY_THRESHOLDS.expert.minClues).toBe(22);
    expect(DIFFICULTY_THRESHOLDS.expert.maxClues).toBe(25);
    expect(DIFFICULTY_THRESHOLDS.master.minClues).toBe(20);
    expect(DIFFICULTY_THRESHOLDS.master.maxClues).toBe(23);
    expect(DIFFICULTY_THRESHOLDS.extreme.minClues).toBe(17);
    expect(DIFFICULTY_THRESHOLDS.extreme.maxClues).toBe(20);
  });

  it('validates expert/master/extreme clue ranges', () => {
    expect(isClueCountInDifficulty('expert', 22)).toBe(true);
    expect(isClueCountInDifficulty('expert', 26)).toBe(false);
    expect(isClueCountInDifficulty('master', 20)).toBe(true);
    expect(isClueCountInDifficulty('master', 24)).toBe(false);
    expect(isClueCountInDifficulty('extreme', 18)).toBe(true);
    expect(isClueCountInDifficulty('extreme', 21)).toBe(false);
  });
});
