// Wrapper exports for Jest spy-ability; delegates to canonical _game rules
import * as baseRules from '../_game/rules';

export function isValidPlacement(...args: Parameters<typeof baseRules.isValidPlacement>) {
  return baseRules.isValidPlacement(...args);
}

export function isSolved(...args: Parameters<typeof baseRules.isSolved>) {
  return baseRules.isSolved(...args);
}
