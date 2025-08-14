import { test, expect } from '@playwright/test';

test.describe('Board edge focus stability', () => {
  test('focusing c1 and c9 does not shift the board or scroll the page', async ({ page }) => {
    await page.goto('/');

    // Ensure board is rendered
    const board = page.locator('#board');
    await expect(board).toBeVisible();

    // Helper to get board left and page scroll
    const snapshot = async () => {
      const rectLeft = await board.evaluate((el) => el.getBoundingClientRect().left);
      const scroll = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
      return { rectLeft, scrollX: scroll.x, scrollY: scroll.y };
    };

    // Selectors for c1 (row 1, col 1) and c9 (row 1, col 9)
    const cellAt = (r: number, c: number) => page.locator(`.cell[data-row="${r}"][data-col="${c}"]`);

    // Baseline snapshot before any focus
    const before = await snapshot();

    // Click c1
    await cellAt(0, 0).click();
    const afterC1 = await snapshot();

    // Click c9
    await cellAt(0, 8).click();
    const afterC9 = await snapshot();

    // Allow up to 1px tolerance for engine rounding
    const within1px = (a: number, b: number) => Math.abs(a - b) <= 1;

    expect(within1px(afterC1.rectLeft, before.rectLeft)).toBeTruthy();
    expect(within1px(afterC9.rectLeft, before.rectLeft)).toBeTruthy();

    // No horizontal scroll introduced
    expect(afterC1.scrollX).toBe(0);
    expect(afterC9.scrollX).toBe(0);

    // Vertical scroll should not jump due to focus
    expect(within1px(afterC1.scrollY, before.scrollY)).toBeTruthy();
    expect(within1px(afterC9.scrollY, before.scrollY)).toBeTruthy();
  });
});


