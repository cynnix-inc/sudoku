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
});



