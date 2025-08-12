// Simple timer module extracted from monolith. Stateless helpers + class.
export class GameTimer {
  constructor(updateCb) {
    this._updateCb = typeof updateCb === 'function' ? updateCb : null;
    this._startTime = null;
    this._elapsedBeforePause = 0;
    this._paused = false;
    this._raf = null;
  }
  start(offsetSeconds = 0) {
    this._paused = false;
    this._elapsedBeforePause = Math.max(0, offsetSeconds * 1000);
    this._startTime = performance.now();
    this._tick();
  }
  _tick = () => {
    if (this._paused) return;
    const now = performance.now();
    const ms = (now - this._startTime) + this._elapsedBeforePause;
    if (this._updateCb) this._updateCb(Math.floor(ms / 1000));
    this._raf = requestAnimationFrame(this._tick);
  };
  pause() {
    if (this._paused) return;
    cancelAnimationFrame(this._raf);
    const now = performance.now();
    this._elapsedBeforePause += now - this._startTime;
    this._paused = true;
  }
  resume() {
    if (!this._paused) return;
    this._paused = false;
    this._startTime = performance.now();
    this._tick();
  }
  stop() {
    cancelAnimationFrame(this._raf);
    this._paused = true;
  }
}

try { if (typeof window !== 'undefined') window.SudokuTimer = { GameTimer }; } catch {}
