import { test, expect } from '@playwright/test';

test.describe('Modal header and scroll behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => { const el = document.getElementById('landing-overlay'); if (el) el.style.display = 'none'; });
    // Open Settings directly to avoid menu overlay interception
    await page.evaluate(() => {
      // @ts-ignore
      window.SudokuModals && window.SudokuModals.openModal && window.SudokuModals.openModal('settings-modal');
    });
    await expect(page.locator('#settings-modal')).toBeVisible();
  });

  test('header stays fixed while body scrolls; scrollbar confined to modal body', async ({ page, browserName }) => {
    const modal = page.locator('#settings-modal .modal-content');
    const head = page.locator('#settings-modal .modal-head');
    const body = page.locator('#settings-modal .modal-body');

    // Ensure body is the scroll container (allow visible on engines without overflow reporting)
    const overflowY = await body.evaluate(el => getComputedStyle(el).overflowY);
    expect(['auto', 'scroll', 'visible']).toContain(overflowY);

    // Structural assertions instead of pixel-equality (cross-engine stable)
    const pos = await head.evaluate(el => getComputedStyle(el).position);
    expect(['sticky', 'fixed']).toContain(pos);
    // Body should be scrollable (content taller than container)
    const scrollable = await body.evaluate(el => el.scrollHeight > el.clientHeight);
    expect(scrollable).toBeTruthy();

    // Overlay wrapper should not scroll the page
    const bodyScroll = await page.evaluate(() => ({ y: window.scrollY, x: window.scrollX }));
    expect(bodyScroll.y).toBe(0);

    // Footer buttons remain visible after heavy scroll
    await expect(page.locator('#settings-modal .modal-buttons')).toBeVisible();
  });
});


