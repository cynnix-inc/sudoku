// Lightweight tooltip system for elements with `.help-tip` or `[data-tooltip]`.
// - Shows on hover/focus; positions near the target
// - Uses a single floating element `.app-tooltip`

function ensureTooltipEl() {
  let el = document.getElementById('app-tooltip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-tooltip';
    el.className = 'app-tooltip';
    el.style.display = 'none';
    document.body.appendChild(el);
  }
  return el;
}

function getTooltipText(target) {
  if (!target) return '';
  const t = target.getAttribute('data-tooltip') || target.getAttribute('title') || '';
  return t;
}

function showTooltip(target, text) {
  const el = ensureTooltipEl();
  if (!text) { el.style.display = 'none'; return; }
  el.textContent = text;
  el.style.display = 'block';
  positionTooltip(el, target);
}

function hideTooltip() {
  const el = document.getElementById('app-tooltip');
  if (el) el.style.display = 'none';
}

function positionTooltip(el, target) {
  try {
    const rect = target.getBoundingClientRect();
    const margin = 8;
    const elRect = el.getBoundingClientRect();
    let top = rect.top - elRect.height - margin;
    let left = rect.left + rect.width / 2 - elRect.width / 2;
    // Keep within viewport
    top = Math.max(8, top);
    left = Math.max(8, Math.min(window.innerWidth - elRect.width - 8, left));
    el.style.position = 'fixed';
    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
  } catch {}
}

function onPointerMove(e) {
  const el = document.getElementById('app-tooltip');
  if (!el || el.style.display === 'none') return;
  const target = currentTargetRef;
  if (!target) return;
  positionTooltip(el, target);
}

let currentTargetRef = null;

function attachTooltips() {
  const selector = '.help-tip, [data-tooltip]';

  // Use event delegation for performance and dynamic content
  document.addEventListener('pointerenter', (e) => {
    const target = e.target.closest(selector);
    if (!target) return;
    currentTargetRef = target;
    const text = getTooltipText(target);
    // Prevent native title tooltips
    if (target.hasAttribute('title')) {
      target.setAttribute('data-title-saved', target.getAttribute('title') || '');
      target.removeAttribute('title');
    }
    showTooltip(target, text);
  }, true);

  document.addEventListener('focusin', (e) => {
    const target = e.target.closest(selector);
    if (!target) return;
    currentTargetRef = target;
    const text = getTooltipText(target);
    showTooltip(target, text);
  });

  const end = () => {
    const t = currentTargetRef;
    if (t && t.hasAttribute('data-title-saved')) {
      const saved = t.getAttribute('data-title-saved');
      if (saved) t.setAttribute('title', saved);
      t.removeAttribute('data-title-saved');
    }
    currentTargetRef = null;
    hideTooltip();
  };

  document.addEventListener('pointerleave', (e) => {
    if (!e.target.closest(selector)) return;
    end();
  }, true);
  document.addEventListener('focusout', (e) => {
    if (!e.target.closest(selector)) return;
    end();
  });

  window.addEventListener('scroll', () => hideTooltip(), true);
  window.addEventListener('resize', () => hideTooltip());
  window.addEventListener('pointermove', onPointerMove);
}

try {
  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attachTooltips, { once: true });
    } else {
      attachTooltips();
    }
  }
} catch {}


