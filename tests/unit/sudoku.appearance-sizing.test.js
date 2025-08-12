const exported = require('../../script.js');
const SudokuGame = exported.SudokuGame || exported.default?.SudokuGame || exported;

/**
 * Unit tests for Appearance → Board sizing settings
 */
describe('Appearance sizing settings (persist/resume)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // Minimal DOM for settings controls referenced by persist/resume
    const grid = document.createElement('input'); grid.type = 'range'; grid.id = 'grid-size-slider'; grid.value = '2';
    const digit = document.createElement('input'); digit.type = 'range'; digit.id = 'digit-size-slider'; digit.value = '3';
    const note = document.createElement('input'); note.type = 'range'; note.id = 'note-size-slider'; note.value = '3';
    document.body.appendChild(grid);
    document.body.appendChild(digit);
    document.body.appendChild(note);
    try { localStorage.clear(); } catch {}
  });

  test('persistSettings stores grid/digit/note sizes; resumeSettings stages values, reapplies CSS vars, and sets appliedGridSize', () => {
    const g1 = new SudokuGame({ headless: true });

    // Change staged values in the DOM and persist
    document.getElementById('grid-size-slider').value = '3';
    document.getElementById('digit-size-slider').value = '5';
    document.getElementById('note-size-slider').value = '1';
    g1.persistSettings();

    // New game resumes settings
    const g2 = new SudokuGame({ headless: true });
    g2.resumeSettings();

    expect(document.getElementById('grid-size-slider').value).toBe('3');
    expect(document.getElementById('digit-size-slider').value).toBe('5');
    expect(document.getElementById('note-size-slider').value).toBe('1');

    // Applied grid should reflect the stored grid size
    expect(g2._appliedGridSize).toBe(3);

    // CSS variables for digit and note scale should be applied
    const digitScale = document.documentElement.style.getPropertyValue('--digit-scale');
    const noteScale  = document.documentElement.style.getPropertyValue('--note-scale');
    expect(digitScale.trim()).toBe('0.68'); // step 5 → 0.68
    expect(noteScale.trim()).toBe('0.12');  // step 1 → 0.12
  });
});


