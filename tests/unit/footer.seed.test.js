/**
 * Footer and seed display/copy behavior
 */

describe('Footer brand and seed display', () => {
  let SudokuGame;

  beforeAll(() => {
    // Load the game class from global (script.js defines window.SudokuGame in JSDOM via require)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../script.js');
    SudokuGame = window.SudokuGame;
  });

  beforeEach(() => {
    // Minimal DOM scaffold for footer interactions
    document.body.innerHTML = `
      <div id="status-message"></div>
      <div class="rail game-footer">
        <div class="footer-left"></div>
        <div class="footer-center" id="game-brand">© <span id="game-brand-year"></span> CYNNIX Studios</div>
        <button id="game-seed" class="footer-right footer-seed" type="button" hidden></button>
      </div>
    `;
  });

  test('updateFooterBrand sets current year', () => {
    const g = new SudokuGame({ headless: true });
    g.updateFooterBrand();
    const yearEl = document.getElementById('game-brand-year');
    expect(yearEl).toBeTruthy();
    expect(yearEl.textContent).toBe(String(new Date().getFullYear()));
  });

  test('updateFooterSeed hides button when no seed then shows when set', () => {
    const g = new SudokuGame({ headless: true });
    const seedBtn = document.getElementById('game-seed');
    g._activeSeed = null;
    g.updateFooterSeed();
    expect(seedBtn.hidden).toBe(true);

    g._activeSeed = 'abc123';
    g.updateFooterSeed();
    expect(seedBtn.hidden).toBe(false);
    expect(seedBtn.textContent).toBe('abc123');
    expect(seedBtn.getAttribute('data-seed')).toBe('abc123');
  });

  test('generatePuzzle assigns a seed and calls generateSeeded with it', () => {
    const g = new SudokuGame({ headless: true });
    const spy = jest.spyOn(g, 'generateSeeded').mockImplementation(() => {});
    g.generatePuzzle('medium');
    expect(typeof g._activeSeed).toBe('string');
    expect(g._activeSeed.length).toBeGreaterThan(0);
    expect(spy).toHaveBeenCalledWith(g._activeSeed, 'medium');
    spy.mockRestore();
  });
});


