import { test, expect } from '@playwright/test';

test.describe('Landing quick actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('domcontentloaded');
  });

  test('order is Stats | Settings | Help and each opens the correct modal', async ({ page }) => {
    // Ensure landing overlay is visible
    await expect(page.locator('#landing-overlay')).toBeVisible();

    // Verify order of quick action buttons by aria-label
    const labels = await page.$$eval('.landing-quick > button', nodes => nodes.map(n => n.getAttribute('aria-label')));
    expect(labels).toEqual(['Stats', 'Settings', 'Help']);

    // Stats opens stats modal
    await page.click('#landing-stats');
    await expect(page.locator('#stats-modal')).toBeVisible();
    // Close via ESC restores landing
    await page.keyboard.press('Escape');
    await expect(page.locator('#stats-modal')).toBeHidden();
    await expect(page.locator('#landing-overlay')).toBeVisible();

    // Open Stats again and close via backdrop click; landing should return
    await page.click('#landing-stats');
    await expect(page.locator('#stats-modal')).toBeVisible();
    await page.click('#stats-modal', { position: { x: 8, y: 8 } });
    await expect(page.locator('#stats-modal')).toBeHidden();
    await expect(page.locator('#landing-overlay')).toBeVisible();

    // Settings opens settings modal
    await page.click('#landing-settings');
    await expect(page.locator('#settings-modal')).toBeVisible();
    // Close via backdrop click
    await page.click('#settings-modal', { position: { x: 6, y: 6 } });
    await expect(page.locator('#settings-modal')).toBeHidden();
    await expect(page.locator('#landing-overlay')).toBeVisible();

    // Help opens help modal
    await page.click('#landing-help');
    await expect(page.locator('#help-modal')).toBeVisible();
    // Close via ESC
    await page.keyboard.press('Escape');
    await expect(page.locator('#help-modal')).toBeHidden();
    await expect(page.locator('#landing-overlay')).toBeVisible();
  });
});



