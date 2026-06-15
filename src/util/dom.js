// dom.js — tiny DOM helper. No virtual DOM, just direct element creation.

/**
 * Create a DOM element.
 * @param {string} tag — element tag name.
 * @param {object} [props] — className, style, dataset, text, html, attrs, on* events, aria*, role, tabindex, etc.
 * @param {Array|Node|string} [children] — children to append.
 * @returns {HTMLElement}
 */
export function h(tag, props = {}, children = []) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(props || {})) {
    if (value == null || value === false) continue;

    if (key === 'className') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key === 'style' && typeof value === 'string') {
      el.setAttribute('style', value);
    } else if (key === 'dataset' && typeof value === 'object') {
      for (const [dk, dv] of Object.entries(value)) el.dataset[dk] = dv;
    } else if (key === 'text') {
      el.textContent = value;
    } else if (key === 'html') {
      el.innerHTML = value;
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'aria' && typeof value === 'object') {
      for (const [ak, av] of Object.entries(value)) el.setAttribute(`aria-${ak}`, av);
    } else if (key === 'role' || key === 'tabindex' || key === 'id') {
      el.setAttribute(key, value);
    } else {
      el.setAttribute(key, value);
    }
  }

  appendChildren(el, children);
  return el;
}

function appendChildren(parent, children) {
  if (children == null) return;
  if (Array.isArray(children)) {
    for (const c of children) appendChildren(parent, c);
    return;
  }
  if (typeof children === 'string' || typeof children === 'number') {
    parent.appendChild(document.createTextNode(String(children)));
    return;
  }
  if (children instanceof Node) {
    parent.appendChild(children);
  }
}

export function qs(root, sel) {
  return root.querySelector(sel);
}

export function qsa(root, sel) {
  return Array.from(root.querySelectorAll(sel));
}

export function clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}
