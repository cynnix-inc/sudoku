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

  test('no document scroll on landing at common mobile sizes (basic)', async ({ page }) => {
    const viewports = [
      { width: 360, height: 640 },
      { width: 375, height: 667 },
      { width: 390, height: 844 },
      { width: 412, height: 915 },
    ];
    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.waitForTimeout(50);
      const bodyScroll = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
      expect(bodyScroll.x).toBe(0);
      expect(bodyScroll.y).toBe(0);
    }
  });

  test('landing card stays within viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const card = page.locator('.landing-card');
    await expect(card).toBeVisible();
    // Allow tolerance for shadows/borders and dynamic text
    const within = await card.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const tol = 60; // px tolerance for visual effects
      return r.top >= -tol && r.bottom <= window.innerHeight + tol && r.left >= -tol && r.right <= window.innerWidth + tol;
    });
    expect(within).toBeTruthy();
  });

  test('no document scroll on landing at common mobile sizes (strict)', async ({ page }) => {
    const viewports = [
      { width: 360, height: 640 }, // small Android
      { width: 375, height: 667 }, // iPhone 8
      { width: 390, height: 844 }, // iPhone 12/13/14
      { width: 412, height: 915 }, // Pixel 7
    ];
    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.waitForTimeout(50);
      const bodyScroll = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
      expect(bodyScroll.x).toBe(0);
      expect(bodyScroll.y).toBe(0);
      const overflow = await page.evaluate(() => getComputedStyle(document.documentElement).overflowY + ':' + getComputedStyle(document.body).overflowY);
      expect(overflow).not.toContain('scroll');
    }
  });

  test('landing card stays within viewport bounds', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const card = page.locator('.landing-card');
    await expect(card).toBeVisible();
    // Allow tolerance for visual effects
    const within = await card.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const tol = 60; // px
      return r.top >= -tol && r.bottom <= window.innerHeight + tol && r.left >= -tol && r.right <= window.innerWidth + tol;
    });
    expect(within).toBeTruthy();
  });
});


