'use strict';
var React = window.React;
var ReactDOM = window.ReactDOM;
var h = React.createElement;
var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef,
  useId = React.useId, useMemo = React.useMemo, useLayoutEffect = React.useLayoutEffect;

function cx() {
  var out = [];
  for (var i = 0; i < arguments.length; i++) if (arguments[i]) out.push(arguments[i]);
  return out.join(' ');
}
function omit(obj, keys) {
  var r = {};
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && keys.indexOf(k) < 0) r[k] = obj[k];
  return r;
}

/* ---- glyphs: 16px grid, 1.5px round stroke, currentColor ---- */
var PATHS = {
  check: 'M3.5 8.5l3 3 6-7',
  minus: 'M4 8h8',
  chevron: 'M4 6l4 4 4-4',
  x: 'M4 4l8 8M12 4l-8 8',
  copy: 'M5.5 5.5v-2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M3.5 5.5h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1z',
  search: 'M7 12.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM14.5 14.5l-3.6-3.6',
  info: 'M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM8 7.5v3.5M8 5h.01',
  warning: 'M8 1.75l6.75 12H1.25zM8 6.5v3M8 11.75h.01',
  error: 'M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM5.75 5.75l4.5 4.5M10.25 5.75l-4.5 4.5',
  success: 'M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM5.25 8.25l1.75 1.75 3.75-4',
  arrow: 'M3 8h10M9 4l4 4-4 4',
  enter: 'M13 3.5v4a2 2 0 0 1-2 2H3M6 6.5l-3 3 3 3'
};
function Glyph(p) {
  var s = p.size || 16;
  return h('svg', { className: cx('hy-glyph', p.className), width: s, height: s, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true', focusable: 'false' },
    h('path', { d: PATHS[p.name] }));
}

/* ---- Field wrapper shared by Input and Select ---- */
function fieldIds(id) { return { hint: id + '-hint', error: id + '-error' }; }
function FieldMessage(p) {
  if (p.error) return h('p', { id: p.ids.error, className: 'hy-field__error' }, h(Glyph, { name: 'error', size: 14 }), h('span', null, p.error));
  if (p.hint) return h('p', { id: p.ids.hint, className: 'hy-field__hint' }, p.hint);
  return null;
}

function copyText(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
  } catch (e) { /* fall through */ }
  return new Promise(function (resolve, reject) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = document.execCommand('copy'); document.body.removeChild(ta);
      ok ? resolve() : reject(new Error('copy failed'));
    } catch (e) { reject(e); }
  });
}

/* ---- focus helpers for overlays ---- */
var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
function trapTab(e, root) {
  if (e.key !== 'Tab' || !root) return;
  var els = Array.prototype.filter.call(root.querySelectorAll(FOCUSABLE), function (el) { return el.offsetParent !== null || el === document.activeElement; });
  if (!els.length) { e.preventDefault(); return; }
  var first = els[0], last = els[els.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
function useOverlayFocus(open, ref, initial) {
  useEffect(function () {
    if (!open) return;
    var prev = document.activeElement;
    var root = ref.current;
    var target = (initial && initial.current) || (root && root.querySelector('[data-autofocus]')) || root;
    if (target) target.focus({ preventScroll: true });
    return function () { if (prev && prev.focus) prev.focus({ preventScroll: true }); };
  }, [open]);
}
function portal(node) {
  return ReactDOM && ReactDOM.createPortal ? ReactDOM.createPortal(node, document.body) : node;
}

/* ---- registry: every component file ends with define('<Name>', Component) ---- */
var HY = {};
function define(name, component) {
  if (component && !component.displayName) component.displayName = name;
  HY[name] = component;
}

/* ---- controlled / uncontrolled value: [value, setValue] ---- */
function useControllable(value, defaultValue, onChange) {
  var st = useState(defaultValue);
  var controlled = value !== undefined;
  var current = controlled ? value : st[0];
  function set(next) {
    if (!controlled) st[1](next);
    if (onChange) onChange(next);
  }
  return [current, set];
}

/* ---- close a popover on outside pointer-down or Escape ---- */
function useDismiss(open, refs, onDismiss) {
  useEffect(function () {
    if (!open) return;
    function inside(t) { return refs.some(function (r) { return r.current && r.current.contains(t); }); }
    function onDown(e) { if (!inside(e.target)) onDismiss('outside'); }
    function onKey(e) { if (e.key === 'Escape') onDismiss('escape'); }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return function () { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);
}

/* ---- lock page scroll while an overlay is open ---- */
function useScrollLock(open) {
  useEffect(function () {
    if (!open) return;
    var prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return function () { document.body.style.overflow = prev; };
  }, [open]);
}
