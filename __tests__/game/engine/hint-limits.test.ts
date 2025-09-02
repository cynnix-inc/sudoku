import {
  getHintLimit,
  areHintsAvailable,
  getHintsRemaining,
} from '../../../app/game/engine/hint-limits';

describe('Hint Limits', () => {
  describe('getHintLimit', () => {
    it('returns correct limits for each difficulty level', () => {
      expect(getHintLimit('easy')).toBe(5);
      expect(getHintLimit('medium')).toBe(3);
      expect(getHintLimit('hard')).toBe(2);
      expect(getHintLimit('expert')).toBe(1);
      expect(getHintLimit('master')).toBe(0);
      expect(getHintLimit('extreme')).toBe(0);
    });
  });

  describe('areHintsAvailable', () => {
    it('returns true when hints are available', () => {
      expect(areHintsAvailable('easy', 0)).toBe(true);
      expect(areHintsAvailable('easy', 4)).toBe(true);
      expect(areHintsAvailable('medium', 2)).toBe(true);
      expect(areHintsAvailable('hard', 1)).toBe(true);
      expect(areHintsAvailable('expert', 0)).toBe(true);
    });

    it('returns false when hints are exhausted', () => {
      expect(areHintsAvailable('easy', 5)).toBe(false);
      expect(areHintsAvailable('easy', 10)).toBe(false);
      expect(areHintsAvailable('medium', 3)).toBe(false);
      expect(areHintsAvailable('hard', 2)).toBe(false);
      expect(areHintsAvailable('expert', 1)).toBe(false);
      expect(areHintsAvailable('master', 0)).toBe(false);
      expect(areHintsAvailable('extreme', 0)).toBe(false);
    });
  });

  describe('getHintsRemaining', () => {
    it('returns correct remaining hints', () => {
      expect(getHintsRemaining('easy', 0)).toBe(5);
      expect(getHintsRemaining('easy', 3)).toBe(2);
      expect(getHintsRemaining('easy', 5)).toBe(0);
      expect(getHintsRemaining('easy', 10)).toBe(0);

      expect(getHintsRemaining('medium', 0)).toBe(3);
      expect(getHintsRemaining('medium', 2)).toBe(1);
      expect(getHintsRemaining('medium', 3)).toBe(0);

      expect(getHintsRemaining('hard', 0)).toBe(2);
      expect(getHintsRemaining('hard', 1)).toBe(1);
      expect(getHintsRemaining('hard', 2)).toBe(0);

      expect(getHintsRemaining('expert', 0)).toBe(1);
      expect(getHintsRemaining('expert', 1)).toBe(0);

      expect(getHintsRemaining('master', 0)).toBe(0);
      expect(getHintsRemaining('extreme', 0)).toBe(0);
    });
  });
});
