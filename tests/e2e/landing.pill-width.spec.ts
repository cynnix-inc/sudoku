import { test, expect } from '@playwright/test';

// Helper to seed recent games so Last/Most tiles appear
async function seedRecent(page) {
  const now = Date.now();
  const recent = [
    { type: 'classic', difficulty: 'easy', ts: now },         // Last played
    { type: 'classic', difficulty: 'hard', ts: now - 1000 },  // Most played (hard appears twice)
    { type: 'classic', difficulty: 'hard', ts: now - 2000 },
  ];
  await page.addInitScript((data) => {
    try { localStorage.setItem('sudoku-recent', JSON.stringify(data)); } catch {}
  }, recent);
}

async function getMetrics(page, which: 'last' | 'fav') {
  const btnId = which === 'last' ? '#landing-last-btn' : '#landing-fav-btn';
  const pillSel = which === 'last' ? '#landing-last-pill .mode-pill.mode-combined' : '#landing-fav-pill .mode-pill.mode-combined';

  const btn = page.locator(btnId);
  await expect(btn).toBeVisible();

  // Wait for pill to render
  const pill = page.locator(pillSel);
  await expect(pill).toBeVisible();

  return await btn.evaluate((el, sel) => {
    const host = (el as HTMLElement).querySelector(sel as string) as HTMLElement | null;
    const label = (el as HTMLElement).querySelector('.diff-text') as HTMLElement | null;
    const cs = getComputedStyle(el as HTMLElement);
    const paddingX = parseFloat(cs.paddingLeft || '0') + parseFloat(cs.paddingRight || '0');
    const innerWidth = (el as HTMLElement).clientWidth - paddingX;
    const pillWidth = host ? host.getBoundingClientRect().width : 0;
    const labelWidth = label ? label.getBoundingClientRect().width : 0;
    return { innerWidth, pillWidth, labelWidth };
  }, pillSel);
}

test.describe('Landing static tile pill width', () => {
  test.beforeEach(async ({ page }) => {
    await seedRecent(page);
    await page.goto('/index.html');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#landing-overlay')).toBeVisible();
  });

  test('desktop: pill ~94% width; label aligns', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    const m = await getMetrics(page, 'last');
    const ratio = m.pillWidth / m.innerWidth;
    expect(ratio).toBeGreaterThan(0.93);
    expect(ratio).toBeLessThan(0.96);
    expect(Math.abs(m.pillWidth - m.labelWidth)).toBeLessThanOrEqual(8);
  });

  test('≤520px: pill ~96% width; label aligns', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 900 });
    const m = await getMetrics(page, 'last');
    const ratio = m.pillWidth / m.innerWidth;
    expect(ratio).toBeGreaterThan(0.95);
    expect(ratio).toBeLessThan(0.98);
    expect(Math.abs(m.pillWidth - m.labelWidth)).toBeLessThanOrEqual(8);
  });

  test('≤380px: pill ~98% width; label aligns', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    const m = await getMetrics(page, 'last');
    const ratio = m.pillWidth / m.innerWidth;
    expect(ratio).toBeGreaterThan(0.97);
    expect(ratio).toBeLessThan(0.995);
    expect(Math.abs(m.pillWidth - m.labelWidth)).toBeLessThanOrEqual(10); // allow small wrap differences
  });
});


