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
    // Close
    await page.keyboard.press('Escape');
    await expect(page.locator('#stats-modal')).toBeHidden();

    // Settings opens settings modal
    await page.click('#landing-settings');
    await expect(page.locator('#settings-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#settings-modal')).toBeHidden();

    // Help opens help modal
    await page.click('#landing-help');
    await expect(page.locator('#help-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#help-modal')).toBeHidden();
  });
});


