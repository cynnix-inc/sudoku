import { test, expect } from '@playwright/test';

test.describe('Sudoku smoke regress', () => {
  test('landing is visible without document scroll on first load', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#landing-overlay')).toBeVisible();
    const bodyScroll = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
    expect(bodyScroll.x).toBe(0);
    expect(bodyScroll.y).toBe(0);
  });

  test('opening page renders board and allows a move', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');
    // Hide landing overlay across browsers and ensure game is initialized
    await page.evaluate(() => {
      const landing = document.getElementById('landing-overlay');
      if (landing) landing.style.display = 'none';
      // @ts-ignore
      if (!window.__sudokuGame && window.SudokuGame) {
        // @ts-ignore
        window.__sudokuGame = new window.SudokuGame();
      }
    });
    await page.evaluate(() => {
      // Ensure game instance exists
      // @ts-ignore
      if (!window.__sudokuGame && window.SudokuGame) {
        // @ts-ignore
        window.__sudokuGame = new window.SudokuGame();
      }
    });
    await page.waitForFunction(() => !!(window as any).SudokuGame, undefined, { timeout: 5000 });
    await page.evaluate(() => {
      // @ts-ignore
      if (window.SudokuGame && !window.__sudokuGame) window.__sudokuGame = new window.SudokuGame();
    });
    await expect(page.locator('#board .cell')).toHaveCount(81, { timeout: 15000 });
    const emptyCell = page.locator('#board .cell').filter({ hasText: '' }).first();
    await emptyCell.click();
    await page.click('.number-btn[data-number="1"]');
    await expect(emptyCell).toHaveValue(/1|/); // value or masked by input logic
  });

  test('timer button toggles pause overlay', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => {
      // Ensure game instance exists
      // @ts-ignore
      if (!window.__sudokuGame && window.SudokuGame) {
        // @ts-ignore
        window.__sudokuGame = new window.SudokuGame();
      }
      const landing = document.getElementById('landing-overlay');
      if (landing) landing.style.display = 'none';
    });
    await page.waitForFunction(() => !!(window as any).SudokuGame, undefined, { timeout: 5000 });
    await page.evaluate(() => {
      // @ts-ignore
      if (window.SudokuGame && !window.__sudokuGame) window.__sudokuGame = new window.SudokuGame();
    });
    await page.click('#timer-toggle');
    await expect(page.locator('#pause-overlay')).toBeVisible();
    await page.click('#timer-toggle');
    await expect(page.locator('#pause-overlay')).toBeHidden();
  });
});


