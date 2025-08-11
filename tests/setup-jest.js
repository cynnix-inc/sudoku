// Minimal DOM scaffolding required by SudokuGame
beforeEach(() => {
  document.body.innerHTML = `
    <div class="container">
      <header>
        <div class="rail app-header">
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
          <div id="mode-indicator"></div>
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
  try {
    Object.defineProperty(window.navigator, 'maxTouchPoints', { value: 0, configurable: true });
  } catch {}
});

afterEach(() => {
  // Cleanup DOM
  document.body.innerHTML = '';
});


