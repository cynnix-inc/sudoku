import { test, expect } from '@playwright/test';

async function hideLanding(page) {
  await page.evaluate(() => {
    const landing = document.getElementById('landing-overlay');
    if (landing) landing.style.display = 'none';
    // @ts-ignore
    if (!window.__sudokuGame && (window as any).SudokuGame) {
      // @ts-ignore
      (window as any).__sudokuGame = new (window as any).SudokuGame();
    }
  });
}

async function assertOverlayCoversViewport(page, selector: string) {
  const box = await page.locator(selector).boundingBox();
  const [vw, vh] = await page.evaluate(() => [window.innerWidth, window.innerHeight]);
  expect(box).not.toBeNull();
  if (!box) return;
  // Allow 1px tolerance for device rounding
  expect(Math.abs(box.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(box.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(box.width - vw)).toBeLessThanOrEqual(2);
  expect(Math.abs(box.height - vh)).toBeLessThanOrEqual(2);
}

test.describe('Modal ergonomics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('domcontentloaded');
    await hideLanding(page);
  });

  test('Settings modal: overlay covers viewport, card top near top and within viewport height', async ({ page }) => {
    await page.click('#menu-btn');
    await page.click('#menu-settings');
    const overlay = page.locator('#settings-modal');
    await expect(overlay).toBeVisible();
    await assertOverlayCoversViewport(page, '#settings-modal');

    const card = page.locator('#settings-modal .modal-content');
    await expect(card).toBeVisible();
    const rect = await card.boundingBox();
    const [vw, vh] = await page.evaluate(() => [window.innerWidth, window.innerHeight]);
    expect(rect).not.toBeNull();
    if (!rect) return;
    // Top should be close to the top gap (<= 140px from the top)
    expect(rect.y).toBeGreaterThanOrEqual(4);
    expect(rect.y).toBeLessThanOrEqual(140);
    // Bottom must never exceed viewport
    expect(rect.y + rect.height).toBeLessThanOrEqual(vh - 2);
  });

  test('Help modal scrolls internally and close works via ESC and backdrop', async ({ page }) => {
    await page.click('#menu-btn');
    await page.click('#menu-help');
    const overlay = page.locator('#help-modal');
    await expect(overlay).toBeVisible();
    await assertOverlayCoversViewport(page, '#help-modal');

    // Ensure internal scroll works
    await page.evaluate(() => {
      const el = document.querySelector('#help-modal .modal-content') as HTMLElement | null;
      if (el) el.scrollTop = el.scrollHeight;
    });
    // Close via ESC
    await page.keyboard.press('Escape');
    await expect(overlay).toBeHidden();

    // Open again and close by clicking the backdrop (not the card)
    await page.click('#menu-btn');
    await page.click('#menu-help');
    await expect(overlay).toBeVisible();
    // Click near the top-left corner of the overlay where there is no card
    await page.click('#help-modal', { position: { x: 5, y: 5 } });
    await expect(overlay).toBeHidden();
  });

  test('Help > About is collapsed by default and expands/collapses on toggle', async ({ page }) => {
    await page.click('#menu-btn');
    await page.click('#menu-help');
    const overlay = page.locator('#help-modal');
    await expect(overlay).toBeVisible();

    const about = page.locator('#help-about');
    await expect(about).toBeVisible();
    // Collapsed by default
    await expect(about).not.toHaveAttribute('open', /.+/);

    // Click summary to expand
    await page.click('#help-about > summary');
    await expect(about).toHaveAttribute('open', /.+/);

    // Click summary to collapse
    await page.click('#help-about > summary');
    await expect(about).not.toHaveAttribute('open', /.+/);
  });

  test('Calendar modal: card within viewport, overlay covers viewport', async ({ page }) => {
    // Open via API to avoid menu timing
    await page.evaluate(() => {
      // @ts-ignore
      (window as any).__sudokuGame?.openCalendar?.((window as any).__sudokuGame);
    });
    const overlay = page.locator('#calendar-modal');
    await expect(overlay).toBeVisible();
    await assertOverlayCoversViewport(page, '#calendar-modal');
    const rect = await page.locator('#calendar-modal .modal-content').boundingBox();
    const vh = await page.evaluate(() => window.innerHeight);
    expect(rect).not.toBeNull();
    if (rect) {
      expect(rect.y).toBeLessThanOrEqual(140);
      expect(rect.y + rect.height).toBeLessThanOrEqual(vh - 2);
    }
  });
});


