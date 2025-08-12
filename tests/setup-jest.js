// Minimal DOM scaffolding required by SudokuGame
beforeEach(() => {
  document.body.innerHTML = `
    <div class="container">
      <header>
        <div class="rail app-header">
          <div class="header-left">
            <div id="user-chip" class="user-chip" style="display:none"></div>
          </div>
          <div class="header-center">
            <div class="difficulty-display"><div id="mode-indicator" class="mode-indicator"></div></div>
          </div>
          <div class="header-right">
            <button id="menu-btn"></button>
            <div id="menu-popover"></div>
          </div>
        </div>
      </header>
      <main>
        <div class="sudoku-board">
          <div id="board" class="board"></div>
          <div id="pause-overlay" class="pause-overlay" style="display:none;"></div>
          <div id="gameover-overlay" class="pause-overlay" style="display:none;"></div>
        </div>
        <div class="number-pad">
          <div class="pad-numbers">
            ${Array.from({length:9}, (_,i)=>`<button type="button" class="number-btn" data-number="${i+1}">${i+1}</button>`).join('')}
          </div>
          <div class="pad-actions">
            <button type="button" id="pad-lock-toggle" class="pad-action-btn icon-btn" aria-pressed="false"></button>
            <button type="button" id="pad-erase-btn" class="pad-action-btn clear-cell" data-number="0"></button>
          </div>
        </div>
        <div class="controls-strip">
          <button id="timer-toggle" class="timer"><span id="time">00:00</span><span class="timer-icon">⏸</span></button>
          <div id="health-bar"></div>
          <button id="notes-toggle" class="icon-btn" aria-label="Notes">✎</button>
        </div>
        <div id="status-message"></div>
      </main>
    </div>
    <div id="modal" class="modal"><div class="modal-content"><h2 id="modal-title"></h2><p id="modal-message"></p><button id="modal-new-game"></button><button id="modal-close"></button></div></div>
  `;
  // Polyfills expected by app code
  if (!window.matchMedia) {
    window.matchMedia = () => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }
  // Minimal PointerEvent polyfill for tests that synthesize pointer events
  if (!window.PointerEvent) {
    class PointerEventPolyfill extends Event {
      constructor(type, params = {}) {
        super(type, params);
        // Assign only additional, writable pointer props used by code/tests
        this.clientX = params.clientX || 0;
        this.clientY = params.clientY || 0;
        this.pointerId = params.pointerId || 1;
        this.pointerType = params.pointerType || 'mouse';
        this.buttons = params.buttons || 0;
        this.button = params.button || 0;
        this.ctrlKey = !!params.ctrlKey;
        this.shiftKey = !!params.shiftKey;
        this.altKey = !!params.altKey;
        this.metaKey = !!params.metaKey;
        this.preventDefault = params.preventDefault || (() => {});
      }
    }
    window.PointerEvent = PointerEventPolyfill;
    global.PointerEvent = PointerEventPolyfill;
  }
  try {
    Object.defineProperty(window.navigator, 'maxTouchPoints', { value: 0, configurable: true });
  } catch {}
});

afterEach(() => {
  // Cleanup DOM
  document.body.innerHTML = '';
});


