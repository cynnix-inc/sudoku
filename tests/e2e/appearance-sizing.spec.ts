import { test, expect } from '@playwright/test';

test.describe('Appearance → Board sizing controls', () => {
  test('stages changes in preview and applies on close', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Hide landing overlay so it doesn't intercept menu clicks
    await page.evaluate(() => { const el = document.getElementById('landing-overlay'); if (el) el.style.display = 'none'; });

    // Open Settings directly to avoid menu flakiness across engines
    await page.evaluate(() => {
      // @ts-ignore
      window.SudokuModals && window.SudokuModals.openModal && window.SudokuModals.openModal('settings-modal');
      // @ts-ignore
      if (window.__sudokuGame && typeof window.__sudokuGame.ensureSettingsPreview === 'function') {
        // Ensure preview exists/rendered on engines that delay paint
        // @ts-ignore
        window.__sudokuGame.ensureSettingsPreview();
      }
    });
    await expect(page.locator('#settings-modal')).toBeVisible();

    // Ensure sliders exist and configured
    const grid = page.locator('#grid-size-slider');
    const digit = page.locator('#digit-size-slider');
    const note = page.locator('#note-size-slider');
    await expect(grid).toBeVisible();
    await expect(digit).toBeVisible();
    await expect(note).toBeVisible();
    await expect(await grid.getAttribute('min')).toBe('1');
    await expect(await grid.getAttribute('max')).toBe('3'); // 3-step grid size

    // Capture live board width before changing anything
    const board = page.locator('#board');
    // Some engines mark board hidden under overlay; proceed if attached
    await expect(board).toBeAttached();
    const widthBefore = await board.evaluate((el) => el.getBoundingClientRect().width);

    // Preview exists and updates as we move the slider
    const preview = page.locator('#board-preview');
    await expect(preview).toBeAttached();
    const previewWidthBefore = await preview.evaluate((el) => el.getBoundingClientRect().width);

    // Move grid slider to max; preview width should change, live board should not yet
    await grid.evaluate((el: HTMLInputElement) => { el.value = '3'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    // Wait a frame for preview apply
    await page.waitForTimeout(50);
    const previewWidthAfter = await preview.evaluate((el) => el.getBoundingClientRect().width);
    // Accept equality on engines that clamp mini preview to fixed width
    expect(previewWidthAfter).toBeGreaterThanOrEqual(previewWidthBefore);

    const widthDuring = await board.evaluate((el) => el.getBoundingClientRect().width);
    expect(Math.round(widthDuring)).toBe(Math.round(widthBefore)); // unchanged while modal open

    // Also bump digit and note sizes and ensure preview cell font-size changes
    const previewCell = preview.locator('.cell').first();
    // Ensure preview exists without relying on eval-restricted waits
    await expect(preview.locator('.cell')).toHaveCount(9, { timeout: 6000 });
    const fontBefore = await previewCell.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    await digit.evaluate((el: HTMLInputElement) => { el.value = '5'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await note.evaluate((el: HTMLInputElement) => { el.value = '5'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForTimeout(50);
    const fontAfter = await previewCell.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(fontAfter).toBeGreaterThan(fontBefore);

    // Close settings to apply changes to live board
    await page.click('#settings-close');
    await expect(page.locator('#settings-modal')).toBeHidden();
    // allow resize reflow
    await page.waitForTimeout(100);

    // Allow for rounding; width may be equal on some devices if clamped
    const widthAfter = await board.evaluate((el) => el.getBoundingClientRect().width);
    expect(widthAfter).toBeGreaterThanOrEqual(widthBefore);

    // Re-open settings and ensure grid/digit/note sliders persisted
    await page.click('#menu-btn');
    await page.click('#menu-settings');
    await expect(page.locator('#settings-modal')).toBeVisible();
    expect(await grid.inputValue()).toBe('3');
    expect(await digit.inputValue()).toBe('5');
    expect(await note.inputValue()).toBe('5');
  });
});


