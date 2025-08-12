// Quick Help interactions: tabs, search, open full help, backdrop/close

function setActiveTab(tabId) {
  try {
    const basicsTab = document.getElementById('qh-tab-basics');
    const shortcutsTab = document.getElementById('qh-tab-shortcuts');
    const cheatsTab = document.getElementById('qh-tab-cheats');
    const basicsPanel = document.getElementById('qh-panel-basics');
    const shortcutsPanel = document.getElementById('qh-panel-shortcuts');
    const cheatsPanel = document.getElementById('qh-panel-cheats');
    if (!basicsTab || !shortcutsTab || !basicsPanel || !shortcutsPanel || !cheatsTab || !cheatsPanel) return;
    const isBasics = tabId === 'basics';
    const isShort = tabId === 'shortcuts';
    const isCheats = tabId === 'cheats';
    basicsTab.classList.toggle('active', isBasics);
    shortcutsTab.classList.toggle('active', isShort);
    cheatsTab.classList.toggle('active', isCheats);
    basicsTab.setAttribute('aria-selected', String(isBasics));
    shortcutsTab.setAttribute('aria-selected', String(isShort));
    cheatsTab.setAttribute('aria-selected', String(isCheats));
    basicsPanel.hidden = !isBasics;
    shortcutsPanel.hidden = !isShort;
    cheatsPanel.hidden = !isCheats;
  } catch {}
}

export function initHelp() {
  // Menu Help continues to open full Help to match existing behavior/tests
  try {
    const openFromMenu = document.getElementById('menu-help');
    if (openFromMenu) {
      openFromMenu.addEventListener('click', () => {
        const full = document.getElementById('help-modal');
        if (full) full.style.display = 'grid';
      });
    }
  } catch {}

  try {
    const qhClose = document.getElementById('quickhelp-close');
    if (qhClose) qhClose.addEventListener('click', () => { const m = document.getElementById('quickhelp-modal'); if (m) m.style.display = 'none'; });
  } catch {}

  try {
    const basicsTab = document.getElementById('qh-tab-basics');
    const shortcutsTab = document.getElementById('qh-tab-shortcuts');
    const cheatsTab = document.getElementById('qh-tab-cheats');
    if (basicsTab) basicsTab.addEventListener('click', () => setActiveTab('basics'));
    if (shortcutsTab) shortcutsTab.addEventListener('click', () => setActiveTab('shortcuts'));
    if (cheatsTab) cheatsTab.addEventListener('click', () => setActiveTab('cheats'));
  } catch {}

  try {
    const openFull = document.getElementById('qh-open-full');
    if (openFull) openFull.addEventListener('click', () => {
      const qm = document.getElementById('quickhelp-modal'); if (qm) qm.style.display = 'none';
      const full = document.getElementById('help-modal'); if (full) full.style.display = 'grid';
    });
  } catch {}

  // Simple search filter within the quick help lists
  try {
    const input = document.getElementById('qh-search');
    if (input) input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      const basicsPanel = document.getElementById('qh-panel-basics');
      const shortcutsPanel = document.getElementById('qh-panel-shortcuts');
      const inBasics = !basicsPanel.hidden;
      const container = inBasics ? basicsPanel : shortcutsPanel;
      const items = Array.from(container.querySelectorAll('li, div'));
      if (!q) { items.forEach((el) => el.style.display = ''); return; }
      items.forEach((el) => {
        const text = el.textContent ? el.textContent.toLowerCase() : '';
        el.style.display = text.includes(q) ? '' : 'none';
      });
    });
  } catch {}

  // Backdrop close for Quick Help
  try {
    window.addEventListener('click', (event) => {
      const m = document.getElementById('quickhelp-modal');
      if (m && event.target === m) m.style.display = 'none';
    });
  } catch {}

  // Print button for cheat sheet
  try {
    const btn = document.getElementById('qh-print-cheats');
    if (btn) btn.addEventListener('click', () => { try { window.print(); } catch {} });
  } catch {}
}

try {
  if (typeof window !== 'undefined') {
    window.SudokuHelp = { initHelp };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initHelp, { once: true });
    } else {
      initHelp();
    }
  }
} catch {}


