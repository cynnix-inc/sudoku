// Centralized modal controller with ARIA, focus restore, scroll lock, and backdrop handling

let previouslyFocusedElement = null;

function getAllAppContainers() {
  const nodes = [];
  try {
    const parts = document.querySelectorAll('header, main, footer');
    parts.forEach(n => nodes.push(n));
  } catch {}
  return nodes;
}

function setBackgroundInert(isInert) {
  const containers = getAllAppContainers();
  containers.forEach(el => {
    try {
      if ('inert' in el) {
        el.inert = isInert;
      } else {
        el.setAttribute('aria-hidden', isInert ? 'true' : 'false');
      }
    } catch {}
  });
}

function focusFirstIn(modal) {
  try {
    const content = modal.querySelector('.modal-content');
    if (content && content.tabIndex === -1) content.focus();
    const focusables = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const list = Array.from(focusables).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1);
    if (list[0]) list[0].focus();
  } catch {}
}

function restoreFocus() {
  try {
    if (previouslyFocusedElement && previouslyFocusedElement.focus) {
      previouslyFocusedElement.focus();
    }
  } catch {}
  previouslyFocusedElement = null;
}

export function openModal(id, options = {}) {
  const modal = document.getElementById(id);
  if (!modal) return false;

  // Save opener for focus restore
  try { previouslyFocusedElement = document.activeElement; } catch {}

  // Normalize ARIA on the dialog element
  try {
    const titleEl = modal.querySelector('h2, [data-modal-title]');
    const content = modal.querySelector('.modal-content');
    if (content && content.getAttribute('tabindex') == null) content.setAttribute('tabindex', '-1');
    if (!modal.hasAttribute('role')) modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    if (titleEl) {
      if (!titleEl.id) titleEl.id = `${id}-title`;
      modal.setAttribute('aria-labelledby', titleEl.id);
    }
  } catch {}

  // Open state
  modal.classList.add('is-open');
  try { modal.setAttribute('aria-hidden', 'false'); } catch {}

  // Body scroll lock and app inert
  document.body.classList.add('modal-open');
  setBackgroundInert(true);

  // Move focus inside
  setTimeout(() => focusFirstIn(modal), 0);

  return true;
}

export function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return false;
  modal.classList.remove('is-open');
  try { modal.setAttribute('aria-hidden', 'true'); } catch {}

  // If no other modals open, restore background and scroll
  const anyOpen = !!document.querySelector('.modal.is-open');
  if (!anyOpen) {
    document.body.classList.remove('modal-open');
    setBackgroundInert(false);
  }

  // Restore focus to the opener
  restoreFocus();

  return true;
}

// Delegated backdrop close (except when disabled)
function onDocumentClick(e) {
  const overlay = e.target && e.target.closest ? e.target.closest('.modal') : null;
  if (!overlay) return;
  const content = overlay.querySelector('.modal-content');
  const backdropCloseAttr = overlay.getAttribute('data-backdrop-close');
  const backdropClose = backdropCloseAttr == null ? true : backdropCloseAttr !== 'false';
  if (!backdropClose) return;
  if (e.target === overlay) {
    closeModal(overlay.id);
  }
}

// Guard multiple bindings
let _controllerBound = false;
function bindDelegatesOnce() {
  if (_controllerBound) return;
  _controllerBound = true;
  try { document.addEventListener('click', onDocumentClick); } catch {}
}

bindDelegatesOnce();

try { if (typeof window !== 'undefined') window.SudokuModals = { openModal, closeModal }; } catch {}
