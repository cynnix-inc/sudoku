const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

describe('Status/Toast UI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('showStatus falls back to inline banner when no toast container', () => {
    const g = new SudokuGame({ headless: true });
    const status = document.createElement('div'); status.id = 'status-message'; document.body.appendChild(status);
    g.showStatus('Hello world', 'info');
    expect(status.textContent).toContain('Hello world');
    expect(status.className).toContain('info');
    g.clearStatus();
    expect(status.textContent).toBe('');
  });

  test('showToast renders into #toast-container and supports click-dismiss', () => {
    const g = new SudokuGame({ headless: true });
    const cont = document.createElement('div'); cont.id = 'toast-container'; document.body.appendChild(cont);
    g.showToast('Saved', 'success', 1000);
    const toast = cont.querySelector('.toast.success');
    expect(toast).toBeTruthy();
    expect(toast.textContent).toContain('Saved');
    // Dismiss
    toast.click();
  });

  test('coalesces toasts by key and limits visible stack', () => {
    jest.useFakeTimers();
    const g = new SudokuGame({ headless: true });
    const cont = document.createElement('div'); cont.id = 'toast-container'; document.body.appendChild(cont);
    // Force mobile-style limit for test
    g._maxVisibleToasts = 2;
    g.showToast('A1', 'info', 5000, { key: 'auth' });
    g.showToast('A2', 'success', 5000, { key: 'auth' }); // should update same toast
    g.showToast('B', 'info', 5000);
    g.showToast('C', 'info', 5000);
    g.showToast('D', 'info', 5000);
    // Only 2 visible (A2, B). C and D queued
    expect(cont.querySelectorAll('.toast').length).toBe(2);
    expect(cont.querySelector('.toast').textContent).toContain('A2');
    // Dismiss one and advance timers to allow next to mount
    const first = cont.querySelector('.toast');
    first.click();
    jest.advanceTimersByTime(200);
    // Now one of the queued should appear
    expect(cont.querySelectorAll('.toast').length).toBe(2);
    jest.useRealTimers();
  });
});



