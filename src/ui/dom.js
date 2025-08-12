// Minimal DOM utilities used by UI code. Keep tiny and dependency-free.

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    try {
      if (k === 'class' || k === 'className') node.className = String(v);
      else if (k === 'text') node.textContent = String(v);
      else if (k in node) node[k] = v;
      else node.setAttribute(k, String(v));
    } catch {}
  }
  for (const c of children) node.appendChild(c);
  return node;
}

try {
  if (typeof window !== 'undefined') window.SudokuDom = { qs, qsa, el };
} catch {}


