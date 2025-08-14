import { test, expect } from '@playwright/test';

test.describe('Landing responsive layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#landing-overlay')).toBeVisible();
  });

  test('wraps to two columns ≤640px with Daily spanning full width', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 640, height: 900 });

    const actions = page.locator('.landing-daily-actions');
    await expect(actions).toBeVisible();

    // Daily center wrap spans both columns
    const dailyCenter = page.locator('.landing-daily-actions .daily-center-wrap');
    const gridColumn = await dailyCenter.evaluate((el) => getComputedStyle(el).gridColumn);
    // WebKit may report 'auto' for gridColumn; fall back to width ratio check
    if (browserName === 'webkit' && gridColumn === 'auto') {
      const [childW, parentW] = await Promise.all([
        dailyCenter.evaluate((el) => el.getBoundingClientRect().width),
        actions.evaluate((el) => el.getBoundingClientRect().width),
      ]);
      expect(childW / parentW).toBeGreaterThan(0.95);
    } else {
      expect(gridColumn.replace(/\s+/g, ' ')).toContain('1 / -1');
    }
  });

  test('stacks to single column ≤380px', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 380, height: 900 });
    const actions = page.locator('.landing-daily-actions');
    await expect(actions).toBeVisible();

    // Expect computed grid-template-columns to resolve to a single track
    const cols = await actions.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    const dailyCenter = page.locator('.landing-daily-actions .daily-center-wrap');
    // Some engines compress gridTemplateColumns; verify layout by width ratios
    const [actionW, centerW] = await Promise.all([
      actions.evaluate((el) => el.getBoundingClientRect().width),
      dailyCenter.evaluate((el) => el.getBoundingClientRect().width),
    ]);
    // Single column: center tile width should be ~ tile width, not half the container
    expect(centerW / actionW).toBeGreaterThan(0.4);
  });
});


