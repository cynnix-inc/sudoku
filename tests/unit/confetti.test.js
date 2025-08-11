const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Confetti effects', () => {
  beforeAll(() => {
    // JSDOM does not implement Element.animate; stub it to a no-op
    if (!Element.prototype.animate) {
      // eslint-disable-next-line no-extend-native
      Element.prototype.animate = function () { return {}; };
    }
  });

  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '';
    // Base scaffolding commonly expected by the game
    const container = document.createElement('div');
    container.className = 'container';
    const boardWrap = document.createElement('div');
    boardWrap.className = 'sudoku-board';
    const board = document.createElement('div');
    board.id = 'board';
    board.className = 'board';
    // Provide non-zero dims for visibility heuristics when needed
    board.getBoundingClientRect = () => ({ left: 0, top: 0, width: 600, height: 600, right: 600, bottom: 600, x: 0, y: 0, toJSON(){} });
    boardWrap.appendChild(board);
    container.appendChild(boardWrap);
    document.body.appendChild(container);
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  test('generic confetti burst appends particles and cleans up', () => {
    // Add landing overlay/card to act as the primary host
    const overlay = document.createElement('div');
    overlay.className = 'landing-overlay';
    overlay.style.display = 'flex';
    const card = document.createElement('div');
    card.className = 'landing-card';
    // Give it size so visibility check passes
    card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 480, height: 240, right: 480, bottom: 240, x: 0, y: 0, toJSON(){} });
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const game = new SudokuGame({ headless: true });
    expect(typeof game._burstConfetti).toBe('function');

    game._burstConfetti();

    // Immediately after first pop, expect a good number of particles
    let now = document.querySelectorAll('.confetti-bit').length;
    expect(now).toBeGreaterThanOrEqual(50);

    // After the second pop (90ms), expect even more
    jest.advanceTimersByTime(120);
    now = document.querySelectorAll('.confetti-bit').length;
    expect(now).toBeGreaterThanOrEqual(100);

    // After full duration + cleanup, particles should be gone
    jest.advanceTimersByTime(3200);
    now = document.querySelectorAll('.confetti-bit').length;
    expect(now).toBe(0);
  });

  test('element-anchored confetti falls back to viewport when target is tiny', () => {
    // Tiny host (e.g., if logo had 0 size in test DOM)
    const tiny = document.createElement('div');
    tiny.id = 'logo';
    tiny.getBoundingClientRect = () => ({ left: 10, top: 10, width: 0, height: 0, right: 10, bottom: 10, x: 10, y: 10, toJSON(){} });
    document.body.appendChild(tiny);

    const game = new SudokuGame({ headless: true });
    expect(typeof game._burstConfettiAt).toBe('function');

    game._burstConfettiAt(tiny);

    // Should still render some particles (using body overlay fallback)
    let count = document.querySelectorAll('.confetti-bit').length;
    expect(count).toBeGreaterThanOrEqual(20);

    jest.advanceTimersByTime(2600);
    count = document.querySelectorAll('.confetti-bit').length;
    expect(count).toBe(0);
  });
});


