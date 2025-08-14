import { test, expect } from '@playwright/test';

test.describe('Modal header and scroll behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Open Settings via menu
    await page.click('#menu-btn');
    await page.click('#menu-settings');
    await expect(page.locator('#settings-modal')).toBeVisible();
  });

  test('header stays fixed while body scrolls; scrollbar confined to modal body', async ({ page }) => {
    const modal = page.locator('#settings-modal .modal-content');
    const head = page.locator('#settings-modal .modal-head');
    const body = page.locator('#settings-modal .modal-body');

    // Ensure body is the scroll container
    const overflowY = await body.evaluate(el => getComputedStyle(el).overflowY);
    expect(overflowY === 'auto' || overflowY === 'scroll').toBeTruthy();

    // Record header rects before scroll
    const before = await head.boundingBox();
    expect(before).not.toBeNull();

    // Scroll the body
    await body.evaluate(el => { el.scrollTop = el.scrollHeight; });
    await page.waitForTimeout(50);

    // Header should remain at same viewport position relative to modal
    const after = await head.boundingBox();
    expect(after).not.toBeNull();
    // y change should be minimal (allow 1px tolerance for rounding)
    expect(Math.abs((after!.y ?? 0) - (before!.y ?? 0)) <= 1).toBeTruthy();

    // Overlay wrapper should not scroll the page
    const bodyScroll = await page.evaluate(() => ({ y: window.scrollY, x: window.scrollX }));
    expect(bodyScroll.y).toBe(0);

    // Footer buttons remain visible after heavy scroll
    await expect(page.locator('#settings-modal .modal-buttons')).toBeVisible();
  });
});


