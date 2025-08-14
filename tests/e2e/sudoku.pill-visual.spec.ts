import { test, expect } from '@playwright/test';

test.describe('Mode pill visual behavior', () => {
  test('pill is rounded, padded, and not clipping text', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('domcontentloaded');

    const pill = page.locator('#mode-indicator .mode-pill.mode-combined');
    await expect(pill).toBeVisible();

    // Ensure overflow is visible and max-height is generous enough
    const css = await pill.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return {
        overflow: cs.overflow,
        maxHeight: cs.maxHeight,
        paddingLeft: cs.paddingLeft,
        paddingRight: cs.paddingRight,
        borderRadius: cs.borderTopLeftRadius,
      };
    });

    expect(css.overflow).toBe('visible');
    expect(parseFloat(css.maxHeight || '0')).toBeGreaterThanOrEqual(40); // px
    expect(parseFloat(css.paddingLeft || '0')).toBeGreaterThanOrEqual(10);
    expect(parseFloat(css.paddingRight || '0')).toBeGreaterThanOrEqual(10);
    expect(parseFloat(css.borderRadius || '0')).toBeGreaterThanOrEqual(20);

    // Ensure internal text does not overflow its own container
    const noOverflow = await page.locator('#mode-indicator .mode-type').evaluate((el) => {
      const node = el as HTMLElement;
      return node.scrollWidth <= node.clientWidth + 1; // allow 1px rounding
    });
    expect(noOverflow).toBeTruthy();
  });
});


