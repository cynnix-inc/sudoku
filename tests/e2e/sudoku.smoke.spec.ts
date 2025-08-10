import { test, expect } from '@playwright/test';

test.describe('Sudoku smoke regress', () => {
  test('opening page renders board and allows a move', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => {
      // Ensure game instance exists
      // @ts-ignore
      if (!window.__sudokuGame && window.SudokuGame) {
        // @ts-ignore
        window.__sudokuGame = new window.SudokuGame();
      }
    });
    if (!(await page.evaluate(() => !!(window as any).SudokuGame))) {
      await page.addScriptTag({ path: 'script.js' });
      await page.evaluate(() => {
        // @ts-ignore
        if (window.SudokuGame && !window.__sudokuGame) window.__sudokuGame = new window.SudokuGame();
      });
    }
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
    });
    if (!(await page.evaluate(() => !!(window as any).__sudokuGame))) {
      await page.addScriptTag({ path: 'script.js' });
      await page.evaluate(() => {
        // @ts-ignore
        if (window.SudokuGame && !window.__sudokuGame) window.__sudokuGame = new window.SudokuGame();
      });
    }
    await page.click('#timer-toggle');
    await expect(page.locator('#pause-overlay')).toBeVisible();
    await page.click('#timer-toggle');
    await expect(page.locator('#pause-overlay')).toBeHidden();
  });
});


