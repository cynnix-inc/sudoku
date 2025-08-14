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

  test('focusing c1 and c9 does not horizontally shift the board', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    // Hide landing overlay and ensure game is initialized
    await page.evaluate(() => {
      const landing = document.getElementById('landing-overlay');
      if (landing) landing.style.display = 'none';
      // @ts-ignore
      if (!window.__sudokuGame && window.SudokuGame) window.__sudokuGame = new window.SudokuGame();
    });
    await page.waitForFunction(() => !!(window as any).SudokuGame, undefined, { timeout: 5000 });

    const board = page.locator('#board');
    await expect(board).toBeAttached();
    // Capture initial left position of the board
    const leftBefore = await board.evaluate((el) => el.getBoundingClientRect().left);

    // Focus first column (c1) and measure
    const c1 = page.locator('#board .cell').nth(0); // row 0, col 0
    await c1.click({ force: true });
    // Wait a frame for any style transition
    await page.waitForTimeout(50);
    const leftAfterC1 = await board.evaluate((el) => el.getBoundingClientRect().left);

    // Focus last column (c9) and measure
    const c9 = page.locator('#board .cell').nth(8); // row 0, col 8
    await c9.click({ force: true });
    await page.waitForTimeout(50);
    const leftAfterC9 = await board.evaluate((el) => el.getBoundingClientRect().left);

    // Allow for sub-pixel rounding; assert no perceptible horizontal shift
    expect(Math.round(leftAfterC1)).toBe(Math.round(leftBefore));
    expect(Math.round(leftAfterC9)).toBe(Math.round(leftBefore));
  });
});


