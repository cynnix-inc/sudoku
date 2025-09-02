import {
  applyVariantsMask,
  validateVariants,
  DEFAULT_VARIANTS,
} from '../../app/game/engine/variants';

describe('variants scaffold', () => {
  it('no-op applyVariantsMask and validate true', () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(null));
    const masked = applyVariantsMask(grid, DEFAULT_VARIANTS);
    expect(masked).toHaveLength(9);
    expect(validateVariants(masked, DEFAULT_VARIANTS)).toBe(true);
  });
});
