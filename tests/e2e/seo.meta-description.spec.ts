import { test, expect } from '@playwright/test';

test.describe('SEO metadata', () => {
  test('has a single, reasonably sized meta description', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    const metas = page.locator('meta[name="description"]');
    await expect(metas).toHaveCount(1);
    const content = await metas.first().getAttribute('content');
    expect(content).toBeTruthy();
    const length = (content || '').trim().length;
    expect(length).toBeGreaterThanOrEqual(50);
    expect(length).toBeLessThanOrEqual(200);
    // Basic relevance check
    expect((content || '').toLowerCase()).toContain('sudoku');
  });
});


