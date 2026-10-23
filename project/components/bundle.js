/* @ds-bundle: {"format":4,"namespace":"Hyprsh","components":[{"name":"Button"},{"name":"CopyButton"},{"name":"LoadMoreButton"},{"name":"SplitButton"},{"name":"AddressInput"},{"name":"Calendar"},{"name":"Checkbox"},{"name":"Choicebox"},{"name":"ClearableInput"},{"name":"Combobox"},{"name":"Feedback"},{"name":"Fieldset"},{"name":"FilterMenu"},{"name":"Input"},{"name":"Label"},{"name":"MultiSelect"},{"name":"QueryBar"},{"name":"QueryInput"},{"name":"Radio"},{"name":"SearchInput"},{"name":"Select"},{"name":"Slider"},{"name":"Switch"},{"name":"Textarea"},{"name":"ThemeSwitcher"},{"name":"Toggle"},{"name":"Breadcrumbs"},{"name":"CommandMenuTrigger"},{"name":"Link"},{"name":"Pagination"},{"name":"TabBar"},{"name":"Tabs"},{"name":"Badge"},{"name":"Pill"},{"name":"StatusDot"},{"name":"Banner"},{"name":"EmptyState"},{"name":"Error"},{"name":"ErrorCard"},{"name":"LoadingDots"},{"name":"Note"},{"name":"Progress"},{"name":"ProjectBanner"},{"name":"Skeleton"},{"name":"Spinner"},{"name":"Toast"},{"name":"Code"},{"name":"CodeBlock"},{"name":"Description"},{"name":"Entity"},{"name":"Icon"},{"name":"KeyboardInput"},{"name":"MiddleTruncate"},{"name":"Snippet"},{"name":"Table"},{"name":"TextWithCopyButton"},{"name":"FileTree"},{"name":"FilterParams"},{"name":"Gauge"},{"name":"JsonView"},{"name":"CommandMenu"},{"name":"ContextCard"},{"name":"ContextMenu"},{"name":"DestructiveActionModal"},{"name":"DotsMenu"},{"name":"Drawer"},{"name":"Menu"},{"name":"Modal"},{"name":"Popover"},{"name":"RelativeTimeCard"},{"name":"Sheet"},{"name":"Tooltip"},{"name":"Collapse"},{"name":"Grid"},{"name":"Scroller"},{"name":"Separator"},{"name":"ShowMore"},{"name":"Avatar"},{"name":"Browser"},{"name":"Logo"},{"name":"Phone"},{"name":"Video"}]} */
(function () {
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
      document.addEventListener('pointerdown', onDown);
      document.addEventListener('keydown', onKey);
      return function () { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
    }, [open]);
  }

  /* ---- place a floating box next to its anchor ----
     Returns null until measured, then { top, left, side, arrowX, arrowY } in viewport px for position: fixed.
     side: top | bottom | left | right (default bottom); align: start | center | end (default center).
     It flips to the opposite side when the box doesn't fit, falls back from left/right to below on narrow
     screens, and keeps the box 8px inside the viewport. Render the box through portal() while open,
     with style floatingStyle(pos). Re-measures on resize and on any scroll. */
  function useFloating(open, anchorRef, floatRef, opts) {
    opts = opts || {};
    var st = useState(null);
    var side0 = opts.side || 'bottom', align = opts.align || 'center', gap = opts.offset == null ? 8 : opts.offset;
    useLayoutEffect(function () {
      if (!open) { st[1](null); return; }
      var OPP = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
      function place() {
        var a = anchorRef.current, f = floatRef.current;
        if (!a || !f) return;
        var ar = a.getBoundingClientRect(), fw = f.offsetWidth, fh = f.offsetHeight;
        var vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 8;
        var fits = { top: ar.top - gap - fh >= m, bottom: ar.bottom + gap + fh <= vh - m, left: ar.left - gap - fw >= m, right: ar.right + gap + fw <= vw - m };
        var side = side0;
        if (!fits[side] && fits[OPP[side]]) side = OPP[side];
        if ((side === 'left' || side === 'right') && !fits[side]) side = fits.bottom || !fits.top ? 'bottom' : 'top';
        var top, left;
        if (side === 'top' || side === 'bottom') {
          top = side === 'top' ? ar.top - gap - fh : ar.bottom + gap;
          left = align === 'start' ? ar.left : align === 'end' ? ar.right - fw : ar.left + ar.width / 2 - fw / 2;
        } else {
          left = side === 'left' ? ar.left - gap - fw : ar.right + gap;
          top = align === 'start' ? ar.top : align === 'end' ? ar.bottom - fh : ar.top + ar.height / 2 - fh / 2;
        }
        left = Math.max(m, Math.min(left, vw - m - fw));
        top = Math.max(m, Math.min(top, vh - m - fh));
        var next = { top: Math.round(top), left: Math.round(left), side: side,
          arrowX: Math.round(Math.max(12, Math.min(fw - 12, ar.left + ar.width / 2 - left))),
          arrowY: Math.round(Math.max(12, Math.min(fh - 12, ar.top + ar.height / 2 - top))) };
        st[1](function (prev) {
          return prev && prev.top === next.top && prev.left === next.left && prev.side === next.side && prev.arrowX === next.arrowX && prev.arrowY === next.arrowY ? prev : next;
        });
      }
      place();
      var raf = requestAnimationFrame(place);
      window.addEventListener('resize', place);
      window.addEventListener('scroll', place, true);
      return function () { cancelAnimationFrame(raf); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
    }, [open, side0, align, gap]);
    return st[0];
  }
  /* Style for a box placed by useFloating: hidden until measured, never wider than the screen. */
  function floatingStyle(pos, extra) {
    return Object.assign({ position: 'fixed', top: pos ? pos.top : 0, left: pos ? pos.left : 0, visibility: pos ? 'visible' : 'hidden', maxWidth: 'calc(100vw - 16px)', zIndex: 'var(--z-menu)' }, extra);
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
  /* Icons: Lucide 1.49.0 (https://lucide.dev). Generated by scripts/icons.mjs; do not edit.

  ISC License

  Copyright (c) 2026 Lucide Icons and Contributors

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted, provided that the above
  copyright notice and this permission notice appear in all copies.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
  WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
  MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
  ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
  WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
  ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
  OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

  ---

  The following Lucide icons are derived from the Feather project:

  airplay, alert-circle, alert-octagon, alert-triangle, aperture, arrow-down-circle, arrow-down-left, arrow-down-right, arrow-down, arrow-left-circle, arrow-left, arrow-right-circle, arrow-right, arrow-up-circle, arrow-up-left, arrow-up-right, arrow-up, at-sign, calendar, cast, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-left, chevrons-right, chevrons-up, circle, clipboard, clock, code, columns, command, compass, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, crosshair, database, divide-circle, divide-square, dollar-sign, download, external-link, feather, frown, hash, headphones, help-circle, info, italic, key, layout, life-buoy, link-2, link, loader, lock, log-in, log-out, maximize, meh, minimize, minimize-2, minus-circle, minus-square, minus, monitor, moon, more-horizontal, more-vertical, move, music, navigation-2, navigation, octagon, pause-circle, percent, plus-circle, plus-square, plus, power, radio, rss, search, server, share, shopping-bag, sidebar, smartphone, smile, square, table-2, tablet, target, terminal, trash-2, trash, triangle, tv, type, upload, x-circle, x-octagon, x-square, x, zoom-in, zoom-out

  The MIT License (MIT) (for the icons listed above)

  Copyright (c) 2013-present Cole Bemis

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
  */
  var ICONS = {"a-arrow-down":"<path d=\"m14 12 4 4 4-4\" /><path d=\"M18 16V7\" /><path d=\"m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16\" /><path d=\"M3.304 13h6.392\" />","a-arrow-up":"<path d=\"m14 11 4-4 4 4\" /><path d=\"M18 16V7\" /><path d=\"m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16\" /><path d=\"M3.304 13h6.392\" />","a-large-small":"<path d=\"m15 16 2.536-7.328a1.02 1.02 1 0 1 1.928 0L22 16\" /><path d=\"M15.697 14h5.606\" /><path d=\"m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16\" /><path d=\"M3.304 13h6.392\" />","accessibility":"<circle cx=\"16\" cy=\"4\" r=\"1\" /><path d=\"m18 19 1-7-6 1\" /><path d=\"m5 8 3-3 5.5 3-2.36 3.5\" /><path d=\"M4.24 14.5a5 5 0 0 0 6.88 6\" /><path d=\"M13.76 17.5a5 5 0 0 0-6.88-6\" />","activity-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M17 12h-2l-2 5-2-10-2 5H7\" />","activity":"<path d=\"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2\" />","ad":"<path d=\"M10 13H6\" /><path d=\"M10 15v-4a2 2 0 0 0-4 0v4\" /><path d=\"M14 14.5a.5.5 0 0 0 .5.5h1a2.5 2.5 0 0 0 2.5-2.5v-1A2.5 2.5 0 0 0 15.5 9h-1a.5.5 0 0 0-.5.5z\" /><rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"2\" />","air-vent":"<path d=\"M18 17.5a2.5 2.5 0 1 1-4 2.03V12\" /><path d=\"M6 12H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\" /><path d=\"M6 8h12\" /><path d=\"M6.6 15.572A2 2 0 1 0 10 17v-5\" />","airplay":"<path d=\"M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1\" /><path d=\"m12 15 5 6H7Z\" />","alarm-check":"<circle cx=\"12\" cy=\"13\" r=\"8\" /><path d=\"M5 3 2 6\" /><path d=\"m22 6-3-3\" /><path d=\"M6.38 18.7 4 21\" /><path d=\"M17.64 18.67 20 21\" /><path d=\"m9 13 2 2 4-4\" />","alarm-clock-check":"<circle cx=\"12\" cy=\"13\" r=\"8\" /><path d=\"M5 3 2 6\" /><path d=\"m22 6-3-3\" /><path d=\"M6.38 18.7 4 21\" /><path d=\"M17.64 18.67 20 21\" /><path d=\"m9 13 2 2 4-4\" />","alarm-clock-minus":"<circle cx=\"12\" cy=\"13\" r=\"8\" /><path d=\"M5 3 2 6\" /><path d=\"m22 6-3-3\" /><path d=\"M6.38 18.7 4 21\" /><path d=\"M17.64 18.67 20 21\" /><path d=\"M9 13h6\" />","alarm-clock-off":"<path d=\"M6.87 6.87a8 8 0 1 0 11.26 11.26\" /><path d=\"M19.9 14.25a8 8 0 0 0-9.15-9.15\" /><path d=\"m22 6-3-3\" /><path d=\"M6.26 18.67 4 21\" /><path d=\"m2 2 20 20\" /><path d=\"M4 4 2 6\" />","alarm-clock-plus":"<circle cx=\"12\" cy=\"13\" r=\"8\" /><path d=\"M5 3 2 6\" /><path d=\"m22 6-3-3\" /><path d=\"M6.38 18.7 4 21\" /><path d=\"M17.64 18.67 20 21\" /><path d=\"M12 10v6\" /><path d=\"M9 13h6\" />","alarm-clock":"<circle cx=\"12\" cy=\"13\" r=\"8\" /><path d=\"M12 9v4l2 2\" /><path d=\"M5 3 2 6\" /><path d=\"m22 6-3-3\" /><path d=\"M6.38 18.7 4 21\" /><path d=\"M17.64 18.67 20 21\" />","alarm-minus":"<circle cx=\"12\" cy=\"13\" r=\"8\" /><path d=\"M5 3 2 6\" /><path d=\"m22 6-3-3\" /><path d=\"M6.38 18.7 4 21\" /><path d=\"M17.64 18.67 20 21\" /><path d=\"M9 13h6\" />","alarm-plus":"<circle cx=\"12\" cy=\"13\" r=\"8\" /><path d=\"M5 3 2 6\" /><path d=\"m22 6-3-3\" /><path d=\"M6.38 18.7 4 21\" /><path d=\"M17.64 18.67 20 21\" /><path d=\"M12 10v6\" /><path d=\"M9 13h6\" />","alarm-smoke":"<path d=\"M11 21c0-2.5 2-2.5 2-5\" /><path d=\"M16 21c0-2.5 2-2.5 2-5\" /><path d=\"m19 8-.8 3a1.25 1.25 0 0 1-1.2 1H7a1.25 1.25 0 0 1-1.2-1L5 8\" /><path d=\"M21 3a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1z\" /><path d=\"M6 21c0-2.5 2-2.5 2-5\" />","album":"<path d=\"M11 3v7.751a.25.25 0 00.407.195l2.28-1.834a.5.5 0 01.627 0l2.28 1.834a.25.25 0 00.406-.195V3\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","alert-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\" /><line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\" />","alert-octagon":"<path d=\"M12 16h.01\" /><path d=\"M12 8v4\" /><path d=\"M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z\" />","alert-triangle":"<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\" /><path d=\"M12 9v4\" /><path d=\"M12 17h.01\" />","align-center-horizontal":"<path d=\"M2 12h20\" /><path d=\"M10 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4\" /><path d=\"M10 8V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4\" /><path d=\"M20 16v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1\" /><path d=\"M14 8V7c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v1\" />","align-center-vertical":"<path d=\"M12 2v20\" /><path d=\"M8 10H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h4\" /><path d=\"M16 10h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-4\" /><path d=\"M8 20H7a2 2 0 0 1-2-2v-2c0-1.1.9-2 2-2h1\" /><path d=\"M16 14h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1\" />","align-center":"<path d=\"M21 5H3\" /><path d=\"M17 12H7\" /><path d=\"M19 19H5\" />","align-end-horizontal":"<rect width=\"6\" height=\"16\" x=\"4\" y=\"2\" rx=\"2\" /><rect width=\"6\" height=\"9\" x=\"14\" y=\"9\" rx=\"2\" /><path d=\"M22 22H2\" />","align-end-vertical":"<rect width=\"16\" height=\"6\" x=\"2\" y=\"4\" rx=\"2\" /><rect width=\"9\" height=\"6\" x=\"9\" y=\"14\" rx=\"2\" /><path d=\"M22 22V2\" />","align-horizontal-distribute-center":"<rect width=\"6\" height=\"14\" x=\"4\" y=\"5\" rx=\"2\" /><rect width=\"6\" height=\"10\" x=\"14\" y=\"7\" rx=\"2\" /><path d=\"M17 22v-5\" /><path d=\"M17 7V2\" /><path d=\"M7 22v-3\" /><path d=\"M7 5V2\" />","align-horizontal-distribute-end":"<rect width=\"6\" height=\"14\" x=\"4\" y=\"5\" rx=\"2\" /><rect width=\"6\" height=\"10\" x=\"14\" y=\"7\" rx=\"2\" /><path d=\"M10 2v20\" /><path d=\"M20 2v20\" />","align-horizontal-distribute-start":"<rect width=\"6\" height=\"14\" x=\"4\" y=\"5\" rx=\"2\" /><rect width=\"6\" height=\"10\" x=\"14\" y=\"7\" rx=\"2\" /><path d=\"M4 2v20\" /><path d=\"M14 2v20\" />","align-horizontal-justify-center":"<rect width=\"6\" height=\"14\" x=\"2\" y=\"5\" rx=\"2\" /><rect width=\"6\" height=\"10\" x=\"16\" y=\"7\" rx=\"2\" /><path d=\"M12 2v20\" />","align-horizontal-justify-end":"<rect width=\"6\" height=\"14\" x=\"2\" y=\"5\" rx=\"2\" /><rect width=\"6\" height=\"10\" x=\"12\" y=\"7\" rx=\"2\" /><path d=\"M22 2v20\" />","align-horizontal-justify-start":"<rect width=\"6\" height=\"14\" x=\"6\" y=\"5\" rx=\"2\" /><rect width=\"6\" height=\"10\" x=\"16\" y=\"7\" rx=\"2\" /><path d=\"M2 2v20\" />","align-horizontal-space-around":"<rect width=\"6\" height=\"10\" x=\"9\" y=\"7\" rx=\"2\" /><path d=\"M4 22V2\" /><path d=\"M20 22V2\" />","align-horizontal-space-between":"<rect width=\"6\" height=\"14\" x=\"3\" y=\"5\" rx=\"2\" /><rect width=\"6\" height=\"10\" x=\"15\" y=\"7\" rx=\"2\" /><path d=\"M3 2v20\" /><path d=\"M21 2v20\" />","align-justify":"<path d=\"M3 5h18\" /><path d=\"M3 12h18\" /><path d=\"M3 19h18\" />","align-left":"<path d=\"M21 5H3\" /><path d=\"M15 12H3\" /><path d=\"M17 19H3\" />","align-right":"<path d=\"M21 5H3\" /><path d=\"M21 12H9\" /><path d=\"M21 19H7\" />","align-start-horizontal":"<rect width=\"6\" height=\"16\" x=\"4\" y=\"6\" rx=\"2\" /><rect width=\"6\" height=\"9\" x=\"14\" y=\"6\" rx=\"2\" /><path d=\"M22 2H2\" />","align-start-vertical":"<rect width=\"9\" height=\"6\" x=\"6\" y=\"14\" rx=\"2\" /><rect width=\"16\" height=\"6\" x=\"6\" y=\"4\" rx=\"2\" /><path d=\"M2 2v20\" />","align-vertical-distribute-center":"<path d=\"M22 17h-3\" /><path d=\"M22 7h-5\" /><path d=\"M5 17H2\" /><path d=\"M7 7H2\" /><rect x=\"5\" y=\"14\" width=\"14\" height=\"6\" rx=\"2\" /><rect x=\"7\" y=\"4\" width=\"10\" height=\"6\" rx=\"2\" />","align-vertical-distribute-end":"<rect width=\"14\" height=\"6\" x=\"5\" y=\"14\" rx=\"2\" /><rect width=\"10\" height=\"6\" x=\"7\" y=\"4\" rx=\"2\" /><path d=\"M2 20h20\" /><path d=\"M2 10h20\" />","align-vertical-distribute-start":"<rect width=\"14\" height=\"6\" x=\"5\" y=\"14\" rx=\"2\" /><rect width=\"10\" height=\"6\" x=\"7\" y=\"4\" rx=\"2\" /><path d=\"M2 14h20\" /><path d=\"M2 4h20\" />","align-vertical-justify-center":"<rect width=\"14\" height=\"6\" x=\"5\" y=\"16\" rx=\"2\" /><rect width=\"10\" height=\"6\" x=\"7\" y=\"2\" rx=\"2\" /><path d=\"M2 12h20\" />","align-vertical-justify-end":"<rect width=\"14\" height=\"6\" x=\"5\" y=\"12\" rx=\"2\" /><rect width=\"10\" height=\"6\" x=\"7\" y=\"2\" rx=\"2\" /><path d=\"M2 22h20\" />","align-vertical-justify-start":"<rect width=\"14\" height=\"6\" x=\"5\" y=\"16\" rx=\"2\" /><rect width=\"10\" height=\"6\" x=\"7\" y=\"6\" rx=\"2\" /><path d=\"M2 2h20\" />","align-vertical-space-around":"<rect width=\"10\" height=\"6\" x=\"7\" y=\"9\" rx=\"2\" /><path d=\"M22 20H2\" /><path d=\"M22 4H2\" />","align-vertical-space-between":"<rect width=\"14\" height=\"6\" x=\"5\" y=\"15\" rx=\"2\" /><rect width=\"10\" height=\"6\" x=\"7\" y=\"3\" rx=\"2\" /><path d=\"M2 21h20\" /><path d=\"M2 3h20\" />","ambulance":"<path d=\"M10 10H6\" /><path d=\"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2\" /><path d=\"M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14\" /><path d=\"M8 8v4\" /><path d=\"M9 18h6\" /><circle cx=\"17\" cy=\"18\" r=\"2\" /><circle cx=\"7\" cy=\"18\" r=\"2\" />","ampersand":"<path d=\"M16 12h3\" /><path d=\"M17.5 12a8 8 0 0 1-8 8A4.5 4.5 0 0 1 5 15.5c0-6 8-4 8-8.5a3 3 0 1 0-6 0c0 3 2.5 8.5 12 13\" />","ampersands":"<path d=\"M10 17c-5-3-7-7-7-9a2 2 0 0 1 4 0c0 2.5-5 2.5-5 6 0 1.7 1.3 3 3 3 2.8 0 5-2.2 5-5\" /><path d=\"M22 17c-5-3-7-7-7-9a2 2 0 0 1 4 0c0 2.5-5 2.5-5 6 0 1.7 1.3 3 3 3 2.8 0 5-2.2 5-5\" />","amphora":"<path d=\"M10 2v5.632c0 .424-.272.795-.653.982A6 6 0 0 0 6 14c.006 4 3 7 5 8\" /><path d=\"M10 5H8a2 2 0 0 0 0 4h.68\" /><path d=\"M14 2v5.632c0 .424.272.795.652.982A6 6 0 0 1 18 14c0 4-3 7-5 8\" /><path d=\"M14 5h2a2 2 0 0 1 0 4h-.68\" /><path d=\"M18 22H6\" /><path d=\"M9 2h6\" />","anchor":"<path d=\"M12 6v16\" /><path d=\"m19 13 2-1a9 9 0 0 1-18 0l2 1\" /><path d=\"M9 11h6\" /><circle cx=\"12\" cy=\"4\" r=\"2\" />","angle":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"M3 11a10 10 0 0 1 10 10\" />","angry":"<path d=\"M15 12v-1.584\" /><path d=\"M17 10a5 5 0 00-3 1\" /><path d=\"M7 10a5 5 0 013 1\" /><path d=\"M9 12v-1.584\" /><path d=\"M9 17a5 5 0 016.001 0\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","annoyed":"<path d=\"M14 10h2\" /><path d=\"M8 10h2\" /><path d=\"M8 16h8\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","antenna":"<path d=\"M2 12 7 2\" /><path d=\"m7 12 5-10\" /><path d=\"m12 12 5-10\" /><path d=\"m17 12 5-10\" /><path d=\"M4.5 7h15\" /><path d=\"M12 16v6\" />","anvil":"<path d=\"M7 10H6a4 4 0 0 1-4-4 1 1 0 0 1 1-1h4\" /><path d=\"M7 5a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1 7 7 0 0 1-7 7H8a1 1 0 0 1-1-1z\" /><path d=\"M9 12v5\" /><path d=\"M15 12v5\" /><path d=\"M5 20a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3 1 1 0 0 1-1 1H6a1 1 0 0 1-1-1\" />","aperture":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m14.31 8 5.74 9.94\" /><path d=\"M9.69 8h11.48\" /><path d=\"m7.38 12 5.74-9.94\" /><path d=\"M9.69 16 3.95 6.06\" /><path d=\"M14.31 16H2.83\" /><path d=\"m16.62 12-5.74 9.94\" />","app-window-mac":"<rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\" /><path d=\"M6 8h.01\" /><path d=\"M10 8h.01\" /><path d=\"M14 8h.01\" />","app-window":"<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\" /><path d=\"M10 4v4\" /><path d=\"M2 8h20\" /><path d=\"M6 4v4\" />","apple":"<path d=\"M12 6.528V3a1 1 0 0 1 1-1h0\" /><path d=\"M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21\" />","archive-restore":"<rect width=\"20\" height=\"5\" x=\"2\" y=\"3\" rx=\"1\" /><path d=\"M4 8v11a2 2 0 0 0 2 2h2\" /><path d=\"M20 8v11a2 2 0 0 1-2 2h-2\" /><path d=\"m9 15 3-3 3 3\" /><path d=\"M12 12v9\" />","archive-x":"<rect width=\"20\" height=\"5\" x=\"2\" y=\"3\" rx=\"1\" /><path d=\"M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8\" /><path d=\"m9.5 17 5-5\" /><path d=\"m9.5 12 5 5\" />","archive":"<rect width=\"20\" height=\"5\" x=\"2\" y=\"3\" rx=\"1\" /><path d=\"M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8\" /><path d=\"M10 12h4\" />","area-chart":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"M7 11.207a.5.5 0 0 1 .146-.353l2-2a.5.5 0 0 1 .708 0l3.292 3.292a.5.5 0 0 0 .708 0l4.292-4.292a.5.5 0 0 1 .854.353V16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z\" />","armchair":"<path d=\"M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3\" /><path d=\"M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z\" /><path d=\"M5 18v2\" /><path d=\"M19 18v2\" />","arrow-big-down-dash":"<path d=\"M14 8a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1h3.293a.707.707 0 0 1 .5 1.207l-6.939 6.939a1.207 1.207 0 0 1-1.708 0l-6.94-6.94a.707.707 0 0 1 .5-1.206H8a1 1 0 0 0 1-1V9a1 1 0 0 1 1-1z\" /><path d=\"M9 4h6\" />","arrow-big-down":"<path d=\"M9 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 0 1 1h3.293a.707.707 0 0 1 .5 1.207l-7.086 7.086a1 1 0 0 1-1.414 0l-7.086-7.086a.707.707 0 0 1 .5-1.207H8a1 1 0 0 0 1-1z\" />","arrow-big-left-dash":"<path d=\"M13 9a1 1 0 0 1-1-1V4.707a.707.707 0 0 0-1.207-.5l-6.94 6.94a1.207 1.207 0 0 0 0 1.707l6.94 6.94a.707.707 0 0 0 1.207-.5V16a1 1 0 0 1 1-1h2a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z\" /><path d=\"M20 9v6\" />","arrow-big-left":"<path d=\"M10.793 19.793a.707.707 0 0 0 1.207-.5V16a1 1 0 0 1 1-1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-6a1 1 0 0 1-1-1V4.707a.707.707 0 0 0-1.207-.5l-6.94 6.94a1.207 1.207 0 0 0 0 1.707z\" />","arrow-big-right-dash":"<path d=\"M11 9a1 1 0 0 0 1-1V4.707a.707.707 0 0 1 1.207-.5l6.94 6.94a1.207 1.207 0 0 1 0 1.707l-6.94 6.94a.707.707 0 0 1-1.207-.5V16a1 1 0 0 0-1-1H9a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z\" /><path d=\"M4 9v6\" />","arrow-big-right":"<path d=\"M13.207 19.793a.707.707 0 0 1-1.207-.5V16a1 1 0 0 0-1-1H5a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h6a1 1 0 0 0 1-1V4.707a.707.707 0 0 1 1.207-.5l6.94 6.94a1.207 1.207 0 0 1 0 1.707z\" />","arrow-big-up-dash":"<path d=\"M14 16a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1h3.293a.707.707 0 0 0 .5-1.207l-6.939-6.939a1.207 1.207 0 0 0-1.708 0l-6.94 6.94a.707.707 0 0 0 .5 1.206H8a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1z\" /><path d=\"M9 20h6\" />","arrow-big-up":"<path d=\"M9 19a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-6a1 1 0 0 1 1-1h3.293a.707.707 0 0 0 .5-1.207l-7.086-7.086a1 1 0 0 0-1.414 0l-7.086 7.086a.707.707 0 0 0 .5 1.207H8a1 1 0 0 1 1 1z\" />","arrow-down-0-1":"<path d=\"m3 16 4 4 4-4\" /><path d=\"M7 20V4\" /><rect x=\"15\" y=\"4\" width=\"4\" height=\"6\" ry=\"2\" /><path d=\"M17 20v-6h-2\" /><path d=\"M15 20h4\" />","arrow-down-01":"<path d=\"m3 16 4 4 4-4\" /><path d=\"M7 20V4\" /><rect x=\"15\" y=\"4\" width=\"4\" height=\"6\" ry=\"2\" /><path d=\"M17 20v-6h-2\" /><path d=\"M15 20h4\" />","arrow-down-1-0":"<path d=\"m3 16 4 4 4-4\" /><path d=\"M7 20V4\" /><path d=\"M17 10V4h-2\" /><path d=\"M15 10h4\" /><rect x=\"15\" y=\"14\" width=\"4\" height=\"6\" ry=\"2\" />","arrow-down-10":"<path d=\"m3 16 4 4 4-4\" /><path d=\"M7 20V4\" /><path d=\"M17 10V4h-2\" /><path d=\"M15 10h4\" /><rect x=\"15\" y=\"14\" width=\"4\" height=\"6\" ry=\"2\" />","arrow-down-a-z":"<path d=\"m3 16 4 4 4-4\" /><path d=\"M7 20V4\" /><path d=\"M20 8h-5\" /><path d=\"M15 10V6.5a2.5 2.5 0 0 1 5 0V10\" /><path d=\"M15 14h5l-5 6h5\" />","arrow-down-az":"<path d=\"m3 16 4 4 4-4\" /><path d=\"M7 20V4\" /><path d=\"M20 8h-5\" /><path d=\"M15 10V6.5a2.5 2.5 0 0 1 5 0V10\" /><path d=\"M15 14h5l-5 6h5\" />","arrow-down-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 8v8\" /><path d=\"m8 12 4 4 4-4\" />","arrow-down-from-line":"<path d=\"M19 3H5\" /><path d=\"M12 21V7\" /><path d=\"m6 15 6 6 6-6\" />","arrow-down-left-from-circle":"<path d=\"M2 12a10 10 0 1 1 10 10\" /><path d=\"m2 22 10-10\" /><path d=\"M8 22H2v-6\" />","arrow-down-left-from-square":"<path d=\"M13 21h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6\" /><path d=\"m3 21 9-9\" /><path d=\"M9 21H3v-6\" />","arrow-down-left-square":"<path d=\"M15 15H9l6-6\" /><path d=\"M9 15V9\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","arrow-down-left":"<path d=\"M17 7 7 17\" /><path d=\"M17 17H7V7\" />","arrow-down-narrow-wide":"<path d=\"m3 16 4 4 4-4\" /><path d=\"M7 20V4\" /><path d=\"M11 4h4\" /><path d=\"M11 8h7\" /><path d=\"M11 12h10\" />","arrow-down-right-from-circle":"<path d=\"M12 22a10 10 0 1 1 10-10\" /><path d=\"M22 22 12 12\" /><path d=\"M22 16v6h-6\" />","arrow-down-right-from-square":"<path d=\"M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6\" /><path d=\"m21 21-9-9\" /><path d=\"M21 15v6h-6\" />","arrow-down-right-square":"<path d=\"M15 15 9 9\" /><path d=\"M9 15h6V9\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","arrow-down-right":"<path d=\"m7 7 10 10\" /><path d=\"M17 7v10H7\" />","arrow-down-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M12 8v8\" /><path d=\"m8 12 4 4 4-4\" />","arrow-down-to-dot":"<path d=\"M12 2v14\" /><path d=\"m19 9-7 7-7-7\" /><circle cx=\"12\" cy=\"21\" r=\"1\" />","arrow-down-to-line":"<path d=\"M12 17V3\" /><path d=\"m6 11 6 6 6-6\" /><path d=\"M19 21H5\" />","arrow-down-up":"<path d=\"m3 16 4 4 4-4\" /><path d=\"M7 20V4\" /><path d=\"m21 8-4-4-4 4\" /><path d=\"M17 4v16\" />","arrow-down-wide-narrow":"<path d=\"m3 16 4 4 4-4\" /><path d=\"M7 20V4\" /><path d=\"M11 4h10\" /><path d=\"M11 8h7\" /><path d=\"M11 12h4\" />","arrow-down-z-a":"<path d=\"m3 16 4 4 4-4\" /><path d=\"M7 4v16\" /><path d=\"M15 4h5l-5 6h5\" /><path d=\"M15 20v-3.5a2.5 2.5 0 0 1 5 0V20\" /><path d=\"M20 18h-5\" />","arrow-down-za":"<path d=\"m3 16 4 4 4-4\" /><path d=\"M7 4v16\" /><path d=\"M15 4h5l-5 6h5\" /><path d=\"M15 20v-3.5a2.5 2.5 0 0 1 5 0V20\" /><path d=\"M20 18h-5\" />","arrow-down":"<path d=\"M12 5v14\" /><path d=\"m19 12-7 7-7-7\" />","arrow-left-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m12 8-4 4 4 4\" /><path d=\"M16 12H8\" />","arrow-left-from-line":"<path d=\"m9 6-6 6 6 6\" /><path d=\"M3 12h14\" /><path d=\"M21 19V5\" />","arrow-left-right":"<path d=\"M8 3 4 7l4 4\" /><path d=\"M4 7h16\" /><path d=\"m16 21 4-4-4-4\" /><path d=\"M20 17H4\" />","arrow-left-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"m12 8-4 4 4 4\" /><path d=\"M16 12H8\" />","arrow-left-to-line":"<path d=\"M3 19V5\" /><path d=\"m13 6-6 6 6 6\" /><path d=\"M7 12h14\" />","arrow-left":"<path d=\"m12 19-7-7 7-7\" /><path d=\"M19 12H5\" />","arrow-right-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m12 16 4-4-4-4\" /><path d=\"M8 12h8\" />","arrow-right-from-line":"<path d=\"M3 5v14\" /><path d=\"M21 12H7\" /><path d=\"m15 18 6-6-6-6\" />","arrow-right-left":"<path d=\"m16 3 4 4-4 4\" /><path d=\"M20 7H4\" /><path d=\"m8 21-4-4 4-4\" /><path d=\"M4 17h16\" />","arrow-right-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M8 12h8\" /><path d=\"m12 16 4-4-4-4\" />","arrow-right-to-line":"<path d=\"M17 12H3\" /><path d=\"m11 18 6-6-6-6\" /><path d=\"M21 5v14\" />","arrow-right":"<path d=\"M5 12h14\" /><path d=\"m12 5 7 7-7 7\" />","arrow-up-0-1":"<path d=\"m3 8 4-4 4 4\" /><path d=\"M7 4v16\" /><rect x=\"15\" y=\"4\" width=\"4\" height=\"6\" ry=\"2\" /><path d=\"M17 20v-6h-2\" /><path d=\"M15 20h4\" />","arrow-up-01":"<path d=\"m3 8 4-4 4 4\" /><path d=\"M7 4v16\" /><rect x=\"15\" y=\"4\" width=\"4\" height=\"6\" ry=\"2\" /><path d=\"M17 20v-6h-2\" /><path d=\"M15 20h4\" />","arrow-up-1-0":"<path d=\"m3 8 4-4 4 4\" /><path d=\"M7 4v16\" /><path d=\"M17 10V4h-2\" /><path d=\"M15 10h4\" /><rect x=\"15\" y=\"14\" width=\"4\" height=\"6\" ry=\"2\" />","arrow-up-10":"<path d=\"m3 8 4-4 4 4\" /><path d=\"M7 4v16\" /><path d=\"M17 10V4h-2\" /><path d=\"M15 10h4\" /><rect x=\"15\" y=\"14\" width=\"4\" height=\"6\" ry=\"2\" />","arrow-up-a-z":"<path d=\"m3 8 4-4 4 4\" /><path d=\"M7 4v16\" /><path d=\"M20 8h-5\" /><path d=\"M15 10V6.5a2.5 2.5 0 0 1 5 0V10\" /><path d=\"M15 14h5l-5 6h5\" />","arrow-up-az":"<path d=\"m3 8 4-4 4 4\" /><path d=\"M7 4v16\" /><path d=\"M20 8h-5\" /><path d=\"M15 10V6.5a2.5 2.5 0 0 1 5 0V10\" /><path d=\"M15 14h5l-5 6h5\" />","arrow-up-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m16 12-4-4-4 4\" /><path d=\"M12 16V8\" />","arrow-up-down":"<path d=\"m21 16-4 4-4-4\" /><path d=\"M17 20V4\" /><path d=\"m3 8 4-4 4 4\" /><path d=\"M7 4v16\" />","arrow-up-from-dot":"<path d=\"m5 9 7-7 7 7\" /><path d=\"M12 16V2\" /><circle cx=\"12\" cy=\"21\" r=\"1\" />","arrow-up-from-line":"<path d=\"m18 9-6-6-6 6\" /><path d=\"M12 3v14\" /><path d=\"M5 21h14\" />","arrow-up-left-from-circle":"<path d=\"M2 8V2h6\" /><path d=\"m2 2 10 10\" /><path d=\"M12 2A10 10 0 1 1 2 12\" />","arrow-up-left-from-square":"<path d=\"M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6\" /><path d=\"m3 3 9 9\" /><path d=\"M3 9V3h6\" />","arrow-up-left-square":"<path d=\"M15 15 9 9\" /><path d=\"M9 15V9h6\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","arrow-up-left":"<path d=\"M7 17V7h10\" /><path d=\"M17 17 7 7\" />","arrow-up-narrow-wide":"<path d=\"m3 8 4-4 4 4\" /><path d=\"M7 4v16\" /><path d=\"M11 12h4\" /><path d=\"M11 16h7\" /><path d=\"M11 20h10\" />","arrow-up-right-from-circle":"<path d=\"M22 12A10 10 0 1 1 12 2\" /><path d=\"M22 2 12 12\" /><path d=\"M16 2h6v6\" />","arrow-up-right-from-square":"<path d=\"M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6\" /><path d=\"m21 3-9 9\" /><path d=\"M15 3h6v6\" />","arrow-up-right-square":"<path d=\"M15 15V9H9\" /><path d=\"m9 15 6-6\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","arrow-up-right":"<path d=\"M7 7h10v10\" /><path d=\"M7 17 17 7\" />","arrow-up-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"m16 12-4-4-4 4\" /><path d=\"M12 16V8\" />","arrow-up-to-line":"<path d=\"M5 3h14\" /><path d=\"m18 13-6-6-6 6\" /><path d=\"M12 7v14\" />","arrow-up-wide-narrow":"<path d=\"m3 8 4-4 4 4\" /><path d=\"M7 4v16\" /><path d=\"M11 12h10\" /><path d=\"M11 16h7\" /><path d=\"M11 20h4\" />","arrow-up-z-a":"<path d=\"m3 8 4-4 4 4\" /><path d=\"M7 4v16\" /><path d=\"M15 4h5l-5 6h5\" /><path d=\"M15 20v-3.5a2.5 2.5 0 0 1 5 0V20\" /><path d=\"M20 18h-5\" />","arrow-up-za":"<path d=\"m3 8 4-4 4 4\" /><path d=\"M7 4v16\" /><path d=\"M15 4h5l-5 6h5\" /><path d=\"M15 20v-3.5a2.5 2.5 0 0 1 5 0V20\" /><path d=\"M20 18h-5\" />","arrow-up":"<path d=\"m5 12 7-7 7 7\" /><path d=\"M12 19V5\" />","arrows-up-from-line":"<path d=\"m4 6 3-3 3 3\" /><path d=\"M7 17V3\" /><path d=\"m14 6 3-3 3 3\" /><path d=\"M17 17V3\" /><path d=\"M4 21h16\" />","asterisk-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M12 8v8\" /><path d=\"m8.5 14 7-4\" /><path d=\"m8.5 10 7 4\" />","asterisk":"<path d=\"M12 5v14\" /><path d=\"m18.065 8.496-12.125 7\" /><path d=\"m5.94 8.504 12.125 7\" />","astroid":"<path d=\"M12.983 21.186a1 1 0 0 1-1.966 0 10 10 0 0 0-8.203-8.203 1 1 0 0 1 0-1.966 10 10 0 0 0 8.203-8.203 1 1 0 0 1 1.966 0 10 10 0 0 0 8.203 8.203 1 1 0 0 1 0 1.966 10 10 0 0 0-8.203 8.203\" />","at-sign":"<circle cx=\"12\" cy=\"12\" r=\"4\" /><path d=\"M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8\" />","atom":"<circle cx=\"12\" cy=\"12\" r=\"1\" /><path d=\"M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z\" /><path d=\"M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z\" />","audio-lines-off":"<path d=\"M10 10v11\" /><path d=\"M10 3v1.35\" /><path d=\"M14 14v1\" /><path d=\"M14 8v.35\" /><path d=\"M18 5v7.35\" /><path d=\"M2 10v3\" /><path d=\"m2 2 20 20\" /><path d=\"M22 10v3\" /><path d=\"M6 6v11\" />","audio-lines-x":"<path d=\"M10 3v18\" /><path d=\"M14 8v6.35\" /><path d=\"m17 17 5 5\" /><path d=\"M18 5v8.1\" /><path d=\"M2 10v3\" /><path d=\"M22 10v3\" /><path d=\"m22 17-5 5\" /><path d=\"M6 6v11\" />","audio-lines":"<path d=\"M2 10v3\" /><path d=\"M6 6v11\" /><path d=\"M10 3v18\" /><path d=\"M14 8v7\" /><path d=\"M18 5v13\" /><path d=\"M22 10v3\" />","audio-waveform":"<path d=\"M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2\" />","award":"<path d=\"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526\" /><circle cx=\"12\" cy=\"8\" r=\"6\" />","axe":"<path d=\"m14 12-8.381 8.38a1 1 0 0 1-3.001-3L11 9\" /><path d=\"M15 15.5a.5.5 0 0 0 .5.5A6.5 6.5 0 0 0 22 9.5a.5.5 0 0 0-.5-.5h-1.672a2 2 0 0 1-1.414-.586l-5.062-5.062a1.205 1.205 0 0 0-1.704 0L9.352 5.648a1.205 1.205 0 0 0 0 1.704l5.062 5.062A2 2 0 0 1 15 13.828z\" />","axis-3-d":"<path d=\"M13.5 10.5 15 9\" /><path d=\"M4 4v15a1 1 0 0 0 1 1h15\" /><path d=\"M4.293 19.707 6 18\" /><path d=\"m9 15 1.5-1.5\" />","axis-3d":"<path d=\"M13.5 10.5 15 9\" /><path d=\"M4 4v15a1 1 0 0 0 1 1h15\" /><path d=\"M4.293 19.707 6 18\" /><path d=\"m9 15 1.5-1.5\" />","baby":"<path d=\"M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5\" /><path d=\"M15 12h.01\" /><path d=\"M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1\" /><path d=\"M9 12h.01\" />","backpack":"<path d=\"M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z\" /><path d=\"M8 10h8\" /><path d=\"M8 18h8\" /><path d=\"M8 22v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6\" /><path d=\"M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2\" />","badge-alert":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\" /><line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\" />","badge-cent":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /><path d=\"M12 7v10\" /><path d=\"M15.4 10a4 4 0 1 0 0 4\" />","badge-check":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /><path d=\"m16 9-5.5 5.5L8 12\" />","badge-dollar-sign":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /><path d=\"M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8\" /><path d=\"M12 18V6\" />","badge-euro":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /><path d=\"M7 12h5\" /><path d=\"M15 9.4a4 4 0 1 0 0 5.2\" />","badge-help":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\" /><line x1=\"12\" x2=\"12.01\" y1=\"17\" y2=\"17\" />","badge-indian-rupee":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /><path d=\"M8 8h8\" /><path d=\"M8 12h8\" /><path d=\"m13 17-5-1h1a4 4 0 0 0 0-8\" />","badge-info":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /><line x1=\"12\" x2=\"12\" y1=\"16\" y2=\"12\" /><line x1=\"12\" x2=\"12.01\" y1=\"8\" y2=\"8\" />","badge-japanese-yen":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /><path d=\"m9 8 3 3v7\" /><path d=\"m12 11 3-3\" /><path d=\"M9 12h6\" /><path d=\"M9 16h6\" />","badge-minus":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /><line x1=\"8\" x2=\"16\" y1=\"12\" y2=\"12\" />","badge-percent":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /><path d=\"m15 9-6 6\" /><path d=\"M9 9h.01\" /><path d=\"M15 15h.01\" />","badge-plus":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"16\" /><line x1=\"8\" x2=\"16\" y1=\"12\" y2=\"12\" />","badge-pound-sterling":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /><path d=\"M8 12h4\" /><path d=\"M10 16V9.5a2.5 2.5 0 0 1 5 0\" /><path d=\"M8 16h7\" />","badge-question-mark":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\" /><line x1=\"12\" x2=\"12.01\" y1=\"17\" y2=\"17\" />","badge-russian-ruble":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /><path d=\"M9 16h5\" /><path d=\"M9 12h5a2 2 0 1 0 0-4h-3v9\" />","badge-swiss-franc":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /><path d=\"M11 17V8h4\" /><path d=\"M11 12h3\" /><path d=\"M9 16h4\" />","badge-turkish-lira":"<path d=\"M11 7v10a5 5 0 0 0 5-5\" /><path d=\"m15 8-6 3\" /><path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76\" />","badge-x":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /><line x1=\"15\" x2=\"9\" y1=\"9\" y2=\"15\" /><line x1=\"9\" x2=\"15\" y1=\"9\" y2=\"15\" />","badge":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" />","baggage-claim":"<path d=\"M22 18H6a2 2 0 0 1-2-2V7a2 2 0 0 0-2-2\" /><path d=\"M17 14V4a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v10\" /><rect width=\"13\" height=\"8\" x=\"8\" y=\"6\" rx=\"1\" /><circle cx=\"18\" cy=\"20\" r=\"2\" /><circle cx=\"9\" cy=\"20\" r=\"2\" />","balloon":"<path d=\"M12 16v1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v1\" /><path d=\"M12 6a2 2 0 0 1 2 2\" /><path d=\"M18 8c0 4-3.5 8-6 8s-6-4-6-8a6 6 0 0 1 12 0\" />","ban":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M4.929 4.929 19.07 19.071\" />","banana":"<path d=\"M4 13c3.5-2 8-2 10 2a5.5 5.5 0 0 1 8 5\" /><path d=\"M5.15 17.89c5.52-1.52 8.65-6.89 7-12C11.55 4 11.5 2 13 2c3.22 0 5 5.5 5 8 0 6.5-4.2 12-10.49 12C5.11 22 2 22 2 20c0-1.5 1.14-1.55 3.15-2.11Z\" />","bandage":"<path d=\"M10 10.01h.01\" /><path d=\"M10 14.01h.01\" /><path d=\"M14 10.01h.01\" /><path d=\"M14 14.01h.01\" /><path d=\"M18 6v12\" /><path d=\"M6 6v12\" /><rect x=\"2\" y=\"6\" width=\"20\" height=\"12\" rx=\"2\" />","bangladeshi-taka":"<path d=\"M6 5a2 2 0 0 1 4 0v12a4 4 0 0 0 8 0 2 2 0 0 0-4 0\" /><path d=\"M6 9h12\" />","banknote-arrow-down":"<path d=\"M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5\" /><path d=\"m16 19 3 3 3-3\" /><path d=\"M18 12h.01\" /><path d=\"M19 16v6\" /><path d=\"M6 12h.01\" /><circle cx=\"12\" cy=\"12\" r=\"2\" />","banknote-arrow-up":"<path d=\"M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5\" /><path d=\"M18 12h.01\" /><path d=\"M19 22v-6\" /><path d=\"m22 19-3-3-3 3\" /><path d=\"M6 12h.01\" /><circle cx=\"12\" cy=\"12\" r=\"2\" />","banknote-check":"<path d=\"M11.748 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4.875\" /><path d=\"m16 19 2 2 4-4\" /><path d=\"M18 12h.01\" /><path d=\"M6 12h.01\" /><circle cx=\"12\" cy=\"12\" r=\"2\" />","banknote-x":"<path d=\"M13 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5\" /><path d=\"m17 17 5 5\" /><path d=\"M18 12h.01\" /><path d=\"m22 17-5 5\" /><path d=\"M6 12h.01\" /><circle cx=\"12\" cy=\"12\" r=\"2\" />","banknote":"<rect width=\"20\" height=\"12\" x=\"2\" y=\"6\" rx=\"2\" /><circle cx=\"12\" cy=\"12\" r=\"2\" /><path d=\"M6 12h.01M18 12h.01\" />","bar-chart-2":"<path d=\"M5 21v-6\" /><path d=\"M12 21V3\" /><path d=\"M19 21V9\" />","bar-chart-3":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"M18 17V9\" /><path d=\"M13 17V5\" /><path d=\"M8 17v-3\" />","bar-chart-4":"<path d=\"M13 17V9\" /><path d=\"M18 17V5\" /><path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"M8 17v-3\" />","bar-chart-big":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><rect x=\"15\" y=\"5\" width=\"4\" height=\"12\" rx=\"1\" /><rect x=\"7\" y=\"8\" width=\"4\" height=\"9\" rx=\"1\" />","bar-chart-horizontal-big":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><rect x=\"7\" y=\"13\" width=\"9\" height=\"4\" rx=\"1\" /><rect x=\"7\" y=\"5\" width=\"12\" height=\"4\" rx=\"1\" />","bar-chart-horizontal":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"M7 16h8\" /><path d=\"M7 11h12\" /><path d=\"M7 6h3\" />","bar-chart":"<path d=\"M5 21v-6\" /><path d=\"M12 21V9\" /><path d=\"M19 21V3\" />","barcode":"<path d=\"M3 5v14\" /><path d=\"M8 5v14\" /><path d=\"M12 5v14\" /><path d=\"M17 5v14\" /><path d=\"M21 5v14\" />","barrel":"<path d=\"M10 3a41 41 0 000 18\" /><path d=\"M14 3a41 41 0 010 18\" /><path d=\"M16.997 21a2 2 0 001.68-.92 15.25 15.25 0 000-16.16 2 2 0 00-1.68-.92h-10a2 2 0 00-1.681.92 15.25 15.25 0 000 16.16 2 2 0 001.681.92z\" /><path d=\"M3.54 16h16.914\" /><path d=\"M3.54 8h16.914\" />","baseline":"<path d=\"M4 20h16\" /><path d=\"m6 16 6-12 6 12\" /><path d=\"M8 12h8\" />","bath":"<path d=\"M10 4 8 6\" /><path d=\"M17 19v2\" /><path d=\"M2 12h20\" /><path d=\"M7 19v2\" /><path d=\"M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5\" />","battery-charging":"<path d=\"m11 7-3 5h4l-3 5\" /><path d=\"M14.856 6H16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.935\" /><path d=\"M22 14v-4\" /><path d=\"M5.14 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2.936\" />","battery-full":"<path d=\"M10 10v4\" /><path d=\"M14 10v4\" /><path d=\"M22 14v-4\" /><path d=\"M6 10v4\" /><rect x=\"2\" y=\"6\" width=\"16\" height=\"12\" rx=\"2\" />","battery-low":"<path d=\"M22 14v-4\" /><path d=\"M6 14v-4\" /><rect x=\"2\" y=\"6\" width=\"16\" height=\"12\" rx=\"2\" />","battery-medium":"<path d=\"M10 14v-4\" /><path d=\"M22 14v-4\" /><path d=\"M6 14v-4\" /><rect x=\"2\" y=\"6\" width=\"16\" height=\"12\" rx=\"2\" />","battery-plus":"<path d=\"M10 9v6\" /><path d=\"M12.543 6H16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.605\" /><path d=\"M22 14v-4\" /><path d=\"M7 12h6\" /><path d=\"M7.606 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.606\" />","battery-warning":"<path d=\"M10 17h.01\" /><path d=\"M10 7v6\" /><path d=\"M14 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2\" /><path d=\"M22 14v-4\" /><path d=\"M6 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2\" />","battery":"<path d=\"M 22 14 L 22 10\" /><rect x=\"2\" y=\"6\" width=\"16\" height=\"12\" rx=\"2\" />","beaker":"<path d=\"M4.5 3h15\" /><path d=\"M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3\" /><path d=\"M6 14h12\" />","bean-off":"<path d=\"M9 9c-.64.64-1.521.954-2.402 1.165A6 6 0 0 0 8 22a13.96 13.96 0 0 0 9.9-4.1\" /><path d=\"M10.75 5.093A6 6 0 0 1 22 8c0 2.411-.61 4.68-1.683 6.66\" /><path d=\"M5.341 10.62a4 4 0 0 0 6.487 1.208M10.62 5.341a4.015 4.015 0 0 1 2.039 2.04\" /><line x1=\"2\" x2=\"22\" y1=\"2\" y2=\"22\" />","bean":"<path d=\"M10.165 6.598C9.954 7.478 9.64 8.36 9 9c-.64.64-1.521.954-2.402 1.165A6 6 0 0 0 8 22c7.732 0 14-6.268 14-14a6 6 0 0 0-11.835-1.402Z\" /><path d=\"M5.341 10.62a4 4 0 1 0 5.279-5.28\" />","bed-double":"<path d=\"M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8\" /><path d=\"M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4\" /><path d=\"M12 4v6\" /><path d=\"M2 18h20\" />","bed-single":"<path d=\"M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8\" /><path d=\"M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4\" /><path d=\"M3 18h18\" />","bed":"<path d=\"M2 4v16\" /><path d=\"M2 8h18a2 2 0 0 1 2 2v10\" /><path d=\"M2 17h20\" /><path d=\"M6 8v9\" />","beef-off":"<path d=\"M11.771 6.109a2.5 2.5 0 0 1 3.12 3.12\" /><path d=\"M17.852 12.185a6.5 6.5 0 0 0-9.035-9.04\" /><path d=\"M18.013 18.013C15.029 20.349 10.831 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5\" /><path d=\"m18.5 6 2.19 4.5a6.48 6.48 0 0 1-.139 4.393\" /><path d=\"m2 2 20 20\" /><path d=\"M6.355 6.37a7 7 0 0 0-.075.23c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c3.356 0 6.993-1.267 9.85-3.151\" />","beef":"<path d=\"M16.4 13.7A6.5 6.5 0 1 0 6.28 6.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3\" /><path d=\"m18.5 6 1.754 3.5a6.48 6.48 0 0 1-1.854 8.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5\" /><circle cx=\"12.5\" cy=\"8.5\" r=\"2.5\" />","beer-off":"<path d=\"M13 13v5\" /><path d=\"M17 11.47V8\" /><path d=\"M17 11h1a3 3 0 0 1 2.745 4.211\" /><path d=\"m2 2 20 20\" /><path d=\"M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3\" /><path d=\"M7.536 7.535C6.766 7.649 6.154 8 5.5 8a2.5 2.5 0 0 1-1.768-4.268\" /><path d=\"M8.727 3.204C9.306 2.767 9.885 2 11 2c1.56 0 2 1.5 3 1.5s1.72-.5 2.5-.5a1 1 0 1 1 0 5c-.78 0-1.5-.5-2.5-.5a3.149 3.149 0 0 0-.842.12\" /><path d=\"M9 14.6V18\" />","beer":"<path d=\"M17 11h1a3 3 0 0 1 0 6h-1\" /><path d=\"M9 12v6\" /><path d=\"M13 12v6\" /><path d=\"M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 2 11 2s2 1.5 3 1.5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z\" /><path d=\"M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8\" />","bell-check":"<path d=\"M10.268 21a2 2 0 0 0 3.464 0\" /><path d=\"m15 8 2 2 4-4\" /><path d=\"M16.8607 4.4824A6 6 0 0 0 6 8C6 12.499 4.589 13.956 3.262 15.326\" /><path d=\"M3.262 15.326A1 1 0 0 0 4 17H20A1 1 0 0 0 20.74 15.327C20.209 14.779 19.665 14.218 19.203 13.454\" />","bell-dot":"<path d=\"M10.268 21a2 2 0 0 0 3.464 0\" /><path d=\"M11.68 2.009A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673c-.824-.85-1.678-1.731-2.21-3.348\" /><circle cx=\"18\" cy=\"5\" r=\"3\" />","bell-electric":"<path d=\"M18.518 17.347A7 7 0 0 1 14 19\" /><path d=\"M18.8 4A11 11 0 0 1 20 9\" /><path d=\"M9 9h.01\" /><circle cx=\"20\" cy=\"16\" r=\"2\" /><circle cx=\"9\" cy=\"9\" r=\"7\" /><rect x=\"4\" y=\"16\" width=\"10\" height=\"6\" rx=\"2\" />","bell-minus":"<path d=\"M10.268 21a2 2 0 0 0 3.464 0\" /><path d=\"M15 8h6\" /><path d=\"M16.243 3.757A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673A9.4 9.4 0 0 1 18.667 12\" />","bell-off":"<path d=\"M10.268 21a2 2 0 0 0 3.464 0\" /><path d=\"M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742\" /><path d=\"m2 2 20 20\" /><path d=\"M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05\" />","bell-plus":"<path d=\"M10.268 21a2 2 0 0 0 3.464 0\" /><path d=\"M15 8h6\" /><path d=\"M18 5v6\" /><path d=\"M20.002 14.464a9 9 0 0 0 .738.863A1 1 0 0 1 20 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 8.75-5.332\" />","bell-ring":"<path d=\"M10.268 21a2 2 0 0 0 3.464 0\" /><path d=\"M22 8c0-2.3-.8-4.3-2-6\" /><path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\" /><path d=\"M4 2C2.8 3.7 2 5.7 2 8\" />","bell":"<path d=\"M10.268 21a2 2 0 0 0 3.464 0\" /><path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\" />","between-horizonal-end":"<rect width=\"13\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\" /><path d=\"m22 15-3-3 3-3\" /><rect width=\"13\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\" />","between-horizonal-start":"<rect width=\"13\" height=\"7\" x=\"8\" y=\"3\" rx=\"1\" /><path d=\"m2 9 3 3-3 3\" /><rect width=\"13\" height=\"7\" x=\"8\" y=\"14\" rx=\"1\" />","between-horizontal-end":"<rect width=\"13\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\" /><path d=\"m22 15-3-3 3-3\" /><rect width=\"13\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\" />","between-horizontal-start":"<rect width=\"13\" height=\"7\" x=\"8\" y=\"3\" rx=\"1\" /><path d=\"m2 9 3 3-3 3\" /><rect width=\"13\" height=\"7\" x=\"8\" y=\"14\" rx=\"1\" />","between-vertical-end":"<rect width=\"7\" height=\"13\" x=\"3\" y=\"3\" rx=\"1\" /><path d=\"m9 22 3-3 3 3\" /><rect width=\"7\" height=\"13\" x=\"14\" y=\"3\" rx=\"1\" />","between-vertical-start":"<rect width=\"7\" height=\"13\" x=\"3\" y=\"8\" rx=\"1\" /><path d=\"m15 2-3 3-3-3\" /><rect width=\"7\" height=\"13\" x=\"14\" y=\"8\" rx=\"1\" />","biceps-flexed":"<path d=\"M12.409 13.017A5 5 0 0 1 22 15c0 3.866-4 7-9 7-4.077 0-8.153-.82-10.371-2.462-.426-.316-.631-.832-.62-1.362C2.118 12.723 2.627 2 10 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2c-1.105 0-1.64-.444-2-1\" /><path d=\"M15 14a5 5 0 0 0-7.584 2\" /><path d=\"M9.964 6.825C8.019 7.977 9.5 13 8 15\" />","bike":"<circle cx=\"18.5\" cy=\"17.5\" r=\"3.5\" /><circle cx=\"5.5\" cy=\"17.5\" r=\"3.5\" /><circle cx=\"15\" cy=\"5\" r=\"1\" /><path d=\"M12 17.5V14l-3-3 4-3 2 3h2\" />","binary":"<rect x=\"14\" y=\"14\" width=\"4\" height=\"6\" rx=\"2\" /><rect x=\"6\" y=\"4\" width=\"4\" height=\"6\" rx=\"2\" /><path d=\"M6 20h4\" /><path d=\"M14 10h4\" /><path d=\"M6 14h2v6\" /><path d=\"M14 4h2v6\" />","binoculars":"<path d=\"M10 10h4\" /><path d=\"M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3\" /><path d=\"M20 21a2 2 0 0 0 2-2v-3.851c0-1.39-2-2.962-2-4.829V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2z\" /><path d=\"M 22 16 L 2 16\" /><path d=\"M4 21a2 2 0 0 1-2-2v-3.851c0-1.39 2-2.962 2-4.829V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2z\" /><path d=\"M9 7V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3\" />","biohazard":"<circle cx=\"12\" cy=\"11.9\" r=\"2\" /><path d=\"M6.7 3.4c-.9 2.5 0 5.2 2.2 6.7C6.5 9 3.7 9.6 2 11.6\" /><path d=\"m8.9 10.1 1.4.8\" /><path d=\"M17.3 3.4c.9 2.5 0 5.2-2.2 6.7 2.4-1.2 5.2-.6 6.9 1.5\" /><path d=\"m15.1 10.1-1.4.8\" /><path d=\"M16.7 20.8c-2.6-.4-4.6-2.6-4.7-5.3-.2 2.6-2.1 4.8-4.7 5.2\" /><path d=\"M12 13.9v1.6\" /><path d=\"M13.5 5.4c-1-.2-2-.2-3 0\" /><path d=\"M17 16.4c.7-.7 1.2-1.6 1.5-2.5\" /><path d=\"M5.5 13.9c.3.9.8 1.8 1.5 2.5\" />","bird":"<path d=\"M16 7h.01\" /><path d=\"M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20\" /><path d=\"m20 7 2 .5-2 .5\" /><path d=\"M10 18v3\" /><path d=\"M14 17.75V21\" /><path d=\"M7 18a6 6 0 0 0 3.84-10.61\" />","birdhouse":"<path d=\"M12 18v4\" /><path d=\"m17 18 1.956-11.468\" /><path d=\"m3 8 7.82-5.615a2 2 0 0 1 2.36 0L21 8\" /><path d=\"M4 18h16\" /><path d=\"M7 18 5.044 6.532\" /><circle cx=\"12\" cy=\"10\" r=\"2\" />","bitcoin":"<path d=\"M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727\" />","blend":"<circle cx=\"15\" cy=\"9\" r=\"7\" /><circle cx=\"9\" cy=\"15\" r=\"7\" />","blender":"<path d=\"M8 14a2 2 0 0 0-1.963 1.615l-1.018 5.193A1 1 0 0 0 6 22h12a1 1 0 0 0 .981-1.192l-1.018-5.193A2 2 0 0 0 16 14z\" /><path d=\"m17 2-1 12\" /><path d=\"M8.006 14 7 2\" /><path d=\"M7.565 8.787A5 5 0 0 0 12 8a5 5 0 0 1 4.56-.75\" /><path d=\"M19 2H5a2 2 0 0 0-2 2v5a2 2 0 0 0 .688 1.5\" /><path d=\"M12 18h.01\" />","blinds":"<path d=\"M3 3h18\" /><path d=\"M20 7H8\" /><path d=\"M20 11H8\" /><path d=\"M10 19h10\" /><path d=\"M8 15h12\" /><path d=\"M4 3v14\" /><circle cx=\"4\" cy=\"19\" r=\"2\" />","blocks":"<path d=\"M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2\" /><rect x=\"14\" y=\"2\" width=\"8\" height=\"8\" rx=\"1\" />","bluetooth-connected":"<path d=\"m7 7 10 10-5 5V2l5 5L7 17\" /><line x1=\"18\" x2=\"21\" y1=\"12\" y2=\"12\" /><line x1=\"3\" x2=\"6\" y1=\"12\" y2=\"12\" />","bluetooth-off":"<path d=\"m17 17-5 5V12l-5 5\" /><path d=\"m2 2 20 20\" /><path d=\"M14.5 9.5 17 7l-5-5v4.5\" />","bluetooth-searching":"<path d=\"m7 7 10 10-5 5V2l5 5L7 17\" /><path d=\"M20.83 14.83a4 4 0 0 0 0-5.66\" /><path d=\"M18 12h.01\" />","bluetooth":"<path d=\"m7 7 10 10-5 5V2l5 5L7 17\" />","bold":"<path d=\"M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8\" />","bolt":"<path d=\"M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z\" /><circle cx=\"12\" cy=\"12\" r=\"4\" />","bomb":"<circle cx=\"11\" cy=\"13\" r=\"9\" /><path d=\"M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95\" /><path d=\"m22 2-1.5 1.5\" />","bone-fracture":"<path d=\"M14 4.5a1 1 0 0 1 5 0 .5.5 0 0 0 .5.5 1 1 0 0 1 0 5c-.81 0-1.8-.7-2.5 0l-1.958 1.957a.15.15 0 0 1-.252-.072l-.493-2.07a.15.15 0 0 0-.111-.112l-2.072-.494a.15.15 0 0 1-.072-.252L14 7c.7-.7 0-1.69 0-2.5\" /><path d=\"m16 20-1-2\" /><path d=\"m20 16-2-1\" /><path d=\"m4 8 2 1\" /><path d=\"m8 4 1 2\" /><path d=\"M9.698 14.19a.15.15 0 0 0 .112.112l2.074.489a.15.15 0 0 1 .072.252L10 17c-.7.7 0 1.69 0 2.5a1 1 0 0 1-5 0 .495.495 0 0 0-.5-.5 1 1 0 0 1 0-5c.81 0 1.8.7 2.5 0l1.956-1.957a.15.15 0 0 1 .252.072z\" />","bone":"<path d=\"M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z\" />","book-a":"<path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" /><path d=\"m8 13 4-7 4 7\" /><path d=\"M9.1 11h5.7\" />","book-alert":"<path d=\"M12 13h.01\" /><path d=\"M12 6v3\" /><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" />","book-audio":"<path d=\"M12 6v7\" /><path d=\"M16 8v3\" /><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" /><path d=\"M8 8v3\" />","book-bookmark":"<path d=\"M10 2v7.751a.25.25 0 00.407.195l2.28-1.834a.5.5 0 01.627 0l2.28 1.834A.25.25 0 0016 9.751V2\" /><path d=\"M4 19.5v-15A2.5 2.5 0 016.5 2H19a1 1 0 011 1v18a1 1 0 01-1 1H6.5a1 1 0 010-5H20\" />","book-check":"<path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" /><path d=\"m9 9.5 2 2 4-4\" />","book-copy":"<path d=\"M5 7a2 2 0 0 0-2 2v11\" /><path d=\"M5.803 18H5a2 2 0 0 0 0 4h9.5a.5.5 0 0 0 .5-.5V21\" /><path d=\"M9 15V4a2 2 0 0 1 2-2h9.5a.5.5 0 0 1 .5.5v14a.5.5 0 0 1-.5.5H11a2 2 0 0 1 0-4h10\" />","book-dashed":"<path d=\"M12 17h1.5\" /><path d=\"M12 22h1.5\" /><path d=\"M12 2h1.5\" /><path d=\"M17.5 22H19a1 1 0 0 0 1-1\" /><path d=\"M17.5 2H19a1 1 0 0 1 1 1v1.5\" /><path d=\"M20 14v3h-2.5\" /><path d=\"M20 8.5V10\" /><path d=\"M4 10V8.5\" /><path d=\"M4 19.5V14\" /><path d=\"M4 4.5A2.5 2.5 0 0 1 6.5 2H8\" /><path d=\"M8 22H6.5a1 1 0 0 1 0-5H8\" />","book-down":"<path d=\"M12 13V7\" /><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" /><path d=\"m9 10 3 3 3-3\" />","book-headphones":"<path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" /><path d=\"M8 12v-2a4 4 0 0 1 8 0v2\" /><circle cx=\"15\" cy=\"12\" r=\"1\" /><circle cx=\"9\" cy=\"12\" r=\"1\" />","book-heart":"<path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" /><path d=\"M8.62 9.8A2.25 2.25 0 1 1 12 6.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z\" />","book-image":"<path d=\"m20 13.7-2.1-2.1a2 2 0 0 0-2.8 0L9.7 17\" /><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" /><circle cx=\"10\" cy=\"8\" r=\"2\" />","book-key":"<path d=\"M13 2H6.5A2.5 2.5 0 0 0 4 4.5v15\" /><path d=\"M17 2v6\" /><path d=\"M17 4h2\" /><path d=\"M20 15.2V21a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" /><circle cx=\"17\" cy=\"10\" r=\"2\" />","book-lock":"<path d=\"M18 6V4a2 2 0 1 0-4 0v2\" /><path d=\"M20 15v6a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" /><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H10\" /><rect x=\"12\" y=\"6\" width=\"8\" height=\"5\" rx=\"1\" />","book-marked":"<path d=\"M10 2v7.751a.25.25 0 00.407.195l2.28-1.834a.5.5 0 01.627 0l2.28 1.834A.25.25 0 0016 9.751V2\" /><path d=\"M4 19.5v-15A2.5 2.5 0 016.5 2H19a1 1 0 011 1v18a1 1 0 01-1 1H6.5a1 1 0 010-5H20\" />","book-minus":"<path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" /><path d=\"M9 10h6\" />","book-open-check":"<path d=\"M12 5v16\" /><path d=\"m16 12 2 2 4-4\" /><path d=\"M22 6V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2h4.001A2 2 0 0022 17v-1.344\" />","book-open-text":"<path d=\"M12 5v16\" /><path d=\"M16 13h2\" /><path d=\"M16 9h2\" /><path d=\"M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z\" /><path d=\"M6 13h2\" /><path d=\"M6 9h2\" />","book-open":"<path d=\"M12 5v16\" /><path d=\"M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z\" />","book-plus":"<path d=\"M12 7v6\" /><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" /><path d=\"M9 10h6\" />","book-search":"<path d=\"M11 22H5.5a1 1 0 0 1 0-5h4.501\" /><path d=\"m21 22-1.879-1.878\" /><path d=\"M3 19.5v-15A2.5 2.5 0 0 1 5.5 2H18a1 1 0 0 1 1 1v8\" /><circle cx=\"17\" cy=\"18\" r=\"3\" />","book-template":"<path d=\"M12 17h1.5\" /><path d=\"M12 22h1.5\" /><path d=\"M12 2h1.5\" /><path d=\"M17.5 22H19a1 1 0 0 0 1-1\" /><path d=\"M17.5 2H19a1 1 0 0 1 1 1v1.5\" /><path d=\"M20 14v3h-2.5\" /><path d=\"M20 8.5V10\" /><path d=\"M4 10V8.5\" /><path d=\"M4 19.5V14\" /><path d=\"M4 4.5A2.5 2.5 0 0 1 6.5 2H8\" /><path d=\"M8 22H6.5a1 1 0 0 1 0-5H8\" />","book-text":"<path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" /><path d=\"M8 11h8\" /><path d=\"M8 7h6\" />","book-type":"<path d=\"M10 13h4\" /><path d=\"M12 6v7\" /><path d=\"M16 8V6H8v2\" /><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" />","book-up-2":"<path d=\"M12 13V7\" /><path d=\"M18 2h1a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" /><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2\" /><path d=\"m9 10 3-3 3 3\" /><path d=\"m9 5 3-3 3 3\" />","book-up":"<path d=\"M12 13V7\" /><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" /><path d=\"m9 10 3-3 3 3\" />","book-user":"<path d=\"M15 13a3 3 0 1 0-6 0\" /><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" /><circle cx=\"12\" cy=\"8\" r=\"2\" />","book-x":"<path d=\"m14.5 7.5-5 5\" /><path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" /><path d=\"m9.5 7.5 5 5\" />","book":"<path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\" />","bookmark-check":"<path d=\"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z\" /><path d=\"m9 10 2 2 4-4\" />","bookmark-minus":"<path d=\"M15 10H9\" /><path d=\"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z\" />","bookmark-off":"<path d=\"M19 19v1a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5\" /><path d=\"m2 2 20 20\" /><path d=\"M8.656 3H17a2 2 0 0 1 2 2v8.344\" />","bookmark-plus":"<path d=\"M12 7v6\" /><path d=\"M15 10H9\" /><path d=\"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z\" />","bookmark-x":"<path d=\"m14.5 7.5-5 5\" /><path d=\"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z\" /><path d=\"m9.5 7.5 5 5\" />","bookmark":"<path d=\"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z\" />","boom-box":"<path d=\"M4 9V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4\" /><path d=\"M8 8v1\" /><path d=\"M12 8v1\" /><path d=\"M16 8v1\" /><rect width=\"20\" height=\"12\" x=\"2\" y=\"9\" rx=\"2\" /><circle cx=\"8\" cy=\"15\" r=\"2\" /><circle cx=\"16\" cy=\"15\" r=\"2\" />","bot-message-square":"<path d=\"M12 6V2H8\" /><path d=\"M15 11v2\" /><path d=\"M2 12h2\" /><path d=\"M20 12h2\" /><path d=\"M20 16a2 2 0 0 1-2 2H8.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 4 20.286V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z\" /><path d=\"M9 11v2\" />","bot-off":"<path d=\"M13.67 8H18a2 2 0 0 1 2 2v4.33\" /><path d=\"M2 14h2\" /><path d=\"M20 14h2\" /><path d=\"M22 22 2 2\" /><path d=\"M8 8H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 1.414-.586\" /><path d=\"M9 13v2\" /><path d=\"M9.67 4H12v2.33\" />","bot":"<path d=\"M12 8V4H8\" /><rect width=\"16\" height=\"12\" x=\"4\" y=\"8\" rx=\"2\" /><path d=\"M2 14h2\" /><path d=\"M20 14h2\" /><path d=\"M15 13v2\" /><path d=\"M9 13v2\" />","bottle-wine":"<path d=\"M10 3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a6 6 0 0 0 1.2 3.6l.6.8A6 6 0 0 1 17 13v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-8a6 6 0 0 1 1.2-3.6l.6-.8A6 6 0 0 0 10 5z\" /><path d=\"M17 13h-4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h4\" />","bow-arrow":"<path d=\"M17 3h4v4\" /><path d=\"M18.575 11.082a13 13 0 0 1 1.048 9.027 1.17 1.17 0 0 1-1.914.597L14 17\" /><path d=\"M7 10 3.29 6.29a1.17 1.17 0 0 1 .6-1.91 13 13 0 0 1 9.03 1.05\" /><path d=\"M7 14a1.7 1.7 0 0 0-1.207.5l-2.646 2.646A.5.5 0 0 0 3.5 18H5a1 1 0 0 1 1 1v1.5a.5.5 0 0 0 .854.354L9.5 18.207A1.7 1.7 0 0 0 10 17v-2a1 1 0 0 0-1-1z\" /><path d=\"M9.707 14.293 21 3\" />","box-select":"<path d=\"M5 3a2 2 0 0 0-2 2\" /><path d=\"M19 3a2 2 0 0 1 2 2\" /><path d=\"M21 19a2 2 0 0 1-2 2\" /><path d=\"M5 21a2 2 0 0 1-2-2\" /><path d=\"M9 3h1\" /><path d=\"M9 21h1\" /><path d=\"M14 3h1\" /><path d=\"M14 21h1\" /><path d=\"M3 9v1\" /><path d=\"M21 9v1\" /><path d=\"M3 14v1\" /><path d=\"M21 14v1\" />","box":"<path d=\"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z\" /><path d=\"m3.3 7 8.7 5 8.7-5\" /><path d=\"M12 22V12\" />","boxes":"<path d=\"M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z\" /><path d=\"m7 16.5-4.74-2.85\" /><path d=\"m7 16.5 5-3\" /><path d=\"M7 16.5v5.17\" /><path d=\"M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z\" /><path d=\"m17 16.5-5-3\" /><path d=\"m17 16.5 4.74-2.85\" /><path d=\"M17 16.5v5.17\" /><path d=\"M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z\" /><path d=\"M12 8 7.26 5.15\" /><path d=\"m12 8 4.74-2.85\" /><path d=\"M12 13.5V8\" />","braces":"<path d=\"M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1\" /><path d=\"M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1\" />","brackets":"<path d=\"M16 3h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-3\" /><path d=\"M8 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3\" />","brain-circuit":"<path d=\"M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z\" /><path d=\"M9 13a4.5 4.5 0 0 0 3-4\" /><path d=\"M6.003 5.125A3 3 0 0 0 6.401 6.5\" /><path d=\"M3.477 10.896a4 4 0 0 1 .585-.396\" /><path d=\"M6 18a4 4 0 0 1-1.967-.516\" /><path d=\"M12 13h4\" /><path d=\"M12 18h6a2 2 0 0 1 2 2v1\" /><path d=\"M12 8h8\" /><path d=\"M16 8V5a2 2 0 0 1 2-2\" /><circle cx=\"16\" cy=\"13\" r=\".5\" /><circle cx=\"18\" cy=\"3\" r=\".5\" /><circle cx=\"20\" cy=\"21\" r=\".5\" /><circle cx=\"20\" cy=\"8\" r=\".5\" />","brain-cog":"<path d=\"m10.852 14.772-.383.923\" /><path d=\"m10.852 9.228-.383-.923\" /><path d=\"m13.148 14.772.382.924\" /><path d=\"m13.531 8.305-.383.923\" /><path d=\"m14.772 10.852.923-.383\" /><path d=\"m14.772 13.148.923.383\" /><path d=\"M17.598 6.5A3 3 0 1 0 12 5a3 3 0 0 0-5.63-1.446 3 3 0 0 0-.368 1.571 4 4 0 0 0-2.525 5.771\" /><path d=\"M17.998 5.125a4 4 0 0 1 2.525 5.771\" /><path d=\"M19.505 10.294a4 4 0 0 1-1.5 7.706\" /><path d=\"M4.032 17.483A4 4 0 0 0 11.464 20c.18-.311.892-.311 1.072 0a4 4 0 0 0 7.432-2.516\" /><path d=\"M4.5 10.291A4 4 0 0 0 6 18\" /><path d=\"M6.002 5.125a3 3 0 0 0 .4 1.375\" /><path d=\"m9.228 10.852-.923-.383\" /><path d=\"m9.228 13.148-.923.383\" /><circle cx=\"12\" cy=\"12\" r=\"3\" />","brain":"<path d=\"M12 18V5\" /><path d=\"M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4\" /><path d=\"M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5\" /><path d=\"M17.997 5.125a4 4 0 0 1 2.526 5.77\" /><path d=\"M18 18a4 4 0 0 0 2-7.464\" /><path d=\"M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517\" /><path d=\"M6 18a4 4 0 0 1-2-7.464\" /><path d=\"M6.003 5.125a4 4 0 0 0-2.526 5.77\" />","brick-wall-fire":"<path d=\"M16 3v2.107\" /><path d=\"M17 9c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 22 17a5 5 0 0 1-10 0c0-.3 0-.6.1-.9a2 2 0 1 0 3.3-2C13 11.5 16 9 17 9\" /><path d=\"M21 8.274V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.938\" /><path d=\"M3 15h5.253\" /><path d=\"M3 9h8.228\" /><path d=\"M8 15v6\" /><path d=\"M8 3v6\" />","brick-wall-shield":"<path d=\"M12 9v1.258\" /><path d=\"M16 3v5.46\" /><path d=\"M21 9.118V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5.75\" /><path d=\"M22 17.5c0 2.499-1.75 3.749-3.83 4.474a.5.5 0 0 1-.335-.005c-2.085-.72-3.835-1.97-3.835-4.47V14a.5.5 0 0 1 .5-.499c1 0 2.25-.6 3.12-1.36a.6.6 0 0 1 .76-.001c.875.765 2.12 1.36 3.12 1.36a.5.5 0 0 1 .5.5z\" /><path d=\"M3 15h7\" /><path d=\"M3 9h12.142\" /><path d=\"M8 15v6\" /><path d=\"M8 3v6\" />","brick-wall":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M12 9v6\" /><path d=\"M16 15v6\" /><path d=\"M16 3v6\" /><path d=\"M3 15h18\" /><path d=\"M3 9h18\" /><path d=\"M8 15v6\" /><path d=\"M8 3v6\" />","bridge":"<path d=\"M10 9.728V16\" /><path d=\"M14 9.728V16\" /><path d=\"M18 20V4\" /><path d=\"m22 11-4-4A7.5 7.5 0 0 1 6 7l-4 4\" /><path d=\"M22 16H2\" /><path d=\"M6 20V4\" />","briefcase-business":"<path d=\"M12 12h.01\" /><path d=\"M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2\" /><path d=\"M22 13a18.15 18.15 0 0 1-20 0\" /><rect width=\"20\" height=\"14\" x=\"2\" y=\"6\" rx=\"2\" />","briefcase-conveyor-belt":"<path d=\"M10 20v2\" /><path d=\"M14 20v2\" /><path d=\"M18 20v2\" /><path d=\"M21 20H3\" /><path d=\"M6 20v2\" /><path d=\"M8 16V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12\" /><rect x=\"4\" y=\"6\" width=\"16\" height=\"10\" rx=\"2\" />","briefcase-medical":"<path d=\"M12 11v4\" /><path d=\"M14 13h-4\" /><path d=\"M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2\" /><path d=\"M18 6v14\" /><path d=\"M6 6v14\" /><rect width=\"20\" height=\"14\" x=\"2\" y=\"6\" rx=\"2\" />","briefcase-plus":"<path d=\"M13.354 20H4a2 2 0 01-2-2V8a2 2 0 012-2h16a2 2 0 012 2v3.354\" /><path d=\"M16 11.354V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v16\" /><path d=\"M16 17h6\" /><path d=\"M19 14v6\" />","briefcase":"<path d=\"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16\" /><rect width=\"20\" height=\"14\" x=\"2\" y=\"6\" rx=\"2\" />","bring-to-front":"<rect x=\"8\" y=\"8\" width=\"8\" height=\"8\" rx=\"2\" /><path d=\"M4 10a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2\" /><path d=\"M14 20a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2\" />","broccoli":"<path d=\"M10 13a3 3 0 01-2.121-5.121\" /><path d=\"M15.606 14.204c-3.5 1.5-5.899 4.503-8.899 7.503A1 1 0 016 22c-2 0-4-2-4-4a1 1 0 01.293-.707c1.911-1.911 3.823-3.578 5.347-5.441\" /><path d=\"M16.573 14.737A4 4 0 0114 11\" /><path d=\"M7.14 10.907a4 4 0 112.756-7.43A4 4 0 0116.7 4.48a2 2 0 012.82 2.82 4 4 0 011.002 6.805 4 4 0 11-7.51 1.59\" />","broom-sparkles":"<path d=\"M11 2v2\" /><path d=\"M12 3h-2\" /><path d=\"M13.5 10.5 22 2\" /><path d=\"M14.734 13.841a2 2 0 00-.314-2.42L12.58 9.58a2 2 0 00-2.421-.314l-7.657 4.461A1 1 0 002.3 15.3l6.403 6.403a1 1 0 001.571-.204z\" /><path d=\"M20 15v4\" /><path d=\"M22 17h-4\" /><path d=\"M4 4v4\" /><path d=\"m5 18 2-2\" /><path d=\"M6 6H2\" /><path d=\"m7.699 10.7 5.602 5.601\" />","broom":"<path d=\"M13.5 10.5 22 2\" /><path d=\"M14.734 13.841a2 2 0 00-.314-2.42L12.58 9.58a2 2 0 00-2.421-.314l-7.657 4.461A1 1 0 002.3 15.3l6.403 6.403a1 1 0 001.571-.204z\" /><path d=\"m5 18 2-2\" /><path d=\"m7.699 10.7 5.602 5.601\" />","brush-cleaning":"<path d=\"m16 22-1-4\" /><path d=\"M19 14a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2h-3a1 1 0 0 1-1-1V4a2 2 0 0 0-4 0v5a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1\" /><path d=\"M19 14H5l-1.973 6.767A1 1 0 0 0 4 22h16a1 1 0 0 0 .973-1.233z\" /><path d=\"m8 22 1-4\" />","brush":"<path d=\"m11 10 3 3\" /><path d=\"M6.5 21A3.5 3.5 0 1 0 3 17.5a2.62 2.62 0 0 1-.708 1.792A1 1 0 0 0 3 21z\" /><path d=\"M9.969 17.031 21.378 5.624a1 1 0 0 0-3.002-3.002L6.967 14.031\" />","bubbles":"<path d=\"M7.001 15.085A1.5 1.5 0 0 1 9 16.5\" /><circle cx=\"18.5\" cy=\"8.5\" r=\"3.5\" /><circle cx=\"7.5\" cy=\"16.5\" r=\"5.5\" /><circle cx=\"7.5\" cy=\"4.5\" r=\"2.5\" />","bug-off":"<path d=\"M12 20v-8\" /><path d=\"M12.656 7H14a4 4 0 0 1 4 4v1.344\" /><path d=\"M14.12 3.88 16 2\" /><path d=\"M17.123 17.123A6 6 0 0 1 6 14v-3a4 4 0 0 1 1.72-3.287\" /><path d=\"m2 2 20 20\" /><path d=\"M21 5a4 4 0 0 1-3.55 3.97\" /><path d=\"M22 13h-3.344\" /><path d=\"M3 21a4 4 0 0 1 3.81-4\" /><path d=\"M3 5a4 4 0 0 0 3.55 3.97\" /><path d=\"M6 13H2\" /><path d=\"m8 2 1.88 1.88\" /><path d=\"M9.712 4.06A3 3 0 0 1 15 6v1.13\" />","bug-play":"<path d=\"M10 19.655A6 6 0 0 1 6 14v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 3.97\" /><path d=\"M14 15.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997a1 1 0 0 1-1.517-.86z\" /><path d=\"M14.12 3.88 16 2\" /><path d=\"M21 5a4 4 0 0 1-3.55 3.97\" /><path d=\"M3 21a4 4 0 0 1 3.81-4\" /><path d=\"M3 5a4 4 0 0 0 3.55 3.97\" /><path d=\"M6 13H2\" /><path d=\"m8 2 1.88 1.88\" /><path d=\"M9 7.13V6a3 3 0 1 1 6 0v1.13\" />","bug":"<path d=\"M12 20v-9\" /><path d=\"M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z\" /><path d=\"M14.12 3.88 16 2\" /><path d=\"M21 21a4 4 0 0 0-3.81-4\" /><path d=\"M21 5a4 4 0 0 1-3.55 3.97\" /><path d=\"M22 13h-4\" /><path d=\"M3 21a4 4 0 0 1 3.81-4\" /><path d=\"M3 5a4 4 0 0 0 3.55 3.97\" /><path d=\"M6 13H2\" /><path d=\"m8 2 1.88 1.88\" /><path d=\"M9 7.13V6a3 3 0 1 1 6 0v1.13\" />","building-2":"<path d=\"M10 12h4\" /><path d=\"M10 8h4\" /><path d=\"M14 21v-3a2 2 0 0 0-4 0v3\" /><path d=\"M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2\" /><path d=\"M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16\" />","building-complex-plus":"<path d=\"M10 12h4\" /><path d=\"M10 21v-3a2 2 0 013.05-1.702\" /><path d=\"M10 8h4\" /><path d=\"M16 19h6\" /><path d=\"M18 7h2a2 2 0 012 2v4.355\" /><path d=\"M19 16v6\" /><path d=\"M6 10H4a2 2 0 00-2 2v7a2 2 0 002 2h8.535\" /><path d=\"M6 21V5a2 2 0 012-2h8a2 2 0 012 2v7.126\" />","building-complex":"<path d=\"M10 12h4\" /><path d=\"M10 8h4\" /><path d=\"M14 21v-3a2 2 0 0 0-4 0v3\" /><path d=\"M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2\" /><path d=\"M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16\" />","building":"<path d=\"M12 10h.01\" /><path d=\"M12 14h.01\" /><path d=\"M12 6h.01\" /><path d=\"M16 10h.01\" /><path d=\"M16 14h.01\" /><path d=\"M16 6h.01\" /><path d=\"M8 10h.01\" /><path d=\"M8 14h.01\" /><path d=\"M8 6h.01\" /><path d=\"M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3\" /><rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\" />","bus-front":"<path d=\"M4 6 2 7\" /><path d=\"M10 6h4\" /><path d=\"m22 7-2-1\" /><rect width=\"16\" height=\"16\" x=\"4\" y=\"3\" rx=\"2\" /><path d=\"M4 11h16\" /><path d=\"M8 15h.01\" /><path d=\"M16 15h.01\" /><path d=\"M6 19v2\" /><path d=\"M18 21v-2\" />","bus":"<path d=\"M8 6v6\" /><path d=\"M15 6v6\" /><path d=\"M2 12h19.6\" /><path d=\"M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3\" /><circle cx=\"7\" cy=\"18\" r=\"2\" /><path d=\"M9 18h5\" /><circle cx=\"16\" cy=\"18\" r=\"2\" />","cable-car":"<path d=\"M10 3h.01\" /><path d=\"M14 2h.01\" /><path d=\"m2 9 20-5\" /><path d=\"M12 12V6.5\" /><rect width=\"16\" height=\"10\" x=\"4\" y=\"12\" rx=\"3\" /><path d=\"M9 12v5\" /><path d=\"M15 12v5\" /><path d=\"M4 17h16\" />","cable":"<path d=\"M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z\" /><path d=\"M17 21v-2\" /><path d=\"M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10\" /><path d=\"M21 21v-2\" /><path d=\"M3 5V3\" /><path d=\"M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z\" /><path d=\"M7 5V3\" />","cake-slice":"<path d=\"M16 13H3\" /><path d=\"M16 17H3\" /><path d=\"m7.2 7.9-3.388 2.5A2 2 0 0 0 3 12.01V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8.654c0-2-2.44-6.026-6.44-8.026a1 1 0 0 0-1.082.057L10.4 5.6\" /><circle cx=\"9\" cy=\"7\" r=\"2\" />","cake":"<path d=\"M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8\" /><path d=\"M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1\" /><path d=\"M2 21h20\" /><path d=\"M7 8v3\" /><path d=\"M12 8v3\" /><path d=\"M17 8v3\" /><path d=\"M7 4h.01\" /><path d=\"M12 4h.01\" /><path d=\"M17 4h.01\" />","calculator":"<rect width=\"16\" height=\"20\" x=\"4\" y=\"2\" rx=\"2\" /><line x1=\"8\" x2=\"16\" y1=\"6\" y2=\"6\" /><line x1=\"16\" x2=\"16\" y1=\"14\" y2=\"18\" /><path d=\"M16 10h.01\" /><path d=\"M12 10h.01\" /><path d=\"M8 10h.01\" /><path d=\"M12 14h.01\" /><path d=\"M8 14h.01\" /><path d=\"M12 18h.01\" /><path d=\"M8 18h.01\" />","calendar-1":"<path d=\"M11 13h1v4\" /><path d=\"M16 2v3\" /><path d=\"M3 9h18\" /><path d=\"M8 2v3\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","calendar-arrow-down":"<path d=\"m14 17 4 4 4-4\" /><path d=\"M16 2v3\" /><path d=\"M18 13v8\" /><path d=\"M21 10.354V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h7.343\" /><path d=\"M3 9h18\" /><path d=\"M8 2v3\" />","calendar-arrow-up":"<path d=\"m14 17 4-4 4 4\" /><path d=\"M16 2v3\" /><path d=\"M18 21v-8\" /><path d=\"M21 10.343V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h9\" /><path d=\"M3 9h18\" /><path d=\"M8 2v3\" />","calendar-check-2":"<path d=\"M 19 3 L 5 3\" /><path d=\"M 21 13 L 21 5\" /><path d=\"M 21 5 A2 2 0 0 0 19 3\" /><path d=\"M 3 19 A2 2 0 0 0 5 21\" /><path d=\"M 3 5 L 3 19\" /><path d=\"M 5 3 A2 2 0 0 0 3 5\" /><path d=\"m16 19 2 2 4-4\" /><path d=\"M16 2v3\" /><path d=\"M3 9h18\" /><path d=\"M5 21 L12.5 21\" /><path d=\"M8 2v3\" />","calendar-check":"<path d=\"M8 2v3\" /><path d=\"M16 2v3\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" /><path d=\"M3 9h18\" /><path d=\"m9 15 2 2 4-4\" />","calendar-chevrons-right":"<path d=\"m13 21 3-3-3-3\" /><path d=\"M16 2v3\" /><path d=\"m19 21 3-3-3-3\" /><path d=\"M21 11.5V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h4\" /><path d=\"M3 9h18\" /><path d=\"M8 2v3\" />","calendar-clock":"<path d=\"M16 14v2.2l1.6 1\" /><path d=\"M16 2v3\" /><path d=\"M21 7.338V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2.338\" /><path d=\"M3 9h5.859\" /><path d=\"M8 2v3\" /><circle cx=\"16\" cy=\"16\" r=\"6\" />","calendar-cog":"<path d=\"m15.228 16.852-.923-.383\" /><path d=\"m15.228 19.148-.923.383\" /><path d=\"M16 2v3\" /><path d=\"m16.47 14.305.382.923\" /><path d=\"m16.852 20.772-.383.924\" /><path d=\"m19.148 15.228.383-.923\" /><path d=\"m19.53 21.696-.382-.924\" /><path d=\"m20.773 16.852.924-.383\" /><path d=\"m20.773 19.148.924.383\" /><path d=\"M21 10.5V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h5.5\" /><path d=\"M3 9h18\" /><path d=\"M8 2v3\" /><circle cx=\"18\" cy=\"18\" r=\"3\" />","calendar-days":"<path d=\"M8 2v3\" /><path d=\"M16 2v3\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" /><path d=\"M3 9h18\" /><path d=\"M8 13h.01\" /><path d=\"M12 13h.01\" /><path d=\"M16 13h.01\" /><path d=\"M8 17h.01\" /><path d=\"M12 17h.01\" /><path d=\"M16 17h.01\" />","calendar-fold":"<path d=\"M16 2v3\" /><path d=\"M21 15V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h10v-5a1 1 0 011-1za2.4 2.4 0 01-.706 1.706l-3.588 3.588A2.4 2.4 0 0115 21\" /><path d=\"M3 9h18\" /><path d=\"M8 2v3\" />","calendar-heart":"<path d=\"M12.127 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v5.125\" /><path d=\"M14.62 17.8A2.25 2.25 0 1118 14.836a2.25 2.25 0 113.38 2.966l-2.626 2.856a.998.998 0 01-1.507 0z\" /><path d=\"M16 2v3\" /><path d=\"M3 9h18\" /><path d=\"M8 2v3\" />","calendar-minus-2":"<path d=\"M8 2v3\" /><path d=\"M16 2v3\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" /><path d=\"M3 9h18\" /><path d=\"M10 15h4\" />","calendar-minus":"<path d=\"M16 18h6\" /><path d=\"M16 2v3\" /><path d=\"M21 14V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h8.3\" /><path d=\"M3 9h18\" /><path d=\"M8 2v3\" />","calendar-off":"<path d=\"M16 2v3\" /><path d=\"m2 2 20 20\" /><path d=\"M21 9h-5.5\" /><path d=\"M3 9h6\" /><path d=\"M3.586 3.586A2 2 0 003 5v14a2 2 0 002 2h14a2 2 0 001.414-.586\" /><path d=\"M8.656 3H19a2 2 0 012 2v10.344\" />","calendar-plus-2":"<path d=\"M8 2v3\" /><path d=\"M16 2v3\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" /><path d=\"M3 9h18\" /><path d=\"M10 15h4\" /><path d=\"M12 13v4\" />","calendar-plus":"<path d=\"M16 18h6\" /><path d=\"M16 2v3\" /><path d=\"M19 15v6\" /><path d=\"M21 11.5V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h8.3\" /><path d=\"M3 9h18\" /><path d=\"M8 2v3\" />","calendar-range":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" /><path d=\"M16 2v3\" /><path d=\"M3 9h18\" /><path d=\"M8 2v3\" /><path d=\"M17 13h-6\" /><path d=\"M13 17H7\" /><path d=\"M7 13h.01\" /><path d=\"M17 17h.01\" />","calendar-search":"<path d=\"M16 2v3\" /><path d=\"M21 10.69V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h7.25\" /><path d=\"m22 21-1.875-1.875\" /><path d=\"M3 9h18\" /><path d=\"M8 2v3\" /><circle cx=\"18\" cy=\"17\" r=\"3\" />","calendar-sync":"<path d=\"M11 10v4h4\" /><path d=\"m11 14 1.535-1.605a5 5 0 018 1.5\" /><path d=\"M16 2v3\" /><path d=\"m21 18-1.535 1.605a5 5 0 01-8-1.5\" /><path d=\"M21 22v-4h-4\" /><path d=\"M21 8.517V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h3.517\" /><path d=\"M3 9h4\" /><path d=\"M8 2v3\" />","calendar-x-2":"<path d=\"M16 2v3\" /><path d=\"m17 16 5 5\" /><path d=\"m17 21 5-5\" /><path d=\"M21 12V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h8\" /><path d=\"M3 9h18\" /><path d=\"M8 2v3\" />","calendar-x":"<path d=\"M8 2v3\" /><path d=\"M16 2v3\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" /><path d=\"M3 9h18\" /><path d=\"m14 13-4 4\" /><path d=\"m10 13 4 4\" />","calendar":"<path d=\"M8 2v3\" /><path d=\"M16 2v3\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" /><path d=\"M3 9h18\" />","calendars":"<path d=\"M12 2v2\" /><path d=\"M15.726 21.01A2 2 0 0 1 14 22H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2\" /><path d=\"M18 2v2\" /><path d=\"M2 13h2\" /><path d=\"M8 8h14\" /><rect x=\"8\" y=\"3\" width=\"14\" height=\"14\" rx=\"2\" />","camera-off":"<path d=\"M14.564 14.558a3 3 0 1 1-4.122-4.121\" /><path d=\"m2 2 20 20\" /><path d=\"M20 20H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 .819-.175\" /><path d=\"M9.695 4.024A2 2 0 0 1 10.004 4h3.993a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v7.344\" />","camera":"<path d=\"M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z\" /><circle cx=\"12\" cy=\"13\" r=\"3\" />","can-soda":"<path d=\"m17 22 1.664-2.496a2 2 0 00.336-1.11V5.606a2 2 0 00-.336-1.11L17 2\" /><path d=\"M18 22H6\" /><path d=\"M18 2H6\" /><path d=\"M5 17h14\" /><path d=\"M5 7h14\" /><path d=\"m7 22-1.664-2.496A2 2 0 015 18.394V5.606a2 2 0 01.336-1.11L7 2\" />","can":"<path d=\"M21 10.5a9 2.5 0 01-18 0v8a9 2.5 0 0018 0z\" /><path d=\"M21 10.5A9 2.5 25.32 004.59 3.47 9 2.5 25.32 0021 10.5\" /><path d=\"M3 10.5a9 2.5 0 016.527-2.405\" /><path d=\"M9 16.858a31 31 0 006 0\" />","candlestick-chart":"<path d=\"M9 5v4\" /><rect width=\"4\" height=\"6\" x=\"7\" y=\"9\" rx=\"1\" /><path d=\"M9 15v2\" /><path d=\"M17 3v2\" /><rect width=\"4\" height=\"8\" x=\"15\" y=\"5\" rx=\"1\" /><path d=\"M17 13v3\" /><path d=\"M3 3v16a2 2 0 0 0 2 2h16\" />","candy-cane":"<path d=\"m10.8 5 2.111 4.223\" /><path d=\"M17.75 7 15 2.1\" /><path d=\"m4.874 14.647 2.12 4.24\" /><path d=\"M5.7 21a2 2 0 0 1-3.5-2l8.6-14a6 6 0 0 1 10.4 6 2 2 0 1 1-3.464-2 2 2 0 1 0-3.464-2z\" /><path d=\"m7.906 9.712 2.005 4.411\" />","candy-off":"<path d=\"M10 10v7.9\" /><path d=\"M11.802 6.145a5 5 0 0 1 6.053 6.053\" /><path d=\"M14 6.1v2.243\" /><path d=\"m15.5 15.571-.964.964a5 5 0 0 1-7.071 0 5 5 0 0 1 0-7.07l.964-.965\" /><path d=\"M16 7V3a1 1 0 0 1 1.707-.707 2.5 2.5 0 0 0 2.152.717 1 1 0 0 1 1.131 1.131 2.5 2.5 0 0 0 .717 2.152A1 1 0 0 1 21 8h-4\" /><path d=\"m2 2 20 20\" /><path d=\"M8 17v4a1 1 0 0 1-1.707.707 2.5 2.5 0 0 0-2.152-.717 1 1 0 0 1-1.131-1.131 2.5 2.5 0 0 0-.717-2.152A1 1 0 0 1 3 16h4\" />","candy":"<path d=\"M10 7v10.9\" /><path d=\"M14 6.1V17\" /><path d=\"M16 7V3a1 1 0 0 1 1.707-.707 2.5 2.5 0 0 0 2.152.717 1 1 0 0 1 1.131 1.131 2.5 2.5 0 0 0 .717 2.152A1 1 0 0 1 21 8h-4\" /><path d=\"M16.536 7.465a5 5 0 0 0-7.072 0l-2 2a5 5 0 0 0 0 7.07 5 5 0 0 0 7.072 0l2-2a5 5 0 0 0 0-7.07\" /><path d=\"M8 17v4a1 1 0 0 1-1.707.707 2.5 2.5 0 0 0-2.152-.717 1 1 0 0 1-1.131-1.131 2.5 2.5 0 0 0-.717-2.152A1 1 0 0 1 3 16h4\" />","cannabis-off":"<path d=\"M12 22v-4c1.5 1.5 3.5 3 6 3 0-1.5-.5-3.5-2-5\" /><path d=\"M13.988 8.327C13.902 6.054 13.365 3.82 12 2a9.3 9.3 0 0 0-1.445 2.9\" /><path d=\"M17.375 11.725C18.882 10.53 21 7.841 21 6c-2.324 0-5.08 1.296-6.662 2.684\" /><path d=\"m2 2 20 20\" /><path d=\"M21.024 15.378A15 15 0 0 0 22 15c-.426-1.279-2.67-2.557-4.25-2.907\" /><path d=\"M6.995 6.992C5.714 6.4 4.29 6 3 6c0 2 2.5 5 4 6-1.5 0-4.5 1.5-5 3 3.5 1.5 6 1 6 1-1.5 1.5-2 3.5-2 5 2.5 0 4.5-1.5 6-3\" />","cannabis":"<path d=\"M12 22v-4\" /><path d=\"M7 12c-1.5 0-4.5 1.5-5 3 3.5 1.5 6 1 6 1-1.5 1.5-2 3.5-2 5 2.5 0 4.5-1.5 6-3 1.5 1.5 3.5 3 6 3 0-1.5-.5-3.5-2-5 0 0 2.5.5 6-1-.5-1.5-3.5-3-5-3 1.5-1 4-4 4-6-2.5 0-5.5 1.5-7 3 0-2.5-.5-5-2-7-1.5 2-2 4.5-2 7-1.5-1.5-4.5-3-7-3 0 2 2.5 5 4 6\" />","captions-off":"<path d=\"M10.5 5H19a2 2 0 0 1 2 2v8.5\" /><path d=\"M17 11h-.5\" /><path d=\"M19 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2\" /><path d=\"m2 2 20 20\" /><path d=\"M7 11h4\" /><path d=\"M7 15h2.5\" />","captions":"<rect width=\"18\" height=\"14\" x=\"3\" y=\"5\" rx=\"2\" ry=\"2\" /><path d=\"M7 15h4M15 15h2M7 11h2M13 11h4\" />","car-battery":"<path d=\"M14 13h4\" /><path d=\"M16 15v-4\" /><path d=\"M18 5v2\" /><path d=\"M6 13h4\" /><path d=\"M6 5v2\" /><rect x=\"2\" y=\"7\" width=\"20\" height=\"12\" rx=\"2\" />","car-front":"<path d=\"m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8\" /><path d=\"M7 14h.01\" /><path d=\"M17 14h.01\" /><rect width=\"18\" height=\"8\" x=\"3\" y=\"10\" rx=\"2\" /><path d=\"M5 18v2\" /><path d=\"M19 18v2\" />","car-taxi-front":"<path d=\"M10 2h4\" /><path d=\"m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8\" /><path d=\"M7 14h.01\" /><path d=\"M17 14h.01\" /><rect width=\"18\" height=\"8\" x=\"3\" y=\"10\" rx=\"2\" /><path d=\"M5 18v2\" /><path d=\"M19 18v2\" />","car":"<path d=\"M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2\" /><circle cx=\"7\" cy=\"17\" r=\"2\" /><path d=\"M9 17h6\" /><circle cx=\"17\" cy=\"17\" r=\"2\" />","caravan":"<path d=\"M18 19V9a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v8a2 2 0 0 0 2 2h2\" /><path d=\"M2 9h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2\" /><path d=\"M22 17v1a1 1 0 0 1-1 1H10v-9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9\" /><circle cx=\"8\" cy=\"19\" r=\"2\" />","card-sim":"<path d=\"M12 14v4\" /><path d=\"M14.172 2a2 2 0 0 1 1.414.586l3.828 3.828A2 2 0 0 1 20 7.828V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z\" /><path d=\"M8 14h8\" /><rect x=\"8\" y=\"10\" width=\"8\" height=\"8\" rx=\"2\" />","carrot":"<path d=\"M15 16a1 1 0 0 0-7-7q-4 4-5.987 12.385a.5.5 0 0 0 .602.602Q11 20 15 16l-3-3\" /><path d=\"M15 9q4 4 7 0-3-4-7 0 4-4 0-7-4 3 0 7\" /><path d=\"m8 15-2.58-2.58\" />","carton-off":"<path d=\"M10 10H5v10a2 2 0 002 2h10a2 2 0 002-2v-1\" /><path d=\"M13 22v-9\" /><path d=\"M13.902 8.245 16 6h-4.343\" /><path d=\"M19 13.343V10a2 2 0 00-.539-1.367L16 6V3a1 1 0 00-1-1H9a1 1 0 00-.857.486\" /><path d=\"m2 2 20 20\" /><path d=\"M7.034 7.034 5.539 8.633A2 2 0 005 10\" />","carton":"<path d=\"M13 22V10a2 2 0 01.539-1.367L16 6H8L5.539 8.633A2 2 0 005 10v10a2 2 0 002 2h10a2 2 0 002-2V10a2 2 0 00-.539-1.367L16 6V3a1 1 0 00-1-1H9a1 1 0 00-1 1v3\" /><path d=\"M5 10h8\" />","case-lower":"<path d=\"M10 9v7\" /><path d=\"M14 6v10\" /><circle cx=\"17.5\" cy=\"12.5\" r=\"3.5\" /><circle cx=\"6.5\" cy=\"12.5\" r=\"3.5\" />","case-sensitive":"<path d=\"m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16\" /><path d=\"M22 9v7\" /><path d=\"M3.304 13h6.392\" /><circle cx=\"18.5\" cy=\"12.5\" r=\"3.5\" />","case-upper":"<path d=\"M15 11h4.5a1 1 0 0 1 0 5h-4a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h3a1 1 0 0 1 0 5\" /><path d=\"m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16\" /><path d=\"M3.304 13h6.392\" />","cassette-tape":"<rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\" /><circle cx=\"8\" cy=\"10\" r=\"2\" /><path d=\"M8 12h8\" /><circle cx=\"16\" cy=\"10\" r=\"2\" /><path d=\"m6 20 .7-2.9A1.4 1.4 0 0 1 8.1 16h7.8a1.4 1.4 0 0 1 1.4 1l.7 3\" />","cast":"<path d=\"M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6\" /><path d=\"M2 12a9 9 0 0 1 8 8\" /><path d=\"M2 16a5 5 0 0 1 4 4\" /><line x1=\"2\" x2=\"2.01\" y1=\"20\" y2=\"20\" />","castle":"<path d=\"M10 5V3\" /><path d=\"M14 5V3\" /><path d=\"M15 21v-3a3 3 0 0 0-6 0v3\" /><path d=\"M18 3v8\" /><path d=\"M18 5H6\" /><path d=\"M22 11H2\" /><path d=\"M22 9v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9\" /><path d=\"M6 3v8\" />","cat":"<path d=\"M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z\" /><path d=\"M8 14v.5\" /><path d=\"M16 14v.5\" /><path d=\"M11.25 16.25h1.5L12 17l-.75-.75Z\" />","cctv-off":"<path d=\"m12.309 6.652 4.797 2.401a1 1 0 0 1 .447 1.341l-.501 1.001.605.605h2.725a1 1 0 0 1 .894 1.447l-.724 1.448\" /><path d=\"m15.166 15.166-.719 1.439a1 1 0 0 1-1.342.447L3.61 12.3a2.92 2.92 0 0 1-1.3-3.91L3.69 5.6a2.9 2.9 0 0 1 .873-1.037\" /><path d=\"M2 19h3.76a2 2 0 0 0 1.8-1.1l1.441-2.902\" /><path d=\"m2 2 20 20\" /><path d=\"M2 21v-4\" /><path d=\"M7 9h.01\" />","cctv":"<path d=\"M16.75 12h3.632a1 1 0 0 1 .894 1.447l-2.034 4.069a1 1 0 0 1-1.708.134l-2.124-2.97\" /><path d=\"M17.106 9.053a1 1 0 0 1 .447 1.341l-3.106 6.211a1 1 0 0 1-1.342.447L3.61 12.3a2.92 2.92 0 0 1-1.3-3.91L3.69 5.6a2.92 2.92 0 0 1 3.92-1.3z\" /><path d=\"M2 19h3.76a2 2 0 0 0 1.8-1.1L9 15\" /><path d=\"M2 21v-4\" /><path d=\"M7 9h.01\" />","chart-area":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"M7 11.207a.5.5 0 0 1 .146-.353l2-2a.5.5 0 0 1 .708 0l3.292 3.292a.5.5 0 0 0 .708 0l4.292-4.292a.5.5 0 0 1 .854.353V16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z\" />","chart-bar-big":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><rect x=\"7\" y=\"13\" width=\"9\" height=\"4\" rx=\"1\" /><rect x=\"7\" y=\"5\" width=\"12\" height=\"4\" rx=\"1\" />","chart-bar-decreasing":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"M7 11h8\" /><path d=\"M7 16h3\" /><path d=\"M7 6h12\" />","chart-bar-increasing":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"M7 11h8\" /><path d=\"M7 16h12\" /><path d=\"M7 6h3\" />","chart-bar-stacked":"<path d=\"M11 13v4\" /><path d=\"M15 5v4\" /><path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><rect x=\"7\" y=\"13\" width=\"9\" height=\"4\" rx=\"1\" /><rect x=\"7\" y=\"5\" width=\"12\" height=\"4\" rx=\"1\" />","chart-bar":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"M7 16h8\" /><path d=\"M7 11h12\" /><path d=\"M7 6h3\" />","chart-candlestick":"<path d=\"M9 5v4\" /><rect width=\"4\" height=\"6\" x=\"7\" y=\"9\" rx=\"1\" /><path d=\"M9 15v2\" /><path d=\"M17 3v2\" /><rect width=\"4\" height=\"8\" x=\"15\" y=\"5\" rx=\"1\" /><path d=\"M17 13v3\" /><path d=\"M3 3v16a2 2 0 0 0 2 2h16\" />","chart-column-big":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><rect x=\"15\" y=\"5\" width=\"4\" height=\"12\" rx=\"1\" /><rect x=\"7\" y=\"8\" width=\"4\" height=\"9\" rx=\"1\" />","chart-column-decreasing":"<path d=\"M13 17V9\" /><path d=\"M18 17v-3\" /><path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"M8 17V5\" />","chart-column-increasing":"<path d=\"M13 17V9\" /><path d=\"M18 17V5\" /><path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"M8 17v-3\" />","chart-column-stacked":"<path d=\"M11 13H7\" /><path d=\"M19 9h-4\" /><path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><rect x=\"15\" y=\"5\" width=\"4\" height=\"12\" rx=\"1\" /><rect x=\"7\" y=\"8\" width=\"4\" height=\"9\" rx=\"1\" />","chart-column":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"M18 17V9\" /><path d=\"M13 17V5\" /><path d=\"M8 17v-3\" />","chart-gantt":"<path d=\"M10 6h8\" /><path d=\"M12 16h6\" /><path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"M8 11h7\" />","chart-line":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"m19 9-5 5-4-4-3 3\" />","chart-network":"<path d=\"m13.11 7.664 1.78 2.672\" /><path d=\"m14.162 12.788-3.324 1.424\" /><path d=\"m20 4-6.06 1.515\" /><path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><circle cx=\"12\" cy=\"6\" r=\"2\" /><circle cx=\"16\" cy=\"12\" r=\"2\" /><circle cx=\"9\" cy=\"15\" r=\"2\" />","chart-no-axes-column-decreasing":"<path d=\"M5 21V3\" /><path d=\"M12 21V9\" /><path d=\"M19 21v-6\" />","chart-no-axes-column-increasing":"<path d=\"M5 21v-6\" /><path d=\"M12 21V9\" /><path d=\"M19 21V3\" />","chart-no-axes-column":"<path d=\"M5 21v-6\" /><path d=\"M12 21V3\" /><path d=\"M19 21V9\" />","chart-no-axes-combined":"<path d=\"M12 16v5\" /><path d=\"M16 14.639V21\" /><path d=\"M20 10.656V21\" /><path d=\"m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15\" /><path d=\"M4 18.463V21\" /><path d=\"M8 14.656V21\" />","chart-no-axes-gantt":"<path d=\"M6 5h12\" /><path d=\"M4 12h10\" /><path d=\"M12 19h8\" />","chart-pie":"<path d=\"M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z\" /><path d=\"M21.21 15.89A10 10 0 1 1 8 2.83\" />","chart-scatter":"<circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\" /><circle cx=\"18.5\" cy=\"5.5\" r=\".5\" fill=\"currentColor\" /><circle cx=\"11.5\" cy=\"11.5\" r=\".5\" fill=\"currentColor\" /><circle cx=\"7.5\" cy=\"16.5\" r=\".5\" fill=\"currentColor\" /><circle cx=\"17.5\" cy=\"14.5\" r=\".5\" fill=\"currentColor\" /><path d=\"M3 3v16a2 2 0 0 0 2 2h16\" />","chart-spline":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"M7 16c.5-2 1.5-7 4-7 2 0 2 3 4 3 2.5 0 4.5-5 5-7\" />","check-check":"<path d=\"M18 6 7 17l-5-5\" /><path d=\"m22 10-7.5 7.5L13 16\" />","check-circle-2":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m16 9-5.5 5.5L8 12\" />","check-circle":"<path d=\"M21.801 10A10 10 0 1 1 17 3.335\" /><path d=\"m9 11 3 3L22 4\" />","check-line":"<path d=\"M20 4L9 15\" /><path d=\"M21 19L3 19\" /><path d=\"M9 15L4 10\" />","check-square-2":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"m16 9-5.5 5.5L8 12\" />","check-square":"<path d=\"M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344\" /><path d=\"m9 11 3 3L22 4\" />","check":"<path d=\"M20 6 9 17l-5-5\" />","chef-hat":"<path d=\"M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z\" /><path d=\"M6 17h12\" />","cherry":"<path d=\"M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z\" /><path d=\"M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z\" /><path d=\"M7 14c3.22-2.91 4.29-8.75 5-12 1.66 2.38 4.94 9 5 12\" /><path d=\"M22 9c-4.29 0-7.14-2.33-10-7 5.71 0 10 4.67 10 7Z\" />","chess-bishop":"<path d=\"M5 20a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z\" /><path d=\"M15 18c1.5-.615 3-2.461 3-4.923C18 8.769 14.5 4.462 12 2 9.5 4.462 6 8.77 6 13.077 6 15.539 7.5 17.385 9 18\" /><path d=\"m16 7-2.5 2.5\" /><path d=\"M9 2h6\" />","chess-king":"<path d=\"M4 20a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z\" /><path d=\"m6.7 18-1-1C4.35 15.682 3 14.09 3 12a5 5 0 0 1 4.95-5c1.584 0 2.7.455 4.05 1.818C13.35 7.455 14.466 7 16.05 7A5 5 0 0 1 21 12c0 2.082-1.359 3.673-2.7 5l-1 1\" /><path d=\"M10 4h4\" /><path d=\"M12 2v6.818\" />","chess-knight":"<path d=\"M5 20a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z\" /><path d=\"M16.5 18c1-2 2.5-5 2.5-9a7 7 0 0 0-7-7H6.635a1 1 0 0 0-.768 1.64L7 5l-2.32 5.802a2 2 0 0 0 .95 2.526l2.87 1.456\" /><path d=\"m15 5 1.425-1.425\" /><path d=\"m17 8 1.53-1.53\" /><path d=\"M9.713 12.185 7 18\" />","chess-pawn":"<path d=\"M5 20a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z\" /><path d=\"m14.5 10 1.5 8\" /><path d=\"M7 10h10\" /><path d=\"m8 18 1.5-8\" /><circle cx=\"12\" cy=\"6\" r=\"4\" />","chess-queen":"<path d=\"M4 20a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z\" /><path d=\"m12.474 5.943 1.567 5.34a1 1 0 0 0 1.75.328l2.616-3.402\" /><path d=\"m20 9-3 9\" /><path d=\"m5.594 8.209 2.615 3.403a1 1 0 0 0 1.75-.329l1.567-5.34\" /><path d=\"M7 18 4 9\" /><circle cx=\"12\" cy=\"4\" r=\"2\" /><circle cx=\"20\" cy=\"7\" r=\"2\" /><circle cx=\"4\" cy=\"7\" r=\"2\" />","chess-rook":"<path d=\"M5 20a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z\" /><path d=\"M10 2v2\" /><path d=\"M14 2v2\" /><path d=\"m17 18-1-9\" /><path d=\"M6 2v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2\" /><path d=\"M6 4h12\" /><path d=\"m7 18 1-9\" />","chevron-down-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m16 10-4 4-4-4\" />","chevron-down-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"m16 10-4 4-4-4\" />","chevron-down":"<path d=\"m6 9 6 6 6-6\" />","chevron-first":"<path d=\"m17 18-6-6 6-6\" /><path d=\"M7 6v12\" />","chevron-last":"<path d=\"m7 18 6-6-6-6\" /><path d=\"M17 6v12\" />","chevron-left-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m14 16-4-4 4-4\" />","chevron-left-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"m14 16-4-4 4-4\" />","chevron-left":"<path d=\"m15 18-6-6 6-6\" />","chevron-right-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m10 8 4 4-4 4\" />","chevron-right-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"m10 8 4 4-4 4\" />","chevron-right":"<path d=\"m9 18 6-6-6-6\" />","chevron-up-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m8 14 4-4 4 4\" />","chevron-up-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"m8 14 4-4 4 4\" />","chevron-up":"<path d=\"m18 15-6-6-6 6\" />","chevrons-down-up":"<path d=\"m7 20 5-5 5 5\" /><path d=\"m7 4 5 5 5-5\" />","chevrons-down":"<path d=\"m7 6 5 5 5-5\" /><path d=\"m7 13 5 5 5-5\" />","chevrons-left-right-ellipsis":"<path d=\"M12 12h.01\" /><path d=\"M16 12h.01\" /><path d=\"m17 7 5 5-5 5\" /><path d=\"m7 7-5 5 5 5\" /><path d=\"M8 12h.01\" />","chevrons-left-right":"<path d=\"m9 7-5 5 5 5\" /><path d=\"m15 7 5 5-5 5\" />","chevrons-left":"<path d=\"m11 17-5-5 5-5\" /><path d=\"m18 17-5-5 5-5\" />","chevrons-right-left":"<path d=\"m20 17-5-5 5-5\" /><path d=\"m4 17 5-5-5-5\" />","chevrons-right":"<path d=\"m6 17 5-5-5-5\" /><path d=\"m13 17 5-5-5-5\" />","chevrons-up-down":"<path d=\"m7 15 5 5 5-5\" /><path d=\"m7 9 5-5 5 5\" />","chevrons-up":"<path d=\"m17 11-5-5-5 5\" /><path d=\"m17 18-5-5-5 5\" />","church":"<path d=\"M10 9h4\" /><path d=\"M12 7v5\" /><path d=\"M14 21v-3a2 2 0 0 0-4 0v3\" /><path d=\"m18 9 3.52 2.147a1 1 0 0 1 .48.854V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6.999a1 1 0 0 1 .48-.854L6 9\" /><path d=\"M6 21V7a1 1 0 0 1 .376-.782l5-3.999a1 1 0 0 1 1.249.001l5 4A1 1 0 0 1 18 7v14\" />","cigarette-off":"<path d=\"M12 12H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h13\" /><path d=\"M18 8c0-2.5-2-2.5-2-5\" /><path d=\"m2 2 20 20\" /><path d=\"M21 12a1 1 0 0 1 1 1v2a1 1 0 0 1-.5.866\" /><path d=\"M22 8c0-2.5-2-2.5-2-5\" /><path d=\"M7 12v4\" />","cigarette":"<path d=\"M17 12H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h14\" /><path d=\"M18 8c0-2.5-2-2.5-2-5\" /><path d=\"M21 16a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1\" /><path d=\"M22 8c0-2.5-2-2.5-2-5\" /><path d=\"M7 12v4\" />","circle-alert":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\" /><line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\" />","circle-arrow-down":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 8v8\" /><path d=\"m8 12 4 4 4-4\" />","circle-arrow-left":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m12 8-4 4 4 4\" /><path d=\"M16 12H8\" />","circle-arrow-out-down-left":"<path d=\"M2 12a10 10 0 1 1 10 10\" /><path d=\"m2 22 10-10\" /><path d=\"M8 22H2v-6\" />","circle-arrow-out-down-right":"<path d=\"M12 22a10 10 0 1 1 10-10\" /><path d=\"M22 22 12 12\" /><path d=\"M22 16v6h-6\" />","circle-arrow-out-up-left":"<path d=\"M2 8V2h6\" /><path d=\"m2 2 10 10\" /><path d=\"M12 2A10 10 0 1 1 2 12\" />","circle-arrow-out-up-right":"<path d=\"M22 12A10 10 0 1 1 12 2\" /><path d=\"M22 2 12 12\" /><path d=\"M16 2h6v6\" />","circle-arrow-right":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m12 16 4-4-4-4\" /><path d=\"M8 12h8\" />","circle-arrow-up":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m16 12-4-4-4 4\" /><path d=\"M12 16V8\" />","circle-check-big":"<path d=\"M21.801 10A10 10 0 1 1 17 3.335\" /><path d=\"m9 11 3 3L22 4\" />","circle-check":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m16 9-5.5 5.5L8 12\" />","circle-chevron-down":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m16 10-4 4-4-4\" />","circle-chevron-left":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m14 16-4-4 4-4\" />","circle-chevron-right":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m10 8 4 4-4 4\" />","circle-chevron-up":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m8 14 4-4 4 4\" />","circle-dashed-check":"<path d=\"M10.1 2.182a10 10 0 013.8 0\" /><path d=\"M13.9 21.818a10 10 0 01-3.8 0\" /><path d=\"m16 9-5.5 5.5L8 12\" /><path d=\"M17.609 3.721a10 10 0 012.69 2.7\" /><path d=\"M2.182 13.9a10 10 0 010-3.8\" /><path d=\"M20.279 17.609a10 10 0 01-2.7 2.69\" /><path d=\"M21.818 10.1a10 10 0 010 3.8\" /><path d=\"M3.721 6.391a10 10 0 012.7-2.69\" /><path d=\"M6.391 20.279a10 10 0 01-2.69-2.7\" />","circle-dashed":"<path d=\"M10.1 2.182a10 10 0 0 1 3.8 0\" /><path d=\"M13.9 21.818a10 10 0 0 1-3.8 0\" /><path d=\"M17.609 3.721a10 10 0 0 1 2.69 2.7\" /><path d=\"M2.182 13.9a10 10 0 0 1 0-3.8\" /><path d=\"M20.279 17.609a10 10 0 0 1-2.7 2.69\" /><path d=\"M21.818 10.1a10 10 0 0 1 0 3.8\" /><path d=\"M3.721 6.391a10 10 0 0 1 2.7-2.69\" /><path d=\"M6.391 20.279a10 10 0 0 1-2.69-2.7\" />","circle-divide":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><line x1=\"8\" x2=\"16\" y1=\"12\" y2=\"12\" /><line x1=\"12\" x2=\"12\" y1=\"16\" y2=\"16\" /><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"8\" />","circle-dollar-sign":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8\" /><path d=\"M12 18V6\" />","circle-dot-dashed":"<path d=\"M10.1 2.18a9.93 9.93 0 0 1 3.8 0\" /><path d=\"M17.6 3.71a9.95 9.95 0 0 1 2.69 2.7\" /><path d=\"M21.82 10.1a9.93 9.93 0 0 1 0 3.8\" /><path d=\"M20.29 17.6a9.95 9.95 0 0 1-2.7 2.69\" /><path d=\"M13.9 21.82a9.94 9.94 0 0 1-3.8 0\" /><path d=\"M6.4 20.29a9.95 9.95 0 0 1-2.69-2.7\" /><path d=\"M2.18 13.9a9.93 9.93 0 0 1 0-3.8\" /><path d=\"M3.71 6.4a9.95 9.95 0 0 1 2.7-2.69\" /><circle cx=\"12\" cy=\"12\" r=\"1\" />","circle-dot":"<circle cx=\"12\" cy=\"12\" r=\"1\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","circle-ellipsis":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M17 12h.01\" /><path d=\"M12 12h.01\" /><path d=\"M7 12h.01\" />","circle-equal":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M7 10h10\" /><path d=\"M7 14h10\" />","circle-euro":"<path d=\"M15 9.4a4 4 0 1 0 0 5.2\" /><path d=\"M7 12h5\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","circle-fading-arrow-up":"<path d=\"M12 2a10 10 0 0 1 7.38 16.75\" /><path d=\"m16 12-4-4-4 4\" /><path d=\"M12 16V8\" /><path d=\"M2.5 8.875a10 10 0 0 0-.5 3\" /><path d=\"M2.83 16a10 10 0 0 0 2.43 3.4\" /><path d=\"M4.636 5.235a10 10 0 0 1 .891-.857\" /><path d=\"M8.644 21.42a10 10 0 0 0 7.631-.38\" />","circle-fading-plus":"<path d=\"M12 2a10 10 0 0 1 7.38 16.75\" /><path d=\"M12 8v8\" /><path d=\"M16 12H8\" /><path d=\"M2.5 8.875a10 10 0 0 0-.5 3\" /><path d=\"M2.83 16a10 10 0 0 0 2.43 3.4\" /><path d=\"M4.636 5.235a10 10 0 0 1 .891-.857\" /><path d=\"M8.644 21.42a10 10 0 0 0 7.631-.38\" />","circle-gauge":"<path d=\"M15.6 2.7a10 10 0 1 0 5.7 5.7\" /><circle cx=\"12\" cy=\"12\" r=\"2\" /><path d=\"M13.4 10.6 19 5\" />","circle-help":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\" /><path d=\"M12 17h.01\" />","circle-minus":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M8 12h8\" />","circle-off":"<path d=\"m2 2 20 20\" /><path d=\"M8.35 2.69A10 10 0 0 1 21.3 15.65\" /><path d=\"M19.08 19.08A10 10 0 1 1 4.92 4.92\" />","circle-parking-off":"<path d=\"M12.656 7H13a3 3 0 0 1 2.984 3.307\" /><path d=\"M13 13H9\" /><path d=\"M19.071 19.071A1 1 0 0 1 4.93 4.93\" /><path d=\"m2 2 20 20\" /><path d=\"M8.357 2.687a10 10 0 0 1 12.956 12.956\" /><path d=\"M9 17V9\" />","circle-parking":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M9 17V7h4a3 3 0 0 1 0 6H9\" />","circle-pause":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><line x1=\"10\" x2=\"10\" y1=\"15\" y2=\"9\" /><line x1=\"14\" x2=\"14\" y1=\"15\" y2=\"9\" />","circle-percent":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m15 9-6 6\" /><path d=\"M9 9h.01\" /><path d=\"M15 15h.01\" />","circle-pile":"<circle cx=\"12\" cy=\"19\" r=\"2\" /><circle cx=\"12\" cy=\"5\" r=\"2\" /><circle cx=\"16\" cy=\"12\" r=\"2\" /><circle cx=\"20\" cy=\"19\" r=\"2\" /><circle cx=\"4\" cy=\"19\" r=\"2\" /><circle cx=\"8\" cy=\"12\" r=\"2\" />","circle-play":"<path d=\"M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","circle-plus":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M8 12h8\" /><path d=\"M12 8v8\" />","circle-pound-sterling":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M10 16V9.5a1 1 0 0 1 5 0\" /><path d=\"M8 12h4\" /><path d=\"M8 16h7\" />","circle-power":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 7v4\" /><path d=\"M7.998 9.003a5 5 0 1 0 8-.005\" />","circle-question-mark":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\" /><path d=\"M12 17h.01\" />","circle-slash-2":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M22 2 2 22\" />","circle-slash":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><line x1=\"9\" x2=\"15\" y1=\"15\" y2=\"9\" />","circle-slashed":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M22 2 2 22\" />","circle-small":"<circle cx=\"12\" cy=\"12\" r=\"6\" />","circle-star":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M11.051 7.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.867l-1.156-1.152a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z\" />","circle-stop":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\" rx=\"1\" />","circle-user-round":"<path d=\"M17.925 20.056a6 6 0 0 0-11.851.001\" /><circle cx=\"12\" cy=\"11\" r=\"4\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","circle-user":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><circle cx=\"12\" cy=\"10\" r=\"3\" /><path d=\"M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662\" />","circle-x":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m15 9-6 6\" /><path d=\"m9 9 6 6\" />","circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" />","circuit-board":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M11 9h4a2 2 0 0 0 2-2V3\" /><circle cx=\"9\" cy=\"9\" r=\"2\" /><path d=\"M7 21v-4a2 2 0 0 1 2-2h4\" /><circle cx=\"15\" cy=\"15\" r=\"2\" />","citrus":"<path d=\"M21.66 17.67a1.08 1.08 0 0 1-.04 1.6A12 12 0 0 1 4.73 2.38a1.1 1.1 0 0 1 1.61-.04z\" /><path d=\"M19.65 15.66A8 8 0 0 1 8.35 4.34\" /><path d=\"m14 10-5.5 5.5\" /><path d=\"M14 17.85V10H6.15\" />","clapperboard":"<path d=\"m12.296 3.464 3.02 3.956\" /><path d=\"M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z\" /><path d=\"M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\" /><path d=\"m6.18 5.276 3.1 3.899\" />","clef-alto":"<path d=\"M10 4v16\" /><path d=\"M14 4.764a3 3 0 1 1-.152 4.327A4 4 0 0 1 10 12a4 4 0 0 1 3.848 2.909A3 3 0 1 1 14 19.236\" /><path d=\"M6 4v16\" />","clef-bass":"<path d=\"M19 11h.01\" /><path d=\"M19 6h.01\" /><path d=\"M5 8c0-4 4-4 4-4 6 0 6 6 6 6 0 7-10 11-10 11\" /><circle cx=\"7\" cy=\"8\" r=\"2\" />","clef-treble":"<path d=\"M10.586 21.414a2 2 0 0 0 3.378-1.791L11.036 4.377a2 2 0 1 1 3.378 1.037C12.414 7.414 7 8 7 13a5 5 0 0 0 5 5 5 4 0 0 0 5-4 3 3 0 0 0-3-3 3 2 0 0 0-3 2\" />","clipboard-check":"<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\" /><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\" /><path d=\"m9 14 2 2 4-4\" />","clipboard-clock":"<path d=\"M16 14v2.2l1.6 1\" /><path d=\"M16 4h2a2 2 0 0 1 2 2v.832\" /><path d=\"M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2\" /><circle cx=\"16\" cy=\"16\" r=\"6\" /><rect x=\"8\" y=\"2\" width=\"8\" height=\"4\" rx=\"1\" />","clipboard-copy":"<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\" /><path d=\"M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2\" /><path d=\"M16 4h2a2 2 0 0 1 2 2v4\" /><path d=\"M21 14H11\" /><path d=\"m15 10-4 4 4 4\" />","clipboard-edit":"<path d=\"M16 4h2a2 2 0 0 1 2 2v2\" /><path d=\"M21.34 15.664a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\" /><path d=\"M8 22H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\" /><rect x=\"8\" y=\"2\" width=\"8\" height=\"4\" rx=\"1\" />","clipboard-list":"<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\" /><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\" /><path d=\"M12 11h4\" /><path d=\"M12 16h4\" /><path d=\"M8 11h.01\" /><path d=\"M8 16h.01\" />","clipboard-minus":"<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\" /><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\" /><path d=\"M9 14h6\" />","clipboard-paste":"<path d=\"M11 14h10\" /><path d=\"M16 4h2a2 2 0 0 1 2 2v1.344\" /><path d=\"m17 18 4-4-4-4\" /><path d=\"M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 1.793-1.113\" /><rect x=\"8\" y=\"2\" width=\"8\" height=\"4\" rx=\"1\" />","clipboard-pen-line":"<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" /><path d=\"M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.5\" /><path d=\"M16 4h2a2 2 0 0 1 1.73 1\" /><path d=\"M8 18h1\" /><path d=\"M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\" />","clipboard-pen":"<path d=\"M16 4h2a2 2 0 0 1 2 2v2\" /><path d=\"M21.34 15.664a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\" /><path d=\"M8 22H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\" /><rect x=\"8\" y=\"2\" width=\"8\" height=\"4\" rx=\"1\" />","clipboard-plus":"<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\" /><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\" /><path d=\"M9 14h6\" /><path d=\"M12 17v-6\" />","clipboard-signature":"<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" /><path d=\"M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.5\" /><path d=\"M16 4h2a2 2 0 0 1 1.73 1\" /><path d=\"M8 18h1\" /><path d=\"M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\" />","clipboard-type":"<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\" /><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\" /><path d=\"M9 12v-1h6v1\" /><path d=\"M11 17h2\" /><path d=\"M12 11v6\" />","clipboard-x":"<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\" /><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\" /><path d=\"m14.5 11.5-5 5\" /><path d=\"m9.5 11.5 5 5\" />","clipboard":"<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\" /><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\" />","clock-1":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 6v6l2-4\" />","clock-10":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 6v6l-4-2\" />","clock-11":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 6v6l-2-4\" />","clock-12":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 6v6\" />","clock-2":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 6v6l4-2\" />","clock-3":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 6v6h4\" />","clock-4":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 6v6l4 2\" />","clock-5":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 6v6l2 4\" />","clock-6":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 6v10\" />","clock-7":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 6v6l-2 4\" />","clock-8":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 6v6l-4 2\" />","clock-9":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 6v6H8\" />","clock-alert":"<path d=\"M12 6v6l4 2\" /><path d=\"M20 12v5\" /><path d=\"M20 21h.01\" /><path d=\"M21.25 8.2A10 10 0 1 0 16 21.16\" />","clock-arrow-down":"<path d=\"M12 6v6l2 1\" /><path d=\"M12.337 21.994a10 10 0 1 1 9.588-8.767\" /><path d=\"m14 18 4 4 4-4\" /><path d=\"M18 14v8\" />","clock-arrow-left":"<path d=\"M12 6v6l1.5.8\" /><path d=\"M12.338 21.994a10 10 0 1 1 9.587-8.767\" /><path d=\"M14 18h8\" /><path d=\"m18 22-4-4 4-4\" />","clock-arrow-right":"<path d=\"M12 6v6l2 1\" /><path d=\"M13.5 21.885A10 10 0 1 1 22 12\" /><path d=\"M14 18h8\" /><path d=\"m18 22 4-4-4-4\" />","clock-arrow-up":"<path d=\"M12 6v6l1.56.78\" /><path d=\"M13.227 21.925a10 10 0 1 1 8.767-9.588\" /><path d=\"m14 18 4-4 4 4\" /><path d=\"M18 22v-8\" />","clock-check":"<path d=\"M21.95 13a10 10 0 1 0-8.685 8.92\" /><path d=\"M12 6v6l4 2\" /><path d=\"m16 19 2 2 4-4\" />","clock-fading":"<path d=\"M12 2a10 10 0 0 1 7.38 16.75\" /><path d=\"M12 6v6l4 2\" /><path d=\"M2.5 8.875a10 10 0 0 0-.5 3\" /><path d=\"M2.83 16a10 10 0 0 0 2.43 3.4\" /><path d=\"M4.636 5.235a10 10 0 0 1 .891-.857\" /><path d=\"M8.644 21.42a10 10 0 0 0 7.631-.38\" />","clock-plus":"<path d=\"M12 6v6l3.644 1.822\" /><path d=\"M16 19h6\" /><path d=\"M19 16v6\" /><path d=\"M21.92 13.267a10 10 0 1 0-8.653 8.653\" />","clock":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 6v6l4 2\" />","closed-caption":"<path d=\"M10 9.17a3 3 0 1 0 0 5.66\" /><path d=\"M17 9.17a3 3 0 1 0 0 5.66\" /><rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"2\" />","cloud-alert":"<path d=\"M12 12v4\" /><path d=\"M12 20h.01\" /><path d=\"M8.128 16.949A7 7 0 1 1 15.71 8h1.79a1 1 0 0 1 0 9h-1.642\" />","cloud-backup":"<path d=\"M21 15.251A4.5 4.5 0 0 0 17.5 8h-1.79A7 7 0 1 0 3 13.607\" /><path d=\"M7 11v4h4\" /><path d=\"M8 19a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5 4.82 4.82 0 0 0-3.41 1.41L7 15\" />","cloud-check":"<path d=\"m17 15-5.5 5.5L9 18\" /><path d=\"M5.516 16.07A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 3.501 7.327\" />","cloud-cog":"<path d=\"m10.852 19.772-.383.924\" /><path d=\"m13.148 14.228.383-.923\" /><path d=\"M13.148 19.772a3 3 0 1 0-2.296-5.544l-.383-.923\" /><path d=\"m13.53 20.696-.382-.924a3 3 0 1 1-2.296-5.544\" /><path d=\"m14.772 15.852.923-.383\" /><path d=\"m14.772 18.148.923.383\" /><path d=\"M4.2 15.1a7 7 0 1 1 9.93-9.858A7 7 0 0 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.2\" /><path d=\"m9.228 15.852-.923-.383\" /><path d=\"m9.228 18.148-.923.383\" />","cloud-download":"<path d=\"M12 13v8l-4-4\" /><path d=\"m12 21 4-4\" /><path d=\"M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284\" />","cloud-drizzle":"<path d=\"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242\" /><path d=\"M8 19v1\" /><path d=\"M8 14v1\" /><path d=\"M16 19v1\" /><path d=\"M16 14v1\" /><path d=\"M12 21v1\" /><path d=\"M12 16v1\" />","cloud-fog":"<path d=\"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242\" /><path d=\"M16 17H7\" /><path d=\"M17 21H9\" />","cloud-hail":"<path d=\"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242\" /><path d=\"M16 14v2\" /><path d=\"M8 14v2\" /><path d=\"M16 20h.01\" /><path d=\"M8 20h.01\" /><path d=\"M12 16v2\" /><path d=\"M12 22h.01\" />","cloud-lightning":"<path d=\"M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973\" /><path d=\"m13 12-3 5h4l-3 5\" />","cloud-moon-rain":"<path d=\"M11 20v2\" /><path d=\"M18.376 14.512a6 6 0 0 0 3.461-4.127c.148-.625-.659-.97-1.248-.714a4 4 0 0 1-5.259-5.26c.255-.589-.09-1.395-.716-1.248a6 6 0 0 0-4.594 5.36\" /><path d=\"M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24\" /><path d=\"M7 19v2\" />","cloud-moon":"<path d=\"M13 16a3 3 0 0 1 0 6H7a5 5 0 1 1 4.9-6z\" /><path d=\"M18.376 14.512a6 6 0 0 0 3.461-4.127c.148-.625-.659-.97-1.248-.714a4 4 0 0 1-5.259-5.26c.255-.589-.09-1.395-.716-1.248a6 6 0 0 0-4.594 5.36\" />","cloud-off":"<path d=\"M10.94 5.274A7 7 0 0 1 15.71 10h1.79a4.5 4.5 0 0 1 4.222 6.057\" /><path d=\"M18.796 18.81A4.5 4.5 0 0 1 17.5 19H9A7 7 0 0 1 5.79 5.78\" /><path d=\"m2 2 20 20\" />","cloud-rain-wind":"<path d=\"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242\" /><path d=\"m9.2 22 3-7\" /><path d=\"m9 13-3 7\" /><path d=\"m17 13-3 7\" />","cloud-rain":"<path d=\"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242\" /><path d=\"M16 14v6\" /><path d=\"M8 14v6\" /><path d=\"M12 16v6\" />","cloud-snow":"<path d=\"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242\" /><path d=\"M8 15h.01\" /><path d=\"M8 19h.01\" /><path d=\"M12 17h.01\" /><path d=\"M12 21h.01\" /><path d=\"M16 15h.01\" /><path d=\"M16 19h.01\" />","cloud-sun-rain":"<path d=\"M12 2v2\" /><path d=\"m4.93 4.93 1.41 1.41\" /><path d=\"M20 12h2\" /><path d=\"m19.07 4.93-1.41 1.41\" /><path d=\"M15.947 12.65a4 4 0 0 0-5.925-4.128\" /><path d=\"M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24\" /><path d=\"M11 20v2\" /><path d=\"M7 19v2\" />","cloud-sun":"<path d=\"M12 2v2\" /><path d=\"m4.93 4.93 1.41 1.41\" /><path d=\"M20 12h2\" /><path d=\"m19.07 4.93-1.41 1.41\" /><path d=\"M15.947 12.65a4 4 0 0 0-5.925-4.128\" /><path d=\"M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z\" />","cloud-sync":"<path d=\"m17 18-1.535 1.605a5 5 0 0 1-8-1.5\" /><path d=\"M17 22v-4h-4\" /><path d=\"M20.996 15.251A4.5 4.5 0 0 0 17.495 8h-1.79a7 7 0 1 0-12.709 5.607\" /><path d=\"M7 10v4h4\" /><path d=\"m7 14 1.535-1.605a5 5 0 0 1 8 1.5\" />","cloud-upload":"<path d=\"M12 13v8\" /><path d=\"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242\" /><path d=\"m8 17 4-4 4 4\" />","cloud":"<path d=\"M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z\" />","cloudy":"<path d=\"M17.5 12a1 1 0 1 1 0 9H9.006a7 7 0 1 1 6.702-9z\" /><path d=\"M21.832 9A3 3 0 0 0 19 7h-2.207a5.5 5.5 0 0 0-10.72.61\" />","clover":"<path d=\"M16.17 7.83 2 22\" /><path d=\"M4.02 12a2.827 2.827 0 1 1 3.81-4.17A2.827 2.827 0 1 1 12 4.02a2.827 2.827 0 1 1 4.17 3.81A2.827 2.827 0 1 1 19.98 12a2.827 2.827 0 1 1-3.81 4.17A2.827 2.827 0 1 1 12 19.98a2.827 2.827 0 1 1-4.17-3.81A1 1 0 1 1 4 12\" /><path d=\"m7.83 7.83 8.34 8.34\" />","club":"<path d=\"M17.28 9.05a5.5 5.5 0 1 0-10.56 0A5.5 5.5 0 1 0 12 17.66a5.5 5.5 0 1 0 5.28-8.6Z\" /><path d=\"M12 17.66L12 22\" />","code-2":"<path d=\"m18 16 4-4-4-4\" /><path d=\"m6 8-4 4 4 4\" /><path d=\"m14.5 4-5 16\" />","code-square":"<path d=\"m10 9-3 3 3 3\" /><path d=\"m14 15 3-3-3-3\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","code-xml":"<path d=\"m18 16 4-4-4-4\" /><path d=\"m6 8-4 4 4 4\" /><path d=\"m14.5 4-5 16\" />","code":"<path d=\"m16 18 6-6-6-6\" /><path d=\"m8 6-6 6 6 6\" />","coffee":"<path d=\"M10 2v2\" /><path d=\"M14 2v2\" /><path d=\"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1\" /><path d=\"M6 2v2\" />","cog":"<path d=\"M11 10.27 7 3.34\" /><path d=\"m11 13.73-4 6.93\" /><path d=\"M12 22v-2\" /><path d=\"M12 2v2\" /><path d=\"M14 12h8\" /><path d=\"m17 20.66-1-1.73\" /><path d=\"m17 3.34-1 1.73\" /><path d=\"M2 12h2\" /><path d=\"m20.66 17-1.73-1\" /><path d=\"m20.66 7-1.73 1\" /><path d=\"m3.34 17 1.73-1\" /><path d=\"m3.34 7 1.73 1\" /><circle cx=\"12\" cy=\"12\" r=\"2\" /><circle cx=\"12\" cy=\"12\" r=\"8\" />","coins":"<path d=\"M13.744 17.736a6 6 0 1 1-7.48-7.48\" /><path d=\"M15 6h1v4\" /><path d=\"m6.134 14.768.866-.5 2 3.464\" /><circle cx=\"16\" cy=\"8\" r=\"6\" />","columns-2":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M12 3v18\" />","columns-3-cog":"<path d=\"M10.6 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v5.6\" /><path d=\"m14.305 19.53.923-.382\" /><path d=\"M15 3v7.6\" /><path d=\"m15.229 16.852-.924-.383\" /><path d=\"m16.852 15.228-.383-.923\" /><path d=\"m16.852 20.772-.383.924\" /><path d=\"m19.148 15.228.383-.923\" /><path d=\"m19.53 21.696-.382-.924\" /><path d=\"m20.773 16.852.922-.383\" /><path d=\"m20.773 19.148.922.383\" /><path d=\"M9 3v18\" /><circle cx=\"18\" cy=\"18\" r=\"3\" />","columns-3":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M9 3v18\" /><path d=\"M15 3v18\" />","columns-4":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M7.5 3v18\" /><path d=\"M12 3v18\" /><path d=\"M16.5 3v18\" />","columns-settings":"<path d=\"M10.6 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v5.6\" /><path d=\"m14.305 19.53.923-.382\" /><path d=\"M15 3v7.6\" /><path d=\"m15.229 16.852-.924-.383\" /><path d=\"m16.852 15.228-.383-.923\" /><path d=\"m16.852 20.772-.383.924\" /><path d=\"m19.148 15.228.383-.923\" /><path d=\"m19.53 21.696-.382-.924\" /><path d=\"m20.773 16.852.922-.383\" /><path d=\"m20.773 19.148.922.383\" /><path d=\"M9 3v18\" /><circle cx=\"18\" cy=\"18\" r=\"3\" />","columns":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M12 3v18\" />","combine":"<path d=\"M14 3a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1\" /><path d=\"M19 3a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1\" /><path d=\"m7 15 3 3\" /><path d=\"m7 21 3-3H5a2 2 0 0 1-2-2v-2\" /><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\" /><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\" />","command":"<path d=\"M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3\" />","compass":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z\" />","component":"<path d=\"M15.536 11.293a1 1 0 0 0 0 1.414l2.376 2.377a1 1 0 0 0 1.414 0l2.377-2.377a1 1 0 0 0 0-1.414l-2.377-2.377a1 1 0 0 0-1.414 0z\" /><path d=\"M2.297 11.293a1 1 0 0 0 0 1.414l2.377 2.377a1 1 0 0 0 1.414 0l2.377-2.377a1 1 0 0 0 0-1.414L6.088 8.916a1 1 0 0 0-1.414 0z\" /><path d=\"M8.916 17.912a1 1 0 0 0 0 1.415l2.377 2.376a1 1 0 0 0 1.414 0l2.377-2.376a1 1 0 0 0 0-1.415l-2.377-2.376a1 1 0 0 0-1.414 0z\" /><path d=\"M8.916 4.674a1 1 0 0 0 0 1.414l2.377 2.376a1 1 0 0 0 1.414 0l2.377-2.376a1 1 0 0 0 0-1.414l-2.377-2.377a1 1 0 0 0-1.414 0z\" />","computer":"<path d=\"M12 18h6\" /><path d=\"M6 18h.01\" /><path d=\"M8 6h1\" /><rect x=\"2\" y=\"14\" width=\"20\" height=\"8\" rx=\"2\" /><rect x=\"4\" y=\"2\" width=\"16\" height=\"12\" rx=\"2\" />","concierge-bell":"<path d=\"M3 20a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1Z\" /><path d=\"M20 16a8 8 0 1 0-16 0\" /><path d=\"M12 4v4\" /><path d=\"M10 4h4\" />","cone":"<path d=\"m20.9 18.55-8-15.98a1 1 0 0 0-1.8 0l-8 15.98\" /><ellipse cx=\"12\" cy=\"19\" rx=\"9\" ry=\"3\" />","construction":"<rect x=\"2\" y=\"6\" width=\"20\" height=\"8\" rx=\"1\" /><path d=\"M17 14v7\" /><path d=\"M7 14v7\" /><path d=\"M17 3v3\" /><path d=\"M7 3v3\" /><path d=\"M10 14 2.3 6.3\" /><path d=\"m14 6 7.7 7.7\" /><path d=\"m8 6 8 8\" />","contact-2":"<path d=\"M16 2v2\" /><path d=\"M17.915 21a6 6 0 10-12 0\" /><path d=\"M8 2v2\" /><circle cx=\"12\" cy=\"11\" r=\"4\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","contact-round":"<path d=\"M16 2v2\" /><path d=\"M17.915 21a6 6 0 10-12 0\" /><path d=\"M8 2v2\" /><circle cx=\"12\" cy=\"11\" r=\"4\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","contact":"<path d=\"M16 2v2\" /><path d=\"M7 21v-2a2 2 0 012-2h6a2 2 0 012 2v2\" /><path d=\"M8 2v2\" /><circle cx=\"12\" cy=\"10\" r=\"3\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","container":"<path d=\"M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z\" /><path d=\"M10 21.9V14L2.1 9.1\" /><path d=\"m10 14 11.9-6.9\" /><path d=\"M14 19.8v-8.1\" /><path d=\"M18 17.5V9.4\" />","contrast":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 18a6 6 0 0 0 0-12v12z\" />","cookie":"<path d=\"M11 17h.01\" /><path d=\"M11.496 2c.324-.016.558.292.529.615a4 4 0 004.235 4.368.713.713 0 01.758.757 4 4 0 004.366 4.237c.323-.03.63.204.614.527a10 10 0 01-2.915 6.566A1 1 0 114.93 4.918 10 10 0 0111.496 2\" /><path d=\"M12 12h.01\" /><path d=\"M16 16h.01\" /><path d=\"M16 3h.01\" /><path d=\"M21 4h.01\" /><path d=\"M21 8h.01\" /><path d=\"M7 14h.01\" /><path d=\"M9 8h.01\" />","cooking-pot":"<path d=\"M2 12h20\" /><path d=\"M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8\" /><path d=\"m4 8 16-4\" /><path d=\"m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8\" />","copy-check":"<path d=\"m12 15 2 2 4-4\" /><rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\" /><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\" />","copy-minus":"<line x1=\"12\" x2=\"18\" y1=\"15\" y2=\"15\" /><rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\" /><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\" />","copy-plus":"<line x1=\"15\" x2=\"15\" y1=\"12\" y2=\"18\" /><line x1=\"12\" x2=\"18\" y1=\"15\" y2=\"15\" /><rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\" /><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\" />","copy-slash":"<line x1=\"12\" x2=\"18\" y1=\"18\" y2=\"12\" /><rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\" /><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\" />","copy-x":"<path d=\"M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2\" /><rect x=\"8\" y=\"8\" width=\"14\" height=\"14\" rx=\"2\" /><path d=\"m12.5 12.5 5 5\" /><path d=\"m12.5 17.5 5-5\" />","copy":"<rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\" /><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\" />","copyleft":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M9.17 14.83a4 4 0 1 0 0-5.66\" />","copyright":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M14.83 14.83a4 4 0 1 1 0-5.66\" />","corner-down-left":"<path d=\"M20 4v7a4 4 0 0 1-4 4H4\" /><path d=\"m9 10-5 5 5 5\" />","corner-down-right":"<path d=\"m15 10 5 5-5 5\" /><path d=\"M4 4v7a4 4 0 0 0 4 4h12\" />","corner-left-down":"<path d=\"m14 15-5 5-5-5\" /><path d=\"M20 4h-7a4 4 0 0 0-4 4v12\" />","corner-left-up":"<path d=\"M14 9 9 4 4 9\" /><path d=\"M20 20h-7a4 4 0 0 1-4-4V4\" />","corner-right-down":"<path d=\"m10 15 5 5 5-5\" /><path d=\"M4 4h7a4 4 0 0 1 4 4v12\" />","corner-right-up":"<path d=\"m10 9 5-5 5 5\" /><path d=\"M4 20h7a4 4 0 0 0 4-4V4\" />","corner-up-left":"<path d=\"M20 20v-7a4 4 0 0 0-4-4H4\" /><path d=\"M9 14 4 9l5-5\" />","corner-up-right":"<path d=\"m15 14 5-5-5-5\" /><path d=\"M4 20v-7a4 4 0 0 1 4-4h12\" />","cpu":"<path d=\"M12 20v2\" /><path d=\"M12 2v2\" /><path d=\"M17 20v2\" /><path d=\"M17 2v2\" /><path d=\"M2 12h2\" /><path d=\"M2 17h2\" /><path d=\"M2 7h2\" /><path d=\"M20 12h2\" /><path d=\"M20 17h2\" /><path d=\"M20 7h2\" /><path d=\"M7 20v2\" /><path d=\"M7 2v2\" /><rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\" /><rect x=\"8\" y=\"8\" width=\"8\" height=\"8\" rx=\"1\" />","creative-commons":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M10 9.3a2.8 2.8 0 0 0-3.5 1 3.1 3.1 0 0 0 0 3.4 2.7 2.7 0 0 0 3.5 1\" /><path d=\"M17 9.3a2.8 2.8 0 0 0-3.5 1 3.1 3.1 0 0 0 0 3.4 2.7 2.7 0 0 0 3.5 1\" />","credit-card-check":"<path d=\"M12.5 19H4a2 2 0 01-2-2V7a2 2 0 012-2h16a2 2 0 012 2v4\" /><path d=\"M2 10h20\" /><path d=\"M6 14h2\" /><path d=\"m16 17 2 2 4-4\" />","credit-card-minus":"<path d=\"M22 13V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h8.536\" /><path d=\"M22 10H2\" /><path d=\"M6 14h2\" /><path d=\"M16 17h6\" />","credit-card-plus":"<path d=\"M22 11.354V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h8.536\" /><path d=\"M22 10H2\" /><path d=\"M6 14h2\" /><path d=\"M16 17h6\" /><path d=\"M19 14v6\" />","credit-card-reader":"<path d=\"M15 16v1\" /><path d=\"M16.963 7.734A1 1 0 0015.999 7H8.003a1 1 0 00-.964.734L4.073 18.467A2 2 0 006 21h12a2 2 0 001.927-2.532z\" /><path d=\"M2.678 8.5A2 2 0 012 7V5a2 2 0 012-2h16a2 2 0 012 2v2a2 2 0 01-.676 1.499\" /><path d=\"m9 21 2-14\" />","credit-card-x":"<path d=\"M12.5 19H4a2 2 0 01-2-2V7a2 2 0 012-2h16a2 2 0 012 2v3.5\" /><path d=\"M2 10h20\" /><path d=\"M6 14h2\" /><path d=\"m16.5 14.5 5 5\" /><path d=\"m21.5 14.5-5 5\" />","credit-card":"<rect width=\"20\" height=\"14\" x=\"2\" y=\"5\" rx=\"2\" /><line x1=\"2\" x2=\"22\" y1=\"10\" y2=\"10\" /><path d=\"M6 14h2\" />","croissant":"<path d=\"M10.2 18H4.774a1.5 1.5 0 0 1-1.352-.97 11 11 0 0 1 .132-6.487\" /><path d=\"M18 10.2V4.774a1.5 1.5 0 0 0-.97-1.352 11 11 0 0 0-6.486.132\" /><path d=\"M18 5a4 3 0 0 1 4 3 2 2 0 0 1-2 2 10 10 0 0 0-5.139 1.42\" /><path d=\"M5 18a3 4 0 0 0 3 4 2 2 0 0 0 2-2 10 10 0 0 1 1.42-5.14\" /><path d=\"M8.709 2.554a10 10 0 0 0-6.155 6.155 1.5 1.5 0 0 0 .676 1.626l9.807 5.42a2 2 0 0 0 2.718-2.718l-5.42-9.807a1.5 1.5 0 0 0-1.626-.676\" />","crop":"<path d=\"M6 2v14a2 2 0 0 0 2 2h14\" /><path d=\"M18 22V8a2 2 0 0 0-2-2H2\" />","cross":"<path d=\"M4 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a1 1 0 0 1 1 1v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a1 1 0 0 1 1-1h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4a1 1 0 0 1-1-1V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a1 1 0 0 1-1 1z\" />","crosshair":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><line x1=\"22\" x2=\"18\" y1=\"12\" y2=\"12\" /><line x1=\"6\" x2=\"2\" y1=\"12\" y2=\"12\" /><line x1=\"12\" x2=\"12\" y1=\"6\" y2=\"2\" /><line x1=\"12\" x2=\"12\" y1=\"22\" y2=\"18\" />","crown":"<path d=\"M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z\" /><path d=\"M5 21h14\" />","cuboid":"<path d=\"M10 22v-8\" /><path d=\"M2.336 8.89 10 14l11.715-7.029\" /><path d=\"M22 14a2 2 0 0 1-.971 1.715l-10 6a2 2 0 0 1-2.138-.05l-6-4A2 2 0 0 1 2 16v-6a2 2 0 0 1 .971-1.715l10-6a2 2 0 0 1 2.138.05l6 4A2 2 0 0 1 22 8z\" />","cup-soda":"<path d=\"m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8\" /><path d=\"M5 8h14\" /><path d=\"M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0\" /><path d=\"m12 8 1-6h2\" />","cupcake":"<path d=\"M12 22v-9\" /><path d=\"M14 4h1a3 3 0 013 3l-.004.125A4 4 0 0121 11v2\" /><path d=\"m15.5 22 1.5-9\" /><path d=\"M21 13a1 1 0 01.919 1.394l-2.74 6.394A2 2 0 0117.34 22H6.659a2 2 0 01-1.838-1.212l-2.74-6.394A1 1 0 013 13z\" /><path d=\"M3 13v-2a4 4 0 013.003-3.875L6 7a3 3 0 013-3h1\" /><path d=\"M8.5 22 7 13\" /><circle cx=\"12\" cy=\"4\" r=\"2\" />","curly-braces":"<path d=\"M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1\" /><path d=\"M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1\" />","currency":"<circle cx=\"12\" cy=\"12\" r=\"8\" /><line x1=\"3\" x2=\"6\" y1=\"3\" y2=\"6\" /><line x1=\"21\" x2=\"18\" y1=\"3\" y2=\"6\" /><line x1=\"3\" x2=\"6\" y1=\"21\" y2=\"18\" /><line x1=\"21\" x2=\"18\" y1=\"21\" y2=\"18\" />","cylinder":"<ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\" /><path d=\"M3 5v14a9 3 0 0 0 18 0V5\" />","dam":"<path d=\"M11 11.31c1.17.56 1.54 1.69 3.5 1.69 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1\" /><path d=\"M11.75 18c.35.5 1.45 1 2.75 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1\" /><path d=\"M2 10h4\" /><path d=\"M2 14h4\" /><path d=\"M2 18h4\" /><path d=\"M2 6h4\" /><path d=\"M7 3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1L10 4a1 1 0 0 0-1-1z\" />","database-arrow-down":"<path d=\"m16 19 3 3 3-3\" /><path d=\"M19 16v6\" /><path d=\"M21 12.536V5\" /><path d=\"M3 12A9 3 0 0 0 15.182 14.806\" /><path d=\"M3 5V19A9 3 0 0 0 13.318 21.968\" /><ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\" />","database-arrow-up":"<path d=\"M19 22v-6\" /><path d=\"M21 12.536V5\" /><path d=\"m22 19-3-3-3 3\" /><path d=\"M3 12A9 3 0 0 0 14.457 14.886\" /><path d=\"M3 5V19A9 3 0 0 0 13.318 21.968\" /><ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\" />","database-backup":"<ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\" /><path d=\"M3 12a9 3 0 0 0 5 2.69\" /><path d=\"M21 9.3V5\" /><path d=\"M3 5v14a9 3 0 0 0 6.47 2.88\" /><path d=\"M12 12v4h4\" /><path d=\"M13 20a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L12 16\" />","database-check":"<path d=\"m16 19 2 2 4-4\" /><path d=\"M21 13.127V5\" /><path d=\"M3 12A9 3 0 0 0 21 12\" /><path d=\"M3 5V19A9 3 0 0 0 13.318 21.968\" /><ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\" />","database-minus":"<path d=\"M21 15V5\" /><path d=\"M22 19h-6\" /><path d=\"M3 12A9 3 0 0 0 21 12\" /><path d=\"M3 5V19A9 3 0 0 0 13.318 21.968\" /><ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\" />","database-plus":"<path d=\"M19 16v6\" /><path d=\"M21 12.536V5\" /><path d=\"M22 19h-6\" /><path d=\"M3 12A9 3 0 0 0 15.1824 14.8061\" /><path d=\"M3 5V19A9 3 0 0 0 13.318 21.968\" /><ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\" />","database-search":"<path d=\"M21 11.693V5\" /><path d=\"m22 22-1.875-1.875\" /><path d=\"M3 12a9 3 0 0 0 8.697 2.998\" /><path d=\"M3 5v14a9 3 0 0 0 9.28 2.999\" /><circle cx=\"18\" cy=\"18\" r=\"3\" /><ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\" />","database-x":"<path d=\"m17 17 5 5\" /><path d=\"M19.323 13.744A9 3 0 0 0 21 12\" /><path d=\"M21 13.127V5\" /><path d=\"m22 17-5 5\" /><path d=\"M3 12A9 3 0 0 0 13.563 14.954\" /><path d=\"M3 5V19A9 3 0 0 0 13 21.981\" /><ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\" />","database-zap":"<ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\" /><path d=\"M3 5V19A9 3 0 0 0 15 21.84\" /><path d=\"M21 5V8\" /><path d=\"M21 12L18 17H22L19 22\" /><path d=\"M3 12A9 3 0 0 0 14.59 14.87\" />","database":"<ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\" /><path d=\"M3 5V19A9 3 0 0 0 21 19V5\" /><path d=\"M3 12A9 3 0 0 0 21 12\" />","decimals-arrow-left":"<path d=\"m13 21-3-3 3-3\" /><path d=\"M20 18H10\" /><path d=\"M3 11h.01\" /><rect x=\"6\" y=\"3\" width=\"5\" height=\"8\" rx=\"2.5\" />","decimals-arrow-right":"<path d=\"M10 18h10\" /><path d=\"m17 21 3-3-3-3\" /><path d=\"M3 11h.01\" /><rect x=\"15\" y=\"3\" width=\"5\" height=\"8\" rx=\"2.5\" /><rect x=\"6\" y=\"3\" width=\"5\" height=\"8\" rx=\"2.5\" />","delete":"<path d=\"M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z\" /><path d=\"m12 9 6 6\" /><path d=\"m18 9-6 6\" />","dessert":"<path d=\"M10.162 3.167A10 10 0 0 0 2 13a2 2 0 0 0 4 0v-1a2 2 0 0 1 4 0v4a2 2 0 0 0 4 0v-4a2 2 0 0 1 4 0v1a2 2 0 0 0 4-.006 10 10 0 0 0-8.161-9.826\" /><path d=\"M20.804 14.869a9 9 0 0 1-17.608 0\" /><circle cx=\"12\" cy=\"4\" r=\"2\" />","diameter":"<circle cx=\"19\" cy=\"19\" r=\"2\" /><circle cx=\"5\" cy=\"5\" r=\"2\" /><path d=\"M6.48 3.66a10 10 0 0 1 13.86 13.86\" /><path d=\"m6.41 6.41 11.18 11.18\" /><path d=\"M3.66 6.48a10 10 0 0 0 13.86 13.86\" />","diamond-minus":"<path d=\"M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z\" /><path d=\"M8 12h8\" />","diamond-percent":"<path d=\"M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0Z\" /><path d=\"M9.2 9.2h.01\" /><path d=\"m14.5 9.5-5 5\" /><path d=\"M14.7 14.8h.01\" />","diamond-plus":"<path d=\"M12 8v8\" /><path d=\"M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z\" /><path d=\"M8 12h8\" />","diamond":"<path d=\"M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z\" />","dice-1":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" /><path d=\"M12 12h.01\" />","dice-2":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" /><path d=\"M15 9h.01\" /><path d=\"M9 15h.01\" />","dice-3":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" /><path d=\"M16 8h.01\" /><path d=\"M12 12h.01\" /><path d=\"M8 16h.01\" />","dice-4":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" /><path d=\"M16 8h.01\" /><path d=\"M8 8h.01\" /><path d=\"M8 16h.01\" /><path d=\"M16 16h.01\" />","dice-5":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" /><path d=\"M16 8h.01\" /><path d=\"M8 8h.01\" /><path d=\"M8 16h.01\" /><path d=\"M16 16h.01\" /><path d=\"M12 12h.01\" />","dice-6":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" /><path d=\"M16 8h.01\" /><path d=\"M16 12h.01\" /><path d=\"M16 16h.01\" /><path d=\"M8 8h.01\" /><path d=\"M8 12h.01\" /><path d=\"M8 16h.01\" />","dices":"<rect width=\"12\" height=\"12\" x=\"2\" y=\"10\" rx=\"2\" ry=\"2\" /><path d=\"m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6\" /><path d=\"M6 18h.01\" /><path d=\"M10 14h.01\" /><path d=\"M15 6h.01\" /><path d=\"M18 9h.01\" />","diff":"<path d=\"M12 3v14\" /><path d=\"M5 10h14\" /><path d=\"M5 21h14\" />","disc-2":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><circle cx=\"12\" cy=\"12\" r=\"4\" /><path d=\"M12 12h.01\" />","disc-3":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M6 12c0-1.7.7-3.2 1.8-4.2\" /><circle cx=\"12\" cy=\"12\" r=\"2\" /><path d=\"M18 12c0 1.7-.7 3.2-1.8 4.2\" />","disc-album":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><circle cx=\"12\" cy=\"12\" r=\"5\" /><path d=\"M12 12h.01\" />","disc":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><circle cx=\"12\" cy=\"12\" r=\"2\" />","divide-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><line x1=\"8\" x2=\"16\" y1=\"12\" y2=\"12\" /><line x1=\"12\" x2=\"12\" y1=\"16\" y2=\"16\" /><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"8\" />","divide-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" /><line x1=\"8\" x2=\"16\" y1=\"12\" y2=\"12\" /><line x1=\"12\" x2=\"12\" y1=\"16\" y2=\"16\" /><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"8\" />","divide":"<circle cx=\"12\" cy=\"6\" r=\"1\" /><line x1=\"5\" x2=\"19\" y1=\"12\" y2=\"12\" /><circle cx=\"12\" cy=\"18\" r=\"1\" />","dna-off":"<path d=\"M15 2c-1.35 1.5-2.092 3-2.5 4.5L14 8\" /><path d=\"m17 6-2.891-2.891\" /><path d=\"M2 15c3.333-3 6.667-3 10-3\" /><path d=\"m2 2 20 20\" /><path d=\"m20 9 .891.891\" /><path d=\"M22 9c-1.5 1.35-3 2.092-4.5 2.5l-1-1\" /><path d=\"M3.109 14.109 4 15\" /><path d=\"m6.5 12.5 1 1\" /><path d=\"m7 18 2.891 2.891\" /><path d=\"M9 22c1.35-1.5 2.092-3 2.5-4.5L10 16\" />","dna":"<path d=\"m10 16 1.5 1.5\" /><path d=\"m14 8-1.5-1.5\" /><path d=\"M15 2c-1.798 1.998-2.518 3.995-2.807 5.993\" /><path d=\"m16.5 10.5 1 1\" /><path d=\"m17 6-2.891-2.891\" /><path d=\"M2 15c6.667-6 13.333 0 20-6\" /><path d=\"m20 9 .891.891\" /><path d=\"M3.109 14.109 4 15\" /><path d=\"m6.5 12.5 1 1\" /><path d=\"m7 18 2.891 2.891\" /><path d=\"M9 22c1.798-1.998 2.518-3.995 2.807-5.993\" />","dock":"<path d=\"M2 8h20\" /><rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\" /><path d=\"M6 16h12\" />","dog":"<path d=\"M11.25 16.25h1.5L12 17z\" /><path d=\"M16 14v.5\" /><path d=\"M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309\" /><path d=\"M8 14v.5\" /><path d=\"M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5\" />","dollar-sign":"<line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"22\" /><path d=\"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\" />","dome":"<path d=\"M10 21v-3a2 2 0 014 0v3\" /><path d=\"M12 2v2\" /><path d=\"M18 12v9\" /><path d=\"M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2v-6a1 1 0 011-1h18a1 1 0 011 1z\" /><path d=\"M4 12a8 8 0 0116 0\" /><path d=\"M6 12v9\" />","donut":"<path d=\"M20.5 10a2.5 2.5 0 0 1-2.4-3H18a2.95 2.95 0 0 1-2.6-4.4 10 10 0 1 0 6.3 7.1c-.3.2-.8.3-1.2.3\" /><circle cx=\"12\" cy=\"12\" r=\"3\" />","door-closed-locked":"<path d=\"M19 8V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16\" /><path d=\"M2 21h8\" /><path d=\"M20 16v-2a2 2 0 00-4 0v2\" /><path d=\"M9 12h.01\" /><rect x=\"14\" y=\"16\" width=\"8\" height=\"5\" rx=\"1\" />","door-closed-package":"<path d=\"M18 13v3\" /><path d=\"M19 9V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16\" /><path d=\"M2 21h8\" /><path d=\"M9 12h.01\" /><rect x=\"14\" y=\"13\" width=\"8\" height=\"8\" rx=\"1\" />","door-closed":"<path d=\"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16\" /><path d=\"M2 21h20\" /><path d=\"M9 12h.01\" />","door-open":"<path d=\"M10 21H2\" /><path d=\"M10 3H7a2 2 0 00-2 2v16\" /><path d=\"M14 12h.01\" /><path d=\"M19 21V5a2 2 0 00-1.675-1.974l-6.163-1.013A1 1 0 0010 3v18a1 1 0 001.124.992z\" /><path d=\"M22 21h-3\" />","door-stairwell":"<path d=\"M12 17v-3a1 1 0 011-1h6\" /><path d=\"M19 17h-9a1 1 0 00-1 1v3\" /><path d=\"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16\" /><path d=\"M19 9h-3a1 1 0 00-1 1v3\" /><path d=\"M22 21H2\" />","dot-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><circle cx=\"12\" cy=\"12\" r=\"1\" />","dot":"<circle cx=\"12\" cy=\"12\" r=\"1\" />","download-cloud":"<path d=\"M12 13v8l-4-4\" /><path d=\"m12 21 4-4\" /><path d=\"M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284\" />","download":"<path d=\"M12 15V3\" /><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" /><path d=\"m7 10 5 5 5-5\" />","drafting-compass":"<path d=\"m12.99 6.74 1.93 3.44\" /><path d=\"M19.136 12a10 10 0 0 1-14.271 0\" /><path d=\"m21 21-2.16-3.84\" /><path d=\"m3 21 8.02-14.26\" /><circle cx=\"12\" cy=\"5\" r=\"2\" />","drama":"<path d=\"M10 11h.01\" /><path d=\"M14 6h.01\" /><path d=\"M18 6h.01\" /><path d=\"M6.5 13.1h.01\" /><path d=\"M22 5c0 9-4 12-6 12s-6-3-6-12c0-2 2-3 6-3s6 1 6 3\" /><path d=\"M17.4 9.9c-.8.8-2 .8-2.8 0\" /><path d=\"M10.1 7.1C9 7.2 7.7 7.7 6 8.6c-3.5 2-4.7 3.9-3.7 5.6 4.5 7.8 9.5 8.4 11.2 7.4.9-.5 1.9-2.1 1.9-4.7\" /><path d=\"M9.1 16.5c.3-1.1 1.4-1.7 2.4-1.4\" />","drill":"<path d=\"M10 18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a3 3 0 0 1-3-3 1 1 0 0 1 1-1z\" /><path d=\"M13 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1l-.81 3.242a1 1 0 0 1-.97.758H8\" /><path d=\"M14 4h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3\" /><path d=\"M18 6h4\" /><path d=\"m5 10-2 8\" /><path d=\"m7 18 2-8\" />","drone":"<path d=\"M10 10 7 7\" /><path d=\"m10 14-3 3\" /><path d=\"m14 10 3-3\" /><path d=\"m14 14 3 3\" /><path d=\"M14.205 4.139a4 4 0 1 1 5.439 5.863\" /><path d=\"M19.637 14a4 4 0 1 1-5.432 5.868\" /><path d=\"M4.367 10a4 4 0 1 1 5.438-5.862\" /><path d=\"M9.795 19.862a4 4 0 1 1-5.429-5.873\" /><rect x=\"10\" y=\"8\" width=\"4\" height=\"8\" rx=\"1\" />","droplet-off":"<path d=\"M18.715 13.186C18.29 11.858 17.384 10.607 16 9.5c-2-1.6-3.5-4-4-6.5a10.7 10.7 0 0 1-.884 2.586\" /><path d=\"m2 2 20 20\" /><path d=\"M8.795 8.797A11 11 0 0 1 8 9.5C6 11.1 5 13 5 15a7 7 0 0 0 13.222 3.208\" />","droplet":"<path d=\"M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z\" />","droplets":"<path d=\"M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z\" /><path d=\"M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97\" />","drum":"<path d=\"m2 2 8 8\" /><path d=\"m22 2-8 8\" /><ellipse cx=\"12\" cy=\"9\" rx=\"10\" ry=\"5\" /><path d=\"M7 13.4v7.9\" /><path d=\"M12 14v8\" /><path d=\"M17 13.4v7.9\" /><path d=\"M2 9v8a10 5 0 0 0 20 0V9\" />","drumstick":"<path d=\"M15.4 15.63a7.875 6 135 1 1 6.23-6.23 4.5 3.43 135 0 0-6.23 6.23\" /><path d=\"m8.29 12.71-2.6 2.6a2.5 2.5 0 1 0-1.65 4.65A2.5 2.5 0 1 0 8.7 18.3l2.59-2.59\" />","dumbbell":"<path d=\"M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z\" /><path d=\"m2.5 21.5 1.4-1.4\" /><path d=\"m20.1 3.9 1.4-1.4\" /><path d=\"M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z\" /><path d=\"m9.6 14.4 4.8-4.8\" />","ear-off":"<path d=\"M6 18.5a3.5 3.5 0 1 0 7 0c0-1.57.92-2.52 2.04-3.46\" /><path d=\"M6 8.5c0-.75.13-1.47.36-2.14\" /><path d=\"M8.8 3.15A6.5 6.5 0 0 1 19 8.5c0 1.63-.44 2.81-1.09 3.76\" /><path d=\"M12.5 6A2.5 2.5 0 0 1 15 8.5M10 13a2 2 0 0 0 1.82-1.18\" /><line x1=\"2\" x2=\"22\" y1=\"2\" y2=\"22\" />","ear":"<path d=\"M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0\" /><path d=\"M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4\" />","earth-lock":"<path d=\"M7 3.34V5a3 3 0 0 0 3 3\" /><path d=\"M11 21.95V18a2 2 0 0 0-2-2 2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05\" /><path d=\"M21.54 15H17a2 2 0 0 0-2 2v4.54\" /><path d=\"M12 2a10 10 0 1 0 9.54 13\" /><path d=\"M20 6V4a2 2 0 1 0-4 0v2\" /><rect width=\"8\" height=\"5\" x=\"14\" y=\"6\" rx=\"1\" />","earth":"<path d=\"M21.54 15H17a2 2 0 0 0-2 2v4.54\" /><path d=\"M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17\" /><path d=\"M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","eclipse":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 2a7 7 0 1 0 10 10\" />","edit-2":"<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\" />","edit-3":"<path d=\"M13 21h8\" /><path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\" />","edit":"<path d=\"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\" /><path d=\"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z\" />","egg-fried":"<circle cx=\"11.5\" cy=\"12.5\" r=\"3.5\" /><path d=\"M3 8c0-3.5 2.5-6 6.5-6 5 0 4.83 3 7.5 5s5 2 5 6c0 4.5-2.5 6.5-7 6.5-2.5 0-2.5 2.5-6 2.5s-7-2-7-5.5c0-3 1.5-3 1.5-5C3.5 10 3 9 3 8Z\" />","egg-off":"<path d=\"m2 2 20 20\" /><path d=\"M20 14.347V14c0-6-4-12-8-12-1.078 0-2.157.436-3.157 1.19\" /><path d=\"M6.206 6.21C4.871 8.4 4 11.2 4 14a8 8 0 0 0 14.568 4.568\" />","egg":"<path d=\"M12 2C8 2 4 8 4 14a8 8 0 0 0 16 0c0-6-4-12-8-12\" />","eject":"<path d=\"M4 13a1 1 0 0 1-.72-1.695l7.257-7.668a2 2 0 0 1 2.926 0l7.256 7.668A1 1 0 0 1 20 13z\" /><rect x=\"3\" y=\"17\" width=\"18\" height=\"4\" rx=\"1\" />","ellipse":"<ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"6\" />","ellipsis-vertical":"<circle cx=\"12\" cy=\"12\" r=\"1\" /><circle cx=\"12\" cy=\"5\" r=\"1\" /><circle cx=\"12\" cy=\"19\" r=\"1\" />","ellipsis":"<circle cx=\"12\" cy=\"12\" r=\"1\" /><circle cx=\"19\" cy=\"12\" r=\"1\" /><circle cx=\"5\" cy=\"12\" r=\"1\" />","engine":"<path d=\"M10 3h6\" /><path d=\"M13 3v4\" /><path d=\"M2 10v6\" /><path d=\"M2 13h4\" /><path d=\"M6 16a2 2 0 002 2h1a2 2 0 011.6.8l.3.4a2 2 0 001.6.8h2.264a2 2 0 001.789-1.106l1.67-3.341a1 1 0 01.895-.553H21a1 1 0 001-1v-4a1 1 0 00-1-1h-3.5a1 1 0 01-.8-.4l-.9-1.2A1 1 0 0015 7h-4a1 1 0 00-.8.4l-.9 1.2a1 1 0 01-.8.4H7a1 1 0 00-1 1z\" />","equal-approximately-not":"<path d=\"M5 15a6.5 6.5 0 0 1 7 0 6.5 6.5 0 0 0 7 0\" /><path d=\"M5 9a6.5 6.5 0 0 1 7 0 6.5 6.5 0 0 0 7 0\" /><line x1=\"19\" x2=\"5\" y1=\"5\" y2=\"19\" />","equal-approximately":"<path d=\"M5 15a6.5 6.5 0 0 1 7 0 6.5 6.5 0 0 0 7 0\" /><path d=\"M5 9a6.5 6.5 0 0 1 7 0 6.5 6.5 0 0 0 7 0\" />","equal-not":"<line x1=\"5\" x2=\"19\" y1=\"9\" y2=\"9\" /><line x1=\"5\" x2=\"19\" y1=\"15\" y2=\"15\" /><line x1=\"19\" x2=\"5\" y1=\"5\" y2=\"19\" />","equal-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M7 10h10\" /><path d=\"M7 14h10\" />","equal":"<line x1=\"5\" x2=\"19\" y1=\"9\" y2=\"9\" /><line x1=\"5\" x2=\"19\" y1=\"15\" y2=\"15\" />","eraser":"<path d=\"M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21\" /><path d=\"m5.082 11.09 8.828 8.828\" />","ethernet-port":"<path d=\"M10 8v1\" /><path d=\"M14 8v1\" /><path d=\"M18 8v1\" /><path d=\"M19 17a2 2 0 00-1.765 1.059l-.47.882A2 2 0 0115 20H9a2 2 0 01-1.765-1.059l-.47-.882A2 2 0 005 17H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v9a2 2 0 01-2 2z\" /><path d=\"M6 8v1\" />","euro":"<path d=\"M4 10h12\" /><path d=\"M4 14h9\" /><path d=\"M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2\" />","ev-charger":"<path d=\"M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5\" /><path d=\"M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16\" /><path d=\"M2 21h13\" /><path d=\"M3 7h11\" /><path d=\"m9 11-2 3h3l-2 3\" />","expand":"<path d=\"m15 15 6 6\" /><path d=\"m15 9 6-6\" /><path d=\"M21 16v5h-5\" /><path d=\"M21 8V3h-5\" /><path d=\"M3 16v5h5\" /><path d=\"m3 21 6-6\" /><path d=\"M3 8V3h5\" /><path d=\"M9 9 3 3\" />","external-link":"<path d=\"M15 3h6v6\" /><path d=\"M10 14 21 3\" /><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\" />","eye-closed":"<path d=\"m15 18-.722-3.25\" /><path d=\"M2 8a10.645 10.645 0 0 0 20 0\" /><path d=\"m20 15-1.726-2.05\" /><path d=\"m4 15 1.726-2.05\" /><path d=\"m9 18 .722-3.25\" />","eye-dashed":"<path d=\"M13.054 18.946a11 11 0 0 1-2.11 0\" /><path d=\"M13.054 5.054a11 11 0 0 0-2.11-.001\" /><path d=\"M17.072 6.274a11 11 0 0 1 1.753 1.173\" /><path d=\"M18.825 16.552a11 11 0 0 1-1.753 1.174\" /><path d=\"M2.514 13.303a11 11 0 0 1-.452-.954 1 1 0 0 1 0-.697 11 11 0 0 1 .45-.955\" /><path d=\"M21.485 10.697a11 11 0 0 1 .453.955 1 1 0 0 1 0 .697 11 11 0 0 1-.453.954\" /><path d=\"M5.173 7.448a11 11 0 0 1 1.753-1.174\" /><path d=\"M6.926 17.726a11 11 0 0 1-1.753-1.174\" /><circle cx=\"12\" cy=\"12\" r=\"3\" />","eye-off":"<path d=\"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49\" /><path d=\"M14.084 14.158a3 3 0 0 1-4.242-4.242\" /><path d=\"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143\" /><path d=\"m2 2 20 20\" />","eye":"<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\" /><circle cx=\"12\" cy=\"12\" r=\"3\" />","face-angry":"<path d=\"M15 12v-1.584\" /><path d=\"M17 10a5 5 0 00-3 1\" /><path d=\"M7 10a5 5 0 013 1\" /><path d=\"M9 12v-1.584\" /><path d=\"M9 17a5 5 0 016.001 0\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","face-expressionless":"<path d=\"M14 10h2\" /><path d=\"M8 10h2\" /><path d=\"M8 16h8\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","face-grinning":"<path d=\"M15 10V9\" /><path d=\"M7.084 14.302a5.12 5.12 0 009.833 0 .24.24 0 00-.235-.302H7.32a.24.24 0 00-.235.302\" /><path d=\"M9 10V9\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","face-neutral":"<path d=\"M15 10V9\" /><path d=\"M8 16h8\" /><path d=\"M9 10V9\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","face-slightly-frowning":"<path d=\"M15 10V9\" /><path d=\"M9 10V9\" /><path d=\"M9 16a5 5 0 016 0\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","face-slightly-smiling-plus":"<path d=\"M13.267 2.08a10 10 0 108.653 8.653\" /><path d=\"M15 10V9\" /><path d=\"M16 5h6\" /><path d=\"M16.472 15a6 6 0 01-8.943 0\" /><path d=\"M19 2v6\" /><path d=\"M9 10V9\" />","face-slightly-smiling":"<path d=\"M15 10V9\" /><path d=\"M16.472 15a6 6 0 01-8.943 0\" /><path d=\"M9 10V9\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","factory":"<path d=\"M12 16h.01\" /><path d=\"M16 16h.01\" /><path d=\"M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z\" /><path d=\"M8 16h.01\" />","fan":"<path d=\"M10.827 16.379a6.082 6.082 0 0 1-8.618-7.002l5.412 1.45a6.082 6.082 0 0 1 7.002-8.618l-1.45 5.412a6.082 6.082 0 0 1 8.618 7.002l-5.412-1.45a6.082 6.082 0 0 1-7.002 8.618l1.45-5.412Z\" /><path d=\"M12 12v.01\" />","fast-forward":"<path d=\"M12 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 12 18z\" /><path d=\"M2 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 2 18z\" />","faucet":"<path d=\"M10.083 5.428 5.57 4.083a2 2 0 10.001 3.834l4.512-1.345\" /><path d=\"M12 8v3\" /><path d=\"m13.917 5.428 4.511-1.345a2 2 0 110 3.834l-4.51-1.345\" /><path d=\"M18 17v-4.006\" /><path d=\"M22 11v8\" /><path d=\"M22 12h-3a1 1 0 00-1 .994h-2.539a4 4 0 00-6.915-.012L7 13a5 5 0 00-5 5v1a1 1 0 001 1h2a1 1 0 001-1v-1a1 1 0 01.995-1l1.552.018a4 4 0 006.907 0L18 17a1 1 0 001 1h3\" /><circle cx=\"12\" cy=\"6\" r=\"2\" />","feather":"<path d=\"M14.086 18.412A2 2 0 0112.67 19H5v-7.672a2 2 0 01.586-1.414L11.75 3.75a6 6 0 118.49 8.49z\" /><path d=\"M16 8 2 22\" /><path d=\"M17.488 15H9\" />","fence":"<path d=\"M4 3 2 5v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z\" /><path d=\"M6 8h4\" /><path d=\"M6 18h4\" /><path d=\"m12 3-2 2v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z\" /><path d=\"M14 8h4\" /><path d=\"M14 18h4\" /><path d=\"m20 3-2 2v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z\" />","ferris-wheel":"<circle cx=\"12\" cy=\"12\" r=\"2\" /><path d=\"M12 2v4\" /><path d=\"m6.8 15-3.5 2\" /><path d=\"m20.7 7-3.5 2\" /><path d=\"M6.8 9 3.3 7\" /><path d=\"m20.7 17-3.5-2\" /><path d=\"m9 22 3-8 3 8\" /><path d=\"M8 22h8\" /><path d=\"M18 18.7a9 9 0 1 0-12 0\" />","file-archive":"<path d=\"M13.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v11.5\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M8 12v-1\" /><path d=\"M8 18v-2\" /><path d=\"M8 7V6\" /><circle cx=\"8\" cy=\"20\" r=\"2\" />","file-audio-2":"<path d=\"M4 6.835V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-.343\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M2 19a2 2 0 0 1 4 0v1a2 2 0 0 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 0 1-4 0v-1a2 2 0 0 1 4 0\" />","file-audio":"<path d=\"M4 6.835V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-.343\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M2 19a2 2 0 0 1 4 0v1a2 2 0 0 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 0 1-4 0v-1a2 2 0 0 1 4 0\" />","file-axis-3-d":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m8 18 4-4\" /><path d=\"M8 10v8h8\" />","file-axis-3d":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m8 18 4-4\" /><path d=\"M8 10v8h8\" />","file-badge-2":"<path d=\"M13 22h5a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.3\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m7.69 16.479 1.29 4.88a.5.5 0 0 1-.698.591l-1.843-.849a1 1 0 0 0-.879.001l-1.846.85a.5.5 0 0 1-.692-.593l1.29-4.88\" /><circle cx=\"6\" cy=\"14\" r=\"3\" />","file-badge":"<path d=\"M13 22h5a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.3\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m7.69 16.479 1.29 4.88a.5.5 0 0 1-.698.591l-1.843-.849a1 1 0 0 0-.879.001l-1.846.85a.5.5 0 0 1-.692-.593l1.29-4.88\" /><circle cx=\"6\" cy=\"14\" r=\"3\" />","file-bar-chart-2":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M8 18v-1\" /><path d=\"M12 18v-6\" /><path d=\"M16 18v-3\" />","file-bar-chart":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M8 18v-2\" /><path d=\"M12 18v-4\" /><path d=\"M16 18v-6\" />","file-box":"<path d=\"M14 2v5a1 1 0 001 1h5\" /><path d=\"M14.692 22H18a2 2 0 002-2V8a2.4 2.4 0 00-.706-1.706l-3.588-3.588A2.4 2.4 0 0014 2H6a2 2 0 00-2 2v3.804\" /><path d=\"M2.264 13.752 7 16.5l4.737-2.748\" /><path d=\"M2.995 13.014A2 2 0 002 14.744v3.516a2 2 0 00.996 1.73l3 1.74a2 2 0 002.008 0l3-1.74A2 2 0 0012 18.26v-3.517a2 2 0 00-.995-1.73l-3-1.742a2 2 0 00-1.892-.064z\" /><path d=\"M7 16.5V22\" />","file-braces-corner":"<path d=\"M14 22h4a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v6\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M5 14a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1 1 1 0 0 1 1 1v2a1 1 0 0 0 1 1\" /><path d=\"M9 22a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-2a1 1 0 0 0-1-1\" />","file-braces":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1\" /><path d=\"M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1\" />","file-chart-column-increasing":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M8 18v-2\" /><path d=\"M12 18v-4\" /><path d=\"M16 18v-6\" />","file-chart-column":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M8 18v-1\" /><path d=\"M12 18v-6\" /><path d=\"M16 18v-3\" />","file-chart-line":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m16 13-3.5 3.5-2-2L8 17\" />","file-chart-pie":"<path d=\"M15.941 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.704l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.512\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M4.017 11.512a6 6 0 1 0 8.466 8.475\" /><path d=\"M9 16a1 1 0 0 1-1-1v-4c0-.552.45-1.008.995-.917a6 6 0 0 1 4.922 4.922c.091.544-.365.995-.917.995z\" />","file-check-2":"<path d=\"M10.5 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v6\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m14 20 2 2 4-4\" />","file-check-corner":"<path d=\"M10.5 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v6\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m14 20 2 2 4-4\" />","file-check":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m9 15 2 2 4-4\" />","file-clock":"<path d=\"M16 22h2a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v2.85\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M8 14v2.2l1.6 1\" /><circle cx=\"8\" cy=\"16\" r=\"6\" />","file-code-2":"<path d=\"M4 12.15V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3.35\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m5 16-3 3 3 3\" /><path d=\"m9 22 3-3-3-3\" />","file-code-corner":"<path d=\"M4 12.15V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3.35\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m5 16-3 3 3 3\" /><path d=\"m9 22 3-3-3-3\" />","file-code":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M10 12.5 8 15l2 2.5\" /><path d=\"m14 12.5 2 2.5-2 2.5\" />","file-cog-2":"<path d=\"M15 8a1 1 0 0 1-1-1V2a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8z\" /><path d=\"M20 8v12a2 2 0 0 1-2 2h-4.182\" /><path d=\"m3.305 19.53.923-.382\" /><path d=\"M4 10.592V4a2 2 0 0 1 2-2h8\" /><path d=\"m4.228 16.852-.924-.383\" /><path d=\"m5.852 15.228-.383-.923\" /><path d=\"m5.852 20.772-.383.924\" /><path d=\"m8.148 15.228.383-.923\" /><path d=\"m8.53 21.696-.382-.924\" /><path d=\"m9.773 16.852.922-.383\" /><path d=\"m9.773 19.148.922.383\" /><circle cx=\"7\" cy=\"18\" r=\"3\" />","file-cog":"<path d=\"M15 8a1 1 0 0 1-1-1V2a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8z\" /><path d=\"M20 8v12a2 2 0 0 1-2 2h-4.182\" /><path d=\"m3.305 19.53.923-.382\" /><path d=\"M4 10.592V4a2 2 0 0 1 2-2h8\" /><path d=\"m4.228 16.852-.924-.383\" /><path d=\"m5.852 15.228-.383-.923\" /><path d=\"m5.852 20.772-.383.924\" /><path d=\"m8.148 15.228.383-.923\" /><path d=\"m8.53 21.696-.382-.924\" /><path d=\"m9.773 16.852.922-.383\" /><path d=\"m9.773 19.148.922.383\" /><circle cx=\"7\" cy=\"18\" r=\"3\" />","file-diff":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M9 10h6\" /><path d=\"M12 13V7\" /><path d=\"M9 17h6\" />","file-digit":"<path d=\"M4 12V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M10 16h2v6\" /><path d=\"M10 22h4\" /><rect x=\"2\" y=\"16\" width=\"4\" height=\"6\" rx=\"2\" />","file-down":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M12 18v-6\" /><path d=\"m9 15 3 3 3-3\" />","file-edit":"<path d=\"M12.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v9.34\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M10.378 12.622a1 1 0 0 1 3 3.003L8.36 20.637a2 2 0 0 1-.854.506l-2.867.837a.5.5 0 0 1-.62-.62l.836-2.869a2 2 0 0 1 .506-.853z\" />","file-exclamation-point":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M12 9v4\" /><path d=\"M12 17h.01\" />","file-headphone":"<path d=\"M4 6.835V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-.343\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M2 19a2 2 0 0 1 4 0v1a2 2 0 0 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 0 1-4 0v-1a2 2 0 0 1 4 0\" />","file-heart":"<path d=\"M13 22h5a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v7\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M3.62 18.8A2.25 2.25 0 1 1 7 15.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a1 1 0 0 1-1.507 0z\" />","file-image":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><circle cx=\"10\" cy=\"12\" r=\"2\" /><path d=\"m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22\" />","file-input":"<path d=\"M4 11V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M2 15h10\" /><path d=\"m9 18 3-3-3-3\" />","file-json-2":"<path d=\"M14 22h4a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v6\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M5 14a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1 1 1 0 0 1 1 1v2a1 1 0 0 0 1 1\" /><path d=\"M9 22a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-2a1 1 0 0 0-1-1\" />","file-json":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1\" /><path d=\"M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1\" />","file-key-2":"<path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M4 12v6\" /><path d=\"M4 14h2\" /><path d=\"M9.65 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v4\" /><circle cx=\"4\" cy=\"20\" r=\"2\" />","file-key":"<path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M4 12v6\" /><path d=\"M4 14h2\" /><path d=\"M9.65 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v4\" /><circle cx=\"4\" cy=\"20\" r=\"2\" />","file-line-chart":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m16 13-3.5 3.5-2-2L8 17\" />","file-lock-2":"<path d=\"M4 9.8V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M9 17v-2a2 2 0 0 0-4 0v2\" /><rect width=\"8\" height=\"5\" x=\"3\" y=\"17\" rx=\"1\" />","file-lock":"<path d=\"M4 9.8V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M9 17v-2a2 2 0 0 0-4 0v2\" /><rect width=\"8\" height=\"5\" x=\"3\" y=\"17\" rx=\"1\" />","file-minus-2":"<path d=\"M20 14V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M14 18h6\" />","file-minus-corner":"<path d=\"M20 14V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M14 18h6\" />","file-minus":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M9 15h6\" />","file-music":"<path d=\"M11.65 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v10.35\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M8 20v-7l3 1.474\" /><circle cx=\"6\" cy=\"20\" r=\"2\" />","file-output":"<path d=\"M4.226 20.925A2 2 0 0 0 6 22h12a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.127\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m5 11-3 3\" /><path d=\"m5 17-3-3h10\" />","file-pen-line":"<path d=\"M14.364 13.634a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506l4.013-4.009a1 1 0 0 0-3.004-3.004z\" /><path d=\"M14.487 7.858A1 1 0 0 1 14 7V2\" /><path d=\"M20 19.645V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l2.516 2.516\" /><path d=\"M8 18h1\" />","file-pen":"<path d=\"M12.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v9.34\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M10.378 12.622a1 1 0 0 1 3 3.003L8.36 20.637a2 2 0 0 1-.854.506l-2.867.837a.5.5 0 0 1-.62-.62l.836-2.869a2 2 0 0 1 .506-.853z\" />","file-pie-chart":"<path d=\"M15.941 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.704l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.512\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M4.017 11.512a6 6 0 1 0 8.466 8.475\" /><path d=\"M9 16a1 1 0 0 1-1-1v-4c0-.552.45-1.008.995-.917a6 6 0 0 1 4.922 4.922c.091.544-.365.995-.917.995z\" />","file-play":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M15.033 13.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56v-4.704a.645.645 0 0 1 .967-.56z\" />","file-plus-2":"<path d=\"M11.35 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5.35\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M14 19h6\" /><path d=\"M17 16v6\" />","file-plus-corner":"<path d=\"M11.35 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5.35\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M14 19h6\" /><path d=\"M17 16v6\" />","file-plus":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M9 15h6\" /><path d=\"M12 18v-6\" />","file-question-mark":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M12 17h.01\" /><path d=\"M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3\" />","file-question":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M12 17h.01\" /><path d=\"M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3\" />","file-scan":"<path d=\"M20 10V8a2.4 2.4 0 0 0-.706-1.704l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h4.35\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M16 14a2 2 0 0 0-2 2\" /><path d=\"M16 22a2 2 0 0 1-2-2\" /><path d=\"M20 14a2 2 0 0 1 2 2\" /><path d=\"M20 22a2 2 0 0 0 2-2\" />","file-search-2":"<path d=\"M11.1 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.589 3.588A2.4 2.4 0 0 1 20 8v3.25\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m21 22-2.88-2.88\" /><circle cx=\"16\" cy=\"17\" r=\"3\" />","file-search-corner":"<path d=\"M11.1 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.589 3.588A2.4 2.4 0 0 1 20 8v3.25\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m21 22-2.88-2.88\" /><circle cx=\"16\" cy=\"17\" r=\"3\" />","file-search":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><circle cx=\"11.5\" cy=\"14.5\" r=\"2.5\" /><path d=\"M13.3 16.3 15 18\" />","file-signal":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M8 15h.01\" /><path d=\"M11.5 13.5a2.5 2.5 0 0 1 0 3\" /><path d=\"M15 12a5 5 0 0 1 0 6\" />","file-signature":"<path d=\"M14.364 13.634a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506l4.013-4.009a1 1 0 0 0-3.004-3.004z\" /><path d=\"M14.487 7.858A1 1 0 0 1 14 7V2\" /><path d=\"M20 19.645V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l2.516 2.516\" /><path d=\"M8 18h1\" />","file-sliders":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M8 12h8\" /><path d=\"M10 11v2\" /><path d=\"M8 17h8\" /><path d=\"M14 16v2\" />","file-spreadsheet":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M8 13h2\" /><path d=\"M14 13h2\" /><path d=\"M8 17h2\" /><path d=\"M14 17h2\" />","file-stack":"<path d=\"M11 21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1\" /><path d=\"M16 16a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1\" /><path d=\"M21 6a2 2 0 0 0-.586-1.414l-2-2A2 2 0 0 0 17 2h-3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1z\" />","file-symlink":"<path d=\"M4 11V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h7\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m10 18 3-3-3-3\" />","file-terminal":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m8 16 2-2-2-2\" /><path d=\"M12 18h4\" />","file-text":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M10 9H8\" /><path d=\"M16 13H8\" /><path d=\"M16 17H8\" />","file-type-2":"<path d=\"M12 22h6a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v6\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M3 16v-1.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5V16\" /><path d=\"M6 22h2\" /><path d=\"M7 14v8\" />","file-type-corner":"<path d=\"M12 22h6a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v6\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M3 16v-1.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5V16\" /><path d=\"M6 22h2\" /><path d=\"M7 14v8\" />","file-type":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M11 18h2\" /><path d=\"M12 12v6\" /><path d=\"M9 13v-.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v.5\" />","file-up":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M12 12v6\" /><path d=\"m15 15-3-3-3 3\" />","file-user":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M16 22a4 4 0 0 0-8 0\" /><circle cx=\"12\" cy=\"15\" r=\"3\" />","file-video-2":"<path d=\"M4 12V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m10 17.843 3.033-1.755a.64.64 0 0 1 .967.56v4.704a.65.65 0 0 1-.967.56L10 20.157\" /><rect width=\"7\" height=\"6\" x=\"3\" y=\"16\" rx=\"1\" />","file-video-camera":"<path d=\"M4 12V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m10 17.843 3.033-1.755a.64.64 0 0 1 .967.56v4.704a.65.65 0 0 1-.967.56L10 20.157\" /><rect width=\"7\" height=\"6\" x=\"3\" y=\"16\" rx=\"1\" />","file-video":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M15.033 13.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56v-4.704a.645.645 0 0 1 .967-.56z\" />","file-volume-2":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M8 15h.01\" /><path d=\"M11.5 13.5a2.5 2.5 0 0 1 0 3\" /><path d=\"M15 12a5 5 0 0 1 0 6\" />","file-volume":"<path d=\"M4 11.55V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-1.95\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M12 15a5 5 0 0 1 0 6\" /><path d=\"M8 14.502a.5.5 0 0 0-.826-.381l-1.893 1.631a1 1 0 0 1-.651.243H3.5a.5.5 0 0 0-.5.501v3.006a.5.5 0 0 0 .5.501h1.129a1 1 0 0 1 .652.243l1.893 1.633a.5.5 0 0 0 .826-.38z\" />","file-warning":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M12 9v4\" /><path d=\"M12 17h.01\" />","file-x-2":"<path d=\"M11 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m15 17 5 5\" /><path d=\"m20 17-5 5\" />","file-x-corner":"<path d=\"M11 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m15 17 5 5\" /><path d=\"m20 17-5 5\" />","file-x":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"m14.5 12.5-5 5\" /><path d=\"m9.5 12.5 5 5\" />","file":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" />","files":"<path d=\"M15 2h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8\" /><path d=\"M16.706 2.706A2.4 2.4 0 0 0 15 2v5a1 1 0 0 0 1 1h5a2.4 2.4 0 0 0-.706-1.706z\" /><path d=\"M5 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 1.732-1\" />","film":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M7 3v18\" /><path d=\"M3 7.5h4\" /><path d=\"M3 12h18\" /><path d=\"M3 16.5h4\" /><path d=\"M17 3v18\" /><path d=\"M17 7.5h4\" /><path d=\"M17 16.5h4\" />","filter-x":"<path d=\"M12.531 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14v6a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341l.427-.473\" /><path d=\"m16.5 3.5 5 5\" /><path d=\"m21.5 3.5-5 5\" />","filter":"<path d=\"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z\" />","fingerprint-pattern":"<path d=\"M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4\" /><path d=\"M14 13.12c0 2.38 0 6.38-1 8.88\" /><path d=\"M17.29 21.02c.12-.6.43-2.3.5-3.02\" /><path d=\"M2 12a10 10 0 0 1 18-6\" /><path d=\"M2 16h.01\" /><path d=\"M21.8 16c.2-2 .131-5.354 0-6\" /><path d=\"M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2\" /><path d=\"M8.65 22c.21-.66.45-1.32.57-2\" /><path d=\"M9 6.8a6 6 0 0 1 9 5.2v2\" />","fingerprint":"<path d=\"M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4\" /><path d=\"M14 13.12c0 2.38 0 6.38-1 8.88\" /><path d=\"M17.29 21.02c.12-.6.43-2.3.5-3.02\" /><path d=\"M2 12a10 10 0 0 1 18-6\" /><path d=\"M2 16h.01\" /><path d=\"M21.8 16c.2-2 .131-5.354 0-6\" /><path d=\"M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2\" /><path d=\"M8.65 22c.21-.66.45-1.32.57-2\" /><path d=\"M9 6.8a6 6 0 0 1 9 5.2v2\" />","fire-extinguisher":"<path d=\"M15 6.5V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3.5\" /><path d=\"M9 18h8\" /><path d=\"M18 3h-3\" /><path d=\"M11 3a6 6 0 0 0-6 6v11\" /><path d=\"M5 13h4\" /><path d=\"M17 10a4 4 0 0 0-8 0v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2Z\" />","fish-off":"<path d=\"M18 12.47v.03m0-.5v.47m-.475 5.056A6.744 6.744 0 0 1 15 18c-3.56 0-7.56-2.53-8.5-6 .348-1.28 1.114-2.433 2.121-3.38m3.444-2.088A8.802 8.802 0 0 1 15 6c3.56 0 6.06 2.54 7 6-.309 1.14-.786 2.177-1.413 3.058\" /><path d=\"M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33m7.48-4.372A9.77 9.77 0 0 1 16 6.07m0 11.86a9.77 9.77 0 0 1-1.728-3.618\" /><path d=\"m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98M8.53 3h5.27a2 2 0 0 1 1.98 1.67l.23 1.4M2 2l20 20\" />","fish-symbol":"<path d=\"M2 16s9-15 20-4C11 23 2 8 2 8\" />","fish":"<path d=\"M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z\" /><path d=\"M18 12v.5\" /><path d=\"M16 17.93a9.77 9.77 0 0 1 0-11.86\" /><path d=\"M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33\" /><path d=\"M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4\" /><path d=\"m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98\" />","fishing-hook":"<path d=\"m17.586 11.414-5.93 5.93a1 1 0 0 1-8-8l3.137-3.137a.707.707 0 0 1 1.207.5V10\" /><path d=\"M20.414 8.586 22 7\" /><circle cx=\"19\" cy=\"10\" r=\"2\" />","fishing-rod":"<path d=\"M4 11h1\" /><path d=\"M8 15a2 2 0 0 1-4 0V3a1 1 0 0 1 1-1h.5C14 2 20 9 20 18v4\" /><circle cx=\"18\" cy=\"18\" r=\"2\" />","flag-off":"<path d=\"M16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528\" /><path d=\"m2 2 20 20\" /><path d=\"M4 22V4\" /><path d=\"M7.656 2H8c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10.347\" />","flag-triangle-left":"<path d=\"M18 22V2.8a.8.8 0 0 0-1.17-.71L5.45 7.78a.8.8 0 0 0 0 1.44L18 15.5\" />","flag-triangle-right":"<path d=\"M6 22V2.8a.8.8 0 0 1 1.17-.71l11.38 5.69a.8.8 0 0 1 0 1.44L6 15.5\" />","flag":"<path d=\"M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528\" />","flame-kindling":"<path d=\"M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 17 10a5 5 0 1 1-10 0c0-.3 0-.6.1-.9a2 2 0 1 0 3.3-2C8 4.5 11 2 12 2Z\" /><path d=\"m5 22 14-4\" /><path d=\"m5 18 14 4\" />","flame":"<path d=\"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4\" />","flashlight-off":"<path d=\"M11.652 6H18\" /><path d=\"M12 13v1\" /><path d=\"M16 16v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-8a4 4 0 0 0-.8-2.4l-.6-.8A3 3 0 0 1 6 7V6\" /><path d=\"m2 2 20 20\" /><path d=\"M7.649 2H17a1 1 0 0 1 1 1v4a3 3 0 0 1-.6 1.8l-.6.8a4 4 0 0 0-.55 1.007\" />","flashlight":"<path d=\"M12 13v1\" /><path d=\"M17 2a1 1 0 0 1 1 1v4a3 3 0 0 1-.6 1.8l-.6.8A4 4 0 0 0 16 12v8a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-8a4 4 0 0 0-.8-2.4l-.6-.8A3 3 0 0 1 6 7V3a1 1 0 0 1 1-1z\" /><path d=\"M6 6h12\" />","flask-conical-off":"<path d=\"M10 2v2.343\" /><path d=\"M14 2v6.343\" /><path d=\"m2 2 20 20\" /><path d=\"M20 20a2 2 0 0 1-2 2H6a2 2 0 0 1-1.755-2.96l5.227-9.563\" /><path d=\"M6.453 15H15\" /><path d=\"M8.5 2h7\" />","flask-conical":"<path d=\"M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2\" /><path d=\"M6.453 15h11.094\" /><path d=\"M8.5 2h7\" />","flask-round":"<path d=\"M10 2v6.292a7 7 0 1 0 4 0V2\" /><path d=\"M5 15h14\" /><path d=\"M8.5 2h7\" />","flip-horizontal-2":"<path d=\"M10 12H8\" /><path d=\"M16 12h-2\" /><path d=\"M22 12h-2\" /><path d=\"M4 12H2\" /><path d=\"M7.298 20.288A1 1 0 008 22h8a1 1 0 00.703-1.712l-3.991-3.99a1 1 0 00-1.424-.001z\" /><path d=\"M7.298 3.712A1 1 0 018 2h8a1 1 0 01.703 1.712l-3.991 3.99a1 1 0 01-1.424.001z\" />","flip-horizontal":"<path d=\"M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3\" /><path d=\"M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3\" /><path d=\"M12 20v2\" /><path d=\"M12 14v2\" /><path d=\"M12 8v2\" /><path d=\"M12 2v2\" />","flip-vertical-2":"<path d=\"M12 14v2\" /><path d=\"M12 20v2\" /><path d=\"M12 2v2\" /><path d=\"M12 8v2\" /><path d=\"M20.288 16.703A1 1 0 0022 16V8a1 1 0 00-1.712-.703l-3.99 3.991a1 1 0 00-.001 1.424z\" /><path d=\"M3.712 16.703A1 1 0 012 16V8a1 1 0 011.712-.703l3.99 3.991a1 1 0 01.001 1.424z\" />","flip-vertical":"<path d=\"M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3\" /><path d=\"M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3\" /><path d=\"M4 12H2\" /><path d=\"M10 12H8\" /><path d=\"M16 12h-2\" /><path d=\"M22 12h-2\" />","flower-2":"<path d=\"M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1\" /><circle cx=\"12\" cy=\"8\" r=\"2\" /><path d=\"M12 10v12\" /><path d=\"M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z\" /><path d=\"M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z\" />","flower":"<circle cx=\"12\" cy=\"12\" r=\"3\" /><path d=\"M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5\" /><path d=\"M12 7.5V9\" /><path d=\"M7.5 12H9\" /><path d=\"M16.5 12H15\" /><path d=\"M12 16.5V15\" /><path d=\"m8 8 1.88 1.88\" /><path d=\"M14.12 9.88 16 8\" /><path d=\"m8 16 1.88-1.88\" /><path d=\"M14.12 14.12 16 16\" />","focus":"<circle cx=\"12\" cy=\"12\" r=\"3\" /><path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /><path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" />","fold-horizontal":"<path d=\"M2 12h6\" /><path d=\"M22 12h-6\" /><path d=\"M12 2v2\" /><path d=\"M12 8v2\" /><path d=\"M12 14v2\" /><path d=\"M12 20v2\" /><path d=\"m19 9-3 3 3 3\" /><path d=\"m5 15 3-3-3-3\" />","fold-vertical":"<path d=\"M12 22v-6\" /><path d=\"M12 8V2\" /><path d=\"M4 12H2\" /><path d=\"M10 12H8\" /><path d=\"M16 12h-2\" /><path d=\"M22 12h-2\" /><path d=\"m15 19-3-3-3 3\" /><path d=\"m15 5-3 3-3-3\" />","folder-archive":"<circle cx=\"15\" cy=\"19\" r=\"2\" /><path d=\"M20.9 19.8A2 2 0 0 0 22 18V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h5.1\" /><path d=\"M15 11v-1\" /><path d=\"M15 17v-2\" />","folder-bookmark":"<path d=\"M12 6v7.751a.25.25 0 00.407.195l2.28-1.834a.5.5 0 01.627 0l2.28 1.834a.25.25 0 00.406-.195V6\" /><path d=\"M20 20a2 2 0 002-2V8a2 2 0 00-2-2h-7.9a2 2 0 01-1.69-.9L9.6 3.9A2 2 0 007.93 3H4a2 2 0 00-2 2v13a2 2 0 002 2z\" />","folder-check":"<path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\" /><path d=\"m9 13 2 2 4-4\" />","folder-clock":"<path d=\"M16 14v2.2l1.6 1\" /><path d=\"M7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2\" /><circle cx=\"16\" cy=\"16\" r=\"6\" />","folder-closed":"<path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\" /><path d=\"M2 10h20\" />","folder-code":"<path d=\"M10 10.5 8 13l2 2.5\" /><path d=\"m14 10.5 2 2.5-2 2.5\" /><path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z\" />","folder-cog-2":"<path d=\"M10.3 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.98a2 2 0 0 1 1.69.9l.66 1.2A2 2 0 0 0 12 6h8a2 2 0 0 1 2 2v3.3\" /><path d=\"m14.305 19.53.923-.382\" /><path d=\"m15.228 16.852-.923-.383\" /><path d=\"m16.852 15.228-.383-.923\" /><path d=\"m16.852 20.772-.383.924\" /><path d=\"m19.148 15.228.383-.923\" /><path d=\"m19.53 21.696-.382-.924\" /><path d=\"m20.772 16.852.924-.383\" /><path d=\"m20.772 19.148.924.383\" /><circle cx=\"18\" cy=\"18\" r=\"3\" />","folder-cog":"<path d=\"M10.3 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.98a2 2 0 0 1 1.69.9l.66 1.2A2 2 0 0 0 12 6h8a2 2 0 0 1 2 2v3.3\" /><path d=\"m14.305 19.53.923-.382\" /><path d=\"m15.228 16.852-.923-.383\" /><path d=\"m16.852 15.228-.383-.923\" /><path d=\"m16.852 20.772-.383.924\" /><path d=\"m19.148 15.228.383-.923\" /><path d=\"m19.53 21.696-.382-.924\" /><path d=\"m20.772 16.852.924-.383\" /><path d=\"m20.772 19.148.924.383\" /><circle cx=\"18\" cy=\"18\" r=\"3\" />","folder-dot":"<path d=\"M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z\" /><circle cx=\"12\" cy=\"13\" r=\"1\" />","folder-down":"<path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\" /><path d=\"M12 10v6\" /><path d=\"m15 13-3 3-3-3\" />","folder-edit":"<path d=\"M2 11.5V5a2 2 0 0 1 2-2h3.9c.7 0 1.3.3 1.7.9l.8 1.2c.4.6 1 .9 1.7.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9.5\" /><path d=\"M11.378 13.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\" />","folder-git-2":"<path d=\"M18 19a5 5 0 0 1-5-5v8\" /><path d=\"M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v5\" /><circle cx=\"13\" cy=\"12\" r=\"2\" /><circle cx=\"20\" cy=\"19\" r=\"2\" />","folder-git":"<circle cx=\"12\" cy=\"13\" r=\"2\" /><path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\" /><path d=\"M14 13h3\" /><path d=\"M7 13h3\" />","folder-heart":"<path d=\"M10.638 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v3.417\" /><path d=\"M14.62 18.8A2.25 2.25 0 1 1 18 15.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z\" />","folder-input":"<path d=\"M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1\" /><path d=\"M2 13h10\" /><path d=\"m9 16 3-3-3-3\" />","folder-kanban":"<path d=\"M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z\" /><path d=\"M8 10v4\" /><path d=\"M12 10v2\" /><path d=\"M16 10v6\" />","folder-key":"<path d=\"M13 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v1.36\" /><path d=\"M19 12v6\" /><path d=\"M19 14h2\" /><circle cx=\"19\" cy=\"20\" r=\"2\" />","folder-lock":"<rect width=\"8\" height=\"5\" x=\"14\" y=\"17\" rx=\"1\" /><path d=\"M10 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v2.5\" /><path d=\"M20 17v-2a2 2 0 1 0-4 0v2\" />","folder-minus":"<path d=\"M9 13h6\" /><path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\" />","folder-open-dot":"<path d=\"m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2\" /><circle cx=\"14\" cy=\"15\" r=\"1\" />","folder-open":"<path d=\"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2\" />","folder-output":"<path d=\"M2 7.5V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-1.5\" /><path d=\"M2 13h10\" /><path d=\"m5 10-3 3 3 3\" />","folder-pen":"<path d=\"M2 11.5V5a2 2 0 0 1 2-2h3.9c.7 0 1.3.3 1.7.9l.8 1.2c.4.6 1 .9 1.7.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9.5\" /><path d=\"M11.378 13.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\" />","folder-plus":"<path d=\"M12 10v6\" /><path d=\"M9 13h6\" /><path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\" />","folder-root":"<path d=\"M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z\" /><circle cx=\"12\" cy=\"13\" r=\"2\" /><path d=\"M12 15v5\" />","folder-search-2":"<circle cx=\"11.5\" cy=\"12.5\" r=\"2.5\" /><path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\" /><path d=\"M13.3 14.3 15 16\" />","folder-search":"<path d=\"M10.7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v4.1\" /><path d=\"m21 21-1.9-1.9\" /><circle cx=\"17\" cy=\"17\" r=\"3\" />","folder-symlink":"<path d=\"M2 9.35V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h7\" /><path d=\"m8 16 3-3-3-3\" />","folder-sync":"<path d=\"M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v.5\" /><path d=\"M12 10v4h4\" /><path d=\"m12 14 1.535-1.605a5 5 0 0 1 8 1.5\" /><path d=\"M22 22v-4h-4\" /><path d=\"m22 18-1.535 1.605a5 5 0 0 1-8-1.5\" />","folder-tree":"<path d=\"M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z\" /><path d=\"M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z\" /><path d=\"M3 5a2 2 0 0 0 2 2h3\" /><path d=\"M3 3v13a2 2 0 0 0 2 2h3\" />","folder-up":"<path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\" /><path d=\"M12 10v6\" /><path d=\"m9 13 3-3 3 3\" />","folder-x":"<path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\" /><path d=\"m9.5 10.5 5 5\" /><path d=\"m14.5 10.5-5 5\" />","folder":"<path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\" />","folders":"<path d=\"M20 5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2.5a1.5 1.5 0 0 1 1.2.6l.6.8a1.5 1.5 0 0 0 1.2.6z\" /><path d=\"M3 8.268a2 2 0 0 0-1 1.738V19a2 2 0 0 0 2 2h11a2 2 0 0 0 1.732-1\" />","footprints":"<path d=\"M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z\" /><path d=\"M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z\" /><path d=\"M16 17h4\" /><path d=\"M4 13h4\" />","fork-knife-crossed":"<path d=\"m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8\" /><path d=\"M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7\" /><path d=\"m2.1 21.8 6.4-6.3\" /><path d=\"m19 5-7 7\" />","fork-knife":"<path d=\"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2\" /><path d=\"M7 2v20\" /><path d=\"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7\" />","forklift":"<path d=\"M12 12H5a2 2 0 0 0-2 2v5\" /><path d=\"M15 19h7\" /><path d=\"M16 19V2\" /><path d=\"M6 12V7a2 2 0 0 1 2-2h2.172a2 2 0 0 1 1.414.586l3.828 3.828A2 2 0 0 1 16 10.828\" /><path d=\"M7 19h4\" /><circle cx=\"13\" cy=\"19\" r=\"2\" /><circle cx=\"5\" cy=\"19\" r=\"2\" />","form-input":"<rect width=\"20\" height=\"12\" x=\"2\" y=\"6\" rx=\"2\" /><path d=\"M12 12h.01\" /><path d=\"M17 12h.01\" /><path d=\"M7 12h.01\" />","form":"<path d=\"M4 14h6\" /><path d=\"M4 2h10\" /><rect x=\"4\" y=\"18\" width=\"16\" height=\"4\" rx=\"1\" /><rect x=\"4\" y=\"6\" width=\"16\" height=\"4\" rx=\"1\" />","forward":"<path d=\"m15 17 5-5-5-5\" /><path d=\"M4 18v-2a4 4 0 0 1 4-4h12\" />","frame":"<line x1=\"22\" x2=\"2\" y1=\"6\" y2=\"6\" /><line x1=\"22\" x2=\"2\" y1=\"18\" y2=\"18\" /><line x1=\"6\" x2=\"6\" y1=\"2\" y2=\"22\" /><line x1=\"18\" x2=\"18\" y1=\"2\" y2=\"22\" />","frown":"<path d=\"M15 10V9\" /><path d=\"M9 10V9\" /><path d=\"M9 16a5 5 0 016 0\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","fuel":"<path d=\"M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5\" /><path d=\"M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16\" /><path d=\"M2 21h13\" /><path d=\"M3 9h11\" />","fullscreen":"<path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /><path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" /><rect width=\"10\" height=\"8\" x=\"7\" y=\"8\" rx=\"1\" />","function-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" /><path d=\"M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3\" /><path d=\"M9 11.2h5.7\" />","funnel-plus":"<path d=\"M13.354 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14v6a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341l1.218-1.348\" /><path d=\"M16 6h6\" /><path d=\"M19 3v6\" />","funnel-x":"<path d=\"M12.531 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14v6a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341l.427-.473\" /><path d=\"m16.5 3.5 5 5\" /><path d=\"m21.5 3.5-5 5\" />","funnel":"<path d=\"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z\" />","galaxy":"<path d=\"M16.005 15.108a5.041 6.52 28.25 00-8.008-6.217 5.041 6.52 28.25 008.008 6.217A11.884 7.288-60.76 014.029 7.001\" /><path d=\"M17 21h.01\" /><path d=\"M7 3h.01\" /><path d=\"M7.997 8.891a11.885 7.288-60.756 0111.977 8.107\" /><circle cx=\"12\" cy=\"12\" r=\"1\" fill=\"currentColor\" />","gallery-horizontal-end":"<path d=\"M2 7v10\" /><path d=\"M6 5v14\" /><rect width=\"12\" height=\"18\" x=\"10\" y=\"3\" rx=\"2\" />","gallery-horizontal":"<path d=\"M2 3v18\" /><rect width=\"12\" height=\"18\" x=\"6\" y=\"3\" rx=\"2\" /><path d=\"M22 3v18\" />","gallery-thumbnails":"<rect width=\"18\" height=\"14\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M4 21h1\" /><path d=\"M9 21h1\" /><path d=\"M14 21h1\" /><path d=\"M19 21h1\" />","gallery-vertical-end":"<path d=\"M7 2h10\" /><path d=\"M5 6h14\" /><rect width=\"18\" height=\"12\" x=\"3\" y=\"10\" rx=\"2\" />","gallery-vertical":"<path d=\"M3 2h18\" /><rect width=\"18\" height=\"12\" x=\"3\" y=\"6\" rx=\"2\" /><path d=\"M3 22h18\" />","gamepad-2":"<line x1=\"6\" x2=\"10\" y1=\"11\" y2=\"11\" /><line x1=\"8\" x2=\"8\" y1=\"9\" y2=\"13\" /><line x1=\"15\" x2=\"15.01\" y1=\"12\" y2=\"12\" /><line x1=\"18\" x2=\"18.01\" y1=\"10\" y2=\"10\" /><path d=\"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z\" />","gamepad-directional":"<path d=\"M11.146 15.854a1.207 1.207 0 0 1 1.708 0l1.56 1.56A2 2 0 0 1 15 18.828V21a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2.172a2 2 0 0 1 .586-1.414z\" /><path d=\"M18.828 15a2 2 0 0 1-1.414-.586l-1.56-1.56a1.207 1.207 0 0 1 0-1.708l1.56-1.56A2 2 0 0 1 18.828 9H21a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1z\" /><path d=\"M6.586 14.414A2 2 0 0 1 5.172 15H3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2.172a2 2 0 0 1 1.414.586l1.56 1.56a1.207 1.207 0 0 1 0 1.708z\" /><path d=\"M9 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2.172a2 2 0 0 1-.586 1.414l-1.56 1.56a1.207 1.207 0 0 1-1.708 0l-1.56-1.56A2 2 0 0 1 9 5.172z\" />","gamepad":"<line x1=\"6\" x2=\"10\" y1=\"12\" y2=\"12\" /><line x1=\"8\" x2=\"8\" y1=\"10\" y2=\"14\" /><line x1=\"15\" x2=\"15.01\" y1=\"13\" y2=\"13\" /><line x1=\"18\" x2=\"18.01\" y1=\"11\" y2=\"11\" /><rect width=\"20\" height=\"12\" x=\"2\" y=\"6\" rx=\"2\" />","gantt-chart-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M9 8h7\" /><path d=\"M8 12h6\" /><path d=\"M11 16h5\" />","gantt-chart":"<path d=\"M6 5h12\" /><path d=\"M4 12h10\" /><path d=\"M12 19h8\" />","gap-horizontal":"<path d=\"M12 2v2\" /><path d=\"M12 8v2\" /><path d=\"M12 14v2\" /><path d=\"M12 20v2\" /><path d=\"M21 3h-3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3\" /><path d=\"M3 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3\" />","gap-vertical":"<path d=\"M2 12h2\" /><path d=\"M8 12h2\" /><path d=\"M14 12h2\" /><path d=\"M20 12h2\" /><path d=\"M3 21v-3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3\" /><path d=\"M3 3v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3\" />","gauge-circle":"<path d=\"M15.6 2.7a10 10 0 1 0 5.7 5.7\" /><circle cx=\"12\" cy=\"12\" r=\"2\" /><path d=\"M13.4 10.6 19 5\" />","gauge":"<path d=\"m12 14 4-4\" /><path d=\"M3.34 19a10 10 0 1 1 17.32 0\" />","gavel":"<path d=\"m14 13-8.381 8.38a1 1 0 0 1-3.001-3l8.384-8.381\" /><path d=\"m16 16 6-6\" /><path d=\"m21.5 10.5-8-8\" /><path d=\"m8 8 6-6\" /><path d=\"m8.5 7.5 8 8\" />","gem":"<path d=\"M10.5 3 8 9l4 13 4-13-2.5-6\" /><path d=\"M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z\" /><path d=\"M2 9h20\" />","georgian-lari":"<path d=\"M11.5 21a7.5 7.5 0 1 1 7.35-9\" /><path d=\"M13 12V3\" /><path d=\"M4 21h16\" /><path d=\"M9 12V3\" />","germ-off":"<path d=\"m11 2 .925 1.848\" /><path d=\"M13 15h.01\" /><path d=\"M13.424 7.768a2 2 0 112.808 2.808\" /><path d=\"m16 21-1-2.472\" /><path d=\"M16.988 16.988A12 12 0 019 20a5 5 0 01-2.759-9.171 8.8 8.8 0 002.307-2.28\" /><path d=\"m19 2-1 1.804\" /><path d=\"m2 19 2.746-1.373\" /><path d=\"m2 2 20 20\" /><path d=\"m22 16-2.474-2.13a12 12 0 001.376-3.786 6 6 0 00-10.313-5.151\" /><path d=\"m22 5-1.804 1\" /><path d=\"m3 10 2 2\" /><path d=\"M9 16h.01\" /><path d=\"M9 20v2\" />","germ":"<path d=\"m11 2 .925 1.848\" /><path d=\"M13 15h.01\" /><path d=\"m16 21-1-2.472\" /><path d=\"m19 2-1 1.804\" /><path d=\"m2 19 2.746-1.373\" /><path d=\"m22 16-2.474-2.13\" /><path d=\"m22 5-1.804 1\" /><path d=\"m3 10 2 2\" /><path d=\"M9 16h.01\" /><path d=\"M9 20v2\" /><path d=\"M9.33 7.035c-.51 1.478-1.786 2.93-3.09 3.794A5 5 0 009 20a12.1 12.1 0 0011.902-9.916A6 6 0 009.33 7.035\" /><circle cx=\"15\" cy=\"9\" r=\"2\" />","ghost":"<path d=\"M15 10v1\" /><path d=\"M7.528 20.472a1.6 1.6 0 012.277 0l1.057 1.056a1.6 1.6 0 002.276 0l1.057-1.056a1.6 1.6 0 012.277 0l1.114 1.114a1.4 1.4 0 002.414-1V10a8 8 0 00-16 0v10.586a1.4 1.4 0 002.414 1z\" /><path d=\"M9 10v1\" />","gift":"<path d=\"M12 7v14\" /><path d=\"M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8\" /><path d=\"M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5\" /><rect x=\"3\" y=\"7\" width=\"18\" height=\"4\" rx=\"1\" />","git-branch-minus":"<path d=\"M15 6a9 9 0 0 0-9 9V3\" /><path d=\"M21 18h-6\" /><circle cx=\"18\" cy=\"6\" r=\"3\" /><circle cx=\"6\" cy=\"18\" r=\"3\" />","git-branch-plus":"<path d=\"M6 3v12\" /><path d=\"M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z\" /><path d=\"M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z\" /><path d=\"M15 6a9 9 0 0 0-9 9\" /><path d=\"M18 15v6\" /><path d=\"M21 18h-6\" />","git-branch":"<path d=\"M15 6a9 9 0 0 0-9 9V3\" /><circle cx=\"18\" cy=\"6\" r=\"3\" /><circle cx=\"6\" cy=\"18\" r=\"3\" />","git-commit-horizontal":"<circle cx=\"12\" cy=\"12\" r=\"3\" /><line x1=\"3\" x2=\"9\" y1=\"12\" y2=\"12\" /><line x1=\"15\" x2=\"21\" y1=\"12\" y2=\"12\" />","git-commit-vertical":"<path d=\"M12 3v6\" /><circle cx=\"12\" cy=\"12\" r=\"3\" /><path d=\"M12 15v6\" />","git-commit":"<circle cx=\"12\" cy=\"12\" r=\"3\" /><line x1=\"3\" x2=\"9\" y1=\"12\" y2=\"12\" /><line x1=\"15\" x2=\"21\" y1=\"12\" y2=\"12\" />","git-compare-arrows":"<circle cx=\"5\" cy=\"6\" r=\"3\" /><path d=\"M12 6h5a2 2 0 0 1 2 2v7\" /><path d=\"m15 9-3-3 3-3\" /><circle cx=\"19\" cy=\"18\" r=\"3\" /><path d=\"M12 18H7a2 2 0 0 1-2-2V9\" /><path d=\"m9 15 3 3-3 3\" />","git-compare":"<circle cx=\"18\" cy=\"18\" r=\"3\" /><circle cx=\"6\" cy=\"6\" r=\"3\" /><path d=\"M13 6h3a2 2 0 0 1 2 2v7\" /><path d=\"M11 18H8a2 2 0 0 1-2-2V9\" />","git-fork":"<circle cx=\"12\" cy=\"18\" r=\"3\" /><circle cx=\"6\" cy=\"6\" r=\"3\" /><circle cx=\"18\" cy=\"6\" r=\"3\" /><path d=\"M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9\" /><path d=\"M12 12v3\" />","git-graph":"<circle cx=\"5\" cy=\"6\" r=\"3\" /><path d=\"M5 9v6\" /><circle cx=\"5\" cy=\"18\" r=\"3\" /><path d=\"M12 3v18\" /><circle cx=\"19\" cy=\"6\" r=\"3\" /><path d=\"M16 15.7A9 9 0 0 0 19 9\" />","git-merge-conflict":"<path d=\"M12 6h4a2 2 0 0 1 2 2v7\" /><path d=\"M6 12v9\" /><path d=\"m8.5 3.5-5 5\" /><path d=\"m8.5 8.5-5-5\" /><circle cx=\"18\" cy=\"18\" r=\"3\" />","git-merge":"<circle cx=\"18\" cy=\"18\" r=\"3\" /><circle cx=\"6\" cy=\"6\" r=\"3\" /><path d=\"M6 21V9a9 9 0 0 0 9 9\" />","git-pull-request-arrow":"<circle cx=\"5\" cy=\"6\" r=\"3\" /><path d=\"M5 9v12\" /><circle cx=\"19\" cy=\"18\" r=\"3\" /><path d=\"m15 9-3-3 3-3\" /><path d=\"M12 6h5a2 2 0 0 1 2 2v7\" />","git-pull-request-closed":"<path d=\"m15.5 3.5 5 5\" /><path d=\"m15.5 8.5 5-5\" /><path d=\"M18 11.62V15\" /><path d=\"M6 9v12\" /><circle cx=\"18\" cy=\"18\" r=\"3\" /><circle cx=\"6\" cy=\"6\" r=\"3\" />","git-pull-request-create-arrow":"<circle cx=\"5\" cy=\"6\" r=\"3\" /><path d=\"M5 9v12\" /><path d=\"m15 9-3-3 3-3\" /><path d=\"M12 6h5a2 2 0 0 1 2 2v3\" /><path d=\"M19 15v6\" /><path d=\"M22 18h-6\" />","git-pull-request-create":"<circle cx=\"6\" cy=\"6\" r=\"3\" /><path d=\"M6 9v12\" /><path d=\"M13 6h3a2 2 0 0 1 2 2v3\" /><path d=\"M18 15v6\" /><path d=\"M21 18h-6\" />","git-pull-request-draft":"<circle cx=\"18\" cy=\"18\" r=\"3\" /><circle cx=\"6\" cy=\"6\" r=\"3\" /><path d=\"M18 6V5\" /><path d=\"M18 11v-1\" /><line x1=\"6\" x2=\"6\" y1=\"9\" y2=\"21\" />","git-pull-request":"<circle cx=\"18\" cy=\"18\" r=\"3\" /><circle cx=\"6\" cy=\"6\" r=\"3\" /><path d=\"M13 6h3a2 2 0 0 1 2 2v7\" /><line x1=\"6\" x2=\"6\" y1=\"9\" y2=\"21\" />","glass-water":"<path d=\"M5.116 4.104A1 1 0 0 1 6.11 3h11.78a1 1 0 0 1 .994 1.105L17.19 20.21A2 2 0 0 1 15.2 22H8.8a2 2 0 0 1-2-1.79z\" /><path d=\"M6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0\" />","glasses":"<circle cx=\"6\" cy=\"15\" r=\"4\" /><circle cx=\"18\" cy=\"15\" r=\"4\" /><path d=\"M14 15a2 2 0 0 0-2-2 2 2 0 0 0-2 2\" /><path d=\"M2.5 13 5 7c.7-1.3 1.4-2 3-2\" /><path d=\"M21.5 13 19 7c-.7-1.3-1.5-2-3-2\" />","globe-2":"<path d=\"M21.54 15H17a2 2 0 0 0-2 2v4.54\" /><path d=\"M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17\" /><path d=\"M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","globe-check":"<path d=\"m15 6 2 2 4-4\" /><path d=\"M2 12h20A10 10 0 1 1 12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 4-10\" />","globe-code":"<path d=\"M15.5 10 13 7.5 15.5 5\" /><path d=\"M15.861 14A14.5 14.5 0 0112 22a14.48 14.48 0 010-20 10 10 0 109.888 11.5\" /><path d=\"M19.5 5 22 7.5 19.5 10\" /><path d=\"M2 12h8.5\" />","globe-lock":"<path d=\"M15.686 15A14.5 14.5 0 0 1 12 22a14.5 14.5 0 0 1 0-20 10 10 0 1 0 9.542 13\" /><path d=\"M2 12h8.5\" /><path d=\"M20 6V4a2 2 0 1 0-4 0v2\" /><rect width=\"8\" height=\"5\" x=\"14\" y=\"6\" rx=\"1\" />","globe-off":"<path d=\"M10.114 4.462A14.5 14.5 0 0 1 12 2a10 10 0 0 1 9.313 13.643\" /><path d=\"M15.557 15.556A14.5 14.5 0 0 1 12 22 10 10 0 0 1 4.929 4.929\" /><path d=\"M15.892 10.234A14.5 14.5 0 0 0 12 2a10 10 0 0 0-3.643.687\" /><path d=\"M17.656 12H22\" /><path d=\"M19.071 19.071A10 10 0 0 1 12 22 14.5 14.5 0 0 1 8.44 8.45\" /><path d=\"M2 12h10\" /><path d=\"m2 2 20 20\" />","globe-x":"<path d=\"m16 3 5 5\" /><path d=\"M2 12h20A10 10 0 1 1 12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 4-10\" /><path d=\"m21 3-5 5\" />","globe":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\" /><path d=\"M2 12h20\" />","goal":"<path d=\"M12 13V2l8 4-8 4\" /><path d=\"M20.561 10.222a9 9 0 1 1-12.55-5.29\" /><path d=\"M8.002 9.997a5 5 0 1 0 8.9 2.02\" />","gpu":"<path d=\"M2 17h18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H2\" /><path d=\"M2 21V3\" /><path d=\"M7 17v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-3\" /><circle cx=\"16\" cy=\"11\" r=\"2\" /><circle cx=\"8\" cy=\"11\" r=\"2\" />","grab":"<path d=\"M18 11.5V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4\" /><path d=\"M14 10V8a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2\" /><path d=\"M10 9.9V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v5\" /><path d=\"M6 14a2 2 0 0 0-2-2a2 2 0 0 0-2 2\" /><path d=\"M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8 2 2 0 1 1 4 0\" />","graduation-cap":"<path d=\"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z\" /><path d=\"M22 10v6\" /><path d=\"M6 12.5V16a6 3 0 0 0 12 0v-3.5\" />","grape":"<path d=\"M22 5V2l-5.89 5.89\" /><circle cx=\"16.6\" cy=\"15.89\" r=\"3\" /><circle cx=\"8.11\" cy=\"7.4\" r=\"3\" /><circle cx=\"12.35\" cy=\"11.65\" r=\"3\" /><circle cx=\"13.91\" cy=\"5.85\" r=\"3\" /><circle cx=\"18.15\" cy=\"10.09\" r=\"3\" /><circle cx=\"6.56\" cy=\"13.2\" r=\"3\" /><circle cx=\"10.8\" cy=\"17.44\" r=\"3\" /><circle cx=\"5\" cy=\"19\" r=\"3\" />","grid-2-x-2-check":"<path d=\"M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3\" /><path d=\"m16 19 2 2 4-4\" />","grid-2-x-2-plus":"<path d=\"M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3\" /><path d=\"M16 19h6\" /><path d=\"M19 22v-6\" />","grid-2-x-2-x":"<path d=\"M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3\" /><path d=\"m16.5 16.5 5 5\" /><path d=\"m16.5 21.5 5-5\" />","grid-2-x-2":"<path d=\"M12 3v18\" /><path d=\"M3 12h18\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","grid-2x2-check":"<path d=\"M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3\" /><path d=\"m16 19 2 2 4-4\" />","grid-2x2-plus":"<path d=\"M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3\" /><path d=\"M16 19h6\" /><path d=\"M19 22v-6\" />","grid-2x2-x":"<path d=\"M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3\" /><path d=\"m16.5 16.5 5 5\" /><path d=\"m16.5 21.5 5-5\" />","grid-2x2":"<path d=\"M12 3v18\" /><path d=\"M3 12h18\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","grid-3-x-3":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M3 9h18\" /><path d=\"M3 15h18\" /><path d=\"M9 3v18\" /><path d=\"M15 3v18\" />","grid-3x2":"<path d=\"M15 3v18\" /><path d=\"M3 12h18\" /><path d=\"M9 3v18\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","grid-3x3":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M3 9h18\" /><path d=\"M3 15h18\" /><path d=\"M9 3v18\" /><path d=\"M15 3v18\" />","grid":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M3 9h18\" /><path d=\"M3 15h18\" /><path d=\"M9 3v18\" /><path d=\"M15 3v18\" />","grip-horizontal":"<circle cx=\"12\" cy=\"9\" r=\"1\" /><circle cx=\"19\" cy=\"9\" r=\"1\" /><circle cx=\"5\" cy=\"9\" r=\"1\" /><circle cx=\"12\" cy=\"15\" r=\"1\" /><circle cx=\"19\" cy=\"15\" r=\"1\" /><circle cx=\"5\" cy=\"15\" r=\"1\" />","grip-vertical":"<circle cx=\"9\" cy=\"12\" r=\"1\" /><circle cx=\"9\" cy=\"5\" r=\"1\" /><circle cx=\"9\" cy=\"19\" r=\"1\" /><circle cx=\"15\" cy=\"12\" r=\"1\" /><circle cx=\"15\" cy=\"5\" r=\"1\" /><circle cx=\"15\" cy=\"19\" r=\"1\" />","grip":"<circle cx=\"12\" cy=\"5\" r=\"1\" /><circle cx=\"19\" cy=\"5\" r=\"1\" /><circle cx=\"5\" cy=\"5\" r=\"1\" /><circle cx=\"12\" cy=\"12\" r=\"1\" /><circle cx=\"19\" cy=\"12\" r=\"1\" /><circle cx=\"5\" cy=\"12\" r=\"1\" /><circle cx=\"12\" cy=\"19\" r=\"1\" /><circle cx=\"19\" cy=\"19\" r=\"1\" /><circle cx=\"5\" cy=\"19\" r=\"1\" />","group":"<path d=\"M3 7V5c0-1.1.9-2 2-2h2\" /><path d=\"M17 3h2c1.1 0 2 .9 2 2v2\" /><path d=\"M21 17v2c0 1.1-.9 2-2 2h-2\" /><path d=\"M7 21H5c-1.1 0-2-.9-2-2v-2\" /><rect width=\"7\" height=\"5\" x=\"7\" y=\"7\" rx=\"1\" /><rect width=\"7\" height=\"5\" x=\"10\" y=\"12\" rx=\"1\" />","guitar":"<path d=\"m11.9 12.1 4.514-4.514\" /><path d=\"M20.1 2.3a1 1 0 0 0-1.4 0l-1.114 1.114A2 2 0 0 0 17 4.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 17.828 7h1.344a2 2 0 0 0 1.414-.586L21.7 5.3a1 1 0 0 0 0-1.4z\" /><path d=\"m6 16 2 2\" /><path d=\"M8.23 9.85A3 3 0 0 1 11 8a5 5 0 0 1 5 5 3 3 0 0 1-1.85 2.77l-.92.38A2 2 0 0 0 12 18a4 4 0 0 1-4 4 6 6 0 0 1-6-6 4 4 0 0 1 4-4 2 2 0 0 0 1.85-1.23z\" />","ham":"<path d=\"M13.144 21.144A7.274 10.445 45 1 0 2.856 10.856\" /><path d=\"M13.144 21.144A7.274 4.365 45 0 0 2.856 10.856a7.274 4.365 45 0 0 10.288 10.288\" /><path d=\"M16.565 10.435 18.6 8.4a2.501 2.501 0 1 0 1.65-4.65 2.5 2.5 0 1 0-4.66 1.66l-2.024 2.025\" /><path d=\"m8.5 16.5-1-1\" />","hamburger":"<path d=\"M12 16H4a2 2 0 1 1 0-4h16a2 2 0 1 1 0 4h-4.25\" /><path d=\"M5 12a2 2 0 0 1-2-2 9 7 0 0 1 18 0 2 2 0 0 1-2 2\" /><path d=\"M5 16a2 2 0 0 0-2 2 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 2 2 0 0 0-2-2q0 0 0 0\" /><path d=\"m6.67 12 6.13 4.6a2 2 0 0 0 2.8-.4l3.15-4.2\" />","hammer":"<path d=\"m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9\" /><path d=\"m18 15 4-4\" /><path d=\"m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5\" />","hand-coins":"<path d=\"M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17\" /><path d=\"m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9\" /><path d=\"m2 16 6 6\" /><circle cx=\"16\" cy=\"9\" r=\"2.9\" /><circle cx=\"6\" cy=\"5\" r=\"3\" />","hand-fist":"<path d=\"M12.035 17.012a3 3 0 0 0-3-3l-.311-.002a.72.72 0 0 1-.505-1.229l1.195-1.195A2 2 0 0 1 10.828 11H12a2 2 0 0 0 0-4H9.243a3 3 0 0 0-2.122.879l-2.707 2.707A4.83 4.83 0 0 0 3 14a8 8 0 0 0 8 8h2a8 8 0 0 0 8-8V7a2 2 0 1 0-4 0v2a2 2 0 1 0 4 0\" /><path d=\"M13.888 9.662A2 2 0 0 0 17 8V5A2 2 0 1 0 13 5\" /><path d=\"M9 5A2 2 0 1 0 5 5V10\" /><path d=\"M9 7V4A2 2 0 1 1 13 4V7.268\" />","hand-grab":"<path d=\"M18 11.5V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4\" /><path d=\"M14 10V8a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2\" /><path d=\"M10 9.9V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v5\" /><path d=\"M6 14a2 2 0 0 0-2-2a2 2 0 0 0-2 2\" /><path d=\"M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8 2 2 0 1 1 4 0\" />","hand-heart":"<path d=\"M11 14h2a2 2 0 0 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16\" /><path d=\"m14.45 13.39 5.05-4.694C20.196 8 21 6.85 21 5.75a2.75 2.75 0 0 0-4.797-1.837.276.276 0 0 1-.406 0A2.75 2.75 0 0 0 11 5.75c0 1.2.802 2.248 1.5 2.946L16 11.95\" /><path d=\"m2 15 6 6\" /><path d=\"m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a1 1 0 0 0-2.75-2.91\" />","hand-helping":"<path d=\"M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14\" /><path d=\"m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9\" /><path d=\"m2 13 6 6\" />","hand-metal":"<path d=\"M18 12.5V10a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4\" /><path d=\"M14 11V9a2 2 0 1 0-4 0v2\" /><path d=\"M10 10.5V5a2 2 0 1 0-4 0v9\" /><path d=\"m7 15-1.76-1.76a2 2 0 0 0-2.83 2.82l3.6 3.6C7.5 21.14 9.2 22 12 22h2a8 8 0 0 0 8-8V7a2 2 0 1 0-4 0v5\" />","hand-platter":"<path d=\"M12 3V2\" /><path d=\"m15.4 17.4 3.2-2.8a2 2 0 1 1 2.8 2.9l-3.6 3.3c-.7.8-1.7 1.2-2.8 1.2h-4c-1.1 0-2.1-.4-2.8-1.2l-1.302-1.464A1 1 0 0 0 6.151 19H5\" /><path d=\"M2 14h12a2 2 0 0 1 0 4h-2\" /><path d=\"M4 10h16\" /><path d=\"M5 10a7 7 0 0 1 14 0\" /><path d=\"M5 14v6a1 1 0 0 1-1 1H2\" />","hand":"<path d=\"M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2\" /><path d=\"M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2\" /><path d=\"M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8\" /><path d=\"M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15\" />","handbag":"<path d=\"M2.048 18.566A2 2 0 0 0 4 21h16a2 2 0 0 0 1.952-2.434l-2-9A2 2 0 0 0 18 8H6a2 2 0 0 0-1.952 1.566z\" /><path d=\"M8 11V6a4 4 0 0 1 8 0v5\" />","handshake":"<path d=\"m11 17 2 2a1 1 0 1 0 3-3\" /><path d=\"m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4\" /><path d=\"m21 3 1 11h-2\" /><path d=\"M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3\" /><path d=\"M3 4h8\" />","hard-drive-download":"<path d=\"M12 2v8\" /><path d=\"m16 6-4 4-4-4\" /><rect width=\"20\" height=\"8\" x=\"2\" y=\"14\" rx=\"2\" /><path d=\"M6 18h.01\" /><path d=\"M10 18h.01\" />","hard-drive-upload":"<path d=\"m16 6-4-4-4 4\" /><path d=\"M12 2v8\" /><rect width=\"20\" height=\"8\" x=\"2\" y=\"14\" rx=\"2\" /><path d=\"M6 18h.01\" /><path d=\"M10 18h.01\" />","hard-drive":"<path d=\"M10 16h.01\" /><path d=\"M2.212 11.577a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z\" /><path d=\"M21.946 12.013H2.054\" /><path d=\"M6 16h.01\" />","hard-hat":"<path d=\"M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5\" /><path d=\"M14 6a6 6 0 0 1 6 6v3\" /><path d=\"M4 15v-3a6 6 0 0 1 6-6\" /><rect x=\"2\" y=\"15\" width=\"20\" height=\"4\" rx=\"1\" />","hash":"<line x1=\"4\" x2=\"20\" y1=\"9\" y2=\"9\" /><line x1=\"4\" x2=\"20\" y1=\"15\" y2=\"15\" /><line x1=\"10\" x2=\"8\" y1=\"3\" y2=\"21\" /><line x1=\"16\" x2=\"14\" y1=\"3\" y2=\"21\" />","hat-glasses":"<path d=\"M14 18a2 2 0 0 0-4 0\" /><path d=\"m19 11-2.11-6.657a2 2 0 0 0-2.752-1.148l-1.276.61A2 2 0 0 1 12 4H8.5a2 2 0 0 0-1.925 1.456L5 11\" /><path d=\"M2 11h20\" /><circle cx=\"17\" cy=\"18\" r=\"3\" /><circle cx=\"7\" cy=\"18\" r=\"3\" />","haze":"<path d=\"m5.2 6.2 1.4 1.4\" /><path d=\"M2 13h2\" /><path d=\"M20 13h2\" /><path d=\"m17.4 7.6 1.4-1.4\" /><path d=\"M22 17H2\" /><path d=\"M22 21H2\" /><path d=\"M16 13a4 4 0 0 0-8 0\" /><path d=\"M12 5V2.5\" />","hd":"<path d=\"M10 12H6\" /><path d=\"M10 15V9\" /><path d=\"M14 14.5a.5.5 0 0 0 .5.5h1a2.5 2.5 0 0 0 2.5-2.5v-1A2.5 2.5 0 0 0 15.5 9h-1a.5.5 0 0 0-.5.5z\" /><path d=\"M6 15V9\" /><rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"2\" />","hdmi-port":"<path d=\"M22 9a1 1 0 00-1-1H3a1 1 0 00-1 1v4a1 1 0 001 1h.5a2 2 0 011.6.8l.3.4A2 2 0 007 16h10a2 2 0 001.6-.8l.3-.4a2 2 0 011.6-.8h.5a1 1 0 001-1z\" /><path d=\"M8 12h8\" />","heading-1":"<path d=\"M4 12h8\" /><path d=\"M4 18V6\" /><path d=\"M12 18V6\" /><path d=\"m17 12 3-2v8\" />","heading-2":"<path d=\"M4 12h8\" /><path d=\"M4 18V6\" /><path d=\"M12 18V6\" /><path d=\"M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1\" />","heading-3":"<path d=\"M4 12h8\" /><path d=\"M4 18V6\" /><path d=\"M12 18V6\" /><path d=\"M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2\" /><path d=\"M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2\" />","heading-4":"<path d=\"M12 18V6\" /><path d=\"M17 10v3a1 1 0 0 0 1 1h3\" /><path d=\"M21 10v8\" /><path d=\"M4 12h8\" /><path d=\"M4 18V6\" />","heading-5":"<path d=\"M4 12h8\" /><path d=\"M4 18V6\" /><path d=\"M12 18V6\" /><path d=\"M17 13v-3h4\" /><path d=\"M17 17.7c.4.2.8.3 1.3.3 1.5 0 2.7-1.1 2.7-2.5S19.8 13 18.3 13H17\" />","heading-6":"<path d=\"M4 12h8\" /><path d=\"M4 18V6\" /><path d=\"M12 18V6\" /><circle cx=\"19\" cy=\"16\" r=\"2\" /><path d=\"M20 10c-2 2-3 3.5-3 6\" />","heading":"<path d=\"M6 12h12\" /><path d=\"M6 20V4\" /><path d=\"M18 20V4\" />","headphone-off":"<path d=\"M21 14h-1.343\" /><path d=\"M9.128 3.47A9 9 0 0 1 21 12v3.343\" /><path d=\"m2 2 20 20\" /><path d=\"M20.414 20.414A2 2 0 0 1 19 21h-1a2 2 0 0 1-2-2v-3\" /><path d=\"M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 2.636-6.364\" />","headphones":"<path d=\"M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3\" />","headset":"<path d=\"M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z\" /><path d=\"M21 16v2a4 4 0 0 1-4 4h-5\" />","heart-crack":"<path d=\"M12.409 5.824c-.702.792-1.15 1.496-1.415 2.166l2.153 2.156a.5.5 0 0 1 0 .707l-2.293 2.293a.5.5 0 0 0 0 .707L12 15\" /><path d=\"M13.508 20.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.677.6.6 0 0 0 .818.001A5.5 5.5 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5z\" />","heart-handshake":"<path d=\"M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762\" />","heart-minus":"<path d=\"m14.876 18.99-1.368 1.323a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5a5.2 5.2 0 0 1-.244 1.572\" /><path d=\"M15 15h6\" />","heart-off":"<path d=\"M10.5 4.893a5.5 5.5 0 0 1 1.091.931.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 1.872-1.002 3.356-2.187 4.655\" /><path d=\"m16.967 16.967-3.459 3.346a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 2.747-4.761\" /><path d=\"m2 2 20 20\" />","heart-plus":"<path d=\"m14.479 19.374-.971.939a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5a5.2 5.2 0 0 1-.219 1.49\" /><path d=\"M15 15h6\" /><path d=\"M18 12v6\" />","heart-pulse":"<path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\" /><path d=\"M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27\" />","heart-x":"<path d=\"m15.5 12.5 5 5\" /><path d=\"m20.5 12.5-5 5\" /><path d=\"M21.955 8.774a5.5 5.5 0 0 0-9.546-2.95.6.6 0 0 1-.818 0A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.508 5.332a2 2 0 0 0 2.57.352\" />","heart":"<path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\" />","heater":"<path d=\"M11 8c2-3-2-3 0-6\" /><path d=\"M15.5 8c2-3-2-3 0-6\" /><path d=\"M6 10h.01\" /><path d=\"M6 14h.01\" /><path d=\"M10 16v-4\" /><path d=\"M14 16v-4\" /><path d=\"M18 16v-4\" /><path d=\"M20 6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3\" /><path d=\"M5 20v2\" /><path d=\"M19 20v2\" />","helicopter":"<path d=\"M11 17v4\" /><path d=\"M14 3v8a2 2 0 0 0 2 2h5.865\" /><path d=\"M17 17v4\" /><path d=\"M18 17a4 4 0 0 0 4-4 8 6 0 0 0-8-6 6 5 0 0 0-6 5v3a2 2 0 0 0 2 2z\" /><path d=\"M2 10v5\" /><path d=\"M6 3h16\" /><path d=\"M7 21h14\" /><path d=\"M8 13H2\" />","help-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\" /><path d=\"M12 17h.01\" />","helping-hand":"<path d=\"M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14\" /><path d=\"m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9\" /><path d=\"m2 13 6 6\" />","hexagon":"<path d=\"M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z\" />","highlighter":"<path d=\"m9 11-6 6v3h9l3-3\" /><path d=\"m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4\" />","history":"<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\" /><path d=\"M3 3v5h5\" /><path d=\"M12 7v5l4 2\" />","home":"<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\" /><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\" />","hop-off":"<path d=\"M10.82 16.12c1.69.6 3.91.79 5.18.85.28.01.53-.09.7-.27\" /><path d=\"M11.14 20.57c.52.24 2.44 1.12 4.08 1.37.46.06.86-.25.9-.71.12-1.52-.3-3.43-.5-4.28\" /><path d=\"M16.13 21.05c1.65.63 3.68.84 4.87.91a.9.9 0 0 0 .7-.26\" /><path d=\"M17.99 5.52a20.83 20.83 0 0 1 3.15 4.5.8.8 0 0 1-.68 1.13c-1.17.1-2.5.02-3.9-.25\" /><path d=\"M20.57 11.14c.24.52 1.12 2.44 1.37 4.08.04.3-.08.59-.31.75\" /><path d=\"M4.93 4.93a10 10 0 0 0-.67 13.4c.35.43.96.4 1.17-.12.69-1.71 1.07-5.07 1.07-6.71 1.34.45 3.1.9 4.88.62a.85.85 0 0 0 .48-.24\" /><path d=\"M5.52 17.99c1.05.95 2.91 2.42 4.5 3.15a.8.8 0 0 0 1.13-.68c.2-2.34-.33-5.3-1.57-8.28\" /><path d=\"M8.35 2.68a10 10 0 0 1 9.98 1.58c.43.35.4.96-.12 1.17-1.5.6-4.3.98-6.07 1.05\" /><path d=\"m2 2 20 20\" />","hop":"<path d=\"M10.82 16.12c1.69.6 3.91.79 5.18.85.55.03 1-.42.97-.97-.06-1.27-.26-3.5-.85-5.18\" /><path d=\"M11.5 6.5c1.64 0 5-.38 6.71-1.07.52-.2.55-.82.12-1.17A10 10 0 0 0 4.26 18.33c.35.43.96.4 1.17-.12.69-1.71 1.07-5.07 1.07-6.71 1.34.45 3.1.9 4.88.62a.88.88 0 0 0 .73-.74c.3-2.14-.15-3.5-.61-4.88\" /><path d=\"M15.62 16.95c.2.85.62 2.76.5 4.28a.77.77 0 0 1-.9.7 16.64 16.64 0 0 1-4.08-1.36\" /><path d=\"M16.13 21.05c1.65.63 3.68.84 4.87.91a.9.9 0 0 0 .96-.96 17.68 17.68 0 0 0-.9-4.87\" /><path d=\"M16.94 15.62c.86.2 2.77.62 4.29.5a.77.77 0 0 0 .7-.9 16.64 16.64 0 0 0-1.36-4.08\" /><path d=\"M17.99 5.52a20.82 20.82 0 0 1 3.15 4.5.8.8 0 0 1-.68 1.13c-2.33.2-5.3-.32-8.27-1.57\" /><path d=\"M4.93 4.93 3 3a.7.7 0 0 1 0-1\" /><path d=\"M9.58 12.18c1.24 2.98 1.77 5.95 1.57 8.28a.8.8 0 0 1-1.13.68 20.82 20.82 0 0 1-4.5-3.15\" />","hospital":"<path d=\"M12 7v4\" /><path d=\"M14 21v-3a2 2 0 0 0-4 0v3\" /><path d=\"M14 9h-4\" /><path d=\"M18 11h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2\" /><path d=\"M18 21V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16\" />","hotel":"<path d=\"M10 22v-6.57\" /><path d=\"M12 11h.01\" /><path d=\"M12 7h.01\" /><path d=\"M14 15.43V22\" /><path d=\"M15 16a5 5 0 0 0-6 0\" /><path d=\"M16 11h.01\" /><path d=\"M16 7h.01\" /><path d=\"M8 11h.01\" /><path d=\"M8 7h.01\" /><rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\" />","hourglass-cog":"<path d=\"m14.305 19.53.923-.382\" /><path d=\"m15.228 16.852-.923-.383\" /><path d=\"m16.852 15.228-.383-.923\" /><path d=\"m16.852 20.772-.383.924\" /><path d=\"M17 2v4.172a2 2 0 0 1-.586 1.414l-8.828 8.828A2 2 0 0 0 7 17.828V22\" /><path d=\"m19.148 15.228.383-.923\" /><path d=\"m19.53 21.696-.382-.924\" /><path d=\"m20.772 16.852.924-.383\" /><path d=\"m20.772 19.148.924.383\" /><path d=\"M5 22h6.159\" /><path d=\"M5 2h14\" /><path d=\"M7 2v4.172a2 2 0 0 0 .586 1.414l5.188 5.188\" /><circle cx=\"18\" cy=\"18\" r=\"3\" />","hourglass":"<path d=\"M5 22h14\" /><path d=\"M5 2h14\" /><path d=\"M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22\" /><path d=\"M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2\" />","house-cog":"<path d=\"M10.584 21H5a2 2 0 01-2-2v-9a2 2 0 01.709-1.527l7-6a2 2 0 012.582 0l7 6A2 2 0 0121 10.001v.583\" /><path d=\"M14 12H10a1 1 0 00-1 1v8\" /><path d=\"m14.305 19.53.923-.382\" /><path d=\"m15.229 16.852-.924-.383\" /><path d=\"m16.852 15.228-.383-.923\" /><path d=\"m16.852 20.773-.383.924\" /><path d=\"m19.148 15.228.383-.923\" /><path d=\"m19.53 21.697-.382-.924\" /><path d=\"m20.773 16.852.922-.383\" /><path d=\"m20.773 19.148.922.383\" /><circle cx=\"18\" cy=\"18\" r=\"3\" />","house-heart":"<path d=\"M8.62 13.8A2.25 2.25 0 1 1 12 10.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z\" /><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\" />","house-plug":"<path d=\"M10 12V8.964\" /><path d=\"M14 12V8.964\" /><path d=\"M15 12a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2a1 1 0 0 1 1-1z\" /><path d=\"M8.5 21H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-2\" />","house-plus":"<path d=\"M12.35 21H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v2.35\" /><path d=\"M14.8 12.4A1 1 0 0 0 14 12h-4a1 1 0 0 0-1 1v8\" /><path d=\"M15 18h6\" /><path d=\"M18 15v6\" />","house-wifi":"<path d=\"M9.5 13.866a4 4 0 0 1 5 .01\" /><path d=\"M12 17h.01\" /><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\" /><path d=\"M7 10.754a8 8 0 0 1 10 0\" />","house":"<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\" /><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\" />","houses":"<path d=\"m12.681 4.24.834-.715a1.45 1.45 0 011.88 0l5.09 4.364A1.45 1.45 0 0121 9v6.546a1.45 1.45 0 01-1 1.381\" /><path d=\"M15.485 11.889A1.45 1.45 0 0116 13v6.546A1.454 1.454 0 0114.546 21H4.364a1.454 1.454 0 01-1.454-1.454V13a1.45 1.45 0 01.515-1.111l5.09-4.364a1.45 1.45 0 011.88 0z\" /><path d=\"M7.41 20.546v-4a1 1 0 011-1h2a1 1 0 011 1v4\" />","ice-cream-2":"<path d=\"M12 17c5 0 8-2.69 8-6H4c0 3.31 3 6 8 6m-4 4h8m-4-3v3M5.14 11a3.5 3.5 0 1 1 6.71 0\" /><path d=\"M12.14 11a3.5 3.5 0 1 1 6.71 0\" /><path d=\"M15.5 6.5a3.5 3.5 0 1 0-7 0\" />","ice-cream-bowl":"<path d=\"M12 17c5 0 8-2.69 8-6H4c0 3.31 3 6 8 6m-4 4h8m-4-3v3M5.14 11a3.5 3.5 0 1 1 6.71 0\" /><path d=\"M12.14 11a3.5 3.5 0 1 1 6.71 0\" /><path d=\"M15.5 6.5a3.5 3.5 0 1 0-7 0\" />","ice-cream-cone":"<path d=\"m7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11\" /><path d=\"M17 7A5 5 0 0 0 7 7\" /><path d=\"M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4\" />","ice-cream":"<path d=\"m7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11\" /><path d=\"M17 7A5 5 0 0 0 7 7\" /><path d=\"M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4\" />","id-card-lanyard":"<path d=\"M13.5 8h-3\" /><path d=\"m15 2-1 2h3a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2h3\" /><path d=\"M16 22a4 4 0 00-8 0\" /><path d=\"m9 2 3 6\" /><circle cx=\"12\" cy=\"15\" r=\"3\" />","id-card":"<path d=\"M13 19a4 4 0 00-8 0\" /><path d=\"M16 10h2\" /><path d=\"M16 14h2\" /><circle cx=\"9\" cy=\"12\" r=\"3\" /><rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"2\" />","image-down":"<path d=\"M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21\" /><path d=\"m14 19 3 3v-5.5\" /><path d=\"m17 22 3-3\" /><circle cx=\"9\" cy=\"9\" r=\"2\" />","image-minus":"<path d=\"M21 9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7\" /><line x1=\"16\" x2=\"22\" y1=\"5\" y2=\"5\" /><circle cx=\"9\" cy=\"9\" r=\"2\" /><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\" />","image-off":"<line x1=\"2\" x2=\"22\" y1=\"2\" y2=\"22\" /><path d=\"M10.41 10.41a2 2 0 1 1-2.83-2.83\" /><line x1=\"13.5\" x2=\"6\" y1=\"13.5\" y2=\"21\" /><line x1=\"18\" x2=\"21\" y1=\"12\" y2=\"15\" /><path d=\"M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59\" /><path d=\"M21 15V5a2 2 0 0 0-2-2H9\" />","image-play":"<path d=\"M15 15.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997a1 1 0 0 1-1.517-.86z\" /><path d=\"M21 12.17V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6\" /><path d=\"m6 21 5-5\" /><circle cx=\"9\" cy=\"9\" r=\"2\" />","image-plus":"<path d=\"M16 5h6\" /><path d=\"M19 2v6\" /><path d=\"M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5\" /><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\" /><circle cx=\"9\" cy=\"9\" r=\"2\" />","image-up":"<path d=\"M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21\" /><path d=\"m14 19.5 3-3 3 3\" /><path d=\"M17 22v-5.5\" /><circle cx=\"9\" cy=\"9\" r=\"2\" />","image-upscale":"<path d=\"M16 3h5v5\" /><path d=\"M17 21h2a2 2 0 0 0 2-2\" /><path d=\"M21 12v3\" /><path d=\"m21 3-5 5\" /><path d=\"M3 7V5a2 2 0 0 1 2-2\" /><path d=\"m5 21 4.144-4.144a1.21 1.21 0 0 1 1.712 0L13 19\" /><path d=\"M9 3h3\" /><rect x=\"3\" y=\"11\" width=\"10\" height=\"10\" rx=\"1\" />","image":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" /><circle cx=\"9\" cy=\"9\" r=\"2\" /><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\" />","images":"<path d=\"m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16\" /><path d=\"M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2\" /><circle cx=\"13\" cy=\"7\" r=\"1\" fill=\"currentColor\" /><rect x=\"8\" y=\"2\" width=\"14\" height=\"14\" rx=\"2\" />","import":"<path d=\"M12 3v12\" /><path d=\"m8 11 4 4 4-4\" /><path d=\"M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4\" />","inbox":"<polyline points=\"22 12 16 12 14 15 10 15 8 12 2 12\" /><path d=\"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z\" />","indent-decrease":"<path d=\"M21 5H11\" /><path d=\"M21 12H11\" /><path d=\"M21 19H11\" /><path d=\"m7 8-4 4 4 4\" />","indent-increase":"<path d=\"M21 5H11\" /><path d=\"M21 12H11\" /><path d=\"M21 19H11\" /><path d=\"m3 8 4 4-4 4\" />","indent":"<path d=\"M21 5H11\" /><path d=\"M21 12H11\" /><path d=\"M21 19H11\" /><path d=\"m3 8 4 4-4 4\" />","indian-rupee":"<path d=\"M6 3h12\" /><path d=\"M6 8h12\" /><path d=\"m6 13 8.5 8\" /><path d=\"M6 13h3\" /><path d=\"M9 13c6.667 0 6.667-10 0-10\" />","infinity":"<path d=\"M6 16c5 0 7-8 12-8a4 4 0 0 1 0 8c-5 0-7-8-12-8a4 4 0 1 0 0 8\" />","info":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 16v-4\" /><path d=\"M12 8h.01\" />","inspect":"<path d=\"M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z\" /><path d=\"M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6\" />","inspection-panel":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M7 7h.01\" /><path d=\"M17 7h.01\" /><path d=\"M7 17h.01\" /><path d=\"M17 17h.01\" />","italic":"<line x1=\"19\" x2=\"10\" y1=\"4\" y2=\"4\" /><line x1=\"14\" x2=\"5\" y1=\"20\" y2=\"20\" /><line x1=\"15\" x2=\"9\" y1=\"4\" y2=\"20\" />","iteration-ccw":"<path d=\"m16 14 4 4-4 4\" /><path d=\"M20 10a8 8 0 1 0-8 8h8\" />","iteration-cw":"<path d=\"M4 10a8 8 0 1 1 8 8H4\" /><path d=\"m8 22-4-4 4-4\" />","iv-bag":"<path d=\"M12 18v2a2 2 0 002 2h6\" /><path d=\"M6 11c.72.5 1.44 1 3 1 3 0 3-2 6-2 1.56 0 2.28.5 3 1\" /><path d=\"M9.293 3c.453 0 .887-.18 1.207-.5s.754-.5 1.207-.5h.586c.453 0 .887.18 1.207.5s.754.5 1.207.5H16a2 2 0 012 2v11a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2z\" />","japanese-yen":"<path d=\"M12 9.5V21m0-11.5L6 3m6 6.5L18 3\" /><path d=\"M6 15h12\" /><path d=\"M6 11h12\" />","joystick":"<path d=\"M21 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2Z\" /><path d=\"M6 15v-2\" /><path d=\"M12 15V9\" /><circle cx=\"12\" cy=\"6\" r=\"3\" />","kanban-square-dashed":"<path d=\"M8 7v7\" /><path d=\"M12 7v4\" /><path d=\"M16 7v9\" /><path d=\"M5 3a2 2 0 0 0-2 2\" /><path d=\"M9 3h1\" /><path d=\"M14 3h1\" /><path d=\"M19 3a2 2 0 0 1 2 2\" /><path d=\"M21 9v1\" /><path d=\"M21 14v1\" /><path d=\"M21 19a2 2 0 0 1-2 2\" /><path d=\"M14 21h1\" /><path d=\"M9 21h1\" /><path d=\"M5 21a2 2 0 0 1-2-2\" /><path d=\"M3 14v1\" /><path d=\"M3 9v1\" />","kanban-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M8 7v7\" /><path d=\"M12 7v4\" /><path d=\"M16 7v9\" />","kanban":"<path d=\"M5 3v14\" /><path d=\"M12 3v8\" /><path d=\"M19 3v18\" />","kayak":"<path d=\"M18 17a1 1 0 0 0-1 1v1a2 2 0 1 0 2-2z\" /><path d=\"M20.97 3.61a.45.45 0 0 0-.58-.58C10.2 6.6 6.6 10.2 3.03 20.39a.45.45 0 0 0 .58.58C13.8 17.4 17.4 13.8 20.97 3.61\" /><path d=\"m6.707 6.707 10.586 10.586\" /><path d=\"M7 5a2 2 0 1 0-2 2h1a1 1 0 0 0 1-1z\" />","key-round":"<path d=\"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z\" /><circle cx=\"16.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\" />","key-square":"<path d=\"M12.4 2.7a2.5 2.5 0 0 1 3.4 0l5.5 5.5a2.5 2.5 0 0 1 0 3.4l-3.7 3.7a2.5 2.5 0 0 1-3.4 0L8.7 9.8a2.5 2.5 0 0 1 0-3.4z\" /><path d=\"m14 7 3 3\" /><path d=\"m9.4 10.6-6.814 6.814A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814\" />","key":"<path d=\"m2 21 9.6-9.6\" /><path d=\"m7.5 15.5 2.3 2.3a1 1 0 0 1 0 1.4l-2.1 2.1a1 1 0 0 1-1.4 0L4 19\" /><circle cx=\"15.5\" cy=\"7.5\" r=\"5.5\" />","keyboard-music":"<rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\" /><path d=\"M6 8h4\" /><path d=\"M14 8h.01\" /><path d=\"M18 8h.01\" /><path d=\"M2 12h20\" /><path d=\"M6 12v4\" /><path d=\"M10 12v4\" /><path d=\"M14 12v4\" /><path d=\"M18 12v4\" />","keyboard-off":"<path d=\"M 20 4 A2 2 0 0 1 22 6\" /><path d=\"M 22 6 L 22 16.41\" /><path d=\"M 7 16 L 16 16\" /><path d=\"M 9.69 4 L 20 4\" /><path d=\"M14 8h.01\" /><path d=\"M18 8h.01\" /><path d=\"m2 2 20 20\" /><path d=\"M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2\" /><path d=\"M6 8h.01\" /><path d=\"M8 12h.01\" />","keyboard":"<path d=\"M10 8h.01\" /><path d=\"M12 12h.01\" /><path d=\"M14 8h.01\" /><path d=\"M16 12h.01\" /><path d=\"M18 8h.01\" /><path d=\"M6 8h.01\" /><path d=\"M7 16h10\" /><path d=\"M8 12h.01\" /><rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\" />","lambda":"<path d=\"M11.38 10 5 20\" /><path d=\"M19 18a2 2 0 01-2 2c-4.87-.003-5.052-16-10-16a2 2 0 00-2 2\" />","lamp-ceiling":"<path d=\"M12 2v5\" /><path d=\"M14.829 15.998a3 3 0 1 1-5.658 0\" /><path d=\"M20.92 14.606A1 1 0 0 1 20 16H4a1 1 0 0 1-.92-1.394l3-7A1 1 0 0 1 7 7h10a1 1 0 0 1 .92.606z\" />","lamp-desk":"<path d=\"M10.293 2.293a1 1 0 0 1 1.414 0l2.5 2.5 5.994 1.227a1 1 0 0 1 .506 1.687l-7 7a1 1 0 0 1-1.687-.506l-1.227-5.994-2.5-2.5a1 1 0 0 1 0-1.414z\" /><path d=\"m14.207 4.793-3.414 3.414\" /><path d=\"M3 20a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z\" /><path d=\"m9.086 6.5-4.793 4.793a1 1 0 0 0-.18 1.17L7 18\" />","lamp-floor":"<path d=\"M12 10v12\" /><path d=\"M17.929 7.629A1 1 0 0 1 17 9H7a1 1 0 0 1-.928-1.371l2-5A1 1 0 0 1 9 2h6a1 1 0 0 1 .928.629z\" /><path d=\"M9 22h6\" />","lamp-wall-down":"<path d=\"M19.929 18.629A1 1 0 0 1 19 20H9a1 1 0 0 1-.928-1.371l2-5A1 1 0 0 1 11 13h6a1 1 0 0 1 .928.629z\" /><path d=\"M6 3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z\" /><path d=\"M8 6h4a2 2 0 0 1 2 2v5\" />","lamp-wall-up":"<path d=\"M19.929 9.629A1 1 0 0 1 19 11H9a1 1 0 0 1-.928-1.371l2-5A1 1 0 0 1 11 4h6a1 1 0 0 1 .928.629z\" /><path d=\"M6 15a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z\" /><path d=\"M8 18h4a2 2 0 0 0 2-2v-5\" />","lamp":"<path d=\"M12 12v6\" /><path d=\"M4.077 10.615A1 1 0 0 0 5 12h14a1 1 0 0 0 .923-1.385l-3.077-7.384A2 2 0 0 0 15 2H9a2 2 0 0 0-1.846 1.23Z\" /><path d=\"M8 20a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1z\" />","land-plot":"<path d=\"m12 8 6-3-6-3v10\" /><path d=\"m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12\" /><path d=\"m6.49 12.85 11.02 6.3\" /><path d=\"M17.51 12.85 6.5 19.15\" />","landmark":"<path d=\"M10 18v-7\" /><path d=\"M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z\" /><path d=\"M14 18v-7\" /><path d=\"M18 18v-7\" /><path d=\"M3 22h18\" /><path d=\"M6 18v-7\" />","languages":"<path d=\"m5 8 6 6\" /><path d=\"m4 14 6-6 2-3\" /><path d=\"M2 5h12\" /><path d=\"M7 2h1\" /><path d=\"m22 22-5-10-5 10\" /><path d=\"M14 18h6\" />","laptop-2":"<rect width=\"18\" height=\"12\" x=\"3\" y=\"4\" rx=\"2\" ry=\"2\" /><line x1=\"2\" x2=\"22\" y1=\"20\" y2=\"20\" />","laptop-minimal-check":"<path d=\"M2 20h20\" /><path d=\"m9 10 2 2 4-4\" /><rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\" />","laptop-minimal":"<rect width=\"18\" height=\"12\" x=\"3\" y=\"4\" rx=\"2\" ry=\"2\" /><line x1=\"2\" x2=\"22\" y1=\"20\" y2=\"20\" />","laptop":"<path d=\"M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z\" /><path d=\"M20.054 15.987H3.946\" />","lasso-select":"<path d=\"M7 22a5 5 0 0 1-2-4\" /><path d=\"M7 16.93c.96.43 1.96.74 2.99.91\" /><path d=\"M3.34 14A6.8 6.8 0 0 1 2 10c0-4.42 4.48-8 10-8s10 3.58 10 8a7.19 7.19 0 0 1-.33 2\" /><path d=\"M5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z\" /><path d=\"M14.33 22h-.09a.35.35 0 0 1-.24-.32v-10a.34.34 0 0 1 .33-.34c.08 0 .15.03.21.08l7.34 6a.33.33 0 0 1-.21.59h-4.49l-2.57 3.85a.35.35 0 0 1-.28.14z\" />","lasso":"<path d=\"M3.704 14.467a10 8 0 1 1 3.115 2.375\" /><path d=\"M7 22a5 5 0 0 1-2-3.994\" /><circle cx=\"5\" cy=\"16\" r=\"2\" />","laugh":"<path d=\"M15 10V9\" /><path d=\"M7.084 14.302a5.12 5.12 0 009.833 0 .24.24 0 00-.235-.302H7.32a.24.24 0 00-.235.302\" /><path d=\"M9 10V9\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","layer-arrow-down":"<path d=\"M12 10v10\" /><path d=\"M22 10a1 1 0 01-.59.92l-5.077 2.308\" /><path d=\"M22.017 10.005a1 1 0 00-.597-.916l-8.59-3.91a2 2 0 00-1.66.001L2.6 9.08a1 1 0 00-.02 1.831l5.093 2.316\" /><path d=\"m9 17 3 3 3-3\" />","layer-arrow-up":"<path d=\"M12 14V4\" /><path d=\"M7.674 10.774 2.58 13.09a1 1 0 000 1.822l8.6 3.91a2 2 0 001.65 0l8.58-3.9a1 1 0 00.59-.92 1 1 0 00-.59-.922l-5.078-2.308\" /><path d=\"m9 7 3-3 3 3\" />","layers-2":"<path d=\"M13 13.74a2 2 0 0 1-2 0L2.5 8.87a1 1 0 0 1 0-1.74L11 2.26a2 2 0 0 1 2 0l8.5 4.87a1 1 0 0 1 0 1.74z\" /><path d=\"m20 14.285 1.5.845a1 1 0 0 1 0 1.74L13 21.74a2 2 0 0 1-2 0l-8.5-4.87a1 1 0 0 1 0-1.74l1.5-.845\" />","layers-3":"<path d=\"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z\" /><path d=\"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12\" /><path d=\"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17\" />","layers-arrow-down":"<path d=\"M12 7v15\" /><path d=\"M2 12a1 1 0 00.58.91l5.093 2.316\" /><path d=\"M22 12a1 1 0 01-.59.92l-5.077 2.308\" /><path d=\"M8 10.37 2.6 7.91a1 1 0 010-1.831l8.57-3.9a2 2 0 011.66.001l8.59 3.91a1 1 0 010 1.831l-5.392 2.45\" /><path d=\"m9 19 3 3 3-3\" />","layers-arrow-up":"<path d=\"M12 12V2\" /><path d=\"M2 17.002a1 1 0 00.58.91l8.6 3.91a2 2 0 001.65 0l8.58-3.9a1 1 0 00.59-.92\" /><path d=\"M7.674 8.774 2.58 11.09a1 1 0 000 1.822l8.6 3.91a2 2 0 001.65 0l8.58-3.9a1 1 0 00.59-.92 1 1 0 00-.59-.922l-5.078-2.308\" /><path d=\"m9 5 3-3 3 3\" />","layers-minus":"<path d=\"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 .83.18 2 2 0 0 0 .83-.18l8.58-3.9a1 1 0 0 0 0-1.832z\" /><path d=\"M16 17h6\" /><path d=\"M2.003 11.995a1 1 0 0 0 .597.915l8.58 3.91a2 2 0 0 0 .83.18\" /><path d=\"M2.003 16.995a1 1 0 0 0 .597.915l8.58 3.91a2 2 0 0 0 .83.18 2 2 0 0 0 .83-.18l2.11-.96\" /><path d=\"M22.018 12.004a1 1 0 0 1-.598.916l-.177.08\" />","layers-plus":"<path d=\"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 .83.18 2 2 0 0 0 .83-.18l8.58-3.9a1 1 0 0 0 0-1.831z\" /><path d=\"M16 17h6\" /><path d=\"M19 14v6\" /><path d=\"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 .825.178\" /><path d=\"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l2.116-.962\" />","layers":"<path d=\"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z\" /><path d=\"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12\" /><path d=\"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17\" />","layout-arrow-down":"<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\" /><rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\" /><path d=\"M18 3v18\" /><path d=\"m21 18-3 3-3-3\" />","layout-arrow-right":"<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\" /><rect width=\"7\" height=\"7\" x=\"14\" y=\"3\" rx=\"1\" /><path d=\"M3 18h18\" /><path d=\"m18 21 3-3-3-3\" />","layout-dashboard":"<rect width=\"7\" height=\"9\" x=\"3\" y=\"3\" rx=\"1\" /><rect width=\"7\" height=\"5\" x=\"14\" y=\"3\" rx=\"1\" /><rect width=\"7\" height=\"9\" x=\"14\" y=\"12\" rx=\"1\" /><rect width=\"7\" height=\"5\" x=\"3\" y=\"16\" rx=\"1\" />","layout-freeform":"<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\" /><rect width=\"7\" height=\"7\" x=\"14\" y=\"4\" rx=\"1\" /><rect width=\"7\" height=\"7\" x=\"4\" y=\"14\" rx=\"1\" />","layout-grid":"<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\" /><rect width=\"7\" height=\"7\" x=\"14\" y=\"3\" rx=\"1\" /><rect width=\"7\" height=\"7\" x=\"14\" y=\"14\" rx=\"1\" /><rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\" />","layout-list":"<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\" /><rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\" /><path d=\"M14 4h7\" /><path d=\"M14 9h7\" /><path d=\"M14 15h7\" /><path d=\"M14 20h7\" />","layout-panel-left":"<rect width=\"7\" height=\"18\" x=\"3\" y=\"3\" rx=\"1\" /><rect width=\"7\" height=\"7\" x=\"14\" y=\"3\" rx=\"1\" /><rect width=\"7\" height=\"7\" x=\"14\" y=\"14\" rx=\"1\" />","layout-panel-top":"<rect width=\"18\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\" /><rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\" /><rect width=\"7\" height=\"7\" x=\"14\" y=\"14\" rx=\"1\" />","layout-template":"<rect width=\"18\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\" /><rect width=\"9\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\" /><rect width=\"5\" height=\"7\" x=\"16\" y=\"14\" rx=\"1\" />","layout":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M3 9h18\" /><path d=\"M9 21V9\" />","leaf":"<path d=\"M11 20a10 10 0 0010-10 25.9 25.9 0 00-1.04-7.281 1 1 0 00-1.755-.325C15.833 5.5 13 5.5 9.8 6.1A7 7 0 0011 20\" /><path d=\"M2 21a5 5 0 012.911-4.544C7.613 15.212 8.351 15.24 11 13\" />","leafy-green":"<path d=\"M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22\" /><path d=\"M2 22 17 7\" />","lectern":"<path d=\"M15 13h4a2 2 0 001.901-1.38l1.057-4.333A1 1 0 0021 6H3a1 1 0 00-.958 1.287L3.1 11.621A2 2 0 005.001 13h4\" /><path d=\"M15 22V11a1 1 0 00-1-1h-4a1 1 0 00-1 1v11\" /><path d=\"M18 22H6\" /><path d=\"M18 6V3a1 1 0 00-1-1h-3\" />","lens-concave":"<path d=\"M7 2a1 1 0 0 0-.8 1.6 14 14 0 0 1 0 16.8A1 1 0 0 0 7 22h10a1 1 0 0 0 .8-1.6 14 14 0 0 1 0-16.8A1 1 0 0 0 17 2z\" />","lens-convex":"<path d=\"M13.433 2a1 1 0 0 1 .824.448 18 18 0 0 1 0 19.104 1 1 0 0 1-.824.448h-2.866a1 1 0 0 1-.824-.448 18 18 0 0 1 0-19.104A1 1 0 0 1 10.567 2z\" />","letter-text":"<path d=\"M15 5h6\" /><path d=\"M15 12h6\" /><path d=\"M3 19h18\" /><path d=\"m3 12 3.553-7.724a.5.5 0 0 1 .894 0L11 12\" /><path d=\"M3.92 10h6.16\" />","letters":"<path d=\"M15 8H9\" /><path d=\"M21 15.354a4 4 0 100 5.292\" /><path d=\"M3 18h4a2 2 0 010 4H3.5a.5.5 0 01-.5-.5v-7a.5.5 0 01.5-.5H6a2 2 0 010 4\" /><path d=\"m8 10 3.453-7.648a.6.6 0 011.094 0L16 10\" />","library-big":"<rect width=\"8\" height=\"18\" x=\"3\" y=\"3\" rx=\"1\" /><path d=\"M7 3v18\" /><path d=\"M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z\" />","library-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M7 7v10\" /><path d=\"M11 7v10\" /><path d=\"m15 7 2 10\" />","library":"<path d=\"m16 6 4 14\" /><path d=\"M12 6v14\" /><path d=\"M8 8v12\" /><path d=\"M4 4v16\" />","life-buoy":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m4.93 4.93 4.24 4.24\" /><path d=\"m14.83 9.17 4.24-4.24\" /><path d=\"m14.83 14.83 4.24 4.24\" /><path d=\"m9.17 14.83-4.24 4.24\" /><circle cx=\"12\" cy=\"12\" r=\"4\" />","ligature":"<path d=\"M14 12h2v8\" /><path d=\"M14 20h4\" /><path d=\"M6 12h4\" /><path d=\"M6 20h4\" /><path d=\"M8 20V8a4 4 0 0 1 7.464-2\" />","lightbulb-off":"<path d=\"M16.8 11.2c.8-.9 1.2-2 1.2-3.2a6 6 0 0 0-9.3-5\" /><path d=\"m2 2 20 20\" /><path d=\"M6.3 6.3a4.67 4.67 0 0 0 1.2 5.2c.7.7 1.3 1.5 1.5 2.5\" /><path d=\"M9 18h6\" /><path d=\"M10 22h4\" />","lightbulb":"<path d=\"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5\" /><path d=\"M9 18h6\" /><path d=\"M10 22h4\" />","lighthouse":"<path d=\"M12 3V2\" /><path d=\"M16.066 16.865 7 22l2-11V6a3 3 0 016 0v5l2 11\" /><path d=\"m19.792 4.5.866-.5\" /><path d=\"m19.797 13.5.866.5\" /><path d=\"M21 9h1\" /><path d=\"M3 9H2\" /><path d=\"m4.203 13.5-.866.5\" /><path d=\"M4.208 4.5 3.342 4\" /><path d=\"M5.5 22h13\" /><path d=\"m7.932 16.875 7.377-4.178\" /><path d=\"M8 11h8\" /><path d=\"M8 7h8\" />","line-chart":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"m19 9-5 5-4-4-3 3\" />","line-dot-bottom-vertical":"<path d=\"M12 3v12\" /><circle cx=\"12\" cy=\"18\" r=\"3\" />","line-dot-left-horizontal":"<path d=\"M9 12h12\" /><circle cx=\"6\" cy=\"12\" r=\"3\" />","line-dot-right-horizontal":"<path d=\"M 3 12 L 15 12\" /><circle cx=\"18\" cy=\"12\" r=\"3\" />","line-dot-top-vertical":"<path d=\"M12 9v12\" /><circle cx=\"12\" cy=\"6\" r=\"3\" />","line-squiggle":"<path d=\"M7 3.5c5-2 7 2.5 3 4C1.5 10 2 15 5 16c5 2 9-10 14-7s.5 13.5-4 12c-5-2.5.5-11 6-2\" />","line-style":"<path d=\"M11 5h2\" /><path d=\"M15 12h6\" /><path d=\"M19 5h2\" /><path d=\"M3 12h6\" /><path d=\"M3 19h18\" /><path d=\"M3 5h2\" />","link-2-off":"<path d=\"M9 17H7A5 5 0 0 1 7 7\" /><path d=\"M15 7h2a5 5 0 0 1 4 8\" /><line x1=\"8\" x2=\"12\" y1=\"12\" y2=\"12\" /><line x1=\"2\" x2=\"22\" y1=\"2\" y2=\"22\" />","link-2":"<path d=\"M9 17H7A5 5 0 0 1 7 7h2\" /><path d=\"M15 7h2a5 5 0 1 1 0 10h-2\" /><line x1=\"8\" x2=\"16\" y1=\"12\" y2=\"12\" />","link":"<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\" /><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\" />","list-check":"<path d=\"M16 5H3\" /><path d=\"M16 12H3\" /><path d=\"M11 19H3\" /><path d=\"m15 18 2 2 4-4\" />","list-checks":"<path d=\"M13 5h8\" /><path d=\"M13 12h8\" /><path d=\"M13 19h8\" /><path d=\"m3 17 2 2 4-4\" /><path d=\"m3 7 2 2 4-4\" />","list-chevrons-down-up":"<path d=\"M3 5h8\" /><path d=\"M3 12h8\" /><path d=\"M3 19h8\" /><path d=\"m15 5 3 3 3-3\" /><path d=\"m15 19 3-3 3 3\" />","list-chevrons-up-down":"<path d=\"M3 5h8\" /><path d=\"M3 12h8\" /><path d=\"M3 19h8\" /><path d=\"m15 8 3-3 3 3\" /><path d=\"m15 16 3 3 3-3\" />","list-clock":"<path d=\"M16 13v2.2l1.6 1\" /><path d=\"M3 12h3.458\" /><path d=\"M3 19h3.832\" /><path d=\"M3 5h18\" /><circle cx=\"16\" cy=\"15\" r=\"6\" />","list-collapse":"<path d=\"M10 5h11\" /><path d=\"M10 12h11\" /><path d=\"M10 19h11\" /><path d=\"m3 10 3-3-3-3\" /><path d=\"m3 20 3-3-3-3\" />","list-end":"<path d=\"M16 5H3\" /><path d=\"M16 12H3\" /><path d=\"M9 19H3\" /><path d=\"m16 16-3 3 3 3\" /><path d=\"M21 5v12a2 2 0 0 1-2 2h-6\" />","list-filter-plus":"<path d=\"M12 5H2\" /><path d=\"M6 12h12\" /><path d=\"M9 19h6\" /><path d=\"M16 5h6\" /><path d=\"M19 8V2\" />","list-filter":"<path d=\"M2 5h20\" /><path d=\"M6 12h12\" /><path d=\"M9 19h6\" />","list-indent-decrease":"<path d=\"M21 5H11\" /><path d=\"M21 12H11\" /><path d=\"M21 19H11\" /><path d=\"m7 8-4 4 4 4\" />","list-indent-increase":"<path d=\"M21 5H11\" /><path d=\"M21 12H11\" /><path d=\"M21 19H11\" /><path d=\"m3 8 4 4-4 4\" />","list-minus":"<path d=\"M16 5H3\" /><path d=\"M11 12H3\" /><path d=\"M16 19H3\" /><path d=\"M21 12h-6\" />","list-music":"<path d=\"M16 5H3\" /><path d=\"M11 12H3\" /><path d=\"M11 19H3\" /><path d=\"M21 16V5\" /><circle cx=\"18\" cy=\"16\" r=\"3\" />","list-ordered":"<path d=\"M11 5h10\" /><path d=\"M11 12h10\" /><path d=\"M11 19h10\" /><path d=\"M4 4h1v5\" /><path d=\"M4 9h2\" /><path d=\"M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02\" />","list-plus":"<path d=\"M16 5H3\" /><path d=\"M11 12H3\" /><path d=\"M16 19H3\" /><path d=\"M18 9v6\" /><path d=\"M21 12h-6\" />","list-restart":"<path d=\"M21 5H3\" /><path d=\"M7 12H3\" /><path d=\"M7 19H3\" /><path d=\"M12 18a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L11 14\" /><path d=\"M11 10v4h4\" />","list-sort-ascending":"<path d=\"M3 19h18\" /><path d=\"M15 12H3\" /><path d=\"M9 5H3\" />","list-sort-descending":"<path d=\"M15 12H3\" /><path d=\"M3 5h18\" /><path d=\"M9 19H3\" />","list-start":"<path d=\"M3 5h6\" /><path d=\"M3 12h13\" /><path d=\"M3 19h13\" /><path d=\"m16 8-3-3 3-3\" /><path d=\"M21 19V7a2 2 0 0 0-2-2h-6\" />","list-todo":"<path d=\"M13 5h8\" /><path d=\"M13 12h8\" /><path d=\"M13 19h8\" /><path d=\"m3 17 2 2 4-4\" /><rect x=\"3\" y=\"4\" width=\"6\" height=\"6\" rx=\"1\" />","list-tree":"<path d=\"M8 5h13\" /><path d=\"M13 12h8\" /><path d=\"M13 19h8\" /><path d=\"M3 10a2 2 0 0 0 2 2h3\" /><path d=\"M3 5v12a2 2 0 0 0 2 2h3\" />","list-video":"<path d=\"M21 5H3\" /><path d=\"M10 12H3\" /><path d=\"M10 19H3\" /><path d=\"M15 12.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997a1 1 0 0 1-1.517-.86z\" />","list-x":"<path d=\"M16 5H3\" /><path d=\"M11 12H3\" /><path d=\"M16 19H3\" /><path d=\"m15.5 9.5 5 5\" /><path d=\"m20.5 9.5-5 5\" />","list":"<path d=\"M3 5h.01\" /><path d=\"M3 12h.01\" /><path d=\"M3 19h.01\" /><path d=\"M8 5h13\" /><path d=\"M8 12h13\" /><path d=\"M8 19h13\" />","loader-2":"<path d=\"M21 12a9 9 0 1 1-6.219-8.56\" />","loader-circle":"<path d=\"M21 12a9 9 0 1 1-6.219-8.56\" />","loader-pinwheel":"<path d=\"M22 12a1 1 0 0 1-10 0 1 1 0 0 0-10 0\" /><path d=\"M7 20.7a1 1 0 1 1 5-8.7 1 1 0 1 0 5-8.6\" /><path d=\"M7 3.3a1 1 0 1 1 5 8.6 1 1 0 1 0 5 8.6\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","loader":"<path d=\"M12 2v4\" /><path d=\"m16.2 7.8 2.9-2.9\" /><path d=\"M18 12h4\" /><path d=\"m16.2 16.2 2.9 2.9\" /><path d=\"M12 18v4\" /><path d=\"m4.9 19.1 2.9-2.9\" /><path d=\"M2 12h4\" /><path d=\"m4.9 4.9 2.9 2.9\" />","locate-fixed":"<line x1=\"2\" x2=\"5\" y1=\"12\" y2=\"12\" /><line x1=\"19\" x2=\"22\" y1=\"12\" y2=\"12\" /><line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"5\" /><line x1=\"12\" x2=\"12\" y1=\"19\" y2=\"22\" /><circle cx=\"12\" cy=\"12\" r=\"7\" /><circle cx=\"12\" cy=\"12\" r=\"3\" />","locate-off":"<path d=\"M12 19v3\" /><path d=\"M12 2v3\" /><path d=\"M18.89 13.24a7 7 0 0 0-8.13-8.13\" /><path d=\"M19 12h3\" /><path d=\"M2 12h3\" /><path d=\"m2 2 20 20\" /><path d=\"M7.05 7.05a7 7 0 0 0 9.9 9.9\" />","locate":"<line x1=\"2\" x2=\"5\" y1=\"12\" y2=\"12\" /><line x1=\"19\" x2=\"22\" y1=\"12\" y2=\"12\" /><line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"5\" /><line x1=\"12\" x2=\"12\" y1=\"19\" y2=\"22\" /><circle cx=\"12\" cy=\"12\" r=\"7\" />","location-edit":"<path d=\"M17.97 9.304A8 8 0 0 0 2 10c0 4.69 4.887 9.562 7.022 11.468\" /><path d=\"M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\" /><circle cx=\"10\" cy=\"10\" r=\"3\" />","lock-keyhole-open":"<circle cx=\"12\" cy=\"16\" r=\"1\" /><rect width=\"18\" height=\"12\" x=\"3\" y=\"10\" rx=\"2\" /><path d=\"M7 10V7a5 5 0 0 1 9.33-2.5\" />","lock-keyhole":"<circle cx=\"12\" cy=\"16\" r=\"1\" /><rect x=\"3\" y=\"10\" width=\"18\" height=\"12\" rx=\"2\" /><path d=\"M7 10V7a5 5 0 0 1 10 0v3\" />","lock-open":"<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\" /><path d=\"M7 11V7a5 5 0 0 1 9.9-1\" />","lock":"<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\" /><path d=\"M7 11V7a5 5 0 0 1 10 0v4\" />","log-in":"<path d=\"m10 17 5-5-5-5\" /><path d=\"M15 12H3\" /><path d=\"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4\" />","log-out":"<path d=\"m16 17 5-5-5-5\" /><path d=\"M21 12H9\" /><path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\" />","logs":"<path d=\"M3 5h1\" /><path d=\"M3 12h1\" /><path d=\"M3 19h1\" /><path d=\"M8 5h1\" /><path d=\"M8 12h1\" /><path d=\"M8 19h1\" /><path d=\"M13 5h8\" /><path d=\"M13 12h8\" /><path d=\"M13 19h8\" />","lollipop":"<circle cx=\"11\" cy=\"11\" r=\"8\" /><path d=\"m21 21-4.3-4.3\" /><path d=\"M11 11a2 2 0 0 0 4 0 4 4 0 0 0-8 0 6 6 0 0 0 12 0\" />","luggage":"<path d=\"M6 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2\" /><path d=\"M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14\" /><path d=\"M10 20h4\" /><circle cx=\"16\" cy=\"20\" r=\"2\" /><circle cx=\"8\" cy=\"20\" r=\"2\" />","m-square":"<path d=\"M8 16V8.5a.5.5 0 0 1 .9-.3l2.7 3.599a.5.5 0 0 0 .8 0l2.7-3.6a.5.5 0 0 1 .9.3V16\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","magnet":"<path d=\"m12 15 4 4\" /><path d=\"M2.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.029-6.029a1 1 0 1 1 3 3l-6.029 6.029a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.365-6.367A1 1 0 0 0 8.716 4.282z\" /><path d=\"m5 8 4 4\" />","mail-badge":"<path d=\"M22 7.7V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8.25\" /><path d=\"M12 12.996a1.94 1.94 0 0 1-1.03-.296L2 7\" /><path d=\"m20.69 16.479 1.29 4.88a.5.5 0 0 1-.698.591l-1.843-.849a1 1 0 0 0-.879.001l-1.846.85a.5.5 0 0 1-.692-.593l1.29-4.88\" /><circle cx=\"19\" cy=\"14\" r=\"3\" />","mail-check":"<path d=\"M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8\" /><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\" /><path d=\"m16 19 2 2 4-4\" />","mail-clock":"<path d=\"M16 14v2.2l1.6 1\" /><path d=\"m22 7-.759.484\" /><path d=\"M6.835 20H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v2\" /><path d=\"M7.605 10.567 2 7\" /><circle cx=\"16\" cy=\"16\" r=\"6\" />","mail-minus":"<path d=\"M22 15V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8\" /><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\" /><path d=\"M16 19h6\" />","mail-open":"<path d=\"M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z\" /><path d=\"m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10\" />","mail-pen":"<path d=\"M15.363 17.634a2 2 0 00-.506.854l-.837 2.87a.5.5 0 00.62.62l2.87-.837a2 2 0 00.854-.506l3.013-3.009a1 1 0 10-3.004-3.004z\" /><path d=\"M22 10.38V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2h6.25\" /><path d=\"m22 7-8.991 5.727a2 2 0 01-2.009 0L2 7\" />","mail-plus":"<path d=\"M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8\" /><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\" /><path d=\"M19 16v6\" /><path d=\"M16 19h6\" />","mail-question-mark":"<path d=\"M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5\" /><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\" /><path d=\"M18 15.28c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2\" /><path d=\"M20 22v.01\" />","mail-question":"<path d=\"M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5\" /><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\" /><path d=\"M18 15.28c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2\" /><path d=\"M20 22v.01\" />","mail-search":"<path d=\"M22 12.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h7.5\" /><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\" /><path d=\"M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z\" /><circle cx=\"18\" cy=\"18\" r=\"3\" /><path d=\"m22 22-1.5-1.5\" />","mail-warning":"<path d=\"M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5\" /><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\" /><path d=\"M20 14v4\" /><path d=\"M20 22v.01\" />","mail-x":"<path d=\"M22 12.532V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8.792\" /><path d=\"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7\" /><path d=\"m16.5 16.5 5 5\" /><path d=\"m21.5 16.5-5 5\" />","mail":"<path d=\"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7\" /><rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\" />","mailbox":"<path d=\"M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z\" /><polyline points=\"15,9 18,9 18,11\" /><path d=\"M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2\" /><line x1=\"6\" x2=\"7\" y1=\"10\" y2=\"10\" />","mails":"<path d=\"M17 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 1-1.732\" /><path d=\"m22 5.5-6.419 4.179a2 2 0 0 1-2.162 0L7 5.5\" /><rect x=\"7\" y=\"3\" width=\"15\" height=\"12\" rx=\"2\" />","map-minus":"<path d=\"m11 19-1.106-.552a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0l4.212 2.106a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619V14\" /><path d=\"M15 5.764V14\" /><path d=\"M21 18h-6\" /><path d=\"M9 3.236v15\" />","map-pin-check-inside":"<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\" /><path d=\"m9 10 2 2 4-4\" />","map-pin-check":"<path d=\"M19.43 12.935c.357-.967.57-1.955.57-2.935a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32.197 32.197 0 0 0 .813-.728\" /><circle cx=\"12\" cy=\"10\" r=\"3\" /><path d=\"m16 18 2 2 4-4\" />","map-pin-house":"<path d=\"M15 22a1 1 0 0 1-1-1v-4a1 1 0 0 1 .445-.832l3-2a1 1 0 0 1 1.11 0l3 2A1 1 0 0 1 22 17v4a1 1 0 0 1-1 1z\" /><path d=\"M18 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 .601.2\" /><path d=\"M18 22v-3\" /><circle cx=\"10\" cy=\"10\" r=\"3\" />","map-pin-minus-inside":"<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\" /><path d=\"M9 10h6\" />","map-pin-minus":"<path d=\"M18.977 14C19.6 12.701 20 11.343 20 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32 32 0 0 0 .824-.738\" /><circle cx=\"12\" cy=\"10\" r=\"3\" /><path d=\"M16 18h6\" />","map-pin-off":"<path d=\"M12.75 7.09a3 3 0 0 1 2.16 2.16\" /><path d=\"M17.072 17.072c-1.634 2.17-3.527 3.912-4.471 4.727a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 1.432-4.568\" /><path d=\"m2 2 20 20\" /><path d=\"M8.475 2.818A8 8 0 0 1 20 10c0 1.183-.31 2.377-.81 3.533\" /><path d=\"M9.13 9.13a3 3 0 0 0 3.74 3.74\" />","map-pin-pen":"<path d=\"M17.97 9.304A8 8 0 0 0 2 10c0 4.69 4.887 9.562 7.022 11.468\" /><path d=\"M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\" /><circle cx=\"10\" cy=\"10\" r=\"3\" />","map-pin-plus-inside":"<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\" /><path d=\"M12 7v6\" /><path d=\"M9 10h6\" />","map-pin-plus":"<path d=\"M19.914 11.105A7.298 7.298 0 0 0 20 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32 32 0 0 0 .824-.738\" /><circle cx=\"12\" cy=\"10\" r=\"3\" /><path d=\"M16 18h6\" /><path d=\"M19 15v6\" />","map-pin-search":"<path d=\"M 12.248 21.969 a 1 1 0 0 1 -0.849 -0.17 C 9.539 20.193 4 14.993 4 10 a 8 8 0 0 1 16 0 C 20 10.42 19.961 10.841 19.888 11.262\" /><path d=\"m22 22-1.88-1.88\" /><circle cx=\"12\" cy=\"10\" r=\"3\" /><circle cx=\"18\" cy=\"18\" r=\"3\" />","map-pin-x-inside":"<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\" /><path d=\"m14.5 7.5-5 5\" /><path d=\"m9.5 7.5 5 5\" />","map-pin-x":"<path d=\"M19.752 11.901A7.78 7.78 0 0 0 20 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 19 19 0 0 0 .09-.077\" /><circle cx=\"12\" cy=\"10\" r=\"3\" /><path d=\"m21.5 15.5-5 5\" /><path d=\"m21.5 20.5-5-5\" />","map-pin":"<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\" /><circle cx=\"12\" cy=\"10\" r=\"3\" />","map-pinned":"<path d=\"M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 01-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0112 0\" /><path d=\"M4.474 15h-.197a1 1 0 00-.969.753l-1.097 4.35a1.5 1.5 0 001.444 1.898L20.344 22a1.5 1.5 0 001.446-1.897l-1.098-4.35a1 1 0 00-.969-.753h-.197\" /><circle cx=\"12\" cy=\"8\" r=\"2\" />","map-plus":"<path d=\"m11 19-1.106-.552a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0l4.212 2.106a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619V12\" /><path d=\"M15 5.764V12\" /><path d=\"M18 15v6\" /><path d=\"M21 18h-6\" /><path d=\"M9 3.236v15\" />","map":"<path d=\"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z\" /><path d=\"M15 5.764v15\" /><path d=\"M9 3.236v15\" />","mars-stroke":"<path d=\"m14 6 4 4\" /><path d=\"M17 3h4v4\" /><path d=\"m21 3-7.75 7.75\" /><circle cx=\"9\" cy=\"15\" r=\"6\" />","mars":"<path d=\"M16 3h5v5\" /><path d=\"m21 3-6.75 6.75\" /><circle cx=\"10\" cy=\"14\" r=\"6\" />","martini":"<path d=\"M12 12 4.207 4.207A.707.707 0 0 1 4.707 3h14.586a.707.707 0 0 1 .5 1.207z\" /><path d=\"M12 12v10\" /><path d=\"M7 22h10\" />","maximize-2":"<path d=\"M15 3h6v6\" /><path d=\"m21 3-7 7\" /><path d=\"m3 21 7-7\" /><path d=\"M9 21H3v-6\" />","maximize":"<path d=\"M8 3H5a2 2 0 0 0-2 2v3\" /><path d=\"M21 8V5a2 2 0 0 0-2-2h-3\" /><path d=\"M3 16v3a2 2 0 0 0 2 2h3\" /><path d=\"M16 21h3a2 2 0 0 0 2-2v-3\" />","medal":"<path d=\"M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15\" /><path d=\"M11 12 5.12 2.2\" /><path d=\"m13 12 5.88-9.8\" /><path d=\"M8 7h8\" /><circle cx=\"12\" cy=\"17\" r=\"5\" /><path d=\"M12 18v-2h-.5\" />","megaphone-off":"<path d=\"M11.636 6A13 13 0 0 0 19.4 3.2 1 1 0 0 1 21 4v11.344\" /><path d=\"M14.378 14.357A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1\" /><path d=\"m2 2 20 20\" /><path d=\"M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14\" /><path d=\"M8 8v6\" />","megaphone":"<path d=\"M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z\" /><path d=\"M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14\" /><path d=\"M8 6v8\" />","meh":"<path d=\"M15 10V9\" /><path d=\"M8 16h8\" /><path d=\"M9 10V9\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","memory-stick":"<path d=\"M12 12v-2\" /><path d=\"M12 18v-2\" /><path d=\"M16 12v-2\" /><path d=\"M16 18v-2\" /><path d=\"M2 11h1.5\" /><path d=\"M20 18v-2\" /><path d=\"M20.5 11H22\" /><path d=\"M4 18v-2\" /><path d=\"M8 12v-2\" /><path d=\"M8 18v-2\" /><rect x=\"2\" y=\"6\" width=\"20\" height=\"10\" rx=\"2\" />","menu-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M7 8h10\" /><path d=\"M7 12h10\" /><path d=\"M7 16h10\" />","menu":"<path d=\"M4 5h16\" /><path d=\"M4 12h16\" /><path d=\"M4 19h16\" />","merge":"<path d=\"m8 6 4-4 4 4\" /><path d=\"M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22\" /><path d=\"m20 22-5-5\" />","message-circle-check":"<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\" /><path d=\"m16 9-5.5 5.5L8 12\" />","message-circle-code":"<path d=\"m10 9-3 3 3 3\" /><path d=\"m14 15 3-3-3-3\" /><path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\" />","message-circle-dashed-check":"<path d=\"M10.1 2.182a10 10 0 013.8 0\" /><path d=\"M13.9 21.818a10 10 0 01-3.8 0\" /><path d=\"M17.609 3.72a10 10 0 012.69 2.7\" /><path d=\"M2.182 13.9a10 10 0 010-3.8\" /><path d=\"M20.28 17.61a10 10 0 01-2.7 2.69\" /><path d=\"M21.818 10.1a10 10 0 010 3.8\" /><path d=\"M3.721 6.391a10 10 0 012.7-2.69\" /><path d=\"m6.163 21.117-2.906.85a1 1 0 01-1.236-1.169l.965-2.98\" /><path d=\"m16 9-5.5 5.5L8 12\" />","message-circle-dashed":"<path d=\"M10.1 2.182a10 10 0 0 1 3.8 0\" /><path d=\"M13.9 21.818a10 10 0 0 1-3.8 0\" /><path d=\"M17.609 3.72a10 10 0 0 1 2.69 2.7\" /><path d=\"M2.182 13.9a10 10 0 0 1 0-3.8\" /><path d=\"M20.28 17.61a10 10 0 0 1-2.7 2.69\" /><path d=\"M21.818 10.1a10 10 0 0 1 0 3.8\" /><path d=\"M3.721 6.391a10 10 0 0 1 2.7-2.69\" /><path d=\"m6.163 21.117-2.906.85a1 1 0 0 1-1.236-1.169l.965-2.98\" />","message-circle-heart":"<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\" /><path d=\"M7.828 13.07A3 3 0 0 1 12 8.764a3 3 0 0 1 5.004 2.224 3 3 0 0 1-.832 2.083l-3.447 3.62a1 1 0 0 1-1.45-.001z\" />","message-circle-more":"<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\" /><path d=\"M8 12h.01\" /><path d=\"M12 12h.01\" /><path d=\"M16 12h.01\" />","message-circle-off":"<path d=\"m2 2 20 20\" /><path d=\"M4.93 4.929a10 10 0 0 0-1.938 11.412 2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 0 0 11.302-1.989\" /><path d=\"M8.35 2.69A10 10 0 0 1 21.3 15.65\" />","message-circle-plus":"<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\" /><path d=\"M8 12h8\" /><path d=\"M12 8v8\" />","message-circle-question-mark":"<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\" /><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\" /><path d=\"M12 17h.01\" />","message-circle-question":"<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\" /><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\" /><path d=\"M12 17h.01\" />","message-circle-reply":"<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\" /><path d=\"m10 15-3-3 3-3\" /><path d=\"M7 12h8a2 2 0 0 1 2 2v1\" />","message-circle-warning":"<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\" /><path d=\"M12 8v4\" /><path d=\"M12 16h.01\" />","message-circle-x":"<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\" /><path d=\"m15 9-6 6\" /><path d=\"m9 9 6 6\" />","message-circle":"<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\" />","message-square-check":"<path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.7.7 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\" /><path d=\"m9 11 2 2 4-4\" />","message-square-code":"<path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\" /><path d=\"m10 8-3 3 3 3\" /><path d=\"m14 14 3-3-3-3\" />","message-square-dashed":"<path d=\"M14 3h2\" /><path d=\"M16 19h-2\" /><path d=\"M2 12v-2\" /><path d=\"M2 16v5.286a.71.71 0 0 0 1.212.502l1.149-1.149\" /><path d=\"M20 19a2 2 0 0 0 2-2v-1\" /><path d=\"M22 10v2\" /><path d=\"M22 6V5a2 2 0 0 0-2-2\" /><path d=\"M4 3a2 2 0 0 0-2 2v1\" /><path d=\"M8 19h2\" /><path d=\"M8 3h2\" />","message-square-diff":"<path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\" /><path d=\"M10 15h4\" /><path d=\"M10 9h4\" /><path d=\"M12 7v4\" />","message-square-dot":"<path d=\"M12.7 3H4a2 2 0 0 0-2 2v16.286a.71.71 0 0 0 1.212.502l2.202-2.202A2 2 0 0 1 6.828 19H20a2 2 0 0 0 2-2v-4.7\" /><circle cx=\"19\" cy=\"6\" r=\"3\" />","message-square-heart":"<path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\" /><path d=\"M7.5 9.5c0 .687.265 1.383.697 1.844l3.009 3.264a1.14 1.14 0 0 0 .407.314 1 1 0 0 0 .783-.004 1.14 1.14 0 0 0 .398-.31l3.008-3.264A2.77 2.77 0 0 0 16.5 9.5 2.5 2.5 0 0 0 12 8a2.5 2.5 0 0 0-4.5 1.5\" />","message-square-lock":"<path d=\"M22 8.5V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16.286a.71.71 0 0 0 1.212.502l2.202-2.202A2 2 0 0 1 6.828 19H10\" /><path d=\"M20 15v-2a2 2 0 0 0-4 0v2\" /><rect x=\"14\" y=\"15\" width=\"8\" height=\"5\" rx=\"1\" />","message-square-more":"<path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\" /><path d=\"M12 11h.01\" /><path d=\"M16 11h.01\" /><path d=\"M8 11h.01\" />","message-square-off":"<path d=\"M19 19H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.7.7 0 0 1 2 21.286V5a2 2 0 0 1 1.184-1.826\" /><path d=\"m2 2 20 20\" /><path d=\"M8.656 3H20a2 2 0 0 1 2 2v11.344\" />","message-square-plus":"<path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\" /><path d=\"M12 8v6\" /><path d=\"M9 11h6\" />","message-square-quote":"<path d=\"M14 14a2 2 0 0 0 2-2V8h-2\" /><path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\" /><path d=\"M8 14a2 2 0 0 0 2-2V8H8\" />","message-square-reply":"<path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\" /><path d=\"m10 8-3 3 3 3\" /><path d=\"M17 14v-1a2 2 0 0 0-2-2H7\" />","message-square-share":"<path d=\"M12 3H4a2 2 0 0 0-2 2v16.286a.71.71 0 0 0 1.212.502l2.202-2.202A2 2 0 0 1 6.828 19H20a2 2 0 0 0 2-2v-4\" /><path d=\"M16 3h6v6\" /><path d=\"m16 9 6-6\" />","message-square-text":"<path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\" /><path d=\"M7 11h10\" /><path d=\"M7 15h6\" /><path d=\"M7 7h8\" />","message-square-warning":"<path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\" /><path d=\"M12 15h.01\" /><path d=\"M12 7v4\" />","message-square-x":"<path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\" /><path d=\"m14.5 8.5-5 5\" /><path d=\"m9.5 8.5 5 5\" />","message-square":"<path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\" />","messages-circle":"<path d=\"M19.95 10.05a7 7 0 011.412 7.872 1 1 0 00-.058.787l.675 2.089a1 1 0 01-1.236 1.168l-2.155-.631a1 1 0 00-.745.06 7 7 0 01-7.793-1.445\" /><path d=\"M2.696 12.708a1 1 0 00-.058-.785 7 7 0 113.518 3.473 1 1 0 00-.744-.061l-2.155.63a1 1 0 01-1.236-1.167z\" />","messages-square":"<path d=\"M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z\" /><path d=\"M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1\" />","metronome":"<path d=\"M12 11.4V9.1\" /><path d=\"m12 17 6.59-6.59\" /><path d=\"m15.05 5.7-.218-.691a3 3 0 0 0-5.663 0L4.418 19.695A1 1 0 0 0 5.37 21h13.253a1 1 0 0 0 .951-1.31L18.45 16.2\" /><circle cx=\"20\" cy=\"9\" r=\"2\" />","mic-2":"<path d=\"m11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12\" /><path d=\"M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5\" /><circle cx=\"16\" cy=\"7\" r=\"5\" />","mic-audio-lines":"<path d=\"M10 3v2.341\" /><path d=\"M12 17v4\" /><path d=\"M14 5v.341\" /><path d=\"M18 5v13\" /><path d=\"M2 10v3\" /><path d=\"M22 10v3\" /><path d=\"M6 6v11\" /><path d=\"M9 21h6\" /><rect width=\"4\" height=\"8\" x=\"10\" y=\"9\" rx=\"2\" />","mic-off":"<path d=\"M12 19v3\" /><path d=\"M15 9.34V5a3 3 0 0 0-5.68-1.33\" /><path d=\"M16.95 16.95A7 7 0 0 1 5 12v-2\" /><path d=\"M18.89 13.23A7 7 0 0 0 19 12v-2\" /><path d=\"m2 2 20 20\" /><path d=\"M9 9v3a3 3 0 0 0 5.12 2.12\" />","mic-signal":"<path d=\"M12 17v4\" /><path d=\"M18 11a6 6 0 00-3-5.197\" /><path d=\"M2 11a10 10 0 015-8.662\" /><path d=\"M22 11a10 10 0 00-5-8.662\" /><path d=\"M6 11a6 6 0 013-5.197\" /><path d=\"M9 21h6\" /><rect x=\"10\" y=\"9\" width=\"4\" height=\"8\" rx=\"2\" />","mic-vocal":"<path d=\"m11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12\" /><path d=\"M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5\" /><circle cx=\"16\" cy=\"7\" r=\"5\" />","mic":"<path d=\"M12 19v3\" /><path d=\"M19 10v2a7 7 0 0 1-14 0v-2\" /><rect x=\"9\" y=\"2\" width=\"6\" height=\"13\" rx=\"3\" />","microchip":"<path d=\"M10 12h4\" /><path d=\"M10 17h4\" /><path d=\"M10 7h4\" /><path d=\"M18 12h2\" /><path d=\"M18 18h2\" /><path d=\"M18 6h2\" /><path d=\"M4 12h2\" /><path d=\"M4 18h2\" /><path d=\"M4 6h2\" /><rect x=\"6\" y=\"2\" width=\"12\" height=\"20\" rx=\"2\" />","microscope":"<path d=\"M6 18h8\" /><path d=\"M3 22h18\" /><path d=\"M14 22a7 7 0 1 0 0-14h-1\" /><path d=\"M9 14h2\" /><path d=\"M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z\" /><path d=\"M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3\" />","microwave":"<rect width=\"20\" height=\"15\" x=\"2\" y=\"4\" rx=\"2\" /><rect width=\"8\" height=\"7\" x=\"6\" y=\"8\" rx=\"1\" /><path d=\"M18 8v7\" /><path d=\"M6 19v2\" /><path d=\"M18 19v2\" />","midi-port":"<path d=\"M12 18h.01\" /><path d=\"M15 2.458V5a1 1 0 01-1 1h-4a1 1 0 01-1-1V2.458\" /><path d=\"M16 16h.01\" /><path d=\"M18 12h.01\" /><path d=\"M6 12h.01\" /><path d=\"M8 16h.01\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","milestone":"<path d=\"M12 13v8\" /><path d=\"M12 3v3\" /><path d=\"M18.172 6a2 2 0 0 1 1.414.586l2.06 2.06a1.207 1.207 0 0 1 0 1.708l-2.06 2.06a2 2 0 0 1-1.414.586H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z\" />","milk-off":"<path d=\"M8 2h8\" /><path d=\"M9 2v1.343M15 2v2.789a4 4 0 0 0 .672 2.219l.656.984a4 4 0 0 1 .672 2.22v1.131M7.8 7.8l-.128.192A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3\" /><path d=\"M7 15a6.47 6.47 0 0 1 5 0 6.472 6.472 0 0 0 3.435.435\" /><line x1=\"2\" x2=\"22\" y1=\"2\" y2=\"22\" />","milk":"<path d=\"M8 2h8\" /><path d=\"M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2\" /><path d=\"M7 15a6.472 6.472 0 0 1 5 0 6.47 6.47 0 0 0 5 0\" />","minimize-2":"<path d=\"m14 10 7-7\" /><path d=\"M20 10h-6V4\" /><path d=\"m3 21 7-7\" /><path d=\"M4 14h6v6\" />","minimize":"<path d=\"M8 3v3a2 2 0 0 1-2 2H3\" /><path d=\"M21 8h-3a2 2 0 0 1-2-2V3\" /><path d=\"M3 16h3a2 2 0 0 1 2 2v3\" /><path d=\"M16 21v-3a2 2 0 0 1 2-2h3\" />","minus-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M8 12h8\" />","minus-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M8 12h8\" />","minus":"<path d=\"M5 12h14\" />","mirror-rectangular":"<path d=\"M11 6 8 9\" /><path d=\"m16 7-8 8\" /><rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\" />","mirror-round":"<path d=\"M10 6.6 8.6 8\" /><path d=\"M12 18v4\" /><path d=\"M15 7.5 9.5 13\" /><path d=\"M7 22h10\" /><circle cx=\"12\" cy=\"10\" r=\"8\" />","monitor-check":"<path d=\"m9 10 2 2 4-4\" /><rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\" /><path d=\"M12 17v4\" /><path d=\"M8 21h8\" />","monitor-cloud":"<path d=\"M11 13a3 3 0 1 1 2.83-4H14a2 2 0 0 1 0 4z\" /><path d=\"M12 17v4\" /><path d=\"M8 21h8\" /><rect x=\"2\" y=\"3\" width=\"20\" height=\"14\" rx=\"2\" />","monitor-cog":"<path d=\"M12 17v4\" /><path d=\"m14.305 7.53.923-.382\" /><path d=\"m15.228 4.852-.923-.383\" /><path d=\"m16.852 3.228-.383-.924\" /><path d=\"m16.852 8.772-.383.923\" /><path d=\"m19.148 3.228.383-.924\" /><path d=\"m19.53 9.696-.382-.924\" /><path d=\"m20.772 4.852.924-.383\" /><path d=\"m20.772 7.148.924.383\" /><path d=\"M22 13v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7\" /><path d=\"M8 21h8\" /><circle cx=\"18\" cy=\"6\" r=\"3\" />","monitor-dot":"<path d=\"M12 17v4\" /><path d=\"M22 12.307V15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8.693\" /><path d=\"M8 21h8\" /><circle cx=\"19\" cy=\"6\" r=\"3\" />","monitor-down":"<path d=\"M12 13V7\" /><path d=\"m15 10-3 3-3-3\" /><rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\" /><path d=\"M12 17v4\" /><path d=\"M8 21h8\" />","monitor-off":"<path d=\"M12 17v4\" /><path d=\"M17 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 1.184-1.826\" /><path d=\"m2 2 20 20\" /><path d=\"M8 21h8\" /><path d=\"M8.656 3H20a2 2 0 0 1 2 2v10a2 2 0 0 1-.293 1.042\" />","monitor-pause":"<path d=\"M10 13V7\" /><path d=\"M14 13V7\" /><rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\" /><path d=\"M12 17v4\" /><path d=\"M8 21h8\" />","monitor-pc":"<path d=\"M10 15H4a2 2 0 01-2-2V7a2 2 0 012-2h6\" /><path d=\"M10 19H5\" /><path d=\"M14 11h8\" /><path d=\"M14 7h8\" /><path d=\"M18 17h.01\" /><path d=\"M9 19v-4\" /><rect x=\"14\" y=\"3\" width=\"8\" height=\"18\" rx=\"1\" />","monitor-play":"<path d=\"M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z\" /><path d=\"M12 17v4\" /><path d=\"M8 21h8\" /><rect x=\"2\" y=\"3\" width=\"20\" height=\"14\" rx=\"2\" />","monitor-smartphone":"<path d=\"M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8\" /><path d=\"M10 19v-3.96 3.15\" /><path d=\"M7 19h5\" /><rect width=\"6\" height=\"10\" x=\"16\" y=\"12\" rx=\"2\" />","monitor-speaker":"<path d=\"M5.5 20H8\" /><path d=\"M17 9h.01\" /><rect width=\"10\" height=\"16\" x=\"12\" y=\"4\" rx=\"2\" /><path d=\"M8 6H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4\" /><circle cx=\"17\" cy=\"15\" r=\"1\" />","monitor-stop":"<path d=\"M12 17v4\" /><path d=\"M8 21h8\" /><rect x=\"2\" y=\"3\" width=\"20\" height=\"14\" rx=\"2\" /><rect x=\"9\" y=\"7\" width=\"6\" height=\"6\" rx=\"1\" />","monitor-up":"<path d=\"m9 10 3-3 3 3\" /><path d=\"M12 13V7\" /><rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\" /><path d=\"M12 17v4\" /><path d=\"M8 21h8\" />","monitor-x":"<path d=\"m14.5 12.5-5-5\" /><path d=\"m9.5 12.5 5-5\" /><rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\" /><path d=\"M12 17v4\" /><path d=\"M8 21h8\" />","monitor":"<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\" /><line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\" /><line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\" />","moon-star":"<path d=\"M18 5h4\" /><path d=\"M20 3v4\" /><path d=\"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401\" />","moon":"<path d=\"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401\" />","mop-sparkles":"<path d=\"M10 22a3 3 0 01-3-3\" /><path d=\"M10 22c2.761 0 5-1.79 5-4-4.42 0-4.08-5-8.5-5a4.501 4.501 0 000 9z\" /><path d=\"M10 3H8\" /><path d=\"M12.5 11.5 22 2\" /><path d=\"M20 13v4\" /><path d=\"M22 15h-4\" /><path d=\"M4 5v4\" /><path d=\"M6 7H2\" /><path d=\"m6.98 13.02 2.665-2.664a1.21 1.21 0 011.71 0l2.29 2.288a1.21 1.21 0 010 1.712l-2.088 2.087\" /><path d=\"M9 2v2\" />","mop":"<path d=\"M10 22c2.761 0 5-1.79 5-4-4.42 0-4.08-5-8.5-5a1 1 0 100 9za3 3 0 01-3-3\" /><path d=\"M12.5 11.5 22 2\" /><path d=\"m6.98 13.02 2.665-2.664a1.21 1.21 0 011.71 0l2.29 2.288a1.21 1.21 0 010 1.712l-2.088 2.087\" />","more-horizontal":"<circle cx=\"12\" cy=\"12\" r=\"1\" /><circle cx=\"19\" cy=\"12\" r=\"1\" /><circle cx=\"5\" cy=\"12\" r=\"1\" />","more-vertical":"<circle cx=\"12\" cy=\"12\" r=\"1\" /><circle cx=\"12\" cy=\"5\" r=\"1\" /><circle cx=\"12\" cy=\"19\" r=\"1\" />","mosque":"<path d=\"M12.268 2a2 2 0 003.465 2\" /><path d=\"M14 5 L14 8\" /><path d=\"M16 22v-3a2 2 0 00-4 0v3\" /><path d=\"M21 13c-.662-1.497-1.666-2.753-2.9-3.63C16.825 8.47 15.422 8 14 8s-2.826.47-4.1 1.37C8.668 10.248 7.663 11.504 7 13z\" /><path d=\"M3 9h4\" /><path d=\"M7 22V6a5 5 0 00-2-4 5 5 0 00-2 4v14a2 2 0 002 2h14a2 2 0 002-2v-7\" />","motorbike":"<path d=\"m18 14-1-3\" /><path d=\"m3 9 6 2a2 2 0 0 1 2-2h2a2 2 0 0 1 1.99 1.81\" /><path d=\"M8 17h3a1 1 0 0 0 1-1 6 6 0 0 1 6-6 1 1 0 0 0 1-1v-.75A5 5 0 0 0 17 5\" /><circle cx=\"19\" cy=\"17\" r=\"3\" /><circle cx=\"5\" cy=\"17\" r=\"3\" />","mountain-snow":"<path d=\"m8 3 4 8 5-5 5 15H2L8 3z\" /><path d=\"M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19\" />","mountain":"<path d=\"m8 3 4 8 5-5 5 15H2L8 3z\" />","mouse-left":"<path d=\"M12 7.318V10\" /><path d=\"M5 10v5a7 7 0 0 0 14 0V9c0-3.527-2.608-6.515-6-7\" /><circle cx=\"7\" cy=\"4\" r=\"2\" />","mouse-off":"<path d=\"M12 6v.343\" /><path d=\"M18.218 18.218A7 7 0 0 1 5 15V9a7 7 0 0 1 .782-3.218\" /><path d=\"M19 13.343V9A7 7 0 0 0 8.56 2.902\" /><path d=\"M22 22 2 2\" />","mouse-pointer-2-off":"<path d=\"m15.55 8.45 5.138 2.087a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063L8.45 15.551\" /><path d=\"M22 2 2 22\" /><path d=\"m6.816 11.528-2.779-6.84a.495.495 0 0 1 .651-.651l6.84 2.779\" />","mouse-pointer-2":"<path d=\"M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z\" />","mouse-pointer-ban":"<path d=\"M2.034 2.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.944L8.204 7.545a1 1 0 0 0-.66.66l-1.066 3.443a.5.5 0 0 1-.944.033z\" /><circle cx=\"16\" cy=\"16\" r=\"6\" /><path d=\"m11.8 11.8 8.4 8.4\" />","mouse-pointer-click":"<path d=\"M14 4.1 12 6\" /><path d=\"m5.1 8-2.9-.8\" /><path d=\"m6 12-1.9 2\" /><path d=\"M7.2 2.2 8 5.1\" /><path d=\"M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z\" />","mouse-pointer-square-dashed":"<path d=\"M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z\" /><path d=\"M5 3a2 2 0 0 0-2 2\" /><path d=\"M19 3a2 2 0 0 1 2 2\" /><path d=\"M5 21a2 2 0 0 1-2-2\" /><path d=\"M9 3h1\" /><path d=\"M9 21h2\" /><path d=\"M14 3h1\" /><path d=\"M3 9v1\" /><path d=\"M21 9v2\" /><path d=\"M3 14v1\" />","mouse-pointer":"<path d=\"M12.586 12.586 19 19\" /><path d=\"M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z\" />","mouse-right":"<path d=\"M12 7.318V10\" /><path d=\"M19 10v5a7 7 0 0 1-14 0V9c0-3.527 2.608-6.515 6-7\" /><circle cx=\"17\" cy=\"4\" r=\"2\" />","mouse":"<rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"7\" /><path d=\"M12 6v4\" />","mouth-off":"<path d=\"M13.074 7.417a2.6 2.6 0 012.989.099c1.829 1.36 3.053 2.076 5.479 3.644a1 1 0 01.308 1.368 11.6 11.6 0 01-1.617 2.05\" /><path d=\"M2 12a50.5 50.5 0 0010.99.99\" /><path d=\"m2 2 20 20\" /><path d=\"M21 11a1 1 0 011 1 51 51 0 01-3.734.61\" /><path d=\"M7.695 7.695c-1.7 1.247-2.92 1.967-5.238 3.464a1 1 0 00-.307 1.369 11.6 11.6 0 0014.766 4.388\" />","mouth":"<path d=\"M2 12a50.5 50.5 0 0020 0 1 1 0 00-1-1\" /><path d=\"M2.457 11.159a1 1 0 00-.307 1.369 11.59 11.59 0 0019.7 0 1 1 0 00-.308-1.368c-2.426-1.568-3.65-2.284-5.479-3.644a2.6 2.6 0 00-3.373.208 1 1 0 01-1.38 0 2.62 2.62 0 00-3.373-.208c-1.83 1.36-3.053 2.076-5.48 3.643\" />","move-3-d":"<path d=\"M5 3v16h16\" /><path d=\"m5 19 6-6\" /><path d=\"m2 6 3-3 3 3\" /><path d=\"m18 16 3 3-3 3\" />","move-3d":"<path d=\"M5 3v16h16\" /><path d=\"m5 19 6-6\" /><path d=\"m2 6 3-3 3 3\" /><path d=\"m18 16 3 3-3 3\" />","move-diagonal-2":"<path d=\"M19 13v6h-6\" /><path d=\"M5 11V5h6\" /><path d=\"m5 5 14 14\" />","move-diagonal":"<path d=\"M11 19H5v-6\" /><path d=\"M13 5h6v6\" /><path d=\"M19 5 5 19\" />","move-down-left":"<path d=\"M11 19H5V13\" /><path d=\"M19 5L5 19\" />","move-down-right":"<path d=\"M19 13V19H13\" /><path d=\"M5 5L19 19\" />","move-down":"<path d=\"M8 18L12 22L16 18\" /><path d=\"M12 2V22\" />","move-horizontal":"<path d=\"m18 8 4 4-4 4\" /><path d=\"M2 12h20\" /><path d=\"m6 8-4 4 4 4\" />","move-left":"<path d=\"M6 8L2 12L6 16\" /><path d=\"M2 12H22\" />","move-right":"<path d=\"M18 8L22 12L18 16\" /><path d=\"M2 12H22\" />","move-up-left":"<path d=\"M5 11V5H11\" /><path d=\"M5 5L19 19\" />","move-up-right":"<path d=\"M13 5H19V11\" /><path d=\"M19 5L5 19\" />","move-up":"<path d=\"M8 6L12 2L16 6\" /><path d=\"M12 2V22\" />","move-vertical":"<path d=\"M12 2v20\" /><path d=\"m8 18 4 4 4-4\" /><path d=\"m8 6 4-4 4 4\" />","move":"<path d=\"M12 2v20\" /><path d=\"m15 19-3 3-3-3\" /><path d=\"m19 9 3 3-3 3\" /><path d=\"M2 12h20\" /><path d=\"m5 9-3 3 3 3\" /><path d=\"m9 5 3-3 3 3\" />","music-2":"<circle cx=\"8\" cy=\"18\" r=\"4\" /><path d=\"M12 18V2l7 4\" />","music-3":"<circle cx=\"12\" cy=\"18\" r=\"4\" /><path d=\"M16 18V2\" />","music-4":"<path d=\"M9 18V5l12-2v13\" /><path d=\"m9 9 12-2\" /><circle cx=\"6\" cy=\"18\" r=\"3\" /><circle cx=\"18\" cy=\"16\" r=\"3\" />","music":"<path d=\"M9 18V5l12-2v13\" /><circle cx=\"6\" cy=\"18\" r=\"3\" /><circle cx=\"18\" cy=\"16\" r=\"3\" />","navigation-2-off":"<path d=\"M9.31 9.31 5 21l7-4 7 4-1.17-3.17\" /><path d=\"M14.53 8.88 12 2l-1.17 3.17\" /><line x1=\"2\" x2=\"22\" y1=\"2\" y2=\"22\" />","navigation-2":"<polygon points=\"12 2 19 21 12 17 5 21 12 2\" />","navigation-off":"<path d=\"M8.43 8.43 3 11l8 2 2 8 2.57-5.43\" /><path d=\"M17.39 11.73 22 2l-9.73 4.61\" /><line x1=\"2\" x2=\"22\" y1=\"2\" y2=\"22\" />","navigation":"<polygon points=\"3 11 22 2 13 21 11 13 3 11\" />","nepali-rupee":"<path d=\"M18 16.173 A4.74 4.74 0 0 0 13.496 8.005\" /><path d=\"M4 3 L20 3\" /><path d=\"M5 13 L13.5 21\" /><path d=\"M5 13 L9 13\" /><path d=\"M8 13 C15.5 13 14.667 3 8 3\" />","network":"<rect x=\"16\" y=\"16\" width=\"6\" height=\"6\" rx=\"1\" /><rect x=\"2\" y=\"16\" width=\"6\" height=\"6\" rx=\"1\" /><rect x=\"9\" y=\"2\" width=\"6\" height=\"6\" rx=\"1\" /><path d=\"M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3\" /><path d=\"M12 12V8\" />","newspaper":"<path d=\"M15 18h-5\" /><path d=\"M18 14h-8\" /><path d=\"M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2\" /><rect width=\"8\" height=\"4\" x=\"10\" y=\"6\" rx=\"1\" />","nfc":"<path d=\"M6 8.32a7.43 7.43 0 0 1 0 7.36\" /><path d=\"M9.46 6.21a11.76 11.76 0 0 1 0 11.58\" /><path d=\"M12.91 4.1a15.91 15.91 0 0 1 .01 15.8\" /><path d=\"M16.37 2a20.16 20.16 0 0 1 0 20\" />","non-binary":"<path d=\"M12 2v10\" /><path d=\"m8.5 4 7 4\" /><path d=\"m8.5 8 7-4\" /><circle cx=\"12\" cy=\"17\" r=\"5\" />","notebook-dot":"<path d=\"M16 11.75V22\" /><path d=\"M2 10h4\" /><path d=\"M2 14h4\" /><path d=\"M2 18h4\" /><path d=\"M2 6h4\" /><path d=\"M20 11.75V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h5.65\" /><circle cx=\"18\" cy=\"5\" r=\"3\" />","notebook-pen":"<path d=\"M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4\" /><path d=\"M2 6h4\" /><path d=\"M2 10h4\" /><path d=\"M2 14h4\" /><path d=\"M2 18h4\" /><path d=\"M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\" />","notebook-tabs":"<path d=\"M2 6h4\" /><path d=\"M2 10h4\" /><path d=\"M2 14h4\" /><path d=\"M2 18h4\" /><rect width=\"16\" height=\"20\" x=\"4\" y=\"2\" rx=\"2\" /><path d=\"M15 2v20\" /><path d=\"M15 7h5\" /><path d=\"M15 12h5\" /><path d=\"M15 17h5\" />","notebook-text":"<path d=\"M2 6h4\" /><path d=\"M2 10h4\" /><path d=\"M2 14h4\" /><path d=\"M2 18h4\" /><rect width=\"16\" height=\"20\" x=\"4\" y=\"2\" rx=\"2\" /><path d=\"M9.5 8h5\" /><path d=\"M9.5 12H16\" /><path d=\"M9.5 16H14\" />","notebook":"<path d=\"M2 6h4\" /><path d=\"M2 10h4\" /><path d=\"M2 14h4\" /><path d=\"M2 18h4\" /><rect width=\"16\" height=\"20\" x=\"4\" y=\"2\" rx=\"2\" /><path d=\"M16 2v20\" />","notepad-text-dashed":"<path d=\"M8 2v4\" /><path d=\"M12 2v4\" /><path d=\"M16 2v4\" /><path d=\"M16 4h2a2 2 0 0 1 2 2v2\" /><path d=\"M20 12v2\" /><path d=\"M20 18v2a2 2 0 0 1-2 2h-1\" /><path d=\"M13 22h-2\" /><path d=\"M7 22H6a2 2 0 0 1-2-2v-2\" /><path d=\"M4 14v-2\" /><path d=\"M4 8V6a2 2 0 0 1 2-2h2\" /><path d=\"M8 10h6\" /><path d=\"M8 14h8\" /><path d=\"M8 18h5\" />","notepad-text":"<path d=\"M8 2v4\" /><path d=\"M12 2v4\" /><path d=\"M16 2v4\" /><rect width=\"16\" height=\"18\" x=\"4\" y=\"4\" rx=\"2\" /><path d=\"M8 10h6\" /><path d=\"M8 14h8\" /><path d=\"M8 18h5\" />","nut-off":"<path d=\"M12 4V2\" /><path d=\"M5 10v4a7.004 7.004 0 0 0 5.277 6.787c.412.104.802.292 1.102.592L12 22l.621-.621c.3-.3.69-.488 1.102-.592a7.01 7.01 0 0 0 4.125-2.939\" /><path d=\"M19 10v3.343\" /><path d=\"M12 12c-1.349-.573-1.905-1.005-2.5-2-.546.902-1.048 1.353-2.5 2-1.018-.644-1.46-1.08-2-2-1.028.71-1.69.918-3 1 1.081-1.048 1.757-2.03 2-3 .194-.776.84-1.551 1.79-2.21m11.654 5.997c.887-.457 1.28-.891 1.556-1.787 1.032.916 1.683 1.157 3 1-1.297-1.036-1.758-2.03-2-3-.5-2-4-4-8-4-.74 0-1.461.068-2.15.192\" /><line x1=\"2\" x2=\"22\" y1=\"2\" y2=\"22\" />","nut":"<path d=\"M12 4V2\" /><path d=\"M5 10v4a7.004 7.004 0 0 0 5.277 6.787c.412.104.802.292 1.102.592L12 22l.621-.621c.3-.3.69-.488 1.102-.592A7.003 7.003 0 0 0 19 14v-4\" /><path d=\"M12 4C8 4 4.5 6 4 8c-.243.97-.919 1.952-2 3 1.31-.082 1.972-.29 3-1 .54.92.982 1.356 2 2 1.452-.647 1.954-1.098 2.5-2 .595.995 1.151 1.427 2.5 2 1.31-.621 1.862-1.058 2.5-2 .629.977 1.162 1.423 2.5 2 1.209-.548 1.68-.967 2-2 1.032.916 1.683 1.157 3 1-1.297-1.036-1.758-2.03-2-3-.5-2-4-4-8-4Z\" />","octagon-alert":"<path d=\"M12 16h.01\" /><path d=\"M12 8v4\" /><path d=\"M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z\" />","octagon-minus":"<path d=\"M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z\" /><path d=\"M8 12h8\" />","octagon-pause":"<path d=\"M10 15V9\" /><path d=\"M14 15V9\" /><path d=\"M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z\" />","octagon-x":"<path d=\"m15 9-6 6\" /><path d=\"M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z\" /><path d=\"m9 9 6 6\" />","octagon":"<path d=\"M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z\" />","omega":"<path d=\"M3 20h4.5a.5.5 0 0 0 .5-.5v-.282a.52.52 0 0 0-.247-.437 8 8 0 1 1 8.494-.001.52.52 0 0 0-.247.438v.282a.5.5 0 0 0 .5.5H21\" />","option":"<path d=\"M14 3h7\" /><path d=\"M3 3h5.28a1 1 0 0 1 .948.684l5.544 16.632a1 1 0 0 0 .949.684H21\" />","orbit":"<path d=\"M20.341 6.484A10 10 0 0 1 10.266 21.85\" /><path d=\"M3.659 17.516A10 10 0 0 1 13.74 2.152\" /><circle cx=\"12\" cy=\"12\" r=\"3\" /><circle cx=\"19\" cy=\"5\" r=\"2\" /><circle cx=\"5\" cy=\"19\" r=\"2\" />","origami":"<path d=\"M12 12V4a1 1 0 0 1 1-1h6.297a1 1 0 0 1 .651 1.759l-4.696 4.025\" /><path d=\"m12 21-7.414-7.414A2 2 0 0 1 4 12.172V6.415a1.002 1.002 0 0 1 1.707-.707L20 20.009\" /><path d=\"m12.214 3.381 8.414 14.966a1 1 0 0 1-.167 1.199l-1.168 1.163a1 1 0 0 1-.706.291H6.351a1 1 0 0 1-.625-.219L3.25 18.8a1 1 0 0 1 .631-1.781l4.165.027\" />","outdent":"<path d=\"M21 5H11\" /><path d=\"M21 12H11\" /><path d=\"M21 19H11\" /><path d=\"m7 8-4 4 4 4\" />","package-2":"<path d=\"M12 3v6\" /><path d=\"M16.76 3a2 2 0 0 1 1.8 1.1l2.23 4.479a2 2 0 0 1 .21.891V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.472a2 2 0 0 1 .211-.894L5.45 4.1A2 2 0 0 1 7.24 3z\" /><path d=\"M3.054 9.013h17.893\" />","package-check":"<path d=\"M12 22V12\" /><path d=\"m16 17 2 2 4-4\" /><path d=\"M21 11.127V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.32-.753\" /><path d=\"M3.29 7 12 12l8.71-5\" /><path d=\"m7.5 4.27 8.997 5.148\" />","package-minus":"<path d=\"M12 22V12\" /><path d=\"M16 17h6\" /><path d=\"M21 13V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.675-.955\" /><path d=\"M3.29 7 12 12l8.71-5\" /><path d=\"m7.5 4.27 8.997 5.148\" />","package-open":"<path d=\"M12 22v-9\" /><path d=\"M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z\" /><path d=\"M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13\" /><path d=\"M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z\" />","package-plus":"<path d=\"M12 22V12\" /><path d=\"M16 17h6\" /><path d=\"M19 14v6\" /><path d=\"M21 10.535V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.675-.955\" /><path d=\"M3.29 7 12 12l8.71-5\" /><path d=\"m7.5 4.27 8.997 5.148\" />","package-search":"<path d=\"M12 22V12\" /><path d=\"M20.27 18.27 22 20\" /><path d=\"M21 10.498V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l.98-.559\" /><path d=\"M3.29 7 12 12l8.71-5\" /><path d=\"m7.5 4.27 8.997 5.148\" /><circle cx=\"18.5\" cy=\"16.5\" r=\"2.5\" />","package-x":"<path d=\"M12 22V12\" /><path d=\"m16.5 14.5 5 5\" /><path d=\"m16.5 19.5 5-5\" /><path d=\"M21 10.5V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l.13-.074\" /><path d=\"M3.29 7 12 12l8.71-5\" /><path d=\"m7.5 4.27 8.997 5.148\" />","package":"<path d=\"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z\" /><path d=\"M12 22V12\" /><polyline points=\"3.29 7 12 12 20.71 7\" /><path d=\"m7.5 4.27 9 5.15\" />","paint-bucket":"<path d=\"M11 7 6 2\" /><path d=\"M18.992 12H2.041\" /><path d=\"M21.145 18.38A3.34 3.34 0 0 1 20 16.5a3.3 3.3 0 0 1-1.145 1.88c-.575.46-.855 1.02-.855 1.595A2 2 0 0 0 20 22a2 2 0 0 0 2-2.025c0-.58-.285-1.13-.855-1.595\" /><path d=\"m8.5 4.5 2.148-2.148a1.205 1.205 0 0 1 1.704 0l7.296 7.296a1.205 1.205 0 0 1 0 1.704l-7.592 7.592a3.615 3.615 0 0 1-5.112 0l-3.888-3.888a3.615 3.615 0 0 1 0-5.112L5.67 7.33\" />","paint-roller":"<rect width=\"16\" height=\"6\" x=\"2\" y=\"2\" rx=\"2\" /><path d=\"M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2\" /><rect width=\"4\" height=\"6\" x=\"8\" y=\"16\" rx=\"1\" />","paintbrush-2":"<path d=\"M10 2v2\" /><path d=\"M14 2v4\" /><path d=\"M17 2a1 1 0 0 1 1 1v9H6V3a1 1 0 0 1 1-1z\" /><path d=\"M6 12a1 1 0 0 0-1 1v1a2 2 0 0 0 2 2h2a1 1 0 0 1 1 1v2.9a2 2 0 1 0 4 0V17a1 1 0 0 1 1-1h2a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1\" />","paintbrush-vertical":"<path d=\"M10 2v2\" /><path d=\"M14 2v4\" /><path d=\"M17 2a1 1 0 0 1 1 1v9H6V3a1 1 0 0 1 1-1z\" /><path d=\"M6 12a1 1 0 0 0-1 1v1a2 2 0 0 0 2 2h2a1 1 0 0 1 1 1v2.9a2 2 0 1 0 4 0V17a1 1 0 0 1 1-1h2a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1\" />","paintbrush":"<path d=\"m14.622 17.897-10.68-2.913\" /><path d=\"M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z\" /><path d=\"M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15\" />","palette":"<path d=\"M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z\" /><circle cx=\"13.5\" cy=\"6.5\" r=\".5\" fill=\"currentColor\" /><circle cx=\"17.5\" cy=\"10.5\" r=\".5\" fill=\"currentColor\" /><circle cx=\"6.5\" cy=\"12.5\" r=\".5\" fill=\"currentColor\" /><circle cx=\"8.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\" />","palmtree":"<path d=\"M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4\" /><path d=\"M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3\" /><path d=\"M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35\" /><path d=\"M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14\" />","panda":"<path d=\"M11.25 17.25h1.5L12 18z\" /><path d=\"m15 12 2 2\" /><path d=\"M17.902 6.599a8 8 0 0 0-.5-.5\" /><path d=\"M2 14.5C2 19.47 6.48 22 12 22s10-2.53 10-7.5a10 10 0 0 0-1.3-4.83 4.5 4.5 0 1 0-7.05-5.5 8 8 0 0 0-3.3 0 4.5 4.5 0 1 0-7.04 5.5A10 10 0 0 0 2 14.5\" /><path d=\"M6.099 6.599a8 8 0 0 1 .5-.5\" /><path d=\"m9 12-2 2\" />","panel-bottom-close":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M3 15h18\" /><path d=\"m15 8-3 3-3-3\" />","panel-bottom-dashed":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M14 15h1\" /><path d=\"M19 15h2\" /><path d=\"M3 15h2\" /><path d=\"M9 15h1\" />","panel-bottom-inactive":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M14 15h1\" /><path d=\"M19 15h2\" /><path d=\"M3 15h2\" /><path d=\"M9 15h1\" />","panel-bottom-open":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M3 15h18\" /><path d=\"m9 10 3-3 3 3\" />","panel-bottom":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M3 15h18\" />","panel-left-close":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M9 3v18\" /><path d=\"m16 15-3-3 3-3\" />","panel-left-dashed":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M9 14v1\" /><path d=\"M9 19v2\" /><path d=\"M9 3v2\" /><path d=\"M9 9v1\" />","panel-left-inactive":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M9 14v1\" /><path d=\"M9 19v2\" /><path d=\"M9 3v2\" /><path d=\"M9 9v1\" />","panel-left-open":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M9 3v18\" /><path d=\"m14 9 3 3-3 3\" />","panel-left-right-dashed":"<path d=\"M15 10V9\" /><path d=\"M15 15v-1\" /><path d=\"M15 21v-2\" /><path d=\"M15 5V3\" /><path d=\"M9 10V9\" /><path d=\"M9 15v-1\" /><path d=\"M9 21v-2\" /><path d=\"M9 5V3\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","panel-left":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M9 3v18\" />","panel-right-close":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M15 3v18\" /><path d=\"m8 9 3 3-3 3\" />","panel-right-dashed":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M15 14v1\" /><path d=\"M15 19v2\" /><path d=\"M15 3v2\" /><path d=\"M15 9v1\" />","panel-right-inactive":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M15 14v1\" /><path d=\"M15 19v2\" /><path d=\"M15 3v2\" /><path d=\"M15 9v1\" />","panel-right-open":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M15 3v18\" /><path d=\"m10 15-3-3 3-3\" />","panel-right":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M15 3v18\" />","panel-top-bottom-dashed":"<path d=\"M14 15h1\" /><path d=\"M14 9h1\" /><path d=\"M19 15h2\" /><path d=\"M19 9h2\" /><path d=\"M3 15h2\" /><path d=\"M3 9h2\" /><path d=\"M9 15h1\" /><path d=\"M9 9h1\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","panel-top-close":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M3 9h18\" /><path d=\"m9 16 3-3 3 3\" />","panel-top-dashed":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M14 9h1\" /><path d=\"M19 9h2\" /><path d=\"M3 9h2\" /><path d=\"M9 9h1\" />","panel-top-inactive":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M14 9h1\" /><path d=\"M19 9h2\" /><path d=\"M3 9h2\" /><path d=\"M9 9h1\" />","panel-top-open":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M3 9h18\" /><path d=\"m15 14-3 3-3-3\" />","panel-top":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M3 9h18\" />","panels-left-bottom":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M9 3v18\" /><path d=\"M9 15h12\" />","panels-left-right":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M9 3v18\" /><path d=\"M15 3v18\" />","panels-right-bottom":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M3 15h12\" /><path d=\"M15 3v18\" />","panels-top-bottom":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M21 9H3\" /><path d=\"M21 15H3\" />","panels-top-left":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M3 9h18\" /><path d=\"M9 21V9\" />","paper-bag":"<path d=\"M5.364 3.848C4 6 3 9.652 3 12.652V19a2 2 0 002 2h14a2 2 0 002-2v-5c0-2.334-1.816-4.668-2.622-7.002\" /><path d=\"M7 3h11.379a2 2 0 011.789 1.106l.723 1.447A1 1 0 0119.997 7h-8.525a2 2 0 01-1.789-1.106L8.79 4.105a2 2 0 10-3.579 1.789l2.261 4.522A5 5 0 018 12.652V21\" />","paperclip":"<path d=\"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551\" />","parasol":"<path d=\"M12.5 11.134 18.196 21\" /><path d=\"M20.425 5.299a10 10 0 0 0-16.941 9.78c.183.563.843.774 1.355.478L20.16 6.711c.512-.296.66-.973.264-1.413\" /><path d=\"M21 21H3\" />","parentheses":"<path d=\"M8 21s-4-3-4-9 4-9 4-9\" /><path d=\"M16 3s4 3 4 9-4 9-4 9\" />","park":"<path d=\"M12 18h10\" /><path d=\"M13.248 9.998A4.5 4.5 0 0 0 11.75 8.6V8a1 1 0 0 0-7.5 0 4.9 4.9 0 0 0 2.25 9H8\" /><path d=\"m15 14-2 6\" /><path d=\"m19 14 2 6\" /><path d=\"M21 14h-8\" /><path d=\"M8 20v-5.922a2 2 0 0 0-.586-1.414L6.5 11.75\" /><path d=\"M9.205 12.795 8 14\" /><circle cx=\"19\" cy=\"6\" r=\"2\" />","parking-circle-off":"<path d=\"M12.656 7H13a3 3 0 0 1 2.984 3.307\" /><path d=\"M13 13H9\" /><path d=\"M19.071 19.071A1 1 0 0 1 4.93 4.93\" /><path d=\"m2 2 20 20\" /><path d=\"M8.357 2.687a10 10 0 0 1 12.956 12.956\" /><path d=\"M9 17V9\" />","parking-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M9 17V7h4a3 3 0 0 1 0 6H9\" />","parking-meter":"<path d=\"M11 15h2\" /><path d=\"M12 12v3\" /><path d=\"M12 19v3\" /><path d=\"M15.282 19a1 1 0 0 0 .948-.68l2.37-6.988a7 7 0 1 0-13.2 0l2.37 6.988a1 1 0 0 0 .948.68z\" /><path d=\"M9 9a3 3 0 1 1 6 0\" />","parking-square-off":"<path d=\"M3.6 3.6A2 2 0 0 1 5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-.59 1.41\" /><path d=\"M3 8.7V19a2 2 0 0 0 2 2h10.3\" /><path d=\"m2 2 20 20\" /><path d=\"M13 13a3 3 0 1 0 0-6H9v2\" /><path d=\"M9 17v-2.3\" />","parking-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M9 17V7h4a3 3 0 0 1 0 6H9\" />","party-popper":"<path d=\"M5.8 11.3 2 22l10.7-3.79\" /><path d=\"M4 3h.01\" /><path d=\"M22 8h.01\" /><path d=\"M15 2h.01\" /><path d=\"M22 20h.01\" /><path d=\"m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10\" /><path d=\"m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17\" /><path d=\"m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7\" /><path d=\"M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z\" />","pause-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><line x1=\"10\" x2=\"10\" y1=\"15\" y2=\"9\" /><line x1=\"14\" x2=\"14\" y1=\"15\" y2=\"9\" />","pause-octagon":"<path d=\"M10 15V9\" /><path d=\"M14 15V9\" /><path d=\"M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z\" />","pause":"<rect x=\"14\" y=\"3\" width=\"5\" height=\"18\" rx=\"1\" /><rect x=\"5\" y=\"3\" width=\"5\" height=\"18\" rx=\"1\" />","paw-print":"<circle cx=\"11\" cy=\"4\" r=\"2\" /><circle cx=\"18\" cy=\"8\" r=\"2\" /><circle cx=\"20\" cy=\"16\" r=\"2\" /><path d=\"M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z\" />","pc-case":"<rect width=\"14\" height=\"20\" x=\"5\" y=\"2\" rx=\"2\" /><path d=\"M15 14h.01\" /><path d=\"M9 6h6\" /><path d=\"M9 10h6\" />","pen-box":"<path d=\"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\" /><path d=\"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z\" />","pen-line":"<path d=\"M13 21h8\" /><path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\" />","pen-off":"<path d=\"m10 10-6.157 6.162a2 2 0 0 0-.5.833l-1.322 4.36a.5.5 0 0 0 .622.624l4.358-1.323a2 2 0 0 0 .83-.5L14 13.982\" /><path d=\"m12.829 7.172 4.359-4.346a1 1 0 1 1 3.986 3.986l-4.353 4.353\" /><path d=\"m2 2 20 20\" />","pen-square":"<path d=\"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\" /><path d=\"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z\" />","pen-tool":"<path d=\"M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z\" /><path d=\"m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18\" /><path d=\"m2.3 2.3 7.286 7.286\" /><circle cx=\"11\" cy=\"11\" r=\"2\" />","pen":"<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\" />","pencil-line":"<path d=\"M13 21h8\" /><path d=\"m15 5 4 4\" /><path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\" />","pencil-off":"<path d=\"m10 10-6.157 6.162a2 2 0 0 0-.5.833l-1.322 4.36a.5.5 0 0 0 .622.624l4.358-1.323a2 2 0 0 0 .83-.5L14 13.982\" /><path d=\"m12.829 7.172 4.359-4.346a1 1 0 1 1 3.986 3.986l-4.353 4.353\" /><path d=\"m15 5 4 4\" /><path d=\"m2 2 20 20\" />","pencil-ruler":"<path d=\"M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13\" /><path d=\"m8 6 2-2\" /><path d=\"m18 16 2-2\" /><path d=\"m17 11 4.3 4.3c.94.94.94 2.46 0 3.4l-2.6 2.6c-.94.94-2.46.94-3.4 0L11 17\" /><path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\" /><path d=\"m15 5 4 4\" />","pencil-sparkles":"<path d=\"M10 3H8\" /><path d=\"m15.007 5.008 3.987 3.986\" /><path d=\"M20 15v4\" /><path d=\"M21.174 6.813a2.82 2.82 0 0 0-3.986-3.987L3.842 16.175a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\" /><path d=\"M22 17h-4\" /><path d=\"M4 5v4\" /><path d=\"M6 7H2\" /><path d=\"M9 2v2\" />","pencil":"<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\" /><path d=\"m15 5 4 4\" />","pentagon":"<path d=\"M10.83 2.38a2 2 0 0 1 2.34 0l8 5.74a2 2 0 0 1 .73 2.25l-3.04 9.26a2 2 0 0 1-1.9 1.37H7.04a2 2 0 0 1-1.9-1.37L2.1 10.37a2 2 0 0 1 .73-2.25z\" />","percent-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m15 9-6 6\" /><path d=\"M9 9h.01\" /><path d=\"M15 15h.01\" />","percent-diamond":"<path d=\"M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0Z\" /><path d=\"M9.2 9.2h.01\" /><path d=\"m14.5 9.5-5 5\" /><path d=\"M14.7 14.8h.01\" />","percent-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"m15 9-6 6\" /><path d=\"M9 9h.01\" /><path d=\"M15 15h.01\" />","percent":"<line x1=\"19\" x2=\"5\" y1=\"5\" y2=\"19\" /><circle cx=\"6.5\" cy=\"6.5\" r=\"2.5\" /><circle cx=\"17.5\" cy=\"17.5\" r=\"2.5\" />","person-standing":"<circle cx=\"12\" cy=\"5\" r=\"1\" /><path d=\"m9 20 3-6 3 6\" /><path d=\"m6 8 6 2 6-2\" /><path d=\"M12 10v4\" />","phi":"<path d=\"M12 2v20\" /><circle cx=\"12\" cy=\"12\" r=\"7\" />","philippine-peso":"<path d=\"M20 11H4\" /><path d=\"M20 7H4\" /><path d=\"M7 21V4a1 1 0 0 1 1-1h4a1 1 0 0 1 0 12H7\" />","phone-call":"<path d=\"M13 2a9 9 0 0 1 9 9\" /><path d=\"M13 6a5 5 0 0 1 5 5\" /><path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\" />","phone-forwarded":"<path d=\"M14 6h8\" /><path d=\"m18 2 4 4-4 4\" /><path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\" />","phone-incoming":"<path d=\"M16 2v6h6\" /><path d=\"m22 2-6 6\" /><path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\" />","phone-missed":"<path d=\"m16 2 6 6\" /><path d=\"m22 2-6 6\" /><path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\" />","phone-off":"<path d=\"M10.1 13.9a14 14 0 0 0 3.732 2.668 1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2 18 18 0 0 1-12.728-5.272\" /><path d=\"M22 2 2 22\" /><path d=\"M4.76 13.582A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 .244.473\" />","phone-outgoing":"<path d=\"m16 8 6-6\" /><path d=\"M22 8V2h-6\" /><path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\" />","phone":"<path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\" />","pi-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M7 7h10\" /><path d=\"M10 7v10\" /><path d=\"M16 17a2 2 0 0 1-2-2V7\" />","pi":"<line x1=\"9\" x2=\"9\" y1=\"4\" y2=\"20\" /><path d=\"M4 7c0-1.7 1.3-3 3-3h13\" /><path d=\"M18 20c-1.7 0-3-1.3-3-3V4\" />","piano":"<path d=\"M10 13v4\" /><path d=\"M14 13v4\" /><path d=\"M18 13v4\" /><path d=\"M2 13h20\" /><path d=\"M22 11.5A3.5 3.5 0 0018.5 8a3.52 3.52 0 01-3.173-2A7 7 0 002 9v10a2 2 0 002 2h16a2 2 0 002-2z\" /><path d=\"M6 13v4\" />","pickaxe":"<path d=\"m14 13-8.381 8.38a1 1 0 0 1-3.001-3L11 9.999\" /><path d=\"M15.973 4.027A13 13 0 0 0 5.902 2.373c-1.398.342-1.092 2.158.277 2.601a19.9 19.9 0 0 1 5.822 3.024\" /><path d=\"M16.001 11.999a19.9 19.9 0 0 1 3.024 5.824c.444 1.369 2.26 1.676 2.603.278A13 13 0 0 0 20 8.069\" /><path d=\"M18.352 3.352a1.205 1.205 0 0 0-1.704 0l-5.296 5.296a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l5.296-5.296a1.205 1.205 0 0 0 0-1.704z\" />","picture-in-picture-2":"<path d=\"M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4\" /><rect width=\"10\" height=\"7\" x=\"12\" y=\"13\" rx=\"2\" />","picture-in-picture":"<path d=\"M2 10h6V4\" /><path d=\"m2 4 6 6\" /><path d=\"M21 10V7a2 2 0 0 0-2-2h-7\" /><path d=\"M3 14v2a2 2 0 0 0 2 2h3\" /><rect x=\"12\" y=\"14\" width=\"10\" height=\"7\" rx=\"1\" />","pie-chart":"<path d=\"M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z\" /><path d=\"M21.21 15.89A10 10 0 1 1 8 2.83\" />","piggy-bank":"<path d=\"M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z\" /><path d=\"M16 10h.01\" /><path d=\"M2 8v1a2 2 0 0 0 2 2h1\" />","pilcrow-left":"<path d=\"M14 3v11\" /><path d=\"M14 9h-3a3 3 0 0 1 0-6h9\" /><path d=\"M18 3v11\" /><path d=\"M22 18H2l4-4\" /><path d=\"m6 22-4-4\" />","pilcrow-right":"<path d=\"M10 3v11\" /><path d=\"M10 9H7a1 1 0 0 1 0-6h8\" /><path d=\"M14 3v11\" /><path d=\"m18 14 4 4H2\" /><path d=\"m22 18-4 4\" />","pilcrow-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M12 12H9.5a2.5 2.5 0 0 1 0-5H17\" /><path d=\"M12 7v10\" /><path d=\"M16 7v10\" />","pilcrow":"<path d=\"M13 4v16\" /><path d=\"M17 4v16\" /><path d=\"M19 4H9.5a4.5 4.5 0 0 0 0 9H13\" />","pill-bottle":"<path d=\"M18 11h-4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h4\" /><path d=\"M6 7v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7\" /><rect width=\"16\" height=\"5\" x=\"4\" y=\"2\" rx=\"1\" />","pill":"<path d=\"m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z\" /><path d=\"m8.5 8.5 7 7\" />","pin-off":"<path d=\"M12 17v5\" /><path d=\"M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89\" /><path d=\"m2 2 20 20\" /><path d=\"M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11\" />","pin":"<path d=\"M12 17v5\" /><path d=\"M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z\" />","pipette":"<path d=\"m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12\" /><path d=\"m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z\" /><path d=\"m2 22 .414-.414\" />","pizza":"<path d=\"m12 14-1 1\" /><path d=\"m13.75 18.25-1.25 1.42\" /><path d=\"M17.775 5.654a15.68 15.68 0 0 0-12.121 12.12\" /><path d=\"M18.8 9.3a1 1 0 0 0 2.1 7.7\" /><path d=\"M21.964 20.732a1 1 0 0 1-1.232 1.232l-18-5a1 1 0 0 1-.695-1.232A19.68 19.68 0 0 1 15.732 2.037a1 1 0 0 1 1.232.695z\" />","plane-landing":"<path d=\"M2 22h20\" /><path d=\"M3.77 10.77 2 9l2-4.5 1.1.55c.55.28.9.84.9 1.45s.35 1.17.9 1.45L8 8.5l3-6 1.05.53a2 2 0 0 1 1.09 1.52l.72 5.4a2 2 0 0 0 1.09 1.52l4.4 2.2c.42.22.78.55 1.01.96l.6 1.03c.49.88-.06 1.98-1.06 2.1l-1.18.15c-.47.06-.95-.02-1.37-.24L4.29 11.15a2 2 0 0 1-.52-.38Z\" />","plane-takeoff":"<path d=\"M2 22h20\" /><path d=\"M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z\" />","plane":"<path d=\"M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z\" />","plant-pot":"<path d=\"M14 8.536V6a4 4 0 014-4h1.5a.5.5 0 01.5.5V4a4 4 0 01-4 4 4 4 0 00-4 4 5 5 0 01-8-4 5 5 0 018 4c0 2 1 3 1 5\" /><path d=\"m18 17-1.085 3.58A2 2 0 0115 22H9.002a2 2 0 01-1.913-1.418L6 17\" /><path d=\"M5 17h14\" />","play-circle":"<path d=\"M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","play-off":"<path d=\"m10.215 4.56 9.79 5.71a2 2 0 0 1 .003 3.458l-.393.23\" /><path d=\"m16.042 16.042-8.034 4.686A2 2 0 0 1 5 19V5\" /><path d=\"m2 2 20 20\" />","play-square":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" /><path d=\"M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z\" />","play":"<path d=\"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z\" />","playing-card":"<path d=\"M12.832 8.445a1 1 0 00-1.589-.098l-2.075 3.098a1 1 0 000 1.11l2 3a1 1 0 001.664 0l2-3a1 1 0 000-1.11z\" /><rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\" />","playing-cards-fan":"<path d=\"M12.65 7.65a2 2 0 012.629-1.046l5.51 2.374a2 2 0 011.046 2.628l-3.957 9.184a2 2 0 01-2.628 1.046l-5.51-2.374a2 2 0 01-1.046-2.628z\" /><path d=\"M18 7.777V4a2 2 0 00-2-2h-6a2 2 0 00-2 2v10a2 2 0 001.137 1.805\" /><path d=\"m8 4.389-4.364.809a2 2 0 00-1.602 2.33l1.822 9.833a2 2 0 002.331 1.602l2.542-.47\" />","playing-cards":"<path d=\"M14.832 8.445a1 1 0 00-1.589-.098l-2.075 3.098a1 1 0 000 1.11l2 3a1 1 0 001.664 0l2-3a1 1 0 000-1.11z\" /><path d=\"m7.18 20.827-5-11a2 2 0 01.993-2.647L7 5.44\" /><rect x=\"7\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\" />","plug-2":"<path d=\"M9 2v6\" /><path d=\"M15 2v6\" /><path d=\"M12 17v5\" /><path d=\"M5 8h14\" /><path d=\"M6 11V8h12v3a6 6 0 1 1-12 0Z\" />","plug-zap-2":"<path d=\"M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z\" /><path d=\"m2 22 3-3\" /><path d=\"M7.5 13.5 10 11\" /><path d=\"M10.5 16.5 13 14\" /><path d=\"m18 3-4 4h6l-4 4\" />","plug-zap":"<path d=\"M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z\" /><path d=\"m2 22 3-3\" /><path d=\"M7.5 13.5 10 11\" /><path d=\"M10.5 16.5 13 14\" /><path d=\"m18 3-4 4h6l-4 4\" />","plug":"<path d=\"M12 22v-5\" /><path d=\"M15 8V2\" /><path d=\"M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z\" /><path d=\"M9 8V2\" />","plus-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M8 12h8\" /><path d=\"M12 8v8\" />","plus-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M8 12h8\" /><path d=\"M12 8v8\" />","plus":"<path d=\"M5 12h14\" /><path d=\"M12 5v14\" />","pocket-knife":"<path d=\"M3 2v1c0 1 2 1 2 2S3 6 3 7s2 1 2 2-2 1-2 2 2 1 2 2\" /><path d=\"M18 6h.01\" /><path d=\"M6 18h.01\" /><path d=\"M20.83 8.83a4 4 0 0 0-5.66-5.66l-12 12a4 4 0 1 0 5.66 5.66Z\" /><path d=\"M18 11.66V22a4 4 0 0 0 4-4V6\" />","podcast":"<path d=\"M12 17v4\" /><path d=\"M18 11a6 6 0 00-3-5.197\" /><path d=\"M2 11a10 10 0 015-8.662\" /><path d=\"M22 11a10 10 0 00-5-8.662\" /><path d=\"M6 11a6 6 0 013-5.197\" /><path d=\"M9 21h6\" /><rect x=\"10\" y=\"9\" width=\"4\" height=\"8\" rx=\"2\" />","podium":"<path d=\"M12 6V2h-1\" /><path d=\"M9 15a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1\" /><path d=\"M9 21V11a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10\" />","pointer-off":"<path d=\"M10 4.5V4a2 2 0 0 0-2.41-1.957\" /><path d=\"M13.9 8.4a2 2 0 0 0-1.26-1.295\" /><path d=\"M21.7 16.2A8 8 0 0 0 22 14v-3a2 2 0 1 0-4 0v-1a2 2 0 0 0-3.63-1.158\" /><path d=\"m7 15-1.8-1.8a2 2 0 0 0-2.79 2.86L6 19.7a7.74 7.74 0 0 0 6 2.3h2a8 8 0 0 0 5.657-2.343\" /><path d=\"M6 6v8\" /><path d=\"m2 2 20 20\" />","pointer":"<path d=\"M22 14a8 8 0 0 1-8 8\" /><path d=\"M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2\" /><path d=\"M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1\" /><path d=\"M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10\" /><path d=\"M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15\" />","popcorn":"<path d=\"M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4\" /><path d=\"M10 22 9 8\" /><path d=\"m14 22 1-14\" /><path d=\"M20 8c.5 0 .9.4.8 1l-2.6 12c-.1.5-.7 1-1.2 1H7c-.6 0-1.1-.4-1.2-1L3.2 9c-.1-.6.3-1 .8-1Z\" />","popsicle":"<path d=\"M18.6 14.4c.8-.8.8-2 0-2.8l-8.1-8.1a4.95 4.95 0 1 0-7.1 7.1l8.1 8.1c.9.7 2.1.7 2.9-.1Z\" /><path d=\"m22 22-5.5-5.5\" />","pound-sterling":"<path d=\"M18 7c0-5.333-8-5.333-8 0\" /><path d=\"M10 7v14\" /><path d=\"M6 21h12\" /><path d=\"M6 13h10\" />","power-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 7v4\" /><path d=\"M7.998 9.003a5 5 0 1 0 8-.005\" />","power-off":"<path d=\"M18.36 6.64A9 9 0 0 1 20.77 15\" /><path d=\"M6.16 6.16a9 9 0 1 0 12.68 12.68\" /><path d=\"M12 2v4\" /><path d=\"m2 2 20 20\" />","power-square":"<path d=\"M12 7v4\" /><path d=\"M7.998 9.003a5 5 0 1 0 8-.005\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","power":"<path d=\"M12 2v10\" /><path d=\"M18.4 6.6a9 9 0 1 1-12.77.04\" />","presentation":"<path d=\"M2 3h20\" /><path d=\"M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3\" /><path d=\"m7 21 5-5 5 5\" />","printer-3d":"<path d=\"M10 11v1\" /><path d=\"M12 8h8\" /><path d=\"M15 20v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3\" /><path d=\"M4 20h16\" /><path d=\"M4 22V4a2 2 0 012-2h12a2 2 0 012 2v18\" /><path d=\"M4 8h4\" /><path d=\"M8.635 10.093A2 2 0 018 8.631V7a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-.293.707l-1 1a1 1 0 01-1.414 0z\" />","printer-check":"<path d=\"M13.5 22H7a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v.5\" /><path d=\"m16 19 2 2 4-4\" /><path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2\" /><path d=\"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6\" />","printer-x":"<path d=\"M12.531 22H7a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h6.377\" /><path d=\"m16.5 16.5 5 5\" /><path d=\"m16.5 21.5 5-5\" /><path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1.5\" /><path d=\"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6\" />","printer":"<path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\" /><path d=\"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6\" /><rect x=\"6\" y=\"14\" width=\"12\" height=\"8\" rx=\"1\" />","projector":"<path d=\"M5 7 3 5\" /><path d=\"M9 6V3\" /><path d=\"m13 7 2-2\" /><circle cx=\"9\" cy=\"13\" r=\"3\" /><path d=\"M11.83 12H20a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2.17\" /><path d=\"M16 16h2\" />","proportions":"<rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\" /><path d=\"M12 9v11\" /><path d=\"M2 9h13a2 2 0 0 1 2 2v9\" />","puzzle":"<path d=\"M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z\" />","pyramid":"<path d=\"M2.5 16.88a1 1 0 0 1-.32-1.43l9-13.02a1 1 0 0 1 1.64 0l9 13.01a1 1 0 0 1-.32 1.44l-8.51 4.86a2 2 0 0 1-1.98 0Z\" /><path d=\"M12 2v20\" />","qr-code":"<rect width=\"5\" height=\"5\" x=\"3\" y=\"3\" rx=\"1\" /><rect width=\"5\" height=\"5\" x=\"16\" y=\"3\" rx=\"1\" /><rect width=\"5\" height=\"5\" x=\"3\" y=\"16\" rx=\"1\" /><path d=\"M21 16h-3a2 2 0 0 0-2 2v3\" /><path d=\"M21 21v.01\" /><path d=\"M12 7v3a2 2 0 0 1-2 2H7\" /><path d=\"M3 12h.01\" /><path d=\"M12 3h.01\" /><path d=\"M12 16v.01\" /><path d=\"M16 12h1\" /><path d=\"M21 12v.01\" /><path d=\"M12 21v-1\" />","quote":"<path d=\"M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z\" /><path d=\"M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z\" />","rabbit":"<path d=\"M13 16a3 3 0 0 1 2.24 5\" /><path d=\"M18 12h.01\" /><path d=\"M18 21h-8a4 4 0 0 1-4-4 7 7 0 0 1 7-7h.2L9.6 6.4a1 1 0 1 1 2.8-2.8L15.8 7h.2c3.3 0 6 2.7 6 6v1a2 2 0 0 1-2 2h-1a3 3 0 0 0-3 3\" /><path d=\"M20 8.54V4a2 2 0 1 0-4 0v3\" /><path d=\"M7.612 12.524a3 3 0 1 0-1.6 4.3\" />","radar":"<path d=\"M19.07 4.93A10 10 0 0 0 6.99 3.34\" /><path d=\"M4 6h.01\" /><path d=\"M2.29 9.62A10 10 0 1 0 21.31 8.35\" /><path d=\"M16.24 7.76A6 6 0 1 0 8.23 16.67\" /><path d=\"M12 18h.01\" /><path d=\"M17.99 11.66A6 6 0 0 1 15.77 16.67\" /><circle cx=\"12\" cy=\"12\" r=\"2\" /><path d=\"m13.41 10.59 5.66-5.66\" />","radiation":"<path d=\"M12 12h.01\" /><path d=\"M14 15.4641a4 4 0 0 1-4 0L7.52786 19.74597 A 1 1 0 0 0 7.99303 21.16211 10 10 0 0 0 16.00697 21.16211 1 1 0 0 0 16.47214 19.74597z\" /><path d=\"M16 12a4 4 0 0 0-2-3.464l2.472-4.282a1 1 0 0 1 1.46-.305 10 10 0 0 1 4.006 6.94A1 1 0 0 1 21 12z\" /><path d=\"M8 12a4 4 0 0 1 2-3.464L7.528 4.254a1 1 0 0 0-1.46-.305 10 10 0 0 0-4.006 6.94A1 1 0 0 0 3 12z\" />","radical":"<path d=\"M3 12h3.28a1 1 0 0 1 .948.684l2.298 7.934a.5.5 0 0 0 .96-.044L13.82 4.771A1 1 0 0 1 14.792 4H21\" />","radio-off":"<path d=\"M13.414 13.414a2 2 0 1 1-2.828-2.828\" /><path d=\"M16.247 7.761a6 6 0 0 1 1.744 4.572\" /><path d=\"M19.075 4.933a10 10 0 0 1 2.234 10.72\" /><path d=\"m2 2 20 20\" /><path d=\"M4.925 19.067a10 10 0 0 1 0-14.134\" /><path d=\"M7.753 16.239a6 6 0 0 1 0-8.478\" />","radio-receiver":"<path d=\"M5 16v2\" /><path d=\"M19 16v2\" /><rect width=\"20\" height=\"8\" x=\"2\" y=\"8\" rx=\"2\" /><path d=\"M18 12h.01\" />","radio-tower":"<path d=\"M4.9 16.1C1 12.2 1 5.8 4.9 1.9\" /><path d=\"M7.8 4.7a6.14 6.14 0 0 0-.8 7.5\" /><circle cx=\"12\" cy=\"9\" r=\"2\" /><path d=\"M16.2 4.8c2 2 2.26 5.11.8 7.47\" /><path d=\"M19.1 1.9a9.96 9.96 0 0 1 0 14.1\" /><path d=\"M9.5 18h5\" /><path d=\"m8 22 4-11 4 11\" />","radio":"<path d=\"M16.247 7.761a6 6 0 0 1 0 8.478\" /><path d=\"M19.075 4.933a10 10 0 0 1 0 14.134\" /><path d=\"M4.925 19.067a10 10 0 0 1 0-14.134\" /><path d=\"M7.753 16.239a6 6 0 0 1 0-8.478\" /><circle cx=\"12\" cy=\"12\" r=\"2\" />","radius":"<path d=\"M20.34 17.52a10 10 0 1 0-2.82 2.82\" /><circle cx=\"19\" cy=\"19\" r=\"2\" /><path d=\"m13.41 13.41 4.18 4.18\" /><circle cx=\"12\" cy=\"12\" r=\"2\" />","rainbow":"<path d=\"M22 17a10 10 0 0 0-20 0\" /><path d=\"M6 17a6 6 0 0 1 12 0\" /><path d=\"M10 17a2 2 0 0 1 4 0\" />","rat":"<path d=\"M13 22H4a2 2 0 0 1 0-4h12\" /><path d=\"M13.236 18a3 3 0 0 0-2.2-5\" /><path d=\"M16 9h.01\" /><path d=\"M16.82 3.94a3 3 0 1 1 3.237 4.868l1.815 2.587a1.5 1.5 0 0 1-1.5 2.1l-2.872-.453a3 3 0 0 0-3.5 3\" /><path d=\"M17 4.988a3 3 0 1 0-5.2 2.052A7 7 0 0 0 4 14.015 4 4 0 0 0 8 18\" />","ratio":"<rect width=\"12\" height=\"20\" x=\"6\" y=\"2\" rx=\"2\" /><rect width=\"20\" height=\"12\" x=\"2\" y=\"6\" rx=\"2\" />","receipt-cent":"<path d=\"M12 7v10\" /><path d=\"M14.828 14.829a4 4 0 0 1-5.656 0 4 4 0 0 1 0-5.657 4 4 0 0 1 5.656 0\" /><path d=\"M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z\" />","receipt-euro":"<path d=\"M15.828 14.829a4 4 0 0 1-5.656 0 4 4 0 0 1 0-5.657 4 4 0 0 1 5.656 0\" /><path d=\"M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z\" /><path d=\"M8 12h5\" />","receipt-indian-rupee":"<path d=\"M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z\" /><path d=\"M8 11h8\" /><path d=\"M8 7h8\" /><path d=\"M9 7a4 4 0 0 1 0 8H8l3 2\" />","receipt-japanese-yen":"<path d=\"m12 10 3-3\" /><path d=\"M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z\" /><path d=\"M9 11h6\" /><path d=\"M9 15h6\" /><path d=\"m9 7 3 3v7\" />","receipt-pound-sterling":"<path d=\"M10 17V9.5a1 1 0 0 1 5 0\" /><path d=\"M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z\" /><path d=\"M8 13h5\" /><path d=\"M8 17h7\" />","receipt-russian-ruble":"<path d=\"M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z\" /><path d=\"M8 11h5a2 2 0 0 0 0-4h-3v10\" /><path d=\"M8 15h5\" />","receipt-swiss-franc":"<path d=\"M10 11h4\" /><path d=\"M10 17V7h5\" /><path d=\"M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z\" /><path d=\"M8 15h5\" />","receipt-text":"<path d=\"M13 16H8\" /><path d=\"M14 8H8\" /><path d=\"M16 12H8\" /><path d=\"M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z\" />","receipt-turkish-lira":"<path d=\"M10 7v10a5 5 0 0 0 5-5\" /><path d=\"m14 8-6 3\" /><path d=\"M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z\" />","receipt":"<path d=\"M12 17V7\" /><path d=\"M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8\" /><path d=\"M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z\" />","rectangle-circle":"<path d=\"M14 4v16H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z\" /><circle cx=\"14\" cy=\"12\" r=\"8\" />","rectangle-ellipsis":"<rect width=\"20\" height=\"12\" x=\"2\" y=\"6\" rx=\"2\" /><path d=\"M12 12h.01\" /><path d=\"M17 12h.01\" /><path d=\"M7 12h.01\" />","rectangle-goggles":"<path d=\"M20 6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-1.6-.8l-1.6-2.13a1 1 0 0 0-1.6 0L9.6 17.2A2 2 0 0 1 8 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z\" />","rectangle-horizontal":"<rect width=\"20\" height=\"12\" x=\"2\" y=\"6\" rx=\"2\" />","rectangle-vertical":"<rect width=\"12\" height=\"20\" x=\"6\" y=\"2\" rx=\"2\" />","recycle":"<path d=\"M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5\" /><path d=\"M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12\" /><path d=\"m14 16-3 3 3 3\" /><path d=\"M8.293 13.596 7.196 9.5 3.1 10.598\" /><path d=\"m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843\" /><path d=\"m13.378 9.633 4.096 1.098 1.097-4.096\" />","redo-2":"<path d=\"m15 14 5-5-5-5\" /><path d=\"M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13\" />","redo-dot":"<circle cx=\"12\" cy=\"17\" r=\"1\" /><path d=\"M21 7v6h-6\" /><path d=\"M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7\" />","redo":"<path d=\"M21 7v6h-6\" /><path d=\"M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7\" />","refresh-ccw-dot":"<path d=\"M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\" /><path d=\"M3 3v5h5\" /><path d=\"M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16\" /><path d=\"M16 16h5v5\" /><circle cx=\"12\" cy=\"12\" r=\"1\" />","refresh-ccw":"<path d=\"M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\" /><path d=\"M3 3v5h5\" /><path d=\"M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16\" /><path d=\"M16 16h5v5\" />","refresh-cw-off":"<path d=\"M21 8L18.74 5.74A9.75 9.75 0 0 0 12 3C11 3 10.03 3.16 9.13 3.47\" /><path d=\"M8 16H3v5\" /><path d=\"M3 12C3 9.51 4 7.26 5.64 5.64\" /><path d=\"m3 16 2.26 2.26A9.75 9.75 0 0 0 12 21c2.49 0 4.74-1 6.36-2.64\" /><path d=\"M21 12c0 1-.16 1.97-.47 2.87\" /><path d=\"M21 3v5h-5\" /><path d=\"M22 22 2 2\" />","refresh-cw":"<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\" /><path d=\"M21 3v5h-5\" /><path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\" /><path d=\"M8 16H3v5\" />","refrigerator":"<path d=\"M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z\" /><path d=\"M5 10h14\" /><path d=\"M15 7v6\" />","regex":"<path d=\"M17 3v10\" /><path d=\"m12.67 5.5 8.66 5\" /><path d=\"m12.67 10.5 8.66-5\" /><path d=\"M9 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2z\" />","remove-formatting":"<path d=\"M4 7V4h16v3\" /><path d=\"M5 20h6\" /><path d=\"M13 4 8 20\" /><path d=\"m15 15 5 5\" /><path d=\"m20 15-5 5\" />","repeat-1":"<path d=\"m17 2 4 4-4 4\" /><path d=\"M3 11v-1a4 4 0 0 1 4-4h14\" /><path d=\"m7 22-4-4 4-4\" /><path d=\"M21 13v1a4 4 0 0 1-4 4H3\" /><path d=\"M11 10h1v4\" />","repeat-2":"<path d=\"m2 9 3-3 3 3\" /><path d=\"M13 18H7a2 2 0 0 1-2-2V6\" /><path d=\"m22 15-3 3-3-3\" /><path d=\"M11 6h6a2 2 0 0 1 2 2v10\" />","repeat-off":"<path d=\"M11.656 6H21l-4-4\" /><path d=\"M17.898 17.898A4 4 0 0 1 17 18H3l4-4\" /><path d=\"m2 2 20 20\" /><path d=\"M21 13v1a4 4 0 0 1-.171 1.159\" /><path d=\"m21 6-4 4\" /><path d=\"M3 11v-1a4 4 0 0 1 3.102-3.898\" /><path d=\"m7 22-4-4\" />","repeat":"<path d=\"m17 2 4 4-4 4\" /><path d=\"M3 11v-1a4 4 0 0 1 4-4h14\" /><path d=\"m7 22-4-4 4-4\" /><path d=\"M21 13v1a4 4 0 0 1-4 4H3\" />","replace-all":"<path d=\"M14 14a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1\" /><path d=\"M14 4a1 1 0 0 1 1-1\" /><path d=\"M15 10a1 1 0 0 1-1-1\" /><path d=\"M19 14a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1\" /><path d=\"M21 4a1 1 0 0 0-1-1\" /><path d=\"M21 9a1 1 0 0 1-1 1\" /><path d=\"m3 7 3 3 3-3\" /><path d=\"M6 10V5a2 2 0 0 1 2-2h2\" /><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\" />","replace":"<path d=\"M14 4a1 1 0 0 1 1-1\" /><path d=\"M15 10a1 1 0 0 1-1-1\" /><path d=\"M21 4a1 1 0 0 0-1-1\" /><path d=\"M21 9a1 1 0 0 1-1 1\" /><path d=\"m3 7 3 3 3-3\" /><path d=\"M6 10V5a2 2 0 0 1 2-2h2\" /><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\" />","reply-all":"<path d=\"m12 17-5-5 5-5\" /><path d=\"M22 18v-2a4 4 0 0 0-4-4H7\" /><path d=\"m7 17-5-5 5-5\" />","reply":"<path d=\"M20 18v-2a4 4 0 0 0-4-4H4\" /><path d=\"m9 17-5-5 5-5\" />","rewind":"<path d=\"M12 6a2 2 0 0 0-3.414-1.414l-6 6a2 2 0 0 0 0 2.828l6 6A2 2 0 0 0 12 18z\" /><path d=\"M22 6a2 2 0 0 0-3.414-1.414l-6 6a2 2 0 0 0 0 2.828l6 6A2 2 0 0 0 22 18z\" />","ribbon":"<path d=\"M12 11.22C11 9.997 10 9 10 8a2 2 0 0 1 4 0c0 1-.998 2.002-2.01 3.22\" /><path d=\"m12 18 2.57-3.5\" /><path d=\"M6.243 9.016a7 7 0 0 1 11.507-.009\" /><path d=\"M9.35 14.53 12 11.22\" /><path d=\"M9.35 14.53C7.728 12.246 6 10.221 6 7a6 5 0 0 1 12 0c-.005 3.22-1.778 5.235-3.43 7.5l3.557 4.527a1 1 0 0 1-.203 1.43l-1.894 1.36a1 1 0 0 1-1.384-.215L12 18l-2.679 3.593a1 1 0 0 1-1.39.213l-1.865-1.353a1 1 0 0 1-.203-1.422z\" />","road":"<path d=\"M12 17v4\" /><path d=\"M12 5V3\" /><path d=\"M12 9v3\" /><path d=\"M2.077 18.449A2 2 0 0 0 4 21h16a2 2 0 0 0 1.924-2.55l-4-14A2 2 0 0 0 16 3H8a2 2 0 0 0-1.924 1.45z\" />","robot-arm":"<path d=\"M12 21 7.5 8.322\" /><path d=\"m14 7 1.75-3.767a.5.5 0 0 1 .662-.172L20 5.005\" /><path d=\"m20 8.998-3.588 1.944a.5.5 0 0 1-.662-.172L14 7H8\" /><path d=\"M3.486 21h10\" /><path d=\"M5 21V8.732\" /><circle cx=\"6\" cy=\"7\" r=\"2\" />","robot-vacuum":"<path d=\"M11 17h2\" /><path d=\"M12 12h.01\" /><path d=\"M17 12a5 5 0 00-10 0\" /><path d=\"M19 2v2.8\" /><path d=\"M2 5h2.8\" /><path d=\"M22 5h-2.8\" /><path d=\"M5 2v2.8\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","rocket":"<path d=\"M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5\" /><path d=\"M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09\" /><path d=\"M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z\" /><path d=\"M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05\" />","rocking-chair":"<path d=\"m15 13 3.708 7.416\" /><path d=\"M3 19a15 15 0 0 0 18 0\" /><path d=\"m3 2 3.21 9.633A2 2 0 0 0 8.109 13H18\" /><path d=\"m9 13-3.708 7.416\" />","roller-coaster":"<path d=\"M6 19V5\" /><path d=\"M10 19V6.8\" /><path d=\"M14 19v-7.8\" /><path d=\"M18 5v4\" /><path d=\"M18 19v-6\" /><path d=\"M22 19V9\" /><path d=\"M2 19V9a4 4 0 0 1 4-4c2 0 4 1.33 6 4s4 4 6 4a4 4 0 1 0-3-6.65\" />","rose":"<path d=\"M17 10h-1a4 4 0 1 1 4-4v.534\" /><path d=\"M17 6h1a4 4 0 0 1 1.42 7.74l-2.29.87a6 6 0 0 1-5.339-10.68l2.069-1.31\" /><path d=\"M4.5 17c2.8-.5 4.4 0 5.5.8s1.8 2.2 2.3 3.7c-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2\" /><path d=\"M9.77 12C4 15 2 22 2 22\" /><circle cx=\"17\" cy=\"8\" r=\"2\" />","rotate-3-d":"<path d=\"m15.194 13.707 3.814 1.86-1.86 3.814\" /><path d=\"M16.47214 7.52786 A 5 10 0 1 0 13 21.79796\" /><path d=\"M21.79796 11 A 10 5 0 1 0 19 15.57071\" />","rotate-3d":"<path d=\"m15.194 13.707 3.814 1.86-1.86 3.814\" /><path d=\"M16.47214 7.52786 A 5 10 0 1 0 13 21.79796\" /><path d=\"M21.79796 11 A 10 5 0 1 0 19 15.57071\" />","rotate-ccw-clock":"<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\" /><path d=\"M3 3v5h5\" /><path d=\"M12 7v5l4 2\" />","rotate-ccw-key":"<path d=\"M12 7v6\" /><path d=\"M12 9h2\" /><path d=\"M3 12a9 9 0 1 0 9-9 9.74 9.74 0 0 0-6.74 2.74L3 8\" /><path d=\"M3 3v5h5\" /><circle cx=\"12\" cy=\"15\" r=\"2\" />","rotate-ccw-square":"<path d=\"M20 9V7a2 2 0 0 0-2-2h-6\" /><path d=\"m15 2-3 3 3 3\" /><path d=\"M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2\" />","rotate-ccw":"<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\" /><path d=\"M3 3v5h5\" />","rotate-cw-clock":"<path d=\"M12 7v5l4 2\" /><path d=\"M16 8h5V3\" /><path d=\"m21 8-2.3-2.3A9.7 9.7 0 0012 3a9 9 0 109 9\" />","rotate-cw-fading-clock":"<path d=\"M12 3a9.75 9.75 0 0 1 6.74 2.74\" /><path d=\"M18.74 5.74 21 8\" /><path d=\"M21 8V3\" /><path d=\"M7.5 19.794c-6-3.464-6-12.124 0-15.588\" /><path d=\"M7.5 4.206A9 9 0 0 1 12 3\" /><path d=\"M12 7v5l4 2\" /><path d=\"M14 20.775A9 9 0 0 1 12 21\" /><path d=\"M19 17.656a9 9 0 0 1-1.5 1.456\" /><path d=\"M21 12a9 9 0 0 1-.228 2\" /><path d=\"M21 8h-5\" />","rotate-cw-square":"<path d=\"M12 5H6a2 2 0 0 0-2 2v3\" /><path d=\"m9 8 3-3-3-3\" /><path d=\"M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2\" />","rotate-cw":"<path d=\"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8\" /><path d=\"M21 3v5h-5\" />","route-off":"<circle cx=\"6\" cy=\"19\" r=\"3\" /><path d=\"M9 19h8.5c.4 0 .9-.1 1.3-.2\" /><path d=\"M5.2 5.2A3.5 3.53 0 0 0 6.5 12H12\" /><path d=\"m2 2 20 20\" /><path d=\"M21 15.3a3.5 3.5 0 0 0-3.3-3.3\" /><path d=\"M15 5h-4.3\" /><circle cx=\"18\" cy=\"5\" r=\"3\" />","route":"<circle cx=\"6\" cy=\"19\" r=\"3\" /><path d=\"M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15\" /><circle cx=\"18\" cy=\"5\" r=\"3\" />","router":"<rect width=\"20\" height=\"8\" x=\"2\" y=\"14\" rx=\"2\" /><path d=\"M6.01 18H6\" /><path d=\"M10.01 18H10\" /><path d=\"M15 10v4\" /><path d=\"M17.84 7.17a4 4 0 0 0-5.66 0\" /><path d=\"M20.66 4.34a8 8 0 0 0-11.31 0\" />","rows-2":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M3 12h18\" />","rows-3":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M21 9H3\" /><path d=\"M21 15H3\" />","rows-4":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M21 7.5H3\" /><path d=\"M21 12H3\" /><path d=\"M21 16.5H3\" />","rows":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M3 12h18\" />","rss":"<path d=\"M4 11a9 9 0 0 1 9 9\" /><path d=\"M4 4a16 16 0 0 1 16 16\" /><circle cx=\"5\" cy=\"19\" r=\"1\" />","ruler-dimension-line":"<path d=\"M10 15v-3\" /><path d=\"M14 15v-3\" /><path d=\"M18 15v-3\" /><path d=\"M2 8V4\" /><path d=\"M22 6H2\" /><path d=\"M22 8V4\" /><path d=\"M6 15v-3\" /><rect x=\"2\" y=\"12\" width=\"20\" height=\"8\" rx=\"2\" />","ruler":"<path d=\"M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z\" /><path d=\"m14.5 12.5 2-2\" /><path d=\"m11.5 9.5 2-2\" /><path d=\"m8.5 6.5 2-2\" /><path d=\"m17.5 15.5 2-2\" />","russian-ruble":"<path d=\"M6 11h8a4 4 0 0 0 0-8H9v18\" /><path d=\"M6 15h8\" />","sailboat":"<path d=\"M10 2v15\" /><path d=\"M7 22a4 4 0 0 1-4-4 1 1 0 0 1 1-1h16a1 1 0 0 1 1 1 4 4 0 0 1-4 4z\" /><path d=\"M9.159 2.46a1 1 0 0 1 1.521-.193l9.977 8.98A1 1 0 0 1 20 13H4a1 1 0 0 1-.824-1.567z\" />","salad":"<path d=\"M7 21h10\" /><path d=\"M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z\" /><path d=\"M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1\" /><path d=\"m13 12 4-4\" /><path d=\"M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2\" />","sandwich":"<path d=\"m2.37 11.223 8.372-6.777a2 2 0 0 1 2.516 0l8.371 6.777\" /><path d=\"M21 15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-5.25\" /><path d=\"M3 15a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h9\" /><path d=\"m6.67 15 6.13 4.6a2 2 0 0 0 2.8-.4l3.15-4.2\" /><rect width=\"20\" height=\"4\" x=\"2\" y=\"11\" rx=\"1\" />","satellite-dish":"<path d=\"M18 12a6 6 0 00-6-6\" /><path d=\"M2.824 10.459a8 8 0 0010.717 10.717c.558-.276.623-1.012.183-1.452l-9.448-9.448c-.44-.44-1.176-.375-1.452.183\" /><path d=\"M22 12A10 10 0 0012 2\" /><path d=\"m9 15 4-4\" />","satellite":"<path d=\"m13.5 6.5-3.148-3.148a1.205 1.205 0 0 0-1.704 0L6.352 5.648a1.205 1.205 0 0 0 0 1.704L9.5 10.5\" /><path d=\"M16.5 7.5 19 5\" /><path d=\"m17.5 10.5 3.148 3.148a1.205 1.205 0 0 1 0 1.704l-2.296 2.296a1.205 1.205 0 0 1-1.704 0L13.5 14.5\" /><path d=\"M9 21a6 6 0 0 0-6-6\" /><path d=\"M9.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l4.296-4.296a1.205 1.205 0 0 0 0-1.704l-2.296-2.296a1.205 1.205 0 0 0-1.704 0z\" />","saudi-riyal":"<path d=\"m20 19.5-5.5 1.2\" /><path d=\"M14.5 4v11.22a1 1 0 0 0 1.242.97L20 15.2\" /><path d=\"m2.978 19.351 5.549-1.363A2 2 0 0 0 10 16V2\" /><path d=\"M20 10 4 13.5\" />","save-all":"<path d=\"M10 2v3a1 1 0 0 0 1 1h5\" /><path d=\"M18 18v-6a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6\" /><path d=\"M18 22H4a2 2 0 0 1-2-2V6\" /><path d=\"M8 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9.172a2 2 0 0 1 1.414.586l2.828 2.828A2 2 0 0 1 22 6.828V16a2 2 0 0 1-2.01 2z\" />","save-check":"<path d=\"M12.5 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10.2a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4v4.35\" /><path d=\"m16 19 2 2 4-4\" /><path d=\"M17 15.13V14a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7\" /><path d=\"M7 3v4a1 1 0 0 0 1 1h7\" />","save-off":"<path d=\"M13 13H8a1 1 0 0 0-1 1v7\" /><path d=\"M14 8h1\" /><path d=\"M17 21v-4\" /><path d=\"m2 2 20 20\" /><path d=\"M20.41 20.41A2 2 0 0 1 19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 .59-1.41\" /><path d=\"M9 3h6.2a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V15\" />","save-pen":"<path d=\"M13.33 13H8a1 1 0 00-1 1v7\" /><path d=\"M14.363 17.634a2 2 0 00-.506.854l-.837 2.87a.5.5 0 00.62.62l2.87-.837a2 2 0 00.854-.506l4.013-4.009a1 1 0 10-3.004-3.004z\" /><path d=\"M7 3v4a1 1 0 001 1h7\" /><path d=\"M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h10.2a2 2 0 011.4.6l3.8 3.8a2 2 0 01.6 1.4v.3\" />","save-plus":"<path d=\"M12.5 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10.2a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V12\" /><path d=\"M16 13H8a1 1 0 0 0-1 1v7\" /><path d=\"M19 22v-6\" /><path d=\"M22 19h-6\" /><path d=\"M7 3v4a1 1 0 0 0 1 1h7\" />","save":"<path d=\"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z\" /><path d=\"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7\" /><path d=\"M7 3v4a1 1 0 0 0 1 1h7\" />","scale-3-d":"<path d=\"M5 7v11a1 1 0 0 0 1 1h11\" /><path d=\"M5.293 18.707 11 13\" /><circle cx=\"19\" cy=\"19\" r=\"2\" /><circle cx=\"5\" cy=\"5\" r=\"2\" />","scale-3d":"<path d=\"M5 7v11a1 1 0 0 0 1 1h11\" /><path d=\"M5.293 18.707 11 13\" /><circle cx=\"19\" cy=\"19\" r=\"2\" /><circle cx=\"5\" cy=\"5\" r=\"2\" />","scale":"<path d=\"M12 3v18\" /><path d=\"m19 8 3 8a5 5 0 0 1-6 0zV7\" /><path d=\"M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1\" /><path d=\"m5 8 3 8a5 5 0 0 1-6 0zV7\" /><path d=\"M7 21h10\" />","scaling":"<path d=\"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\" /><path d=\"M14 15H9v-5\" /><path d=\"M16 3h5v5\" /><path d=\"M21 3 9 15\" />","scan-barcode":"<path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /><path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" /><path d=\"M8 7v10\" /><path d=\"M12 7v10\" /><path d=\"M17 7v10\" />","scan-box":"<path d=\"M12 12v5.5\" /><path d=\"M17 3h2a2 2 0 012 2v2\" /><path d=\"M21 17v2a2 2 0 01-2 2h-2\" /><path d=\"M3 7V5a2 2 0 012-2h2\" /><path d=\"M7 21H5a2 2 0 01-2-2v-2\" /><path d=\"M7.264 9.252 12 12l4.737-2.748\" /><path d=\"M7.995 8.514A2 2 0 007 10.244v3.516a2 2 0 00.996 1.73l3 1.74a2 2 0 002.008 0l3-1.74A2 2 0 0017 13.76v-3.517a2 2 0 00-.995-1.73l-3-1.742a2 2 0 00-1.892-.064z\" />","scan-eye":"<path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /><path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" /><circle cx=\"12\" cy=\"12\" r=\"1\" /><path d=\"M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0\" />","scan-face":"<path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /><path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" /><path d=\"M8 14s1.5 2 4 2 4-2 4-2\" /><path d=\"M9 9h.01\" /><path d=\"M15 9h.01\" />","scan-heart":"<path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /><path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" /><path d=\"M7.828 13.07A3 3 0 0 1 12 8.764a3 3 0 0 1 4.172 4.306l-3.447 3.62a1 1 0 0 1-1.449 0z\" />","scan-line":"<path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /><path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" /><path d=\"M7 12h10\" />","scan-qr-code":"<path d=\"M17 12v4a1 1 0 0 1-1 1h-4\" /><path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /><path d=\"M17 8V7\" /><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /><path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /><path d=\"M7 17h.01\" /><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" /><rect x=\"7\" y=\"7\" width=\"5\" height=\"5\" rx=\"1\" />","scan-search":"<path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /><path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" /><circle cx=\"12\" cy=\"12\" r=\"3\" /><path d=\"m16 16-1.9-1.9\" />","scan-square":"<path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /><path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" /><rect width=\"8\" height=\"8\" x=\"8\" y=\"8\" rx=\"1\" />","scan-text":"<path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /><path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" /><path d=\"M7 8h8\" /><path d=\"M7 12h10\" /><path d=\"M7 16h6\" />","scan":"<path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /><path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" />","scatter-chart":"<circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\" /><circle cx=\"18.5\" cy=\"5.5\" r=\".5\" fill=\"currentColor\" /><circle cx=\"11.5\" cy=\"11.5\" r=\".5\" fill=\"currentColor\" /><circle cx=\"7.5\" cy=\"16.5\" r=\".5\" fill=\"currentColor\" /><circle cx=\"17.5\" cy=\"14.5\" r=\".5\" fill=\"currentColor\" /><path d=\"M3 3v16a2 2 0 0 0 2 2h16\" />","school-2":"<path d=\"M14 21v-3a2 2 0 0 0-4 0v3\" /><path d=\"M18 12h.01\" /><path d=\"M18 16h.01\" /><path d=\"M22 7a1 1 0 0 0-1-1h-2a2 2 0 0 1-1.143-.359L13.143 2.36a2 2 0 0 0-2.286-.001L6.143 5.64A2 2 0 0 1 5 6H3a1 1 0 0 0-1 1v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2z\" /><path d=\"M6 12h.01\" /><path d=\"M6 16h.01\" /><circle cx=\"12\" cy=\"10\" r=\"2\" />","school":"<path d=\"M14 21v-3a2 2 0 0 0-4 0v3\" /><path d=\"M18 4.933V21\" /><path d=\"m4 6 7.106-3.79a2 2 0 0 1 1.788 0L20 6\" /><path d=\"m6 11-3.52 2.147a1 1 0 0 0-.48.854V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a1 1 0 0 0-.48-.853L18 11\" /><path d=\"M6 4.933V21\" /><circle cx=\"12\" cy=\"9\" r=\"2\" />","scissors-line-dashed":"<path d=\"M5.42 9.42 8 12\" /><circle cx=\"4\" cy=\"8\" r=\"2\" /><path d=\"m14 6-8.58 8.58\" /><circle cx=\"4\" cy=\"16\" r=\"2\" /><path d=\"M10.8 14.8 14 18\" /><path d=\"M16 12h-2\" /><path d=\"M22 12h-2\" />","scissors-square-dashed-bottom":"<path d=\"M14 21h1\" /><path d=\"m17 17-2.18-2.18\" /><path d=\"M5 21a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2\" /><path d=\"M9 21h1\" /><path d=\"M9.56 14.44 17 7\" /><path d=\"M9.56 9.56 12 12\" /><circle cx=\"8.5\" cy=\"15.5\" r=\"1.5\" /><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\" />","scissors-square":"<path d=\"m17 17-2.18-2.18\" /><path d=\"M9.56 14.44 17 7\" /><path d=\"M9.56 9.56 12 12\" /><circle cx=\"8.5\" cy=\"15.5\" r=\"1.5\" /><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","scissors":"<circle cx=\"6\" cy=\"6\" r=\"3\" /><path d=\"M8.12 8.12 12 12\" /><path d=\"M20 4 8.12 15.88\" /><circle cx=\"6\" cy=\"18\" r=\"3\" /><path d=\"M14.8 14.8 20 20\" />","scooter":"<path d=\"M21 4h-3.5l2 11.05\" /><path d=\"M6.95 17h5.142c.523 0 .95-.406 1.063-.916a6.5 6.5 0 0 1 5.345-5.009\" /><circle cx=\"19.5\" cy=\"17.5\" r=\"2.5\" /><circle cx=\"4.5\" cy=\"17.5\" r=\"2.5\" />","screen-share-off":"<path d=\"M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3\" /><path d=\"M8 21h8\" /><path d=\"M12 17v4\" /><path d=\"m22 3-5 5\" /><path d=\"m17 3 5 5\" />","screen-share":"<path d=\"M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3\" /><path d=\"M8 21h8\" /><path d=\"M12 17v4\" /><path d=\"m17 8 5-5\" /><path d=\"M17 3h5v5\" />","scroll-text":"<path d=\"M15 12h-5\" /><path d=\"M15 8h-5\" /><path d=\"M19 17V5a2 2 0 0 0-2-2H4\" /><path d=\"M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3\" />","scroll":"<path d=\"M19 17V5a2 2 0 0 0-2-2H4\" /><path d=\"M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3\" />","search-alert":"<circle cx=\"11\" cy=\"11\" r=\"8\" /><path d=\"m21 21-4.3-4.3\" /><path d=\"M11 7v4\" /><path d=\"M11 15h.01\" />","search-check":"<path d=\"m8 11 2 2 4-4\" /><circle cx=\"11\" cy=\"11\" r=\"8\" /><path d=\"m21 21-4.3-4.3\" />","search-code":"<path d=\"m13 13.5 2-2.5-2-2.5\" /><path d=\"m21 21-4.3-4.3\" /><path d=\"M9 8.5 7 11l2 2.5\" /><circle cx=\"11\" cy=\"11\" r=\"8\" />","search-slash":"<path d=\"m13.5 8.5-5 5\" /><circle cx=\"11\" cy=\"11\" r=\"8\" /><path d=\"m21 21-4.3-4.3\" />","search-x":"<path d=\"m13.5 8.5-5 5\" /><path d=\"m8.5 8.5 5 5\" /><circle cx=\"11\" cy=\"11\" r=\"8\" /><path d=\"m21 21-4.3-4.3\" />","search":"<path d=\"m21 21-4.34-4.34\" /><circle cx=\"11\" cy=\"11\" r=\"8\" />","section":"<path d=\"M16 5a4 3 0 0 0-8 0c0 4 8 3 8 7a4 3 0 0 1-8 0\" /><path d=\"M8 19a4 3 0 0 0 8 0c0-4-8-3-8-7a4 3 0 0 1 8 0\" />","send-horizonal":"<path d=\"M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z\" /><path d=\"M6 12h16\" />","send-horizontal":"<path d=\"M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z\" /><path d=\"M6 12h16\" />","send-to-back":"<rect x=\"14\" y=\"14\" width=\"8\" height=\"8\" rx=\"2\" /><rect x=\"2\" y=\"2\" width=\"8\" height=\"8\" rx=\"2\" /><path d=\"M7 14v1a2 2 0 0 0 2 2h1\" /><path d=\"M14 7h1a2 2 0 0 1 2 2v1\" />","send":"<path d=\"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z\" /><path d=\"m21.854 2.147-10.94 10.939\" />","separator-horizontal":"<path d=\"m16 16-4 4-4-4\" /><path d=\"M3 12h18\" /><path d=\"m8 8 4-4 4 4\" />","separator-vertical":"<path d=\"M12 3v18\" /><path d=\"m16 16 4-4-4-4\" /><path d=\"m8 8-4 4 4 4\" />","server-cog":"<path d=\"m10.852 14.772-.383.923\" /><path d=\"M13.148 14.772a3 3 0 1 0-2.296-5.544l-.383-.923\" /><path d=\"m13.148 9.228.383-.923\" /><path d=\"m13.53 15.696-.382-.924a3 3 0 1 1-2.296-5.544\" /><path d=\"m14.772 10.852.923-.383\" /><path d=\"m14.772 13.148.923.383\" /><path d=\"M4.5 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-.5\" /><path d=\"M4.5 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-.5\" /><path d=\"M6 18h.01\" /><path d=\"M6 6h.01\" /><path d=\"m9.228 10.852-.923-.383\" /><path d=\"m9.228 13.148-.923.383\" />","server-crash":"<path d=\"M6 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2\" /><path d=\"M6 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2\" /><path d=\"M6 6h.01\" /><path d=\"M6 18h.01\" /><path d=\"m13 6-4 6h6l-4 6\" />","server-off":"<path d=\"M7 2h13a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-5\" /><path d=\"M10 10 2.5 2.5C2 2 2 2.5 2 5v3a2 2 0 0 0 2 2h6z\" /><path d=\"M22 17v-1a2 2 0 0 0-2-2h-1\" /><path d=\"M4 14a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16.5l1-.5.5.5-8-8H4z\" /><path d=\"M6 18h.01\" /><path d=\"m2 2 20 20\" />","server-plus":"<path d=\"M12.5 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2\" /><path d=\"M16 12h6\" /><path d=\"M19 9v6\" /><path d=\"M22 18v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h8.5\" /><path d=\"M6 18h.01\" /><path d=\"M6 6h.01\" />","server":"<rect width=\"20\" height=\"8\" x=\"2\" y=\"2\" rx=\"2\" ry=\"2\" /><rect width=\"20\" height=\"8\" x=\"2\" y=\"14\" rx=\"2\" ry=\"2\" /><line x1=\"6\" x2=\"6.01\" y1=\"6\" y2=\"6\" /><line x1=\"6\" x2=\"6.01\" y1=\"18\" y2=\"18\" />","settings-2":"<path d=\"M14 17H5\" /><path d=\"M19 7h-9\" /><circle cx=\"17\" cy=\"17\" r=\"3\" /><circle cx=\"7\" cy=\"7\" r=\"3\" />","settings":"<path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\" /><circle cx=\"12\" cy=\"12\" r=\"3\" />","shapes":"<path d=\"M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z\" /><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\" /><circle cx=\"17.5\" cy=\"17.5\" r=\"3.5\" />","share-2":"<circle cx=\"18\" cy=\"5\" r=\"3\" /><circle cx=\"6\" cy=\"12\" r=\"3\" /><circle cx=\"18\" cy=\"19\" r=\"3\" /><line x1=\"8.59\" x2=\"15.42\" y1=\"13.51\" y2=\"17.49\" /><line x1=\"15.41\" x2=\"8.59\" y1=\"6.51\" y2=\"10.49\" />","share":"<path d=\"M12 2v13\" /><path d=\"m16 6-4-4-4 4\" /><path d=\"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8\" />","sheet":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" /><line x1=\"3\" x2=\"21\" y1=\"9\" y2=\"9\" /><line x1=\"3\" x2=\"21\" y1=\"15\" y2=\"15\" /><line x1=\"9\" x2=\"9\" y1=\"9\" y2=\"21\" /><line x1=\"15\" x2=\"15\" y1=\"9\" y2=\"21\" />","shell":"<path d=\"M14 11a2 2 0 1 1-4 0 4 4 0 0 1 8 0 6 6 0 0 1-12 0 8 8 0 0 1 16 0 10 10 0 1 1-20 0 11.93 11.93 0 0 1 2.42-7.22 2 2 0 1 1 3.16 2.44\" />","shelving-unit":"<path d=\"M12 12V9a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3\" /><path d=\"M16 20v-3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3\" /><path d=\"M20 22V2\" /><path d=\"M4 12h16\" /><path d=\"M4 20h16\" /><path d=\"M4 2v20\" /><path d=\"M4 4h16\" />","shield-alert":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /><path d=\"M12 8v4\" /><path d=\"M12 16h.01\" />","shield-ban":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /><path d=\"m4.243 5.21 14.39 12.472\" />","shield-check":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /><path d=\"m9 12 2 2 4-4\" />","shield-close":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /><path d=\"m14.5 9.5-5 5\" /><path d=\"m9.5 9.5 5 5\" />","shield-cog-corner":"<path d=\"M11 22c-3.806-1.45-7-3.966-7-9V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v4\" /><path d=\"M14.923 16.547 14 16.164\" /><path d=\"m14.923 18.843-.923.383\" /><path d=\"M16.547 14.923 16.164 14\" /><path d=\"m16.547 20.467-.383.924\" /><path d=\"m18.843 14.923.383-.923\" /><path d=\"m19.225 21.391-.382-.924\" /><path d=\"m20.467 16.547.923-.383\" /><path d=\"m20.467 18.843.923.383\" /><circle cx=\"17.695\" cy=\"17.695\" r=\"3\" />","shield-cog":"<path d=\"m10.929 14.467-.383.924\" /><path d=\"M10.929 8.923 10.546 8\" /><path d=\"M13.225 8.923 13.608 8\" /><path d=\"m13.607 15.391-.382-.924\" /><path d=\"m14.849 10.547.923-.383\" /><path d=\"m14.849 12.843.923.383\" /><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /><path d=\"m9.305 10.547-.923-.383\" /><path d=\"m9.305 12.843-.923.383\" /><circle cx=\"12.077\" cy=\"11.695\" r=\"3\" />","shield-ellipsis":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /><path d=\"M8 12h.01\" /><path d=\"M12 12h.01\" /><path d=\"M16 12h.01\" />","shield-half":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /><path d=\"M12 22V2\" />","shield-keyhole":"<path d=\"M12 13v3\" /><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 01-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 011-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 011.52 0C14.51 3.81 17 5 19 5a1 1 0 011 1z\" /><circle cx=\"12\" cy=\"11\" r=\"2\" />","shield-lock":"<path d=\"M20 9.807V6a1 1 0 00-1-1c-2 0-4.49-1.19-6.24-2.72a1.17 1.17 0 00-1.52 0C9.5 3.8 7 5 5 5a1 1 0 00-1 1v7c0 3.88 2.107 6.254 5 7.796\" /><path d=\"M19 17v-2a2 2 0 00-4 0v2\" /><rect x=\"13\" y=\"17\" width=\"8\" height=\"5\" rx=\"1\" />","shield-minus":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /><path d=\"M9 12h6\" />","shield-off":"<path d=\"m2 2 20 20\" /><path d=\"M5 5a1 1 0 0 0-1 1v7c0 5 3.5 7.5 7.67 8.94a1 1 0 0 0 .67.01c2.35-.82 4.48-1.97 5.9-3.71\" /><path d=\"M9.309 3.652A12.252 12.252 0 0 0 11.24 2.28a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v7a9.784 9.784 0 0 1-.08 1.264\" />","shield-plus":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /><path d=\"M9 12h6\" /><path d=\"M12 9v6\" />","shield-question-mark":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /><path d=\"M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3\" /><path d=\"M12 17h.01\" />","shield-question":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /><path d=\"M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3\" /><path d=\"M12 17h.01\" />","shield-user":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /><path d=\"M6.376 18.91a6 6 0 0 1 11.249.003\" /><circle cx=\"12\" cy=\"11\" r=\"4\" />","shield-x":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /><path d=\"m14.5 9.5-5 5\" /><path d=\"m9.5 9.5 5 5\" />","shield":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" />","ship-cargo":"<path d=\"M12 15v-3\" /><path d=\"M12 2v2\" /><path d=\"M16.5 12V9a1 1 0 011-1h1a1 1 0 001-1V5a1 1 0 00-1-1h-13a1 1 0 00-1 1v2a1 1 0 001 1h1a1 1 0 011 1v3\" /><path d=\"M19.38 19c1.076-1.815 1.636-4.89 1.628-6.008a1 1 0 00-1-.992H3.984a1 1 0 00-1 .984c-.03 1.86.97 5.621 2.826 7.776\" /><path d=\"M2 20c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1\" />","ship-wheel":"<circle cx=\"12\" cy=\"12\" r=\"8\" /><path d=\"M12 2v7.5\" /><path d=\"m19 5-5.23 5.23\" /><path d=\"M22 12h-7.5\" /><path d=\"m19 19-5.23-5.23\" /><path d=\"M12 14.5V22\" /><path d=\"M10.23 13.77 5 19\" /><path d=\"M9.5 12H2\" /><path d=\"M10.23 10.23 5 5\" /><circle cx=\"12\" cy=\"12\" r=\"2.5\" />","ship":"<path d=\"M12 2v2\" /><path d=\"M12 9.189V13\" /><path d=\"M19 12V6a2 2 0 00-2-2H7a2 2 0 00-2 2v6\" /><path d=\"M19.38 19A11.6 11.6 0 0021 13l-8.188-3.639a2 2 0 00-1.624 0L3 13.001a11.6 11.6 0 002.81 7.76\" /><path d=\"M2 20c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1\" />","shirt":"<path d=\"M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z\" />","shopping-bag":"<path d=\"M16 10a4 4 0 0 1-8 0\" /><path d=\"M3.103 6.034h17.794\" /><path d=\"M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z\" />","shopping-basket":"<path d=\"m15 11-1 9\" /><path d=\"m19 11-4-7\" /><path d=\"M2 11h20\" /><path d=\"m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4\" /><path d=\"M4.5 15.5h15\" /><path d=\"m5 11 4-7\" /><path d=\"m9 11 1 9\" />","shopping-cart-minus":"<path d=\"M16 5h6\" /><path d=\"m2.05 2.05 1.099-.028a1 1 0 011.008.815l2.69 14.347A1 1 0 007.83 18H18\" /><path d=\"M4.564 5H12\" /><path d=\"M6.25 14h12.712a2 2 0 001.991-1.57l.514-3.113\" /><circle cx=\"18\" cy=\"20\" r=\"2\" /><circle cx=\"8\" cy=\"20\" r=\"2\" />","shopping-cart-plus":"<path d=\"M16 5h6\" /><path d=\"M19 2v6\" /><path d=\"m2.05 2.05 1.099-.028a1 1 0 011.008.815l2.69 14.347A1 1 0 007.83 18H18\" /><path d=\"M4.564 5H12\" /><path d=\"M6.25 14h12.712a2 2 0 001.991-1.57l.172-1.041\" /><circle cx=\"18\" cy=\"20\" r=\"2\" /><circle cx=\"8\" cy=\"20\" r=\"2\" />","shopping-cart":"<path d=\"m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18\" /><path d=\"M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25\" /><circle cx=\"18\" cy=\"20\" r=\"2\" /><circle cx=\"8\" cy=\"20\" r=\"2\" />","shovel":"<path d=\"M21.56 4.56a1.5 1.5 0 0 1 0 2.122l-.47.47a3 3 0 0 1-4.212-.03 3 3 0 0 1 0-4.243l.44-.44a1.5 1.5 0 0 1 2.121 0z\" /><path d=\"M3 22a1 1 0 0 1-1-1v-3.586a1 1 0 0 1 .293-.707l3.355-3.355a1.205 1.205 0 0 1 1.704 0l3.296 3.296a1.205 1.205 0 0 1 0 1.704l-3.355 3.355a1 1 0 0 1-.707.293z\" /><path d=\"m9 15 7.879-7.878\" />","shower-head":"<path d=\"m4 4 2.5 2.5\" /><path d=\"M13.5 6.5a4.95 4.95 0 0 0-7 7\" /><path d=\"M15 5 5 15\" /><path d=\"M14 17v.01\" /><path d=\"M10 16v.01\" /><path d=\"M13 13v.01\" /><path d=\"M16 10v.01\" /><path d=\"M11 20v.01\" /><path d=\"M17 14v.01\" /><path d=\"M20 11v.01\" />","shredder":"<path d=\"M4 13V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M10 22v-5\" /><path d=\"M14 19v-2\" /><path d=\"M18 20v-3\" /><path d=\"M2 13h20\" /><path d=\"M6 20v-3\" />","shrimp-off":"<path d=\"M10 2a3.28 3.28 0 003.227 1.798l6.17-.561A1 1 0 1119.614 8H13.5\" /><path d=\"M11 20c-.5.5-1.12 1-2.5 1a1 1 0 010-5H12a7 7 0 003.283-.817\" /><path d=\"M11 22c-.5-.5-1.12-1-2.5-1a6.5 6.5 0 01-5.63-3.25 6.44 6.44 0 015.236-9.744\" /><path d=\"M18.04 12.54A7 7 0 0019 9V8\" /><path d=\"m2 2 20 20\" /><path d=\"M8 16c-2 0-4.5-4-4-6\" /><path d=\"M9.43 9.33A8.5 8.5 0 0010 16\" />","shrimp":"<path d=\"M10 2a3.28 3.28 0 003.227 1.798l6.17-.561A1 1 0 1119.614 8H8.5a6.44 6.44 0 00-5.63 9.75A6.5 6.5 0 008.5 21c1.38 0 2-.5 2.5-1\" /><path d=\"M10 8a8.5 8.5 0 000 8\" /><path d=\"M11 22c-.5-.5-1.12-1-2.5-1a1 1 0 010-5H12a7 7 0 007-7V8\" /><path d=\"M13 12h.01\" /><path d=\"M8 16c-2 0-4.5-4-4-6\" />","shrink":"<path d=\"m15 15 6 6m-6-6v4.8m0-4.8h4.8\" /><path d=\"M9 19.8V15m0 0H4.2M9 15l-6 6\" /><path d=\"M15 4.2V9m0 0h4.8M15 9l6-6\" /><path d=\"M9 4.2V9m0 0H4.2M9 9 3 3\" />","shrub":"<path d=\"M12 22v-5.172a2 2 0 0 0-.586-1.414L9.5 13.5\" /><path d=\"M14.5 14.5 12 17\" /><path d=\"M17 8.8A6 6 0 0 1 13.8 20H10A6.5 6.5 0 0 1 7 8a5 5 0 0 1 10 0z\" />","shuffle":"<path d=\"m18 14 4 4-4 4\" /><path d=\"m18 2 4 4-4 4\" /><path d=\"M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22\" /><path d=\"M2 6h1.972a4 4 0 0 1 3.6 2.2\" /><path d=\"M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45\" />","sidebar-close":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M9 3v18\" /><path d=\"m16 15-3-3 3-3\" />","sidebar-open":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M9 3v18\" /><path d=\"m14 9 3 3-3 3\" />","sidebar":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M9 3v18\" />","sigma-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M16 8.9V7H8l4 5-4 5h8v-1.9\" />","sigma":"<path d=\"M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2\" />","signal-high":"<path d=\"M2 20h.01\" /><path d=\"M7 20v-4\" /><path d=\"M12 20v-8\" /><path d=\"M17 20V8\" />","signal-low":"<path d=\"M2 20h.01\" /><path d=\"M7 20v-4\" />","signal-medium":"<path d=\"M2 20h.01\" /><path d=\"M7 20v-4\" /><path d=\"M12 20v-8\" />","signal-zero":"<path d=\"M2 20h.01\" />","signal":"<path d=\"M2 20h.01\" /><path d=\"M7 20v-4\" /><path d=\"M12 20v-8\" /><path d=\"M17 20V8\" /><path d=\"M22 4v16\" />","signature":"<path d=\"m21 17-2.156-1.868A.5.5 0 0 0 18 15.5v.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1c0-2.545-3.991-3.97-8.5-4a1 1 0 0 0 0 5c4.153 0 4.745-11.295 5.708-13.5a2.5 2.5 0 1 1 3.31 3.284\" /><path d=\"M3 21h18\" />","signpost-big":"<path d=\"M10 9H4L2 7l2-2h6\" /><path d=\"M14 5h6l2 2-2 2h-6\" /><path d=\"M10 22V4a2 2 0 1 1 4 0v18\" /><path d=\"M8 22h8\" />","signpost":"<path d=\"M12 13v8\" /><path d=\"M12 3v3\" /><path d=\"M2.354 10.354a1.207 1.207 0 0 1 0-1.708l2.06-2.06A2 2 0 0 1 5.828 6h12.344a2 2 0 0 1 1.414.586l2.06 2.06a1.207 1.207 0 0 1 0 1.708l-2.06 2.06a2 2 0 0 1-1.414.586H5.828a2 2 0 0 1-1.414-.586z\" />","siren":"<path d=\"M7 18v-6a5 5 0 1 1 10 0v6\" /><path d=\"M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z\" /><path d=\"M21 12h1\" /><path d=\"M18.5 4.5 18 5\" /><path d=\"M2 12h1\" /><path d=\"M12 2v1\" /><path d=\"m4.929 4.929.707.707\" /><path d=\"M12 12v6\" />","skip-back":"<path d=\"M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z\" /><path d=\"M3 20V4\" />","skip-forward":"<path d=\"M21 4v16\" /><path d=\"M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z\" />","skull":"<path d=\"m12.5 17-.5-1-.5 1h1z\" /><path d=\"M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z\" /><circle cx=\"15\" cy=\"12\" r=\"1\" /><circle cx=\"9\" cy=\"12\" r=\"1\" />","slash-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><line x1=\"9\" x2=\"15\" y1=\"15\" y2=\"9\" />","slash":"<path d=\"M22 2 2 22\" />","slice":"<path d=\"M11 16.586V19a1 1 0 0 1-1 1H2L18.37 3.63a1 1 0 1 1 3 3l-9.663 9.663a1 1 0 0 1-1.414 0L8 14\" />","sliders-horizontal":"<path d=\"M10 5H3\" /><path d=\"M12 19H3\" /><path d=\"M14 3v4\" /><path d=\"M16 17v4\" /><path d=\"M21 12h-9\" /><path d=\"M21 19h-5\" /><path d=\"M21 5h-7\" /><path d=\"M8 10v4\" /><path d=\"M8 12H3\" />","sliders-vertical":"<path d=\"M10 8h4\" /><path d=\"M12 21v-9\" /><path d=\"M12 8V3\" /><path d=\"M17 16h4\" /><path d=\"M19 12V3\" /><path d=\"M19 21v-5\" /><path d=\"M3 14h4\" /><path d=\"M5 10V3\" /><path d=\"M5 21v-7\" />","sliders":"<path d=\"M10 8h4\" /><path d=\"M12 21v-9\" /><path d=\"M12 8V3\" /><path d=\"M17 16h4\" /><path d=\"M19 12V3\" /><path d=\"M19 21v-5\" /><path d=\"M3 14h4\" /><path d=\"M5 10V3\" /><path d=\"M5 21v-7\" />","smartphone-charging":"<rect width=\"14\" height=\"20\" x=\"5\" y=\"2\" rx=\"2\" ry=\"2\" /><path d=\"M12.667 8 10 12h4l-2.667 4\" />","smartphone-nfc":"<rect width=\"7\" height=\"12\" x=\"2\" y=\"6\" rx=\"1\" /><path d=\"M13 8.32a7.43 7.43 0 0 1 0 7.36\" /><path d=\"M16.46 6.21a11.76 11.76 0 0 1 0 11.58\" /><path d=\"M19.91 4.1a15.91 15.91 0 0 1 .01 15.8\" />","smartphone":"<rect width=\"14\" height=\"20\" x=\"5\" y=\"2\" rx=\"2\" ry=\"2\" /><path d=\"M12 18h.01\" />","smile-plus":"<path d=\"M13.267 2.08a10 10 0 108.653 8.653\" /><path d=\"M15 10V9\" /><path d=\"M16 5h6\" /><path d=\"M16.472 15a6 6 0 01-8.943 0\" /><path d=\"M19 2v6\" /><path d=\"M9 10V9\" />","smile":"<path d=\"M15 10V9\" /><path d=\"M16.472 15a6 6 0 01-8.943 0\" /><path d=\"M9 10V9\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","snail":"<path d=\"M2 13a6 6 0 1 0 12 0 4 4 0 1 0-8 0 2 2 0 0 0 4 0\" /><circle cx=\"10\" cy=\"13\" r=\"8\" /><path d=\"M2 21h12c4.4 0 8-3.6 8-8V7a2 2 0 1 0-4 0v6\" /><path d=\"M18 3 19.1 5.2\" /><path d=\"M22 3 20.9 5.2\" />","snowflake":"<path d=\"m10 20-1.25-2.5L6 18\" /><path d=\"M10 4 8.75 6.5 6 6\" /><path d=\"m14 20 1.25-2.5L18 18\" /><path d=\"m14 4 1.25 2.5L18 6\" /><path d=\"m17 21-3-6h-4\" /><path d=\"m17 3-3 6 1.5 3\" /><path d=\"M2 12h6.5L10 9\" /><path d=\"m20 10-1.5 2 1.5 2\" /><path d=\"M22 12h-6.5L14 15\" /><path d=\"m4 10 1.5 2L4 14\" /><path d=\"m7 21 3-6-1.5-3\" /><path d=\"m7 3 3 6h4\" />","soap-dispenser-droplet":"<path d=\"M10.5 2v4\" /><path d=\"M14 2H7a2 2 0 0 0-2 2\" /><path d=\"M19.29 14.76A6.67 6.67 0 0 1 17 11a6.6 6.6 0 0 1-2.29 3.76c-1.15.92-1.71 2.04-1.71 3.19 0 2.22 1.8 4.05 4 4.05s4-1.83 4-4.05c0-1.16-.57-2.26-1.71-3.19\" /><path d=\"M9.607 21H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h7V7a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3\" />","sofa":"<path d=\"M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3\" /><path d=\"M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z\" /><path d=\"M4 18v2\" /><path d=\"M20 18v2\" /><path d=\"M12 4v9\" />","solar-panel":"<path d=\"M11 2h2\" /><path d=\"m14.28 14-4.56 8\" /><path d=\"m21 22-1.558-4H4.558\" /><path d=\"M3 10v2\" /><path d=\"M6.245 15.04A2 2 0 0 1 8 14h12a1 1 0 0 1 .864 1.505l-3.11 5.457A2 2 0 0 1 16 22H4a1 1 0 0 1-.863-1.506z\" /><path d=\"M7 2a4 4 0 0 1-4 4\" /><path d=\"m8.66 7.66 1.41 1.41\" />","sort-asc":"<path d=\"m3 8 4-4 4 4\" /><path d=\"M7 4v16\" /><path d=\"M11 12h4\" /><path d=\"M11 16h7\" /><path d=\"M11 20h10\" />","sort-desc":"<path d=\"m3 16 4 4 4-4\" /><path d=\"M7 20V4\" /><path d=\"M11 4h10\" /><path d=\"M11 8h7\" /><path d=\"M11 12h4\" />","soup":"<path d=\"M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z\" /><path d=\"M7 21h10\" /><path d=\"M19.5 12 22 6\" /><path d=\"M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62\" /><path d=\"M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62\" /><path d=\"M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62\" />","space":"<path d=\"M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1\" />","spade":"<path d=\"M12 18v4\" /><path d=\"M2 14.499a5.5 5.5 0 0 0 9.591 3.675.6.6 0 0 1 .818.001A5.5 5.5 0 0 0 22 14.5c0-2.29-1.5-4-3-5.5l-5.492-5.312a2 2 0 0 0-3-.02L5 8.999c-1.5 1.5-3 3.2-3 5.5\" />","sparkle":"<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\" />","sparkles":"<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\" /><path d=\"M20 2v4\" /><path d=\"M22 4h-4\" /><circle cx=\"4\" cy=\"20\" r=\"2\" />","speaker":"<rect width=\"16\" height=\"20\" x=\"4\" y=\"2\" rx=\"2\" /><path d=\"M12 6h.01\" /><circle cx=\"12\" cy=\"14\" r=\"4\" /><path d=\"M12 14h.01\" />","speech":"<path d=\"M8.8 20v-4.1l1.9.2a2.3 2.3 0 0 0 2.164-2.1V8.3A5.37 5.37 0 0 0 2 8.25c0 2.8.656 3.054 1 4.55a5.77 5.77 0 0 1 .029 2.758L2 20\" /><path d=\"M19.8 17.8a7.5 7.5 0 0 0 .003-10.603\" /><path d=\"M17 15a3.5 3.5 0 0 0-.025-4.975\" />","spell-check-2":"<path d=\"m6 16 6-12 6 12\" /><path d=\"M8 12h8\" /><path d=\"M4 21c1.1 0 1.1-1 2.3-1s1.1 1 2.3 1c1.1 0 1.1-1 2.3-1 1.1 0 1.1 1 2.3 1 1.1 0 1.1-1 2.3-1 1.1 0 1.1 1 2.3 1 1.1 0 1.1-1 2.3-1\" />","spell-check":"<path d=\"m20 15-5.5 5.5L12 18\" /><path d=\"m4 16 6-12 5.115 10.23\" /><path d=\"M6 12h8\" />","spline-pointer":"<path d=\"M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z\" /><path d=\"M5 17A12 12 0 0 1 17 5\" /><circle cx=\"19\" cy=\"5\" r=\"2\" /><circle cx=\"5\" cy=\"19\" r=\"2\" />","spline":"<circle cx=\"19\" cy=\"5\" r=\"2\" /><circle cx=\"5\" cy=\"19\" r=\"2\" /><path d=\"M5 17A12 12 0 0 1 17 5\" />","split-square-horizontal":"<path d=\"M12 2v20\" /><path d=\"M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3\" /><path d=\"M8 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3\" />","split-square-vertical":"<path d=\"M2 12h20\" /><path d=\"M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3\" /><path d=\"M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3\" />","split":"<path d=\"M16 3h5v5\" /><path d=\"M8 3H3v5\" /><path d=\"M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3\" /><path d=\"m15 9 6-6\" />","spool":"<path d=\"M17 13.44 4.442 17.082A2 2 0 0 0 4.982 21H19a2 2 0 0 0 .558-3.921l-1.115-.32A2 2 0 0 1 17 14.837V7.66\" /><path d=\"m7 10.56 12.558-3.642A2 2 0 0 0 19.018 3H5a2 2 0 0 0-.558 3.921l1.115.32A2 2 0 0 1 7 9.163v7.178\" />","sport-shoe":"<path d=\"m15 10.42 4.8-5.07\" /><path d=\"M19 18h3\" /><path d=\"M9.5 22 21.414 9.415A2 2 0 0 0 21.2 6.4l-5.61-4.208A1 1 0 0 0 14 3v2a2 2 0 0 1-1.394 1.906L8.677 8.053A1 1 0 0 0 8 9c-.155 6.393-2.082 9-4 9a2 2 0 0 0 0 4h14\" />","spotlight":"<path d=\"M15.295 19.562 16 22\" /><path d=\"m17 16 3.758 2.098\" /><path d=\"m19 12.5 3.026-.598\" /><path d=\"M7.61 6.3a3 3 0 0 0-3.92 1.3l-1.38 2.79a3 3 0 0 0 1.3 3.91l6.89 3.597a1 1 0 0 0 1.342-.447l3.106-6.211a1 1 0 0 0-.447-1.341z\" /><path d=\"M8 9V2\" />","spray-can":"<path d=\"M3 3h.01\" /><path d=\"M7 5h.01\" /><path d=\"M11 7h.01\" /><path d=\"M3 7h.01\" /><path d=\"M7 9h.01\" /><path d=\"M3 11h.01\" /><rect width=\"4\" height=\"4\" x=\"15\" y=\"5\" /><path d=\"m19 9 2 2v10c0 .6-.4 1-1 1h-6c-.6 0-1-.4-1-1V11l2-2\" /><path d=\"m13 14 8-2\" /><path d=\"m13 19 8-2\" />","sprout":"<path d=\"M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3\" /><path d=\"M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4\" /><path d=\"M5 21h14\" />","square-activity":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M17 12h-2l-2 5-2-10-2 5H7\" />","square-arrow-down-left":"<path d=\"M15 15H9l6-6\" /><path d=\"M9 15V9\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","square-arrow-down-right":"<path d=\"M15 15 9 9\" /><path d=\"M9 15h6V9\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","square-arrow-down":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M12 8v8\" /><path d=\"m8 12 4 4 4-4\" />","square-arrow-left":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"m12 8-4 4 4 4\" /><path d=\"M16 12H8\" />","square-arrow-out-down-left":"<path d=\"M13 21h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6\" /><path d=\"m3 21 9-9\" /><path d=\"M9 21H3v-6\" />","square-arrow-out-down-right":"<path d=\"M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6\" /><path d=\"m21 21-9-9\" /><path d=\"M21 15v6h-6\" />","square-arrow-out-up-left":"<path d=\"M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6\" /><path d=\"m3 3 9 9\" /><path d=\"M3 9V3h6\" />","square-arrow-out-up-right":"<path d=\"M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6\" /><path d=\"m21 3-9 9\" /><path d=\"M15 3h6v6\" />","square-arrow-right-enter":"<path d=\"m10 16 4-4-4-4\" /><path d=\"M3 12h11\" /><path d=\"M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3\" />","square-arrow-right-exit":"<path d=\"M10 12h11\" /><path d=\"m17 16 4-4-4-4\" /><path d=\"M21 6.344V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1.344\" />","square-arrow-right":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M8 12h8\" /><path d=\"m12 16 4-4-4-4\" />","square-arrow-up-left":"<path d=\"M15 15 9 9\" /><path d=\"M9 15V9h6\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","square-arrow-up-right":"<path d=\"M15 15V9H9\" /><path d=\"m9 15 6-6\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","square-arrow-up":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"m16 12-4-4-4 4\" /><path d=\"M12 16V8\" />","square-asterisk":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M12 8v8\" /><path d=\"m8.5 14 7-4\" /><path d=\"m8.5 10 7 4\" />","square-bookmark":"<path d=\"M11 3v7.751a.25.25 0 00.407.195l2.28-1.834a.5.5 0 01.627 0l2.28 1.834a.25.25 0 00.406-.195V3\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","square-bottom-dashed-scissors":"<path d=\"M14 21h1\" /><path d=\"m17 17-2.18-2.18\" /><path d=\"M5 21a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2\" /><path d=\"M9 21h1\" /><path d=\"M9.56 14.44 17 7\" /><path d=\"M9.56 9.56 12 12\" /><circle cx=\"8.5\" cy=\"15.5\" r=\"1.5\" /><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\" />","square-centerline-dashed-horizontal":"<path d=\"M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3\" /><path d=\"M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3\" /><path d=\"M12 20v2\" /><path d=\"M12 14v2\" /><path d=\"M12 8v2\" /><path d=\"M12 2v2\" />","square-centerline-dashed-vertical":"<path d=\"M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3\" /><path d=\"M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3\" /><path d=\"M4 12H2\" /><path d=\"M10 12H8\" /><path d=\"M16 12h-2\" /><path d=\"M22 12h-2\" />","square-chart-gantt":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M9 8h7\" /><path d=\"M8 12h6\" /><path d=\"M11 16h5\" />","square-check-big":"<path d=\"M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344\" /><path d=\"m9 11 3 3L22 4\" />","square-check":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"m16 9-5.5 5.5L8 12\" />","square-chevron-down":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"m16 10-4 4-4-4\" />","square-chevron-left":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"m14 16-4-4 4-4\" />","square-chevron-right":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"m10 8 4 4-4 4\" />","square-chevron-up":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"m8 14 4-4 4 4\" />","square-code":"<path d=\"m10 9-3 3 3 3\" /><path d=\"m14 15 3-3-3-3\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","square-dashed-bottom-code":"<path d=\"M10 9.5 8 12l2 2.5\" /><path d=\"M14 21h1\" /><path d=\"m14 9.5 2 2.5-2 2.5\" /><path d=\"M5 21a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2\" /><path d=\"M9 21h1\" />","square-dashed-bottom":"<path d=\"M5 21a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2\" /><path d=\"M9 21h1\" /><path d=\"M14 21h1\" />","square-dashed-kanban":"<path d=\"M8 7v7\" /><path d=\"M12 7v4\" /><path d=\"M16 7v9\" /><path d=\"M5 3a2 2 0 0 0-2 2\" /><path d=\"M9 3h1\" /><path d=\"M14 3h1\" /><path d=\"M19 3a2 2 0 0 1 2 2\" /><path d=\"M21 9v1\" /><path d=\"M21 14v1\" /><path d=\"M21 19a2 2 0 0 1-2 2\" /><path d=\"M14 21h1\" /><path d=\"M9 21h1\" /><path d=\"M5 21a2 2 0 0 1-2-2\" /><path d=\"M3 14v1\" /><path d=\"M3 9v1\" />","square-dashed-mouse-pointer":"<path d=\"M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z\" /><path d=\"M5 3a2 2 0 0 0-2 2\" /><path d=\"M19 3a2 2 0 0 1 2 2\" /><path d=\"M5 21a2 2 0 0 1-2-2\" /><path d=\"M9 3h1\" /><path d=\"M9 21h2\" /><path d=\"M14 3h1\" /><path d=\"M3 9v1\" /><path d=\"M21 9v2\" /><path d=\"M3 14v1\" />","square-dashed-plus":"<path d=\"M5 3a2 2 0 0 0-2 2\" /><path d=\"M19 3a2 2 0 0 1 2 2\" /><path d=\"M21 19a2 2 0 0 1-2 2\" /><path d=\"M5 21a2 2 0 0 1-2-2\" /><path d=\"M9 3h1\" /><path d=\"M9 21h1\" /><path d=\"M14 3h1\" /><path d=\"M14 21h1\" /><path d=\"M3 9v1\" /><path d=\"M21 9v1\" /><path d=\"M3 14v1\" /><path d=\"M21 14v1\" /><path d=\"M8 12h8\" /><path d=\"M12 8v8\" />","square-dashed-text":"<path d=\"M14 21h1\" /><path d=\"M14 3h1\" /><path d=\"M19 3a2 2 0 0 1 2 2\" /><path d=\"M21 14v1\" /><path d=\"M21 19a2 2 0 0 1-2 2\" /><path d=\"M21 9v1\" /><path d=\"M3 14v1\" /><path d=\"M3 9v1\" /><path d=\"M5 21a2 2 0 0 1-2-2\" /><path d=\"M5 3a2 2 0 0 0-2 2\" /><path d=\"M7 12h10\" /><path d=\"M7 16h6\" /><path d=\"M7 8h8\" /><path d=\"M9 21h1\" /><path d=\"M9 3h1\" />","square-dashed-top-solid":"<path d=\"M14 21h1\" /><path d=\"M21 14v1\" /><path d=\"M21 19a2 2 0 0 1-2 2\" /><path d=\"M21 9v1\" /><path d=\"M3 14v1\" /><path d=\"M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2\" /><path d=\"M3 9v1\" /><path d=\"M5 21a2 2 0 0 1-2-2\" /><path d=\"M9 21h1\" />","square-dashed-x-corner":"<path d=\"M14 3h1\" /><path d=\"m16 16 5 5\" /><path d=\"M19 3a2 2 0 012 2\" /><path d=\"m21 16-5 5\" /><path d=\"M21 9v1\" /><path d=\"M3 14v1\" /><path d=\"M3 9v1\" /><path d=\"M5 21a2 2 0 01-2-2\" /><path d=\"M5 3a2 2 0 00-2 2\" /><path d=\"M9 21h1\" /><path d=\"M9 3h1\" />","square-dashed-x":"<path d=\"M14 21h1\" /><path d=\"M14 3h1\" /><path d=\"M19 3a2 2 0 012 2\" /><path d=\"M21 14v1\" /><path d=\"M21 19a2 2 0 01-2 2\" /><path d=\"M21 9v1\" /><path d=\"M3 14v1\" /><path d=\"M3 9v1\" /><path d=\"M5 21a2 2 0 01-2-2\" /><path d=\"M5 3a2 2 0 00-2 2\" /><path d=\"m9 15 6-6\" /><path d=\"M9 21h1\" /><path d=\"M9 3h1\" /><path d=\"m9 9 6 6\" />","square-dashed":"<path d=\"M5 3a2 2 0 0 0-2 2\" /><path d=\"M19 3a2 2 0 0 1 2 2\" /><path d=\"M21 19a2 2 0 0 1-2 2\" /><path d=\"M5 21a2 2 0 0 1-2-2\" /><path d=\"M9 3h1\" /><path d=\"M9 21h1\" /><path d=\"M14 3h1\" /><path d=\"M14 21h1\" /><path d=\"M3 9v1\" /><path d=\"M21 9v1\" /><path d=\"M3 14v1\" /><path d=\"M21 14v1\" />","square-dimensions":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M12 7H7v5\" /><path d=\"M12 17h5v-5\" />","square-divide":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" /><line x1=\"8\" x2=\"16\" y1=\"12\" y2=\"12\" /><line x1=\"12\" x2=\"12\" y1=\"16\" y2=\"16\" /><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"8\" />","square-dot":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><circle cx=\"12\" cy=\"12\" r=\"1\" />","square-equal":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M7 10h10\" /><path d=\"M7 14h10\" />","square-exclamation-point":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\" /><line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\" />","square-function":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" /><path d=\"M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3\" /><path d=\"M9 11.2h5.7\" />","square-gantt-chart":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M9 8h7\" /><path d=\"M8 12h6\" /><path d=\"M11 16h5\" />","square-kanban":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M8 7v7\" /><path d=\"M12 7v4\" /><path d=\"M16 7v9\" />","square-library":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M7 7v10\" /><path d=\"M11 7v10\" /><path d=\"m15 7 2 10\" />","square-m":"<path d=\"M8 16V8.5a.5.5 0 0 1 .9-.3l2.7 3.599a.5.5 0 0 0 .8 0l2.7-3.6a.5.5 0 0 1 .9.3V16\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","square-menu":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M7 8h10\" /><path d=\"M7 12h10\" /><path d=\"M7 16h10\" />","square-minus":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M8 12h8\" />","square-mouse-pointer":"<path d=\"M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z\" /><path d=\"M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6\" />","square-off":"<path d=\"M20.4 20.4a2 2 0 01-1.4.6H5a2 2 0 01-2-2V5a2 2 0 01.59-1.41\" /><path d=\"M21 15.3V5a2 2 0 00-2-2H8.7\" /><path d=\"M22 22 2 2\" />","square-parking-off":"<path d=\"M3.6 3.6A2 2 0 0 1 5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-.59 1.41\" /><path d=\"M3 8.7V19a2 2 0 0 0 2 2h10.3\" /><path d=\"m2 2 20 20\" /><path d=\"M13 13a3 3 0 1 0 0-6H9v2\" /><path d=\"M9 17v-2.3\" />","square-parking":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M9 17V7h4a3 3 0 0 1 0 6H9\" />","square-pause":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><line x1=\"10\" x2=\"10\" y1=\"15\" y2=\"9\" /><line x1=\"14\" x2=\"14\" y1=\"15\" y2=\"9\" />","square-pen":"<path d=\"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\" /><path d=\"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z\" />","square-percent":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"m15 9-6 6\" /><path d=\"M9 9h.01\" /><path d=\"M15 15h.01\" />","square-pi":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M7 7h10\" /><path d=\"M10 7v10\" /><path d=\"M16 17a2 2 0 0 1-2-2V7\" />","square-pilcrow":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M12 12H9.5a2.5 2.5 0 0 1 0-5H17\" /><path d=\"M12 7v10\" /><path d=\"M16 7v10\" />","square-play":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" /><path d=\"M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z\" />","square-plus":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M8 12h8\" /><path d=\"M12 8v8\" />","square-power":"<path d=\"M12 7v4\" /><path d=\"M7.998 9.003a5 5 0 1 0 8-.005\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","square-radical":"<path d=\"M7 12h2l2 5 2-10h4\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","square-round-corner":"<path d=\"M21 11a8 8 0 0 0-8-8\" /><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\" />","square-scissors":"<path d=\"m17 17-2.18-2.18\" /><path d=\"M9.56 14.44 17 7\" /><path d=\"M9.56 9.56 12 12\" /><circle cx=\"8.5\" cy=\"15.5\" r=\"1.5\" /><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","square-sigma":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M16 8.9V7H8l4 5-4 5h8v-1.9\" />","square-slash":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><line x1=\"9\" x2=\"15\" y1=\"15\" y2=\"9\" />","square-sparkles":"<path d=\"M11 15H7\" /><path d=\"M15.41 2.49a.6.6 0 011.18 0l.63 3.334a1.2 1.2 0 00.956.955l3.334.631a.6.6 0 010 1.18l-3.334.63a1.2 1.2 0 00-.955.956l-.631 3.334a.6.6 0 01-1.18 0l-.63-3.334a1.2 1.2 0 00-.956-.955L10.49 8.59a.6.6 0 010-1.18l3.334-.63a1.2 1.2 0 00.955-.956z\" /><path d=\"M21 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6\" /><path d=\"M9 13v4\" />","square-split-horizontal":"<path d=\"M12 2v20\" /><path d=\"M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3\" /><path d=\"M8 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3\" />","square-split-vertical":"<path d=\"M2 12h20\" /><path d=\"M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3\" /><path d=\"M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3\" />","square-square":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" /><rect x=\"8\" y=\"8\" width=\"8\" height=\"8\" rx=\"1\" />","square-stack":"<path d=\"M4 10c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2\" /><path d=\"M10 16c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2\" /><rect width=\"8\" height=\"8\" x=\"14\" y=\"14\" rx=\"2\" />","square-star":"<path d=\"M11.035 7.69a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.866l-1.156-1.153a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","square-stop":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\" rx=\"1\" />","square-terminal":"<path d=\"m7 11 2-2-2-2\" /><path d=\"M11 13h4\" /><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" />","square-text":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M7 8h8\" /><path d=\"M7 12h10\" /><path d=\"M7 16h6\" />","square-user-round":"<path d=\"M18 21a6 6 0 0 0-12 0\" /><circle cx=\"12\" cy=\"11\" r=\"4\" /><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" />","square-user":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><circle cx=\"12\" cy=\"10\" r=\"3\" /><path d=\"M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2\" />","square-x":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" /><path d=\"m15 9-6 6\" /><path d=\"m9 9 6 6\" />","square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" />","squares-exclude":"<path d=\"M16 12v2a2 2 0 0 1-2 2H9a1 1 0 0 0-1 1v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h0\" /><path d=\"M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3a1 1 0 0 1-1 1h-5a2 2 0 0 0-2 2v2\" />","squares-intersect":"<path d=\"M10 22a2 2 0 0 1-2-2\" /><path d=\"M14 2a2 2 0 0 1 2 2\" /><path d=\"M16 22h-2\" /><path d=\"M2 10V8\" /><path d=\"M2 4a2 2 0 0 1 2-2\" /><path d=\"M20 8a2 2 0 0 1 2 2\" /><path d=\"M22 14v2\" /><path d=\"M22 20a2 2 0 0 1-2 2\" /><path d=\"M4 16a2 2 0 0 1-2-2\" /><path d=\"M8 10a2 2 0 0 1 2-2h5a1 1 0 0 1 1 1v5a2 2 0 0 1-2 2H9a1 1 0 0 1-1-1z\" /><path d=\"M8 2h2\" />","squares-subtract":"<path d=\"M10 22a2 2 0 0 1-2-2\" /><path d=\"M16 22h-2\" /><path d=\"M16 4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-5a2 2 0 0 1 2-2h5a1 1 0 0 0 1-1z\" /><path d=\"M20 8a2 2 0 0 1 2 2\" /><path d=\"M22 14v2\" /><path d=\"M22 20a2 2 0 0 1-2 2\" />","squares-unite":"<path d=\"M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3a1 1 0 0 0 1 1h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-3a1 1 0 0 0-1-1z\" />","squircle-dashed":"<path d=\"M13.77 3.043a34 34 0 0 0-3.54 0\" /><path d=\"M13.771 20.956a33 33 0 0 1-3.541.001\" /><path d=\"M20.18 17.74c-.51 1.15-1.29 1.93-2.439 2.44\" /><path d=\"M20.18 6.259c-.51-1.148-1.291-1.929-2.44-2.438\" /><path d=\"M20.957 10.23a33 33 0 0 1 0 3.54\" /><path d=\"M3.043 10.23a34 34 0 0 0 .001 3.541\" /><path d=\"M6.26 20.179c-1.15-.508-1.93-1.29-2.44-2.438\" /><path d=\"M6.26 3.82c-1.149.51-1.93 1.291-2.44 2.44\" />","squircle":"<path d=\"M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9\" />","squirrel":"<path d=\"M15.236 22a3 3 0 0 0-2.2-5\" /><path d=\"M16 20a3 3 0 0 1 3-3h1a2 2 0 0 0 2-2v-2a4 4 0 0 0-4-4V4\" /><path d=\"M18 13h.01\" /><path d=\"M18 6a4 4 0 0 0-4 4 7 7 0 0 0-7 7c0-5 4-5 4-10.5a4.5 4.5 0 1 0-9 0 2.5 2.5 0 0 0 5 0C7 10 3 11 3 17c0 2.8 2.2 5 5 5h10\" />","stamp":"<path d=\"M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-6 0c0 2 1 2 1 3.5V13\" /><path d=\"M20 15.5a2.5 2.5 0 0 0-2.5-2.5h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1z\" /><path d=\"M5 22h14\" />","star-check":"<path d=\"m19.06 12.501 2.78-2.707a.53.53 0 0 0-.294-.905l-5.166-.755a2.1 2.1 0 0 1-1.595-1.16l-2.31-4.68a.53.53 0 0 0-.95.001L9.216 6.974a2.1 2.1 0 0 1-1.597 1.16l-5.165.755a.53.53 0 0 0-.294.906l3.736 3.637a2.1 2.1 0 0 1 .611 1.879l-.88 5.139a.53.53 0 0 0 .769.56l4.617-2.428.027-.014\" /><path d=\"m15 18 2 2 4-4\" />","star-half":"<path d=\"M12 18.338a2.1 2.1 0 0 0-.987.244L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16l2.309-4.679A.53.53 0 0 1 12 2\" />","star-minus":"<path d=\"M15 18h6\" /><path d=\"M17.688 14a2.1 2.1 0 0 1 .416-.568l3.736-3.638a.53.53 0 0 0-.294-.905l-5.166-.755a2.1 2.1 0 0 1-1.595-1.16l-2.31-4.68a.53.53 0 0 0-.95.001L9.216 6.974a2.1 2.1 0 0 1-1.597 1.16l-5.165.755a.53.53 0 0 0-.294.906l3.736 3.637a2.1 2.1 0 0 1 .611 1.879l-.88 5.139a.53.53 0 0 0 .769.56l4.617-2.428.027-.014\" />","star-off":"<path d=\"m10.344 4.688 1.181-2.393a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.237 3.152\" /><path d=\"m17.945 17.945.43 2.505a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a8 8 0 0 0 .4-.099\" /><path d=\"m2 2 20 20\" />","star-plus":"<path d=\"M11.013 18.582 6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16l2.309-4.679a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904L20 11.5\" /><path d=\"M15 18h6\" /><path d=\"M18 15v6\" />","star-x":"<path d=\"m15.5 15.5 5 5\" /><path d=\"m20.063 11.525 1.777-1.731a.53.53 0 0 0-.294-.905l-5.166-.755a2.1 2.1 0 0 1-1.595-1.16l-2.31-4.68a.53.53 0 0 0-.95.001L9.216 6.974a2.1 2.1 0 0 1-1.597 1.16l-5.165.755a.53.53 0 0 0-.294.906l3.736 3.637a2.1 2.1 0 0 1 .611 1.879l-.88 5.139a.53.53 0 0 0 .769.56l4.617-2.428a2.1 2.1 0 0 1 .987-.243 2 2 0 0 1 .132.004\" /><path d=\"m20.5 15.5-5 5\" />","star":"<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\" />","stars":"<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\" /><path d=\"M20 2v4\" /><path d=\"M22 4h-4\" /><circle cx=\"4\" cy=\"20\" r=\"2\" />","step-back":"<path d=\"M13.971 4.285A2 2 0 0 1 17 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z\" /><path d=\"M21 20V4\" />","step-forward":"<path d=\"M10.029 4.285A2 2 0 0 0 7 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z\" /><path d=\"M3 4v16\" />","stethoscope":"<path d=\"M11 2v2\" /><path d=\"M5 2v2\" /><path d=\"M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1\" /><path d=\"M8 15a6 6 0 0 0 12 0v-3\" /><circle cx=\"20\" cy=\"10\" r=\"2\" />","sticker":"<path d=\"M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z\" /><path d=\"M15 3v5a1 1 0 0 0 1 1h5\" /><path d=\"M8 13h.01\" /><path d=\"M16 13h.01\" /><path d=\"M10 16s.8 1 2 1c1.3 0 2-1 2-1\" />","sticky-note-check":"<path d=\"m15 19 2 2 4-4\" /><path d=\"M15 3v5a1 1 0 0 0 1 1h5\" /><path d=\"M21 13V9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6.5\" />","sticky-note-minus":"<path d=\"M15 3v5a1 1 0 0 0 1 1h5\" /><path d=\"M21 14V9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7.35\" /><path d=\"M21 18h-6\" />","sticky-note-off":"<path d=\"M15 3v5a1 1 0 0 0 1 1h5\" /><path d=\"m2 2 20 20\" /><path d=\"M3.586 3.586A2 2 0 0 0 3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.414-.586\" /><path d=\"M8.656 3H15a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 21 9v6.344\" />","sticky-note-plus":"<path d=\"M15 3v5a1 1 0 0 0 1 1h5\" /><path d=\"M18 15v6\" /><path d=\"M21 12.356V9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7.355\" /><path d=\"M21 18h-6\" />","sticky-note-x":"<path d=\"M15 3v5a1 1 0 0 0 1 1h5\" /><path d=\"m16 16 5 5\" /><path d=\"M21 12V9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7\" /><path d=\"m21 16-5 5\" />","sticky-note":"<path d=\"M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z\" /><path d=\"M15 3v5a1 1 0 0 0 1 1h5\" />","sticky-notes":"<path d=\"M10 8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 16 14v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z\" /><path d=\"M10 8v5a1 1 0 0 0 1 1h5\" /><path d=\"M8 4a2 2 0 0 1 2-2h6a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 22 8v6a2 2 0 0 1-2 2\" /><path d=\"M16 2v5a1 1 0 0 0 1 1h5\" />","stone":"<path d=\"M11.264 2.205A4 4 0 0 0 6.42 4.211l-4 8a4 4 0 0 0 1.359 5.117l6 4a4 4 0 0 0 4.438 0l6-4a4 4 0 0 0 1.576-4.592l-2-6a4 4 0 0 0-2.53-2.53z\" /><path d=\"M11.99 22 14 12l7.822 3.184\" /><path d=\"M14 12 8.47 2.302\" />","stop-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\" rx=\"1\" />","store":"<path d=\"M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5\" /><path d=\"M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244\" /><path d=\"M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05\" />","stretch-horizontal":"<rect width=\"20\" height=\"6\" x=\"2\" y=\"4\" rx=\"2\" /><rect width=\"20\" height=\"6\" x=\"2\" y=\"14\" rx=\"2\" />","stretch-vertical":"<rect width=\"6\" height=\"20\" x=\"4\" y=\"2\" rx=\"2\" /><rect width=\"6\" height=\"20\" x=\"14\" y=\"2\" rx=\"2\" />","strikethrough":"<path d=\"M16 4H9a3 3 0 0 0-2.83 4\" /><path d=\"M14 12a4 4 0 0 1 0 8H6\" /><line x1=\"4\" x2=\"20\" y1=\"12\" y2=\"12\" />","subscript":"<path d=\"m4 5 8 8\" /><path d=\"m12 5-8 8\" /><path d=\"M20 19h-4c0-1.5.44-2 1.5-2.5S20 15.33 20 14c0-.47-.17-.93-.48-1.29a2.11 2.11 0 0 0-2.62-.44c-.42.24-.74.62-.9 1.07\" />","subtitles":"<rect width=\"18\" height=\"14\" x=\"3\" y=\"5\" rx=\"2\" ry=\"2\" /><path d=\"M7 15h4M15 15h2M7 11h2M13 11h4\" />","summary":"<path d=\"M15 4H7\" /><path d=\"m18 16 3 3-3 3\" /><path d=\"M3 4v13a2 2 0 0 0 2 2h16\" /><path d=\"M7 14h7\" /><path d=\"M7 9h12\" />","sun-dim":"<circle cx=\"12\" cy=\"12\" r=\"4\" /><path d=\"M12 4h.01\" /><path d=\"M20 12h.01\" /><path d=\"M12 20h.01\" /><path d=\"M4 12h.01\" /><path d=\"M17.657 6.343h.01\" /><path d=\"M17.657 17.657h.01\" /><path d=\"M6.343 17.657h.01\" /><path d=\"M6.343 6.343h.01\" />","sun-medium":"<circle cx=\"12\" cy=\"12\" r=\"4\" /><path d=\"M12 3v1\" /><path d=\"M12 20v1\" /><path d=\"M3 12h1\" /><path d=\"M20 12h1\" /><path d=\"m18.364 5.636-.707.707\" /><path d=\"m6.343 17.657-.707.707\" /><path d=\"m5.636 5.636.707.707\" /><path d=\"m17.657 17.657.707.707\" />","sun-moon":"<path d=\"M12 2v2\" /><path d=\"M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715\" /><path d=\"M16 12a4 4 0 0 0-4-4\" /><path d=\"m19 5-1.256 1.256\" /><path d=\"M20 12h2\" />","sun-snow":"<path d=\"M10 21v-1\" /><path d=\"M10 4V3\" /><path d=\"M10 9a3 3 0 0 0 0 6\" /><path d=\"m14 20 1.25-2.5L18 18\" /><path d=\"m14 4 1.25 2.5L18 6\" /><path d=\"m17 21-3-6 1.5-3H22\" /><path d=\"m17 3-3 6 1.5 3\" /><path d=\"M2 12h1\" /><path d=\"m20 10-1.5 2 1.5 2\" /><path d=\"m3.64 18.36.7-.7\" /><path d=\"m4.34 6.34-.7-.7\" />","sun":"<circle cx=\"12\" cy=\"12\" r=\"4\" /><path d=\"M12 2v2\" /><path d=\"M12 20v2\" /><path d=\"m4.93 4.93 1.41 1.41\" /><path d=\"m17.66 17.66 1.41 1.41\" /><path d=\"M2 12h2\" /><path d=\"M20 12h2\" /><path d=\"m6.34 17.66-1.41 1.41\" /><path d=\"m19.07 4.93-1.41 1.41\" />","sunrise":"<path d=\"M12 2v8\" /><path d=\"m4.93 10.93 1.41 1.41\" /><path d=\"M2 18h2\" /><path d=\"M20 18h2\" /><path d=\"m19.07 10.93-1.41 1.41\" /><path d=\"M22 22H2\" /><path d=\"m8 6 4-4 4 4\" /><path d=\"M16 18a4 4 0 0 0-8 0\" />","sunset":"<path d=\"M12 10V2\" /><path d=\"m4.93 10.93 1.41 1.41\" /><path d=\"M2 18h2\" /><path d=\"M20 18h2\" /><path d=\"m19.07 10.93-1.41 1.41\" /><path d=\"M22 22H2\" /><path d=\"m16 6-4 4-4-4\" /><path d=\"M16 18a4 4 0 0 0-8 0\" />","superscript":"<path d=\"m4 19 8-8\" /><path d=\"m12 19-8-8\" /><path d=\"M20 12h-4c0-1.5.442-2 1.5-2.5S20 8.334 20 7.002c0-.472-.17-.93-.484-1.29a2.105 2.105 0 0 0-2.617-.436c-.42.239-.738.614-.899 1.06\" />","swatch-book":"<path d=\"M11 17a4 4 0 0 1-8 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2Z\" /><path d=\"M16.7 13H19a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7\" /><path d=\"M 7 17h.01\" /><path d=\"m11 8 2.3-2.3a2.4 2.4 0 0 1 3.404.004L18.6 7.6a2.4 2.4 0 0 1 .026 3.434L9.9 19.8\" />","swiss-franc":"<path d=\"M10 21V3h8\" /><path d=\"M6 16h9\" /><path d=\"M10 9.5h7\" />","switch-camera":"<path d=\"M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5\" /><path d=\"M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5\" /><circle cx=\"12\" cy=\"12\" r=\"3\" /><path d=\"m18 22-3-3 3-3\" /><path d=\"m6 2 3 3-3 3\" />","sword":"<path d=\"m11 19-6-6\" /><path d=\"m5 21-2-2\" /><path d=\"m8 16-4 4\" /><path d=\"M9.5 17.5 20.414 6.586A2 2 0 0021 5.172V3h-2.172a2 2 0 00-1.414.586L6.5 14.5\" />","swords":"<path d=\"m13 19 6-6\" /><path d=\"M14.5 17.5 3.586 6.586A2 2 0 013 5.172V3h2.172a2 2 0 011.414.586L17.5 14.5\" /><path d=\"m14.828 6.172 2.586-2.586A2 2 0 0118.828 3H21v2.172a2 2 0 01-.586 1.414l-2.586 2.586\" /><path d=\"m16 16 4 4\" /><path d=\"m19 21 2-2\" /><path d=\"m5 14 4 4\" /><path d=\"m5 21-2-2\" /><path d=\"M7.5 16.5 4 20\" />","syringe":"<path d=\"m18 2 4 4\" /><path d=\"m17 7 3-3\" /><path d=\"M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5\" /><path d=\"m9 11 4 4\" /><path d=\"m5 19-3 3\" /><path d=\"m14 4 6 6\" />","table-2":"<path d=\"M3 9h18\" /><path d=\"M9 3v18\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","table-cells-merge":"<path d=\"M12 21v-6\" /><path d=\"M12 9V3\" /><path d=\"M3 15h18\" /><path d=\"M3 9h18\" /><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" />","table-cells-split":"<path d=\"M12 15V9\" /><path d=\"M3 15h18\" /><path d=\"M3 9h18\" /><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" />","table-columns-split":"<path d=\"M14 14v2\" /><path d=\"M14 20v2\" /><path d=\"M14 2v2\" /><path d=\"M14 8v2\" /><path d=\"M2 15h8\" /><path d=\"M2 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H2\" /><path d=\"M2 9h8\" /><path d=\"M22 15h-4\" /><path d=\"M22 3h-2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2\" /><path d=\"M22 9h-4\" /><path d=\"M5 3v18\" />","table-config":"<path d=\"M10.6 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v5.6\" /><path d=\"m14.305 19.53.923-.382\" /><path d=\"M15 3v7.6\" /><path d=\"m15.229 16.852-.924-.383\" /><path d=\"m16.852 15.228-.383-.923\" /><path d=\"m16.852 20.772-.383.924\" /><path d=\"m19.148 15.228.383-.923\" /><path d=\"m19.53 21.696-.382-.924\" /><path d=\"m20.773 16.852.922-.383\" /><path d=\"m20.773 19.148.922.383\" /><path d=\"M9 3v18\" /><circle cx=\"18\" cy=\"18\" r=\"3\" />","table-of-contents":"<path d=\"M16 5H3\" /><path d=\"M16 12H3\" /><path d=\"M16 19H3\" /><path d=\"M21 5h.01\" /><path d=\"M21 12h.01\" /><path d=\"M21 19h.01\" />","table-properties":"<path d=\"M15 3v18\" /><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M21 9H3\" /><path d=\"M21 15H3\" />","table-rows-split":"<path d=\"M14 10h2\" /><path d=\"M15 22v-8\" /><path d=\"M15 2v4\" /><path d=\"M2 10h2\" /><path d=\"M20 10h2\" /><path d=\"M3 19h18\" /><path d=\"M3 22v-6a2 2 135 0 1 2-2h14a2 2 45 0 1 2 2v6\" /><path d=\"M3 2v2a2 2 45 0 0 2 2h14a2 2 135 0 0 2-2V2\" /><path d=\"M8 10h2\" /><path d=\"M9 22v-8\" /><path d=\"M9 2v4\" />","table":"<path d=\"M12 3v18\" /><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M3 9h18\" /><path d=\"M3 15h18\" />","tablet-smartphone":"<rect width=\"10\" height=\"14\" x=\"3\" y=\"8\" rx=\"2\" /><path d=\"M5 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-2.4\" /><path d=\"M8 18h.01\" />","tablet":"<rect width=\"16\" height=\"20\" x=\"4\" y=\"2\" rx=\"2\" ry=\"2\" /><line x1=\"12\" x2=\"12.01\" y1=\"18\" y2=\"18\" />","tablets":"<circle cx=\"7\" cy=\"7\" r=\"5\" /><circle cx=\"17\" cy=\"17\" r=\"5\" /><path d=\"M12 17h10\" /><path d=\"m3.46 10.54 7.08-7.08\" />","tag-plus":"<path d=\"M16 13h6\" /><path d=\"m16.5 6.5-3.914-3.914A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l1.79-1.79\" /><path d=\"M19 10v6\" /><circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\" />","tag-x":"<path d=\"m16.5 6.5-3.914-3.914A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.43 2.43 0 0 0 3.42 0l1.79-1.79\" /><path d=\"m16.5 10.5 5 5\" /><path d=\"m21.5 10.5-5 5\" /><circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\" />","tag":"<path d=\"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z\" /><circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\" />","tags":"<path d=\"M13.172 2a2 2 0 0 1 1.414.586l6.71 6.71a2.4 2.4 0 0 1 0 3.408l-4.592 4.592a2.4 2.4 0 0 1-3.408 0l-6.71-6.71A2 2 0 0 1 6 9.172V3a1 1 0 0 1 1-1z\" /><path d=\"M2 7v6.172a2 2 0 0 0 .586 1.414l6.71 6.71a2.4 2.4 0 0 0 3.191.193\" /><circle cx=\"10.5\" cy=\"6.5\" r=\".5\" fill=\"currentColor\" />","tally-1":"<path d=\"M4 4v16\" />","tally-2":"<path d=\"M4 4v16\" /><path d=\"M9 4v16\" />","tally-3":"<path d=\"M4 4v16\" /><path d=\"M9 4v16\" /><path d=\"M14 4v16\" />","tally-4":"<path d=\"M4 4v16\" /><path d=\"M9 4v16\" /><path d=\"M14 4v16\" /><path d=\"M19 4v16\" />","tally-5":"<path d=\"M4 4v16\" /><path d=\"M9 4v16\" /><path d=\"M14 4v16\" /><path d=\"M19 4v16\" /><path d=\"M22 6 2 18\" />","tangent":"<circle cx=\"17\" cy=\"4\" r=\"2\" /><path d=\"M15.59 5.41 5.41 15.59\" /><circle cx=\"4\" cy=\"17\" r=\"2\" /><path d=\"M12 22s-4-9-1.5-11.5S22 12 22 12\" />","target":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><circle cx=\"12\" cy=\"12\" r=\"6\" /><circle cx=\"12\" cy=\"12\" r=\"2\" />","telescope":"<path d=\"m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44\" /><path d=\"m13.56 11.747 4.332-.924\" /><path d=\"m16 21-3.105-6.21\" /><path d=\"M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z\" /><path d=\"m6.158 8.633 1.114 4.456\" /><path d=\"m8 21 3.105-6.21\" /><circle cx=\"12\" cy=\"13\" r=\"2\" />","tent-tree":"<circle cx=\"4\" cy=\"4\" r=\"2\" /><path d=\"m14 5 3-3 3 3\" /><path d=\"m14 10 3-3 3 3\" /><path d=\"M17 14V2\" /><path d=\"M17 14H7l-5 8h20Z\" /><path d=\"M8 14v8\" /><path d=\"m9 14 5 8\" />","tent":"<path d=\"M3.5 21 14 3\" /><path d=\"M20.5 21 10 3\" /><path d=\"M15.5 21 12 15l-3.5 6\" /><path d=\"M2 21h20\" />","terminal-square":"<path d=\"m7 11 2-2-2-2\" /><path d=\"M11 13h4\" /><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" />","terminal":"<path d=\"M12 19h8\" /><path d=\"m4 17 6-6-6-6\" />","test-tube-2":"<path d=\"M21 7 6.82 21.18a2.83 2.83 0 0 1-3.99-.01a2.83 2.83 0 0 1 0-4L17 3\" /><path d=\"m16 2 6 6\" /><path d=\"M12 16H4\" />","test-tube-diagonal":"<path d=\"M21 7 6.82 21.18a2.83 2.83 0 0 1-3.99-.01a2.83 2.83 0 0 1 0-4L17 3\" /><path d=\"m16 2 6 6\" /><path d=\"M12 16H4\" />","test-tube":"<path d=\"M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5c-1.4 0-2.5-1.1-2.5-2.5V2\" /><path d=\"M8.5 2h7\" /><path d=\"M14.5 16h-5\" />","test-tubes":"<path d=\"M9 2v17.5A2.5 2.5 0 0 1 6.5 22A2.5 2.5 0 0 1 4 19.5V2\" /><path d=\"M20 2v17.5a2.5 2.5 0 0 1-2.5 2.5a2.5 2.5 0 0 1-2.5-2.5V2\" /><path d=\"M3 2h7\" /><path d=\"M14 2h7\" /><path d=\"M9 16H4\" /><path d=\"M20 16h-5\" />","text-align-center":"<path d=\"M21 5H3\" /><path d=\"M17 12H7\" /><path d=\"M19 19H5\" />","text-align-end":"<path d=\"M21 5H3\" /><path d=\"M21 12H9\" /><path d=\"M21 19H7\" />","text-align-justify":"<path d=\"M3 5h18\" /><path d=\"M3 12h18\" /><path d=\"M3 19h18\" />","text-align-start":"<path d=\"M21 5H3\" /><path d=\"M15 12H3\" /><path d=\"M17 19H3\" />","text-cursor-input":"<path d=\"M12 20h-1a2 2 0 0 1-2-2 2 2 0 0 1-2 2H6\" /><path d=\"M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7\" /><path d=\"M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1\" /><path d=\"M6 4h1a2 2 0 0 1 2 2 2 2 0 0 1 2-2h1\" /><path d=\"M9 6v12\" />","text-cursor":"<path d=\"M17 22h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1\" /><path d=\"M7 22h1a4 4 0 0 0 4-4\" /><path d=\"M7 2h1a4 4 0 0 1 4 4\" />","text-initial":"<path d=\"M15 5h6\" /><path d=\"M15 12h6\" /><path d=\"M3 19h18\" /><path d=\"m3 12 3.553-7.724a.5.5 0 0 1 .894 0L11 12\" /><path d=\"M3.92 10h6.16\" />","text-quote":"<path d=\"M17 5H3\" /><path d=\"M21 12H8\" /><path d=\"M21 19H8\" /><path d=\"M3 12v7\" />","text-search":"<path d=\"M21 5H3\" /><path d=\"M10 12H3\" /><path d=\"M10 19H3\" /><circle cx=\"17\" cy=\"15\" r=\"3\" /><path d=\"m21 19-1.9-1.9\" />","text-select":"<path d=\"M14 21h1\" /><path d=\"M14 3h1\" /><path d=\"M19 3a2 2 0 0 1 2 2\" /><path d=\"M21 14v1\" /><path d=\"M21 19a2 2 0 0 1-2 2\" /><path d=\"M21 9v1\" /><path d=\"M3 14v1\" /><path d=\"M3 9v1\" /><path d=\"M5 21a2 2 0 0 1-2-2\" /><path d=\"M5 3a2 2 0 0 0-2 2\" /><path d=\"M7 12h10\" /><path d=\"M7 16h6\" /><path d=\"M7 8h8\" /><path d=\"M9 21h1\" /><path d=\"M9 3h1\" />","text-selection":"<path d=\"M14 21h1\" /><path d=\"M14 3h1\" /><path d=\"M19 3a2 2 0 0 1 2 2\" /><path d=\"M21 14v1\" /><path d=\"M21 19a2 2 0 0 1-2 2\" /><path d=\"M21 9v1\" /><path d=\"M3 14v1\" /><path d=\"M3 9v1\" /><path d=\"M5 21a2 2 0 0 1-2-2\" /><path d=\"M5 3a2 2 0 0 0-2 2\" /><path d=\"M7 12h10\" /><path d=\"M7 16h6\" /><path d=\"M7 8h8\" /><path d=\"M9 21h1\" /><path d=\"M9 3h1\" />","text-wrap":"<path d=\"m16 16-3 3 3 3\" /><path d=\"M3 12h14.5a1 1 0 0 1 0 7H13\" /><path d=\"M3 19h6\" /><path d=\"M3 5h18\" />","text":"<path d=\"M21 5H3\" /><path d=\"M15 12H3\" /><path d=\"M17 19H3\" />","theater":"<path d=\"M2 10s3-3 3-8\" /><path d=\"M22 10s-3-3-3-8\" /><path d=\"M10 2c0 4.4-3.6 8-8 8\" /><path d=\"M14 2c0 4.4 3.6 8 8 8\" /><path d=\"M2 10s2 2 2 5\" /><path d=\"M22 10s-2 2-2 5\" /><path d=\"M8 15h8\" /><path d=\"M2 22v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1\" /><path d=\"M14 22v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1\" />","thermometer-snowflake":"<path d=\"m10 20-1.25-2.5L6 18\" /><path d=\"M10 4 8.75 6.5 6 6\" /><path d=\"M10.585 15H10\" /><path d=\"M2 12h6.5L10 9\" /><path d=\"M20 14.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z\" /><path d=\"m4 10 1.5 2L4 14\" /><path d=\"m7 21 3-6-1.5-3\" /><path d=\"m7 3 3 6h2\" />","thermometer-sun":"<path d=\"M12 2v2\" /><path d=\"M12 8a4 4 0 0 0-1.645 7.647\" /><path d=\"M2 12h2\" /><path d=\"M20 14.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z\" /><path d=\"m4.93 4.93 1.41 1.41\" /><path d=\"m6.34 17.66-1.41 1.41\" />","thermometer":"<path d=\"M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z\" />","thumbs-down":"<path d=\"M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z\" /><path d=\"M17 14V2\" />","thumbs-up":"<path d=\"M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z\" /><path d=\"M7 10v12\" />","tic-tac-toe":"<path d=\"M12 2v20\" /><path d=\"m21 16-5 5\" /><path d=\"m21 21-5-5\" /><path d=\"M22 12H2\" /><path d=\"M8 3 3 8\" /><path d=\"M8 8 3 3\" /><circle cx=\"18.5\" cy=\"5.5\" r=\"2.5\" /><circle cx=\"5.5\" cy=\"18.5\" r=\"2.5\" />","ticket-check":"<path d=\"M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z\" /><path d=\"m9 12 2 2 4-4\" />","ticket-minus":"<path d=\"M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z\" /><path d=\"M9 12h6\" />","ticket-percent":"<path d=\"M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z\" /><path d=\"M9 9h.01\" /><path d=\"m15 9-6 6\" /><path d=\"M15 15h.01\" />","ticket-plus":"<path d=\"M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z\" /><path d=\"M9 12h6\" /><path d=\"M12 9v6\" />","ticket-slash":"<path d=\"M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z\" /><path d=\"m9.5 14.5 5-5\" />","ticket-x":"<path d=\"M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z\" /><path d=\"m9.5 14.5 5-5\" /><path d=\"m9.5 9.5 5 5\" />","ticket":"<path d=\"M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z\" /><path d=\"M13 5v2\" /><path d=\"M13 17v2\" /><path d=\"M13 11v2\" />","tickets-plane":"<path d=\"M10.5 17h1.227a2 2 0 0 0 1.345-.52L18 12\" /><path d=\"m12 13.5 3.794.506\" /><path d=\"m3.173 8.18 11-5a2 2 0 0 1 2.647.993L18.56 8\" /><path d=\"M6 10V8\" /><path d=\"M6 14v1\" /><path d=\"M6 19v2\" /><rect x=\"2\" y=\"8\" width=\"20\" height=\"13\" rx=\"2\" />","tickets":"<path d=\"m3.173 8.18 11-5a2 2 0 0 1 2.647.993L18.56 8\" /><path d=\"M6 10V8\" /><path d=\"M6 14v1\" /><path d=\"M6 19v2\" /><rect x=\"2\" y=\"8\" width=\"20\" height=\"13\" rx=\"2\" />","timeline":"<path d=\"M4 12h.01\" /><path d=\"M4 16h.01\" /><path d=\"M4 20h.01\" /><path d=\"M4 4h.01\" /><path d=\"M4 8h.01\" /><path d=\"M9.414 13.414a2 2 0 0 0 1.414.586H19a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-8.172a2 2 0 0 0-1.414.586L8 12z\" /><path d=\"M9.414 21.414a2 2 0 0 0 1.414.586H19a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-8.172a2 2 0 0 0-1.414.586L8 20z\" /><path d=\"M9.414 5.414A2 2 0 0 0 10.828 6H19a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-8.172a2 2 0 0 0-1.414.586L8 4z\" />","timer-off":"<path d=\"M10 2h4\" /><path d=\"M4.6 11a8 8 0 0 0 1.7 8.7 8 8 0 0 0 8.7 1.7\" /><path d=\"M7.4 7.4a8 8 0 0 1 10.3 1 8 8 0 0 1 .9 10.2\" /><path d=\"m2 2 20 20\" /><path d=\"M12 12v-2\" />","timer-reset":"<path d=\"M10 2h4\" /><path d=\"M12 14v-4\" /><path d=\"M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6\" /><path d=\"M9 17H4v5\" />","timer":"<line x1=\"10\" x2=\"14\" y1=\"2\" y2=\"2\" /><line x1=\"12\" x2=\"15\" y1=\"14\" y2=\"11\" /><circle cx=\"12\" cy=\"14\" r=\"8\" />","toggle-left":"<circle cx=\"9\" cy=\"12\" r=\"3\" /><rect width=\"20\" height=\"14\" x=\"2\" y=\"5\" rx=\"7\" />","toggle-right":"<circle cx=\"15\" cy=\"12\" r=\"3\" /><rect width=\"20\" height=\"14\" x=\"2\" y=\"5\" rx=\"7\" />","toilet":"<path d=\"M7 12h13a1 1 0 0 1 1 1 5 5 0 0 1-5 5h-.598a.5.5 0 0 0-.424.765l1.544 2.47a.5.5 0 0 1-.424.765H5.402a.5.5 0 0 1-.424-.765L7 18\" /><path d=\"M8 18a5 5 0 0 1-5-5V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8\" />","tool-case":"<path d=\"M10 15h4\" /><path d=\"m14.817 10.995-.971-1.45 1.034-1.232a2 2 0 0 0-2.025-3.238l-1.82.364L9.91 3.885a2 2 0 0 0-3.625.748L6.141 6.55l-1.725.426a2 2 0 0 0-.19 3.756l.657.27\" /><path d=\"m18.822 10.995 2.26-5.38a1 1 0 0 0-.557-1.318L16.954 2.9a1 1 0 0 0-1.281.533l-.924 2.122\" /><path d=\"M4 12.006A1 1 0 0 1 4.994 11H19a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z\" />","toolbox":"<path d=\"M16 12v4\" /><path d=\"M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2\" /><path d=\"M17 6a2 2 0 011.414.586l3 3A2 2 0 0122 11v8a2 2 0 01-2 2H4a2 2 0 01-2-2v-8a2 2 0 01.586-1.414l3-3A2 2 0 017 6z\" /><path d=\"M2 14h20\" /><path d=\"M8 12v4\" />","toothbrush-sparkles":"<path d=\"M10 3H8\" /><path d=\"M14.586 11.414 22 4\" /><path d=\"M15 11a8 8 0 01-.429.4\" /><path d=\"m2 22 7-7c1.857-1.857 3.714-1.99 5.571-3.6l-1.985-1.986A2 2 0 0114 6a2 2 0 012-2 2 2 0 013.262-1.552l2.152 2.138\" /><path d=\"M20 15v4\" /><path d=\"M22 17h-4\" /><path d=\"M4 5v4\" /><path d=\"M6 7H2\" /><path d=\"M9 2v2\" />","toothbrush":"<path d=\"M15 11c-2 2-4 2-6 4l-7 7\" /><path d=\"m22 4-7.414 7.414-2-2A2 2 0 0114 6c0-.512.196-1.024.586-1.414A2 2 0 0116 4a2 2 0 013.262-1.552l2.152 2.138\" />","tornado":"<path d=\"M21 4H3\" /><path d=\"M18 8H6\" /><path d=\"M19 12H9\" /><path d=\"M16 16h-6\" /><path d=\"M11 20H9\" />","torus":"<ellipse cx=\"12\" cy=\"11\" rx=\"3\" ry=\"2\" /><ellipse cx=\"12\" cy=\"12.5\" rx=\"10\" ry=\"8.5\" />","touchpad-off":"<path d=\"M12 20v-6\" /><path d=\"M19.656 14H22\" /><path d=\"M2 14h12\" /><path d=\"m2 2 20 20\" /><path d=\"M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2\" /><path d=\"M9.656 4H20a2 2 0 0 1 2 2v10.344\" />","touchpad":"<rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\" /><path d=\"M2 14h20\" /><path d=\"M12 20v-6\" />","towel-rack":"<path d=\"M22 7h-2\" /><path d=\"M6.5 3h11A2.5 2.5 0 0 1 20 5.5V20a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V5.5a1 1 0 0 0-5 0V17a1 1 0 0 0 1 1h4\" /><path d=\"M9 7H2\" />","tower-control":"<path d=\"M18.2 12.27 20 6H4l1.8 6.27a1 1 0 0 0 .95.73h10.5a1 1 0 0 0 .96-.73Z\" /><path d=\"M8 13v9\" /><path d=\"M16 22v-9\" /><path d=\"m9 6 1 7\" /><path d=\"m15 6-1 7\" /><path d=\"M12 6V2\" /><path d=\"M13 2h-2\" />","toy-brick":"<rect width=\"18\" height=\"12\" x=\"3\" y=\"8\" rx=\"1\" /><path d=\"M10 8V5c0-.6-.4-1-1-1H6a1 1 0 0 0-1 1v3\" /><path d=\"M19 8V5c0-.6-.4-1-1-1h-3a1 1 0 0 0-1 1v3\" />","tractor":"<path d=\"m10 11 11 .9a1 1 0 0 1 .8 1.1l-.665 4.158a1 1 0 0 1-.988.842H20\" /><path d=\"M16 18h-5\" /><path d=\"M18 5a1 1 0 0 0-1 1v5.573\" /><path d=\"M3 4h8.129a1 1 0 0 1 .99.863L13 11.246\" /><path d=\"M4 11V4\" /><path d=\"M7 15h.01\" /><path d=\"M8 10.1V4\" /><circle cx=\"18\" cy=\"18\" r=\"2\" /><circle cx=\"7\" cy=\"15\" r=\"5\" />","traffic-cone":"<path d=\"M16.05 10.966a5 2.5 0 0 1-8.1 0\" /><path d=\"m16.923 14.049 4.48 2.04a1 1 0 0 1 .001 1.831l-8.574 3.9a2 2 0 0 1-1.66 0l-8.574-3.91a1 1 0 0 1 0-1.83l4.484-2.04\" /><path d=\"M16.949 14.14a5 2.5 0 1 1-9.9 0L10.063 3.5a2 2 0 0 1 3.874 0z\" /><path d=\"M9.194 6.57a5 2.5 0 0 0 5.61 0\" />","trailer":"<path d=\"M10 11.341V10\" /><path d=\"M14 13v-3\" /><path d=\"M18 17V8a2 2 0 00-2-2H4a2 2 0 00-2 2v7a2 2 0 002 2h2\" /><path d=\"M22 15v1a1 1 0 01-1 1H10\" /><path d=\"M6 11.341V10\" /><circle cx=\"8\" cy=\"17\" r=\"2\" />","train-front-tunnel":"<path d=\"M2 22V12a10 10 0 1 1 20 0v10\" /><path d=\"M15 6.8v1.4a3 2.8 0 1 1-6 0V6.8\" /><path d=\"M10 15h.01\" /><path d=\"M14 15h.01\" /><path d=\"M10 19a4 4 0 0 1-4-4v-3a6 6 0 1 1 12 0v3a4 4 0 0 1-4 4Z\" /><path d=\"m9 19-2 3\" /><path d=\"m15 19 2 3\" />","train-front":"<path d=\"M8 3.1V7a4 4 0 0 0 8 0V3.1\" /><path d=\"m9 15-1-1\" /><path d=\"m15 15 1-1\" /><path d=\"M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z\" /><path d=\"m8 19-2 3\" /><path d=\"m16 19 2 3\" />","train-track":"<path d=\"M2 17 17 2\" /><path d=\"m2 14 8 8\" /><path d=\"m5 11 8 8\" /><path d=\"m8 8 8 8\" /><path d=\"m11 5 8 8\" /><path d=\"m14 2 8 8\" /><path d=\"M7 22 22 7\" />","train":"<rect width=\"16\" height=\"16\" x=\"4\" y=\"3\" rx=\"2\" /><path d=\"M4 11h16\" /><path d=\"M12 3v8\" /><path d=\"m8 19-2 3\" /><path d=\"m18 22-2-3\" /><path d=\"M8 15h.01\" /><path d=\"M16 15h.01\" />","tram-front":"<rect width=\"16\" height=\"16\" x=\"4\" y=\"3\" rx=\"2\" /><path d=\"M4 11h16\" /><path d=\"M12 3v8\" /><path d=\"m8 19-2 3\" /><path d=\"m18 22-2-3\" /><path d=\"M8 15h.01\" /><path d=\"M16 15h.01\" />","transgender":"<path d=\"M12 16v6\" /><path d=\"M14 20h-4\" /><path d=\"M18 2h4v4\" /><path d=\"m2 2 7.17 7.17\" /><path d=\"M2 5.355V2h3.357\" /><path d=\"m22 2-7.17 7.17\" /><path d=\"M8 5 5 8\" /><circle cx=\"12\" cy=\"12\" r=\"4\" />","trash-2":"<path d=\"M10 11v6\" /><path d=\"M14 11v6\" /><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\" /><path d=\"M3 6h18\" /><path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\" />","trash-off":"<path d=\"M10 11v6\" /><path d=\"M14 17v-3\" /><path d=\"M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-1.576.768\" /><path d=\"M19 6v7.344\" /><path d=\"m2 2 20 20\" /><path d=\"M21 6h-9.344\" /><path d=\"M3 6h3\" /><path d=\"M5 6v14a2 2 0 002 2h10a2 2 0 002-2v-1\" />","trash":"<path d=\"M10 11v6\" /><path d=\"M14 11v6\" /><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\" /><path d=\"M3 6h18\" /><path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\" />","tree-deciduous":"<path d=\"M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.03V6a3 3 0 1 1 6 0v.04a3.5 3.5 0 0 1 3.24 5.65A4 4 0 0 1 16 19Z\" /><path d=\"M12 19v3\" />","tree-palm":"<path d=\"M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4\" /><path d=\"M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3\" /><path d=\"M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35\" /><path d=\"M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14\" />","tree-pine":"<path d=\"m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z\" /><path d=\"M12 22v-3\" />","trees":"<path d=\"M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z\" /><path d=\"M7 16v6\" /><path d=\"M13 19v3\" /><path d=\"M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5\" />","trending-down":"<path d=\"M16 17h6v-6\" /><path d=\"m22 17-8.5-8.5-5 5L2 7\" />","trending-up-down":"<path d=\"M14.828 14.828 21 21\" /><path d=\"M21 16v5h-5\" /><path d=\"m21 3-9 9-4-4-6 6\" /><path d=\"M21 8V3h-5\" />","trending-up":"<path d=\"M16 7h6v6\" /><path d=\"m22 7-8.5 8.5-5-5L2 17\" />","triangle-alert":"<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\" /><path d=\"M12 9v4\" /><path d=\"M12 17h.01\" />","triangle-dashed":"<path d=\"M10.17 4.193a2 2 0 0 1 3.666.013\" /><path d=\"M14 21h2\" /><path d=\"m15.874 7.743 1 1.732\" /><path d=\"m18.849 12.952 1 1.732\" /><path d=\"M21.824 18.18a2 2 0 0 1-1.835 2.824\" /><path d=\"M4.024 21a2 2 0 0 1-1.839-2.839\" /><path d=\"m5.136 12.952-1 1.732\" /><path d=\"M8 21h2\" /><path d=\"m8.102 7.743-1 1.732\" />","triangle-right":"<path d=\"M22 18a2 2 0 0 1-2 2H3c-1.1 0-1.3-.6-.4-1.3L20.4 4.3c.9-.7 1.6-.4 1.6.7Z\" />","triangle":"<path d=\"M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z\" />","triangles-centerline-dashed-horizontal":"<path d=\"M10 12H8\" /><path d=\"M16 12h-2\" /><path d=\"M22 12h-2\" /><path d=\"M4 12H2\" /><path d=\"M7.298 20.288A1 1 0 008 22h8a1 1 0 00.703-1.712l-3.991-3.99a1 1 0 00-1.424-.001z\" /><path d=\"M7.298 3.712A1 1 0 018 2h8a1 1 0 01.703 1.712l-3.991 3.99a1 1 0 01-1.424.001z\" />","triangles-centerline-dashed-vertical":"<path d=\"M12 14v2\" /><path d=\"M12 20v2\" /><path d=\"M12 2v2\" /><path d=\"M12 8v2\" /><path d=\"M20.288 16.703A1 1 0 0022 16V8a1 1 0 00-1.712-.703l-3.99 3.991a1 1 0 00-.001 1.424z\" /><path d=\"M3.712 16.703A1 1 0 012 16V8a1 1 0 011.712-.703l3.99 3.991a1 1 0 01.001 1.424z\" />","trophy":"<path d=\"M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2\" /><path d=\"M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2\" /><path d=\"M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3\" /><path d=\"M4 22h16\" /><path d=\"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z\" /><path d=\"M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3\" />","truck-electric":"<path d=\"M14 19V7a2 2 0 0 0-2-2H9\" /><path d=\"M15 19H9\" /><path d=\"M19 19h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 9.38a1 1 0 0 0-.78-.38H14\" /><path d=\"M2 13v5a1 1 0 0 0 1 1h2\" /><path d=\"M4 3 2.15 5.15a.495.495 0 0 0 .35.86h2.15a.47.47 0 0 1 .35.86L3 9.02\" /><circle cx=\"17\" cy=\"19\" r=\"2\" /><circle cx=\"7\" cy=\"19\" r=\"2\" />","truck":"<path d=\"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2\" /><path d=\"M15 18H9\" /><path d=\"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14\" /><circle cx=\"17\" cy=\"18\" r=\"2\" /><circle cx=\"7\" cy=\"18\" r=\"2\" />","tube-lotion":"<path d=\"M15 18v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-3\" /><path d=\"M17 2a2 2 0 0 1 1.6 3.2A8 8 0 0 0 17 10v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-6a8 8 0 0 0-1.6-4.8A2 2 0 0 1 7 2z\" /><path d=\"M7 10a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0\" />","turkish-lira":"<path d=\"M15 4 5 9\" /><path d=\"m15 8.5-10 5\" /><path d=\"M18 12a9 9 0 0 1-9 9V3\" />","turntable":"<path d=\"M10 12.01h.01\" /><path d=\"M18 8v4a8 8 0 0 1-1.07 4\" /><circle cx=\"10\" cy=\"12\" r=\"4\" /><rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\" />","turtle":"<path d=\"m12 10 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a8 8 0 1 0-16 0v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3l2-4h4Z\" /><path d=\"M4.82 7.9 8 10\" /><path d=\"M15.18 7.9 12 10\" /><path d=\"M16.93 10H20a2 2 0 0 1 0 4H2\" />","tv-2":"<path d=\"M7 21h10\" /><rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\" />","tv-minimal-play":"<path d=\"M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z\" /><path d=\"M7 21h10\" /><rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\" />","tv-minimal":"<path d=\"M7 21h10\" /><rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\" />","tv":"<path d=\"m17 2-5 5-5-5\" /><rect width=\"20\" height=\"15\" x=\"2\" y=\"7\" rx=\"2\" />","type-outline":"<path d=\"M14 16.5a.5.5 0 0 0 .5.5h.5a2 2 0 0 1 0 4H9a2 2 0 0 1 0-4h.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V8a2 2 0 0 1-4 0V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-4 0v-.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5Z\" />","type":"<path d=\"M12 4v16\" /><path d=\"M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2\" /><path d=\"M9 20h6\" />","umbrella-off":"<path d=\"M12 13v7a2 2 0 0 0 4 0\" /><path d=\"M12 2v2\" /><path d=\"M18.656 13h2.336a1 1 0 0 0 .97-1.274 10.284 10.284 0 0 0-12.07-7.51\" /><path d=\"m2 2 20 20\" /><path d=\"M5.961 5.957a10.28 10.28 0 0 0-3.922 5.769A1 1 0 0 0 3 13h10\" />","umbrella":"<path d=\"M12 13v7a2 2 0 0 0 4 0\" /><path d=\"M12 2v2\" /><path d=\"M20.992 13a1 1 0 0 0 .97-1.274 10.284 10.284 0 0 0-19.923 0A1 1 0 0 0 3 13z\" />","underline":"<path d=\"M6 4v6a6 6 0 0 0 12 0V4\" /><line x1=\"4\" x2=\"20\" y1=\"20\" y2=\"20\" />","undo-2":"<path d=\"M9 14 4 9l5-5\" /><path d=\"M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11\" />","undo-dot":"<path d=\"M21 17a9 9 0 0 0-15-6.7L3 13\" /><path d=\"M3 7v6h6\" /><circle cx=\"12\" cy=\"17\" r=\"1\" />","undo":"<path d=\"M3 7v6h6\" /><path d=\"M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13\" />","unfold-horizontal":"<path d=\"M16 12h6\" /><path d=\"M8 12H2\" /><path d=\"M12 2v2\" /><path d=\"M12 8v2\" /><path d=\"M12 14v2\" /><path d=\"M12 20v2\" /><path d=\"m19 15 3-3-3-3\" /><path d=\"m5 9-3 3 3 3\" />","unfold-vertical":"<path d=\"M12 22v-6\" /><path d=\"M12 8V2\" /><path d=\"M4 12H2\" /><path d=\"M10 12H8\" /><path d=\"M16 12h-2\" /><path d=\"M22 12h-2\" /><path d=\"m15 19-3 3-3-3\" /><path d=\"m15 5-3-3-3 3\" />","ungroup":"<rect x=\"11\" y=\"14\" width=\"10\" height=\"7\" rx=\"2\" /><rect x=\"3\" y=\"3\" width=\"10\" height=\"7\" rx=\"2\" />","university":"<path d=\"M14 21v-3a2 2 0 0 0-4 0v3\" /><path d=\"M18 12h.01\" /><path d=\"M18 16h.01\" /><path d=\"M22 7a1 1 0 0 0-1-1h-2a2 2 0 0 1-1.143-.359L13.143 2.36a2 2 0 0 0-2.286-.001L6.143 5.64A2 2 0 0 1 5 6H3a1 1 0 0 0-1 1v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2z\" /><path d=\"M6 12h.01\" /><path d=\"M6 16h.01\" /><circle cx=\"12\" cy=\"10\" r=\"2\" />","unlink-2":"<path d=\"M15 7h2a5 5 0 0 1 0 10h-2m-6 0H7A5 5 0 0 1 7 7h2\" />","unlink":"<path d=\"m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71\" /><path d=\"m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71\" /><line x1=\"8\" x2=\"8\" y1=\"2\" y2=\"5\" /><line x1=\"2\" x2=\"5\" y1=\"8\" y2=\"8\" /><line x1=\"16\" x2=\"16\" y1=\"19\" y2=\"22\" /><line x1=\"19\" x2=\"22\" y1=\"16\" y2=\"16\" />","unlock-keyhole":"<circle cx=\"12\" cy=\"16\" r=\"1\" /><rect width=\"18\" height=\"12\" x=\"3\" y=\"10\" rx=\"2\" /><path d=\"M7 10V7a5 5 0 0 1 9.33-2.5\" />","unlock":"<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\" /><path d=\"M7 11V7a5 5 0 0 1 9.9-1\" />","unplug":"<path d=\"m19 5 3-3\" /><path d=\"m2 22 3-3\" /><path d=\"M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z\" /><path d=\"M7.5 13.5 10 11\" /><path d=\"M10.5 16.5 13 14\" /><path d=\"m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z\" />","upload-cloud":"<path d=\"M12 13v8\" /><path d=\"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242\" /><path d=\"m8 17 4-4 4 4\" />","upload":"<path d=\"M12 3v12\" /><path d=\"m17 8-5-5-5 5\" /><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" />","usb-c-port":"<path d=\"M6 12h12\" /><rect x=\"2\" y=\"8\" width=\"20\" height=\"8\" rx=\"4\" />","usb":"<circle cx=\"10\" cy=\"7\" r=\"1\" /><circle cx=\"4\" cy=\"20\" r=\"1\" /><path d=\"M4.7 19.3 19 5\" /><path d=\"m21 3-3 1 2 2Z\" /><path d=\"M9.26 7.68 5 12l2 5\" /><path d=\"m10 14 5 2 3.5-3.5\" /><path d=\"m18 12 1-1 1 1-1 1Z\" />","user-2":"<circle cx=\"12\" cy=\"8\" r=\"5\" /><path d=\"M20 21a8 8 0 0 0-16 0\" />","user-check-2":"<path d=\"M2 21a8 8 0 0 1 13.292-6\" /><circle cx=\"10\" cy=\"8\" r=\"5\" /><path d=\"m16 19 2 2 4-4\" />","user-check":"<path d=\"m16 11 2 2 4-4\" /><path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /><circle cx=\"9\" cy=\"7\" r=\"4\" />","user-circle-2":"<path d=\"M17.925 20.056a6 6 0 0 0-11.851.001\" /><circle cx=\"12\" cy=\"11\" r=\"4\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","user-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><circle cx=\"12\" cy=\"10\" r=\"3\" /><path d=\"M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662\" />","user-cog-2":"<path d=\"m14.305 19.53.923-.382\" /><path d=\"m15.228 16.852-.923-.383\" /><path d=\"m16.852 15.228-.383-.923\" /><path d=\"m16.852 20.772-.383.924\" /><path d=\"m19.148 15.228.383-.923\" /><path d=\"m19.53 21.696-.382-.924\" /><path d=\"M2 21a8 8 0 0 1 10.434-7.62\" /><path d=\"m20.772 16.852.924-.383\" /><path d=\"m20.772 19.148.924.383\" /><circle cx=\"10\" cy=\"8\" r=\"5\" /><circle cx=\"18\" cy=\"18\" r=\"3\" />","user-cog":"<path d=\"M10 15H6a4 4 0 0 0-4 4v2\" /><path d=\"m14.305 16.53.923-.382\" /><path d=\"m15.228 13.852-.923-.383\" /><path d=\"m16.852 12.228-.383-.923\" /><path d=\"m16.852 17.772-.383.924\" /><path d=\"m19.148 12.228.383-.923\" /><path d=\"m19.53 18.696-.382-.924\" /><path d=\"m20.772 13.852.924-.383\" /><path d=\"m20.772 16.148.924.383\" /><circle cx=\"18\" cy=\"15\" r=\"3\" /><circle cx=\"9\" cy=\"7\" r=\"4\" />","user-group":"<path d=\"M17 21v-1a2 2 0 00-2-2H9a2 2 0 00-2 2v1\" /><path d=\"M19 10h1a2 2 0 012 2v1\" /><path d=\"M5 10H4a2 2 0 00-2 2v1\" /><circle cx=\"12\" cy=\"11\" r=\"3\" /><circle cx=\"18\" cy=\"4\" r=\"2\" /><circle cx=\"6\" cy=\"4\" r=\"2\" />","user-key":"<path d=\"M20 11v6\" /><path d=\"M20 13h2\" /><path d=\"M3 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 2.072.578\" /><circle cx=\"10\" cy=\"7\" r=\"4\" /><circle cx=\"20\" cy=\"19\" r=\"2\" />","user-lock":"<path d=\"M19 16v-2a2 2 0 0 0-4 0v2\" /><path d=\"M9.5 15H7a4 4 0 0 0-4 4v2\" /><circle cx=\"10\" cy=\"7\" r=\"4\" /><rect x=\"13\" y=\"16\" width=\"8\" height=\"5\" rx=\".899\" />","user-minus-2":"<path d=\"M2 21a8 8 0 0 1 13.292-6\" /><circle cx=\"10\" cy=\"8\" r=\"5\" /><path d=\"M22 19h-6\" />","user-minus":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /><circle cx=\"9\" cy=\"7\" r=\"4\" /><line x1=\"22\" x2=\"16\" y1=\"11\" y2=\"11\" />","user-pen":"<path d=\"M11.5 15H7a4 4 0 0 0-4 4v2\" /><path d=\"M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\" /><circle cx=\"10\" cy=\"7\" r=\"4\" />","user-plus-2":"<path d=\"M2 21a8 8 0 0 1 13.292-6\" /><circle cx=\"10\" cy=\"8\" r=\"5\" /><path d=\"M19 16v6\" /><path d=\"M22 19h-6\" />","user-plus":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /><circle cx=\"9\" cy=\"7\" r=\"4\" /><line x1=\"19\" x2=\"19\" y1=\"8\" y2=\"14\" /><line x1=\"22\" x2=\"16\" y1=\"11\" y2=\"11\" />","user-round-arrow-left":"<path d=\"m19 16-3 3\" /><path d=\"M2 21a8 8 0 0 1 12.664-6.5\" /><path d=\"M22 19h-6l3 3\" /><circle cx=\"10\" cy=\"8\" r=\"5\" />","user-round-check":"<path d=\"M2 21a8 8 0 0 1 13.292-6\" /><circle cx=\"10\" cy=\"8\" r=\"5\" /><path d=\"m16 19 2 2 4-4\" />","user-round-cog":"<path d=\"m14.305 19.53.923-.382\" /><path d=\"m15.228 16.852-.923-.383\" /><path d=\"m16.852 15.228-.383-.923\" /><path d=\"m16.852 20.772-.383.924\" /><path d=\"m19.148 15.228.383-.923\" /><path d=\"m19.53 21.696-.382-.924\" /><path d=\"M2 21a8 8 0 0 1 10.434-7.62\" /><path d=\"m20.772 16.852.924-.383\" /><path d=\"m20.772 19.148.924.383\" /><circle cx=\"10\" cy=\"8\" r=\"5\" /><circle cx=\"18\" cy=\"18\" r=\"3\" />","user-round-group":"<path d=\"M17 21a5 5 0 00-10 0\" /><path d=\"M22 10.5a3.5 3.5 0 00-5.507-2.868\" /><path d=\"M7.507 7.632A3.5 3.5 0 002 10.5\" /><circle cx=\"12\" cy=\"13\" r=\"3\" /><circle cx=\"18.5\" cy=\"4.5\" r=\"2.5\" /><circle cx=\"5.5\" cy=\"4.5\" r=\"2.5\" />","user-round-key":"<path d=\"M19 11v6\" /><path d=\"M19 13h2\" /><path d=\"M2 21a8 8 0 0 1 12.868-6.349\" /><circle cx=\"10\" cy=\"8\" r=\"5\" /><circle cx=\"19\" cy=\"19\" r=\"2\" />","user-round-minus":"<path d=\"M2 21a8 8 0 0 1 13.292-6\" /><circle cx=\"10\" cy=\"8\" r=\"5\" /><path d=\"M22 19h-6\" />","user-round-pen":"<path d=\"M2 21a8 8 0 0 1 10.821-7.487\" /><path d=\"M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\" /><circle cx=\"10\" cy=\"8\" r=\"5\" />","user-round-plus":"<path d=\"M2 21a8 8 0 0 1 13.292-6\" /><circle cx=\"10\" cy=\"8\" r=\"5\" /><path d=\"M19 16v6\" /><path d=\"M22 19h-6\" />","user-round-search":"<circle cx=\"10\" cy=\"8\" r=\"5\" /><path d=\"M2 21a8 8 0 0 1 10.434-7.62\" /><circle cx=\"18\" cy=\"18\" r=\"3\" /><path d=\"m22 22-1.9-1.9\" />","user-round-x":"<path d=\"m16.5 16.5 5 5\" /><path d=\"M2 21a8 8 0 0 1 11.531-7.18\" /><path d=\"m21.5 16.5-5 5\" /><circle cx=\"10\" cy=\"8\" r=\"5\" />","user-round":"<circle cx=\"12\" cy=\"8\" r=\"5\" /><path d=\"M20 21a8 8 0 0 0-16 0\" />","user-search":"<circle cx=\"10\" cy=\"7\" r=\"4\" /><path d=\"M10.3 15H7a4 4 0 0 0-4 4v2\" /><circle cx=\"17\" cy=\"17\" r=\"3\" /><path d=\"m21 21-1.9-1.9\" />","user-shield":"<path d=\"M10 15H6a4 4 0 0 0-4 4v2\" /><path d=\"M22 17.5c0 2.499-1.75 3.749-3.83 4.474a.5.5 0 0 1-.335-.005c-2.085-.72-3.835-1.97-3.835-4.47V14a.5.5 0 0 1 .5-.499c1 0 2.25-.6 3.12-1.36a.6.6 0 0 1 .76-.001c.875.765 2.12 1.36 3.12 1.36a.5.5 0 0 1 .5.5z\" /><circle cx=\"9\" cy=\"7\" r=\"4\" />","user-square-2":"<path d=\"M18 21a6 6 0 0 0-12 0\" /><circle cx=\"12\" cy=\"11\" r=\"4\" /><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" />","user-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><circle cx=\"12\" cy=\"10\" r=\"3\" /><path d=\"M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2\" />","user-star":"<path d=\"M16.051 12.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.866l-1.156-1.153a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z\" /><path d=\"M8 15H7a4 4 0 0 0-4 4v2\" /><circle cx=\"10\" cy=\"7\" r=\"4\" />","user-x-2":"<path d=\"m16.5 16.5 5 5\" /><path d=\"M2 21a8 8 0 0 1 11.531-7.18\" /><path d=\"m21.5 16.5-5 5\" /><circle cx=\"10\" cy=\"8\" r=\"5\" />","user-x":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /><circle cx=\"9\" cy=\"7\" r=\"4\" /><line x1=\"17\" x2=\"22\" y1=\"8\" y2=\"13\" /><line x1=\"22\" x2=\"17\" y1=\"8\" y2=\"13\" />","user":"<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\" /><circle cx=\"12\" cy=\"7\" r=\"4\" />","users-2":"<path d=\"M18 21a8 8 0 0 0-16 0\" /><circle cx=\"10\" cy=\"8\" r=\"5\" /><path d=\"M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3\" />","users-round":"<path d=\"M18 21a8 8 0 0 0-16 0\" /><circle cx=\"10\" cy=\"8\" r=\"5\" /><path d=\"M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3\" />","users":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /><path d=\"M16 3.128a4 4 0 0 1 0 7.744\" /><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\" /><circle cx=\"9\" cy=\"7\" r=\"4\" />","utensils-crossed":"<path d=\"m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8\" /><path d=\"M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7\" /><path d=\"m2.1 21.8 6.4-6.3\" /><path d=\"m19 5-7 7\" />","utensils":"<path d=\"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2\" /><path d=\"M7 2v20\" /><path d=\"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7\" />","utility-pole":"<path d=\"M12 2v20\" /><path d=\"M2 5h20\" /><path d=\"M3 3v2\" /><path d=\"M7 3v2\" /><path d=\"M17 3v2\" /><path d=\"M21 3v2\" /><path d=\"m19 5-7 7-7-7\" />","van":"<path d=\"M13 6v5a1 1 0 0 0 1 1h6.102a1 1 0 0 1 .712.298l.898.91a1 1 0 0 1 .288.702V17a1 1 0 0 1-1 1h-3\" /><path d=\"M5 18H3a1 1 0 0 1-1-1V8a2 2 0 0 1 2-2h12c1.1 0 2.1.8 2.4 1.8l1.176 4.2\" /><path d=\"M9 18h5\" /><circle cx=\"16\" cy=\"18\" r=\"2\" /><circle cx=\"7\" cy=\"18\" r=\"2\" />","variable":"<path d=\"M8 21s-4-3-4-9 4-9 4-9\" /><path d=\"M16 3s4 3 4 9-4 9-4 9\" /><line x1=\"15\" x2=\"9\" y1=\"9\" y2=\"15\" /><line x1=\"9\" x2=\"15\" y1=\"9\" y2=\"15\" />","vault":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\" /><path d=\"m7.9 7.9 2.7 2.7\" /><circle cx=\"16.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\" /><path d=\"m13.4 10.6 2.7-2.7\" /><circle cx=\"7.5\" cy=\"16.5\" r=\".5\" fill=\"currentColor\" /><path d=\"m7.9 16.1 2.7-2.7\" /><circle cx=\"16.5\" cy=\"16.5\" r=\".5\" fill=\"currentColor\" /><path d=\"m13.4 13.4 2.7 2.7\" /><circle cx=\"12\" cy=\"12\" r=\"2\" />","vector-polygon":"<path d=\"m12.828 4.813 5.344 2.375\" /><path d=\"m15.769 18.153 3.461-8.306\" /><path d=\"m5.687 14.074 7.625 4.852\" /><path d=\"M9.772 5.579 5.228 11.42\" /><circle cx=\"11\" cy=\"4\" r=\"2\" /><circle cx=\"15\" cy=\"20\" r=\"2\" /><circle cx=\"20\" cy=\"8\" r=\"2\" /><circle cx=\"4\" cy=\"13\" r=\"2\" />","vector-square":"<path d=\"M17.055 4.533a24 24 0 00-10.11 0\" /><path d=\"M19.467 17.055a24 24 0 000-10.11\" /><path d=\"M4.533 6.945a24 24 0 000 10.11\" /><path d=\"M6.945 19.467a24 24 0 0010.11 0\" /><circle cx=\"19\" cy=\"19\" r=\"2\" /><circle cx=\"19\" cy=\"5\" r=\"2\" /><circle cx=\"5\" cy=\"19\" r=\"2\" /><circle cx=\"5\" cy=\"5\" r=\"2\" />","vegan":"<path d=\"M16 8q6 0 6-6-6 0-6 6\" /><path d=\"M17.41 3.59a10 10 0 1 0 3 3\" /><path d=\"M2 2a26.6 26.6 0 0 1 10 20c.9-6.82 1.5-9.5 4-14\" />","venetian-mask":"<path d=\"M18 11c-1.5 0-2.5.5-3 2\" /><path d=\"M4 6a2 2 0 0 0-2 2v4a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V8a2 2 0 0 0-2-2h-3a8 8 0 0 0-5 2 8 8 0 0 0-5-2z\" /><path d=\"M6 11c1.5 0 2.5.5 3 2\" />","venus-and-mars":"<path d=\"M10 20h4\" /><path d=\"M12 16v6\" /><path d=\"M17 2h4v4\" /><path d=\"m21 2-5.46 5.46\" /><circle cx=\"12\" cy=\"11\" r=\"5\" />","venus":"<path d=\"M12 15v7\" /><path d=\"M9 19h6\" /><circle cx=\"12\" cy=\"9\" r=\"6\" />","verified":"<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /><path d=\"m16 9-5.5 5.5L8 12\" />","vibrate-off":"<path d=\"m2 8 2 2-2 2 2 2-2 2\" /><path d=\"m22 8-2 2 2 2-2 2 2 2\" /><path d=\"M8 8v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2\" /><path d=\"M16 10.34V6c0-.55-.45-1-1-1h-4.34\" /><line x1=\"2\" x2=\"22\" y1=\"2\" y2=\"22\" />","vibrate":"<path d=\"m2 8 2 2-2 2 2 2-2 2\" /><path d=\"m22 8-2 2 2 2-2 2 2 2\" /><rect width=\"8\" height=\"14\" x=\"8\" y=\"5\" rx=\"1\" />","video-off":"<path d=\"M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196\" /><path d=\"M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2\" /><path d=\"m2 2 20 20\" />","video":"<path d=\"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5\" /><rect x=\"2\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\" />","videotape":"<rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\" /><path d=\"M2 8h20\" /><circle cx=\"8\" cy=\"14\" r=\"2\" /><path d=\"M8 12h8\" /><circle cx=\"16\" cy=\"14\" r=\"2\" />","view":"<path d=\"M21 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2\" /><path d=\"M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2\" /><circle cx=\"12\" cy=\"12\" r=\"1\" /><path d=\"M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0\" />","virus-off":"<path d=\"M10.01 10h.01\" /><path d=\"M12 14.991h.01\" /><path d=\"M12 22v-3\" /><path d=\"M12 2v3\" /><path d=\"M13 22h-2\" /><path d=\"M13 2h-2\" /><path d=\"m16.5 19.794-1-1.733\" /><path d=\"m16.5 4.205-1 1.732\" /><path d=\"M18.891 13.235a7 7 0 00-8.126-8.126\" /><path d=\"m19.794 7.5-1.732 1\" /><path d=\"M2 12h3\" /><path d=\"M2 13v-2\" /><path d=\"m2 2 20 20\" /><path d=\"M22 12h-3\" /><path d=\"M22 13v-2\" /><path d=\"m4.206 16.5 1.732-1\" /><path d=\"m4.206 7.5 1.732 1\" /><path d=\"M7.05 7.05a7 7 0 009.9 9.9\" /><path d=\"m7.5 19.794 1-1.733\" /><path d=\"M9 12h.01\" />","virus":"<path d=\"M12 14.991h.01\" /><path d=\"M12 22v-3\" /><path d=\"M12 2v3\" /><path d=\"M13 22h-2\" /><path d=\"M13 2h-2\" /><path d=\"M13.99 10H14\" /><path d=\"m16.5 19.794-1-1.733\" /><path d=\"m16.5 4.205-1 1.732\" /><path d=\"m19.794 16.5-1.732-1\" /><path d=\"m19.794 7.5-1.732 1\" /><path d=\"M2 12h3\" /><path d=\"M2 13v-2\" /><path d=\"M22 12h-3\" /><path d=\"M22 13v-2\" /><path d=\"m4.206 16.5 1.732-1\" /><path d=\"m4.206 7.5 1.732 1\" /><path d=\"m7.5 19.794 1-1.733\" /><path d=\"m7.5 4.205 1 1.732\" /><path d=\"M9 12h.01\" /><circle cx=\"12\" cy=\"12\" r=\"7\" />","voicemail":"<circle cx=\"6\" cy=\"12\" r=\"4\" /><circle cx=\"18\" cy=\"12\" r=\"4\" /><line x1=\"6\" x2=\"18\" y1=\"16\" y2=\"16\" />","volleyball":"<path d=\"M11 7a16 16 20 0 1 10.98 4.362\" /><path d=\"M12 12a13 13 0 0 1-8.66 5\" /><path d=\"M16.83 13.634a16 16 0 0 1-9.267 7.328\" /><path d=\"M20.66 17A13 13 0 0 0 12 12a13 13 0 0 1 0-10\" /><path d=\"M8.17 15.366a16 16 0 0 1-1.713-11.69\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","volume-1":"<path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z\" /><path d=\"M16 9a5 5 0 0 1 0 6\" />","volume-2":"<path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z\" /><path d=\"M16 9a5 5 0 0 1 0 6\" /><path d=\"M19.364 18.364a9 9 0 0 0 0-12.728\" />","volume-off":"<path d=\"M16 9a5 5 0 0 1 .95 2.293\" /><path d=\"M19.364 5.636a9 9 0 0 1 1.889 9.96\" /><path d=\"m2 2 20 20\" /><path d=\"m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11\" /><path d=\"M9.828 4.172A.686.686 0 0 1 11 4.657v.686\" />","volume-x":"<path d=\"M11 4.702a.7.7 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.7.7 0 0 0 11 19.298z\" /><path d=\"m16.5 14.5 5-5\" /><path d=\"m16.5 9.5 5 5\" />","volume":"<path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z\" />","vote":"<path d=\"m9 12 2 2 4-4\" /><path d=\"M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z\" /><path d=\"M22 19H2\" />","wallet-2":"<path d=\"M17 14h.01\" /><path d=\"M7 7h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14\" />","wallet-cards":"<path d=\"M3 11h3.75a2 2 0 0 1 1.6.8l.45.6a4 4 0 0 0 6.4 0l.45-.6a2 2 0 0 1 1.6-.8H21\" /><path d=\"M3 7h18\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","wallet-minimal":"<path d=\"M17 14h.01\" /><path d=\"M7 7h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14\" />","wallet":"<path d=\"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1\" /><path d=\"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4\" />","wallpaper":"<path d=\"M12 17v4\" /><path d=\"M8 21h8\" /><path d=\"m9 17 6.1-6.1a2 2 0 0 1 2.81.01L22 15\" /><circle cx=\"8\" cy=\"9\" r=\"2\" /><rect x=\"2\" y=\"3\" width=\"20\" height=\"14\" rx=\"2\" />","wand-2":"<path d=\"m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72\" /><path d=\"m14 7 3 3\" /><path d=\"M5 6v4\" /><path d=\"M19 14v4\" /><path d=\"M10 2v2\" /><path d=\"M7 8H3\" /><path d=\"M21 16h-4\" /><path d=\"M11 3H9\" />","wand-sparkles":"<path d=\"m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72\" /><path d=\"m14 7 3 3\" /><path d=\"M5 6v4\" /><path d=\"M19 14v4\" /><path d=\"M10 2v2\" /><path d=\"M7 8H3\" /><path d=\"M21 16h-4\" /><path d=\"M11 3H9\" />","wand":"<path d=\"M15 4V2\" /><path d=\"M15 16v-2\" /><path d=\"M8 9h2\" /><path d=\"M20 9h2\" /><path d=\"M17.8 11.8 19 13\" /><path d=\"M15 9h.01\" /><path d=\"M17.8 6.2 19 5\" /><path d=\"m3 21 9-9\" /><path d=\"M12.2 6.2 11 5\" />","warehouse":"<path d=\"M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11\" /><path d=\"M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z\" /><path d=\"M6 13h12\" /><path d=\"M6 17h12\" />","washing-machine":"<path d=\"M3 6h3\" /><path d=\"M17 6h.01\" /><rect width=\"18\" height=\"20\" x=\"3\" y=\"2\" rx=\"2\" /><circle cx=\"12\" cy=\"13\" r=\"5\" /><path d=\"M12 18a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5\" />","watch":"<path d=\"M12 10v2.2l1.6 1\" /><path d=\"m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05\" /><path d=\"m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05\" /><circle cx=\"12\" cy=\"12\" r=\"6\" />","waves-arrow-down":"<path d=\"M12 10L12 2\" /><path d=\"M16 6L12 10L8 6\" /><path d=\"M2 15C2.6 15.5 3.2 16 4.5 16C7 16 7 14 9.5 14C12.1 14 11.9 16 14.5 16C17 16 17 14 19.5 14C20.8 14 21.4 14.5 22 15\" /><path d=\"M2 21C2.6 21.5 3.2 22 4.5 22C7 22 7 20 9.5 20C12.1 20 11.9 22 14.5 22C17 22 17 20 19.5 20C20.8 20 21.4 20.5 22 21\" />","waves-arrow-up":"<path d=\"M12 2v8\" /><path d=\"M2 15c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1\" /><path d=\"M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1\" /><path d=\"m8 6 4-4 4 4\" />","waves-horizontal":"<path d=\"M2 12q2.5 2 5 0t5 0 5 0 5 0\" /><path d=\"M2 19q2.5 2 5 0t5 0 5 0 5 0\" /><path d=\"M2 5q2.5 2 5 0t5 0 5 0 5 0\" />","waves-ladder":"<path d=\"M19 5a2 2 0 0 0-2 2v11\" /><path d=\"M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1\" /><path d=\"M7 13h10\" /><path d=\"M7 9h10\" /><path d=\"M9 5a2 2 0 0 0-2 2v11\" />","waves-vertical":"<path d=\"M12 2q2 2.5 0 5t0 5 0 5 0 5\" /><path d=\"M19 2q2 2.5 0 5t0 5 0 5 0 5\" /><path d=\"M5 2q2 2.5 0 5t0 5 0 5 0 5\" />","waves":"<path d=\"M2 12q2.5 2 5 0t5 0 5 0 5 0\" /><path d=\"M2 19q2.5 2 5 0t5 0 5 0 5 0\" /><path d=\"M2 5q2.5 2 5 0t5 0 5 0 5 0\" />","waypoints":"<path d=\"m10.586 5.414-5.172 5.172\" /><path d=\"m18.586 13.414-5.172 5.172\" /><path d=\"M6 12h12\" /><circle cx=\"12\" cy=\"20\" r=\"2\" /><circle cx=\"12\" cy=\"4\" r=\"2\" /><circle cx=\"20\" cy=\"12\" r=\"2\" /><circle cx=\"4\" cy=\"12\" r=\"2\" />","webcam-off":"<path d=\"M12 22v-4\" /><path d=\"M12.754 7.096a3 3 0 0 1 2.15 2.15\" /><path d=\"M12.863 12.873a3 3 0 0 1-3.736-3.735\" /><path d=\"M16.566 16.57A8 8 0 0 1 5.43 5.433\" /><path d=\"m2 2 20 20\" /><path d=\"M7 22h10\" /><path d=\"M8.478 2.817a8 8 0 0 1 10.705 10.705\" />","webcam":"<circle cx=\"12\" cy=\"10\" r=\"8\" /><circle cx=\"12\" cy=\"10\" r=\"3\" /><path d=\"M7 22h10\" /><path d=\"M12 22v-4\" />","webhook-off":"<path d=\"M17 17h-5c-1.09-.02-1.94.92-2.5 1.9A3 3 0 1 1 2.57 15\" /><path d=\"M9 3.4a4 4 0 0 1 6.52.66\" /><path d=\"m6 17 3.1-5.8a2.5 2.5 0 0 0 .057-2.05\" /><path d=\"M20.3 20.3a4 4 0 0 1-2.3.7\" /><path d=\"M18.6 13a4 4 0 0 1 3.357 3.414\" /><path d=\"m12 6 .6 1\" /><path d=\"m2 2 20 20\" />","webhook":"<path d=\"M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2\" /><path d=\"m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06\" /><path d=\"m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8\" />","weight-tilde":"<path d=\"M6.5 8a2 2 0 0 0-1.906 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8z\" /><path d=\"M7.999 15a2.5 2.5 0 0 1 4 0 2.5 2.5 0 0 0 4 0\" /><circle cx=\"12\" cy=\"5\" r=\"3\" />","weight":"<circle cx=\"12\" cy=\"5\" r=\"3\" /><path d=\"M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z\" />","wheat-off":"<path d=\"m2 22 10-10\" /><path d=\"m16 8-1.17 1.17\" /><path d=\"M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z\" /><path d=\"m8 8-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97\" /><path d=\"M10.91 5.26c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62\" /><path d=\"M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z\" /><path d=\"M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z\" /><path d=\"m16 16-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.49 3.49 0 0 1 1.97-.98\" /><path d=\"M18.74 13.09c.26-.15.51-.34.73-.56L21 11l-1.53-1.53a3.5 3.5 0 0 0-4.62-.28\" /><line x1=\"2\" x2=\"22\" y1=\"2\" y2=\"22\" />","wheat":"<path d=\"M2 22 16 8\" /><path d=\"M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z\" /><path d=\"M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z\" /><path d=\"M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z\" /><path d=\"M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z\" /><path d=\"M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z\" /><path d=\"M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z\" /><path d=\"M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z\" />","whistle":"<path d=\"M10 6v4\" /><path d=\"M21 6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-5.675A7 7 0 1 1 9 6z\" />","whole-word":"<circle cx=\"7\" cy=\"12\" r=\"3\" /><path d=\"M10 9v6\" /><circle cx=\"17\" cy=\"12\" r=\"3\" /><path d=\"M14 7v8\" /><path d=\"M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1\" />","wifi-cog":"<path d=\"m14.305 19.53.923-.382\" /><path d=\"m15.228 16.852-.923-.383\" /><path d=\"m16.852 15.228-.383-.923\" /><path d=\"m16.852 20.772-.383.924\" /><path d=\"m19.148 15.228.383-.923\" /><path d=\"m19.53 21.696-.382-.924\" /><path d=\"M2 7.82a15 15 0 0 1 20 0\" /><path d=\"m20.772 16.852.924-.383\" /><path d=\"m20.772 19.148.924.383\" /><path d=\"M5 11.858a10 10 0 0 1 11.5-1.785\" /><path d=\"M8.5 15.429a5 5 0 0 1 2.413-1.31\" /><circle cx=\"18\" cy=\"18\" r=\"3\" />","wifi-high":"<path d=\"M12 20h.01\" /><path d=\"M5 12.859a10 10 0 0 1 14 0\" /><path d=\"M8.5 16.429a5 5 0 0 1 7 0\" />","wifi-low":"<path d=\"M12 20h.01\" /><path d=\"M8.5 16.429a5 5 0 0 1 7 0\" />","wifi-off":"<path d=\"M12 20h.01\" /><path d=\"M8.5 16.429a5 5 0 0 1 7 0\" /><path d=\"M5 12.859a10 10 0 0 1 5.17-2.69\" /><path d=\"M19 12.859a10 10 0 0 0-2.007-1.523\" /><path d=\"M2 8.82a15 15 0 0 1 4.177-2.643\" /><path d=\"M22 8.82a15 15 0 0 0-11.288-3.764\" /><path d=\"m2 2 20 20\" />","wifi-pen":"<path d=\"M2 8.82a15 15 0 0 1 20 0\" /><path d=\"M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\" /><path d=\"M5 12.859a10 10 0 0 1 10.5-2.222\" /><path d=\"M8.5 16.429a5 5 0 0 1 3-1.406\" />","wifi-sync":"<path d=\"M11.965 10.105v4L13.5 12.5a5 5 0 0 1 8 1.5\" /><path d=\"M11.965 14.105h4\" /><path d=\"M17.965 18.105h4L20.43 19.71a5 5 0 0 1-8-1.5\" /><path d=\"M2 8.82a15 15 0 0 1 20 0\" /><path d=\"M21.965 22.105v-4\" /><path d=\"M5 12.86a10 10 0 0 1 3-2.032\" /><path d=\"M8.5 16.429h.01\" />","wifi-zero":"<path d=\"M12 20h.01\" />","wifi":"<path d=\"M12 20h.01\" /><path d=\"M2 8.82a15 15 0 0 1 20 0\" /><path d=\"M5 12.859a10 10 0 0 1 14 0\" /><path d=\"M8.5 16.429a5 5 0 0 1 7 0\" />","wind-arrow-down":"<path d=\"M10 2v8\" /><path d=\"M12.8 21.6A2 2 0 1 0 14 18H2\" /><path d=\"M17.5 10a2.5 2.5 0 1 1 2 4H2\" /><path d=\"m6 6 4 4 4-4\" />","wind":"<path d=\"M12.8 19.6A2 2 0 1 0 14 16H2\" /><path d=\"M17.5 8a2.5 2.5 0 1 1 2 4H2\" /><path d=\"M9.8 4.4A2 2 0 1 1 11 8H2\" />","wine-off":"<path d=\"M8 22h8\" /><path d=\"M7 10h3m7 0h-1.343\" /><path d=\"M12 15v7\" /><path d=\"M7.307 7.307A12.33 12.33 0 0 0 7 10a5 5 0 0 0 7.391 4.391M8.638 2.981C8.75 2.668 8.872 2.34 9 2h6c1.5 4 2 6 2 8 0 .407-.05.809-.145 1.198\" /><line x1=\"2\" x2=\"22\" y1=\"2\" y2=\"22\" />","wine":"<path d=\"M8 22h8\" /><path d=\"M7 10h10\" /><path d=\"M12 15v7\" /><path d=\"M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z\" />","workflow":"<rect width=\"8\" height=\"8\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M7 11v4a2 2 0 0 0 2 2h4\" /><rect width=\"8\" height=\"8\" x=\"13\" y=\"13\" rx=\"2\" />","worm":"<path d=\"m19 12-1.5 3\" /><path d=\"M19.63 18.81 22 20\" /><path d=\"M6.47 8.23a1.68 1.68 0 0 1 2.44 1.93l-.64 2.08a6.76 6.76 0 0 0 10.16 7.67l.42-.27a1 1 0 1 0-2.73-4.21l-.42.27a1.76 1.76 0 0 1-2.63-1.99l.64-2.08A6.66 6.66 0 0 0 3.94 3.9l-.7.4a1 1 0 1 0 2.55 4.34z\" />","wrap-text":"<path d=\"m16 16-3 3 3 3\" /><path d=\"M3 12h14.5a1 1 0 0 1 0 7H13\" /><path d=\"M3 19h6\" /><path d=\"M3 5h18\" />","wrench-off":"<path d=\"M10.747 5.093a6 6 0 0 1 6.841-2.882c.438.12.54.662.219.984L14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-2.882 6.842\" /><path d=\"m13.5 13.5-7.88 7.88a1 1 0 0 1-2.999-3l7.88-7.88\" /><path d=\"m2 2 20 20\" />","wrench":"<path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z\" />","x-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m15 9-6 6\" /><path d=\"m9 9 6 6\" />","x-line-top":"<path d=\"M18 4H6\" /><path d=\"M18 8 6 20\" /><path d=\"m6 8 12 12\" />","x-octagon":"<path d=\"m15 9-6 6\" /><path d=\"M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z\" /><path d=\"m9 9 6 6\" />","x-square":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" /><path d=\"m15 9-6 6\" /><path d=\"m9 9 6 6\" />","x":"<path d=\"M18 6 6 18\" /><path d=\"m6 6 12 12\" />","zap-off":"<path d=\"M10.768 5.111 13.44 2.44a1.5 1.5 0 012.474 1.561l-1.633 4.625\" /><path d=\"m18.889 13.232.672-.672A1.5 1.5 0 0018.5 10h-2.844\" /><path d=\"m2 2 20 20\" /><path d=\"m7.94 7.94-3.5 3.499A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l5.5-5.5\" />","zap":"<path d=\"M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z\" />","zodiac-aquarius":"<path d=\"m2 10 2.456-3.684a.7.7 0 0 1 1.106-.013l2.39 3.413a.7.7 0 0 0 1.096-.001l2.402-3.432a.7.7 0 0 1 1.098 0l2.402 3.432a.7.7 0 0 0 1.098 0l2.389-3.413a.7.7 0 0 1 1.106.013L22 10\" /><path d=\"m2 18.002 2.456-3.684a.7.7 0 0 1 1.106-.013l2.39 3.413a.7.7 0 0 0 1.097 0l2.402-3.432a.7.7 0 0 1 1.098 0l2.402 3.432a.7.7 0 0 0 1.098 0l2.389-3.413a.7.7 0 0 1 1.106.013L22 18.002\" />","zodiac-aries":"<path d=\"M12 7.5a4.5 4.5 0 1 1 5 4.5\" /><path d=\"M7 12a4.5 4.5 0 1 1 5-4.5V21\" />","zodiac-cancer":"<path d=\"M21 14.5A9 6.5 0 0 1 5.5 19\" /><path d=\"M3 9.5A9 6.5 0 0 1 18.5 5\" /><circle cx=\"17.5\" cy=\"14.5\" r=\"3.5\" /><circle cx=\"6.5\" cy=\"9.5\" r=\"3.5\" />","zodiac-capricorn":"<path d=\"M11 21a3 3 0 0 0 3-3V6.5a1 1 0 0 0-7 0\" /><path d=\"M7 19V6a3 3 0 0 0-3-3h0\" /><circle cx=\"17\" cy=\"17\" r=\"3\" />","zodiac-gemini":"<path d=\"M16 4.525v14.948\" /><path d=\"M20 3A17 17 0 0 1 4 3\" /><path d=\"M4 21a17 17 0 0 1 16 0\" /><path d=\"M8 4.525v14.948\" />","zodiac-leo":"<path d=\"M10 16c0-4-3-4.5-3-8a5 5 0 0 1 10 0c0 3.466-3 6.196-3 10a3 3 0 0 0 6 0\" /><circle cx=\"7\" cy=\"16\" r=\"3\" />","zodiac-libra":"<path d=\"M3 16h6.857c.162-.012.19-.323.038-.38a6 6 0 1 1 4.212 0c-.153.057-.125.368.038.38H21\" /><path d=\"M3 20h18\" />","zodiac-ophiuchus":"<path d=\"M3 10A6.06 6.06 0 0 1 12 10 A6.06 6.06 0 0 0 21 10\" /><path d=\"M6 3v12a6 6 0 0 0 12 0V3\" />","zodiac-pisces":"<path d=\"M19 21a15 15 0 0 1 0-18\" /><path d=\"M20 12H4\" /><path d=\"M5 3a15 15 0 0 1 0 18\" />","zodiac-sagittarius":"<path d=\"M15 3h6v6\" /><path d=\"M21 3 3 21\" /><path d=\"m9 9 6 6\" />","zodiac-scorpio":"<path d=\"M10 19V5.5a1 1 0 0 1 5 0V17a2 2 0 0 0 2 2h5l-3-3\" /><path d=\"m22 19-3 3\" /><path d=\"M5 19V5.5a1 1 0 0 1 5 0\" /><path d=\"M5 5.5A2.5 2.5 0 0 0 2.5 3\" />","zodiac-taurus":"<circle cx=\"12\" cy=\"15\" r=\"6\" /><path d=\"M18 3A6 6 0 0 1 6 3\" />","zodiac-virgo":"<path d=\"M11 5.5a1 1 0 0 1 5 0V16a5 5 0 0 0 5 5\" /><path d=\"M16 11.5a1 1 0 0 1 5 0V16a5 5 0 0 1-5 5\" /><path d=\"M6 19V6a3 3 0 0 0-3-3h0\" /><path d=\"M6 5.5a1 1 0 0 1 5 0V19\" />","zoom-in":"<circle cx=\"11\" cy=\"11\" r=\"8\" /><line x1=\"21\" x2=\"16.65\" y1=\"21\" y2=\"16.65\" /><line x1=\"11\" x2=\"11\" y1=\"8\" y2=\"14\" /><line x1=\"8\" x2=\"14\" y1=\"11\" y2=\"11\" />","zoom-out":"<circle cx=\"11\" cy=\"11\" r=\"8\" /><line x1=\"21\" x2=\"16.65\" y1=\"21\" y2=\"16.65\" /><line x1=\"8\" x2=\"14\" y1=\"11\" y2=\"11\" />"};
  /* The query syntax behind QueryInput, GitHub-style: `name:a,b` qualifiers next to free text. Commas mean OR, the same
     qualifier twice must match both, a leading `-` excludes, double quotes protect spaces and commas, and unknown
     qualifiers are free text. Ported from hyprsh/kestrel's filter/query.ts. Pure functions, no DOM and no React, so
     test/query.test.mjs runs this file in a vm. The bundle puts them on the registry (window.Hyprsh.parseQuery …) and
     the package exports them by name (scripts/package.mjs lists them in QUERY_EXPORTS). */

  /* Splits on spaces outside double quotes: [{ raw, start, end }]. */
  function queryTokens(input) {
    var out = [], start = -1, quoted = false;
    for (var i = 0; i <= input.length; i++) {
      var c = input.charAt(i);
      if (i === input.length || (!quoted && /\s/.test(c))) {
        if (start >= 0) out.push({ raw: input.slice(start, i), start: start, end: i });
        start = -1;
        continue;
      }
      if (start < 0) start = i;
      if (c === '"') quoted = !quoted;
    }
    return out;
  }

  /* Splits a qualifier's value on commas outside quotes, and drops the quotes. */
  function querySplit(raw) {
    var out = [], cur = '', quoted = false;
    for (var i = 0; i < raw.length; i++) {
      var c = raw.charAt(i);
      if (c === '"') quoted = !quoted;
      else if (c === ',' && !quoted) { out.push(cur); cur = ''; }
      else cur += c;
    }
    out.push(cur);
    return out.map(function (v) { return v.trim(); }).filter(Boolean);
  }

  function queryQuoted(v) { return /[\s,]/.test(v) ? '"' + v.replace(/"/g, '') + '"' : v; }
  function queryEither(v) { return v.length < 2 ? v.join('') : v.slice(0, -1).join(', ') + ' or ' + v[v.length - 1]; }
  function queryFind(qualifiers, name) {
    for (var i = 0; i < qualifiers.length; i++) if (qualifiers[i].name === name) return qualifiers[i];
    return null;
  }

  /* The names of the qualifiers `no:` can name. */
  function queryNones(qualifiers) { return qualifiers.filter(function (q) { return q.none; }).map(function (q) { return q.name; }); }

  /* What a token is: a term of a known qualifier, or free text. `no:` is always a term, so it is flagged where nothing can
     be empty, unless the app has a qualifier of that name itself. */
  function queryTermOf(t, qualifiers) {
    var m = /^(-?)([a-z_]+):(.*)$/i.exec(t.raw);
    if (!m) return null;
    var name = m[2].toLowerCase();
    if (!queryFind(qualifiers, name) && name !== 'no') return null;
    return { name: name, values: querySplit(m[3]), excluded: m[1] === '-', span: [t.start, t.end] };
  }

  function parseQuery(input, qualifiers) {
    var terms = [], text = [], problems = [];
    queryTokens(input).forEach(function (t) {
      var term = queryTermOf(t, qualifiers);
      if (!term) { text.push(t.raw); return; }
      var own = queryFind(qualifiers, term.name);
      var q = own || { name: 'no', values: queryNones(qualifiers) };
      if (term.excluded && !q.excludable) {
        problems.push({ message: q.name + ': cannot be excluded', span: term.span });
        return;
      }
      if (!own && !q.values.length) {
        if (term.values.length) problems.push({ message: 'no: no qualifier here can be empty', span: term.span });
        return;
      }
      var known = q.values;
      if (known) {
        term.values.filter(function (v) { return known.indexOf(v) < 0; }).forEach(function (v) {
          problems.push({ message: q.name + ': takes ' + queryEither(known) + ', not “' + v + '”', span: term.span });
        });
        term.values = term.values.filter(function (v) { return known.indexOf(v) >= 0; });
      }
      if (term.values.length > 0) terms.push(term);
    });
    return { terms: terms, text: text.join(' '), problems: problems };
  }

  function valuesOf(q, name, each) {
    var sets = q.terms.filter(function (t) { return t.name === name && !t.excluded; }).map(function (t) {
      var vs = each ? each(t.values) : t.values, seen = [];
      vs.forEach(function (v) { if (seen.indexOf(v) < 0) seen.push(v); });
      return seen;
    });
    if (sets.length === 0) return null;
    return sets.reduce(function (a, b) { return a.filter(function (x) { return b.indexOf(x) >= 0; }); });
  }

  var QUERY_MAX_SUGGESTIONS = 8;

  /* The names to complete the word `typed` to (`name:`, or `-name:` after a dash, which only excludable ones take). A name is
     suggested only when it starts with the word, so a free-text word that is no name's start opens nothing. */
  function queryNameSuggestions(input, caret, start, dash, typed, qualifiers) {
    var matching = qualifiers.filter(function (q) { return (!dash || q.excludable) && q.name.toLowerCase().indexOf(typed) === 0; });
    /* The rest of the word goes too, with a colon already after the caret. */
    var end = caret + /^[a-z_]*:?/i.exec(input.slice(caret))[0].length;
    return matching.map(function (q) {
      var label = dash + q.name + ':';
      var head = input.slice(0, start) + label;
      return { label: label, text: head + input.slice(end), caret: head.length, match: [dash.length, dash.length + typed.length], description: q.help, keepOpen: true };
    });
  }

  function suggestQuery(input, caret, qualifiers) {
    var toks = queryTokens(input.slice(0, caret));
    var token = toks[toks.length - 1];
    /* Nothing is typed yet: the names, but only when the whole query is empty. */
    if (input === '') token = { raw: '', start: 0, end: 0 };
    if (!token || token.end !== caret) return [];
    var m = /^(-?[a-z_]+:)(.*)$/i.exec(token.raw);
    if (!m) {
      var w = /^(-?)([a-z_]*)$/i.exec(token.raw);
      return w ? queryNameSuggestions(input, caret, token.start, w[1], w[2].toLowerCase(), qualifiers) : [];
    }
    var q = queryFind(qualifiers, m[1].replace(/^-/, '').slice(0, -1).toLowerCase());
    if (!q) return [];
    var rest = m[2];
    /* The value being typed starts after the last comma outside quotes. */
    var from = 0, open = false;
    for (var i = 0; i < rest.length; i++) {
      if (rest.charAt(i) === '"') open = !open;
      else if (rest.charAt(i) === ',' && !open) from = i + 1;
    }
    var typed = rest.slice(from).replace(/^"/, '').toLowerCase();
    var chosen = querySplit(rest.slice(0, from));
    var start = token.start + m[1].length + from;
    var end = caret + /^[^\s,]*/.exec(input.slice(caret))[0].length;
    var pool = (q.values || q.suggestions || []).filter(function (v) { return chosen.indexOf(v) < 0 && v.toLowerCase().indexOf(typed) >= 0; });
    var ranked = pool.filter(function (v) { return v.toLowerCase().indexOf(typed) === 0; })
      .concat(pool.filter(function (v) { return v.toLowerCase().indexOf(typed) !== 0; }));
    return ranked.slice(0, QUERY_MAX_SUGGESTIONS).map(function (value) {
      var head = input.slice(0, start) + queryQuoted(value);
      var at = value.toLowerCase().indexOf(typed);
      return { label: value, text: head + input.slice(end), caret: head.length, match: [at, at + typed.length] };
    });
  }

  function termText(t) { return (t.excluded ? '-' : '') + t.name + ':' + t.values.map(queryQuoted).join(','); }

  /* Adds `value` to the term of `name` that is excluded or not, as the call says; a new term goes at the end. */
  function queryAdd(input, name, value, excluded, qualifiers) {
    var term = parseQuery(input, qualifiers).terms.filter(function (t) { return t.name === name && t.excluded === excluded; })[0];
    if (!term) return (input.replace(/\s+$/, '') + ' ' + termText({ name: name, values: [value], excluded: excluded })).replace(/^\s+/, '');
    if (term.values.indexOf(value) >= 0) return input;
    var next = termText({ name: term.name, values: term.values.concat([value]), excluded: term.excluded });
    return input.slice(0, term.span[0]) + next + input.slice(term.span[1]);
  }

  function queryRemove(input, name, value, excluded, qualifiers) {
    var terms = parseQuery(input, qualifiers).terms, out = input;
    /* Right to left, so the spans of the terms still to edit stay where they were. */
    for (var i = terms.length - 1; i >= 0; i--) {
      var t = terms[i];
      if (t.name !== name || t.excluded !== excluded || t.values.indexOf(value) < 0) continue;
      if (t.values.length === 1) out = withoutTerm(out, i, qualifiers);
      else out = out.slice(0, t.span[0]) + termText({ name: t.name, excluded: t.excluded, values: t.values.filter(function (v) { return v !== value; }) }) + out.slice(t.span[1]);
    }
    return out;
  }

  function withValue(input, name, value, qualifiers) { return queryAdd(input, name, value, false, qualifiers); }
  function withoutValue(input, name, value, qualifiers) { return queryRemove(input, name, value, false, qualifiers); }

  function withoutTerm(input, index, qualifiers) {
    var term = parseQuery(input, qualifiers).terms[index];
    if (!term) return input;
    var start = term.span[0], end = term.span[1];
    var before = /\s+$/.exec(input.slice(0, start));
    if (before) start -= before[0].length;
    else end += /^\s*/.exec(input.slice(end))[0].length;
    return input.slice(0, start) + input.slice(end);
  }

  /* The two-way mapping between a query and one filter menu (QueryBar), pure so the tests run it. It is registered on HY but
     not exported by the package. A menu value is { include, exclude, none }: the values of the `name:` terms, of the
     `-name:` terms, and whether `no:name` is there. */
  function queryAll(q, name, excluded) {
    var seen = [];
    q.terms.forEach(function (t) {
      if (t.name === name && t.excluded === excluded) t.values.forEach(function (v) { if (seen.indexOf(v) < 0) seen.push(v); });
    });
    return seen;
  }

  /* A menu owns only a `no:` term that names its qualifier alone: values after one qualifier are alternatives, so
     `no:label,assignee` (no label or no assignee) is not "no label" and stays the query's own. */
  function queryIsNone(t, name) { return t.name === 'no' && !t.excluded && t.values.length === 1 && t.values[0] === name; }

  function queryMenu(input, name, qualifiers) {
    var q = parseQuery(input, qualifiers);
    return { include: queryAll(q, name, false), exclude: queryAll(q, name, true), none: q.terms.some(function (t) { return queryIsNone(t, name); }) };
  }

  /* The query after the menu for `name` changed to `next`: only that qualifier's terms are touched, and only where they differ.
     Switching between none and values swaps the terms in place, so the query keeps its order. */
  function withQueryMenu(input, name, next, qualifiers) {
    var now = queryMenu(input, name, qualifiers), out = input, terms, first = -1, i;
    if (next.none) {
      var own = queryFind(qualifiers, name);
      if (!own || !own.none) return input;
      /* Everything else this qualifier says goes: nothing has a value for it. no:name takes the first term's place. */
      terms = parseQuery(out, qualifiers).terms;
      for (i = 0; i < terms.length && first < 0; i++) if (terms[i].name === name) first = i;
      for (i = terms.length - 1; i > first; i--) if (terms[i].name === name) out = withoutTerm(out, i, qualifiers);
      if (first >= 0 && now.none) return withoutTerm(out, first, qualifiers);
      var none = termText({ name: 'no', values: [name], excluded: false });
      if (first >= 0) return out.slice(0, terms[first].span[0]) + none + out.slice(terms[first].span[1]);
      return now.none ? out : (out.replace(/\s+$/, '') + ' ' + none).replace(/^\s+/, '');
    }
    if (now.none) {
      /* The values chosen in place of none go where no:name was, unless the qualifier already has terms of its own. */
      terms = parseQuery(out, qualifiers).terms;
      for (i = 0; i < terms.length && first < 0; i++) if (queryIsNone(terms[i], name)) first = i;
      for (i = terms.length - 1; i > first; i--) if (queryIsNone(terms[i], name)) out = withoutTerm(out, i, qualifiers);
      var put = [];
      if (!now.include.length && !now.exclude.length) {
        if (next.include.length) put.push(termText({ name: name, values: next.include, excluded: false }));
        if (next.exclude.length) put.push(termText({ name: name, values: next.exclude, excluded: true }));
      }
      if (put.length) return out.slice(0, terms[first].span[0]) + put.join(' ') + out.slice(terms[first].span[1]);
      out = withoutTerm(out, first, qualifiers);
    }
    [false, true].forEach(function (excluded) {
      var from = excluded ? now.exclude : now.include, to = excluded ? next.exclude : next.include;
      from.forEach(function (v) { if (to.indexOf(v) < 0) out = queryRemove(out, name, v, excluded, qualifiers); });
      to.forEach(function (v) { if (from.indexOf(v) < 0) out = queryAdd(out, name, v, excluded, qualifiers); });
    });
    return out;
  }

  /* A single-valued qualifier such as `sort:`: the last term's first value, or `fallback`. */
  function querySingle(input, name, fallback, qualifiers) {
    var terms = parseQuery(input, qualifiers).terms.filter(function (t) { return t.name === name && !t.excluded; });
    return terms.length ? terms[terms.length - 1].values[0] : (fallback == null ? '' : String(fallback));
  }

  /* Picking the default removes every `name:` term; any other value takes the first one's place and the rest go. */
  function withQuerySingle(input, name, value, fallback, qualifiers) {
    var terms = parseQuery(input, qualifiers).terms, out = input, first = -1, i;
    for (i = 0; i < terms.length; i++) if (terms[i].name === name && !terms[i].excluded) { first = i; break; }
    if (value === fallback) {
      for (i = terms.length - 1; i >= 0; i--) if (terms[i].name === name && !terms[i].excluded) out = withoutTerm(out, i, qualifiers);
      return out;
    }
    if (first < 0) return queryAdd(out, name, value, false, qualifiers);
    for (i = terms.length - 1; i > first; i--) if (terms[i].name === name && !terms[i].excluded) out = withoutTerm(out, i, qualifiers);
    var t = terms[first];
    if (t.values.length === 1 && t.values[0] === value) return out;
    return out.slice(0, t.span[0]) + termText({ name: name, values: [value], excluded: false }) + out.slice(t.span[1]);
  }

  Object.assign(HY, { parseQuery: parseQuery, suggestQuery: suggestQuery, termText: termText, withValue: withValue, withoutValue: withoutValue, withoutTerm: withoutTerm, valuesOf: valuesOf,
    queryMenu: queryMenu, withQueryMenu: withQueryMenu, querySingle: querySingle, withQuerySingle: withQuerySingle });

  /* ---- Button ---- */
  (function () {
    /* The `variant` values plus our older names. 'default' and 'primary' are the same solid fill. */
    var BTN_VARIANTS = ['default', 'primary', 'secondary', 'tertiary', 'error', 'warning'];
    var BTN_SIZES = ['tiny', 'small', 'medium', 'large'];

    /* `type` is a visual variant when it names one (the older API) and the HTML type otherwise; `typeName` is always the HTML type. */
    function btnVariant(props) {
      var v = props.variant || (BTN_VARIANTS.indexOf(props.type) >= 0 ? props.type : null) || 'secondary';
      return v === 'default' ? 'primary' : v;
    }
    function btnHtmlType(props) {
      if (props.typeName) return props.typeName;
      if (props.type && BTN_VARIANTS.indexOf(props.type) < 0) return props.type;
      return 'button';
    }

    var BTN_OWN = ['variant', 'size', 'shape', 'shadow', 'loading', 'prefix', 'suffix', 'svgOnly', 'className', 'children', 'disabled', 'type', 'typeName', 'href', 'width', 'style'];

    function renderButton(props, ref, asLink) {
      var variant = btnVariant(props);
      var size = BTN_SIZES.indexOf(props.size) >= 0 ? props.size : 'medium';
      var loading = !!props.loading;
      var disabled = !!props.disabled || loading;
      var shape = props.shape;
      var rest = omit(props, BTN_OWN);
      var style = props.width !== undefined ? Object.assign({ width: props.width }, props.style) : props.style;
      var className = cx('hy-btn', 'hy-btn--' + variant, 'hy-btn--' + size,
        shape === 'rounded' && 'hy-btn--rounded', shape === 'circle' && 'hy-btn--circle',
        props.shadow && 'hy-btn--shadow', props.svgOnly && 'hy-btn--icon', props.className);
      var lead = loading
        ? h('span', { className: 'hy-btn__affix' }, h(HY.Spinner, { size: size === 'tiny' ? 12 : 16 }))
        : (props.prefix ? h('span', { className: 'hy-btn__affix', 'aria-hidden': 'true' }, props.prefix) : null);
      var body = props.svgOnly ? (loading ? null : props.children) : h('span', { className: 'hy-btn__label' }, props.children);
      var tail = !loading && props.suffix ? h('span', { className: 'hy-btn__affix', 'aria-hidden': 'true' }, props.suffix) : null;
      var common = { ref: ref, className: className, style: style, 'aria-busy': loading || undefined };
      if (asLink) {
        /* A disabled link has no href, so it can't be followed or focused, and says so to assistive tech. */
        return h('a', Object.assign({}, rest, common, {
          href: disabled ? undefined : props.href,
          'aria-disabled': disabled || undefined,
          onClick: disabled ? function (e) { e.preventDefault(); } : rest.onClick
        }), lead, body, tail);
      }
      return h('button', Object.assign({}, rest, common, { type: btnHtmlType(props), disabled: disabled }), lead, body, tail);
    }

    /* Button forwards its ref (Menu focuses its trigger). With `href` it renders a link, like ButtonLink. */
    var Button = React.forwardRef(function Button(props, ref) {
      return renderButton(props, ref, props.href !== undefined);
    });
    Button.displayName = 'Button';

    /* ButtonLink: a link that looks like a Button. Same props, plus `href`. */
    var ButtonLink = React.forwardRef(function ButtonLink(props, ref) {
      return renderButton(props, ref, true);
    });
    ButtonLink.displayName = 'ButtonLink';
    Button.Link = ButtonLink;

    define('Button', Button);
    define('ButtonLink', ButtonLink);
  })();

  /* ---- CopyButton ---- */
  (function () {
    /* CopyButton: an icon button that copies `textToCopy`, then shows a check for two seconds. */

    /* The async clipboard API can refuse (unfocused frame, no permission); fall back to a hidden textarea. */
    function copyWithFallback(text) {
      return copyText(text).catch(function () {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        if (!ok) throw new Error('copy failed');
      });
    }
    function CopyButton(props) {
      var st = useState(false), copied = st[0], setCopied = st[1];
      var timer = useRef(null);
      useEffect(function () { return function () { clearTimeout(timer.current); }; }, []);
      function onClick(e) {
        if (props.onClick) props.onClick(e);
        if (e.defaultPrevented) return;
        var text = props.textToCopy == null ? '' : String(props.textToCopy);
        copyWithFallback(text).then(function () {
          setCopied(true);
          if (props.onCopy) props.onCopy(text);
          clearTimeout(timer.current);
          timer.current = setTimeout(function () { setCopied(false); }, 2000);
        }, function () { /* clipboard refused: leave the copy icon */ });
      }
      var rest = omit(props, ['textToCopy', 'label', 'onCopy', 'onClick', 'className', 'variant', 'size', 'children']);
      return h(F_COPY, null,
        h(HY.Button, Object.assign(rest, {
          variant: props.variant || 'secondary', size: props.size, svgOnly: true,
          'aria-label': props.label || props['aria-label'] || 'Copy to Clipboard', onClick: onClick,
          className: cx('hy-copy-btn', copied && 'is-copied', props.className)
        }),
          h('span', { className: 'hy-copy-btn__icons', 'aria-hidden': 'true' },
            h('span', { className: 'hy-copy-btn__icon hy-copy-btn__icon--copy' }, h(Glyph, { name: 'copy' })),
            h('span', { className: 'hy-copy-btn__icon hy-copy-btn__icon--check' }, h(Glyph, { name: 'check' })))),
        h('span', { className: 'hy-copy-btn__status', role: 'status' }, copied ? 'Copied' : ''));
    }
    var F_COPY = React.Fragment;

    define('CopyButton', CopyButton);
  })();

  /* ---- LoadMoreButton ---- */
  (function () {
    /* LoadMoreButton: a full-width secondary Button at the end of a list that appends the next page. */
    function LoadMoreButton(props) {
      var rest = omit(props, ['noGap', 'noBorderRadius', 'className', 'children', 'variant']);
      return h(HY.Button, Object.assign(rest, {
        variant: props.variant || 'secondary',
        className: cx('hy-load-more', props.noGap && 'hy-load-more--no-gap', props.noBorderRadius && 'hy-load-more--square', props.className)
      }), props.children == null ? 'Load More' : props.children);
    }

    define('LoadMoreButton', LoadMoreButton);
  })();

  /* ---- SplitButton ---- */
  (function () {
    /*
     * SplitButton: a default action plus a chevron that opens related actions.
     * Built from MenuContainer, Button, MenuButton and Menu, so keyboard and dismiss behaviour match Menu.
     */
    var SPLIT_VARIANTS = { secondary: 1 };

    /* One menu entry: a title, an optional description below it, and an optional icon. */
    function SplitButtonMenuItem(props) {
      var ip = props.menuItemProps || {};
      var body = h('span', { className: 'hy-split__item-body' },
        h('span', { className: 'hy-split__item-title' }, props.title),
        props.description ? h('span', { className: 'hy-split__item-desc' }, props.description) : null);
      return h(HY.MenuItem, Object.assign({}, ip, {
        disabled: props.disabled || ip.disabled,
        prefix: props.icon,
        className: cx('hy-split__item', ip.className)
      }), body);
    }

    function splitItems(items) {
      if (!Array.isArray(items)) return items;
      return items.map(function (it, i) {
        if (React.isValidElement(it) || it == null) return it;
        return h(SplitButtonMenuItem, Object.assign({ key: it.key || i }, it));
      });
    }

    function SplitButton(props) {
      var bp = props.buttonProps || {};
      var variant = SPLIT_VARIANTS[bp.variant || props.variant] ? 'secondary' : 'default';
      var size = bp.size || props.size;
      var mp = props.menuProps || {};
      var disabled = !!props.disabled;
      return h(HY.MenuContainer, {
        position: props.menuAlignment === 'bottom-end' ? 'bottom-end' : 'bottom-start',
        open: props.open, defaultOpen: props.defaultOpen, onOpenChange: props.onOpenChange,
        className: cx('hy-split', 'hy-split--' + variant, props.className), style: props.style
      },
        h(HY.Button, Object.assign({}, omit(bp, ['variant', 'size', 'className']), {
          variant: variant, size: size, disabled: disabled || bp.disabled, className: cx('hy-split__main', bp.className)
        }), props.children),
        h(HY.MenuButton, {
          variant: variant, size: size, svgOnly: true, disabled: disabled,
          'aria-label': props.menuButtonLabel || 'More Options', className: 'hy-split__toggle'
        }, h(Glyph, { name: 'chevron' })),
        h(HY.Menu, Object.assign({}, omit(mp, ['className']), { className: cx('hy-split__menu', mp.className) }), splitItems(props.menuItems)));
    }

    SplitButton.MenuItem = SplitButtonMenuItem;

    define('SplitButton', SplitButton);
    define('SplitButtonMenuItem', SplitButtonMenuItem);
  })();

  /* ---- AddressInput ---- */
  (function () {
    /* AddressInput: a postal-address fieldset whose fields follow the chosen country (state + ZIP for the US,
       postal code before city for most of Europe, and so on). Country names come from Intl.DisplayNames.
       With `suggestions` (a list, or a function returning a list or a Promise) or a `provider` ({ search }),
       the street field becomes a search box and the remaining fields appear once an address is picked.
       It never calls the network itself. Values: { country, line1, line2, city, region, postalCode }. */
    var ADDRESS_US = [['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'], ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming']];
    var ADDRESS_CA = [['AB', 'Alberta'], ['BC', 'British Columbia'], ['MB', 'Manitoba'], ['NB', 'New Brunswick'], ['NL', 'Newfoundland and Labrador'], ['NS', 'Nova Scotia'], ['NT', 'Northwest Territories'], ['NU', 'Nunavut'], ['ON', 'Ontario'], ['PE', 'Prince Edward Island'], ['QC', 'Quebec'], ['SK', 'Saskatchewan'], ['YT', 'Yukon']];
    var ADDRESS_AU = [['ACT', 'Australian Capital Territory'], ['NSW', 'New South Wales'], ['NT', 'Northern Territory'], ['QLD', 'Queensland'], ['SA', 'South Australia'], ['TAS', 'Tasmania'], ['VIC', 'Victoria'], ['WA', 'Western Australia']];
    var ADDRESS_AE = [['AZ', 'Abu Dhabi'], ['AJ', 'Ajman'], ['DU', 'Dubai'], ['FU', 'Fujairah'], ['RK', 'Ras al-Khaimah'], ['SH', 'Sharjah'], ['UQ', 'Umm al-Quwain']];
    var ADDRESS_HK = [['HK', 'Hong Kong Island'], ['KLN', 'Kowloon'], ['NT', 'New Territories']];

    /* city/region/postal layout per country; `postalFirst` puts the code before the city on one row */
    var ADDRESS_FORMATS = {
      US: { city: 'City', region: 'State', regions: ADDRESS_US, postal: 'ZIP Code', postalAuto: 'postal-code' },
      CA: { city: 'City', region: 'Province', regions: ADDRESS_CA, postal: 'Postal Code' },
      AU: { city: 'Suburb', region: 'State', regions: ADDRESS_AU, postal: 'Postcode' },
      AE: { city: 'City', region: 'Emirate', regions: ADDRESS_AE, postal: null },
      HK: { city: null, region: 'Area', regions: ADDRESS_HK, postal: null },
      GB: { city: 'Town or City', postal: 'Postcode' },
      IE: { city: 'Town or City', region: 'County', postal: 'Eircode' }
    };
    var ADDRESS_DEFAULT = { city: 'City', postal: 'Postal Code', postalFirst: true };
    function addressFormat(country) { return ADDRESS_FORMATS[country] || ADDRESS_DEFAULT; }

    var ADDRESS_SKIP = { EU: 1, EZ: 1, UN: 1, QO: 1, XA: 1, XB: 1, ZZ: 1, UK: 1, AC: 1, CP: 1, DG: 1, EA: 1, IC: 1, TA: 1, CQ: 1 };
    var addressCountryCache = {};
    function addressCountries(locale) {
      var key = locale || '';
      if (addressCountryCache[key]) return addressCountryCache[key];
      var out = [];
      var dn = null;
      try { dn = new Intl.DisplayNames(locale ? [locale] : undefined, { type: 'region', fallback: 'none' }); } catch (e) { dn = null; }
      var A = 65;
      for (var i = 0; i < 26; i++) for (var j = 0; j < 26; j++) {
        var code = String.fromCharCode(A + i) + String.fromCharCode(A + j);
        if (ADDRESS_SKIP[code]) continue;
        var name = null;
        try { name = dn ? dn.of(code) : null; } catch (e) { name = null; }
        if (name && name !== code) out.push({ value: code, label: name });
      }
      out.sort(function (a, b) { return a.label.localeCompare(b.label, locale); });
      addressCountryCache[key] = out;
      return out;
    }

    function addressArticle(word) { var w = word.toLowerCase(); return (/^[aeiou]/.test(w) ? 'an ' : 'a ') + w; }

    function getAddressErrors(address) {
      var a = address || {};
      var f = addressFormat(a.country);
      var e = {};
      if (!a.country) e.country = 'Select a country.';
      if (!a.line1 || !String(a.line1).trim()) e.line1 = 'Enter street address.';
      if (f.city && (!a.city || !String(a.city).trim())) e.city = 'Enter ' + f.city.toLowerCase() + '.';
      if (f.regions && !a.region) e.region = 'Select ' + addressArticle(f.region) + '.';
      if (f.postal && (!a.postalCode || !String(a.postalCode).trim())) e.postalCode = 'Enter ' + f.postal.toLowerCase() + '.';
      return e;
    }

    var ADDRESS_DEMO = [
      { line1: '123 Market Street', city: 'San Francisco', region: 'CA', postalCode: '94105', country: 'US' },
      { line1: '1200 Pennsylvania Avenue', city: 'Arlington', region: 'VA', postalCode: '22202', country: 'US' },
      { line1: '45 Harbour Road', city: 'Toronto', region: 'ON', postalCode: 'M5J 2N8', country: 'CA' },
      { line1: '12 George Street', city: 'Sydney', region: 'NSW', postalCode: '2000', country: 'AU' },
      { line1: 'Hauptstraße 10', city: 'Berlin', postalCode: '10115', country: 'DE' },
      { line1: 'Musterweg 4', city: 'Hamburg', postalCode: '20095', country: 'DE' },
      { line1: '8 Canal Walk', city: 'London', postalCode: 'N1 7RB', country: 'GB' }
    ];

    function addressRegionName(country, code) {
      var f = addressFormat(country);
      var r = (f.regions || []).filter(function (x) { return x[0] === code; })[0];
      return r ? r[1] : code;
    }

    function AddressInput(props) {
      var auto = useId();
      var base = props.name || 'address';
      var locale = props.locale;
      var empty = { country: '', line1: '', line2: '', city: '', region: '', postalCode: '' };
      var vs = useControllable(props.value, Object.assign({}, empty, props.defaultValue || {}), props.onChange);
      var addr = Object.assign({}, empty, vs[0] || {});
      var errors = props.errors || {};
      var f = addressFormat(addr.country);
      var searchable = !!(props.suggestions || props.provider);
      var ms = useState(!searchable || !!(addr.line1 || addr.city));
      var expanded = ms[0], setExpanded = ms[1];
      var qs = useState(addr.line1 || '');
      var query = qs[0], setQuery = qs[1];
      var rs = useState([]);
      var results = rs[0], setResults = rs[1];
      var ls = useState(false);
      var loading = ls[0], setLoading = ls[1];
      var os = useState(false);
      var open = os[0], setOpen = os[1];
      var as = useState(-1);
      var active = as[0], setActive = as[1];
      var fs = useState('');
      var failed = fs[0], setFailed = fs[1];
      var box = useRef(null);
      var listRef = useRef(null);
      /* the list lines up with the text box itself, not the label above it */
      var anchor = useMemo(function () {
        return Object.defineProperty({}, 'current', { get: function () { return box.current ? box.current.querySelector('.hy-input') || box.current : null; } });
      }, []);
      var seq = useRef(0);
      var listId = auto + '-suggestions';

      var allCountries = addressCountries(locale);
      var countries = props.countries
        ? allCountries.filter(function (c) { return props.countries.indexOf(c.value) >= 0; })
        : allCountries;

      function set(patch) { vs[1](Object.assign({}, addr, patch)); }
      useDismiss(open, [box, listRef], function () { setOpen(false); });
      var listOpen = !!(open && (results.length || loading || query.trim()));
      var pos = useFloating(listOpen, anchor, listRef, { side: 'bottom', align: 'start' });
      var anchorWidth = listOpen && anchor.current ? anchor.current.offsetWidth : undefined;
      /* useFloating re-measures on any scroll: nudge it when the list's height changes */
      useLayoutEffect(function () {
        if (listOpen && listRef.current) listRef.current.dispatchEvent(new Event('scroll'));
      }, [listOpen, results.length, loading, anchorWidth]);

      function search(text) {
        var id = ++seq.current;
        if (!text.trim()) { setResults([]); setLoading(false); return; }
        var src = props.provider && props.provider.search ? props.provider.search(text, addr.country || undefined)
          : typeof props.suggestions === 'function' ? props.suggestions(text, addr.country || undefined)
            : (Array.isArray(props.suggestions) ? props.suggestions : []).filter(function (s) {
              var t = text.toLowerCase();
              var hay = [s.line1, s.city, s.postalCode].join(' ').toLowerCase();
              return hay.indexOf(t) >= 0 && (!addr.country || !s.country || s.country === addr.country);
            });
        function done(list) {
          if (id !== seq.current) return;
          setLoading(false);
          setFailed('');
          setResults((list || []).slice(0, 8));
          setActive(list && list.length ? 0 : -1);
        }
        if (src && typeof src.then === 'function') {
          setLoading(true);
          src.then(done, function () {
            if (id !== seq.current) return;
            setLoading(false); setResults([]);
            setFailed('Address lookup is unavailable. Enter the address manually.');
            setExpanded(true);
          });
        } else done(src);
      }
      function choose(s) {
        function fill(full) {
          var next = Object.assign({}, empty, { country: addr.country }, full || s);
          if (!next.country) next.country = addr.country;
          vs[1](next);
          setQuery(next.line1 || '');
          setExpanded(true);
          setLoading(false);
        }
        setOpen(false);
        if (props.provider && props.provider.details) {
          setLoading(true);
          Promise.resolve(props.provider.details(s)).then(fill, function () { fill(s); });
        } else fill(s);
      }
      function onSearchKey(e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive(Math.min(results.length - 1, active + 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(0, active - 1)); }
        else if (e.key === 'Enter' && open && active >= 0 && results[active]) { e.preventDefault(); choose(results[active]); }
        else if (e.key === 'Escape' && open) { e.preventDefault(); e.stopPropagation(); setOpen(false); }
      }
      function describe(s) {
        return [s.city, s.region ? addressRegionName(s.country || addr.country, s.region) : null, s.country ? (countries.concat(allCountries).filter(function (c) { return c.value === s.country; })[0] || { label: s.country }).label : null]
          .filter(Boolean).join(', ');
      }
      function field(key, label, auto2, extra) {
        return h(HY.Input, Object.assign({
          key: key, label: label, name: base + '.' + key, autoComplete: auto2, value: addr[key] || '', error: errors[key], disabled: props.disabled,
          onChange: function (e) { var p = {}; p[key] = e.target.value; set(p); }
        }, extra || {}));
      }
      function regionField() {
        return h(HY.Select, {
          key: 'region', label: f.region, name: base + '.region', autoComplete: 'address-level1', value: addr.region || '',
          placeholder: 'Select ' + addressArticle(f.region), error: errors.region, disabled: props.disabled,
          options: f.regions.map(function (r) { return { value: r[0], label: r[1] }; }),
          onChange: function (e) { set({ region: e.target.value }); }
        });
      }

      var street = searchable
        ? h('div', { className: 'hy-address__search', ref: box },
          h(HY.Input, {
            label: 'Street Address', name: base + '.line1', autoComplete: 'address-line1', value: query,
            placeholder: props.placeholder || 'Start typing an address…', error: errors.line1, disabled: props.disabled,
            prefix: h(Glyph, { name: 'search', size: 16 }), prefixStyling: false,
            suffix: loading ? h(HY.Spinner, { size: 16 }) : null, suffixStyling: false,
            role: 'combobox', 'aria-expanded': open && (results.length > 0 || loading), 'aria-controls': listId, 'aria-autocomplete': 'list',
            'aria-activedescendant': open && active >= 0 ? listId + '-' + active : undefined,
            onChange: function (e) { setQuery(e.target.value); set({ line1: e.target.value }); setOpen(true); search(e.target.value); },
            onFocus: function () { if (results.length) setOpen(true); },
            onKeyDown: onSearchKey
          }),
          listOpen ? portal(h('ul', {
            ref: listRef, id: listId, role: 'listbox', 'aria-label': 'Address suggestions',
            className: cx('hy-address__list', pos && 'hy-address__list--' + pos.side),
            style: floatingStyle(pos, { width: anchorWidth }),
            onMouseDown: function (e) { e.preventDefault(); }
          },
            loading ? h('li', { className: 'hy-address__status', role: 'presentation' }, h(HY.Spinner, { size: 16 }), 'Searching…')
              : !results.length ? h('li', { className: 'hy-address__status', role: 'presentation' }, 'No matching addresses.')
                : results.map(function (s, i) {
                  return h('li', {
                    key: i, id: listId + '-' + i, role: 'option', 'aria-selected': i === active,
                    className: cx('hy-address__option', i === active && 'is-active'),
                    onMouseMove: function () { if (active !== i) setActive(i); },
                    onClick: function () { choose(s); }
                  },
                    h(HY.Icon, { name: 'map-pin', size: 16, className: 'hy-address__pin' }),
                    h('span', { className: 'hy-address__lines' },
                      h('span', { className: 'hy-address__line1' }, s.line1),
                      h('span', { className: 'hy-address__line2' }, describe(s))));
                }))) : null)
        : field('line1', 'Street Address', 'address-line1');

      var cityField = f.city ? field('city', f.city, 'address-level2') : null;
      var postalField = f.postal ? field('postalCode', f.postal, 'postal-code') : null;
      var regionEl = f.regions ? regionField() : (f.region ? field('region', f.region, 'address-level1') : null);
      var rest;
      if (f.postalFirst) rest = [h('div', { key: 'pc', className: 'hy-address__pair hy-address__pair--postal-first' }, postalField, cityField)];
      else rest = [cityField, (regionEl || postalField) ? h('div', { key: 'rp', className: cx('hy-address__pair', !(regionEl && postalField) && 'hy-address__pair--one') }, regionEl, postalField) : null];

      return h('fieldset', { className: cx('hy-address', props.className), style: props.style, disabled: props.disabled },
        h('legend', { className: props.label ? 'hy-address__legend' : 'hy-sr' }, props.label || 'Address'),
        h(HY.Select, {
          label: 'Country', name: base + '.country', autoComplete: 'country', value: addr.country || '',
          placeholder: 'Select a country', error: errors.country, disabled: props.disabled, options: countries,
          onChange: function (e) { set({ country: e.target.value, region: '' }); }
        }),
        street,
        searchable && !expanded ? h('div', { className: 'hy-address__manual' },
          h(HY.Button, { variant: 'tertiary', size: 'small', onClick: function () { setExpanded(true); } }, 'Enter Address Manually')) : null,
        expanded ? h(React.Fragment, null,
          field('line2', 'Address Line 2 (Optional)', 'address-line2'),
          rest) : null,
        h('p', { className: failed ? 'hy-address__failed' : 'hy-sr', 'aria-live': 'polite' },
          failed || (loading ? 'Searching…' : open && query.trim() ? results.length + (results.length === 1 ? ' address found' : ' addresses found') : '')));
    }

    AddressInput.getAddressErrors = getAddressErrors;
    AddressInput.demoSuggestions = ADDRESS_DEMO;
    AddressInput.formats = ADDRESS_FORMATS;

    define('AddressInput', AddressInput);
    define('getAddressErrors', getAddressErrors);
  })();

  /* ---- Calendar ---- */
  (function () {
    /* Calendar: a date or date-range picker. A trigger shows the chosen dates; its popover holds a month grid,
       Start/End date and time fields, an Apply button and an optional timezone menu. Presets ("Last 7 Days")
       sit in a select joined to the trigger. Month, weekday and date names come from Intl in the user's locale.
       Values are Date objects: { start, end } for mode="range" (default), a Date for mode="single". */
    function calDay(d) { return d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : null; }
    function calAddDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
    function calAddMonths(d, n) {
      var t = new Date(d.getFullYear(), d.getMonth() + n, 1);
      var last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
      return new Date(t.getFullYear(), t.getMonth(), Math.min(d.getDate(), last));
    }
    function calSame(a, b) { return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
    function calKey(d) { return d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate(); }
    function calPad(n) { return (n < 10 ? '0' : '') + n; }
    function calIso(d) { return d ? d.getFullYear() + '-' + calPad(d.getMonth() + 1) + '-' + calPad(d.getDate()) : ''; }
    function calParseIso(s) {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
      return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
    }
    function calTime(d, fallback) { return d && (d.getHours() || d.getMinutes()) ? calPad(d.getHours()) + ':' + calPad(d.getMinutes()) : fallback; }
    function calWithTime(d, t) {
      if (!d) return null;
      var m = /^(\d{1,2}):(\d{2})/.exec(t || '');
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), m ? +m[1] : 0, m ? +m[2] : 0, m && +m[1] === 23 && +m[2] === 59 ? 59 : 0);
    }
    function calToDate(v) { return v == null ? null : (v instanceof Date ? v : new Date(v)); }
    function calNorm(v, mode) {
      if (mode === 'single') return { start: calToDate(v), end: null };
      return { start: calToDate(v && v.start), end: calToDate(v && v.end) };
    }
    function calPresetList(p) {
      if (!p) return [];
      if (Array.isArray(p)) return p.map(function (x, i) { return Object.assign({ key: x.key || String(i) }, x); });
      return Object.keys(p).map(function (k) { return Object.assign({ key: k }, p[k]); });
    }
    function calLocalZone() {
      try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local'; } catch (e) { return 'Local'; }
    }

    function CalendarMonth(p) {
      var fmt = p.fmt;
      var month = p.month;
      var first = new Date(month.getFullYear(), month.getMonth(), 1);
      var lead = (first.getDay() - p.weekStart + 7) % 7;
      var start = calAddDays(first, -lead);
      var days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      var weeks = Math.ceil((lead + days) / 7);
      var today = calDay(new Date());
      var lo = p.range.start, hi = p.range.end || (p.mode === 'range' && p.range.start && p.hover ? p.hover : null);
      if (lo && hi && hi < lo) { var t = lo; lo = hi; hi = t; }
      var heads = [];
      for (var i = 0; i < 7; i++) {
        var wd = calAddDays(start, i);
        heads.push(h('th', { key: i, scope: 'col', abbr: fmt.weekdayLong.format(wd) }, h('span', { 'aria-hidden': 'true' }, fmt.weekdayNarrow.format(wd)), h('span', { className: 'hy-sr' }, fmt.weekdayLong.format(wd))));
      }
      var rows = [];
      for (var w = 0; w < weeks; w++) {
        var cells = [];
        for (var c = 0; c < 7; c++) {
          var d = calAddDays(start, w * 7 + c);
          var outside = d.getMonth() !== month.getMonth();
          var disabled = (p.min && d < calDay(p.min)) || (p.max && d > calDay(p.max));
          var isStart = calSame(d, lo), isEnd = calSame(d, hi);
          var inBand = lo && hi && d >= calDay(lo) && d <= calDay(hi);
          var selected = isStart || isEnd || (p.mode === 'range' && inBand && !!p.range.end);
          var label = (calSame(d, today) ? 'Today, ' : '') + fmt.full.format(d) + (isStart || isEnd ? ' selected' : '');
          cells.push(h('td', {
            key: c, role: 'gridcell', 'aria-selected': selected ? 'true' : undefined,
            className: cx('hy-calendar__cell', inBand && !calSame(lo, hi) && 'is-band', isStart && 'is-band-start', isEnd && 'is-band-end',
              c === 0 && 'is-row-start', c === 6 && 'is-row-end')
          },
            h('button', {
              type: 'button', 'data-day': calIso(d), tabIndex: calSame(d, p.focus) ? 0 : -1, disabled: disabled, 'aria-label': label,
              className: cx('hy-calendar__day', outside && 'is-outside', (isStart || isEnd) && 'is-edge', calSame(d, today) && 'is-today',
                (d.getDay() === 0 || d.getDay() === 6) && 'is-weekend'),
              onClick: (function (day) { return function () { p.onPick(day); }; })(d),
              onMouseEnter: (function (day) { return function () { p.onHover(day); }; })(d),
              onFocus: (function (day) { return function () { if (!calSame(day, p.focus)) p.onFocusDay(day); }; })(d)
            }, d.getDate())));
        }
        rows.push(h('tr', { key: w }, cells));
      }
      return h('table', { role: 'grid', className: 'hy-calendar__grid', 'aria-labelledby': p.titleId, onKeyDown: p.onKeyDown, onMouseLeave: function () { p.onHover(null); } },
        h('thead', null, h('tr', null, heads)),
        h('tbody', null, rows));
    }

    function Calendar(props) {
      var auto = useId();
      var mode = props.mode === 'single' ? 'single' : 'range';
      var locale = props.locale;
      var showTime = props.showTimeInput !== false && mode === 'range';
      var fmt = useMemo(function () {
        return {
          title: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
          weekdayNarrow: new Intl.DateTimeFormat(locale, { weekday: 'narrow' }),
          weekdayLong: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
          full: new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          short: new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }),
          shortYear: new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' })
        };
      }, [locale]);
      var weekStart = props.firstDayOfWeek != null ? props.firstDayOfWeek : 0;
      var min = calToDate(props.minValue), max = calToDate(props.maxValue);

      var vs = useControllable(props.value, props.defaultValue !== undefined ? props.defaultValue : null, props.onChange);
      var value = calNorm(vs[0], mode);
      var os = useControllable(props.open, !!props.defaultOpen, props.onOpenChange);
      var open = os[0];
      var ds = useState(value);
      var draft = ds[0], setDraft = ds[1];
      var ts = useState({ start: calTime(value.start, '00:00'), end: calTime(value.end, '23:59') });
      var times = ts[0], setTimes = ts[1];
      var fs = useState(calDay(value.start || value.end || new Date()));
      var focus = fs[0], setFocus = fs[1];
      var hs = useState(null);
      var hover = hs[0], setHover = hs[1];
      var zs = useControllable(props.timezone, props.defaultTimezone || props.pinnedTimezone || 'local', props.onTimezoneChange);
      var msg = useState('');
      var root = useRef(null), pop = useRef(null), trigger = useRef(null), anchor = useRef(null), byUser = useRef(false);
      var titleId = auto + '-title';
      var presets = calPresetList(props.presets);

      function say(r) {
        if (!r.start) return msg[1]('');
        msg[1](mode === 'single' ? fmt.full.format(r.start) : 'From ' + fmt.shortYear.format(r.start) + (r.end ? ' to ' + fmt.shortYear.format(r.end) : ''));
      }
      function openPopover() {
        setDraft(value);
        setTimes({ start: calTime(value.start, '00:00'), end: calTime(value.end, '23:59') });
        setFocus(calDay(value.start || value.end || new Date()));
        byUser.current = true;
        os[1](true);
      }
      function closePopover(restore) {
        os[1](false);
        setHover(null);
        if (restore && trigger.current) trigger.current.focus();
      }
      useDismiss(open, [root, pop], function (reason) { closePopover(reason === 'escape'); });
      var align = props.popoverAlignment === 'center' || props.popoverAlignment === 'end' ? props.popoverAlignment : 'start';
      var pos = useFloating(open, anchor, pop, { side: 'bottom', align: align });
      useEffect(function () {
        if (!open || !byUser.current) return;
        byUser.current = false;
        /* wait a frame: the popover stays hidden until useFloating has measured it, and hidden boxes can't take focus */
        var raf = requestAnimationFrame(function () {
          var b = pop.current && pop.current.querySelector('.hy-calendar__day[tabindex="0"]');
          if (b) b.focus({ preventScroll: true });
        });
        return function () { cancelAnimationFrame(raf); };
      }, [open]);
      /* the grid can grow a row when the month changes: let useFloating re-measure (it listens to any scroll) */
      useLayoutEffect(function () {
        if (open && pop.current) pop.current.dispatchEvent(new Event('scroll'));
      }, [open, focus.getFullYear(), focus.getMonth()]);

      function commit(r) {
        var out = mode === 'single' ? (r.start ? calWithTime(r.start, '00:00') : null)
          : { start: r.start ? (showTime ? calWithTime(r.start, times.start) : calDay(r.start)) : null,
              end: r.end ? (showTime ? calWithTime(r.end, times.end) : calWithTime(r.end, '23:59')) : null };
        vs[1](out);
        say(r);
      }
      function pick(day) {
        setFocus(day);
        if (mode === 'single') { var r1 = { start: day, end: null }; setDraft(r1); commit(r1); closePopover(true); return; }
        var r;
        if (!draft.start || draft.end) r = { start: day, end: null };
        else if (day < calDay(draft.start)) r = { start: day, end: draft.start };
        else r = { start: draft.start, end: day };
        setDraft(r);
        say(r);
        if (r.end) { commit(r); closePopover(true); }
      }
      function onGridKey(e) {
        var d = focus, k = e.key;
        if (k === 'ArrowLeft') d = calAddDays(focus, -1);
        else if (k === 'ArrowRight') d = calAddDays(focus, 1);
        else if (k === 'ArrowUp') d = calAddDays(focus, -7);
        else if (k === 'ArrowDown') d = calAddDays(focus, 7);
        else if (k === 'PageUp') d = calAddMonths(focus, e.shiftKey ? -12 : -1);
        else if (k === 'PageDown') d = calAddMonths(focus, e.shiftKey ? 12 : 1);
        else if (k === 'Home') d = calAddDays(focus, -((focus.getDay() - weekStart + 7) % 7));
        else if (k === 'End') d = calAddDays(focus, 6 - ((focus.getDay() - weekStart + 7) % 7));
        else return;
        e.preventDefault();
        if (min && d < calDay(min)) d = calDay(min);
        if (max && d > calDay(max)) d = calDay(max);
        setFocus(d);
        if (draft.start && !draft.end) setHover(d);
        setTimeout(function () {
          var b = pop.current && pop.current.querySelector('[data-day="' + calIso(d) + '"]');
          if (b) b.focus({ preventScroll: true });
        }, 0);
      }
      function shiftMonth(n) { setFocus(calAddMonths(focus, n)); }
      function clear(e) {
        if (e) e.stopPropagation();
        var r = { start: null, end: null };
        setDraft(r);
        vs[1](mode === 'single' ? null : r);
        msg[1]('Dates cleared');
        if (trigger.current) trigger.current.focus();
      }
      function apply() { commit(draft); closePopover(true); }
      function pickPreset(key) {
        var p = presets.filter(function (x) { return x.key === key; })[0];
        if (!p) return;
        var r = { start: calToDate(p.start), end: calToDate(p.end) };
        vs[1](mode === 'single' ? r.start : r);
        say(r);
        if (props.onPresetChange) props.onPresetChange(key);
      }

      var hasValue = !!(value.start || value.end);
      var text;
      if (!hasValue) text = props.placeholder || (mode === 'single' ? 'Select Date' : 'Select Date Range');
      else if (mode === 'single' || !value.end) text = fmt.shortYear.format(value.start || value.end);
      else {
        var thisYear = value.start.getFullYear() === new Date().getFullYear() && value.end.getFullYear() === value.start.getFullYear();
        var rf = thisYear ? fmt.short : fmt.shortYear;
        text = rf.formatRange ? rf.formatRange(value.start, value.end) : rf.format(value.start) + ' – ' + rf.format(value.end);
      }
      var activePreset = '';
      presets.forEach(function (p) {
        if (calSame(calToDate(p.start), value.start) && calSame(calToDate(p.end), value.end)) activePreset = p.key;
      });
      if (props.presetIndex != null && !hasValue && presets[props.presetIndex]) activePreset = presets[props.presetIndex].key;
      var size = props.size === 'small' ? 'small' : 'medium';
      var layout = props.stacked ? 'stacked' : props.compact ? 'compact' : 'joined';

      var presetSelect = presets.length ? h('label', { className: cx('hy-calendar__presets', 'hy-calendar__presets--' + layout) },
        h('span', { className: 'hy-calendar__presets-icon', 'aria-hidden': 'true' }, h(HY.Icon, { name: 'clock', size: 16 })),
        h('select', {
          className: 'hy-calendar__presets-select', value: activePreset, disabled: props.disabled, 'aria-label': 'Select Period',
          onChange: function (e) { pickPreset(e.target.value); }
        },
          h('option', { value: '', disabled: true }, 'Select Period'),
          presets.map(function (p) { return h('option', { key: p.key, value: p.key }, p.text); })),
        h('span', { className: 'hy-calendar__presets-chevron', 'aria-hidden': 'true' }, h(Glyph, { name: 'chevron', size: 16 }))) : null;

      var triggerEl = h('div', {
        className: cx('hy-calendar__trigger', 'hy-calendar__trigger--' + size, props.disabled && 'is-disabled', open && 'is-open', presets.length && layout === 'joined' && 'is-joined')
      },
        h('button', {
          ref: trigger, type: 'button', className: 'hy-calendar__button', disabled: props.disabled,
          'aria-haspopup': 'dialog', 'aria-expanded': open, 'aria-label': props['aria-label'] ? props['aria-label'] + ': ' + text : undefined,
          onClick: function () { if (open) closePopover(false); else openPopover(); }
        },
          h('span', { className: 'hy-calendar__button-icon', 'aria-hidden': 'true' }, h(HY.Icon, { name: 'calendar', size: 16 })),
          h('span', { className: cx('hy-calendar__value', !hasValue && 'is-placeholder') }, text)),
        props.allowClear && hasValue && !props.disabled ? h('button', {
          type: 'button', className: 'hy-calendar__clear', 'aria-label': 'Clear dates', onClick: clear
        }, h(Glyph, { name: 'x', size: 16 })) : null);

      function field(which) {
        var d = draft[which];
        return h('div', { className: 'hy-calendar__field' },
          h('span', { className: 'hy-calendar__field-label', id: auto + '-' + which }, which === 'start' ? 'Start' : 'End'),
          h('input', {
            type: 'date', className: 'hy-calendar__input hy-calendar__input--date', value: calIso(d), 'aria-labelledby': auto + '-' + which,
            min: min ? calIso(min) : undefined, max: max ? calIso(max) : undefined,
            onChange: function (e) {
              var nd = calParseIso(e.target.value);
              var r = Object.assign({}, draft); r[which] = nd;
              setDraft(r);
              if (nd) setFocus(nd);
            }
          }),
          showTime ? h('input', {
            type: 'time', className: 'hy-calendar__input hy-calendar__input--time', value: times[which],
            'aria-label': (which === 'start' ? 'Start' : 'End') + ' time',
            onChange: function (e) { var t = Object.assign({}, times); t[which] = e.target.value; setTimes(t); }
          }) : null);
      }

      var zones = [{ value: 'utc', label: 'UTC' }, { value: 'local', label: 'Local (' + calLocalZone() + ')' }];
      if (props.pinnedTimezone) zones.push({ value: props.pinnedTimezone, label: props.pinnedTimezone.replace(/_/g, ' ') });
      var showZone = showTime && props.showTimezone !== false;

      var popover = open ? portal(h('div', {
        ref: pop, role: 'dialog', 'aria-label': mode === 'single' ? 'Choose a date' : 'Choose a date range',
        className: cx('hy-calendar__popover', props.horizontalLayout && 'hy-calendar__popover--horizontal', 'hy-calendar__popover--' + align, pos && 'hy-calendar__popover--' + pos.side),
        style: floatingStyle(pos),
        onKeyDown: function (e) { trapTab(e, pop.current); if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); apply(); } }
      },
        h('div', { className: 'hy-calendar__month' },
          h('div', { className: 'hy-calendar__head' },
            h('h2', { className: 'hy-calendar__title', id: titleId, 'aria-live': 'polite' }, fmt.title.format(focus)),
            h('div', { className: 'hy-calendar__nav' },
              h('button', { type: 'button', className: 'hy-calendar__navbtn', 'aria-label': 'Previous month', onClick: function () { shiftMonth(-1); } }, h(HY.Icon, { name: 'chevron-left', size: 16 })),
              h('button', { type: 'button', className: 'hy-calendar__navbtn', 'aria-label': 'Next month', onClick: function () { shiftMonth(1); } }, h(HY.Icon, { name: 'chevron-right', size: 16 })))),
          h(CalendarMonth, {
            month: focus, focus: focus, fmt: fmt, weekStart: weekStart, mode: mode, range: draft, hover: hover, min: min, max: max,
            titleId: titleId, onPick: pick, onHover: setHover, onFocusDay: setFocus, onKeyDown: onGridKey
          })),
        mode === 'range' ? h('div', { className: 'hy-calendar__side' },
          field('start'),
          field('end'),
          h(HY.Button, { variant: 'primary', size: 'small', className: 'hy-calendar__apply', onClick: apply, disabled: !draft.start, suffix: h(HY.KeyboardInput, { small: true }, '↵') }, 'Apply'),
          showZone ? h('label', { className: 'hy-calendar__zone' },
            h('span', { className: 'hy-sr' }, 'Timezone'),
            h(HY.Icon, { name: 'globe', size: 16 }),
            h('select', { value: zs[0], onChange: function (e) { zs[1](e.target.value); } },
              zones.map(function (z) { return h('option', { key: z.value, value: z.value }, z.label); })),
            h(Glyph, { name: 'chevron', size: 16 })) : null) : null)) : null;

      return h('div', { ref: root, className: cx('hy-calendar', 'hy-calendar--' + layout, props.className), style: props.style },
        layout === 'stacked' ? presetSelect : null,
        h('div', { ref: anchor, className: 'hy-calendar__bar' },
          layout === 'joined' ? presetSelect : null,
          triggerEl,
          layout === 'compact' ? presetSelect : null),
        popover,
        h('span', { className: 'hy-sr', 'aria-live': 'polite' }, msg[0]));
    }

    define('Calendar', Calendar);
  })();

  /* ---- Checkbox ---- */
  (function () {
    /* Checkbox: a 16px checkbox with a label. Checked, indeterminate (a dash in an empty box) and disabled. */
    function Checkbox(props) {
      var ref = useRef(null);
      var indeterminate = !!props.indeterminate || props.checked === 'indeterminate';
      useEffect(function () { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
      var descId = useId();
      var hasDesc = props.description != null && props.description !== false && props.description !== '';
      var rest = omit(props, ['children', 'className', 'checked', 'onChange', 'indeterminate', 'style', 'description']);
      var cls = cx('hy-check', props.disabled && 'hy-check--disabled', indeterminate && 'hy-check--indeterminate', !hasDesc && props.className);
      var label = h('label', { className: cls, style: hasDesc ? undefined : props.style },
        h('input', Object.assign({ ref: ref, type: 'checkbox', className: 'hy-check__input' }, rest, {
          checked: props.checked === undefined ? undefined : props.checked === true,
          onChange: props.onChange || (props.checked !== undefined ? function () {} : undefined),
          'aria-describedby': cx(props['aria-describedby'], hasDesc && descId) || undefined
        })),
        h('span', { className: 'hy-check__box', 'aria-hidden': 'true' },
          h(Glyph, { name: indeterminate ? 'minus' : 'check', size: 12, className: 'hy-check__mark' })),
        props.children != null && props.children !== false ? h('span', { className: 'hy-check__label' }, props.children) : null
      );
      if (!hasDesc) return label;
      /* The hint sits beside the label, not inside it, so it isn't part of the accessible name; a click on it still toggles. */
      return h('div', { className: cx('hy-check-field', props.disabled && 'hy-check-field--disabled', props.className), style: props.style },
        label,
        h('div', {
          id: descId, className: 'hy-check__description',
          onClick: function () { if (!props.disabled && ref.current) ref.current.click(); }
        }, props.description));
    }

    define('Checkbox', Checkbox);
  })();

  /* ---- Choicebox ---- */
  (function () {
    /* Choicebox: a group of large selectable tiles (title + description) with radio or checkbox semantics.
       <ChoiceboxGroup label type value onChange><ChoiceboxGroupItem title description value>{shown when selected}</ChoiceboxGroupItem></ChoiceboxGroup>
       Choicebox is the group; Choicebox.Group and Choicebox.Item are aliases for the two parts.
       A fieldset/legend names the group; each tile is a <label> around a native radio or checkbox. */
    var ChoiceboxContext = React.createContext(null);

    function choiceboxList(v) {
      if (v === undefined || v === null) return [];
      return Array.isArray(v) ? v.map(String) : [String(v)];
    }

    function ChoiceboxGroup(props) {
      var auto = useId();
      var type = props.type === 'checkbox' ? 'checkbox' : 'radio';
      var st = useState(props.defaultValue !== undefined ? props.defaultValue : (type === 'checkbox' ? [] : undefined));
      var controlled = props.value !== undefined;
      var value = controlled ? props.value : st[0];
      var selected = choiceboxList(value);
      var row = props.direction === 'row' || /\bflex-row\b/.test(props.listClassName || '');
      function select(itemValue, checked, e) {
        var next;
        if (type === 'radio') next = itemValue;
        else next = checked
          ? selected.concat([itemValue]).filter(function (v, i, a) { return a.indexOf(v) === i; })
          : selected.filter(function (v) { return v !== itemValue; });
        if (!controlled) st[1](next);
        if (props.onChange) props.onChange(next, e);
      }
      var ctx = { type: type, name: props.name || 'hy-choicebox' + auto, selected: selected, select: select, disabled: props.disabled };
      var listClass = (props.listClassName || '').replace(/\bflex-row\b/, '').trim();
      return h(ChoiceboxContext.Provider, { value: ctx },
        h('fieldset', {
          className: cx('hy-choicebox', props.className), disabled: props.disabled, style: props.style,
          'aria-describedby': props['aria-describedby']
        },
          props.label ? h('legend', { className: props.showLabel ? 'hy-choicebox__legend' : 'hy-sr' }, props.label) : null,
          h('div', { className: cx('hy-choicebox__list', row && 'hy-choicebox__list--row', listClass || null) }, props.children)));
    }

    function ChoiceboxGroupItem(props) {
      var ctx = React.useContext(ChoiceboxContext) || { type: 'radio', selected: [], select: function () {} };
      var id = useId();
      var value = String(props.value);
      var checked = ctx.selected.indexOf(value) >= 0;
      var disabled = !!(props.disabled || ctx.disabled);
      var descId = props.description ? id + '-desc' : undefined;
      return h('div', {
        className: cx('hy-choicebox__item', checked && 'is-checked', disabled && 'is-disabled', props.className),
        style: props.style, title: props.tooltip
      },
        h('label', { className: 'hy-choicebox__header', htmlFor: id },
          h('input', {
            id: id, type: ctx.type, name: ctx.name, value: value, className: 'hy-choicebox__input',
            checked: checked, disabled: disabled, 'aria-describedby': descId,
            onChange: function (e) { ctx.select(value, e.target.checked, e); }
          }),
          h('span', { className: 'hy-choicebox__text' },
            h('span', { className: 'hy-choicebox__title' }, props.title),
            props.description ? h('span', { className: 'hy-choicebox__desc', id: descId }, props.description) : null),
          h('span', { className: cx('hy-choicebox__indicator', 'hy-choicebox__indicator--' + ctx.type), 'aria-hidden': 'true' },
            ctx.type === 'checkbox' ? h(Glyph, { name: 'check', size: 12 }) : null)),
        checked && props.children != null && props.children !== false
          ? h('div', { className: 'hy-choicebox__content' }, props.children)
          : null);
    }

    var Choicebox = ChoiceboxGroup;
    Choicebox.Group = ChoiceboxGroup;
    Choicebox.Item = ChoiceboxGroupItem;

    define('Choicebox', Choicebox);
    define('ChoiceboxGroup', ChoiceboxGroup);
    define('ChoiceboxGroupItem', ChoiceboxGroupItem);
  })();

  /* ---- ClearableInput ---- */
  (function () {
    /* ClearableInput: an Input that shows an Esc key once it has a value. The key, or Escape, clears it. */
    function setRef(ref, el) {
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    }

    /* Set the value the way typing would, so React fires onChange with a real event. */
    function clearField(el) {
      var desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      desc.set.call(el, '');
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }

    var ClearableInput = React.forwardRef(function ClearableInput(props, ref) {
      var inner = useRef(null);
      var controlled = props.value !== undefined;
      var st = useState(props.defaultValue != null ? String(props.defaultValue) : '');
      var value = controlled ? (props.value == null ? '' : String(props.value)) : st[0];
      var dirty = value !== '';
      var rest = omit(props, ['onClear', 'cmdk', 'onChange', 'onKeyDown', 'suffix', 'suffixStyling', 'className']);

      function clear() {
        var el = inner.current;
        if (!el) return;
        clearField(el);
        if (props.onClear) props.onClear();
        el.focus();
      }
      function onChange(e) {
        if (!controlled) st[1](e.target.value);
        if (props.onChange) props.onChange(e);
      }
      function onKeyDown(e) {
        if (props.onKeyDown) props.onKeyDown(e);
        if (e.defaultPrevented || e.key !== 'Escape' || !dirty || props.readOnly) return;
        e.preventDefault();
        e.stopPropagation();
        clear();
      }

      var custom = props.suffix !== undefined;
      var suffix = custom ? props.suffix
        : dirty && !props.disabled && !props.readOnly
          ? h('button', { type: 'button', className: 'hy-clearable__clear', 'aria-label': 'Clear', onClick: clear },
              h(HY.KeyboardInput, { small: true }, 'Esc'),
              h('span', { className: 'hy-clearable__x', 'aria-hidden': 'true' }, h(Glyph, { name: 'x', size: 14 })))
          : props.cmdk
            ? h('span', { className: 'hy-clearable__cmdk', 'aria-hidden': 'true' },
                h(HY.KeyboardInput, { small: true, meta: true }), h(HY.KeyboardInput, { small: true }, 'K'))
            : null;

      return h(HY.Input, Object.assign({}, rest, {
        ref: function (el) { inner.current = el; setRef(ref, el); },
        className: cx('hy-clearable', props.className),
        onChange: onChange,
        onKeyDown: onKeyDown,
        suffix: suffix,
        suffixStyling: custom ? props.suffixStyling : false
      }));
    });

    define('ClearableInput', ClearableInput);
  })();

  /* ---- Combobox ---- */
  (function () {
    /* Combobox: a text field that filters a list of options as you type (ARIA 1.2 combobox + listbox).
       <Combobox aria-label placeholder value onChange><ComboboxInput/><ComboboxList emptyMessage><ComboboxOption value>Label</ComboboxOption></ComboboxList></Combobox>
       The parts only carry props: Combobox reads them and renders the field and popover itself.
       `options` ([{ value, label }] or strings) can stand in for the parts. */
    function ComboboxInput() { return null; }
    function ComboboxList() { return null; }
    function ComboboxOption() { return null; }

    function comboboxText(node) {
      if (node == null || node === false || node === true) return '';
      if (typeof node === 'string' || typeof node === 'number') return String(node);
      if (Array.isArray(node)) return node.map(comboboxText).join('');
      if (node.props) return comboboxText(node.props.children);
      return '';
    }

    function comboboxParts(props) {
      var parts = { input: {}, list: {}, options: [] };
      (props.options || []).forEach(function (o) {
        var opt = typeof o === 'object' ? o : { value: o, label: o };
        parts.options.push({ value: String(opt.value), label: opt.label != null ? String(opt.label) : String(opt.value), node: opt.label != null ? opt.label : opt.value, prefix: opt.prefix, suffix: opt.suffix, disabled: opt.disabled });
      });
      function walk(children) {
        React.Children.forEach(children, function (c) {
          if (!c || !c.type) return;
          if (c.type === React.Fragment) walk(c.props.children);
          else if (c.type === ComboboxInput) parts.input = c.props;
          else if (c.type === ComboboxList) { parts.list = c.props; walk(c.props.children); }
          else if (c.type === ComboboxOption) {
            var label = c.props.textValue || comboboxText(c.props.children) || String(c.props.value);
            parts.options.push({ value: String(c.props.value), label: label, node: c.props.children != null ? c.props.children : label, prefix: c.props.prefix, suffix: c.props.suffix, disabled: c.props.disabled });
          }
        });
      }
      walk(props.children);
      return parts;
    }

    function Combobox(props) {
      var auto = useId();
      var id = props.id || auto;
      var listId = id + '-list';
      var parts = comboboxParts(props);
      var options = parts.options;
      var vs = useControllable(props.value, props.defaultValue !== undefined ? props.defaultValue : null, props.onChange);
      var value = vs[0] == null ? null : String(vs[0]);
      function labelOf(v) {
        for (var i = 0; i < options.length; i++) if (options[i].value === v) return options[i].label;
        return v == null ? '' : v;
      }
      var qs = useState(labelOf(value));
      var query = qs[0], setQuery = qs[1];
      var os = useState(!!props.defaultOpen);
      var open = os[0], setOpen = os[1];
      var ts = useState(false);
      var typed = ts[0], setTyped = ts[1];
      var as = useState(-1);
      var active = as[0], setActive = as[1];
      var root = useRef(null);
      var input = useRef(null);
      var listRef = useRef(null);
      var field = useRef(null);
      var size = props.size === 'small' || props.size === 'large' ? props.size : 'medium';

      /* keep the text in sync when the value changes from outside */
      useEffect(function () { if (!open) setQuery(labelOf(value)); }, [value]);

      var q = typed ? query.trim().toLowerCase() : '';
      var shown = q ? options.filter(function (o) { return o.label.toLowerCase().indexOf(q) >= 0; }) : options;

      useEffect(function () {
        if (!open) return;
        var i = -1;
        for (var k = 0; k < shown.length; k++) if (shown[k].value === value) { i = k; break; }
        if (i < 0 && typed) for (k = 0; k < shown.length; k++) if (!shown[k].disabled) { i = k; break; }
        setActive(i);
      }, [open, query]);

      useEffect(function () {
        if (!open || active < 0 || !listRef.current) return;
        var el = listRef.current.querySelector('[data-index="' + active + '"]');
        if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
      }, [active, open]);

      /* useFloating re-measures on any scroll: nudge it when filtering changes the list's height */
      var fieldWidth = open && field.current ? field.current.offsetWidth : undefined;
      useLayoutEffect(function () {
        if (open && listRef.current) listRef.current.dispatchEvent(new Event('scroll'));
      }, [open, shown.length, props.loading, fieldWidth]);

      function close() { setOpen(false); setTyped(false); setQuery(labelOf(value)); }
      useDismiss(open, [root, listRef], close);
      var pos = useFloating(open, field, listRef, { side: 'bottom', align: 'start' });

      function pick(o) {
        if (!o || o.disabled) return;
        vs[1](o.value);
        setQuery(o.label);
        setTyped(false);
        setOpen(false);
      }
      function move(dir) {
        if (!shown.length) return;
        var i = active < 0 ? (dir > 0 ? -1 : shown.length) : active;
        for (var n = 0; n < shown.length; n++) {
          i = (i + dir + shown.length) % shown.length;
          if (!shown[i].disabled) { setActive(i); return; }
        }
      }
      function onKeyDown(e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) setOpen(true); else move(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (!open) setOpen(true); else move(-1); }
        else if (e.key === 'Home' && open) { e.preventDefault(); setActive(0); }
        else if (e.key === 'End' && open) { e.preventDefault(); setActive(shown.length - 1); }
        else if (e.key === 'Enter') { if (open) { e.preventDefault(); if (active >= 0) pick(shown[active]); } }
        else if (e.key === 'Escape') { if (open) { e.preventDefault(); e.stopPropagation(); close(); } else if (props.clearable && value != null) clear(); }
        else if (e.key === 'Tab') { if (open) close(); }
        if (props.onKeyDown) props.onKeyDown(e);
      }
      function onInput(e) {
        setQuery(e.target.value);
        setTyped(true);
        setOpen(true);
        if (parts.input.onChange) parts.input.onChange(e);
        if (props.onInputChange) props.onInputChange(e.target.value);
      }
      function clear() {
        vs[1](null);
        setQuery('');
        setTyped(false);
        if (input.current) input.current.focus();
      }
      function onBlur(e) {
        var t = e.relatedTarget;
        if (t && ((root.current && root.current.contains(t)) || (listRef.current && listRef.current.contains(t)))) return;
        if (open) close();
        else setQuery(labelOf(value));
      }

      var activeId = open && active >= 0 && shown[active] ? id + '-opt-' + options.indexOf(shown[active]) : undefined;
      var empty = parts.list.emptyMessage || props.emptyMessage || 'No results.';
      var width = props.width != null ? props.width : undefined;
      var showClear = props.clearable && value != null && !props.disabled;
      var rest = omit(props, ['id', 'value', 'defaultValue', 'onChange', 'options', 'children', 'size', 'width', 'clearable', 'errored', 'disabled', 'placeholder', 'className', 'style', 'defaultOpen', 'emptyMessage', 'onInputChange', 'onKeyDown', 'loading', 'aria-label', 'aria-labelledby', 'name']);

      return h('div', Object.assign({}, rest, {
        ref: root, className: cx('hy-combobox', open && 'is-open', props.className),
        style: Object.assign({ width: width }, props.style)
      }),
        h('div', { ref: field, className: cx('hy-input', 'hy-input--' + size, 'hy-combobox__field', props.errored && 'hy-input--error', props.disabled && 'hy-input--disabled') },
          h('span', { className: 'hy-combobox__icon', 'aria-hidden': 'true' }, h(Glyph, { name: 'search', size: 16 })),
          h('input', {
            ref: input, id: id, type: 'text', role: 'combobox', autoComplete: 'off', spellCheck: false,
            'aria-label': props['aria-label'], 'aria-labelledby': props['aria-labelledby'],
            'aria-expanded': open, 'aria-controls': listId, 'aria-autocomplete': 'list',
            'aria-activedescendant': activeId, 'aria-invalid': props.errored ? 'true' : undefined,
            placeholder: props.placeholder, disabled: props.disabled, value: query,
            onChange: onInput, onKeyDown: onKeyDown, onBlur: onBlur,
            onClick: function () { if (!props.disabled) setOpen(true); }
          }),
          props.name ? h('input', { type: 'hidden', name: props.name, value: value == null ? '' : value }) : null,
          showClear ? h('button', {
            type: 'button', className: 'hy-combobox__btn', 'aria-label': 'Clear',
            onMouseDown: function (e) { e.preventDefault(); }, onClick: clear
          }, h(Glyph, { name: 'x', size: 16 })) : null,
          h('button', {
            type: 'button', tabIndex: -1, className: 'hy-combobox__btn hy-combobox__chevron', 'aria-label': open ? 'Hide options' : 'Show options',
            disabled: props.disabled,
            onMouseDown: function (e) { e.preventDefault(); },
            onClick: function () { if (open) close(); else { setOpen(true); if (input.current) input.current.focus(); } }
          }, h(Glyph, { name: 'chevron', size: 16 }))),
        open ? portal(h('ul', {
          ref: listRef, id: listId, role: 'listbox', 'aria-label': props['aria-label'], 'aria-labelledby': props['aria-labelledby'],
          className: cx('hy-combobox__list', pos && 'hy-combobox__list--' + pos.side),
          style: floatingStyle(pos, {
            width: parts.list.width != null ? parts.list.width : fieldWidth,
            maxWidth: parts.list.maxWidth != null ? 'min(' + (typeof parts.list.maxWidth === 'number' ? parts.list.maxWidth + 'px' : parts.list.maxWidth) + ', calc(100vw - 16px))' : 'calc(100vw - 16px)'
          }),
          onMouseDown: function (e) { e.preventDefault(); }
        },
          props.loading
            ? h('li', { className: 'hy-combobox__empty', role: 'presentation' }, h(HY.Spinner, { size: 16 }), 'Loading…')
            : shown.length === 0
              ? h('li', { className: 'hy-combobox__empty', role: 'presentation' }, typeof empty === 'function' ? empty(query) : empty)
              : shown.map(function (o, i) {
                var selected = o.value === value;
                return h('li', {
                  key: o.value, id: id + '-opt-' + options.indexOf(o), role: 'option', 'data-index': i,
                  'aria-selected': selected, 'aria-disabled': o.disabled ? 'true' : undefined,
                  className: cx('hy-combobox__option', i === active && 'is-active', selected && 'is-selected', o.disabled && 'is-disabled'),
                  onMouseMove: function () { if (!o.disabled && active !== i) setActive(i); },
                  onClick: function () { pick(o); }
                },
                  o.prefix ? h('span', { className: 'hy-combobox__affix' }, o.prefix) : null,
                  h('span', { className: 'hy-combobox__label' }, o.node),
                  o.suffix ? h('span', { className: 'hy-combobox__affix' }, o.suffix) : null,
                  h('span', { className: 'hy-combobox__check', 'aria-hidden': 'true' }, selected ? h(Glyph, { name: 'check', size: 16 }) : null));
              }))) : null,
        h('span', { className: 'hy-sr', 'aria-live': 'polite' },
          open && typed ? (props.loading ? 'Loading' : shown.length + (shown.length === 1 ? ' result' : ' results')) : ''));
    }

    Combobox.Input = ComboboxInput;
    Combobox.List = ComboboxList;
    Combobox.Option = ComboboxOption;

    define('Combobox', Combobox);
    define('ComboboxInput', ComboboxInput);
    define('ComboboxList', ComboboxList);
    define('ComboboxOption', ComboboxOption);
  })();

  /* ---- Feedback ---- */
  (function () {
    /* "Was this helpful?" widget. No network: it hands { emotion, text, topic, metadata } to onSubmit,
       which may return a Promise. type="popover" (default) opens a panel from a trigger button; type="inline" is a pill that expands. */
    var FEEDBACK_EMOTIONS = [
      { value: 'hate', label: 'Hate It', icon: 'angry' },
      { value: 'meh', label: 'Not Great', icon: 'frown' },
      { value: 'okay', label: 'It’s Okay', icon: 'smile' },
      { value: 'love', label: 'Love It', icon: 'laugh' }
    ];

    function FeedbackEmotions(p) {
      return h('fieldset', { className: 'hy-feedback__emotions' },
        h('legend', { className: 'hy-sr' }, p.legend),
        FEEDBACK_EMOTIONS.map(function (e) {
          return h('label', { key: e.value, className: 'hy-feedback__emotion', title: e.label },
            h('input', { type: 'radio', name: p.name, value: e.value, className: 'hy-sr', checked: p.value === e.value,
              disabled: p.disabled, onChange: function () { p.onChange(e.value); } }),
            h('span', { className: 'hy-feedback__face' }, h(HY.Icon, { name: e.icon, size: 18 })),
            h('span', { className: 'hy-sr' }, e.label));
        }));
    }

    function useFeedbackForm(props, onDone) {
      var emotion = useState(null);
      var text = useState('');
      var topic = useState('');
      var status = useState('idle'); /* idle | sending | sent | failed */
      var error = useState(null);
      function reset() { emotion[1](null); text[1](''); topic[1](''); error[1](null); status[1]('idle'); }
      function submit() {
        if (status[0] === 'sending') return;
        if (!text[0].trim()) { error[1]('Add a few words before you send.'); return; }
        error[1](null);
        var payload = { emotion: emotion[0], text: text[0].trim(), topic: topic[0] || undefined, metadata: props.metadata };
        var result = props.dryRun || !props.onSubmit ? null : props.onSubmit(payload);
        if (result && typeof result.then === 'function') {
          status[1]('sending');
          result.then(function () { status[1]('sent'); if (onDone) onDone(); }, function () { status[1]('failed'); });
        } else { status[1]('sent'); if (onDone) onDone(); }
      }
      return { emotion: emotion, text: text, topic: topic, status: status, error: error, reset: reset, submit: submit };
    }

    function FeedbackFields(p) {
      var f = p.form, ids = p.ids;
      var sending = f.status[0] === 'sending';
      return h(React.Fragment, null,
        p.topics ? h('div', { className: 'hy-select hy-input--small hy-feedback__topic' },
          h('select', { 'aria-label': 'Topic', value: f.topic[0], disabled: sending, onChange: function (e) { f.topic[1](e.target.value); } },
            h('option', { value: '', disabled: true }, 'Select a topic…'),
            p.topics.map(function (t) { var v = typeof t === 'string' ? t : t.value; return h('option', { key: v, value: v }, typeof t === 'string' ? t : t.label); })),
          h(Glyph, { name: 'chevron', className: 'hy-select__chevron' })) : null,
        h('div', { className: cx('hy-feedback__field', f.error[0] && 'hy-feedback__field--error') },
          h('label', { htmlFor: ids.text, className: 'hy-sr' }, 'Feedback'),
          h('textarea', {
            id: ids.text, ref: p.textRef, rows: 4, placeholder: 'Your feedback…', value: f.text[0], disabled: sending,
            'aria-invalid': f.error[0] ? 'true' : undefined, 'aria-describedby': f.error[0] ? ids.error : undefined,
            onChange: function (e) { f.text[1](e.target.value); if (f.error[0]) f.error[1](null); },
            onKeyDown: function (e) { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); f.submit(); } }
          })),
        f.error[0] ? h('p', { id: ids.error, className: 'hy-feedback__error' }, h(HY.Icon, { name: 'circle-alert', size: 14 }), f.error[0]) : null,
        f.status[0] === 'failed' ? h('p', { className: 'hy-feedback__error', role: 'alert' }, h(HY.Icon, { name: 'circle-alert', size: 14 }), 'Couldn’t send feedback. Try again.') : null);
    }

    function FeedbackSend(p) {
      return h(HY.Button, { size: 'small', variant: 'primary', typeName: 'submit', loading: p.form.status[0] === 'sending' }, 'Send');
    }

    function FeedbackPopover(props) {
      var open = useState(!!props.defaultOpen);
      var wrapRef = useRef(null), triggerRef = useRef(null), panelRef = useRef(null), textRef = useRef(null);
      var userOpened = useRef(false);
      var uid = useId();
      var ids = { panel: uid + '-panel', text: uid + '-text', error: uid + '-error', title: uid + '-title' };
      var form = useFeedbackForm(props);
      function close(returnFocus) {
        open[1](false);
        if (returnFocus !== false && triggerRef.current) triggerRef.current.focus({ preventScroll: true });
      }
      /* Placed with useFloating like Popover, so the panel flips and stays 8px inside the screen. */
      var pos = useFloating(open[0], triggerRef, panelRef, { side: 'bottom', align: 'center', offset: 8 });
      var placed = !!pos;
      useDismiss(open[0], [wrapRef, panelRef], function (why) { close(why === 'escape'); });
      /* Focus the note once the panel is placed: it is hidden until then. */
      useLayoutEffect(function () {
        if (placed && userOpened.current && textRef.current) textRef.current.focus({ preventScroll: true });
      }, [placed]);
      var sent = form.status[0] === 'sent';
      var sentRef = useRef(null);
      useEffect(function () { if (sent && sentRef.current) sentRef.current.focus({ preventScroll: true }); }, [sent]);
      return h('div', { ref: wrapRef, className: cx('hy-feedback', props.className) },
        h(HY.Button, {
          ref: triggerRef, size: 'small', variant: 'secondary', prefix: props.prefix, suffix: props.suffix,
          'aria-expanded': open[0], 'aria-controls': open[0] ? ids.panel : undefined, 'aria-haspopup': 'dialog',
          onClick: function () { if (open[0]) close(false); else { if (form.status[0] === 'sent') form.reset(); userOpened.current = true; open[1](true); } }
        }, props.label || 'Feedback'),
        open[0] ? portal(h('div', {
          ref: panelRef, id: ids.panel, role: 'dialog', 'aria-labelledby': ids.title, className: 'hy-feedback__panel', style: floatingStyle(pos, { width: 340 }),
          onKeyDown: function (e) { if (e.key === 'Escape') { e.stopPropagation(); close(true); return; } if (e.key === 'Tab') e.stopPropagation(); trapTab(e, panelRef.current); }
        },
          sent ? h('div', { ref: sentRef, tabIndex: -1, className: 'hy-feedback__sent', role: 'status' },
            h('span', { className: 'hy-feedback__sent-icon' }, h(HY.Icon, { name: 'check', size: 16 })),
            h('p', { id: ids.title, className: 'hy-feedback__sent-title' }, 'Your feedback has been received!'),
            h('p', { className: 'hy-feedback__sent-copy' }, 'Thank you for your help.'))
          : h('form', { noValidate: true, onSubmit: function (e) { e.preventDefault(); form.submit(); } },
            h('h2', { id: ids.title, className: 'hy-sr' }, props.copy || 'Was this helpful?'),
            h('div', { className: 'hy-feedback__body' }, h(FeedbackFields, { form: form, ids: ids, textRef: textRef, topics: props.showTopics ? props.topics : null })),
            h('div', { className: 'hy-feedback__footer' },
              h(FeedbackEmotions, { name: uid + '-emotion', legend: 'How did it feel?', value: form.emotion[0], onChange: form.emotion[1], disabled: form.status[0] === 'sending' }),
              h(FeedbackSend, { form: form }))))) : null);
    }

    function FeedbackInline(props) {
      var uid = useId();
      var ids = { text: uid + '-text', error: uid + '-error' };
      var textRef = useRef(null);
      var form = useFeedbackForm(props);
      var expanded = useState(!!props.defaultOpen);
      var sent = form.status[0] === 'sent';
      var formRef = useRef(null);
      useEffect(function () { if (sent && formRef.current && formRef.current.contains(document.activeElement) === false && document.activeElement === document.body) formRef.current.focus({ preventScroll: true }); }, [sent]);
      var copy = props.copy || 'Was this helpful?';
      function pick(v) { form.emotion[1](v); expanded[1](true); }
      return h('form', {
        ref: formRef, tabIndex: -1, noValidate: true, 'aria-label': props.label || 'Feedback',
        className: cx('hy-feedback-inline', expanded[0] && !sent && 'hy-feedback-inline--open', props.className),
        onSubmit: function (e) { e.preventDefault(); form.submit(); }
      },
        h('div', { className: 'hy-feedback-inline__bar', 'aria-live': 'polite' },
          sent ? h('p', { className: 'hy-feedback-inline__copy' }, h(HY.Icon, { name: 'check', size: 16 }), 'Thanks for the feedback.')
            : h(React.Fragment, null,
              h('p', { className: 'hy-feedback-inline__copy', 'aria-hidden': 'true' }, copy),
              h(FeedbackEmotions, { name: uid + '-emotion', legend: copy, value: form.emotion[0], onChange: pick, disabled: form.status[0] === 'sending' }))),
        expanded[0] && !sent ? h('div', { className: 'hy-feedback-inline__body' },
          h(FeedbackFields, { form: form, ids: ids, textRef: textRef, topics: props.showTopics ? props.topics : null }),
          h('div', { className: 'hy-feedback-inline__actions' }, h(FeedbackSend, { form: form }))) : null);
    }

    function Feedback(props) {
      return props.type === 'inline' ? h(FeedbackInline, props) : h(FeedbackPopover, props);
    }

    define('Feedback', Feedback);
  })();

  /* ---- Fieldset ---- */
  (function () {
    /* Fieldset: a settings card. Content (title, subtitle, controls) over a gray footer with a status line and actions. */
    var FieldsetCtx = React.createContext(null);

    function FieldsetContent(props) {
      var ctx = React.useContext(FieldsetCtx);
      var box = useRef(null);
      var rest = omit(props, ['className', 'children', 'disabled']);
      useLayoutEffect(function () {
        var el = box.current;
        if (!el || !ctx) return;
        if (!props['aria-labelledby'] && !props['aria-label'] && document.getElementById(ctx.titleId)) el.setAttribute('aria-labelledby', ctx.titleId);
        if (!props['aria-describedby'] && document.getElementById(ctx.subtitleId)) el.setAttribute('aria-describedby', ctx.subtitleId);
      });
      return h('fieldset', Object.assign({}, rest, {
        ref: box,
        disabled: props.disabled,
        className: cx('hy-fieldset__content', props.disabled && 'hy-fieldset__content--disabled', props.className)
      }),
        props.children,
        props.disabled ? h('div', { className: 'hy-fieldset__wall', 'aria-hidden': 'true' }) : null
      );
    }
    function FieldsetTitle(props) {
      var ctx = React.useContext(FieldsetCtx);
      return h(props.as || 'h4', { id: props.id || (ctx ? ctx.titleId : undefined), className: cx('hy-fieldset__title', props.className) }, props.children);
    }
    function FieldsetSubtitle(props) {
      var ctx = React.useContext(FieldsetCtx);
      return h('div', { id: props.id || (ctx ? ctx.subtitleId : undefined), className: cx('hy-fieldset__subtitle', props.className) }, props.children);
    }
    function FieldsetFooter(props) {
      return h('div', { className: cx('hy-fieldset__footer', props.highlight && 'hy-fieldset__footer--highlight', props.className) }, props.children);
    }
    function FieldsetFooterStatus(props) {
      var ctx = React.useContext(FieldsetCtx);
      var type = ctx && ctx.type;
      return h('div', { className: cx('hy-fieldset__status', props.className) },
        type === 'error' || type === 'warning' ? h(Glyph, { name: type, size: 16, className: 'hy-fieldset__status-icon' }) : null,
        h('div', { className: 'hy-fieldset__status-text' }, props.children));
    }
    function FieldsetFooterActions(props) {
      return h('div', { className: cx('hy-fieldset__actions', props.className) }, props.children);
    }
    var FieldsetFooterAction = React.forwardRef(function FieldsetFooterAction(props, ref) {
      return h(HY.Button, Object.assign({ variant: 'primary', size: 'small' }, props, { ref: ref }));
    });

    function Fieldset(props) {
      var base = useId();
      var ctx = useMemo(function () { return { titleId: base + '-title', subtitleId: base + '-subtitle', type: props.type }; }, [base, props.type]);
      var rest = omit(props, ['className', 'children', 'type']);
      return h(FieldsetCtx.Provider, { value: ctx },
        h('div', Object.assign({}, rest, { className: cx('hy-fieldset', props.type && 'hy-fieldset--' + props.type, props.className) }), props.children));
    }

    FieldsetFooter.Status = FieldsetFooterStatus;
    FieldsetFooter.Actions = FieldsetFooterActions;
    FieldsetFooter.Action = FieldsetFooterAction;
    Fieldset.Fieldset = Fieldset;
    Fieldset.Content = FieldsetContent;
    Fieldset.Title = FieldsetTitle;
    Fieldset.Subtitle = FieldsetSubtitle;
    Fieldset.Footer = FieldsetFooter;
    Fieldset.FooterStatus = FieldsetFooterStatus;
    Fieldset.FooterActions = FieldsetFooterActions;
    Fieldset.FooterAction = FieldsetFooterAction;

    define('FieldsetContent', FieldsetContent);
    define('FieldsetTitle', FieldsetTitle);
    define('FieldsetSubtitle', FieldsetSubtitle);
    define('FieldsetFooter', FieldsetFooter);
    define('FieldsetFooterStatus', FieldsetFooterStatus);
    define('FieldsetFooterActions', FieldsetFooterActions);
    define('FieldsetFooterAction', FieldsetFooterAction);
    define('Fieldset', Fieldset);
  })();

  /* ---- FilterMenu ---- */
  (function () {
    /* FilterMenu: a filter menu that starts empty and adds values: each row is
       included, or excluded with `excludable`; it can search, group rows in sections and offer a "none" row.
       <FilterMenu label="Labels" value onChange items noneLabel excludable searchable/>, or rows as parts:
       <FilterMenu label><FilterMenu.Section title><FilterMenu.Item value label description prefix suffix/></FilterMenu.Section></FilterMenu>.
       `single` makes it a one-of menu ("Sort: Newest"). The parts only carry props: FilterMenu reads them. */
    function FilterMenuItem() { return null; }
    function FilterMenuSection() { return null; }

    var FM_EMPTY = { include: [], exclude: [], none: false };

    function fmNormalize(v) {
      return v ? { include: (v.include || []).map(String), exclude: (v.exclude || []).map(String), none: !!v.none } : FM_EMPTY;
    }

    function fmRow(o) {
      var opt = typeof o === 'object' ? o : { value: o };
      var value = String(opt.value);
      return { value: value, label: opt.label != null ? String(opt.label) : value, description: opt.description, prefix: opt.prefix, suffix: opt.suffix, disabled: !!opt.disabled };
    }

    /* Rows grouped in the order given: `items` first, then the parts. A group with no title is a run of loose rows. */
    function fmGroups(props) {
      var groups = [];
      function loose() {
        var last = groups[groups.length - 1];
        if (!last || last.title != null) { last = { title: null, rows: [] }; groups.push(last); }
        return last;
      }
      (props.items || []).forEach(function (o) { loose().rows.push(fmRow(o)); });
      function walk(children, section) {
        React.Children.forEach(children, function (c) {
          if (!c || !c.type) return;
          if (c.type === React.Fragment) walk(c.props.children, section);
          else if (c.type === FilterMenuSection) {
            var g = { title: c.props.title, rows: [] };
            groups.push(g);
            walk(c.props.children, g);
          } else if (c.type === FilterMenuItem) (section || loose()).rows.push(fmRow(c.props));
        });
      }
      walk(props.children, null);
      return groups;
    }

    /* 0 when the query starts a word, 1 when it is found elsewhere, -1 when it is not found. */
    function fmRank(row, q) {
      var text = (row.label + ' ' + row.value).toLowerCase();
      if (text.indexOf(q) < 0) return -1;
      return text.split(/[\s\-_\/.:]+/).some(function (w) { return w.indexOf(q) === 0; }) ? 0 : 1;
    }

    function FilterMenu(props) {
      var auto = useId();
      var id = props.id || auto;
      var single = !!props.single;
      var label = props.label || 'Filter';
      var noneLabel = !single ? props.noneLabel : undefined;
      var excludable = !!props.excludable && !single;
      var groups = fmGroups(props);
      var os = useControllable(props.open, !!props.defaultOpen, props.onOpenChange);
      var open = !!os[0];
      var vs = useControllable(props.value, props.defaultValue !== undefined ? props.defaultValue : (single ? (props.defaultOption != null ? props.defaultOption : '') : FM_EMPTY), props.onChange);
      var v = single ? null : fmNormalize(vs[0]);
      var current = single ? (vs[0] == null ? '' : String(vs[0])) : null;
      var qs = useState('');
      var query = qs[0], setQuery = qs[1];
      var as = useState(0);
      var active = as[0], setActive = as[1];
      var ms = useState('');
      var message = ms[0], setMessage = ms[1];
      var trigger = useRef(null);
      var panel = useRef(null);
      var listRef = useRef(null);
      var input = useRef(null);
      var byUser = useRef(false);

      var all = [];
      groups.forEach(function (g) { g.rows.forEach(function (r) { if (!all.some(function (a) { return a.value === r.value; })) all.push(r); }); });
      var searchable = props.searchable !== undefined ? !!props.searchable : all.length > 8;
      function labelOf(val) {
        for (var i = 0; i < all.length; i++) if (all[i].value === val) return all[i].label;
        return val;
      }

      /* Chosen values that match no row are listed first, so they can be unchecked. */
      var strays = [];
      if (!single) v.include.concat(v.exclude).forEach(function (val) { if (!all.some(function (a) { return a.value === val; }) && strays.indexOf(val) < 0) strays.push(val); });

      var q = searchable ? query.trim().toLowerCase() : '';
      var shown = [];
      if (q) {
        /* While searching, sections and the none row are dropped and each match is listed once. */
        var seen = {}, found = [];
        strays.map(fmRow).concat(all).forEach(function (r) {
          var rank = fmRank(r, q);
          if (rank >= 0 && !seen[r.value]) { seen[r.value] = true; found.push({ rank: rank, row: r, at: found.length }); }
        });
        found.sort(function (a, b) { return a.rank - b.rank || a.at - b.at; });
        shown.push({ title: null, entries: found.map(function (f) { return { row: f.row }; }) });
      } else {
        var top = strays.map(function (s) { return { row: fmRow(s) }; });
        if (noneLabel) top.unshift({ none: true, row: { value: '', label: noneLabel } });
        if (top.length) shown.push({ title: null, entries: top });
        groups.forEach(function (g) { if (g.rows.length) shown.push({ title: g.title, entries: g.rows.map(function (r) { return { row: r }; }) }); });
      }
      var flat = [];
      shown.forEach(function (g) { g.entries.forEach(function (e) { e.index = flat.length; flat.push(e); }); });

      /* 'on' (included or the picked option), 'ex' (excluded) or 'off' */
      function stateOf(e) {
        if (single) return current === e.row.value ? 'on' : 'off';
        if (e.none) return v.none ? 'on' : 'off';
        return v.include.indexOf(e.row.value) >= 0 ? 'on' : v.exclude.indexOf(e.row.value) >= 0 ? 'ex' : 'off';
      }

      function setOpen(next) {
        os[1](next);
        if (!next) { setQuery(''); byUser.current = false; }
      }
      function closeToTrigger() { setOpen(false); if (trigger.current) trigger.current.focus(); }
      useDismiss(open, [trigger, panel], function (reason) {
        setOpen(false);
        if (reason === 'escape' && trigger.current) trigger.current.focus();
      });
      var pos = useFloating(open, trigger, panel, { side: 'bottom', align: props.align === 'end' ? 'end' : 'start', offset: 8 });
      var placed = !!pos;

      /* Focus stays in the search box, or in the list when there is no search. Only when opened from the trigger. */
      useEffect(function () {
        if (!open || !placed || !byUser.current) return;
        var el = searchable ? input.current : listRef.current;
        if (el) el.focus({ preventScroll: true });
      }, [open, placed]);

      /* The highlight starts on the first row that can be chosen, and again whenever the search changes. */
      useEffect(function () {
        if (!open) return;
        var i = 0;
        while (i < flat.length && flat[i].row.disabled) i++;
        setActive(i < flat.length ? i : -1);
      }, [open, query]);
      useEffect(function () {
        if (!open || active < 0 || !listRef.current) return;
        var el = listRef.current.querySelector('[data-index="' + active + '"]');
        if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
      }, [active, open]);
      /* useFloating re-measures on any scroll: nudge it when filtering changes the panel's height */
      useLayoutEffect(function () {
        if (open && panel.current) panel.current.dispatchEvent(new Event('scroll'));
      }, [open, flat.length]);

      function emit(next, text) { vs[1](next); setMessage(text); }
      function without(list, val) { return list.filter(function (x) { return x !== val; }); }
      function pick(e) {
        if (!e || e.row.disabled) return;
        var val = e.row.value, name = e.row.label;
        if (single) { emit(val, name + ' selected'); closeToTrigger(); return; }
        if (e.none) {
          if (v.none) emit({ include: [], exclude: [], none: false }, name + ' removed');
          else emit({ include: [], exclude: [], none: true }, name + ' selected');
        } else if (v.include.indexOf(val) >= 0) emit({ include: without(v.include, val), exclude: v.exclude, none: false }, name + ' removed');
        else if (v.exclude.indexOf(val) >= 0) emit({ include: v.include, exclude: without(v.exclude, val), none: false }, name + ' removed');
        else emit({ include: v.include.concat([val]), exclude: v.exclude, none: false }, name + ' included');
      }
      function exclude(e) {
        if (!excludable || !e || e.none || e.row.disabled) return;
        var val = e.row.value, name = e.row.label;
        if (v.exclude.indexOf(val) >= 0) emit({ include: v.include, exclude: without(v.exclude, val), none: false }, name + ' removed');
        else emit({ include: without(v.include, val), exclude: v.exclude.concat([val]), none: false }, name + ' excluded');
      }
      function move(to, dir) {
        var i = to;
        while (i >= 0 && i < flat.length && flat[i].row.disabled) i += dir;
        if (i >= 0 && i < flat.length) setActive(i);
      }
      function onKeyDown(ev) {
        var k = ev.key;
        if (k === 'Tab') {
          /* Closing from the trigger makes the next Tab continue after it, as if the panel sat right behind it. */
          if (trigger.current) trigger.current.focus();
          if (ev.shiftKey) ev.preventDefault();
          setOpen(false);
        } else if (k === 'ArrowDown') { ev.preventDefault(); move(active < 0 ? 0 : active + 1, 1); }
        else if (k === 'ArrowUp') { ev.preventDefault(); move(active < 0 ? flat.length - 1 : active - 1, -1); }
        else if (k === 'Home') { ev.preventDefault(); move(0, 1); }
        else if (k === 'End') { ev.preventDefault(); move(flat.length - 1, -1); }
        else if (k === 'Enter' || (k === ' ' && !searchable)) {
          ev.preventDefault();
          if (ev.shiftKey && k === 'Enter') exclude(flat[active]); else pick(flat[active]);
        }
      }

      /* The trigger says what is chosen: its text is short, its accessible name lists every value. */
      var count = single ? 0 : v.include.length + v.exclude.length;
      var text, name, chosen;
      if (single) {
        text = label + ': ' + labelOf(current);
        name = text;
        chosen = current !== (props.defaultOption != null ? String(props.defaultOption) : '');
      } else {
        var parts = v.include.map(labelOf).concat(v.exclude.map(function (x) { return 'not ' + labelOf(x); }));
        if (v.none) parts = [noneLabel || 'None'];
        chosen = parts.length > 0;
        text = !chosen ? label : v.none ? parts[0] : count === 1 ? (v.include.length ? labelOf(v.include[0]) : 'Not ' + labelOf(v.exclude[0])) : label + ' · ' + count;
        name = chosen ? label + ': ' + parts.join(', ') : label;
      }

      var activeId = open && active >= 0 && flat[active] ? id + '-opt-' + active : undefined;
      var listId = id + '-list';
      var lower = label.toLowerCase();
      var rest = omit(props, ['id', 'label', 'value', 'defaultValue', 'onChange', 'items', 'noneLabel', 'excludable', 'searchable', 'single', 'defaultOption', 'size', 'align', 'width', 'open', 'defaultOpen', 'onOpenChange', 'disabled', 'className', 'style', 'children']);

      return h('div', Object.assign({}, rest, { className: cx('hy-filtermenu', props.className), style: props.style }),
        h(HY.Button, {
          ref: trigger, variant: 'secondary', size: props.size || 'small', disabled: props.disabled,
          className: cx('hy-filtermenu__trigger', chosen && 'is-active'),
          'aria-haspopup': 'listbox', 'aria-expanded': open, 'aria-controls': open ? listId : undefined, 'aria-label': name,
          suffix: h('span', { className: cx('hy-filtermenu__chevron', open && 'is-open') }, h(Glyph, { name: 'chevron', size: 16 })),
          onClick: function () { byUser.current = true; setOpen(!open); }
        }, text),
        open ? portal(h('div', {
          ref: panel,
          className: cx('hy-filtermenu__panel', (pos ? pos.side === 'top' : false) && 'hy-filtermenu__panel--top', props.align === 'end' && 'hy-filtermenu__panel--end'),
          style: floatingStyle(pos, { width: props.width }),
          onKeyDown: onKeyDown,
          onMouseDown: function (e) { if (e.target !== input.current) e.preventDefault(); }
        },
          searchable ? h('div', { className: 'hy-filtermenu__search' },
            h('span', { className: 'hy-filtermenu__searchicon', 'aria-hidden': 'true' }, h(Glyph, { name: 'search', size: 16 })),
            h('input', {
              ref: input, type: 'text', role: 'combobox', autoComplete: 'off', spellCheck: false,
              'aria-label': 'Search ' + lower, 'aria-expanded': true, 'aria-controls': listId, 'aria-autocomplete': 'list', 'aria-activedescendant': activeId,
              placeholder: 'Search…', value: query, onChange: function (e) { setQuery(e.target.value); }
            })) : null,
          h('div', {
            ref: listRef, id: listId, role: 'listbox', className: 'hy-filtermenu__list',
            'aria-label': label, 'aria-multiselectable': single ? undefined : 'true',
            tabIndex: searchable ? undefined : 0, 'aria-activedescendant': searchable ? undefined : activeId
          },
            flat.length === 0
              ? h('div', { className: 'hy-filtermenu__empty', role: 'presentation' }, 'No ' + lower + ' match “' + query.trim() + '”')
              : shown.map(function (g, gi) {
                var head = g.title != null ? id + '-group-' + gi : null;
                var rows = g.entries.map(function (e) {
                  var st = stateOf(e);
                  var r = e.row;
                  var oid = id + '-opt-' + e.index;
                  return h('div', {
                    key: e.index, id: oid, role: 'option', 'data-index': e.index,
                    'aria-selected': st !== 'off', 'aria-disabled': r.disabled ? 'true' : undefined,
                    'aria-label': r.label + (st === 'ex' ? ', excluded' : ''),
                    'aria-describedby': r.description ? oid + '-desc' : undefined,
                    className: cx('hy-filtermenu__option', e.index === active && 'is-active', st === 'ex' && 'is-excluded', r.disabled && 'is-disabled'),
                    onMouseMove: function () { if (!r.disabled && active !== e.index) setActive(e.index); },
                    onClick: function () { pick(e); }
                  },
                    h('span', { className: cx('hy-filtermenu__mark', single && 'hy-filtermenu__mark--single', st !== 'off' && 'is-on'), 'aria-hidden': 'true' },
                      st === 'on' ? h(Glyph, { name: 'check', size: 12 }) : st === 'ex' ? h(Glyph, { name: 'minus', size: 12 }) : null),
                    r.prefix ? h('span', { className: 'hy-filtermenu__affix', 'aria-hidden': 'true' }, r.prefix) : null,
                    h('span', { className: 'hy-filtermenu__text' },
                      h('span', { className: 'hy-filtermenu__label' }, r.label),
                      r.description ? h('span', { id: oid + '-desc', className: 'hy-filtermenu__desc' }, r.description) : null),
                    r.suffix ? h('span', { className: 'hy-filtermenu__affix hy-filtermenu__hint', 'aria-hidden': 'true' }, r.suffix) : null,
                    /* Mouse and touch only: the keyboard excludes with Shift+Enter, so the button is out of the tab order and the tree */
                    excludable && !e.none && !r.disabled && st !== 'ex' ? h('button', {
                      type: 'button', tabIndex: -1, 'aria-hidden': 'true', className: 'hy-filtermenu__exclude',
                      onClick: function (ev) { ev.stopPropagation(); exclude(e); }
                    }, 'Exclude') : null);
                });
                return head
                  ? h('div', { key: gi, role: 'group', 'aria-labelledby': head, className: 'hy-filtermenu__group' },
                    h('div', { id: head, role: 'presentation', className: 'hy-filtermenu__title' }, g.title), rows)
                  : h('div', { key: gi, role: 'presentation', className: 'hy-filtermenu__group' }, rows);
              }))
        )) : null,
        h('span', { className: 'hy-sr', 'aria-live': 'polite' }, message));
    }

    FilterMenu.Item = FilterMenuItem;
    FilterMenu.Section = FilterMenuSection;

    define('FilterMenu', FilterMenu);
    define('FilterMenuItem', FilterMenuItem);
    define('FilterMenuSection', FilterMenuSection);
  })();

  /* ---- Input ---- */
  (function () {
    /* Input: a text field. Prefix/suffix slots (styled, plain or bare), three sizes, label, hint and error. */
    function setRef(ref, el) {
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    }

    function isMessage(v) { return v != null && v !== false && v !== true && v !== ''; }

    var Input = React.forwardRef(function Input(props, ref) {
      var auto = useId();
      var id = props.id || auto;
      var ids = fieldIds(id);
      var size = props.size || 'medium';
      var inner = useRef(null);
      var errText = isMessage(props.error) ? props.error : null;
      var plainPrefix = props.prefixStyling === false || props.prefixContainer === false;
      var plainSuffix = props.suffixStyling === false || props.suffixContainer === false;
      var rest = omit(props, ['label', 'hint', 'error', 'prefix', 'suffix', 'prefixStyling', 'suffixStyling', 'prefixContainer', 'suffixContainer', 'size', 'rounded', 'className', 'wrapperClassName', 'labelPosition', 'mono', 'id', 'type', 'typeName']);

      function affix(node, side, styling, container) {
        if (node == null || node === false) return null;
        if (container === false) return h(React.Fragment, { key: side }, node);
        return h('span', { key: side, className: cx('hy-input__' + side, styling === false && 'hy-input__' + side + '--plain') }, node);
      }
      /* Clicking the frame or an affix focuses the field, as a label would. */
      function onFrameDown(e) {
        var el = inner.current;
        if (!el || props.disabled || e.target === el) return;
        if (e.target.closest && e.target.closest('button,a,input,select,textarea,[tabindex]')) return;
        e.preventDefault();
        el.focus();
      }

      return h('div', { className: cx('hy-field', 'hy-field--' + size, props.label && props.labelPosition === 'inline' && 'hy-field--inline-label', props.mono && 'hy-field--mono', props.className) },
        props.label ? h('label', { className: 'hy-field__label', htmlFor: id }, props.label) : null,
        h('div', {
          className: cx('hy-input', 'hy-input--' + size, props.error && 'hy-input--error', props.disabled && 'hy-input--disabled', props.rounded && 'hy-input--rounded',
            props.prefix != null && plainPrefix && 'hy-input--plain-prefix', props.suffix != null && plainSuffix && 'hy-input--plain-suffix', props.wrapperClassName),
          onMouseDown: onFrameDown
        },
          affix(props.prefix, 'prefix', props.prefixStyling, props.prefixContainer),
          h('input', Object.assign({ id: id, type: props.typeName || props.type || 'text' }, rest, {
            ref: function (el) { inner.current = el; setRef(ref, el); },
            'aria-invalid': props.error ? 'true' : undefined,
            'aria-describedby': cx(props['aria-describedby'], errText ? ids.error : (props.hint ? ids.hint : null)) || undefined
          })),
          affix(props.suffix, 'suffix', props.suffixStyling, props.suffixContainer)
        ),
        errText
          ? h('div', { role: 'alert', className: 'hy-field__alert' }, h(FieldMessage, { ids: ids, error: errText }))
          : h(FieldMessage, { ids: ids, hint: props.hint })
      );
    });

    define('Input', Input);
  })();

  /* ---- Label ---- */
  (function () {
    /* Label: a form label. 13px gray text, Title Case by default, optionally wrapping its control. */
    function Label(props) {
      var text = props.value != null ? props.value : (props.withInput ? null : props.children);
      var control = props.value != null || props.withInput ? props.children : null;
      var rest = omit(props, ['value', 'children', 'withInput', 'bypassCasing', 'className', 'id', 'htmlFor']);
      return h('label', Object.assign({}, rest, {
        htmlFor: props.htmlFor || props.id,
        className: cx('hy-label', props.withInput && 'hy-label--with-input', props.bypassCasing && 'hy-label--bypass-casing', props.className)
      }),
        text != null ? h('span', { className: 'hy-label__text' }, text) : null,
        control
      );
    }

    define('Label', Label);
  })();

  /* ---- MultiSelect ---- */
  (function () {
    /* MultiSelect: a button that opens a checklist; each row has a checkbox and a quick action
       ("Only" to pick just that row, "Select All" to pick everything again).
       Parts: MultiSelectRoot > MultiSelectTrigger + MultiSelectContent > MultiSelectRow.
       Shortcut: <MultiSelect label items value onChange/> renders the whole thing. */
    var MultiSelectContext = React.createContext(null);

    function MultiSelectRoot(props) {
      var auto = useId();
      var os = useControllable(props.open, !!props.defaultOpen, props.onOpenChange);
      var trigger = useRef(null);
      var root = useRef(null);
      var ctx = { open: !!os[0], setOpen: os[1], trigger: trigger, root: root, contentId: auto + '-content' };
      return h(MultiSelectContext.Provider, { value: ctx },
        h('div', { ref: root, className: cx('hy-multiselect', props.className), style: props.style }, props.children));
    }

    function MultiSelectTrigger(props) {
      var ctx = React.useContext(MultiSelectContext);
      var rest = omit(props, ['children', 'className', 'size', 'variant']);
      return h(HY.Button, Object.assign({}, rest, {
        variant: props.variant || 'secondary', size: props.size || 'small',
        ref: ctx.trigger,
        className: cx('hy-multiselect__trigger', props.className),
        'aria-haspopup': 'dialog', 'aria-expanded': ctx.open, 'aria-controls': ctx.open ? ctx.contentId : undefined,
        suffix: h('span', { className: cx('hy-multiselect__chevron', ctx.open && 'is-open') }, h(Glyph, { name: 'chevron', size: 16 })),
        onClick: function (e) { ctx.setOpen(!ctx.open); if (props.onClick) props.onClick(e); }
      }), props.children);
    }

    function multiSelectCells(content) {
      return Array.prototype.slice.call(content.querySelectorAll('.hy-multiselect__row')).map(function (row) {
        return [row.querySelector('[data-ms-col="0"]'), row.querySelector('[data-ms-col="1"]')];
      });
    }

    function MultiSelectContent(props) {
      var ctx = React.useContext(MultiSelectContext);
      var ref = useRef(null);
      /* The panel is portalled to <body> and placed by useFloating, so it flips and stays on screen. */
      var pos = useFloating(ctx.open, ctx.root, ref, { side: 'bottom', align: props.align === 'end' ? 'end' : 'start', offset: 8 });
      var placed = !!pos;
      useDismiss(ctx.open, [ctx.root, ref], function (reason) {
        ctx.setOpen(false);
        if (reason === 'escape' && ctx.trigger.current) ctx.trigger.current.focus();
      });
      /* Focus the first checkbox once the panel is placed (it is hidden until then), if opened from the trigger. */
      useEffect(function () {
        if (!ctx.open || !placed || !ref.current || props.autoFocus === false) return;
        var first = ref.current.querySelector('[data-ms-col="0"]');
        if (first && document.activeElement && ctx.root.current && ctx.root.current.contains(document.activeElement)) first.focus({ preventScroll: true });
      }, [ctx.open, placed]);
      if (!ctx.open) return null;
      function onKeyDown(e) {
        if (e.key === 'Tab') {
          /* Tabbing off either end closes the panel and continues from the trigger, as if it sat right after it. */
          var tabbable = Array.prototype.filter.call(ref.current.querySelectorAll('input:not([disabled]),button:not([disabled])'), function (el) { return el.tabIndex >= 0; });
          var at = tabbable.indexOf(document.activeElement);
          var t = ctx.trigger.current;
          if (t && ((e.shiftKey && at === 0) || (!e.shiftKey && at === tabbable.length - 1))) {
            if (e.shiftKey) e.preventDefault();
            t.focus();
            ctx.setOpen(false);
          }
          return;
        }
        var grid = multiSelectCells(ref.current);
        var r = -1, c = -1;
        grid.forEach(function (cells, i) { var k = cells.indexOf(document.activeElement); if (k >= 0) { r = i; c = k; } });
        if (r < 0) return;
        var nr = r, nc = c;
        if (e.key === 'ArrowDown') nr = Math.min(grid.length - 1, r + 1);
        else if (e.key === 'ArrowUp') nr = Math.max(0, r - 1);
        else if (e.key === 'ArrowLeft') nc = 0;
        else if (e.key === 'ArrowRight') nc = 1;
        else if (e.key === 'Home') nr = 0;
        else if (e.key === 'End') nr = grid.length - 1;
        else if (e.key === 'Enter' && c === 0) { e.preventDefault(); document.activeElement.click(); return; }
        else return;
        e.preventDefault();
        if (grid[nr][nc]) grid[nr][nc].focus();
      }
      return portal(h('div', {
        ref: ref, id: ctx.contentId, role: 'dialog', 'aria-label': props['aria-label'] || 'Options',
        className: cx('hy-multiselect__content', (pos ? pos.side === 'top' : false) && 'hy-multiselect__content--top', props.align === 'end' && 'hy-multiselect__content--end', props.className),
        style: floatingStyle(pos, Object.assign({ width: props.width }, props.style)),
        onKeyDown: onKeyDown
      }, props.children));
    }

    function MultiSelectRow(props) {
      var all = props.totalCount != null && props.selectedCount === props.totalCount;
      var action = !all && props.checked ? 'Select All' : 'Only';
      function act() {
        if (action === 'Only') { if (props.onSelectOnly) props.onSelectOnly(); }
        else if (props.onSelectAll) props.onSelectAll();
      }
      return h('div', { className: cx('hy-multiselect__row', props.disabled && 'is-disabled', props.className) },
        h('span', { className: 'hy-multiselect__checkcell' },
          h(HY.Checkbox, {
            checked: !!props.checked, disabled: props.disabled, 'aria-label': props.name, 'data-ms-col': '0',
            onChange: function (e) { if (props.onChange) props.onChange(e.target.checked); }
          })),
        h('button', {
          type: 'button', className: 'hy-multiselect__name', 'data-ms-col': '1', disabled: props.disabled,
          'aria-label': props.name + '. ' + action, onClick: act
        },
          h('span', { className: 'hy-multiselect__text' }, props.label || props.name),
          h('span', { className: 'hy-multiselect__action', 'aria-hidden': 'true' }, action)));
    }

    function multiSelectItems(items) {
      return (items || []).map(function (it) {
        return typeof it === 'object' ? { value: String(it.value), label: it.label != null ? it.label : String(it.value), disabled: it.disabled } : { value: String(it), label: String(it) };
      });
    }

    /* The shortcut: a trigger that names the selection, and one row per item. */
    function MultiSelect(props) {
      return props.items ? h(MultiSelectQuick, props) : h(MultiSelectRoot, props);
    }

    function MultiSelectQuick(props) {
      var items = multiSelectItems(props.items);
      var all = items.map(function (i) { return i.value; });
      var vs = useControllable(props.value, props.defaultValue !== undefined ? props.defaultValue : all, props.onChange);
      var value = (vs[0] || []).map(String);
      function set(next) { vs[1](all.filter(function (v) { return next.indexOf(v) >= 0; })); }
      var label = props.label || 'Items';
      var count = value.length;
      var text = count === 1
        ? items.filter(function (i) { return i.value === value[0]; })[0].label
        : count === 0 ? 'No ' + label : count === all.length ? 'All ' + label : label;
      return h(MultiSelectRoot, { open: props.open, defaultOpen: props.defaultOpen, onOpenChange: props.onOpenChange, className: props.className, style: props.style },
        h(MultiSelectTrigger, { size: props.size, disabled: props.disabled },
          h('span', { className: 'hy-multiselect__summary' }, text,
            count > 1 && count < all.length ? h('span', { className: 'hy-multiselect__count' }, count) : null)),
        h(MultiSelectContent, { align: props.align, 'aria-label': label, width: props.width },
          items.map(function (it) {
            var on = value.indexOf(it.value) >= 0;
            return h(MultiSelectRow, {
              key: it.value, name: it.label, checked: on, disabled: it.disabled,
              selectedCount: count, totalCount: all.length,
              onChange: function (c) { set(c ? value.concat([it.value]) : value.filter(function (v) { return v !== it.value; })); },
              onSelectOnly: function () { set([it.value]); },
              onSelectAll: function () { set(all); }
            });
          })));
    }

    MultiSelect.Root = MultiSelectRoot;
    MultiSelect.Trigger = MultiSelectTrigger;
    MultiSelect.Content = MultiSelectContent;
    MultiSelect.Row = MultiSelectRow;

    define('MultiSelect', MultiSelect);
    define('MultiSelectRoot', MultiSelectRoot);
    define('MultiSelectTrigger', MultiSelectTrigger);
    define('MultiSelectContent', MultiSelectContent);
    define('MultiSelectRow', MultiSelectRow);
  })();

  /* ---- QueryBar ---- */
  (function () {
    /* QueryBar: a QueryInput with a row of FilterMenus that read and write the same
       query, like GitHub's issue filters. <QueryBar value onChange qualifiers placeholder><QueryBar.Menu qualifier="label" label="Labels"/></QueryBar>.
       The query text is the only state: each menu reads its value off it and writes back with the helpers in _query.js
       (queryMenu, withQueryMenu, querySingle, withQuerySingle), which touch only that qualifier's terms. The announcements
       come from FilterMenu itself. The menus wrap onto more rows when they don't fit (wrap, default true); wrap={false}
       keeps them on one row in a Scroller that scrolls sideways. */
    var QueryBarContext = React.createContext(null);

    function QueryBarMenu(props) {
      var bar = React.useContext(QueryBarContext);
      if (!bar) return null;
      var name = props.qualifier;
      var def = null;
      bar.qualifiers.forEach(function (q) { if (q.name === name) def = q; });
      var rest = omit(props, ['qualifier', 'value', 'defaultValue', 'onChange', 'excludable', 'noneLabel', 'size', 'children']);
      var size = props.size || bar.size;
      function write(next) { if (next !== bar.value) bar.onChange(next); }

      if (props.single) {
        var fallback = props.defaultOption == null ? '' : String(props.defaultOption);
        return h(HY.FilterMenu, Object.assign({}, rest, {
          size: size,
          value: querySingle(bar.value, name, fallback, bar.qualifiers),
          onChange: function (v) { write(withQuerySingle(bar.value, name, v, fallback, bar.qualifiers)); }
        }), props.children);
      }
      return h(HY.FilterMenu, Object.assign({}, rest, {
        size: size,
        excludable: !!(def && def.excludable) && props.excludable !== false,
        noneLabel: def && def.none ? props.noneLabel : undefined,
        value: queryMenu(bar.value, name, bar.qualifiers),
        onChange: function (v) { write(withQueryMenu(bar.value, name, v, bar.qualifiers)); }
      }), props.children);
    }

    function QueryBar(props) {
      var vs = useControllable(props.value, props.defaultValue == null ? '' : String(props.defaultValue), props.onChange);
      var value = vs[0] == null ? '' : String(vs[0]);
      var size = props.size === 'small' || props.size === 'large' ? props.size : 'medium';
      var qualifiers = props.qualifiers || [];
      var rest = omit(props, ['value', 'defaultValue', 'onChange', 'qualifiers', 'size', 'className', 'children', 'wrap']);
      var ctx = { value: value, onChange: vs[1], qualifiers: qualifiers, size: size };
      var menus = React.Children.toArray(props.children);
      var wrap = props.wrap !== false;

      var menuGroup = null;
      if (menus.length) {
        var bound = h(QueryBarContext.Provider, { value: ctx }, menus);
        menuGroup = h('div', { className: 'hy-querybar__menus', role: 'group', 'aria-label': 'Filters' },
          wrap ? h('div', { className: 'hy-querybar__row' }, bound)
            : h(HY.Scroller, { overflow: 'x', childrenContainerClassName: 'hy-querybar__row' }, bound));
      }

      return h('div', { className: cx('hy-querybar', props.className) },
        h('div', { className: 'hy-querybar__bar' },
          h('div', { className: 'hy-querybar__field' },
            h(HY.QueryInput, Object.assign({}, rest, { value: value, onChange: vs[1], qualifiers: qualifiers, size: size }))),
          menuGroup));
    }
    QueryBar.Menu = QueryBarMenu;

    define('QueryBar', QueryBar);
    define('QueryBarMenu', QueryBarMenu);
  })();

  /* ---- QueryInput ---- */
  (function () {
    /* QueryInput: a text field whose text is the value, with suggestions that complete the word at the caret. <QueryInput value onChange qualifiers /> (or `defaultValue` to let it keep the text), or give it `suggestions(text, caret)`.
       A suggestion carries the whole query after picking it, so the field knows no syntax: the helper in _query.js
       (suggestQuery, parseQuery) is what `qualifiers` turns into suggestions and problems.
       Keys: the field owns Up, Down, Enter, Tab and Escape only while the list is open; otherwise the app's onKeyDown gets
       them. It never reverts the text and never blurs the field. */
    function queryHighlight(label, match) {
      var a = match ? Math.max(0, Math.min(match[0], label.length)) : 0;
      var b = match ? Math.max(a, Math.min(match[1], label.length)) : 0;
      if (b <= a) return label;
      return [label.slice(0, a), h('mark', { key: 'm', className: 'hy-query__match' }, label.slice(a, b)), label.slice(b)];
    }

    function QueryHelp(p) {
      var qualifiers = p.qualifiers;
      var hasNone = qualifiers.some(function (q) { return q.none; });
      var code = function (t) { return h('code', { className: 'hy-query__code' }, t); };
      return h(HY.Popover, {
        trigger: h(HY.Button, { svgOnly: true, variant: 'tertiary', size: p.size, 'aria-label': 'Query Help', className: 'hy-query__help' }, h(HY.Icon, { name: 'circle-help' })),
        label: 'Query Help', position: 'bottom-end', width: 320
      },
        h('div', { className: 'hy-query__guide' },
          h('dl', { className: 'hy-query__qualifiers' }, qualifiers.map(function (q) {
            return h(React.Fragment, { key: q.name }, h('dt', null, q.name + ':'), h('dd', null, q.help));
          })),
          h('p', null, code('a,b'), ' matches either value. Different qualifiers must all match, and so must the same one typed twice. A leading ', code('-'), ' leaves values out, where a qualifier allows it. Double quotes keep spaces and commas in a value.',
            hasNone ? h(React.Fragment, null, ' ', code('no:name'), ' matches what has no value for that qualifier.') : null, ' Other words are free text.')));
    }

    function QueryInput(props) {
      var auto = useId();
      var id = props.id || auto;
      var listId = id + '-list';
      var size = props.size === 'small' || props.size === 'large' ? props.size : 'medium';
      var vs = useControllable(props.value, props.defaultValue == null ? '' : String(props.defaultValue), props.onChange);
      var value = vs[0] == null ? '' : String(vs[0]);
      var qualifiers = props.qualifiers;
      var cs = useState(null), caret = cs[0], setCaret = cs[1];
      var as = useState(0), active = as[0], setActive = as[1];
      var ds = useState(false), dismissed = ds[0], setDismissed = ds[1];
      var input = useRef(null), field = useRef(null), listRef = useRef(null);
      /* Where the caret goes once a picked suggestion is in the field. */
      var placeCaret = useRef(null);

      var suggestions = caret === null || dismissed || props.disabled ? []
        : props.suggestions ? props.suggestions(value, caret)
        : qualifiers ? suggestQuery(value, caret, qualifiers) : [];
      var open = suggestions.length > 0;
      var current = Math.min(active, suggestions.length - 1);

      useLayoutEffect(function () {
        if (placeCaret.current === null) return;
        if (input.current) input.current.setSelectionRange(placeCaret.current, placeCaret.current);
        placeCaret.current = null;
      });
      useEffect(function () {
        if (!open || !listRef.current) return;
        var el = listRef.current.querySelector('[data-index="' + current + '"]');
        if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
      }, [current, open]);
      /* useFloating re-measures on any scroll: nudge it when the list's height or the field's width changes. */
      var fieldWidth = open && field.current ? field.current.offsetWidth : undefined;
      useLayoutEffect(function () {
        if (open && listRef.current) listRef.current.dispatchEvent(new Event('scroll'));
      }, [open, suggestions.length, fieldWidth]);
      var pos = useFloating(open, field, listRef, { side: 'bottom', align: 'start', offset: 4 });

      function edit(text, at, close) {
        vs[1](text);
        setCaret(at);
        setActive(0);
        setDismissed(close);
      }
      function pick(i) {
        var s = suggestions[i];
        if (!s) return;
        placeCaret.current = s.caret;
        edit(s.text, s.caret, !s.keepOpen);
        if (input.current) input.current.focus();
      }
      function onKeyDown(e) {
        var n = suggestions.length;
        if (open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
          e.preventDefault();
          setActive((current + (e.key === 'ArrowDown' ? 1 : n - 1)) % n);
        } else if (open && (e.key === 'Enter' || e.key === 'Tab') && !e.shiftKey && !(e.nativeEvent && e.nativeEvent.isComposing)) {
          e.preventDefault();
          pick(current);
        } else if (open && e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          setDismissed(true);
        } else if (props.onKeyDown) props.onKeyDown(e);
      }

      /* Problems of terms that are finished: the one the caret is in is still being typed. */
      var problems = qualifiers ? parseQuery(value, qualifiers).problems.filter(function (p) {
        return caret === null || caret < p.span[0] || caret > p.span[1];
      }) : [];
      var problemsId = id + '-problems';
      var showHelp = props.help !== false && qualifiers && qualifiers.length > 0;
      var rest = omit(props, ['value', 'defaultValue', 'onChange', 'suggestions', 'qualifiers', 'help', 'size', 'className', 'id', 'onKeyDown', 'style']);

      return h('div', { className: cx('hy-query', props.className), style: props.style },
        h('div', { className: 'hy-query__row' },
          h('div', { ref: field, className: 'hy-query__field' },
            h(HY.Input, Object.assign({}, rest, {
              ref: input, id: id, size: size, value: value, role: 'combobox', autoComplete: 'off', spellCheck: false,
              'aria-autocomplete': 'list', 'aria-expanded': open, 'aria-controls': open ? listId : undefined,
              'aria-activedescendant': open ? id + '-opt-' + current : undefined,
              'aria-describedby': cx(props['aria-describedby'], problems.length ? problemsId : null) || undefined,
              onChange: function (e) { edit(e.target.value, e.target.selectionStart == null ? e.target.value.length : e.target.selectionStart, false); },
              onSelect: function (e) { if (document.activeElement === e.currentTarget) setCaret(e.currentTarget.selectionStart); },
              onFocus: function (e) { setCaret(e.currentTarget.selectionStart); setDismissed(false); },
              onBlur: function () { setCaret(null); },
              onKeyDown: onKeyDown
            }))),
          showHelp ? h(QueryHelp, { qualifiers: qualifiers, size: size }) : null),
        problems.length ? h(HY.Note, { id: problemsId, variant: 'warning', size: 'small', role: 'status' }, problems.map(function (p) { return p.message; }).join(' · ')) : null,
        open ? portal(h('ul', {
          ref: listRef, id: listId, role: 'listbox', 'aria-label': 'Suggestions',
          className: cx('hy-query__list', pos && 'hy-query__list--' + pos.side),
          style: floatingStyle(pos, { width: fieldWidth, minWidth: 'min(200px, calc(100vw - 16px))' }),
          onMouseDown: function (e) { e.preventDefault(); }
        }, suggestions.map(function (s, i) {
          return h('li', {
            key: i + ':' + s.text, id: id + '-opt-' + i, role: 'option', 'data-index': i, 'aria-selected': i === current,
            className: cx('hy-query__option', i === current && 'is-active'),
            onMouseMove: function () { if (active !== i) setActive(i); },
            onClick: function () { pick(i); }
          },
            h('span', { className: 'hy-query__label' }, queryHighlight(s.label, s.match)),
            s.description ? h('span', { className: 'hy-query__desc' }, s.description) : null);
        }))) : null,
        h('span', { className: 'hy-sr', 'aria-live': 'polite' }, open ? suggestions.length + (suggestions.length === 1 ? ' suggestion' : ' suggestions') : ''));
    }

    define('QueryInput', QueryInput);
  })();

  /* ---- Radio ---- */
  (function () {
    /* Radio: a radio. A standalone Radio, or RadioGroup with RadioGroupItem (or useRadio) sharing one name and value. */
    var RadioContext = React.createContext(null);

    function RadioGroup(props) {
      var auto = useId();
      var name = props.name || auto;
      var labelId = auto + '-label';
      var state = useControllable(props.value, props.defaultValue, props.onChange);
      var ctx = { name: name, value: state[0], onChange: state[1], disabled: !!props.disabled, required: !!props.required };
      var rest = omit(props, ['label', 'name', 'value', 'defaultValue', 'onChange', 'disabled', 'required', 'children', 'className', 'horizontal']);
      return h(RadioContext.Provider, { value: ctx },
        h('div', Object.assign({}, rest, {
          role: 'radiogroup',
          className: cx('hy-radio-group', props.horizontal && 'hy-radio-group--horizontal', props.className),
          'aria-labelledby': props.label && !props['aria-label'] ? labelId : props['aria-labelledby'],
          'aria-required': props.required ? 'true' : undefined,
          'aria-disabled': props.disabled ? 'true' : undefined
        }),
          props.label ? h('span', { id: labelId, className: 'hy-sr' }, props.label) : null,
          props.children)
      );
    }

    function Radio(props) {
      var ctx = React.useContext(RadioContext);
      var inGroup = !!ctx && props.checked === undefined;
      var checked = inGroup ? ctx.value !== undefined && ctx.value === props.value : props.checked;
      var disabled = !!props.disabled || (!!ctx && ctx.disabled);
      var rest = omit(props, ['children', 'className', 'checked', 'onChange', 'disabled', 'name', 'required', 'style']);
      function onChange(e) {
        if (inGroup) ctx.onChange(props.value);
        if (props.onChange) props.onChange(e);
      }
      return h('label', { className: cx('hy-radio', disabled && 'hy-radio--disabled', props.className), style: props.style },
        h('input', Object.assign({ type: 'radio', className: 'hy-radio__input' }, rest, {
          name: inGroup ? ctx.name : props.name,
          checked: checked === undefined ? undefined : !!checked,
          disabled: disabled,
          required: inGroup ? ctx.required : props.required,
          onChange: inGroup || props.onChange ? onChange : (checked !== undefined ? function () {} : undefined)
        })),
        h('span', { className: 'hy-radio__circle', 'aria-hidden': 'true' }),
        props.children != null && props.children !== false ? h('span', { className: 'hy-radio__label' }, props.children) : null
      );
    }

    function RadioGroupItem(props) { return h(Radio, props); }

    /* For custom item layouts inside a RadioGroup: returns the bare radio and whether it is selected. */
    function useRadio(opts) {
      var ctx = React.useContext(RadioContext);
      var o = opts || {};
      return {
        checked: !!ctx && ctx.value !== undefined && ctx.value === o.value,
        component: h(Radio, { value: o.value, disabled: o.disabled, 'aria-label': o['aria-label'], id: o.id })
      };
    }

    Radio.Group = RadioGroup;
    Radio.GroupItem = RadioGroupItem;
    Radio.useRadio = useRadio;

    define('Radio', Radio);
    define('RadioGroup', RadioGroup);
    define('RadioGroupItem', RadioGroupItem);
    define('useRadio', useRadio);
  })();

  /* ---- SearchInput ---- */
  (function () {
    /* SearchInput: a ClearableInput with a search icon (or a spinner while loading) and type="search". */
    var SearchInput = React.forwardRef(function SearchInput(props, ref) {
      var icon = props.prefix != null ? props.prefix
        : props.loading ? h(HY.Spinner, { size: 16 })
        : h(Glyph, { name: 'search', size: 16 });
      return h(HY.ClearableInput, Object.assign({ type: 'search', autoComplete: 'off', spellCheck: false }, omit(props, ['loading', 'prefix', 'className']), {
        ref: ref,
        className: cx('hy-search', props.className),
        prefix: icon,
        prefixStyling: false,
        'aria-busy': props.loading ? 'true' : undefined
      }));
    });

    define('SearchInput', SearchInput);
  })();

  /* ---- Select ---- */
  (function () {
    /* Select: a native select. Three sizes, prefix, a suffix that replaces the chevron, placeholder, label, hint and error. */
    function setRef(ref, el) {
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    }

    function isMessage(v) { return v != null && v !== false && v !== true && v !== ''; }
    function has(node) { return node != null && node !== false; }

    var Select = React.forwardRef(function Select(props, ref) {
      var auto = useId();
      var id = props.id || auto;
      var ids = fieldIds(id);
      var size = props.size || 'medium';
      var errText = isMessage(props.error) ? props.error : null;
      var placeholder = props.placeholder;
      var controlled = props.value !== undefined;
      var initial = props.defaultValue !== undefined ? props.defaultValue : (placeholder ? '' : undefined);
      var st = useState(initial);
      var current = controlled ? props.value : st[0];
      var empty = !!placeholder && !props.multiple && (current === '' || current == null);
      var rest = omit(props, ['label', 'hint', 'error', 'options', 'size', 'className', 'wrapperClassName', 'labelPosition', 'id', 'children', 'placeholder', 'prefix', 'suffix', 'value', 'defaultValue', 'onChange']);

      var opts = props.options ? props.options.map(function (o) {
        var v = typeof o === 'string' ? o : o.value;
        return h('option', { key: v, value: v, disabled: o.disabled }, typeof o === 'string' ? o : o.label);
      }) : props.children;

      function onChange(e) {
        if (!controlled) st[1](e.target.value);
        if (props.onChange) props.onChange(e);
      }

      return h('div', { className: cx('hy-field', 'hy-field--' + size, props.label && props.labelPosition === 'inline' && 'hy-field--inline-label', props.className) },
        props.label ? h('label', { className: 'hy-field__label', htmlFor: id }, props.label) : null,
        h('div', {
          className: cx('hy-select', 'hy-input--' + size, 'hy-select--' + size, props.error && 'hy-select--error', props.disabled && 'hy-select--disabled',
            has(props.prefix) && 'hy-select--prefix', empty && 'hy-select--placeholder', props.wrapperClassName)
        },
          has(props.prefix) ? h('span', { className: 'hy-select__prefix', 'aria-hidden': 'true' }, props.prefix) : null,
          h('select', Object.assign({ id: id }, rest, controlled ? { value: props.value } : { defaultValue: initial }, {
            ref: function (el) { setRef(ref, el); },
            onChange: onChange,
            'aria-invalid': props.error ? 'true' : undefined,
            'aria-describedby': cx(props['aria-describedby'], errText ? ids.error : (props.hint ? ids.hint : null)) || undefined
          }), placeholder ? h('option', { value: '', disabled: true }, placeholder) : null, opts),
          has(props.suffix)
            ? h('span', { className: 'hy-select__suffix', 'aria-hidden': 'true' }, props.suffix)
            : h(Glyph, { name: 'chevron', className: 'hy-select__chevron' })
        ),
        errText
          ? h('div', { role: 'alert', className: 'hy-field__alert' }, h(FieldMessage, { ids: ids, error: errText }))
          : h(FieldMessage, { ids: ids, hint: props.hint })
      );
    });

    define('Select', Select);
  })();

  /* ---- Slider ---- */
  (function () {
    /* Slider: pick a number (one thumb) or a range (two thumbs) on a track, with optional number fields.
       Each thumb is a native <input type="range">, so keyboard, screen-reader and form behaviour come for free;
       the visible rail, fill and thumbs are drawn on top and follow the inputs.
       Values may be a number or an array (such as [50]); onValueChange returns the same shape. */
    var SLIDER_HIT = 16; /* width of the native thumb hit area, in px */

    function sliderSnap(v, min, max, step) {
      if (isNaN(v)) return min;
      var s = step > 0 ? Math.round((v - min) / step) * step + min : v;
      var dec = String(step).split('.')[1];
      if (dec) s = Number(s.toFixed(dec.length));
      return Math.min(max, Math.max(min, s));
    }

    function Slider(props) {
      var auto = useId();
      var id = props.id || auto;
      var min = props.min != null ? props.min : 0;
      var max = props.max != null ? props.max : 100;
      var step = props.step != null ? props.step : 1;
      var source = props.value !== undefined ? props.value : props.defaultValue;
      var asArray = Array.isArray(source);
      var st = useState(function () {
        var d = props.defaultValue !== undefined ? props.defaultValue : min;
        return Array.isArray(d) ? d.slice() : [d];
      });
      var values = props.value !== undefined ? (Array.isArray(props.value) ? props.value : [props.value]) : st[0];
      var latest = useRef(values);
      latest.current = values;
      var ds = useState({});
      var drafts = ds[0], setDrafts = ds[1];
      var range = values.length > 1;
      var label = props.label;
      var labelId = id + '-label';

      function emit(next) {
        if (props.value === undefined) st[1](next);
        latest.current = next;
        if (props.onValueChange) props.onValueChange(asArray ? next : next[0]);
        if (props.onChange) props.onChange(asArray ? next : next[0]);
      }
      function commit() {
        if (props.onValueCommitted) props.onValueCommitted(asArray ? latest.current : latest.current[0]);
      }
      function setAt(i, raw) {
        var v = sliderSnap(Number(raw), min, max, step);
        var next = values.slice();
        if (range) {
          if (i === 0) v = Math.min(v, next[1]);
          else v = Math.max(v, next[0]);
        }
        if (next[i] === v) return;
        next[i] = v;
        emit(next);
      }
      function pct(v) { return max === min ? 0 : (v - min) / (max - min) * 100; }
      function pos(v) {
        var p = pct(v);
        return 'calc(' + p + '% + ' + ((0.5 - p / 100) * SLIDER_HIT) + 'px)';
      }
      var lo = range ? values[0] : min;
      var hi = range ? values[values.length - 1] : values[0];
      var thumbNames = range ? ['Minimum', 'Maximum'] : [null];

      function numField(i, which) {
        var key = String(i);
        var shown = drafts[key] !== undefined ? drafts[key] : String(values[i]);
        function done() {
          if (drafts[key] === undefined) return;
          var n = drafts[key] === '' ? values[i] : Number(drafts[key]);
          setDrafts(omit(drafts, [key]));
          setAt(i, n);
          commit();
        }
        return h('input', {
          type: 'text', inputMode: 'decimal', className: 'hy-slider__num', value: shown, disabled: props.disabled,
          'aria-label': (label || props['aria-label'] || 'Value') + (range ? ' ' + thumbNames[i].toLowerCase() : ''),
          onChange: function (e) { var o = {}; o[key] = e.target.value; setDrafts(Object.assign({}, drafts, o)); },
          onBlur: done,
          onKeyDown: function (e) {
            if (e.key === 'Enter') { e.preventDefault(); done(); }
            else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              e.preventDefault();
              setAt(i, values[i] + (e.key === 'ArrowUp' ? step : -step) * (e.shiftKey ? 10 : 1));
              setDrafts(omit(drafts, [key]));
            }
          },
          'data-which': which
        });
      }

      return h('div', {
        className: cx('hy-slider', range && 'hy-slider--range', props.disabled && 'hy-slider--disabled', props.className),
        style: props.style
      },
        label ? h('div', { className: 'hy-slider__label', id: labelId }, label) : null,
        h('div', { className: 'hy-slider__row' },
          props.showStartInput ? numField(0, 'start') : null,
          h('div', { className: 'hy-slider__track', style: { width: props.width != null ? props.width : 216 } },
            h('span', { className: 'hy-slider__rail', 'aria-hidden': 'true' },
              h('span', { className: 'hy-slider__fill', style: { left: range ? pos(lo) : 0, right: 'calc(100% - ' + pos(hi) + ')' } })),
            values.map(function (v, i) {
              var valueText = props.formatValue ? props.formatValue(v) : String(v);
              return h(React.Fragment, { key: i },
                h('input', {
                  type: 'range', className: 'hy-slider__range', id: i === 0 ? id : undefined,
                  min: min, max: max, step: step, value: v, disabled: props.disabled,
                  name: props.name ? (range ? props.name + '[' + i + ']' : props.name) : undefined,
                  'aria-labelledby': label && !range ? labelId : undefined,
                  'aria-label': range ? ((label || props['aria-label'] || 'Range') + ' ' + thumbNames[i].toLowerCase()) : (label ? undefined : props['aria-label']),
                  'aria-valuetext': props.formatValue ? valueText : undefined,
                  onChange: function (e) { setAt(i, e.target.value); },
                  onPointerUp: commit,
                  onKeyUp: function (e) { if (/Arrow|Page|Home|End/.test(e.key)) commit(); }
                }),
                h('span', { className: 'hy-slider__thumb', style: { left: pos(v) }, 'aria-hidden': 'true' }));
            })),
          props.showEndInput ? numField(values.length - 1, 'end') : null));
    }

    define('Slider', Slider);
  })();

  /* ---- Switch ---- */
  (function () {
    /* Switch: a segmented control that picks one of 2–3 options (radio semantics).
       <Switch name size value defaultValue onChange disabled><SwitchControl label value icon defaultChecked disabled/></Switch>
       Each control is a native radio inside a <label>, so arrow keys, forms and screen readers work as for any radio group.
       Uncontrolled by default: put defaultChecked on exactly one control (or defaultValue on Switch). */
    var SwitchContext = React.createContext(null);

    function Switch(props) {
      var auto = useId();
      var hasValue = props.value !== undefined || props.defaultValue !== undefined;
      var st = useState(props.defaultValue);
      var value = props.value !== undefined ? props.value : st[0];
      var size = props.size === 'small' || props.size === 'large' ? props.size : 'medium';
      var rest = omit(props, ['name', 'size', 'value', 'defaultValue', 'onChange', 'disabled', 'children', 'className']);
      var ctx = {
        name: props.name || 'hy-switch' + auto,
        size: size,
        disabled: props.disabled,
        hasValue: hasValue,
        value: value,
        select: function (next, e) {
          if (props.value === undefined) st[1](next);
          if (props.onChange) props.onChange(next, e);
        }
      };
      return h(SwitchContext.Provider, { value: ctx },
        h('div', Object.assign({ role: 'radiogroup' }, rest, {
          className: cx('hy-switch', 'hy-switch--' + size, props.disabled && 'hy-switch--disabled', props.className)
        }), props.children));
    }

    function SwitchControl(props) {
      var ctx = React.useContext(SwitchContext) || { name: undefined, size: 'medium', hasValue: false, select: function () {} };
      var value = props.value !== undefined ? String(props.value) : String(props.label);
      var disabled = !!(props.disabled || ctx.disabled);
      var size = props.size || ctx.size;
      var inputProps = {
        type: 'radio', className: 'hy-switch__input', name: ctx.name, value: value, disabled: disabled,
        'aria-describedby': props['aria-describedby'],
        onChange: function (e) {
          if (!e.target.checked) return;
          ctx.select(value, e);
          if (props.onChange) props.onChange(e);
        }
      };
      if (props.checked !== undefined) inputProps.checked = !!props.checked;
      else if (ctx.hasValue) inputProps.checked = ctx.value !== undefined && String(ctx.value) === value;
      else inputProps.defaultChecked = props.defaultChecked;
      var iconOnly = props.icon && props.hideLabel !== false;
      return h('label', {
        className: cx('hy-switch__control', 'hy-switch__control--' + size, props.icon && 'hy-switch__control--icon', disabled && 'is-disabled', props.className),
        style: props.style, title: props.title
      },
        h('input', inputProps),
        h('span', { className: 'hy-switch__face' },
          props.icon ? h('span', { className: 'hy-switch__icon', 'aria-hidden': 'true' }, props.icon) : null,
          h('span', { className: iconOnly ? 'hy-sr' : 'hy-switch__label' }, props.label)));
    }

    Switch.Control = SwitchControl;

    define('Switch', Switch);
    define('SwitchControl', SwitchControl);
  })();

  /* ---- Textarea ---- */
  (function () {
    /* Textarea: a multi-line field. Three sizes, label, hint and error, matching Input. */
    function setRef(ref, el) {
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    }

    function isMessage(v) { return v != null && v !== false && v !== true && v !== ''; }

    var Textarea = React.forwardRef(function Textarea(props, ref) {
      var auto = useId();
      var id = props.id || auto;
      var ids = fieldIds(id);
      var size = props.size || 'medium';
      var errText = isMessage(props.error) ? props.error : null;
      var rest = omit(props, ['label', 'hint', 'error', 'size', 'className', 'wrapperClassName', 'mono', 'id']);
      return h('div', { className: cx('hy-field', 'hy-field--' + size, props.mono && 'hy-field--mono', props.className) },
        props.label ? h('label', { className: 'hy-field__label', htmlFor: id }, props.label) : null,
        h('div', { className: cx('hy-textarea', 'hy-textarea--' + size, props.error && 'hy-textarea--error', props.disabled && 'hy-textarea--disabled', props.wrapperClassName) },
          h('textarea', Object.assign({ id: id, rows: 4 }, rest, {
            ref: function (el) { setRef(ref, el); },
            'aria-invalid': props.error ? 'true' : undefined,
            'aria-describedby': cx(props['aria-describedby'], errText ? ids.error : (props.hint ? ids.hint : null)) || undefined
          }))
        ),
        errText
          ? h('div', { role: 'alert', className: 'hy-field__alert' }, h(FieldMessage, { ids: ids, error: errText }))
          : h(FieldMessage, { ids: ids, hint: props.hint })
      );
    });

    define('Textarea', Textarea);
  })();

  /* ---- ThemeSwitcher ---- */
  (function () {
    var THEME_OPTIONS = [
      { value: 'system', label: 'System', icon: 'monitor' },
      { value: 'light', label: 'Light', icon: 'sun' },
      { value: 'dark', label: 'Dark', icon: 'moon' }
    ];
    function themeMql() { return window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null; }
    /* Resolve (System follows prefers-color-scheme) and apply in one self-contained function: themeScript() serialises it,
       so it must not use anything outside its own body. `attribute` is 'data-theme', 'class', 'both' or an array of those. */
    function themeApply(v, attribute) {
      var list = typeof attribute === 'string' ? [attribute] : (attribute || ['data-theme']);
      var useData = false, useClass = false, i;
      for (i = 0; i < list.length; i++) {
        if (list[i] === 'both') { useData = true; useClass = true; }
        else if (list[i] === 'class') useClass = true;
        else useData = true;
      }
      var r = v;
      if (r !== 'light' && r !== 'dark') {
        var mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
        r = mql && mql.matches ? 'dark' : 'light';
      }
      var el = document.documentElement;
      if (useData) el.setAttribute('data-theme', r); else el.removeAttribute('data-theme');
      if (el.classList) {
        el.classList.remove(useClass ? (r === 'dark' ? 'light' : 'dark') : 'dark');
        if (useClass) el.classList.add(r); else el.classList.remove('light');
      }
      el.style.colorScheme = r;
    }
    function themeValid(v) { return v === 'system' || v === 'light' || v === 'dark'; }
    function themeInitial(storageKey) {
      if (storageKey) {
        try { var s = window.localStorage.getItem(storageKey); if (themeValid(s)) return s; } catch (e) { /* storage blocked */ }
      }
      var el = document.documentElement;
      var cur = el.getAttribute('data-theme');
      if (themeValid(cur)) return cur;
      if (el.classList) { if (el.classList.contains('dark')) return 'dark'; if (el.classList.contains('light')) return 'light'; }
      return 'system';
    }

    /* The inline pre-paint script: apply the saved theme before the page paints so a reload never flashes the wrong one.
       Built from themeApply itself, so it resolves System and writes the attribute/class exactly as the component does. */
    function themeScript(options) {
      var o = options || {};
      var key = o.storageKey === undefined ? 'theme' : o.storageKey;
      var attr = o.attribute === undefined ? 'data-theme' : o.attribute;
      var json = function (x) { return JSON.stringify(x).replace(/</g, '\\u003c'); };
      return '(function(){try{var apply=' + themeApply.toString() + ';var v=null;' +
        (key ? 'try{v=window.localStorage.getItem(' + json(key) + ')}catch(e){}' : '') +
        'if(v!=="light"&&v!=="dark")v="system";apply(v,' + json(attr) + ')}catch(e){}})()';
    }

    /* Three radios (System, Light, Dark), or with variant="cycle" one button that cycles through them, that set data-theme
       and/or the .dark/.light class (attribute) plus color-scheme on <html>. It reads the current theme on
       mount but changes nothing then; after that a pick applies, and while System is the value it follows the OS setting live. */
    function ThemeSwitcher(props) {
      var storageKey = props.storageKey === undefined ? 'theme' : props.storageKey;
      var initial = useState(function () { return props.defaultValue || themeInitial(storageKey); })[0];
      var ctl = useControllable(props.value, initial, props.onChange);
      var value = ctl[0];
      var first = useRef(true);
      var name = 'hy-theme-' + useId();

      useEffect(function () {
        if (first.current) { first.current = false; return; }
        themeApply(value, props.attribute);
        if (storageKey) { try { window.localStorage.setItem(storageKey, value); } catch (e) { /* storage blocked */ } }
      }, [value]);

      useEffect(function () {
        var mql = themeMql();
        if (value !== 'system' || !mql) return;
        function onChange() { themeApply('system', props.attribute); }
        if (mql.addEventListener) mql.addEventListener('change', onChange); else mql.addListener(onChange);
        return function () { if (mql.removeEventListener) mql.removeEventListener('change', onChange); else mql.removeListener(onChange); };
      }, [value]);

      if (props.variant === 'cycle') {
        var idx = 0;
        THEME_OPTIONS.forEach(function (o, i) { if (o.value === value) idx = i; });
        var cur = THEME_OPTIONS[idx], label = 'Theme: ' + cur.label;
        /* size maps straight onto Button's sizes (medium 36px, small 32px); Button draws its icons at 16px at both. */
        var btn = h(HY.Button, {
          variant: 'tertiary', svgOnly: true, size: props.size === 'small' ? 'small' : 'medium',
          className: cx('hy-theme-cycle', props.className), style: props.style, disabled: props.disabled,
          'aria-label': label, onClick: function () { ctl[1](THEME_OPTIONS[(idx + 1) % THEME_OPTIONS.length].value); }
        }, h(HY.Icon, { name: cur.icon, size: 16 }));
        if (props.tooltip === false) return btn;
        return h(HY.Tooltip, { text: label, position: props.tooltipPosition }, btn);
      }

      var rest = omit(props, ['value', 'defaultValue', 'onChange', 'storageKey', 'attribute', 'variant', 'size', 'tooltip', 'tooltipPosition', 'disabled', 'className', 'aria-label']);
      return h('fieldset', Object.assign({}, rest, {
        className: cx('hy-theme', props.size === 'small' && 'hy-theme--small', props.disabled && 'is-disabled', props.className),
        disabled: props.disabled
      }),
        h('legend', { className: 'hy-sr' }, props['aria-label'] || 'Theme'),
        THEME_OPTIONS.map(function (o) {
          var id = name + '-' + o.value;
          return h('span', { key: o.value, className: 'hy-theme__item' },
            h('input', {
              type: 'radio', id: id, name: name, value: o.value, className: 'hy-theme__input',
              checked: value === o.value, onChange: function () { ctl[1](o.value); }
            }),
            h('label', { htmlFor: id, className: 'hy-theme__option', title: o.label },
              h(HY.Icon, { name: o.icon, size: props.size === 'small' ? 14 : 16 }),
              h('span', { className: 'hy-sr' }, o.label)));
        }));
    }

    define('ThemeSwitcher', ThemeSwitcher);
    define('themeScript', themeScript);
  })();

  /* ---- Toggle ---- */
  (function () {
    /* Toggle: a single on/off setting that takes effect immediately.
       A native checkbox with role="switch" inside a <label>, so the label toggles it and forms see it.
       Props: checked, onChange, size (small default | medium | large), color, icon {checked, unchecked},
       direction ('label-first' default | 'switch-first'), labelCasing ('title' | 'normal'), disabled, children.
       Old hyprsh props still work: defaultChecked (uncontrolled) and onChange(next) with the new boolean. */
    var TOGGLE_HUES = ['accent', 'blue', 'amber', 'red', 'green', 'teal', 'purple', 'pink', 'gray'];

    function Toggle(props) {
      var auto = useId();
      var id = props.id || auto;
      var controlled = props.checked !== undefined;
      var st = useState(!!props.defaultChecked);
      var on = controlled ? !!props.checked : st[0];
      var size = props.size === 'medium' || props.size === 'large' ? props.size : 'small';
      var hue = TOGGLE_HUES.indexOf(props.color) >= 0 && props.color !== 'accent' ? props.color : null;
      var icon = props.icon ? (on ? props.icon.checked : props.icon.unchecked) : null;
      var label = props.children;
      var rest = omit(props, ['checked', 'defaultChecked', 'onChange', 'size', 'color', 'icon', 'direction', 'labelCasing', 'children', 'className', 'id', 'style', 'disabled']);
      function change(e) {
        if (props.disabled) return;
        var next = e.target.checked;
        if (!controlled) st[1](next);
        if (props.onChange) props.onChange(next, e);
      }
      var track = h('span', { className: 'hy-toggle__track', 'aria-hidden': 'true' },
        h('span', { className: 'hy-toggle__thumb' }, icon ? h('span', { className: 'hy-toggle__icon' }, icon) : null));
      var text = label != null && label !== false
        ? h('span', { className: cx('hy-toggle__label', props.labelCasing !== 'normal' && 'hy-toggle__label--title') }, label)
        : null;
      return h('label', {
        htmlFor: id, style: props.style,
        className: cx('hy-toggle', 'hy-toggle--' + size, hue && 'hy-toggle--' + hue, props.disabled && 'hy-toggle--disabled', on && 'is-on', props.className)
      },
        props.direction === 'switch-first' ? null : text,
        h('input', Object.assign({}, rest, {
          id: id, type: 'checkbox', role: 'switch', className: 'hy-toggle__input',
          checked: on, disabled: props.disabled, onChange: change,
          'aria-checked': on
        })),
        track,
        props.direction === 'switch-first' ? text : null
      );
    }

    define('Toggle', Toggle);
  })();

  /* ---- Breadcrumbs ---- */
  (function () {
    /*
     * Breadcrumbs: the path from the top of the app to the current page.
     * Also exported as Breadcrumb (type 'text' | 'menu') with BreadcrumbItem children; both names work.
     */
    function Breadcrumbs(props) {
      var type = props.type === 'menu' ? 'menu' : 'text';
      var kids = React.Children.toArray(props.children).filter(Boolean);
      return h('nav', { 'aria-label': props['aria-label'] || 'Breadcrumb', className: cx('hy-breadcrumbs', 'hy-breadcrumbs--' + type, props.className), style: props.style },
        h('ol', { className: 'hy-breadcrumbs__list' }, kids.map(function (child, i) {
          var last = i === kids.length - 1;
          return h('li', { key: child.key || i, className: 'hy-breadcrumbs__li' }, child,
            !last && type === 'text' ? h('span', { className: 'hy-breadcrumbs__sep', 'aria-hidden': 'true' }, h(HY.Icon, { name: 'chevron-right', size: 14 })) : null);
        })));
    }

    /* One step. `active` marks the current page; `disabled` shows a step that can't be opened. */
    function BreadcrumbItem(props) {
      var rest = omit(props, ['active', 'disabled', 'href', 'className', 'children', 'prefix']);
      var cls = cx('hy-breadcrumbs__item', props.active && 'is-active', props.disabled && 'is-disabled', props.className);
      var inner = [
        props.prefix ? h('span', { key: 'p', className: 'hy-breadcrumbs__affix', 'aria-hidden': 'true' }, props.prefix) : null,
        h('span', { key: 't', className: 'hy-breadcrumbs__text' }, props.children)
      ];
      var current = props.active ? 'page' : undefined;
      if (props.href !== undefined && !props.disabled) {
        return h('a', Object.assign(rest, { href: props.href, className: cls, 'aria-current': current }), inner);
      }
      return h('span', Object.assign(rest, { className: cls, 'aria-current': current, 'aria-disabled': props.disabled || undefined }), inner);
    }

    Breadcrumbs.Item = BreadcrumbItem;

    define('Breadcrumbs', Breadcrumbs);
    define('Breadcrumb', Breadcrumbs);
    define('BreadcrumbItem', BreadcrumbItem);
  })();

  /* ---- CommandMenuTrigger ---- */
  (function () {
    /* A <button> that looks like a search field and opens a command menu. Not a read-only input, so
       screen readers announce a button that opens a dialog. */
    var CMT_OWN = ['children', 'size', 'prefix', 'shortcut', 'className', 'type', 'aria-haspopup'];

    var CommandMenuTrigger = React.forwardRef(function CommandMenuTrigger(props, ref) {
      var size = props.size === 'small' ? 'small' : 'medium';
      var rest = omit(props, CMT_OWN);
      var label = props.children == null || props.children === false ? 'Search…' : props.children;
      var showDefaultShortcut = props.shortcut === undefined || props.shortcut === true;
      var prefix = props.prefix === undefined || props.prefix === true
        ? h(HY.Icon, { name: 'search', size: 16 })
        : props.prefix;
      var shortcut = showDefaultShortcut
        ? h(HY.KeyboardInput, { small: true, meta: true }, 'K')
        : props.shortcut;
      var hasPrefix = prefix != null && prefix !== false;
      var hasShortcut = shortcut != null && shortcut !== false;
      return h('button', Object.assign({
        ref: ref,
        'aria-keyshortcuts': showDefaultShortcut ? 'Meta+K Control+K' : undefined
      }, rest, {
        type: 'button',
        'aria-haspopup': 'dialog',
        className: cx('hy-cmdk-trigger', 'hy-cmdk-trigger--' + size, props.className)
      }),
        hasPrefix && h('span', { className: 'hy-cmdk-trigger__prefix', 'aria-hidden': 'true' }, prefix),
        h('span', { className: 'hy-cmdk-trigger__label' }, label),
        hasShortcut && h('span', { className: 'hy-cmdk-trigger__shortcut', 'aria-hidden': 'true' }, shortcut));
    });

    define('CommandMenuTrigger', CommandMenuTrigger);
  })();

  /* ---- Link ---- */
  (function () {
    /* An inline text link in the design's link colour: <a> by default, <button> with as="button" for an action that reads as a link. */
    var Link = React.forwardRef(function Link(props, ref) {
      var isButton = props.as === 'button';
      var rest = omit(props, ['as', 'children', 'className', 'disabled']);
      var cls = cx('hy-link', props.className);
      if (isButton) {
        return h('button', Object.assign({ type: 'button' }, rest, { ref: ref, disabled: props.disabled, className: cls }), props.children);
      }
      if (props.disabled) { rest.href = undefined; rest.onClick = function (e) { e.preventDefault(); }; }
      return h('a', Object.assign(rest, { ref: ref, 'aria-disabled': props.disabled || undefined, className: cls }), props.children);
    });

    define('Link', Link);
  })();

  /* ---- Pagination ---- */
  (function () {
    /* Pagination: previous / next links between pages in a sequence, such as docs or a guide. */
    function PaginationLink(p) {
      var prev = p.dir === 'previous';
      var item = p.item;
      var word = prev ? 'Previous' : 'Next';
      return h('a', {
        href: item.href, onClick: item.onClick, rel: prev ? 'prev' : 'next',
        'aria-label': 'Go to ' + word.toLowerCase() + ' page: ' + (typeof item.title === 'string' ? item.title : ''),
        className: cx('hy-pagination__link', 'hy-pagination__link--' + (prev ? 'prev' : 'next'))
      },
        h('span', { className: 'hy-pagination__icon', 'aria-hidden': 'true' }, h(HY.Icon, { name: prev ? 'chevron-left' : 'chevron-right', size: 20 })),
        h('span', { className: 'hy-pagination__label' }, item.label || word),
        h('span', { className: 'hy-pagination__title' }, item.title));
    }

    function Pagination(props) {
      return h('nav', { 'aria-label': props['aria-label'] || 'Pagination', className: cx('hy-pagination', props.className), style: props.style },
        props.previous ? h(PaginationLink, { dir: 'previous', item: props.previous }) : h('span'),
        props.next ? h(PaginationLink, { dir: 'next', item: props.next }) : h('span'));
    }

    define('Pagination', Pagination);
  })();

  /* ---- TabBar ---- */
  (function () {
    /*
     * TabBar: the floating pill tab bar for phones. Fixed to the bottom, takes no layout
     * space, and exposes its height as --tab-bar-height in CSS. Items are buttons or links; the selected one carries
     * aria-current="page". With minimizeOnScroll it shrinks to the selected item while the content scrolls down.
     */
    var TabBarCtx = React.createContext(null);

    /* Scrolling down past this many px minimises the bar. */
    var TABBAR_MIN_AT = 24;

    function TabBarItem(props) {
      var ctx = React.useContext(TabBarCtx) || {};
      /* An item with `current` takes the selection, so the value match stands down while one is set. */
      var selected = props.current !== undefined ? !!props.current : (!ctx.anyCurrent && props.value !== undefined && props.value === ctx.value);
      var minimized = !!ctx.minimized;
      var badge = props.badge;
      var badgeNode = null;
      /* The tone only recolours dots and counts; a node badge is rendered as given. */
      var toneClass = props.badgeTone === 'error' || props.badgeTone === 'warning' ? ' hy-tabbar__badge--' + props.badgeTone : '';
      if (badge === true) badgeNode = h('span', { className: 'hy-tabbar__badge hy-tabbar__badge--dot' + toneClass });
      else if (typeof badge === 'number') {
        if (badge > 0) badgeNode = h('span', { className: 'hy-tabbar__badge hy-tabbar__badge--count' + toneClass }, badge > 99 ? '99+' : String(badge));
      } else if (badge !== undefined && badge !== null && badge !== false) badgeNode = h('span', { className: 'hy-tabbar__badge' }, badge);
      function onClick(e) {
        /* A tap on the minimised capsule only expands it. */
        if (minimized) { e.preventDefault(); if (ctx.expand) ctx.expand(); return; }
        if (props.value !== undefined && ctx.select) ctx.select(props.value);
        if (props.onClick) props.onClick(e);
      }
      var common = {
        className: cx('hy-tabbar__item', selected && 'is-selected', minimized && !props.__shown && 'is-hidden', props.className),
        style: props.style,
        'aria-current': selected ? 'page' : undefined,
        'aria-haspopup': props.haspopup ? 'dialog' : undefined,
        'aria-label': props.badgeLabel ? props.label + ', ' + props.badgeLabel : undefined,
        onClick: onClick
      };
      var inner = [
        h('span', { key: 'i', className: 'hy-tabbar__icon', 'aria-hidden': 'true' }, props.icon, badgeNode),
        h('span', { key: 'l', className: 'hy-tabbar__label' }, props.label)
      ];
      return props.href
        ? h('a', Object.assign({ href: props.href }, common), inner)
        : h('button', Object.assign({ type: 'button' }, common), inner);
    }
    TabBarItem.displayName = 'TabBarItem';

    function TabBar(props) {
      var val = useControllable(props.value, props.defaultValue, function (v) {
        if (props.onChange) props.onChange(v);
        if (props.onValueChange) props.onValueChange(v);
      });
      var min = useState(false);
      var minimized = !!props.minimizeOnScroll && min[0];
      var capsule = useRef(null);
      var navRef = useRef(null);

      useEffect(function () {
        if (!props.minimizeOnScroll) { min[1](false); return; }
        var last = new WeakMap();
        function onScroll(e) {
          var t = e.target;
          var el = t === document || t === document.documentElement || t === document.body ? (document.scrollingElement || document.documentElement) : t;
          if (!el || el.nodeType !== 1 || (navRef.current && navRef.current.contains(el))) return;
          /* A dialog or sheet scrolling doesn't move the content behind it. */
          if (el.closest && el.closest('[role="dialog"], [aria-modal="true"]')) return;
          var top = el.scrollTop, seen = last.has(el), prev = last.get(el);
          last.set(el, top);
          /* The first event from an element only records where it is, since it may have been scrolled before (a restored
             position). Horizontal scrolling leaves scrollTop alone. */
          if (!seen || top === prev) return;
          if (top <= 0) min[1](false);
          else if (top > prev) { if (top >= TABBAR_MIN_AT) min[1](true); }
          else if (top <= el.scrollHeight - el.clientHeight) min[1](false);  /* not the rubber band below the end */
        }
        var own = !!props.scrollRef;
        var target = own ? props.scrollRef.current : document;
        if (!target) return;
        target.addEventListener('scroll', onScroll, !own);
        return function () { target.removeEventListener('scroll', onScroll, !own); };
      }, [!!props.minimizeOnScroll, props.scrollRef]);

      var kids = React.Children.toArray(props.children).filter(React.isValidElement);
      var anyCurrent = kids.some(function (k) { return !!k.props.current; });
      function isOn(k) {
        return k.props.current !== undefined ? !!k.props.current : (!anyCurrent && k.props.value !== undefined && k.props.value === val[0]);
      }
      /* The item that stays when the bar is minimised: the selected one, else the first. */
      var shown = 0;
      for (var i = 0; i < kids.length; i++) if (isOn(kids[i])) { shown = i; break; }

      /* Left/Right/Home/End move between the items (the accessory is outside this loop). */
      function onKey(e) {
        var k = e.key;
        if (k !== 'ArrowLeft' && k !== 'ArrowRight' && k !== 'Home' && k !== 'End') return;
        var items = Array.prototype.filter.call(capsule.current.querySelectorAll('.hy-tabbar__item'), function (el) { return !el.classList.contains('is-hidden'); });
        var at = items.indexOf(document.activeElement);
        if (at < 0) return;
        e.preventDefault();
        var to = k === 'Home' ? 0 : k === 'End' ? items.length - 1 : (at + (k === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
        items[to].focus();
      }

      var acc = props.accessory;
      var accProps = acc ? { className: 'hy-tabbar__accessory', 'aria-label': acc.label, onClick: acc.onClick } : null;
      var accIcon = acc ? h('span', { className: 'hy-tabbar__accessory-icon', 'aria-hidden': 'true' }, acc.icon) : null;
      var ctx = {
        value: val[0], minimized: minimized, anyCurrent: anyCurrent,
        select: function (v) { val[1](v); },
        expand: function () { min[1](false); }
      };
      return h('nav', {
        ref: navRef, 'aria-label': props.label,
        className: cx('hy-tabbar', props.hideFrom !== false && 'hy-tabbar--hide-sm', props.className), style: props.style
      },
        h('div', { className: 'hy-tabbar__row' },
          /* Different class per direction, so the animation restarts on each change. */
          h('div', { ref: capsule, className: cx('hy-tabbar__capsule', props.minimizeOnScroll && (minimized ? 'is-min' : 'is-full')), onKeyDown: onKey },
            h(TabBarCtx.Provider, { value: ctx },
              kids.map(function (k, i) { return React.cloneElement(k, { __shown: i === shown }); }))),
          acc ? (acc.href
            ? h('a', Object.assign({ href: acc.href }, accProps), accIcon)
            : h('button', Object.assign({ type: 'button' }, accProps), accIcon)) : null));
    }

    TabBar.Item = TabBarItem;
    define('TabBar', TabBar);
    define('TabBarItem', TabBarItem);
  })();

  /* ---- Tabs ---- */
  (function () {
    /*
     * Tabs: WAI-ARIA tabs. The API (`selected` + `setSelected`, `tabs` with title/value/icon/disabled/tooltip,
     * `disabled`, `variant="secondary"`) plus our `onChange`, `defaultSelected` and per-tab `content` panels.
     * A list wider than the screen scrolls sideways; tab tooltips are portalled, so the scroll doesn't clip them.
     */
    function Tabs(props) {
      var tabs = props.tabs || [];
      var controlled = props.selected !== undefined;
      var st = useState(props.defaultSelected !== undefined ? props.defaultSelected : (tabs[0] && tabs[0].value));
      var sel = controlled ? props.selected : st[0];
      var base = useId();
      var refs = useRef({});
      var allDisabled = !!props.disabled;
      var variant = props.variant === 'secondary' ? 'secondary' : 'primary';
      function isOff(t) { return allDisabled || !!t.disabled; }
      function choose(v) {
        if (!controlled) st[1](v);
        if (props.setSelected) props.setSelected(v);
        if (props.onChange) props.onChange(v);
      }
      function onKey(e) {
        var enabled = tabs.filter(function (t) { return !isOff(t); });
        if (!enabled.length) return;
        var i = enabled.findIndex(function (t) { return t.value === sel; });
        var next = null;
        if (e.key === 'ArrowRight') next = enabled[(i + 1) % enabled.length];
        else if (e.key === 'ArrowLeft') next = enabled[(i - 1 + enabled.length) % enabled.length];
        else if (e.key === 'Home') next = enabled[0];
        else if (e.key === 'End') next = enabled[enabled.length - 1];
        if (next) { e.preventDefault(); choose(next.value); var el = refs.current[next.value]; if (el) el.focus(); }
      }
      /* The selected tab takes the tab stop; if it is disabled (or none is selected), the first enabled tab does. */
      var focusable = tabs.filter(function (t) { return t.value === sel && !isOff(t); })[0] || tabs.filter(function (t) { return !isOff(t); })[0];
      var active = tabs.filter(function (t) { return t.value === sel; })[0];
      return h('div', { className: cx('hy-tabs', 'hy-tabs--' + variant, props.className), style: props.style },
        h('div', { role: 'tablist', 'aria-label': props['aria-label'], className: 'hy-tabs__list', onKeyDown: onKey },
          tabs.map(function (t) {
            var on = t.value === sel;
            var btn = h('button', {
              key: t.value, type: 'button', role: 'tab', id: base + '-tab-' + t.value, 'aria-selected': on,
              'aria-controls': t.content !== undefined ? base + '-panel-' + t.value : undefined,
              tabIndex: focusable && focusable.value === t.value ? 0 : -1, disabled: isOff(t), className: 'hy-tabs__tab',
              ref: function (el) { refs.current[t.value] = el; }, onClick: function () { choose(t.value); }
            }, t.icon ? h('span', { className: 'hy-tabs__icon', 'aria-hidden': 'true' }, t.icon) : null, t.title);
            return t.tooltip ? h(HY.Tooltip, { key: t.value, text: t.tooltip, position: 'bottom', className: 'hy-tabs__tip' }, btn) : btn;
          })),
        active && active.content !== undefined ? h('div', { role: 'tabpanel', id: base + '-panel-' + active.value, 'aria-labelledby': base + '-tab-' + active.value, tabIndex: 0, className: 'hy-tabs__panel' }, active.content) : null);
    }

    define('Tabs', Tabs);
  })();

  /* ---- Badge ---- */
  (function () {
    /* Sizes are sm | md | lg; the older small | medium | large still work. */
    var BADGE_SIZE = { sm: 'small', md: 'medium', lg: 'large', small: 'small', medium: 'medium', large: 'large' };

    function Badge(props) {
      var variant = props.variant || 'gray';
      /* 'blue-subtle' and variant="blue" contrast="low" are the same badge. */
      if (props.contrast === 'low' && !/-subtle$/.test(variant) && ['inverted', 'pill'].indexOf(variant) < 0) variant += '-subtle';
      var size = BADGE_SIZE[props.size] || 'medium';
      return h('span', {
        className: cx('hy-badge', 'hy-badge--' + variant, 'hy-badge--' + size, props.className),
        title: props.title, translate: props.translate, style: props.style
      },
        props.icon ? h('span', { className: 'hy-badge__icon', 'aria-hidden': 'true' }, props.icon) : null,
        props.children);
    }

    define('Badge', Badge);
  })();

  /* ---- Pill ---- */
  (function () {
    var PILL_SIZE = { sm: 'small', md: 'medium', lg: 'large', small: 'small', medium: 'medium', large: 'large' };

    /* A link styled like a Badge: lighter than a button. Renders <a> with href, <button> with onClick only.
       With pressed / defaultPressed / onPressedChange it is a toggle chip: a <button> with aria-pressed. */
    function Pill(props) {
      var size = PILL_SIZE[props.size] || 'medium';
      var toggle = props.pressed !== undefined || props.defaultPressed !== undefined || !!props.onPressedChange;
      var pr = useControllable(props.pressed, !!props.defaultPressed, props.onPressedChange);
      var rest = omit(props, ['size', 'icon', 'children', 'className', 'pressed', 'defaultPressed', 'onPressedChange']);
      var tag = toggle ? 'button' : props.href ? 'a' : (props.onClick ? 'button' : 'span');
      if (tag === 'button' && !rest.type) rest.type = 'button';
      if (toggle) {
        rest['aria-pressed'] = pr[0];
        rest.onClick = function (e) {
          if (props.onClick) props.onClick(e);
          if (!e.defaultPrevented) pr[1](!pr[0]);
        };
      }
      var on = toggle && pr[0];
      var lead = props.icon || (on ? h(Glyph, { name: 'check', size: 14 }) : null);
      return h(tag, Object.assign(rest, { className: cx('hy-pill', 'hy-pill--' + size, toggle && 'hy-pill--toggle', on && 'is-pressed', props.className) }),
        lead ? h('span', { className: 'hy-pill__icon', 'aria-hidden': 'true' }, lead) : null,
        h('span', { className: 'hy-pill__label' }, props.children));
    }

    define('Pill', Pill);
  })();

  /* ---- StatusDot ---- */
  (function () {
    var STATUS_LABEL = { ready: 'Ready', building: 'Building', error: 'Error', queued: 'Queued', canceled: 'Canceled', deleted: 'Deleted' };
    var STATUS_MESSAGE = { ready: 'is ready', building: 'is building', error: 'had an error', queued: 'is queued', canceled: 'was canceled', deleted: 'was deleted' };
    /* Semantic states for any health or status, not only deployments. `error` belongs to both sets. */
    var STATUS_SEMANTIC = { success: 'Success', warning: 'Warning', neutral: 'Neutral', pending: 'Pending', info: 'Info' };

    /* state takes the semantic states (success | warning | error | neutral | pending) or deployment states
       (QUEUED | BUILDING | READY | ERROR | CANCELED | DELETED), in any case. variant is filled (default), outline or dashed. */
    function StatusDot(props) {
      var state = String(props.state || 'ready').toLowerCase();
      if (!STATUS_LABEL[state] && !STATUS_SEMANTIC[state]) state = 'queued';
      var variant = props.variant === 'outline' || props.variant === 'dashed' ? props.variant : 'filled';
      var word = STATUS_SEMANTIC[state] || STATUS_LABEL[state];
      /* The brand book shows status with a word as well as a colour, so the label is on unless label={false}. */
      var label = props.label === false ? null : (props.label === true || props.label == null ? word : props.label);
      /* Semantic states name the status itself; so does `error` once it has a custom label. Deployment states say what happened to a deployment. */
      var general = !!STATUS_SEMANTIC[state] || (state === 'error' && props.label != null && props.label !== true && props.label !== false);
      var name;
      if (props.title) name = props.title;
      else if (general) {
        var text = typeof label === 'string' ? label : word;
        name = props.titlePrefix ? props.titlePrefix + ': ' + text : text;
      } else name = (props.titlePrefix || 'This deployment') + ' ' + STATUS_MESSAGE[state];
      return h('span', {
        className: cx('hy-status', 'hy-status--' + state, variant !== 'filled' && 'hy-status--' + variant, props.className),
        title: general || props.title ? name : name + '.',
        role: label ? undefined : 'img',
        'aria-label': label ? undefined : name,
        'aria-hidden': props['aria-hidden']
      },
        h('span', { className: 'hy-status__dot', 'aria-hidden': 'true' }),
        label ? h('span', { className: 'hy-status__label' }, label) : null);
    }

    define('StatusDot', StatusDot);
  })();

  /* ---- Banner ---- */
  (function () {
    /* A centred announcement line with one link button. On a narrow container the whole banner becomes that button. */
    function Banner(props) {
      var button = props.button;
      var chevron = h(HY.Icon, { name: 'chevron-right', size: 16 });
      var rest = omit(props, ['button', 'children', 'className']);
      var linkProps = button ? omit(button, ['content']) : null;
      return h('div', Object.assign({}, rest, { className: cx('hy-banner', button && 'hy-banner--has-button', props.className) }),
        h('div', { className: 'hy-banner__row' },
          h('p', { className: 'hy-banner__text' }, props.children),
          button ? h(HY.Button, Object.assign({}, linkProps, { variant: 'secondary', size: 'small', shape: 'rounded', suffix: chevron, href: button.href || (button.onClick ? undefined : '#') }), button.content) : null),
        button ? h(HY.Button, Object.assign({}, linkProps, {
          className: 'hy-banner__compact', variant: 'secondary', size: 'small', shape: 'rounded', suffix: chevron,
          href: button.href || (button.onClick ? undefined : '#')
        }), props.children) : null);
    }

    define('Banner', Banner);
  })();

  /* ---- EmptyState ---- */
  (function () {
    /* A bordered, centred block for a view with nothing in it yet: icon, title, description, then actions. */
    function EmptyStateIcon(props) {
      var icon = typeof props.icon === 'string' ? h(HY.Icon, { name: props.icon, size: 24 }) : props.icon;
      return h('div', { className: cx('hy-empty-state__icon', props.className), 'aria-hidden': 'true' }, icon || props.children);
    }

    function EmptyState(props) {
      var rest = omit(props, ['title', 'description', 'icon', 'className', 'children', 'headingLevel', 'size']);
      if (props.size === 'small') {
        /* One line: the title, then the description, then the actions. No border, no icon, no heading. */
        return h('div', Object.assign({}, rest, { className: cx('hy-empty-state', 'hy-empty-state--small', props.className) }),
          props.title ? h('p', { className: 'hy-empty-state__title' }, props.title) : null,
          props.description ? h('p', { className: 'hy-empty-state__description' }, props.description) : null,
          props.children ? h('div', { className: 'hy-empty-state__actions' }, props.children) : null);
      }
      var Heading = 'h' + (props.headingLevel || 3);
      return h('div', Object.assign({}, rest, { className: cx('hy-empty-state', props.className) }),
        props.icon ? h(EmptyStateIcon, { icon: props.icon }) : null,
        (props.title || props.description) ? h('div', { className: 'hy-empty-state__text' },
          props.title ? h(Heading, { className: 'hy-empty-state__title' }, props.title) : null,
          props.description ? h('p', { className: 'hy-empty-state__description' }, props.description) : null) : null,
        props.children ? h('div', { className: 'hy-empty-state__actions' }, props.children) : null);
    }

    EmptyState.Icon = EmptyStateIcon;

    define('EmptyState', EmptyState);
    define('EmptyStateIcon', EmptyStateIcon);
  })();

  /* ---- Error ---- */
  (function () {
    /* Local name is ErrorMessage so the global Error constructor is never shadowed. */
    function ErrorMessage(props) {
      var size = props.size || 'medium';
      var err = props.error;
      var label = props.label === false ? null : (props.label || 'Error');
      var rest = omit(props, ['size', 'label', 'error', 'className', 'children']);
      var external = err && err.link && /^https?:\/\//.test(err.link);
      var body = err ? h(React.Fragment, null, err.message,
        err.action && err.link ? h(React.Fragment, null, ' ', h('a', { className: 'hy-error__link', href: err.link, target: external ? '_blank' : undefined, rel: external ? 'noopener noreferrer' : undefined },
          err.action, external ? h(HY.Icon, { name: 'external-link', size: 12, className: 'hy-error__ext' }) : null,
          external ? h('span', { className: 'hy-sr' }, ' (opens in a new tab)') : null)) : null) : props.children;
      return h('div', Object.assign({}, rest, { className: cx('hy-error', 'hy-error--' + size, props.className) }),
        h(HY.Icon, { name: 'circle-alert', size: size === 'small' ? 14 : 16, className: 'hy-error__glyph' }),
        h('div', { className: 'hy-error__text' }, label && !err ? h('strong', { className: 'hy-error__label' }, label + ':') : (err ? h('span', { className: 'hy-sr' }, (label || 'Error') + ': ') : null),
          label && !err ? ' ' : null, body));
    }

    define('Error', ErrorMessage);
  })();

  /* ---- ErrorCard ---- */
  (function () {
    function ErrorCard(props) {
      var rest = omit(props, ['title', 'message', 'className', 'children']);
      return h('div', Object.assign({ role: 'alert' }, rest, { className: cx('hy-error-card', props.className) }),
        h(HY.Icon, { name: 'circle-alert', className: 'hy-error-card__glyph' }),
        props.title ? h('h3', { className: 'hy-error-card__title' }, props.title) : null,
        props.message ? h('p', { className: 'hy-error-card__message' }, props.message) : null,
        props.children ? h('div', { className: 'hy-error-card__actions' }, props.children) : null);
    }

    define('ErrorCard', ErrorCard);
  })();

  /* ---- LoadingDots ---- */
  (function () {
    var DOT_PX = { sm: 2, md: 3, lg: 4, small: 2, medium: 3, large: 4 };

    /* Three pulsing dots for a short wait, optionally after a word (“Deploying”). */
    function LoadingDots(props) {
      var px = typeof props.size === 'number' ? props.size : (DOT_PX[props.size] || 3);
      var dot = { width: px, height: px };
      return h('span', { className: cx('hy-dots', props.className), style: props.style, role: 'status', 'aria-live': 'polite' },
        props.children ? h('span', { className: 'hy-dots__text' }, props.children) : h('span', { className: 'hy-sr' }, props['aria-label'] || 'Loading'),
        h('span', { className: 'hy-dots__row', 'aria-hidden': 'true' },
          h('span', { className: 'hy-dots__dot', style: dot }),
          h('span', { className: 'hy-dots__dot', style: dot }),
          h('span', { className: 'hy-dots__dot', style: dot })));
    }

    define('LoadingDots', LoadingDots);
  })();

  /* ---- Note ---- */
  (function () {
    var NOTE_GLYPH = { default: 'info', secondary: 'info', success: 'success', error: 'error', warning: 'warning', violet: 'info', cyan: 'info' };
    var NOTE_WORD = { default: 'Note', secondary: 'Note', success: 'Success', error: 'Error', warning: 'Warning', violet: 'New', cyan: 'Note' };

    function NoteLabel(props) {
      return h('strong', { className: cx('hy-note__label', props.className) }, props.children);
    }
    function NoteContent(props) {
      return h('div', { className: cx('hy-note__body', props.className) }, props.children);
    }
    function NoteAction(props) {
      return h('div', { className: cx('hy-note__action', props.className) }, props.children);
    }

    /* A disabled note disables the controls in its action slot as well. */
    function disableAll(children) {
      return React.Children.map(children, function (c) {
        return React.isValidElement(c) && typeof c.type !== 'string' ? React.cloneElement(c, { disabled: true }) : c;
      });
    }

    function Note(props) {
      /* `variant` is the current name; the older `type` still works and keeps its leading word (“Warning:”). */
      var variant = props.variant || props.type || 'default';
      if (!NOTE_GLYPH[variant]) variant = 'default';
      var legacyWord = !props.variant && props.type ? NOTE_WORD[variant] : null;
      var label = props.label === false ? null : (props.label || legacyWord);
      var size = props.size === 'small' || props.size === 'large' ? props.size : 'medium';
      var rest = omit(props, ['variant', 'type', 'fill', 'size', 'disabled', 'icon', 'label', 'action', 'children', 'className']);

      var kids = React.Children.toArray(props.children);
      var compound = kids.some(function (c) { return c && (c.type === NoteContent || c.type === NoteAction); });
      var body, action;
      if (compound) {
        body = kids.map(function (c) {
          if (props.disabled && c && c.type === NoteAction) return React.cloneElement(c, { children: disableAll(c.props.children) });
          return c;
        });
      } else {
        body = h(NoteContent, null, label ? h(NoteLabel, null, label + ':') : null, props.children);
      }
      if (props.action) action = h(NoteAction, null, props.disabled ? disableAll(props.action) : props.action);
      var hasAction = !!props.action || kids.some(function (c) { return c && c.type === NoteAction; });

      var icon = props.icon === null ? null
        : props.icon !== undefined ? h('span', { className: 'hy-note__icon', 'aria-hidden': 'true' }, props.icon)
        : h(Glyph, { name: NOTE_GLYPH[variant], className: 'hy-note__icon' });

      /* role and aria-* pass through. Unless you set a role: success is a polite status and error an alert, so they are announced. */
      var role = props.role !== undefined ? props.role
        : props.disabled ? undefined : variant === 'error' ? 'alert' : variant === 'success' ? 'status' : undefined;
      return h('div', Object.assign({}, rest, {
        className: cx('hy-note', 'hy-note--' + variant, 'hy-note--' + size, props.fill && 'hy-note--fill', props.disabled && 'is-disabled', hasAction && 'hy-note--has-action', props.className),
        role: role,
        'aria-disabled': props.disabled || rest['aria-disabled'] || undefined
      }), icon, body, action);
    }

    Note.Content = NoteContent;
    Note.Action = NoteAction;
    Note.Label = NoteLabel;

    define('Note', Note);
    define('NoteContent', NoteContent);
    define('NoteAction', NoteAction);
    define('NoteLabel', NoteLabel);
  })();

  /* ---- Progress ---- */
  (function () {
    /* The `type` names; the older `variant` hues map onto them. */
    var PROGRESS_TYPES = ['default', 'secondary', 'success', 'warning', 'error'];
    var PROGRESS_LEGACY = { blue: 'success', amber: 'warning', red: 'error', green: 'green' };

    /* `colors` maps thresholds to colours: the highest threshold at or below the value wins. */
    function progressColor(colors, value) {
      if (!colors) return undefined;
      var keys = Object.keys(colors).map(Number).filter(function (k) { return !isNaN(k); }).sort(function (a, b) { return a - b; });
      var pick;
      keys.forEach(function (k) { if (value >= k) pick = colors[k]; });
      return pick === undefined && keys.length ? colors[keys[0]] : pick;
    }

    function Progress(props) {
      var max = props.max || 100;
      var value = Math.max(0, Math.min(max, Number(props.value) || 0));
      var pct = value / max;
      var id = useId();
      var type = PROGRESS_TYPES.indexOf(props.type) >= 0 ? props.type : (PROGRESS_LEGACY[props.variant] || 'default');
      var fmt = useMemo(function () {
        try { return new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 }); } catch (e) { return { format: function (n) { return Math.round(n * 100) + '%'; } }; }
      }, []);
      var color = progressColor(props.colors, value);
      var height = props.height !== undefined ? props.height : 10;
      var stops = (props.stops || []).filter(function (s) { return s && s.value > 0 && s.value < max; });

      var bar = h('div', { className: 'hy-progress__bar', style: { height: height } },
        h('div', {
          className: 'hy-progress__track', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': max, 'aria-valuenow': value,
          'aria-valuetext': fmt.format(pct), 'aria-labelledby': props.label ? id : undefined, 'aria-label': props.label ? undefined : (props['aria-label'] || 'Progress')
        },
          h('span', { className: 'hy-progress__fill', style: { transform: 'translateX(' + ((pct - 1) * 100) + '%)', background: color } })),
        stops.map(function (s, i) {
          var left = (s.value / max * 100) + '%';
          var mark = h('span', { className: 'hy-progress__divider', style: { left: left }, 'aria-hidden': 'true' });
          if (!s.tooltip) return h(React.Fragment, { key: i }, mark);
          var name = s.ariaLabel || (typeof s.tooltip === 'string' ? s.tooltip : 'Stop at ' + s.value);
          return h(React.Fragment, { key: i }, mark,
            h('span', { className: 'hy-progress__stop', style: { left: left } },
              h(HY.Tooltip, { text: s.tooltip, position: 'top' },
                h('button', { type: 'button', className: 'hy-progress__trigger', 'aria-label': name }))));
        }));

      return h('div', { className: cx('hy-progress', 'hy-progress--' + type, props.className), style: Object.assign(props.width !== undefined ? { width: props.width } : {}, props.style) },
        props.label ? h('div', { className: 'hy-progress__head' },
          h('span', { id: id, className: 'hy-progress__label' }, props.label),
          h('span', { className: 'hy-progress__value' }, fmt.format(pct))) : null,
        bar);
    }

    define('Progress', Progress);
  })();

  /* ---- ProjectBanner ---- */
  (function () {
    var PB_GLYPH = { gray: 'info', success: 'success', warning: 'warning', error: 'error' };
    var PB_NAME = { gray: 'Notice', success: 'Notice', warning: 'Warning', error: 'Error' };

    /* A full-width strip under the header about the project as a whole, with one call to action. */
    function ProjectBanner(props) {
      var variant = PB_GLYPH[props.variant] ? props.variant : 'gray';
      var cta = props.callToAction;
      var icon = props.icon === null ? null
        : props.icon !== undefined ? h('span', { className: 'hy-pbanner__icon', 'aria-hidden': 'true' }, props.icon)
        : h(Glyph, { name: PB_GLYPH[variant], className: 'hy-pbanner__icon' });
      var action = null;
      if (cta) {
        action = cta.href !== undefined || !cta.onClick
          ? h('a', { className: 'hy-pbanner__cta', href: cta.href || '#', onClick: cta.onClick }, cta.label)
          : h('button', { type: 'button', className: 'hy-pbanner__cta', onClick: cta.onClick }, cta.label);
      }
      return h('aside', {
        className: cx('hy-pbanner', 'hy-pbanner--' + variant, props.className), style: props.style,
        'aria-label': props['aria-label'] || PB_NAME[variant]
      },
        h('div', { className: 'hy-pbanner__inner' },
          h('div', { className: 'hy-pbanner__message' }, icon, h('span', { className: 'hy-pbanner__label' }, props.label || props.children)),
          action));
    }

    define('ProjectBanner', ProjectBanner);
  })();

  /* ---- Skeleton ---- */
  (function () {
    function skeletonPx(v) { return typeof v === 'number' ? v + 'px' : v; }

    /* A shimmering placeholder. Wrapping real children sizes it to them, and show={false} swaps them in. */
    function Skeleton(props) {
      if (props.show === false) return props.children === undefined ? null : h(React.Fragment, null, props.children);
      var hasKids = props.children !== undefined && props.children !== null;
      var style = Object.assign({}, props.style);
      if (props.width !== undefined) style.width = skeletonPx(props.width);
      var height = props.height !== undefined ? props.height : (hasKids ? undefined : 24);
      if (height !== undefined) style.minHeight = skeletonPx(height);
      if (typeof props.boxHeight === 'number' && typeof height === 'number' && props.boxHeight > height) style.marginBottom = props.boxHeight - height;
      return h('span', {
        className: cx('hy-skeleton', props.pill && 'hy-skeleton--pill', props.rounded && 'hy-skeleton--rounded', props.squared && 'hy-skeleton--squared',
          props.button && 'hy-skeleton--button', props.animated === false ? 'hy-skeleton--static' : null, hasKids && 'hy-skeleton--wrap', props.className),
        style: style, 'aria-hidden': 'true'
      }, hasKids ? h('span', { className: 'hy-skeleton__content' }, props.children) : null);
    }

    define('Skeleton', Skeleton);
  })();

  /* ---- Spinner ---- */
  (function () {
    /* Sizes: box px, bar count, bar width and height, cycle ms. */
    var SPINNER_SIZES = {
      sm: [12, 8, 3, 1.5, 1000], md: [16, 10, 4, 1.5, 1000], lg: [20, 12, 5, 2, 1200], xl: [24, 12, 6, 2.5, 1200],
      '2xl': [32, 15, 8, 2.5, 1200], '3xl': [40, 15, 10, 3, 1200], '4xl': [56, 18, 14, 3.5, 1300]
    };
    var SPINNER_ORDER = ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];

    /* A numeric size (the older API, still used by Button) takes the nearest named size and scales it. */
    function spinnerSpec(size) {
      if (typeof size !== 'number') return { spec: SPINNER_SIZES[size] || SPINNER_SIZES.md, scale: 1 };
      var best = 'md';
      SPINNER_ORDER.forEach(function (k) { if (Math.abs(SPINNER_SIZES[k][0] - size) < Math.abs(SPINNER_SIZES[best][0] - size)) best = k; });
      return { spec: SPINNER_SIZES[best], scale: size / SPINNER_SIZES[best][0] };
    }

    function Spinner(props) {
      var s = spinnerSpec(props.size);
      var box = s.spec[0] * s.scale, n = s.spec[1], w = s.spec[2] * s.scale, ht = s.spec[3] * s.scale, dur = s.spec[4];
      var bars = [];
      for (var i = 0; i < n; i++) {
        bars.push(h('span', { key: i, style: {
          width: w, height: ht, marginLeft: -w / 2, marginTop: -ht / 2,
          transform: 'rotate(' + (i * 360 / n) + 'deg) translate(146%)',
          animationDuration: dur + 'ms', animationDelay: Math.round(-dur + (i + 1) * dur / n) + 'ms'
        } }));
      }
      var name = props.label || props['aria-label'];
      return h('span', {
        className: cx('hy-spinner', props.className), style: Object.assign({ width: box, height: box }, props.style),
        role: name ? 'status' : undefined, 'aria-label': name || undefined, 'aria-hidden': name ? undefined : 'true'
      }, bars);
    }

    define('Spinner', Spinner);
  })();

  /* ---- Toast ---- */
  (function () {
    /* Toast: an imperative useToasts() API plus the original controlled
       <Toast toasts onDismiss> component. Toasts stack at the bottom right and expand on hover. */
    var TOAST_GAP = 8, TOAST_PEEK = 12, TOAST_VISIBLE = 3;
    var TOAST_WORD = { success: 'Success', error: 'Error', warning: 'Warning' };
    var toastStore = { list: [], subs: [], seq: 0, hosts: 0, auto: false };

    function toastNormalize(input, type) {
      var o = typeof input === 'string' || React.isValidElement(input) ? { text: input } : Object.assign({}, input);
      var action = o.action;
      if (typeof action === 'string') action = { label: action, onClick: o.onAction };
      var undo = typeof o.onUndoAction === 'function';
      var duration = o.preserve ? Infinity : (o.duration !== undefined ? o.duration : (o.timeout !== undefined ? o.timeout : (undo ? 8000 : 6000)));
      return {
        id: o.id !== undefined ? o.id : 'toast-' + (++toastStore.seq),
        text: o.text !== undefined ? o.text : o.message,
        type: type || o.type,
        action: action && action.label ? action : null,
        onUndoAction: undo ? o.onUndoAction : null,
        duration: duration
      };
    }
    function toastEmit() { toastStore.subs.forEach(function (fn) { fn(toastStore.list); }); }
    // Mounts a <Toast /> of its own for useToasts() when the app has none. React 19's react-dom has no createRoot (it is
    // only in react-dom/client), so the package entry imports a `createRoot` binding from there; the browser bundle has no
    // such binding and takes it off the ReactDOM global. Without either the toast is queued but nothing shows, so say so once.
    function toastMountHost() {
      if (typeof document === 'undefined') return;
      var mount = typeof createRoot === 'function' ? createRoot : ReactDOM && ReactDOM.createRoot;
      if (typeof mount !== 'function') {
        toastStore.auto = true;
        var prod = typeof process !== 'undefined' && process && process.env && process.env.NODE_ENV === 'production';
        if (!prod && typeof console !== 'undefined') console.warn('hyprsh: useToasts() could not mount a toast host, so toasts will not show. Mount <Toast /> once at the app root.');
        return;
      }
      toastStore.auto = true;
      var el = document.createElement('div');
      el.setAttribute('data-hy-toaster', '');
      document.body.appendChild(el);
      mount(el).render(h(HY.Toast));
    }
    function toastAdd(input, type) {
      var t = toastNormalize(input, type);
      if (!toastStore.hosts && !toastStore.auto) toastMountHost();
      toastStore.list = toastStore.list.filter(function (x) { return x.id !== t.id; }).concat(t);
      toastEmit();
      return t.id;
    }
    function toastRemove(id) {
      toastStore.list = toastStore.list.filter(function (x) { return x.id !== id; });
      toastEmit();
    }
    var toastApi = {
      message: function (o) { return toastAdd(o); },
      success: function (o) { return toastAdd(o, 'success'); },
      error: function (o) { return toastAdd(o, 'error'); },
      warning: function (o) { return toastAdd(o, 'warning'); },
      dismiss: toastRemove,
      clear: function () { toastStore.list = []; toastEmit(); }
    };
    function useToasts() { return toastApi; }

    function ToastItem(p) {
      var t = p.toast;
      var ref = useRef(null);
      var left = useRef(t.duration);
      var entered = useState(!!p.inline);
      useEffect(function () {
        if (entered[0]) return;
        var t0 = setTimeout(function () { entered[1](true); }, 20);
        return function () { clearTimeout(t0); };
      }, []);
      /* Measure the inner box so a collapsed toast, forced to the front toast's height, still reports its own. */
      useLayoutEffect(function () { if (ref.current && p.onHeight) p.onHeight(t.id, ref.current.offsetHeight); });
      useEffect(function () {
        if (p.paused || left.current === Infinity) return;
        var start = Date.now();
        var timer = setTimeout(function () { p.onDismiss(t.id); }, left.current);
        return function () { clearTimeout(timer); left.current -= Date.now() - start; };
      }, [t.id, p.paused]);
      var glyph = TOAST_WORD[t.type] ? t.type : null;
      function dismiss() { p.onDismiss(t.id); }
      var style = p.inline ? undefined : (entered[0] ? p.style : Object.assign({}, p.style, { transform: 'translateY(100%)', opacity: 0 }));
      return h('li', { className: cx('hy-toast', t.type && 'hy-toast--' + t.type, t.onUndoAction && 'hy-toast--undo', p.behind && 'is-behind'), style: style, 'aria-hidden': p.behind || undefined },
        h('div', { ref: ref, className: 'hy-toast__inner' },
        h('div', { className: 'hy-toast__main' },
          glyph ? h(Glyph, { name: glyph, className: 'hy-toast__glyph' }) : null,
          h('div', { className: 'hy-toast__text' }, glyph ? h('span', { className: 'hy-sr' }, TOAST_WORD[glyph] + ': ') : null, t.text),
          t.action && !t.onUndoAction ? h(HY.Button, { size: 'small', variant: 'secondary', onClick: function () { if (t.action.onClick) t.action.onClick(); dismiss(); } }, t.action.label) : null,
          !t.onUndoAction && t.duration === Infinity ? h('button', { type: 'button', className: 'hy-toast__close', 'aria-label': 'Dismiss', onClick: dismiss }, h(Glyph, { name: 'x', size: 14 })) : null),
        t.onUndoAction ? h('div', { className: 'hy-toast__actions' },
          h(HY.Button, { size: 'small', variant: 'tertiary', onClick: dismiss }, 'Dismiss'),
          h(HY.Button, { size: 'small', variant: 'primary', onClick: function () { t.onUndoAction(); dismiss(); } }, (t.action && t.action.label) || 'Undo')) : null));
    }

    function Toast(props) {
      var controlled = props.toasts !== undefined;
      var storeSt = useState(toastStore.list);
      var heights = useState({});
      var hover = useState(false);
      useEffect(function () {
        if (controlled) return;
        toastStore.hosts++;
        toastStore.subs.push(storeSt[1]);
        storeSt[1](toastStore.list);
        return function () { toastStore.hosts--; toastStore.subs = toastStore.subs.filter(function (f) { return f !== storeSt[1]; }); };
      }, [controlled]);
      var list = (controlled ? props.toasts : storeSt[0]).map(function (t) { return t.text !== undefined && t.duration !== undefined && 'onUndoAction' in t ? t : toastNormalize(t); });
      var onDismiss = controlled ? (props.onDismiss || function () {}) : toastRemove;
      function onHeight(id, hgt) {
        if (heights[0][id] !== hgt) heights[1](function (m) { var n = Object.assign({}, m); n[id] = hgt; return n; });
      }
      var expanded = hover[0] || props.expanded;
      var items, olStyle;
      if (props.inline) {
        items = list.map(function (t) { return h(ToastItem, { key: t.id, toast: t, inline: true, onDismiss: onDismiss }); });
      } else {
        var newest = list.slice().reverse();
        var frontH = heights[0][newest.length ? newest[0].id : ''] || 56;
        var offset = 0;
        items = newest.map(function (t, i) {
          var hgt = heights[0][t.id] || 56;
          var y = expanded ? offset : i * TOAST_PEEK;
          offset += hgt + TOAST_GAP;
          var style = {
            transform: 'translateY(' + (-y) + 'px) scale(' + (expanded ? 1 : Math.max(0, 1 - i * 0.05)) + ')',
            opacity: i >= TOAST_VISIBLE ? 0 : 1, zIndex: newest.length - i,
            height: !expanded && i > 0 ? frontH : undefined
          };
          return h(ToastItem, { key: t.id, toast: t, style: style, behind: !expanded && i > 0, paused: expanded, onDismiss: onDismiss, onHeight: onHeight });
        }).reverse();
        olStyle = { height: expanded ? Math.max(0, offset - TOAST_GAP) : frontH + Math.min(Math.max(newest.length - 1, 0), TOAST_VISIBLE - 1) * TOAST_PEEK };
        if (!newest.length) olStyle.height = 0;
      }
      var region = h('section', {
        className: cx('hy-toaster', props.inline && 'hy-toaster--inline', props.className), 'aria-label': 'Notifications',
        onMouseEnter: function () { hover[1](true); }, onMouseLeave: function () { hover[1](false); },
        onFocus: function () { hover[1](true); }, onBlur: function (e) { if (!e.currentTarget.contains(e.relatedTarget)) hover[1](false); }
      },
        h('ol', { className: 'hy-toaster__list', style: olStyle, 'aria-live': 'polite', 'aria-relevant': 'additions text' }, items));
      return props.inline ? region : portal(region);
    }

    Toast.useToasts = useToasts;
    Toast.toasts = toastApi;
    define('Toast', Toast);
    define('useToasts', useToasts);
  })();

  /* ---- Code ---- */
  (function () {
    /* Inline code by default. A multi-line string, `block` or `syntax` renders a bordered block. */
    function Code(props) {
      var text = props.children;
      var block = !!props.block || props.syntax != null || (typeof text === 'string' && text.indexOf('\n') >= 0);
      var rest = omit(props, ['children', 'block', 'syntax', 'className']);
      if (!block) return h('code', Object.assign({}, rest, { className: cx('hy-code', props.className), translate: 'no' }), text);
      return h('pre', Object.assign({ tabIndex: 0 }, rest, { className: cx('hy-code-block', props.className), translate: 'no', 'data-syntax': props.syntax }),
        h('code', null, text));
    }

    define('Code', Code);
  })();

  /* ---- CodeBlock ---- */
  (function () {
    /* ---- a small hand-written tokenizer: JS/TS/JSX, JSON, bash, CSS. Output: [[type, text], …] ---- */
    var JS_KEYWORDS = ('break case catch class const continue debugger default delete do else export extends finally for from ' +
      'function if import in instanceof let new of return static super switch this throw try typeof var void while with yield ' +
      'async await as type interface enum implements declare readonly public private protected keyof namespace abstract satisfies').split(' ');
    var JS_LITERALS = ['true', 'false', 'null', 'undefined', 'NaN', 'Infinity'];
    var CLASS_AFTER = ['class', 'new', 'extends', 'implements', 'interface', 'type', 'enum'];
    var SH_KEYWORDS = 'if then else elif fi for in do done while until case esac function return export local select'.split(' ');

    function lexer(src) {
      var L = { src: src, i: 0, out: [], last: null };
      L.at = function (re) { re.lastIndex = L.i; var m = re.exec(src); return m ? m[0] : null; };
      L.push = function (type, text) {
        if (!text) return;
        L.out.push([type, text]); L.i += text.length;
        if (/\S/.test(text)) L.last = [type, text];
      };
      return L;
    }

    var RE = {
      ws: /\s+/y,
      lineComment: /\/\/[^\n]*/y,
      blockComment: /\/\*[\s\S]*?(?:\*\/|$)/y,
      dq: /"(?:[^"\\\n]|\\.)*"?/y,
      sq: /'(?:[^'\\\n]|\\.)*'?/y,
      tpl: /`(?:[^`\\]|\\[\s\S])*`?/y,
      num: /(?:0[xXbBoO][\da-fA-F_]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?n?|\.\d+)/y,
      ident: /[A-Za-z_$][\w$]*/y,
      keyAhead: /\s*:(?!:)/y,
      callAhead: /\s*(?:<[\w$.,\s]*>)?\s*\(/y,
      jsxText: /[^<{]+/y,
      jsxName: /[\w$.:-]*/y,
      jsxAttr: /[\w$:-]+/y,
      jsxStr: /"[^"]*"?|'[^']*'?/y,
      jsxClose: /<\/(\s*)([\w$.:-]*)(\s*)(>?)/y
    };

    function tokenizeJs(src, jsx) {
      var L = lexer(src), n = src.length;
      var stack = [{ m: 'js', depth: 0 }];
      function openTag() {
        L.push('punct', '<');
        var name = L.at(RE.jsxName);
        L.push(/^[A-Z]/.test(name) ? 'class' : 'tag', name);
        stack.push({ m: 'tag' });
      }
      function canStartJsx() {
        if (!jsx || src[L.i] !== '<' || !/[A-Za-z>]/.test(src[L.i + 1] || '')) return false;
        var p = L.last;
        if (!p) return true;
        if (p[0] === 'keyword') return true;
        return p[0] === 'punct' && /[(\[{,;:=?&|!>]$/.test(p[1]);
      }
      while (L.i < n) {
        var top = stack[stack.length - 1], t, c = src[L.i];
        if (top.m === 'children') {
          if ((t = L.at(RE.jsxText))) { L.push('plain', t); continue; }
          if (c === '{') { L.push('punct', '{'); stack.push({ m: 'js', depth: 0 }); continue; }
          RE.jsxClose.lastIndex = L.i;
          var cm = RE.jsxClose.exec(src);
          if (cm) {
            L.push('punct', '</'); L.push('ws', cm[1]);
            L.push(/^[A-Z]/.test(cm[2]) ? 'class' : 'tag', cm[2]);
            L.push('ws', cm[3]); L.push('punct', cm[4]);
            stack.pop();
            continue;
          }
          openTag(); continue;
        }
        if (top.m === 'tag') {
          if ((t = L.at(RE.ws))) { L.push('ws', t); continue; }
          if (src.substr(L.i, 2) === '/>') { L.push('punct', '/>'); stack.pop(); continue; }
          if (c === '>') { L.push('punct', '>'); stack.pop(); stack.push({ m: 'children' }); continue; }
          if (c === '{') { L.push('punct', '{'); stack.push({ m: 'js', depth: 0 }); continue; }
          if ((t = L.at(RE.jsxStr))) { L.push('string', t); continue; }
          if ((t = L.at(RE.jsxAttr))) { L.push('attr', t); continue; }
          L.push('punct', c); continue;
        }
        /* js */
        if ((t = L.at(RE.ws))) { L.push('ws', t); continue; }
        if ((t = L.at(RE.lineComment)) || (t = L.at(RE.blockComment))) { L.push('comment', t); continue; }
        if ((t = L.at(RE.dq)) || (t = L.at(RE.sq)) || (t = L.at(RE.tpl))) {
          var keyStr = t[0] !== '`' && src.slice(L.i + t.length).match(/^\s*:(?!:)/) && L.last && /[{,]$/.test(L.last[1]);
          L.push(keyStr ? 'property' : 'string', t); continue;
        }
        if (canStartJsx()) { openTag(); continue; }
        if (/[\d.]/.test(c) && !/[\w$]/.test(src[L.i - 1] || '') && (t = L.at(RE.num))) { L.push('number', t); continue; }
        if ((t = L.at(RE.ident))) {
          var prev = L.last, after = L.i + t.length, type = 'plain';
          var afterDot = prev && prev[1] === '.';
          RE.keyAhead.lastIndex = after; var isKey = RE.keyAhead.exec(src); isKey = isKey && isKey.index === after;
          RE.callAhead.lastIndex = after; var isCall = RE.callAhead.exec(src); isCall = isCall && isCall.index === after;
          if (!afterDot && JS_KEYWORDS.indexOf(t) >= 0 && !(isKey && prev && /[{,]$/.test(prev[1]))) type = 'keyword';
          else if (!afterDot && JS_LITERALS.indexOf(t) >= 0) type = 'literal';
          else if (isKey && prev && /[{,]$/.test(prev[1])) type = 'property';
          else if (isCall) type = 'function';
          else if (prev && prev[0] === 'keyword' && CLASS_AFTER.indexOf(prev[1]) >= 0) type = 'class';
          else if (prev && prev[0] === 'keyword' && prev[1] === 'function') type = 'function';
          L.push(type, t); continue;
        }
        if (c === '{') { top.depth++; L.push('punct', c); continue; }
        if (c === '}') {
          if (top.depth === 0 && stack.length > 1) { stack.pop(); L.push('punct', c); continue; }
          top.depth = Math.max(0, top.depth - 1); L.push('punct', c); continue;
        }
        L.push('punct', c);
      }
      return L.out;
    }

    var SH = {
      comment: /#[^\n]*/y,
      variable: /\$\{[^}\n]*\}?|\$[\w@#?$!*-]+/y,
      assign: /[A-Za-z_][\w]*=/y,
      flag: /--?[\w][\w-]*/y,
      word: /[^\s|&;<>()"'$`\\]+/y,
      op: /&&|\|\||[|;&<>()]|\$\(/y
    };
    function tokenizeSh(src) {
      var L = lexer(src), n = src.length, cmd = true, t;
      while (L.i < n) {
        var c = src[L.i], prev = src[L.i - 1] || '\n';
        if (c === '\\' && src[L.i + 1] === '\n') { L.push('punct', '\\'); L.push('ws', '\n'); continue; }
        if (c === '\n') { L.push('ws', '\n'); cmd = true; continue; }
        if ((t = L.at(/[ \t]+/y))) { L.push('ws', t); continue; }
        if (/\s/.test(prev) && (t = L.at(SH.comment))) { L.push('comment', t); continue; }
        if ((t = L.at(RE.dq)) || (t = L.at(RE.sq))) { L.push('string', t); cmd = false; continue; }
        if ((t = L.at(SH.op))) { L.push('punct', t); cmd = t !== '>' && t !== '<' && t !== ')'; continue; }
        if ((t = L.at(SH.variable))) { L.push('property', t); cmd = false; continue; }
        if (cmd && (t = L.at(SH.assign))) {
          L.push('property', t);
          if ((t = L.at(RE.dq)) || (t = L.at(RE.sq))) L.push('string', t);
          else if ((t = L.at(/[^\s;|&]+/y))) L.push('plain', t);
          continue;
        }
        if (/\s/.test(prev) && (t = L.at(SH.flag))) { L.push('flag', t); continue; }
        if ((t = L.at(SH.word))) {
          if (SH_KEYWORDS.indexOf(t) >= 0) { L.push('keyword', t); cmd = t !== 'in' && t !== 'export' && t !== 'local'; continue; }
          if (cmd) { L.push('function', t); cmd = t === 'sudo'; continue; }
          L.push(/^\d+(\.\d+)?$/.test(t) ? 'number' : 'plain', t); continue;
        }
        L.push('punct', c);
      }
      return L.out;
    }

    var CSS = {
      comment: /\/\*[\s\S]*?(?:\*\/|$)/y,
      atRule: /@[\w-]+/y,
      prop: /-{0,2}[A-Za-z][\w-]*(?=\s*:[^{};]*(?:;|\}|\)|$))/my,
      hex: /#[\da-fA-F]{3,8}\b/y,
      num: /-?(?:\d+\.?\d*|\.\d+)(?:%|[a-zA-Z]+)?/y,
      fn: /[\w-]+(?=\()/y,
      important: /!important/y,
      custom: /--[\w-]+/y,
      ident: /[\w-]+/y,
      selector: /(?:[.#]?-?[A-Za-z_][\w-]*|::?[\w-]+|\[[^\]]*\]|\*|&)/y
    };
    function tokenizeCss(src) {
      var L = lexer(src), n = src.length, depth = 0, inValue = false, t;
      while (L.i < n) {
        var c = src[L.i];
        if ((t = L.at(RE.ws))) { L.push('ws', t); continue; }
        if ((t = L.at(CSS.comment))) { L.push('comment', t); continue; }
        if ((t = L.at(RE.dq)) || (t = L.at(RE.sq))) { L.push('string', t); continue; }
        if (c === '{') { depth++; inValue = false; L.push('punct', c); continue; }
        if (c === '}') { depth = Math.max(0, depth - 1); inValue = false; L.push('punct', c); continue; }
        if (c === ';') { inValue = false; L.push('punct', c); continue; }
        if ((t = L.at(CSS.atRule))) {
          L.push('keyword', t);
          /* the prelude: (max-width: 600px) and screen */
          while (L.i < n && !/[{;]/.test(src[L.i])) {
            if ((t = L.at(RE.ws))) L.push('ws', t);
            else if ((t = L.at(RE.dq)) || (t = L.at(RE.sq))) L.push('string', t);
            else if ((t = L.at(CSS.prop))) L.push('property', t);
            else if ((t = L.at(CSS.num))) L.push('number', t);
            else if ((t = L.at(CSS.ident))) L.push('plain', t);
            else L.push('punct', src[L.i]);
          }
          continue;
        }
        if (inValue) {
          if ((t = L.at(CSS.important))) { L.push('keyword', t); continue; }
          if ((t = L.at(CSS.hex)) || (t = L.at(CSS.num))) { L.push('number', t); continue; }
          if ((t = L.at(CSS.fn))) { L.push('function', t); continue; }
          if ((t = L.at(CSS.custom))) { L.push('property', t); continue; }
          if ((t = L.at(CSS.ident))) { L.push('plain', t); continue; }
          L.push('punct', c); continue;
        }
        if (depth > 0 && (t = L.at(CSS.prop))) {
          L.push('property', t);
          if ((t = L.at(/\s*/y))) L.push('ws', t);
          L.push('punct', ':'); inValue = true; continue;
        }
        if ((t = L.at(CSS.selector))) { L.push('class', t); continue; }
        L.push('punct', c);
      }
      return L.out;
    }

    var LANGS = {
      js: 'js', jsx: 'jsx', javascript: 'jsx', mjs: 'js', cjs: 'js', next: 'jsx',
      ts: 'ts', typescript: 'ts', tsx: 'jsx', json: 'json', jsonc: 'json',
      bash: 'sh', sh: 'sh', shell: 'sh', zsh: 'sh', console: 'sh', css: 'css', scss: 'css', diff: 'diff'
    };
    function tokenize(code, language) {
      var lang = LANGS[String(language || '').toLowerCase()];
      if (lang === 'js' || lang === 'jsx') return tokenizeJs(code, true);
      if (lang === 'ts' || lang === 'json') return tokenizeJs(code, false);
      if (lang === 'sh') return tokenizeSh(code);
      if (lang === 'css') return tokenizeCss(code);
      return [['plain', code]];
    }
    /* split a token stream into lines, keeping token types across line breaks */
    function toLines(tokens) {
      var lines = [[]];
      tokens.forEach(function (tk) {
        var parts = tk[1].split('\n');
        parts.forEach(function (p, i) {
          if (i > 0) lines.push([]);
          if (p) lines[lines.length - 1].push([tk[0], p]);
        });
      });
      return lines;
    }

    var LANG_ICON = { jsx: 'file-code', js: 'file-code', ts: 'file-code', json: 'braces', sh: 'terminal', css: 'hash', diff: 'file-diff' };

    function CodeBlock(props) {
      var code = String(props.children == null ? '' : props.children).replace(/\n$/, '');
      var language = props.language || props.syntax;
      var lang = LANGS[String(language || '').toLowerCase()];
      var lines = useMemo(function () { return toLines(tokenize(code, language)); }, [code, language]);
      var raw = code.split('\n');
      var rid = useId();
      var id = props.id || 'cb' + rid.replace(/[^\w]/g, '');
      var refSt = useState(null), refLine = refSt[0];
      var copySt = useState('idle');
      var timer = useRef(null);
      useEffect(function () {
        var m = new RegExp('^#' + id + '-L(\\d+)$').exec(window.location.hash || '');
        if (m) refSt[1](+m[1]);
        return function () { clearTimeout(timer.current); };
      }, []);

      var hl = props.highlightedLinesNumbers || [], added = props.addedLinesNumbers || [], removed = props.removedLinesNumbers || [];
      function kind(n, text) {
        if (lang === 'diff') return /^\+/.test(text) ? 'added' : (/^-/.test(text) ? 'removed' : null);
        if (added.indexOf(n) >= 0) return 'added';
        if (removed.indexOf(n) >= 0) return 'removed';
        return null;
      }
      function onCopy() {
        var text = lang === 'diff' ? code : raw.filter(function (l, i) { return removed.indexOf(i + 1) < 0; }).join('\n');
        Promise.resolve(copyText(text)).then(function () { copySt[1]('copied'); if (props.onCopy) props.onCopy(); }, function () { copySt[1]('failed'); });
        clearTimeout(timer.current);
        timer.current = setTimeout(function () { copySt[1]('idle'); }, 2000);
      }
      function onRef(n) {
        var next = refLine === n ? null : n;
        refSt[1](next);
        try { window.history.replaceState(null, '', next ? '#' + id + '-L' + next : window.location.pathname + window.location.search); } catch (e) { /* sandboxed */ }
      }

      var digits = String(lines.length).length;
      var copyBtn = h('button', { type: 'button', className: 'hy-cb__copy', onClick: onCopy, 'aria-label': 'Copy Code' },
        h(Glyph, { name: copySt[0] === 'copied' ? 'check' : 'copy' }));
      var sw = props.switcher;
      var switcher = sw && sw.options ? h('label', { className: 'hy-cb__switch' },
        h('span', { className: 'hy-sr' }, 'Language'),
        h('select', { value: sw.value, onChange: function (e) { if (sw.onChange) sw.onChange(e.target.value); } },
          sw.options.map(function (o) { return h('option', { key: o.value, value: o.value }, o.label); })),
        h(Glyph, { name: 'chevron', size: 16 })) : null;

      var header = props.filename || switcher ? h('div', { className: 'hy-cb__header' },
        h('div', { className: 'hy-cb__file' },
          h(HY.Icon, { name: LANG_ICON[lang] || 'file', size: 16 }),
          props.filename ? h('span', { className: 'hy-cb__filename' }, props.filename) : null),
        switcher, copyBtn) : null;

      var block = h('div', { className: cx('hy-cb', !header && 'hy-cb--bare', props.hideLineNumbers && 'hy-cb--no-numbers', !props.tabs && props.className), id: props.tabs ? undefined : props.id },
        header,
        h('pre', { className: 'hy-cb__pre', tabIndex: 0, role: 'region', 'aria-label': props['aria-label'] || props.filename || 'Code', translate: 'no', 'data-language': language },
          h('code', { className: 'hy-cb__code', style: { '--hy-cb-digits': digits + 'ch' } },
            lines.map(function (toks, i) {
              var n = i + 1, k = kind(n, raw[i] || '');
              var isHl = hl.indexOf(n) >= 0 || refLine === n;
              return h('span', { key: i, id: id + '-L' + n, className: cx('hy-cb__line', isHl && 'is-highlighted', k && 'is-' + k) },
                props.hideLineNumbers ? null : h('button', { type: 'button', tabIndex: -1, 'aria-hidden': 'true', className: 'hy-cb__num', onClick: function () { onRef(n); } },
                  k ? h('span', { className: 'hy-cb__mark' }, k === 'added' ? '+' : '-') : null, n),
                h('span', { className: 'hy-cb__text' }, toks.length ? toks.map(function (tk, j) {
                  return tk[0] === 'plain' || tk[0] === 'ws' ? tk[1] : h('span', { key: j, className: 'hy-tok-' + tk[0] }, tk[1]);
                }) : '​'),
                k ? h('span', { className: 'hy-sr' }, k === 'added' ? ' (added)' : ' (removed)') : null);
            }))),
        header ? null : copyBtn,
        h('span', { className: 'hy-sr', 'aria-live': 'polite' }, copySt[0] === 'copied' ? 'Copied to clipboard' : (copySt[0] === 'failed' ? 'Copy failed. Select the code and copy it manually.' : '')));

      if (!props.tabs || !props.tabs.options) return block;
      var tb = props.tabs;
      var idx = Math.max(0, tb.options.map(function (o) { return o.value; }).indexOf(tb.value));
      function onTabKey(e) {
        var d = e.key === 'ArrowRight' ? 1 : (e.key === 'ArrowLeft' ? -1 : 0);
        var to = e.key === 'Home' ? 0 : (e.key === 'End' ? tb.options.length - 1 : (idx + d + tb.options.length) % tb.options.length);
        if (!d && e.key !== 'Home' && e.key !== 'End') return;
        e.preventDefault();
        if (tb.onChange) tb.onChange(tb.options[to].value);
        var btns = e.currentTarget.querySelectorAll('[role=tab]');
        if (btns[to]) btns[to].focus();
      }
      return h('div', { className: cx('hy-cb-tabs', props.className), id: props.id },
        h('div', { className: 'hy-cb-tabs__list', role: 'tablist', 'aria-label': 'Language', onKeyDown: onTabKey },
          tb.options.map(function (o, i) {
            return h('button', { key: o.value, type: 'button', role: 'tab', 'aria-selected': i === idx, tabIndex: i === idx ? 0 : -1,
              className: 'hy-cb-tabs__tab', onClick: function () { if (tb.onChange) tb.onChange(o.value); } }, o.label);
          })),
        block);
    }
    CodeBlock.tokenize = tokenize;

    define('CodeBlock', CodeBlock);
  })();

  /* ---- Description ---- */
  (function () {
    function Description(props) {
      var rest = omit(props, ['title', 'content', 'tooltip', 'right', 'ellipsis', 'layout', 'termWidth', 'className', 'children']);
      var content = props.content !== undefined ? props.content : props.children;
      var tipLabel = 'About ' + (typeof props.title === 'string' ? props.title : 'this field');
      return h('dl', Object.assign({}, rest, { className: cx('hy-description', props.right && 'hy-description--right', props.layout === 'horizontal' && 'hy-description--horizontal', props.ellipsis && 'hy-description--ellipsis', props.className),
        style: props.termWidth !== undefined ? Object.assign({ '--hy-description-term': typeof props.termWidth === 'number' ? props.termWidth + 'px' : props.termWidth }, props.style) : props.style }),
        h('dt', { className: 'hy-description__title' },
          h('span', null, props.title),
          props.tooltip ? h(HY.Tooltip, { text: props.tooltip },
            h('button', { type: 'button', className: 'hy-description__tip', 'aria-label': tipLabel }, h(HY.Icon, { name: 'info', size: 14 }))) : null),
        h('dd', { className: 'hy-description__content', title: props.ellipsis && typeof content === 'string' ? content : undefined }, content));
    }

    define('Description', Description);
  })();

  /* ---- Entity ---- */
  (function () {
    /* A row for one thing (a member, token, domain): left slot, content, right-side controls.
       Inside EntityList rows render as <li>. as="button" makes the whole row clickable with a stretched button. */
    var EntityListContext = React.createContext(false);

    function EntityContent(props) {
      var rest = omit(props, ['title', 'description', 'fill', 'className', 'children']);
      return h('div', Object.assign({}, rest, { className: cx('hy-entity__content', props.fill && 'hy-entity__content--fill', props.className) }),
        props.title !== undefined ? h('div', { className: 'hy-entity__title' }, props.title) : null,
        props.description !== undefined ? h('div', { className: 'hy-entity__description' }, props.description) : null,
        props.children);
    }

    function Entity(props) {
      var inList = React.useContext(EntityListContext);
      var rowRef = useRef(null);
      var labelId = useId();
      var hasControls = useState(false);
      var asButton = props.as === 'button';
      useLayoutEffect(function () {
        if (!asButton || !rowRef.current) return;
        var found = rowRef.current.querySelector('.hy-entity__left a[href], .hy-entity__left button, .hy-entity__left input, .hy-entity__left select, .hy-entity__left textarea, .hy-entity__right a[href], .hy-entity__right button, .hy-entity__right input, .hy-entity__right select');
        if (!!found !== hasControls[0]) hasControls[1](!!found);
      });
      var tag = props.as === 'li' || (inList && props.as !== 'div') ? 'li' : 'div';
      var rest = omit(props, ['as', 'left', 'right', 'leftClassName', 'rightClassName', 'className', 'children', 'onClick', 'disabled']);
      return h(tag, Object.assign({}, rest, { ref: rowRef, className: cx('hy-entity', asButton && 'hy-entity--button', props.disabled && 'hy-entity--disabled', props.className) }),
        asButton ? h('button', {
          type: 'button', className: 'hy-entity__cover', onClick: props.onClick, disabled: props.disabled,
          'aria-labelledby': hasControls[0] ? undefined : labelId,
          'aria-hidden': hasControls[0] ? 'true' : undefined, tabIndex: hasControls[0] ? -1 : undefined
        }) : null,
        h('div', { id: labelId, className: cx('hy-entity__left', props.leftClassName) }, props.left, props.children),
        props.right ? h('div', { className: cx('hy-entity__right', props.rightClassName) }, props.right) : null);
    }

    function EntityList(props) {
      var rest = omit(props, ['className', 'children']);
      return h(EntityListContext.Provider, { value: true },
        h('ul', Object.assign({ role: 'list' }, rest, { className: cx('hy-entity-list', props.className) }), props.children));
    }

    Entity.Content = EntityContent;
    Entity.List = EntityList;

    define('Entity', Entity);
    define('EntityContent', EntityContent);
    define('EntityList', EntityList);
  })();

  /* ---- Icon ---- */
  (function () {
    /* Lucide paths drawn at 16px by default with a 1.5px stroke at any size. */
    function Icon(props) {
      var size = props.size || 16;
      var label = props['aria-label'] || props.label;
      /* An icon component, such as one from lucide-react, drawn with the same size and constant stroke. */
      if (props.icon) return h(props.icon, {
        className: cx('hy-icon', props.className), size: size, color: props.color || 'currentColor',
        strokeWidth: props.strokeWidth || 1.5, absoluteStrokeWidth: true, focusable: 'false', style: props.style,
        role: label ? 'img' : undefined, 'aria-label': label || undefined, 'aria-hidden': label ? undefined : 'true'
      });
      var markup = ICONS[props.name];
      if (!markup) return null;
      return h('svg', {
        className: cx('hy-icon', props.className), width: size, height: size, viewBox: '0 0 24 24',
        fill: 'none', stroke: props.color || 'currentColor', strokeWidth: (props.strokeWidth || 1.5) * 24 / size,
        strokeLinecap: 'round', strokeLinejoin: 'round', focusable: 'false', style: props.style,
        role: label ? 'img' : undefined, 'aria-label': label || undefined, 'aria-hidden': label ? undefined : 'true',
        dangerouslySetInnerHTML: { __html: markup }
      });
    }
    Icon.names = Object.keys(ICONS);
    /* Adds icons by name ({ 'git-branch': '<path …/>' }): the npm build ships only the icons the components use. */
    Icon.register = function (map) { Object.assign(ICONS, map); Icon.names = Object.keys(ICONS); };

    define('Icon', Icon);
  })();

  /* ---- KeyboardInput ---- */
  (function () {
    var KBD_IS_MAC = (function () {
      if (typeof navigator === 'undefined') return true;
      var p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || '';
      return /mac|iphone|ipad|ipod/i.test(p);
    })();
    var KBD_MAC = { meta: ['⌘', 'Command'], shift: ['⇧', 'Shift'], alt: ['⌥', 'Option'], ctrl: ['⌃', 'Control'] };
    var KBD_PC = { meta: ['Ctrl', 'Control'], shift: ['Shift', 'Shift'], alt: ['Alt', 'Alt'], ctrl: ['Ctrl', 'Control'] };
    function KeyboardInput(props) {
      var mac = props.platform ? props.platform === 'mac' : KBD_IS_MAC;
      var map = mac ? KBD_MAC : KBD_PC;
      var order = mac ? ['ctrl', 'alt', 'shift', 'meta'] : ['meta', 'ctrl', 'alt', 'shift'];
      var parts = [], names = [], seen = {};
      order.forEach(function (m) {
        if (!props[m] || seen[map[m][0]]) return;
        seen[map[m][0]] = true;
        parts.push({ text: map[m][0], mod: mac && m === 'meta' ? 'cmd' : null });
        names.push(map[m][1]);
      });
      var child = props.children;
      if (child != null && child !== false && child !== '') { parts.push({ text: child }); names.push(child); }
      var labelled = names.every(function (n) { return typeof n === 'string' || typeof n === 'number'; });
      var rest = omit(props, ['meta', 'shift', 'alt', 'ctrl', 'small', 'platform', 'alwaysShow', 'children', 'className']);
      return h('kbd', Object.assign({ 'aria-label': labelled && names.length ? names.join(' ') : undefined }, rest, {
        className: cx('hy-kbd', props.small && 'hy-kbd--small', props.alwaysShow && 'hy-kbd--always', !mac && parts.length > 1 && 'hy-kbd--words', props.className)
      }), parts.map(function (p, i) {
        return h('span', { key: i, className: p.mod ? 'hy-kbd__cmd' : undefined, 'aria-hidden': labelled ? 'true' : undefined }, p.text);
      }));
    }

    define('KeyboardInput', KeyboardInput);
    define('Kbd', KeyboardInput);
  })();

  /* ---- MiddleTruncate ---- */
  (function () {
    function mtCut(value, keep) {
      if (keep >= value.length) return value;
      var chars = Array.from(value);
      var head = Math.ceil(keep / 2), tail = Math.floor(keep / 2);
      return chars.slice(0, head).join('') + '…' + (tail ? chars.slice(chars.length - tail).join('') : '');
    }

    function MiddleTruncate(props) {
      var value = props.value == null ? '' : String(props.value);
      var st = useState(value), shown = st[0], setShown = st[1];
      var boxRef = useRef(null), measureRef = useRef(null);

      useLayoutEffect(function () {
        var box = boxRef.current, probe = measureRef.current;
        if (!box || !probe) return;
        var chars = Array.from(value);
        function fit() {
          var avail = box.clientWidth;
          probe.textContent = value;
          if (!avail || probe.getBoundingClientRect().width <= avail + 0.5) { setShown(value); return; }
          var lo = 0, hi = chars.length - 1, best = 0;
          while (lo <= hi) {
            var mid = (lo + hi) >> 1;
            probe.textContent = mtCut(value, mid);
            if (probe.getBoundingClientRect().width <= avail + 0.5) { best = mid; lo = mid + 1; } else hi = mid - 1;
          }
          setShown(mtCut(value, best));
        }
        fit();
        var ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
        if (ro) ro.observe(box);
        var alive = true;
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (alive) fit(); });
        return function () { alive = false; if (ro) ro.disconnect(); };
      }, [value]);

      function onCopy(e) {
        var sel = window.getSelection && window.getSelection();
        if (!sel || !boxRef.current || !boxRef.current.contains(sel.anchorNode)) return;
        if (shown === value || !e.clipboardData) return;
        e.preventDefault();
        e.clipboardData.setData('text/plain', value);
      }

      var rest = omit(props, ['value', 'className', 'style']);
      return h('span', Object.assign({}, rest, {
        ref: boxRef, className: cx('hy-mt', props.className), style: props.style,
        title: shown !== value ? value : undefined, onCopy: onCopy
      }),
        h('span', { className: 'hy-mt__full', 'aria-hidden': 'true' }, value),
        h('span', { className: 'hy-mt__shown', 'aria-hidden': 'true' }, shown),
        h('span', { className: 'hy-sr' }, value),
        h('span', { ref: measureRef, className: 'hy-mt__probe', 'aria-hidden': 'true' }));
    }

    define('MiddleTruncate', MiddleTruncate);
  })();

  /* ---- Snippet ---- */
  (function () {
    function Snippet(props) {
      var text = props.text == null ? '' : props.text;
      var lines = Array.isArray(text) ? text : [text];
      var empty = !lines.some(function (l) { return l !== '' && l != null; });
      var st = useState('idle');
      var timer = useRef(null);
      useEffect(function () { return function () { clearTimeout(timer.current); }; }, []);
      function onCopy() {
        var payload = props.copyText != null ? props.copyText : lines.join('\n');
        Promise.resolve(copyText(payload)).then(function () {
          st[1]('copied'); if (props.onCopy) props.onCopy();
        }, function () { st[1]('failed'); });
        clearTimeout(timer.current);
        timer.current = setTimeout(function () { st[1]('idle'); }, 2000);
      }
      var copied = props.copied !== undefined ? !!props.copied : st[0] === 'copied';
      var prompt = props.prompt === false ? null : (typeof props.prompt === 'string' ? props.prompt : '$');
      var type = props.type && props.type !== 'default' ? props.type : null;
      var width = typeof props.width === 'number' ? props.width + 'px' : props.width;
      return h('div', { className: cx('hy-snippet', props.dark && 'hy-snippet--dark', type && 'hy-snippet--' + type, props.className), translate: 'no', style: Object.assign({ width: width }, props.style) },
        empty && props.placeholder
          ? h('p', { className: 'hy-snippet__placeholder' }, props.placeholder)
          : h('pre', { className: 'hy-snippet__pre' }, lines.map(function (l, i) {
            return h('code', { key: i, className: 'hy-snippet__line' }, prompt ? h('span', { className: 'hy-snippet__prompt', 'aria-hidden': 'true' }, prompt + ' ') : null, l);
          })),
        h('button', { type: 'button', className: 'hy-snippet__copy', onClick: onCopy, disabled: empty && props.copyText == null, 'aria-label': 'Copy to Clipboard' },
          h('span', { className: cx('hy-snippet__icon', copied && 'is-copied'), 'aria-hidden': 'true' }, h(Glyph, { name: 'copy' })),
          h('span', { className: cx('hy-snippet__icon', !copied && 'is-hidden'), 'aria-hidden': 'true' }, h(Glyph, { name: 'check' }))),
        h('span', { className: 'hy-sr', 'aria-live': 'polite' }, copied ? 'Copied to clipboard' : (st[0] === 'failed' ? 'Copy failed. Select the text and copy it manually.' : '')));
    }

    define('Snippet', Snippet);
  })();

  /* ---- Table ---- */
  (function () {
    /* Compound table: TableRoot > Table > TableColgroup/TableHeader/TableBody/TableFooter > TableRow > TableHead/TableCell.
       The data form (columns + rows) still works and renders the same parts. */
    function partProps(props, base, extra) {
      return Object.assign({}, omit(props, ['className', 'children'].concat(extra || [])), { className: cx(base, props.className) });
    }

    function TableRoot(props) {
      return h('div', partProps(props, 'hy-table'), props.children);
    }
    function TableEl(props) {
      return h('table', partProps(props, cx('hy-table__table', props.stickyHeader && 'hy-table__table--sticky'), ['stickyHeader']), props.children);
    }
    function TableColgroup(props) { return h('colgroup', partProps(props, null), props.children); }
    function TableCol(props) { return h('col', partProps(props, null)); }
    function TableHeader(props) { return h('thead', partProps(props, 'hy-table__header'), props.children); }
    function TableBody(props) {
      return h('tbody', partProps(props, cx('hy-table__body',
        props.striped && 'hy-table__body--striped',
        props.bordered && 'hy-table__body--bordered',
        props.interactive && 'hy-table__body--interactive',
        props.virtualize && 'hy-table__body--virtualize'), ['striped', 'bordered', 'interactive', 'virtualize']), props.children);
    }
    function TableFooter(props) { return h('tfoot', partProps(props, 'hy-table__footer'), props.children); }
    /* selected -> aria-selected, current -> aria-current; an explicit aria-* prop wins. */
    function TableRow(props) {
      var state = {};
      if (props.selected) state['aria-selected'] = true;
      if (props.current) state['aria-current'] = props.current === true ? 'true' : props.current;
      return h('tr', Object.assign(state, partProps(props, cx('hy-table__row', props.selected && 'is-selected', props.current && 'is-current'), ['selected', 'current'])), props.children);
    }
    /* sort -> aria-sort on the th. onSort -> the label becomes a full-cell button with a decorative arrow (before the label when right-aligned). */
    function TableHead(props) {
      var state = { scope: 'col' };
      if (props.sort) state['aria-sort'] = props.sort;
      var label = props.children;
      if (props.onSort) {
        label = h('button', { type: 'button', className: 'hy-table__sort', disabled: props.sortDisabled || undefined, onClick: function (e) { props.onSort(e); } },
          h('span', { className: 'hy-table__sort-label' }, props.children),
          h('svg', { className: cx('hy-table__sort-arrow', props.sort === 'descending' && 'is-desc'), width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true', focusable: 'false' },
            h('path', { d: 'M8 13V3M4 7l4-4 4 4' })));
      }
      return h('th', Object.assign(state, partProps(props, cx('hy-table__head', props.onSort && 'hy-table__head--sortable', props.onSort && props.sort && props.sort !== 'none' && 'is-sorted', cellClass(props)), ['align', 'wrap', 'truncate', 'sort', 'onSort', 'sortDisabled'])), label);
    }
    function TableCell(props) { return h('td', partProps(props, cx('hy-table__cell', cellClass(props)), ['align', 'wrap', 'truncate']), props.children); }

    /* align: 'left' | 'center' | 'right'. wrap: normal white-space, no max width. truncate: fill the column, end in an ellipsis. */
    function cellClass(c) {
      return cx(c.align && 'hy-table__cell--' + c.align, c.wrap && 'hy-table__cell--wrap', c.truncate && !c.wrap && 'hy-table__cell--truncate');
    }
    function alignOf(c) { return c.align || (c.numeric ? 'right' : undefined); }
    /* Data form: the app owns the order. Clicking a new column asks for ascending, the active one flips. */
    function sortClick(props, key) {
      var cur = props.sort;
      return function (event) {
        props.onSortChange && props.onSortChange({ key: key, direction: cur && cur.key === key && cur.direction === 'ascending' ? 'descending' : 'ascending' }, event);
      };
    }

    /* One decorative placeholder row. columns sizes each cell like its column, count draws that many plain cells; index (the row's
       position) shifts the widths of the plain columns so repeated rows don't look stamped. aria-hidden: the table announces loading. */
    var SKELETON_WIDTHS = ['72%', '56%', '84%', '64%', '48%'];
    function skeletonWidth(c, row, col) {
      if (c && c.numeric) return '35%';
      if (c && (c.mono || c.truncate)) return '60%';
      return SKELETON_WIDTHS[(row + col * 2) % SKELETON_WIDTHS.length];
    }
    function TableSkeletonRow(props) {
      var cols = props.columns || Array.apply(null, Array(props.count || 0));
      var row = props.index || 0;
      return h('tr', Object.assign({}, partProps(props, cx('hy-table__row', 'hy-table__row--skeleton'), ['columns', 'count', 'index']), { 'aria-hidden': 'true' }),
        cols.map(function (c, i) {
          var align = c ? alignOf(c) : undefined;
          var style = align === 'right' ? { marginLeft: 'auto' } : align === 'center' ? { marginLeft: 'auto', marginRight: 'auto' } : undefined;
          return h(TableCell, { key: c ? c.key : i, align: align, wrap: c && c.wrap, truncate: c && c.truncate },
            h(HY.Skeleton, { width: skeletonWidth(c, row, i), height: 16, style: style }));
        }));
    }

    function Table(props) {
      if (!props.columns) {
        return h(TableEl, omit(props, ['caption', 'empty', 'rows', 'isSelected', 'isCurrent', 'sort', 'onSortChange', 'loading']),
          props.caption ? h('caption', { className: 'hy-sr' }, props.caption) : null, props.children);
      }
      var cols = props.columns;
      var rows = props.rows || [];
      var skeletons = props.loading === true ? 5 : typeof props.loading === 'number' && props.loading > 0 ? Math.floor(props.loading) : 0;
      var loading = skeletons > 0;
      var caption = loading ? (props.caption ? props.caption + ', loading' : 'Loading') : props.caption;
      return h(TableRoot, { className: props.className },
        h(TableEl, { stickyHeader: props.stickyHeader, 'aria-busy': loading ? 'true' : undefined },
          caption ? h('caption', { className: 'hy-sr' }, caption) : null,
          h(TableHeader, null, h(TableRow, null, cols.map(function (c) {
            var active = props.sort && props.sort.key === c.key ? props.sort.direction : 'none';
            return h(TableHead, { key: c.key, align: alignOf(c), wrap: c.wrap, sort: c.sortable ? active : undefined, onSort: c.sortable ? sortClick(props, c.key) : undefined, sortDisabled: loading }, c.header);
          }))),
          h(TableBody, { striped: props.striped, bordered: props.bordered, interactive: props.interactive }, loading ? Array.apply(null, Array(skeletons)).map(function (_, i) {
            return h(TableSkeletonRow, { key: i, columns: cols, index: i });
          }) : rows.length ? rows.map(function (r, i) {
            return h(TableRow, { key: r.id || i, selected: props.isSelected ? props.isSelected(r) : undefined, current: props.isCurrent ? props.isCurrent(r) : undefined }, cols.map(function (c) {
              var v = c.render ? c.render(r) : r[c.key];
              return h(TableCell, { key: c.key, align: alignOf(c), wrap: c.wrap, truncate: c.truncate, className: cx(c.numeric && 'hy-num', c.mono && 'hy-mono') }, v);
            }));
          }) : h(TableRow, null, h(TableCell, { colSpan: cols.length, className: 'hy-table__empty' }, props.empty || 'Nothing here yet.')))));
    }

    Table.Root = TableRoot;
    Table.Colgroup = TableColgroup;
    Table.Col = TableCol;
    Table.Header = TableHeader;
    Table.Body = TableBody;
    Table.Footer = TableFooter;
    Table.Row = TableRow;
    Table.Head = TableHead;
    Table.Cell = TableCell;
    Table.SkeletonRow = TableSkeletonRow;

    define('Table', Table);
    define('TableRoot', TableRoot);
    define('TableColgroup', TableColgroup);
    define('TableCol', TableCol);
    define('TableHeader', TableHeader);
    define('TableBody', TableBody);
    define('TableFooter', TableFooter);
    define('TableRow', TableRow);
    define('TableHead', TableHead);
    define('TableCell', TableCell);
    define('TableSkeletonRow', TableSkeletonRow);
  })();

  /* ---- TextWithCopyButton ---- */
  (function () {
    function TextWithCopyButton(props) {
      var st = useState('idle');
      var timer = useRef(null);
      useEffect(function () { return function () { clearTimeout(timer.current); }; }, []);
      var label = props.textLabel != null ? props.textLabel : (props.children != null ? props.children : props.textToCopy);
      var payload = props.textToCopy != null ? props.textToCopy : (typeof label === 'string' ? label : '');
      var success = props.successMessage || 'Copied to clipboard';
      function onClick(e) {
        if (props.onClick) props.onClick(e);
        if (e.defaultPrevented) return;
        Promise.resolve(copyText(payload)).then(function () {
          st[1]('copied'); if (props.onCopy) props.onCopy(payload);
        }, function () { st[1]('failed'); });
        clearTimeout(timer.current);
        timer.current = setTimeout(function () { st[1]('idle'); }, 2000);
      }
      var copied = st[0] === 'copied';
      var saysCopy = typeof label === 'string' && /^copy\b/i.test(label);
      var rest = omit(props, ['textToCopy', 'textLabel', 'successMessage', 'ellipsis', 'onCopy', 'onClick', 'children', 'className']);
      return h('button', Object.assign({ type: 'button', title: props.ellipsis && typeof label === 'string' ? label : undefined }, rest, {
        className: cx('hy-twcb', props.ellipsis && 'hy-twcb--ellipsis', props.className), onClick: onClick
      }),
        h('span', { className: 'hy-twcb__text' }, label),
        saysCopy ? null : h('span', { className: 'hy-sr' }, ', Copy to Clipboard'),
        h('span', { className: 'hy-twcb__icon', 'aria-hidden': 'true' },
          h('span', { className: cx('hy-twcb__glyph', copied && 'is-out') }, h(Glyph, { name: 'copy' })),
          h('span', { className: cx('hy-twcb__glyph', !copied && 'is-out') }, h(Glyph, { name: 'check' }))),
        h('span', { className: 'hy-sr', 'aria-live': 'polite' }, copied ? success : (st[0] === 'failed' ? 'Copy failed' : '')));
    }

    define('TextWithCopyButton', TextWithCopyButton);
  })();

  /* ---- FileTree ---- */
  (function () {
    var FileTreeDepth = React.createContext(0);
    var FT_TYPE_ICON = { 'edge-function': 'square-function', lambda: 'lambda', middleware: 'square-m' };
    var FT_TYPE_LABEL = { 'edge-function': 'Edge Function', lambda: 'Function', middleware: 'Middleware' };

    function ftGuides(depth) {
      var out = [];
      for (var i = 0; i < depth; i++) out.push(h('span', { key: i, className: 'hy-ft__guide', style: { '--hy-ft-level': i }, 'aria-hidden': 'true' }));
      return out;
    }

    function FileTree(props) {
      var rest = omit(props, ['children', 'className']);
      return h(FileTreeDepth.Provider, { value: 0 },
        h('ul', Object.assign({}, rest, { className: cx('hy-ft', props.className), translate: 'no' }), props.children));
    }

    function FileTreeFolder(props) {
      var depth = React.useContext(FileTreeDepth);
      var c = useControllable(props.open, !!props.defaultOpen, props.onOpenChange);
      var open = c[0], setOpen = c[1];
      var id = useId();
      var rest = omit(props, ['name', 'open', 'defaultOpen', 'onOpenChange', 'children', 'className']);
      return h('li', Object.assign({}, rest, { className: cx('hy-ft__item', props.className) }),
        h('button', { type: 'button', className: 'hy-ft__row', style: { '--hy-ft-depth': depth }, 'aria-expanded': open, 'aria-controls': open ? id : undefined, onClick: function () { setOpen(!open); } },
          ftGuides(depth),
          h(HY.Icon, { name: open ? 'folder-open' : 'folder', className: 'hy-ft__icon' }),
          h('span', { className: 'hy-ft__name' }, props.name)),
        open ? h(FileTreeDepth.Provider, { value: depth + 1 }, h('ul', { id: id, className: 'hy-ft__group' }, props.children)) : null);
    }

    function FileTreeFile(props) {
      var depth = React.useContext(FileTreeDepth);
      var icon = FT_TYPE_ICON[props.type] || 'file';
      var rest = omit(props, ['name', 'href', 'type', 'active', 'className', 'children']);
      var inner = [
        ftGuides(depth),
        h(HY.Icon, { key: 'i', name: icon, className: 'hy-ft__icon' }),
        h('span', { key: 'n', className: 'hy-ft__name' }, props.name),
        FT_TYPE_LABEL[props.type] ? h('span', { key: 't', className: 'hy-sr' }, ', ' + FT_TYPE_LABEL[props.type]) : null
      ];
      var rowProps = { className: cx('hy-ft__row', props.active && 'is-active'), style: { '--hy-ft-depth': depth } };
      return h('li', { className: cx('hy-ft__item', props.className) },
        props.href
          ? h('a', Object.assign(rowProps, rest, { href: props.href, 'aria-current': props.active ? 'page' : undefined }), inner)
          : h('div', Object.assign(rowProps, rest), inner));
    }

    FileTree.Folder = FileTreeFolder;
    FileTree.File = FileTreeFile;

    define('FileTree', FileTree);
  })();

  /* ---- FilterParams ---- */
  (function () {
    /* A bar of URL-backed filters: "Add Filter" opens a two-step combobox (pick a filter, then a value),
       active filters show as removable pills, and suggested defaults show as dashed pills.
       Controlled through searchParams/onSearchParamsChange, or synced to location.search when uncontrolled. */
    var FP_EVENT = 'hy-searchparams';

    function toSearchParams(v) { return v instanceof URLSearchParams ? v : new URLSearchParams(v || ''); }

    function useSearchParamState() {
      var st = useState(function () { return new URLSearchParams(typeof location === 'undefined' ? '' : location.search); });
      useEffect(function () {
        function sync() { st[1](new URLSearchParams(location.search)); }
        window.addEventListener('popstate', sync);
        window.addEventListener(FP_EVENT, sync);
        return function () { window.removeEventListener('popstate', sync); window.removeEventListener(FP_EVENT, sync); };
      }, []);
      function set(next) {
        var s = toSearchParams(next).toString();
        history.replaceState(history.state, '', location.pathname + (s ? '?' + s : '') + location.hash);
        window.dispatchEvent(new Event(FP_EVENT));
      }
      return [st[0], set];
    }

    function fpDay(d) { return typeof d === 'string' ? d : d.toISOString().slice(0, 10); }
    function encodeDateRangeValue(v) {
      if (!v) return undefined;
      return v.kind === 'preset' ? v.preset : fpDay(v.start) + '..' + fpDay(v.end);
    }
    function decodeDateRangeValue(str, presets) {
      if (!str) return undefined;
      var hit = (presets || []).filter(function (p) { return (p.value || p.label) === str; })[0];
      if (hit) return { kind: 'preset', preset: str };
      var m = /^(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})$/.exec(str);
      return m ? { kind: 'custom', start: m[1], end: m[2] } : undefined;
    }
    function resolveDateRange(v, presets) {
      if (!v) return undefined;
      if (v.kind === 'custom') return { start: new Date(v.start), end: new Date(v.end) };
      var p = (presets || []).filter(function (x) { return (x.value || x.label) === v.preset; })[0];
      return p && p.range ? p.range() : undefined;
    }

    function fpOptions(param) {
      if (param.type === 'date-range') return (param.presets || []).map(function (p) { return { value: { kind: 'preset', preset: p.value || p.label }, label: p.label }; });
      return (param.options || []).map(function (o) { return typeof o === 'string' ? { value: o, label: o } : o; });
    }
    function fpKey(param, v) { return param.type === 'date-range' ? encodeDateRangeValue(v) : String(v); }
    function fpEmpty(v) { return v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length); }
    function fpEncode(param, v) {
      if (param.encode) return param.encode(fpEmpty(v) ? undefined : v);
      var o = {}, k = param.param || param.key;
      if (fpEmpty(v)) o[k] = undefined;
      else if (param.type === 'multi-select') o[k] = v.join(',');
      else if (param.type === 'date-range') o[k] = encodeDateRangeValue(v);
      else o[k] = String(v);
      return o;
    }
    function fpDecode(param, sp) {
      if (param.decode) return param.decode(sp);
      var raw = sp.get(param.param || param.key);
      if (raw === null || raw === '') return undefined;
      if (param.type === 'multi-select') return raw.split(',').filter(Boolean);
      if (param.type === 'date-range') return decodeDateRangeValue(raw, param.presets);
      return raw;
    }
    function fpOptionLabel(param, v) {
      if (param.optionLabel) return param.optionLabel(v);
      var k = fpKey(param, v);
      var o = fpOptions(param).filter(function (x) { return fpKey(param, x.value) === k; })[0];
      if (o) return o.label;
      return v && v.kind === 'custom' ? v.start + ' – ' + v.end : String(v);
    }
    function fpLabel(param, v) {
      if (param.label) return param.label(fpEmpty(v) ? undefined : v);
      if (fpEmpty(v)) return 'Any ' + param.key;
      if (Array.isArray(v)) return v.length > 2 ? fpOptionLabel(param, v[0]) + ' +' + (v.length - 1) : v.map(function (x) { return fpOptionLabel(param, x); }).join(', ');
      return fpOptionLabel(param, v);
    }

    /* The open popover: portalled and placed under its anchor by useFloating (flips, stays 8px inside the screen).
       Keyed by the anchor, so it re-places when another pill opens it. Calls onPlaced once it is visible. */
    function FilterParamsFloat(props) {
      var pos = useFloating(true, props.anchorRef, props.floatRef, { side: 'bottom', align: 'start', offset: 8 });
      var placed = !!pos;
      useLayoutEffect(function () {
        props.placedRef.current = placed;
        if (placed) props.onPlaced();
        return function () { props.placedRef.current = false; };
      }, [placed]);
      return portal(h('div', {
        ref: props.floatRef, className: cx('hy-filter-params__popover', pos && pos.side === 'top' && 'hy-filter-params__popover--top'),
        style: floatingStyle(pos)
      }, props.children));
    }

    function FilterParamsBar(props) {
      var params = props.params || [];
      var urlState = useSearchParamState();
      var controlled = props.searchParams !== undefined;
      var sp = controlled ? toSearchParams(props.searchParams) : urlState[0];
      function setSp(next) { if (controlled) { if (props.onSearchParamsChange) props.onSearchParamsChange(next); } else urlState[1](next); }

      var open = useState(!!props.defaultOpen);
      var step = useState(null);     /* null = choose a filter, else index into params */
      var query = useState('');
      var active = useState(0);
      var anchor = useState('add');  /* 'add' or a param index whose pill opened the popover */
      var barRef = useRef(null), addRef = useRef(null), inputRef = useRef(null), pillRefs = useRef({});
      var popRef = useRef(null), placedRef = useRef(false);
      var focusInput = useRef(false);
      var uid = useId();
      var listId = uid + '-list';

      var values = params.map(function (p) { return fpDecode(p, sp); });

      function anchorEl(a) { return a === 'add' ? addRef.current : pillRefs.current[a]; }
      /* Read when the popover is placed: the anchor's ref is attached after the popover's first layout effect. */
      var anchorNow = useRef(null);
      anchorNow.current = anchor[0];
      var floatAnchor = useMemo(function () {
        return { get current() { return anchorEl(anchorNow.current) || addRef.current; } };
      }, []);
      /* Focus the search input when asked to, but only once the popover is placed (it is hidden until then). */
      function focusIfAsked() {
        if (focusInput.current && inputRef.current && placedRef.current) {
          inputRef.current.focus({ preventScroll: true });
          focusInput.current = false;
        }
      }
      useEffect(function () {
        if (open[0]) focusIfAsked(); else focusInput.current = false;
      }, [open[0], step[0]]);

      function openAt(a, s) {
        focusInput.current = true;
        anchor[1](a); step[1](s); query[1](''); active[1](0); open[1](true);
      }
      function close(returnFocus) {
        var a = anchorNow.current; /* useDismiss keeps the first close it was given, so read the anchor from a ref */
        open[1](false); step[1](null); query[1](''); active[1](0);
        if (returnFocus) { var el = anchorEl(a) || addRef.current; if (el) el.focus({ preventScroll: true }); }
      }
      useDismiss(open[0], [barRef, popRef], function (why) { close(why === 'escape'); });

      function apply(param, v) {
        var next = new URLSearchParams(sp.toString());
        var enc = fpEncode(param, v);
        Object.keys(enc).forEach(function (k) { if (enc[k] === undefined || enc[k] === '') next.delete(k); else next.set(k, enc[k]); });
        setSp(next);
      }
      function merge(extra) {
        var next = new URLSearchParams(sp.toString());
        toSearchParams(extra).forEach(function (val, k) { next.set(k, val); });
        setSp(next);
      }

      var q = query[0].trim().toLowerCase();
      var items = [];
      if (step[0] === null) {
        if (props.ai && q) items.push({ kind: 'ai', label: query[0].trim() });
        params.forEach(function (p, i) { if (!q || p.key.toLowerCase().indexOf(q) !== -1) items.push({ kind: 'param', index: i, label: p.key }); });
      } else {
        var param = params[step[0]];
        if (!q) items.push({ kind: 'clear', label: fpLabel(param, undefined) });
        fpOptions(param).forEach(function (o) {
          var label = param.optionLabel ? param.optionLabel(o.value) : o.label;
          if (!q || String(label).toLowerCase().indexOf(q) !== -1) items.push({ kind: 'option', value: o.value, label: label });
        });
      }
      var act = Math.min(active[0], Math.max(0, items.length - 1));

      function isSelected(item) {
        if (step[0] === null) return false;
        var p = params[step[0]], v = values[step[0]];
        if (item.kind === 'clear') return fpEmpty(v);
        if (fpEmpty(v)) return false;
        var k = fpKey(p, item.value);
        return Array.isArray(v) ? v.some(function (x) { return fpKey(p, x) === k; }) : fpKey(p, v) === k;
      }
      function choose(item) {
        if (!item) return;
        if (item.kind === 'param') { focusInput.current = true; step[1](item.index); query[1](''); active[1](0); return; }
        if (item.kind === 'ai') {
          var res = props.ai.onQuery && props.ai.onQuery(item.label);
          if (res && typeof res.then === 'function') res.then(function (out) { if (out) merge(out); close(false); }, function () {});
          else { if (res) merge(res); close(true); }
          return;
        }
        var p = params[step[0]];
        if (item.kind === 'clear') { apply(p, undefined); if (p.type !== 'multi-select') close(anchor[0] === 'add'); return; }
        if (p.type === 'multi-select') {
          var cur = values[step[0]] || [], k = fpKey(p, item.value);
          var has = cur.some(function (x) { return fpKey(p, x) === k; });
          apply(p, has ? cur.filter(function (x) { return fpKey(p, x) !== k; }) : cur.concat([item.value]));
          return;
        }
        apply(p, item.value);
        close(true);
      }
      function onKeyDown(e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); active[1]((act + 1) % Math.max(1, items.length)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); active[1]((act - 1 + items.length) % Math.max(1, items.length)); }
        else if (e.key === 'Home' && !query[0]) { e.preventDefault(); active[1](0); }
        else if (e.key === 'End' && !query[0]) { e.preventDefault(); active[1](items.length - 1); }
        else if (e.key === 'Enter') { e.preventDefault(); choose(items[act]); }
        else if (e.key === 'Backspace' && !query[0] && step[0] !== null && anchor[0] === 'add') { e.preventDefault(); step[1](null); active[1](0); }
        else if (e.key === 'Tab') {
          if (e.shiftKey && stepParam) return; /* to the Back chip, still inside the popover */
          /* The popover lives at the end of <body>: continue tabbing from the element that opened it. */
          var from = anchorEl(anchor[0]) || addRef.current;
          if (from) { if (e.shiftKey) e.preventDefault(); from.focus({ preventScroll: true }); }
          close(false);
        }
      }

      var suggestions = [];
      params.forEach(function (p, i) {
        if (!fpEmpty(values[i]) || !p.suggestion) return;
        var s = p.suggestion();
        if (!fpEmpty(s)) suggestions.push({ index: i, value: s });
      });
      var stepParam = step[0] === null ? null : params[step[0]];
      var thinking = props.ai && props.ai.isThinking;

      var popover = open[0] ? h(FilterParamsFloat, { key: String(anchor[0]), anchorRef: floatAnchor, floatRef: popRef, placedRef: placedRef, onPlaced: focusIfAsked },
        h('div', { className: 'hy-filter-params__search' },
          stepParam ? h('button', {
            type: 'button', className: 'hy-filter-params__chip', 'aria-label': 'Back to filters (' + stepParam.key + ')',
            onClick: function () { focusInput.current = true; step[1](null); query[1](''); active[1](0); }
          }, stepParam.key, h(HY.Icon, { name: 'chevron-down', size: 14 })) : h(HY.Icon, { name: props.ai ? 'sparkles' : 'list-filter', size: 16, className: 'hy-filter-params__search-icon' }),
          h('input', {
            ref: inputRef, type: 'text', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': listId, 'aria-autocomplete': 'list',
            'aria-activedescendant': items.length ? listId + '-' + act : undefined, autoComplete: 'off', spellCheck: false,
            'aria-label': stepParam ? 'Filter ' + stepParam.key + ' to' : 'Filter by',
            placeholder: stepParam ? 'Filter to…' : (props.ai ? 'Filter by, or describe what you want…' : 'Filter by…'),
            value: query[0], onChange: function (e) { query[1](e.target.value); active[1](0); }, onKeyDown: onKeyDown
          })),
        thinking ? h('div', { className: 'hy-filter-params__thinking', role: 'status' },
          h(HY.Spinner, { size: 'sm' }), h('span', null, 'Thinking…'),
          props.ai.onAbort ? h('button', { type: 'button', className: 'hy-filter-params__stop', onClick: props.ai.onAbort }, 'Stop') : null) : null,
        h('ul', { id: listId, role: 'listbox', className: 'hy-filter-params__list', 'aria-label': stepParam ? stepParam.key : 'Filters',
          'aria-multiselectable': stepParam && stepParam.type === 'multi-select' ? 'true' : undefined },
          items.length ? items.map(function (it, i) {
            var sel = isSelected(it);
            return h('li', {
              key: it.kind + ':' + (it.index !== undefined ? it.index : it.label), id: listId + '-' + i, role: 'option',
              'aria-selected': stepParam ? sel : i === act, className: cx('hy-filter-params__option', i === act && 'hy-filter-params__option--active'),
              onMouseDown: function (e) { e.preventDefault(); }, onMouseMove: function () { if (i !== act) active[1](i); },
              onClick: function () { choose(it); }
            },
              it.kind === 'ai' ? h(HY.Icon, { name: 'sparkles', size: 16, className: 'hy-filter-params__affix' }) : null,
              h('span', { className: 'hy-filter-params__text' }, it.label),
              it.kind === 'param' ? h(HY.Icon, { name: 'chevron-right', size: 16, className: 'hy-filter-params__affix hy-filter-params__affix--end' }) : null,
              stepParam && sel ? h(HY.Icon, { name: 'check', size: 16, className: 'hy-filter-params__affix hy-filter-params__affix--end' }) : null);
          }) : h('li', { className: 'hy-filter-params__none', role: 'presentation' }, 'No matches'))) : null;

      return h('div', { ref: barRef, className: cx('hy-filter-params', props.className), role: 'group', 'aria-label': props['aria-label'] || 'Filters' },
        h(HY.Button, {
          ref: addRef, size: 'small', variant: 'secondary', shape: 'rounded', prefix: h(HY.Icon, { name: 'list-filter', size: 16 }),
          'aria-haspopup': 'listbox', 'aria-expanded': open[0] && anchor[0] === 'add',
          onClick: function () { if (open[0] && anchor[0] === 'add') close(false); else openAt('add', null); }
        }, props.addLabel || 'Add Filter'),
        params.map(function (p, i) {
          if (fpEmpty(values[i])) return null;
          return h('span', { key: 'a' + i, className: 'hy-filter-pill' },
            h('button', {
              type: 'button', ref: function (el) { pillRefs.current[i] = el; }, className: 'hy-filter-pill__main',
              'aria-haspopup': 'listbox', 'aria-expanded': open[0] && anchor[0] === i,
              onClick: function () { if (open[0] && anchor[0] === i) close(false); else openAt(i, i); }
            }, h('span', { className: 'hy-filter-pill__key' }, p.key), h('span', { className: 'hy-filter-pill__value' }, fpLabel(p, values[i]))),
            h('button', {
              type: 'button', className: 'hy-filter-pill__remove', 'aria-label': 'Remove ' + p.key + ' filter',
              onClick: function () { apply(p, undefined); if (open[0]) close(false); if (addRef.current) addRef.current.focus(); }
            }, h(HY.Icon, { name: 'x', size: 14 })));
        }),
        suggestions.map(function (s) {
          var p = params[s.index];
          return h('button', { key: 's' + s.index, type: 'button', className: 'hy-filter-suggestion',
            onClick: function () { apply(p, s.value); } },
            h(HY.Icon, { name: 'plus', size: 14 }),
            h('span', { className: 'hy-filter-pill__key' }, p.key), h('span', { className: 'hy-filter-pill__value' }, fpLabel(p, s.value)));
        }),
        popover);
    }

    FilterParamsBar.useSearchParamState = useSearchParamState;
    FilterParamsBar.encodeDateRangeValue = encodeDateRangeValue;
    FilterParamsBar.decodeDateRangeValue = decodeDateRangeValue;
    FilterParamsBar.resolveDateRange = resolveDateRange;

    define('FilterParams', FilterParamsBar);
    define('FilterParamsBar', FilterParamsBar);
  })();

  /* ---- Gauge ---- */
  (function () {
    var GAUGE_PX = { tiny: 20, small: 32, medium: 64, large: 128 };
    var GAUGE_GAP = { tiny: 9, small: 6, medium: 5, large: 5 };
    var GAUGE_ICON = { tiny: 10, small: 16, medium: 32, large: 64 };
    var GAUGE_DEFAULT_COLORS = { 0: 'var(--red-800)', 34: 'var(--amber-700)', 67: 'var(--green-700)' };

    function gaugeThreshold(colors, value) {
      var keys = Object.keys(colors).map(Number).filter(function (k) { return !isNaN(k); }).sort(function (a, b) { return a - b; });
      var pick = keys.length ? colors[keys[0]] : undefined;
      keys.forEach(function (k) { if (value >= k) pick = colors[k]; });
      return pick;
    }

    /* One arc on a circle whose length is normalised to 100, starting `start` percent clockwise from 12 o'clock. */
    function gaugeArc(r, sw, start, len, color, cls, key) {
      if (len <= 0) return null;
      return h('circle', {
        key: key, className: cls, cx: 50, cy: 50, r: r, fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round',
        pathLength: 100, strokeDasharray: len + ' ' + (100 - len), strokeDashoffset: -start, transform: 'rotate(-90 50 50)'
      });
    }

    /* A circular meter for a single 0–100 value. */
    function Gauge(props) {
      var size = GAUGE_PX[props.size] ? props.size : 'medium';
      var px = GAUGE_PX[size];
      var tiny = size === 'tiny';
      var r = tiny ? 42.5 : 45, sw = tiny ? 15 : 10;
      var value = Math.max(0, Math.min(100, Number(props.value) || 0));
      var colors = props.colors || GAUGE_DEFAULT_COLORS;
      var primary = colors.primary !== undefined ? colors.primary : gaugeThreshold(colors, value);
      var secondary = colors.secondary !== undefined ? colors.secondary : 'var(--gray-alpha-400)';
      var fmt = useMemo(function () {
        try { return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }); } catch (e) { return { format: function (n) { return String(Math.round(n)); } }; }
      }, []);

      var arcs, centre = null;
      if (props.indeterminate) {
        arcs = gaugeArc(r, sw, 0, 100, 'var(--gray-alpha-400)', 'hy-gauge__track');
        centre = h(HY.Icon, { name: 'activity', size: GAUGE_ICON[size], className: 'hy-gauge__icon' });
      } else {
        var gap = value >= 100 || value <= 0 ? 0 : GAUGE_GAP[size];
        if (props.arcPriority === 'equal') {
          arcs = [gaugeArc(r, sw, gap / 2, value - gap, primary, 'hy-gauge__value', 'value'),
            gaugeArc(r, sw, value + gap / 2, 100 - value - gap, secondary, 'hy-gauge__track', 'track')];
        } else {
          arcs = [gaugeArc(r, sw, 0, value, primary, 'hy-gauge__value', 'value'),
            gaugeArc(r, sw, value + gap, 100 - value - 2 * gap, secondary, 'hy-gauge__track', 'track')];
        }
        if (props.children) centre = props.children;
        else if (props.showValue && !tiny) centre = h('span', { className: 'hy-gauge__number', 'aria-hidden': 'true' }, fmt.format(value));
      }

      return h('div', {
        className: cx('hy-gauge', 'hy-gauge--' + size, props.indeterminate && 'is-indeterminate', props.className),
        style: Object.assign({ width: px, height: px }, props.style),
        role: 'progressbar', 'aria-label': props['aria-label'] || 'Score', 'aria-valuemin': 0, 'aria-valuemax': 100,
        'aria-valuenow': props.indeterminate ? undefined : value, 'aria-busy': props.indeterminate || undefined
      },
        h('svg', { className: 'hy-gauge__svg', viewBox: '0 0 100 100', width: px, height: px, 'aria-hidden': 'true', focusable: 'false' }, arcs),
        centre ? h('span', { className: 'hy-gauge__centre' }, centre) : null);
    }

    define('Gauge', Gauge);
  })();

  /* ---- JsonView ---- */
  (function () {
    function makeJsonViewHighlightPattern(terms) {
      var list = (Array.isArray(terms) ? terms : [terms]).filter(function (t) { return t != null && String(t).trim() !== ''; });
      if (!list.length) return null;
      return new RegExp('(' + list.map(function (t) { return String(t).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'gi');
    }

    var JV_IDENT = /^[A-Za-z_$][\w$]*$/;
    function jvKind(v) {
      if (v === null) return 'null';
      if (Array.isArray(v)) return 'array';
      return typeof v === 'object' ? 'object' : typeof v;
    }
    function jvEntries(v) {
      return Array.isArray(v) ? v.map(function (x, i) { return [i, x]; }) : Object.keys(v).map(function (k) { return [k, v[k]]; });
    }
    function jvText(v) {
      var k = jvKind(v);
      if (k === 'string') return JSON.stringify(v);
      if (k === 'undefined') return 'undefined';
      return String(v);
    }
    function jvIsContainer(v) { var k = jvKind(v); return k === 'object' || k === 'array'; }
    /* one short primitive entry stays on one line: { name: "web" } */
    function jvInline(v) {
      if (!jvIsContainer(v)) return false;
      var e = jvEntries(v);
      if (!e.length) return true;
      if (e.length > 1 || jvIsContainer(e[0][1])) return false;
      return String(e[0][0]).length + jvText(e[0][1]).length <= 32;
    }

    function JsonView(props) {
      var data = props.data;
      var depthDefault = props.defaultExpandDepth == null ? 1 : props.defaultExpandDepth;
      var pattern = props.highlightPattern;
      var ov = useState({}), overrides = ov[0], setOverrides = ov[1];
      var fs = useState('$'), focused = fs[0], setFocused = fs[1];
      var refs = useRef({});

      function isOpen(path, depth) { return Object.prototype.hasOwnProperty.call(overrides, path) ? overrides[path] : depth < depthDefault; }
      function setOpen(path, open) { setOverrides(function (o) { var n = Object.assign({}, o); n[path] = open; return n; }); }

      /* flat list of visible items, in reading order, for the keyboard */
      var visible = [];
      function walk(v, path, depth, parent) {
        var expandable = jvIsContainer(v) && !jvInline(v);
        var open = expandable && isOpen(path, depth);
        visible.push({ path: path, parent: parent, expandable: expandable, open: open });
        if (open) jvEntries(v).forEach(function (e) { walk(e[1], path + '\u0000' + e[0], depth + 1, path); });
      }
      walk(data, '$', 0, null);
      var focusPath = visible.some(function (n) { return n.path === focused; }) ? focused : '$';

      function move(path) {
        setFocused(path);
        var el = refs.current[path];
        if (el) el.focus();
      }
      function onKeyDown(e) {
        var i = -1;
        for (var j = 0; j < visible.length; j++) if (visible[j].path === focusPath) i = j;
        var n = visible[i];
        if (!n) return;
        var k = e.key;
        if (k === 'ArrowDown') { if (i < visible.length - 1) move(visible[i + 1].path); }
        else if (k === 'ArrowUp') { if (i > 0) move(visible[i - 1].path); }
        else if (k === 'Home') move(visible[0].path);
        else if (k === 'End') move(visible[visible.length - 1].path);
        else if (k === 'ArrowRight') {
          if (n.expandable && !n.open) setOpen(n.path, true);
          else if (n.open && visible[i + 1]) move(visible[i + 1].path);
        } else if (k === 'ArrowLeft') {
          if (n.open) setOpen(n.path, false);
          else if (n.parent) move(n.parent);
        } else if (k === 'Enter' || k === ' ') { if (n.expandable) setOpen(n.path, !n.open); }
        else return;
        e.preventDefault();
      }

      function hl(text) {
        if (!pattern) return text;
        var re = new RegExp(pattern.source, pattern.flags.indexOf('g') < 0 ? pattern.flags + 'g' : pattern.flags);
        var out = [], last = 0, m, key = 0;
        while ((m = re.exec(text))) {
          if (!m[0]) { re.lastIndex++; continue; }
          if (m.index > last) out.push(text.slice(last, m.index));
          out.push(h('mark', { key: key++, className: 'hy-jv__mark' }, m[0]));
          last = m.index + m[0].length;
        }
        if (!out.length) return text;
        if (last < text.length) out.push(text.slice(last));
        return out;
      }
      function keyNode(k) {
        if (k == null || typeof k === 'number') return null;
        return h(React.Fragment, null, h('span', { className: 'hy-jv__key' }, hl(JV_IDENT.test(k) ? k : JSON.stringify(k))), h('span', { className: 'hy-jv__punct' }, ': '));
      }
      function prim(v) { return h('span', { className: 'hy-jv__' + jvKind(v) }, hl(jvText(v))); }
      function inlineValue(v) {
        var arr = Array.isArray(v), e = jvEntries(v);
        if (!e.length) return h('span', { className: 'hy-jv__punct' }, arr ? '[]' : '{}');
        return h(React.Fragment, null, h('span', { className: 'hy-jv__punct' }, arr ? '[ ' : '{ '), keyNode(arr ? null : e[0][0]), prim(e[0][1]), h('span', { className: 'hy-jv__punct' }, arr ? ' ]' : ' }'));
      }
      function describe(k, v) {
        var kind = jvKind(v), name;
        if (kind === 'object' || kind === 'array') {
          var n = jvEntries(v).length;
          name = kind + ', ' + n + (kind === 'array' ? (n === 1 ? ' item' : ' items') : (n === 1 ? ' key' : ' keys'));
        } else name = kind === 'string' ? v : String(v);
        if (k == null) return (kind === 'object' || kind === 'array' ? 'JSON ' : '') + name;
        return k + ': ' + name;
      }

      function item(k, v, path, depth, pos, size) {
        var expandable = jvIsContainer(v) && !jvInline(v);
        var open = expandable && isOpen(path, depth);
        var arr = Array.isArray(v);
        var comma = pos < size ? h('span', { className: 'hy-jv__punct' }, ',') : null;
        function toggle(e) {
          var sel = window.getSelection && window.getSelection();
          if (sel && String(sel).length) return;
          e.stopPropagation();
          move(path);
          if (expandable) setOpen(path, !open);
        }
        var value = expandable
          ? (open ? h('span', { className: 'hy-jv__punct' }, arr ? '[' : '{')
            : h(React.Fragment, null, h('span', { className: 'hy-jv__punct' }, arr ? '[' : '{'), h('span', { className: 'hy-jv__more' }, '…'), h('span', { className: 'hy-jv__punct' }, arr ? ']' : '}'), comma))
          : h(React.Fragment, null, jvIsContainer(v) ? inlineValue(v) : prim(v), comma);
        return h('div', {
          key: path, role: 'treeitem', className: 'hy-jv__item',
          'aria-level': depth + 1, 'aria-setsize': size, 'aria-posinset': pos,
          'aria-expanded': expandable ? open : undefined, 'aria-label': describe(typeof k === 'number' ? String(k) : k, v),
          tabIndex: path === focusPath ? 0 : -1,
          ref: function (el) { refs.current[path] = el; },
          onFocus: function (e) { if (e.target === e.currentTarget) setFocused(path); }
        },
          h('div', { className: cx('hy-jv__row', expandable && 'is-expandable'), onClick: toggle },
            expandable ? h('span', { className: cx('hy-jv__toggle', open && 'is-open'), 'aria-hidden': 'true' }, h(Glyph, { name: 'chevron', size: 12 })) : null,
            keyNode(k), value),
          open ? h('div', { role: 'group', className: 'hy-jv__group' }, jvEntries(v).map(function (e, i, all) {
            return item(arr ? i : e[0], e[1], path + '\u0000' + e[0], depth + 1, i + 1, all.length);
          })) : null,
          open ? h('div', { className: 'hy-jv__close', 'aria-hidden': 'true' }, h('span', { className: 'hy-jv__punct' }, arr ? ']' : '}'), comma) : null);
      }

      var rest = omit(props, ['data', 'defaultExpandDepth', 'highlightPattern', 'className', 'aria-label']);
      return h('div', Object.assign({}, rest, {
        role: 'tree', 'aria-label': props['aria-label'] || 'JSON', translate: 'no',
        className: cx('hy-jv', props.className), onKeyDown: onKeyDown
      }), item(null, data, '$', 0, 1, 1));
    }
    JsonView.makeJsonViewHighlightPattern = makeJsonViewHighlightPattern;

    define('JsonView', JsonView);
    define('makeJsonViewHighlightPattern', makeJsonViewHighlightPattern);
  })();

  /* ---- CommandMenu ---- */
  (function () {
    /* CommandMenu: a compound API (CommandMenu + CommandMenuInput/List/Group/Item/Divider)
       plus the original data shorthand (groups/open/onOpenChange/inline). */
    var CmdCtx = React.createContext(null);

    function cmdText(node) {
      if (node == null || typeof node === 'boolean') return '';
      if (typeof node === 'string' || typeof node === 'number') return String(node);
      if (Array.isArray(node)) return node.map(cmdText).join(' ');
      if (node.props) return cmdText(node.props.children);
      return '';
    }
    /* ctx.filter (a function) replaces the built-in word match; ctx.needle is '' when filtering is off. */
    function cmdMatches(props, ctx) {
      var needle = ctx.needle;
      if (!needle) return true;
      if (ctx.filter) {
        return !!ctx.filter({ value: props.value != null ? props.value : cmdText(props.children), keywords: props.keywords || [] }, ctx.query.trim());
      }
      var hay = [props.value != null ? props.value : cmdText(props.children)].concat(props.keywords || []).join(' ').toLowerCase();
      return needle.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
    }

    /* Forwards its ref to the <input>; CommandMenu's inputRef prop points at the same element. */
    var CommandMenuInput = React.forwardRef(function CommandMenuInput(props, ref) {
      var ctx = React.useContext(CmdCtx);
      var hideClose = props.hideClose || props.closeButton === false;
      return h('div', { className: cx('hy-cmd__search', props.className) },
        props.prefix ? h('span', { className: 'hy-cmd__prefix' }, props.prefix) : null,
        h('input', {
          className: 'hy-cmd__input', type: 'text', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': ctx.listId,
          'aria-activedescendant': ctx.active || undefined, 'aria-autocomplete': 'list', 'aria-label': props['aria-label'] || ctx.label,
          ref: function (el) {
            if (typeof ref === 'function') ref(el); else if (ref) ref.current = el;
            if (ctx.inputRef) { if (typeof ctx.inputRef === 'function') ctx.inputRef(el); else ctx.inputRef.current = el; }
          },
          autoComplete: 'off', autoCorrect: 'off', spellCheck: false, 'data-autofocus': true,
          placeholder: props.placeholder || 'Search for a command or page…',
          value: ctx.query, onChange: function (e) { ctx.setQuery(e.target.value); }
        }),
        hideClose ? null : h('button', { type: 'button', className: 'hy-cmd__esc', 'aria-label': 'Close', onClick: ctx.close },
          h('span', { className: 'hy-cmd__esc-key', 'aria-hidden': 'true' }, 'Esc'), h('span', { className: 'hy-cmd__esc-x', 'aria-hidden': 'true' }, h(Glyph, { name: 'x', size: 14 }))));
    });
    CommandMenuInput.displayName = 'CommandMenuInput';

    function CommandMenuList(props) {
      var ctx = React.useContext(CmdCtx);
      var q = ctx.query.trim();
      var loading = !!props.loading;
      return h('div', { ref: ctx.listRef, id: ctx.listId, role: 'listbox', 'aria-label': 'Results', 'aria-busy': loading || undefined, className: cx('hy-cmd__list', props.className) },
        props.children,
        loading ? h('div', { className: 'hy-cmd__loading', 'aria-live': 'polite' },
          h(HY.Spinner, { size: 16 }), h('span', null, props.loadingLabel || 'Searching…')) : null,
        !loading && ctx.count === 0 && q ? h('div', { className: 'hy-cmd__empty' }, props.empty || 'No results for “' + q + '”.') : null);
    }

    function CommandMenuGroup(props) {
      var ctx = React.useContext(CmdCtx);
      var needle = ctx.needle;
      var gid = useId();
      if (needle) {
        var any = false;
        (function walk(nodes) {
          React.Children.forEach(nodes, function (c) {
            if (any || !c || !c.type) return;
            if (c.type === CommandMenuItem) { if (cmdMatches(c.props, ctx)) any = true; }
            else if (c.type === React.Fragment) walk(c.props.children);
            else any = true;
          });
        })(props.children);
        if (!any) return null;
      }
      return h('div', { role: 'group', 'aria-labelledby': props.heading ? gid : undefined, className: cx('hy-cmd__group', props.className) },
        props.heading ? h('div', { id: gid, className: 'hy-cmd__heading', 'aria-hidden': 'true' }, props.heading) : null,
        props.children);
    }

    function CommandMenuItem(props) {
      var ctx = React.useContext(CmdCtx);
      var id = useId();
      if (!cmdMatches(props, ctx)) return null;
      var isActive = ctx.active === id;
      function select() {
        if (props.disabled) return;
        var keep = props.keepOpen;
        var fn = props.callback || props.onSelect;
        if (!keep) ctx.close();
        if (fn) fn();
      }
      return h('div', {
        id: id, role: 'option', 'aria-selected': isActive, 'aria-disabled': props.disabled || undefined,
        className: cx('hy-cmd__item', isActive && 'is-active', props.disabled && 'is-disabled', props.className),
        onMouseMove: function () { if (!isActive && !props.disabled) ctx.setActive(id); },
        onClick: select
      },
        props.prefix ? h('span', { className: 'hy-cmd__icon', 'aria-hidden': 'true' }, props.prefix) : null,
        h('span', { className: 'hy-cmd__label' }, props.children),
        props.suffix ? h('span', { className: 'hy-cmd__suffix' }, props.suffix) : null);
    }

    function CommandMenuDivider(props) {
      var ctx = React.useContext(CmdCtx);
      if (ctx.needle) return null;
      return h('div', { role: 'separator', className: cx('hy-cmd__divider', props.className) });
    }

    function cmdFromGroups(groups) {
      return (groups || []).map(function (g) {
        return h(CommandMenuGroup, { key: g.heading, heading: g.heading },
          g.items.map(function (it) {
            return h(CommandMenuItem, { key: it.label, value: it.label, keywords: it.keywords, callback: it.onSelect, prefix: it.icon, suffix: it.shortcut, disabled: it.disabled }, it.label);
          }));
      });
    }

    function CommandMenu(props) {
      var q = useControllable(props.query, '', props.onQueryChange);
      var act = useState(null);
      var cnt = useState(-1);
      var box = useRef(null), listRef = useRef(null), sigRef = useRef('');
      var lid = useId();
      var open = !!props.open;
      var setOpen = props.setOpen || props.onOpenChange;
      useOverlayFocus(open, box);
      useEffect(function () {
        if (props.hotkey === false) return;
        function onKey(e) {
          if ((e.metaKey || e.ctrlKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            if (setOpen) setOpen(!open);
          }
        }
        window.addEventListener('keydown', onKey);
        return function () { window.removeEventListener('keydown', onKey); };
      }, [open, props.hotkey, setOpen]);
      useEffect(function () { if (!open) { if (q[0] !== '') q[1](''); act[1](null); } }, [open]);

      function options() {
        return listRef.current ? Array.prototype.slice.call(listRef.current.querySelectorAll('[role="option"]:not([aria-disabled="true"])')) : [];
      }
      /* After every render: keep the result count current and the active option valid. */
      useLayoutEffect(function () {
        if (!open) return;
        var opts = options();
        if (cnt[0] !== opts.length) cnt[1](opts.length);
        var ids = opts.map(function (o) { return o.id; });
        /* The item set changed (new results, new order): start again from the first option. */
        var sig = ids.join(' ');
        var changed = sigRef.current !== sig;
        sigRef.current = sig;
        if (ids.indexOf(act[0]) < 0 || (changed && act[0] !== ids[0])) act[1](ids[0] || null);
      });
      useLayoutEffect(function () { act[1](function () { var o = options(); return o[0] ? o[0].id : null; }); }, [q[0]]);
      useLayoutEffect(function () {
        var el = act[0] && document.getElementById(act[0]);
        if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
      }, [act[0]]);

      if (!open) return null;
      function close() { if (setOpen) setOpen(false); }
      function move(delta) {
        var opts = options();
        if (!opts.length) return;
        var i = opts.map(function (o) { return o.id; }).indexOf(act[0]);
        var next = delta === Infinity ? opts.length - 1 : delta === -Infinity ? 0 : (i + delta + opts.length) % opts.length;
        act[1](opts[next].id);
      }
      /* The menu's own keys come from the dialog itself, the search input or the list. A key from
         anything else, such as the Esc button or a panel the app renders in place of the list, is left to the app and the browser. */
      function ownTarget(t) {
        return t === box.current || !!(t && t.closest && t.closest('.hy-cmd__search') && !t.closest('.hy-cmd__esc')) || !!(listRef.current && listRef.current.contains(t));
      }
      function onKey(e) {
        var skipped = false;
        e.skipMenu = function () { skipped = true; };
        if (props.onKeyDown) props.onKeyDown(e);
        if (e.defaultPrevented) return;
        /* Tab stays trapped for every target; skipMenu() and foreign targets only skip the other keys. */
        if (skipped || !ownTarget(e.target)) { trapTab(e, box.current); return; }
        var ctrlNP = e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey;
        if (e.key === 'ArrowDown' || (ctrlNP && (e.key === 'n' || e.key === 'N'))) { e.preventDefault(); move(1); }
        else if (e.key === 'ArrowUp' || (ctrlNP && (e.key === 'p' || e.key === 'P'))) { e.preventDefault(); move(-1); }
        else if (e.key === 'Home' && e.ctrlKey) { e.preventDefault(); move(-Infinity); }
        else if (e.key === 'End' && e.ctrlKey) { e.preventDefault(); move(Infinity); }
        else if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
          e.preventDefault();
          var el = act[0] && document.getElementById(act[0]);
          if (el) el.click();
        }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
        trapTab(e, box.current);
      }
      var filtering = props.shouldFilter !== false;
      var needle = filtering ? q[0].trim().toLowerCase() : '';
      var ctx = {
        query: q[0], needle: needle, filter: filtering && typeof props.filter === 'function' ? props.filter : null, setQuery: q[1], active: act[0], setActive: act[1],
        listId: lid, listRef: listRef, inputRef: props.inputRef, count: cnt[0], close: close, label: props.label || 'Command Menu'
      };
      var body = props.children !== undefined ? props.children : [
        h(CommandMenuInput, { key: 'i', placeholder: props.placeholder }),
        h(CommandMenuList, { key: 'l' }, cmdFromGroups(props.groups))
      ];
      var live = q[0].trim() && cnt[0] >= 0 ? (cnt[0] === 1 ? '1 result' : cnt[0] + ' results') : '';
      var node = h(CmdCtx.Provider, { value: ctx },
        h('div', { className: 'hy-overlay hy-overlay--top hy-cmd-overlay', onMouseDown: function (e) { if (e.target === e.currentTarget) close(); } },
          h('div', { ref: box, role: 'dialog', 'aria-modal': 'true', 'aria-label': ctx.label, tabIndex: -1, className: cx('hy-cmd', props.className), onKeyDown: onKey },
            body,
            h('div', { className: 'hy-sr', 'aria-live': 'polite', 'aria-atomic': 'true' }, live))));
      return props.inline ? node : portal(node);
    }

    CommandMenu.Input = CommandMenuInput;
    CommandMenu.List = CommandMenuList;
    CommandMenu.Group = CommandMenuGroup;
    CommandMenu.Item = CommandMenuItem;
    CommandMenu.Divider = CommandMenuDivider;

    define('CommandMenuInput', CommandMenuInput);
    define('CommandMenuList', CommandMenuList);
    define('CommandMenuGroup', CommandMenuGroup);
    define('CommandMenuItem', CommandMenuItem);
    define('CommandMenuDivider', CommandMenuDivider);
    define('CommandMenu', CommandMenu);
  })();

  /* ---- ContextCard ---- */
  (function () {
    /* ContextCard (alias ContextCardTrigger): a floating card with richer content than a tooltip,
       shown on hover or focus of its trigger. On touch screens a tap on the trigger toggles it (the first
       tap on a link opens the card instead of following it) and a tap outside closes it.
       The card is portaled to <body> while open and placed with useFloating, so it stays on screen. */
    function ContextCardTip(p) {
      return h('svg', { className: 'hy-ctx__tip', style: p.style, width: 14, height: 7, viewBox: '0 0 14 7', 'aria-hidden': 'true', focusable: 'false' },
        h('path', { className: 'hy-ctx__tip-fill', d: 'M0 0h14L8.4 6.1a1.9 1.9 0 0 1-2.8 0z' }),
        h('path', { className: 'hy-ctx__tip-stroke', d: 'M0 .5h.6l5 5.4a1.9 1.9 0 0 0 2.8 0l5-5.4h.6', fill: 'none' }));
    }

    function ContextCard(props) {
      var st = useState(!!props.defaultOpen);
      var open = st[0], setOpen = st[1];
      var id = useId();
      var timer = useRef(null);
      var root = useRef(null);
      var card = useRef(null);
      var lastTouch = useRef(0);
      var side = props.side || 'top';
      var align = props.align || 'center';
      var delay = typeof props.delay === 'number' ? props.delay : 150;
      var pos = useFloating(open, root, card, { side: side, align: align, offset: 8 });
      useEffect(function () { return function () { clearTimeout(timer.current); }; }, []);
      useEffect(function () { if (props.onOpenChange) props.onOpenChange(open); }, [open]);
      useDismiss(open, [root, card], function () { clearTimeout(timer.current); setOpen(false); });

      function touched() { return Date.now() - lastTouch.current < 800; }
      function show() { clearTimeout(timer.current); timer.current = setTimeout(function () { setOpen(true); }, delay); }
      function stay() { clearTimeout(timer.current); }
      function hideSoon() { clearTimeout(timer.current); timer.current = setTimeout(function () { setOpen(false); }, 100); }
      function onPointerEnter(e) { if (e.pointerType === 'touch') return; show(); }
      function onPointerLeave(e) { if (e.pointerType === 'touch') return; hideSoon(); }
      function onPointerDown(e) { if (e.pointerType === 'touch') lastTouch.current = Date.now(); }
      function onFocus() { if (!touched()) show(); }
      function within(el) { return !!el && ((root.current && root.current.contains(el)) || (card.current && card.current.contains(el))); }
      function onBlur(e) { if (!within(e.relatedTarget) && !touched()) hideSoon(); }
      /* Touch: a tap toggles the card. The first tap on a link only opens it; a second tap follows the link. */
      function onClickCapture(e) {
        if (!touched() || !root.current || !root.current.contains(e.target)) return;
        var link = e.target.closest && e.target.closest('a[href]');
        clearTimeout(timer.current);
        if (!open) { if (link) e.preventDefault(); setOpen(true); }
        else if (!link) setOpen(false);
      }
      function onKey(e) {
        if (e.key === 'Escape' && open) {
          e.stopPropagation(); clearTimeout(timer.current); setOpen(false);
          var tr = root.current && root.current.firstChild;
          if (tr && within(document.activeElement) && tr !== document.activeElement && tr.focus) tr.focus();
        }
      }
      var triggerProps = { 'aria-describedby': open ? id : undefined, 'aria-expanded': undefined };
      var trigger = props.render && React.isValidElement(props.render)
        ? React.cloneElement(props.render, Object.assign({}, triggerProps, { className: cx(props.render.props.className, 'hy-ctx__trigger') }), props.children)
        : h('div', Object.assign({}, triggerProps, { className: 'hy-ctx__trigger' }), props.children);
      var placed = pos ? pos.side : side;
      var tipStyle = !pos ? null : placed === 'top' || placed === 'bottom' ? { left: pos.arrowX - 7 } : { top: pos.arrowY - 3.5 };
      var box = open ? portal(h('div', {
        ref: card, id: id, role: 'tooltip',
        className: cx('hy-ctx__card', 'hy-ctx__card--' + placed, 'is-open', props.contentClassName),
        style: floatingStyle(pos, { zIndex: 'var(--z-menu)', maxWidth: 'min(360px, calc(100vw - 16px))' }),
        onPointerEnter: function (e) { if (e.pointerType !== 'touch') stay(); },
        onPointerLeave: onPointerLeave
      }, h('div', { className: 'hy-ctx__body' }, props.content), props.tip === false ? null : h(ContextCardTip, { style: tipStyle }))) : null;
      return h('span', {
        ref: root, className: cx('hy-ctx', props.className),
        onPointerEnter: onPointerEnter, onPointerLeave: onPointerLeave, onPointerDown: onPointerDown,
        onFocus: onFocus, onBlur: onBlur, onKeyDown: onKey, onClickCapture: onClickCapture
      }, trigger, box);
    }

    ContextCard.Trigger = ContextCard;
    define('ContextCard', ContextCard);
    define('ContextCardTrigger', ContextCard);
  })();

  /* ---- ContextMenu ---- */
  (function () {
    /*
     * ContextMenu: a Menu that opens at the pointer on right-click or long-press, or at the trigger with
     * Shift+F10 / the Menu key. ContextMenu > ContextMenuTrigger + ContextMenuContent > ContextMenuItem.
     * Reuses MenuContainer (with anchorPoint) so focus, typeahead and dismissal match Menu.
     */
    var ContextMenuCtx = React.createContext(null);

    function ContextMenu(props) {
      var st = useState(null), point = st[0], setPoint = st[1];
      var triggerEl = useRef(null);
      var api = useRef({});
      api.current.setPoint = setPoint;

      function onOpenChange(next) {
        if (!next) setPoint(null);
        if (props.onOpenChange) props.onOpenChange(next);
      }
      /* defaultOpen (docs and previews): open near the top middle of the trigger area. */
      useLayoutEffect(function () {
        if (!props.defaultOpen || !triggerEl.current) return;
        var r = triggerEl.current.getBoundingClientRect();
        setPoint({ x: Math.round(r.left + r.width / 2), y: Math.round(r.top + Math.min(32, r.height / 2)) });
      }, []);
      /* A menu pinned to the viewport would drift from its target, so close when the page scrolls under it. */
      useEffect(function () {
        if (!point) return;
        function shut(e) {
          var t = e.target;
          if (t && t.nodeType === 1 && t.closest && t.closest('.hy-menu__list')) return;
          onOpenChange(false);
        }
        window.addEventListener('scroll', shut, true);
        return function () { window.removeEventListener('scroll', shut, true); };
      }, [point]);

      return h(ContextMenuCtx.Provider, { value: { api: api, triggerEl: triggerEl } },
        h(HY.MenuContainer, {
          open: !!point, onOpenChange: onOpenChange, anchorPoint: point || undefined,
          className: cx('hy-context-menu', props.className), style: props.style
        }, props.children));
    }

    function ContextMenuTrigger(props) {
      var own = React.useContext(ContextMenuCtx);
      var menu = React.useContext(HY.MenuContainer.Context);
      var lastKey = useRef(0);
      var press = useRef(null);
      var start = useRef(null);
      useEffect(function () { return function () { clearTimeout(press.current); }; }, []);

      function setRef(el) {
        if (own) own.triggerEl.current = el;
        if (menu) menu.triggerRef.current = el;
      }
      function openAt(x, y, focus) {
        if (!own || !menu || props.disabled) return;
        own.api.current.setPoint({ x: Math.round(x), y: Math.round(y) });
        menu.openMenu(focus);
      }
      function onContextMenu(e) {
        if (props.onContextMenu) props.onContextMenu(e);
        if (props.disabled || e.defaultPrevented) return;
        e.preventDefault();
        cancelPress();
        if (Date.now() - lastKey.current < 400) return; /* already opened from the keyboard */
        openAt(e.clientX, e.clientY, 'list');
      }
      function onKeyDown(e) {
        if (props.onKeyDown) props.onKeyDown(e);
        if (props.disabled || e.defaultPrevented) return;
        if ((e.key === 'F10' && e.shiftKey) || e.key === 'ContextMenu') {
          e.preventDefault();
          lastKey.current = Date.now();
          var r = e.currentTarget.getBoundingClientRect();
          openAt(r.left + 8, r.top + 8, 'first');
        }
      }
      /* Long-press on touch screens (pointerType touch): open after 500ms unless the finger moves more than 10px. */
      function cancelPress() { clearTimeout(press.current); press.current = null; }
      function onPointerDown(e) {
        if (props.onPointerDown) props.onPointerDown(e);
        if (props.disabled || e.pointerType !== 'touch' || !e.isPrimary) return;
        var x = e.clientX, y = e.clientY;
        cancelPress();
        start.current = { x: x, y: y };
        press.current = setTimeout(function () {
          press.current = null;
          if (menu && menu.open) return;
          lastKey.current = Date.now(); /* the browser may also fire contextmenu for the same press */
          openAt(x, y, 'list');
        }, 500);
      }
      function onPointerMove(e) {
        if (props.onPointerMove) props.onPointerMove(e);
        if (!press.current || e.pointerType !== 'touch') return;
        var s0 = start.current;
        if (Math.abs(e.clientX - s0.x) > 10 || Math.abs(e.clientY - s0.y) > 10) cancelPress();
      }
      function onMouseDown(e) {
        if (props.onMouseDown) props.onMouseDown(e);
        if (menu && menu.open && e.button === 0) menu.close(false);
      }
      var rest = omit(props, ['children', 'className', 'disabled', 'as', 'onContextMenu', 'onKeyDown', 'onMouseDown', 'onPointerDown', 'onPointerMove', 'onPointerUp', 'onPointerCancel']);
      return h(props.as || 'div', Object.assign(rest, {
        ref: setRef, tabIndex: props.tabIndex === undefined ? 0 : props.tabIndex,
        className: cx('hy-context-menu__trigger', props.className),
        onContextMenu: onContextMenu, onKeyDown: onKeyDown, onMouseDown: onMouseDown,
        onPointerDown: onPointerDown, onPointerMove: onPointerMove, onPointerUp: function (e) { cancelPress(); if (props.onPointerUp) props.onPointerUp(e); },
        onPointerCancel: function (e) { cancelPress(); if (props.onPointerCancel) props.onPointerCancel(e); }
      }), props.children);
    }

    /* The list is portalled and placed by Menu (useFloating at the pointer), which keeps it 8px inside the screen. */
    function ContextMenuContent(props) {
      return h(HY.Menu, Object.assign({}, props, {
        'aria-label': props['aria-label'] || 'Context Menu', className: cx('hy-context-menu__list', props.className)
      }));
    }

    function ContextMenuItem(props) { return h(HY.MenuItem, props); }

    ContextMenu.Trigger = ContextMenuTrigger;
    ContextMenu.Content = ContextMenuContent;
    ContextMenu.Item = ContextMenuItem;

    define('ContextMenu', ContextMenu);
    define('ContextMenuTrigger', ContextMenuTrigger);
    define('ContextMenuContent', ContextMenuContent);
    define('ContextMenuItem', ContextMenuItem);
  })();

  /* ---- DestructiveActionModal ---- */
  (function () {
    /* A Modal with a type-to-confirm gate and an optional irreversibility band. Builds on HY.Modal. */
    function DestructiveActionModal(props) {
      var open = !!props.open;
      var st = useState('');
      var typed = st[0], setTyped = st[1];
      var inputId = useId();
      var promptId = useId();
      var errId = useId();
      useEffect(function () { if (!open) setTyped(''); }, [open]);
      var phrase = props.verificationPhrase;
      var gated = phrase !== undefined && phrase !== null && phrase !== '';
      var matches = !gated || typed === phrase;
      var loading = !!props.loading;
      var error = props.error ? (props.error instanceof Error ? props.error.message : props.error) : null;
      function cancel() { if (!loading && props.onCancel) props.onCancel(); }
      function submit(e) {
        e.preventDefault();
        if (!matches || loading) return;
        if (props.onConfirm) props.onConfirm();
      }
      var prompt = props.verificationLabel
        ? ['To confirm, type the ', props.verificationLabel, ' ', h('b', { key: 'p', translate: 'no' }, '“' + phrase + '”')]
        : ['To confirm, type ', h('b', { key: 'p', translate: 'no' }, '“' + phrase + '”')];
      return h(HY.Modal, { active: open, onClose: cancel, onClickOutside: cancel, alert: true, inline: props.inline, className: 'hy-dam' },
        h('form', { className: 'hy-dam__form', onSubmit: submit, noValidate: true },
          h(HY.ModalBody, null,
            h(HY.ModalHeader, null,
              h(HY.ModalTitle, null, props.title),
              props.description ? h(HY.ModalSubtitle, null, props.description) : null),
            h('div', { className: 'hy-dam__content' },
              props.irreversibleDescription ? h('div', { className: 'hy-dam__band' },
                h(Glyph, { name: 'warning', className: 'hy-dam__band-glyph' }),
                h('span', null, props.irreversibleDescription)) : null,
              gated ? h('div', { className: 'hy-dam__field' },
                h('label', { id: promptId, htmlFor: inputId, className: 'hy-dam__prompt' }, prompt),
                h('div', { className: cx('hy-input', 'hy-input--small', error && 'hy-input--error') },
                  h('input', {
                    id: inputId, 'data-autofocus': true, type: 'text', name: 'verification', value: typed,
                    autoComplete: 'off', autoCapitalize: 'off', autoCorrect: 'off', spellCheck: false,
                    disabled: loading, 'aria-labelledby': promptId,
                    'aria-invalid': error ? 'true' : undefined, 'aria-describedby': error ? errId : undefined,
                    onChange: function (e) { setTyped(e.target.value); }
                  }))) : null,
              error ? h('p', { id: errId, className: 'hy-field__error', role: 'alert' }, h(Glyph, { name: 'error', size: 14 }), h('span', null, error)) : null)),
          h(HY.ModalActions, null,
            h(HY.ModalAction, { type: 'button', variant: 'secondary', disabled: loading, onClick: cancel, 'data-autofocus': gated ? undefined : true }, props.cancelLabel || 'Cancel'),
            h(HY.ModalAction, { type: 'submit', variant: 'error', disabled: !matches, loading: loading }, props.confirmLabel))));
    }

    define('DestructiveActionModal', DestructiveActionModal);
  })();

  /* ---- DotsMenu ---- */
  (function () {
    /* DotsMenu: a compact "more actions" Menu behind a three-dot icon button. Children are MenuItems. */
    function DotsIcon(p) {
      var s = p.size;
      return h('svg', { className: 'hy-dots-menu__icon', width: s, height: s, style: { width: s, height: s }, viewBox: '0 0 18 18', fill: 'currentColor', 'aria-hidden': 'true', focusable: 'false' },
        h('circle', { cx: 3.5, cy: 9, r: 1.5 }), h('circle', { cx: 9, cy: 9, r: 1.5 }), h('circle', { cx: 14.5, cy: 9, r: 1.5 }));
    }

    function DotsMenu(props) {
      var size = props.iconSize === 10 || props.iconSize === 12 ? props.iconSize : 18;
      return h(HY.MenuContainer, {
        position: props.position || 'bottom-end',
        open: props.open, defaultOpen: props.defaultOpen, onOpenChange: props.onOpenChange,
        className: cx('hy-dots-menu', props.className), style: props.style
      },
        h(HY.MenuButton, {
          variant: 'tertiary', size: props.size || 'small', svgOnly: true, disabled: props.disabled,
          'aria-label': props['aria-label'] || props.label || 'More Actions', className: 'hy-dots-menu__button'
        }, h(DotsIcon, { size: size })),
        h(HY.Menu, { width: props.width, 'aria-label': props.menuLabel }, props.children));
    }

    define('DotsMenu', DotsMenu);
  })();

  /* ---- Drawer ---- */
  (function () {
    /* Drawer: a bottom sheet for small viewports. Tap outside, Escape or a downward swipe dismiss it. */
    var DrawerCtx = React.createContext(null);

    /* Keeps the panel mounted for its exit animation. */
    function useDrawerPresence(open, ms) {
      var st = useState(open);
      useEffect(function () {
        if (open) { st[1](true); return; }
        var t = setTimeout(function () { st[1](false); }, ms);
        return function () { clearTimeout(t); };
      }, [open]);
      return open || st[0];
    }

    function DrawerTitle(props) {
      var ctx = React.useContext(DrawerCtx);
      return h('h2', { id: ctx ? ctx.titleId : undefined, className: cx('hy-drawer__title', props.className) }, props.children);
    }

    function Drawer(props) {
      var open = !!(props.show !== undefined ? props.show : props.open);
      var mounted = useDrawerPresence(open, 150);
      var panel = useRef(null);
      var drag = useRef(null);
      var tid = useId();
      var dy = useState(0);
      var dismiss = props.onDismiss || props.onClose;
      useOverlayFocus(open, panel);
      useScrollLock(open && !props.inline);
      useLayoutEffect(function () {
        var el = panel.current;
        if (!el) return;
        if (document.getElementById(tid)) el.setAttribute('aria-labelledby', tid); else el.removeAttribute('aria-labelledby');
      });
      useEffect(function () { if (!open) dy[1](0); }, [open]);
      if (!mounted) return null;
      function onKey(e) {
        if (e.key === 'Escape') { e.stopPropagation(); if (dismiss) dismiss(); }
        trapTab(e, panel.current);
      }
      /* swipe down to dismiss (touch and pen only, so mouse text selection still works) */
      function onPointerDown(e) {
        if (e.pointerType === 'mouse' || !open) return;
        if (panel.current.scrollTop > 0) return;
        drag.current = { y: e.clientY, t: Date.now(), id: e.pointerId };
      }
      function onPointerMove(e) {
        var d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        var delta = Math.max(0, e.clientY - d.y);
        if (delta > 4 && !d.captured) { d.captured = true; try { panel.current.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } }
        dy[1](delta);
      }
      function onPointerUp(e) {
        var d = drag.current;
        drag.current = null;
        if (!d) return;
        var delta = Math.max(0, e.clientY - d.y);
        var fast = delta / Math.max(1, Date.now() - d.t) > 0.5;
        var h0 = panel.current ? panel.current.offsetHeight : 1;
        if (delta > h0 * 0.3 || (fast && delta > 24)) { if (dismiss) dismiss(); }
        else dy[1](0);
      }
      var style = {};
      if (props.height !== undefined) style.height = typeof props.height === 'number' ? props.height + 'px' : props.height;
      if (dy[0]) { style.transform = 'translateY(' + dy[0] + 'px)'; style.transition = 'none'; }
      var node = h(DrawerCtx.Provider, { value: { titleId: tid } },
        h('div', { className: cx('hy-drawer', !open && 'is-closing', props.inline && 'hy-drawer--inline') },
          h('div', { className: 'hy-drawer__backdrop', 'aria-hidden': 'true', onMouseDown: function () { if (dismiss) dismiss(); } }),
          h('div', {
            ref: panel, role: 'dialog', 'aria-modal': 'true', 'aria-label': props['aria-label'], tabIndex: -1,
            className: cx('hy-drawer__panel', props.verticalScroll !== false && 'hy-drawer__panel--scroll', props.className), style: style,
            onKeyDown: onKey, onPointerDown: onPointerDown, onPointerMove: onPointerMove, onPointerUp: onPointerUp, onPointerCancel: onPointerUp
          }, props.children)));
      return props.inline ? node : portal(node);
    }

    Drawer.Title = DrawerTitle;
    define('DrawerTitle', DrawerTitle);
    define('Drawer', Drawer);
  })();

  /* ---- Menu ---- */
  (function () {
    /*
     * Menu uses a compound API:
     *   MenuContainer > MenuButton + Menu > MenuItem | MenuLink | MenuItemLocked | MenuSection | MenuDivider
     * The older one-piece API (<Menu label items>) still works and renders the same parts.
     * MenuContainer.Context is shared with DotsMenu, SplitButton and ContextMenu.
     */
    var MenuCtx = React.createContext(null);

    var MENU_SIDES = ['bottom', 'top', 'left', 'right'];
    function parsePosition(pos) {
      var parts = String(pos || 'bottom-start').split('-');
      var side = MENU_SIDES.indexOf(parts[0]) >= 0 ? parts[0] : 'bottom';
      return { side: side, align: parts[1] === 'end' ? 'end' : 'start' };
    }

    /* The items the arrow keys reach: enabled ones, and disabled ones that carry a description (data-focusable). */
    function menuItems(list, enabledOnly) {
      if (!list) return [];
      return Array.prototype.filter.call(list.querySelectorAll('[role="menuitem"]'), function (el) {
        return el.getAttribute('aria-disabled') !== 'true' || (!enabledOnly && el.hasAttribute('data-focusable'));
      });
    }
    /* Keys the menu handles itself; they never reach the page's own handlers through the React tree or the document. */
    var MENU_KEYS = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' ', 'Escape', 'Tab'];

    function MenuContainer(props) {
      var st = useState(!!props.defaultOpen);
      var controlled = props.open !== undefined;
      var open = controlled ? !!props.open : st[0];
      var rootRef = useRef(null), triggerRef = useRef(null), listRef = useRef(null);
      var focusOnOpen = useRef(null);
      var base = useId();
      var pos = parsePosition(props.position);

      function setOpen(next) {
        if (!controlled) st[1](next);
        if (props.onOpenChange) props.onOpenChange(next);
      }
      function openMenu(which) { focusOnOpen.current = which || 'first'; setOpen(true); }
      function close(refocus) {
        setOpen(false);
        if (refocus && triggerRef.current && triggerRef.current.focus) triggerRef.current.focus();
      }

      /* The list is portalled to <body>, so it is passed to useDismiss alongside the trigger. */
      useDismiss(open, [triggerRef, listRef], function (why) { close(why === 'escape'); });

      var ctx = {
        open: open, openMenu: openMenu, close: close, rootRef: rootRef, triggerRef: triggerRef, listRef: listRef, focusOnOpen: focusOnOpen,
        menuId: base + '-menu', buttonId: base + '-button',
        side: pos.side, align: pos.align, anchorPoint: props.anchorPoint
      };
      return h(MenuCtx.Provider, { value: ctx },
        h(props.as || 'div', { ref: rootRef, className: cx('hy-menu', props.className), style: props.style }, props.children));
    }
    MenuContainer.Context = MenuCtx;

    /* MenuButton is a Button (same props) that toggles the menu; type="unstyled" wraps custom content in a bare button. */
    var MenuButton = React.forwardRef(function MenuButton(props, ref) {
      var ctx = React.useContext(MenuCtx);
      function setRef(el) {
        if (ctx) ctx.triggerRef.current = el;
        if (typeof ref === 'function') ref(el); else if (ref) ref.current = el;
      }
      function onClick(e) {
        if (props.onClick) props.onClick(e);
        if (!ctx || e.defaultPrevented) return;
        ctx.open ? ctx.close(false) : ctx.openMenu(e.detail === 0 ? 'first' : 'list');
      }
      function onKeyDown(e) {
        if (props.onKeyDown) props.onKeyDown(e);
        if (!ctx || e.defaultPrevented) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); ctx.openMenu('first'); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); ctx.openMenu('last'); }
      }
      var aria = {
        id: ctx ? ctx.buttonId : undefined, 'aria-haspopup': 'menu', 'aria-expanded': ctx ? ctx.open : undefined,
        'aria-controls': ctx && ctx.open ? ctx.menuId : undefined, onClick: onClick, onKeyDown: onKeyDown, ref: setRef
      };
      if (props.type === 'unstyled') {
        return h('button', Object.assign(omit(props, ['type', 'showChevron', 'children']), aria, { type: 'button', className: cx('hy-menu__unstyled', props.className) }), props.children);
      }
      var variant = props.variant || (props.type ? undefined : 'default');
      return h(HY.Button, Object.assign(omit(props, ['showChevron']), aria, {
        variant: variant,
        suffix: props.showChevron ? h(Glyph, { name: 'chevron' }) : props.suffix
      }), props.children);
    });

    /* Menu: the popup list inside a MenuContainer. Given `items` (and usually `label`), it is the older one-piece menu. */
    function Menu(props) {
      var ctx = React.useContext(MenuCtx);
      if (!ctx || props.items) return h(LegacyMenu, props);
      return h(MenuList, Object.assign({}, props, { ctx: ctx }));
    }

    function MenuList(props) {
      var ctx = props.ctx;
      if (!ctx.open) return null;
      var a = ctx.anchorPoint;
      /* Keyed by the point so a second right-click re-places the menu. */
      return h(MenuPopup, Object.assign({}, props, { key: a ? a.x + ',' + a.y : 'menu' }));
    }

    /* The open list: portalled, placed by useFloating (flips, stays 8px inside the screen). */
    function MenuPopup(props) {
      var ctx = props.ctx;
      var typed = useRef({ text: '', at: 0 });
      var anchor = ctx.anchorPoint;
      /* Beside the whole container (SplitButton aligns to its main button), or at a point for context menus.
         A getter, because the container's ref is attached after this child's first layout effect. */
      var anchorRef = useMemo(function () {
        var point = anchor && {
          getBoundingClientRect: function () { return { left: anchor.x, right: anchor.x, top: anchor.y, bottom: anchor.y, width: 0, height: 0 }; }
        };
        return { get current() { return point || ctx.rootRef.current || ctx.triggerRef.current; } };
      }, []);
      var pos = useFloating(true, anchorRef, ctx.listRef, { side: anchor ? 'bottom' : ctx.side, align: anchor ? 'start' : ctx.align, offset: anchor ? 0 : 8 });
      var placed = !!pos;

      /* Move focus in once the list is placed and visible. */
      useLayoutEffect(function () {
        if (!placed) return;
        var which = ctx.focusOnOpen.current, list = ctx.listRef.current;
        ctx.focusOnOpen.current = null;
        if (!which || !list) return;
        var items = menuItems(list, true);
        if (!items.length) items = menuItems(list);
        var el = which === 'last' ? items[items.length - 1] : which === 'first' ? items[0] : null;
        (el || list).focus({ preventScroll: true });
      }, [placed]);

      function onKeyDown(e) {
        var typeahead = e.key.length === 1 && /\S/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey;
        if (MENU_KEYS.indexOf(e.key) >= 0 || typeahead) e.stopPropagation();
        /* Escape is closed here: the document listener in useDismiss no longer hears a stopped key. */
        if (e.key === 'Escape') { ctx.close(true); return; }
        var items = menuItems(ctx.listRef.current);
        if (!items.length) { if (e.key === 'Tab') ctx.close(false); return; }
        var i = items.indexOf(document.activeElement);
        var next = null;
        if (e.key === 'ArrowDown') next = items[(i + 1) % items.length];
        else if (e.key === 'ArrowUp') next = items[(i - 1 + items.length) % items.length];
        else if (e.key === 'Home') next = items[0];
        else if (e.key === 'End') next = items[items.length - 1];
        else if (e.key === 'Tab') { ctx.close(false); return; }
        else if (typeahead) {
          var now = Date.now();
          typed.current.text = (now - typed.current.at > 600 ? '' : typed.current.text) + e.key.toLowerCase();
          typed.current.at = now;
          var q = typed.current.text;
          var order = items.slice(i + 1).concat(items.slice(0, i + 1));
          if (q.length > 1) order = items.slice(i).concat(items.slice(0, i));
          next = order.filter(function (el) { return itemText(el).indexOf(q) === 0; })[0] || null;
        }
        if (next) { e.preventDefault(); next.focus(); }
      }
      var side = pos ? pos.side : (anchor ? 'bottom' : ctx.side);
      var align = anchor ? 'start' : ctx.align;
      var style = floatingStyle(pos, Object.assign({ maxWidth: 'min(320px, calc(100vw - 16px))' },
        props.width !== undefined ? { width: props.width } : null, props.style));
      return portal(h('ul', {
        ref: ctx.listRef, id: ctx.menuId, role: 'menu', tabIndex: -1, 'aria-labelledby': anchor ? undefined : ctx.buttonId,
        'aria-label': props['aria-label'], onKeyDown: onKeyDown, style: style,
        className: cx('hy-menu__list', 'hy-menu__list--' + side, 'hy-menu__list--' + align, anchor && 'hy-menu__list--point', props.className)
      }, props.children));
    }

    /* Typeahead matches the label, not the description. */
    function itemText(el) {
      var t = el.querySelector('.hy-menu__text');
      return (t || el).textContent.trim().toLowerCase();
    }

    function itemInner(props, descId) {
      return [
        props.prefix ? h('span', { key: 'p', className: 'hy-menu__affix', 'aria-hidden': 'true' }, props.prefix) : null,
        props.description
          ? h('span', { key: 't', className: 'hy-menu__stack' },
            h('span', { className: 'hy-menu__text' }, props.children),
            h('span', { id: descId, className: 'hy-menu__desc', 'aria-hidden': 'true' }, props.description))
          : h('span', { key: 't', className: 'hy-menu__text' }, props.children),
        props.shortcut ? h('span', { key: 'k', className: 'hy-menu__shortcut' }, props.shortcut) : null,
        props.suffix ? h('span', { key: 's', className: 'hy-menu__affix hy-menu__affix--end', 'aria-hidden': 'true' }, props.suffix) : null
      ];
    }

    /* MenuItem: an action. With `href` it is a link (same as MenuLink). type="error" for destructive items. */
    function MenuItem(props) {
      var ctx = React.useContext(MenuCtx);
      var descId = useId();
      var disabled = !!props.disabled;
      /* A disabled item with a description stays reachable by the arrow keys, so its reason can be read. */
      var hint = {
        title: props.title, 'aria-describedby': props.description ? descId : undefined,
        'data-focusable': disabled && props.description ? '' : undefined
      };
      var cls = cx('hy-menu__item', props.type === 'error' && 'hy-menu__item--error', props.className);
      function activate(e) {
        if (disabled) { e.preventDefault(); return; }
        if (props.onClick) props.onClick(e);
        if (props.onSelect) props.onSelect(props.value);
        if (ctx) ctx.close(true);
      }
      function hover(e) { if (!disabled) e.currentTarget.focus({ preventScroll: true }); }
      if (props.href !== undefined) {
        return h('li', { role: 'none', className: 'hy-menu__li' },
          h('a', Object.assign({
            role: 'menuitem', tabIndex: -1, href: disabled ? undefined : props.href, target: props.target, rel: props.rel,
            'aria-disabled': disabled || undefined, className: cls, onClick: activate, onMouseEnter: hover,
            onKeyDown: function (e) { if (e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }
          }, hint), itemInner(props, descId)));
      }
      return h('li', Object.assign({
        role: 'menuitem', tabIndex: -1, 'aria-disabled': disabled || undefined, className: cls, style: props.style,
        onClick: activate, onMouseEnter: hover,
        onKeyDown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(e); } }
      }, hint), itemInner(props, descId));
    }

    function MenuLink(props) { return h(MenuItem, Object.assign({}, props, { href: props.href || '#' })); }

    /* MenuItemLocked: a permission-gated action, shown disabled with a lock. */
    function MenuItemLocked(props) {
      return h(MenuItem, Object.assign({}, props, { disabled: true, onClick: undefined, suffix: h(HY.Icon, { name: 'lock', size: 14 }) }));
    }

    function MenuSection(props) {
      var id = useId();
      return h('li', { role: 'none', className: 'hy-menu__section' },
        h('span', { id: id, className: 'hy-menu__section-title', 'aria-hidden': 'true' }, props.title),
        h('ul', { role: 'group', 'aria-labelledby': id, className: 'hy-menu__group' }, props.children));
    }

    function MenuDivider() { return h('li', { role: 'separator', className: 'hy-menu__sep' }); }

    /* The older API: <Menu label="Actions" items={[{ label, onSelect, shortcut, prefix, disabled, danger } | { separator: true }]} /> */
    function LegacyMenu(props) {
      var pos = props.position || (props.align === 'end' ? 'bottom-end' : 'bottom-start');
      return h(MenuContainer, { position: pos, defaultOpen: props.defaultOpen, className: props.className },
        h(MenuButton, { variant: props.variant || 'secondary', size: props.size, showChevron: true }, props.label),
        h(LegacyList, props));
    }
    function LegacyList(props) {
      var ctx = React.useContext(MenuCtx);
      return h(MenuList, { ctx: ctx, width: props.width, 'aria-label': typeof props.label === 'string' ? props.label : undefined },
        (props.items || []).map(function (it, i) {
          if (it.separator) return h(MenuDivider, { key: 'sep' + i });
          return h(MenuItem, { key: it.label + i, onSelect: it.onSelect, shortcut: it.shortcut, prefix: it.prefix, disabled: it.disabled, type: it.danger ? 'error' : it.type, href: it.href, description: it.description, title: it.title }, it.label);
        }));
    }

    Menu.Container = MenuContainer;
    Menu.Button = MenuButton;
    Menu.Item = MenuItem;
    Menu.Link = MenuLink;
    Menu.ItemLocked = MenuItemLocked;
    Menu.Section = MenuSection;
    Menu.Divider = MenuDivider;

    define('Menu', Menu);
    define('MenuContainer', MenuContainer);
    define('MenuButton', MenuButton);
    define('MenuItem', MenuItem);
    define('MenuLink', MenuLink);
    define('MenuItemLocked', MenuItemLocked);
    define('MenuSection', MenuSection);
    define('MenuDivider', MenuDivider);
  })();

  /* ---- Modal ---- */
  (function () {
    /* Modal: a compound API (Modal + ModalBody/Header/Title/Subtitle/Inset/Actions/Action)
       plus the original shorthand props (open/onClose/title/description/actions). */
    var ModalCtx = React.createContext(null);

    function ModalBody(props) {
      return h('div', Object.assign({}, omit(props, ['className', 'children']), { className: cx('hy-modal__body', props.className) }), props.children);
    }
    function ModalHeader(props) {
      return h('header', { className: cx('hy-modal__header', props.className) }, props.children);
    }
    function ModalTitle(props) {
      var ctx = React.useContext(ModalCtx);
      return h('h2', { id: ctx ? ctx.titleId : undefined, className: cx('hy-modal__title', props.className) }, props.children);
    }
    function ModalSubtitle(props) {
      var ctx = React.useContext(ModalCtx);
      return h('div', { id: ctx ? ctx.descId : undefined, className: cx('hy-modal__desc', props.className) }, props.children);
    }
    function ModalInset(props) {
      return h('div', { className: cx('hy-modal__inset', props.last && 'hy-modal__inset--last', props.className) }, props.children);
    }
    function ModalActions(props) {
      return h('footer', { className: cx('hy-modal__actions', props.className) }, props.children);
    }
    var ModalAction = React.forwardRef(function ModalAction(props, ref) {
      var rest = omit(props, ['fullWidth', 'className']);
      return h(HY.Button, Object.assign({ variant: 'primary', size: 'small' }, rest, {
        ref: ref, className: cx(props.fullWidth && 'hy-modal__action--full', props.className)
      }));
    });

    var MODAL_KEYS = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' ', 'Escape', 'Tab'];
    var MODAL_PARTS = [ModalBody, ModalActions];
    function isModalPart(node) {
      var found = false;
      /* Looks through wrapper elements such as <form> and fragments too. */
      React.Children.forEach(node, function (c) {
        if (found || !c || !c.type) return;
        if (MODAL_PARTS.indexOf(c.type) >= 0) found = true;
        else if ((typeof c.type === 'string' || c.type === React.Fragment) && c.props) found = isModalPart(c.props.children);
      });
      return found;
    }

    function Modal(props) {
      var box = useRef(null);
      var tid = useId();
      var did = useId();
      var open = !!(props.active !== undefined ? props.active : props.open);
      var onEscape = props.onClose || props.onClickOutside;
      var onOutside = props.onClickOutside || props.onClose;
      useOverlayFocus(open, box, props.initialFocusRef || props.initialFocus);
      useScrollLock(open && !props.inline);
      useLayoutEffect(function () {
        var el = box.current;
        if (!open || !el) return;
        if (document.getElementById(tid)) el.setAttribute('aria-labelledby', tid); else el.removeAttribute('aria-labelledby');
        if (document.getElementById(did)) el.setAttribute('aria-describedby', did); else el.removeAttribute('aria-describedby');
      });
      if (!open) return null;
      function onKey(e) {
        /* Keys the dialog and its content use never reach the page's own handlers (the dialog is portalled, but React bubbles through the tree). */
        if (MODAL_KEYS.indexOf(e.key) >= 0) e.stopPropagation();
        if (e.key === 'Escape') { if (onEscape) onEscape(); }
        trapTab(e, box.current);
      }
      var legacy = props.title || props.description || props.actions || !isModalPart(props.children);
      var content = legacy ? [
        h(ModalBody, { key: 'b' },
          props.title || props.description ? h(ModalHeader, null,
            props.title ? h(ModalTitle, null, props.title) : null,
            props.description ? h(ModalSubtitle, null, props.description) : null) : null,
          props.children),
        props.actions ? h(ModalActions, { key: 'a' }, props.actions) : null
      ] : props.children;
      var size = props.size === 'small' ? 'hy-modal--small' : props.size === 'large' ? 'hy-modal--large' : null;
      var node = h(ModalCtx.Provider, { value: { titleId: tid, descId: did } },
        h('div', { className: 'hy-overlay hy-modal-overlay', onMouseDown: function (e) { if (e.target === e.currentTarget && onOutside) onOutside(); } },
          h('div', {
            ref: box, role: props.alert ? 'alertdialog' : 'dialog', 'aria-modal': 'true', 'aria-label': props['aria-label'], tabIndex: -1,
            className: cx('hy-modal', size, props.sticky && 'hy-modal--sticky', props.className), onKeyDown: onKey
          }, content)));
      return props.inline ? node : portal(node);
    }

    Modal.Body = ModalBody;
    Modal.Header = ModalHeader;
    Modal.Title = ModalTitle;
    Modal.Subtitle = ModalSubtitle;
    Modal.Inset = ModalInset;
    Modal.Actions = ModalActions;
    Modal.Action = ModalAction;

    define('ModalBody', ModalBody);
    define('ModalHeader', ModalHeader);
    define('ModalTitle', ModalTitle);
    define('ModalSubtitle', ModalSubtitle);
    define('ModalInset', ModalInset);
    define('ModalActions', ModalActions);
    define('ModalAction', ModalAction);
    define('Modal', Modal);
  })();

  /* ---- Popover ---- */
  (function () {
    /* Popover: a click-opened floating panel with interactive content. Non-modal dialog: focus moves in and Tab stays
       inside, Escape or a click outside closes it, and Escape (or the content's close()) returns focus to the trigger.
       Placed with useFloating like Menu and Tooltip, so it flips and stays on screen. */
    var POPOVER_SIDES = ['bottom', 'top', 'left', 'right'];
    function popoverPosition(pos) {
      var parts = String(pos || 'bottom-start').split('-');
      return { side: POPOVER_SIDES.indexOf(parts[0]) >= 0 ? parts[0] : 'bottom', align: parts[1] === 'end' ? 'end' : parts[1] === 'center' ? 'center' : 'start' };
    }

    function Popover(props) {
      var c = useControllable(props.open, !!props.defaultOpen, props.onOpenChange);
      var open = c[0], setOpen = c[1];
      var triggerRef = useRef(null), boxRef = useRef(null);
      var id = useId();
      var where = popoverPosition(props.position);
      var pos = useFloating(open, triggerRef, boxRef, { side: where.side, align: where.align, offset: 8 });
      var placed = !!pos;

      function close(refocus) {
        setOpen(false);
        if (refocus && triggerRef.current && triggerRef.current.focus) triggerRef.current.focus({ preventScroll: true });
      }
      useDismiss(open, [triggerRef, boxRef], function (why) { close(why === 'escape'); });

      /* Move focus in once the box is placed and visible. */
      useLayoutEffect(function () {
        if (!placed) return;
        var root = boxRef.current;
        if (!root) return;
        var target = (props.initialFocusRef && props.initialFocusRef.current) || root.querySelector('[data-autofocus]') || root.querySelector(FOCUSABLE) || root;
        target.focus({ preventScroll: true });
      }, [placed]);

      function onKeyDown(e) {
        if (e.key === 'Escape') { e.stopPropagation(); close(true); return; }
        if (e.key === 'Tab') e.stopPropagation();
        trapTab(e, boxRef.current);
      }
      function toggle() { open ? close(false) : setOpen(true); }

      var trigger = props.trigger;
      if (!React.isValidElement(trigger)) trigger = h(HY.Button, { variant: 'secondary' }, trigger);
      /* React 19 passes ref as a prop and warns on element.ref; React 18 keeps it on the element. */
      var own = parseInt(React.version, 10) >= 19 ? trigger.props.ref : trigger.ref;
      var triggerNode = React.cloneElement(trigger, {
        ref: function (el) {
          triggerRef.current = el;
          if (typeof own === 'function') own(el); else if (own) own.current = el;
        },
        'aria-haspopup': 'dialog', 'aria-expanded': open, 'aria-controls': open ? id : undefined,
        onClick: function (e) {
          if (trigger.props.onClick) trigger.props.onClick(e);
          if (!e.defaultPrevented) toggle();
        }
      });
      var side = pos ? pos.side : where.side;
      var style = floatingStyle(pos, Object.assign({ maxWidth: 'min(360px, calc(100vw - 16px))' }, props.width !== undefined ? { width: props.width } : null, props.style));
      var content = typeof props.children === 'function' ? props.children({ close: function () { close(true); } }) : props.children;
      return h(React.Fragment, null, triggerNode,
        open ? portal(h('div', {
          ref: boxRef, id: id, role: 'dialog', tabIndex: -1, 'aria-label': props.label, 'aria-labelledby': props['aria-labelledby'],
          className: cx('hy-popover', 'hy-popover--' + side, props.className), style: style, onKeyDown: onKeyDown
        }, content)) : null);
    }

    define('Popover', Popover);
  })();

  /* ---- RelativeTimeCard ---- */
  (function () {
    /* RelativeTimeCard: a relative timestamp whose hover card shows the absolute time in UTC and local time.
       Builds on HY.ContextCard. */
    function rtcDate(v) { return v instanceof Date ? v : new Date(v); }
    function rtcCap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

    /* the short trigger form: 12s ago, 2m ago, 5h ago, Yesterday, 3d ago, then a date */
    function rtcShort(date, now, locale) {
      var diff = (date.getTime() - now) / 1000;
      var abs = Math.abs(diff);
      var rtf = new Intl.RelativeTimeFormat(locale, { style: 'narrow', numeric: 'auto' });
      var sign = diff < 0 ? -1 : 1;
      if (abs < 45) return rtcCap(rtf.format(sign * Math.max(1, Math.round(abs)), 'second'));
      if (abs < 3600) return rtcCap(rtf.format(sign * Math.max(1, Math.floor(abs / 60)), 'minute'));
      if (abs < 86400) return rtcCap(rtf.format(sign * Math.floor(abs / 3600), 'hour'));
      if (abs < 7 * 86400) return rtcCap(rtf.format(sign * Math.floor(abs / 86400), 'day'));
      var sameYear = date.getFullYear() === new Date(now).getFullYear();
      return new Intl.DateTimeFormat(locale, sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    }

    /* the long form at the top of the card: 8 seconds ago, 3 hours ago */
    function rtcLong(date, now, locale) {
      var diff = Math.round((date.getTime() - now) / 1000);
      var abs = Math.abs(diff);
      var rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });
      var units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]];
      for (var i = 0; i < units.length; i++) {
        if (abs >= units[i][1] || units[i][0] === 'second') return rtcCap(rtf.format(Math.trunc(diff / units[i][1]), units[i][0]));
      }
    }

    function rtcRow(date, locale, timeZone) {
      var opts = timeZone ? { timeZone: timeZone } : {};
      var zone = timeZone === 'UTC' ? 'UTC' : (new Intl.DateTimeFormat(locale, { timeZoneName: 'short' }).formatToParts(date)
        .filter(function (p) { return p.type === 'timeZoneName'; }).map(function (p) { return p.value; })[0] || 'Local');
      var day = new Intl.DateTimeFormat(locale, Object.assign({ year: 'numeric', month: 'long', day: 'numeric' }, opts)).format(date);
      var time = new Intl.DateTimeFormat(locale, Object.assign({ hour: '2-digit', minute: '2-digit', second: '2-digit' }, opts)).format(date);
      return h('div', { key: zone, className: 'hy-rtc__row' },
        h('div', { className: 'hy-rtc__day' }, h('span', { className: 'hy-rtc__zone' }, zone), h('span', null, day)),
        h('span', { className: 'hy-rtc__time' }, time));
    }

    function RelativeTimeCard(props) {
      var date = rtcDate(props.date);
      var locale = props.locale;
      var nowSt = useState(Date.now());
      var openSt = useState(!!props.defaultOpen);
      var open = openSt[0];
      useEffect(function () {
        var t = setInterval(function () { nowSt[1](Date.now()); }, open ? 1000 : 30000);
        return function () { clearInterval(t); };
      }, [open]);
      var now = nowSt[0];
      var valid = !isNaN(date.getTime());
      var content = valid ? h('div', { className: 'hy-rtc' },
        h('span', { className: 'hy-rtc__ago' }, rtcLong(date, now, locale)),
        h('div', { className: 'hy-rtc__rows' }, rtcRow(date, locale, 'UTC'), rtcRow(date, locale))) : '—';
      var trigger = props.children !== undefined && props.children !== null ? props.children
        : h('time', { className: 'hy-rtc__trigger', tabIndex: 0, dateTime: valid ? date.toISOString() : undefined }, valid ? rtcShort(date, now, locale) : '—');
      return h(HY.ContextCard, {
        content: content, side: props.side || 'top', align: props.align, defaultOpen: props.defaultOpen, className: props.className,
        onOpenChange: function (o) { openSt[1](o); if (o) nowSt[1](Date.now()); }
      }, trigger);
    }

    define('RelativeTimeCard', RelativeTimeCard);
  })();

  /* ---- Sheet ---- */
  (function () {
    /* Sheet: a side panel (radix-style compound API). Non-modal by default: the page stays usable. */
    var SheetCtx = React.createContext(null);

    function useSheetPresence(open, ms) {
      var st = useState(open);
      useEffect(function () {
        if (open) { st[1](true); return; }
        var t = setTimeout(function () { st[1](false); }, ms);
        return function () { clearTimeout(t); };
      }, [open]);
      return open || st[0];
    }

    function Sheet(props) {
      var ctl = useControllable(props.open, !!props.defaultOpen, props.onOpenChange);
      var tid = useId(), did = useId(), cid = useId();
      var value = { open: !!ctl[0], setOpen: ctl[1], modal: !!props.modal, inline: !!props.inline, titleId: tid, descId: did, contentId: cid };
      return h(SheetCtx.Provider, { value: value }, props.children);
    }

    /* asChild merges the behaviour onto the single child element. */
    function sheetSlot(props, extra) {
      if (props.asChild && React.isValidElement(props.children)) {
        var child = props.children;
        var own = child.props.onClick;
        return React.cloneElement(child, Object.assign({}, extra, {
          onClick: function (e) { if (own) own(e); if (!e.defaultPrevented) extra.onClick(e); }
        }));
      }
      return h('button', Object.assign({ type: 'button', className: props.className }, extra), props.children);
    }

    function SheetTrigger(props) {
      var ctx = React.useContext(SheetCtx);
      return sheetSlot(props, {
        'aria-haspopup': 'dialog', 'aria-expanded': ctx.open, 'aria-controls': ctx.open ? ctx.contentId : undefined,
        onClick: function () { ctx.setOpen(!ctx.open); }
      });
    }

    function SheetClose(props) {
      var ctx = React.useContext(SheetCtx);
      return sheetSlot(props, { onClick: function () { ctx.setOpen(false); } });
    }

    function SheetContent(props) {
      var ctx = React.useContext(SheetCtx);
      var open = ctx.open;
      var mounted = useSheetPresence(open, 150);
      var box = useRef(null);
      var side = props.side || 'right';
      var modal = ctx.modal;
      useOverlayFocus(open, box);
      useScrollLock(open && modal && !ctx.inline);
      useLayoutEffect(function () {
        var el = box.current;
        if (!el) return;
        if (document.getElementById(ctx.titleId)) el.setAttribute('aria-labelledby', ctx.titleId); else el.removeAttribute('aria-labelledby');
        if (document.getElementById(ctx.descId)) el.setAttribute('aria-describedby', ctx.descId); else el.removeAttribute('aria-describedby');
      });
      if (!mounted) return null;
      function onKey(e) {
        if (e.key === 'Escape') { e.stopPropagation(); ctx.setOpen(false); }
        if (modal) trapTab(e, box.current);
      }
      var rest = omit(props, ['side', 'noOverlay', 'floating', 'className', 'children']);
      var node = h('div', { className: cx('hy-sheet', !open && 'is-closing', modal && 'hy-sheet--modal') },
        modal && !props.noOverlay ? h('div', { className: 'hy-sheet__overlay', 'aria-hidden': 'true' }) : null,
        h('div', Object.assign({}, rest, {
          ref: box, id: ctx.contentId, role: 'dialog', 'aria-modal': modal ? 'true' : undefined, tabIndex: -1,
          className: cx('hy-sheet__panel', 'hy-sheet__panel--' + side, props.floating && 'hy-sheet__panel--floating', props.className),
          onKeyDown: onKey
        }), props.children));
      return ctx.inline ? node : portal(node);
    }

    function SheetHeader(props) { return h('div', { className: cx('hy-sheet__header', props.className) }, props.children); }
    function SheetFooter(props) { return h('div', { className: cx('hy-sheet__footer', props.className) }, props.children); }
    function SheetTitle(props) {
      var ctx = React.useContext(SheetCtx);
      return h('h2', { id: ctx.titleId, className: cx('hy-sheet__title', props.className) }, props.children);
    }
    function SheetDescription(props) {
      var ctx = React.useContext(SheetCtx);
      return h('div', { id: ctx.descId, className: cx('hy-sheet__desc', props.className) }, props.children);
    }

    Sheet.Trigger = SheetTrigger;
    Sheet.Close = SheetClose;
    Sheet.Content = SheetContent;
    Sheet.Header = SheetHeader;
    Sheet.Footer = SheetFooter;
    Sheet.Title = SheetTitle;
    Sheet.Description = SheetDescription;

    define('SheetTrigger', SheetTrigger);
    define('SheetClose', SheetClose);
    define('SheetContent', SheetContent);
    define('SheetHeader', SheetHeader);
    define('SheetFooter', SheetFooter);
    define('SheetTitle', SheetTitle);
    define('SheetDescription', SheetDescription);
    define('Sheet', Sheet);
  })();

  /* ---- Tooltip ---- */
  (function () {
    /* Tooltip: hover/focus label. The first one waits `delay`; neighbours opened soon after show instantly.
       The box is portalled to <body> only while open and placed with useFloating, so it flips and stays on screen.
       Touch: a tap toggles it, and a tap outside or moving focus away closes it. */
    var lastTooltipClose = 0;
    var TOOLTIP_TYPES = { success: 1, error: 1, warning: 1, violet: 1 };
    var TOOLTIP_ALIGN = { left: 'start', center: 'center', right: 'end', start: 'start', end: 'end' };

    function TooltipTip(p) {
      return h('svg', { className: 'hy-tooltip__tip', style: p.style, width: 14, height: 7, viewBox: '0 0 14 7', 'aria-hidden': 'true', focusable: 'false' },
        h('path', { d: 'M0 0h14L8.4 6.1a1.9 1.9 0 0 1-2.8 0z' }));
    }

    function Tooltip(props) {
      var st = useState(!!props.defaultOpen);
      var open = st[0], setOpen = st[1];
      var id = useId();
      var t = useRef(null);
      var anchorRef = useRef(null), boxRef = useRef(null);
      var touchAt = useRef(0);
      var delay = props.delay === false ? 0 : (typeof props.delay === 'number' ? props.delay : 150);
      var position = props.position || 'top';
      var align = TOOLTIP_ALIGN[props.boxAlign] || (props.center === false ? 'start' : 'center');
      var type = TOOLTIP_TYPES[props.type] ? props.type : null;
      var pos = useFloating(open, anchorRef, boxRef, { side: position, align: align, offset: 8 });
      useEffect(function () { return function () { clearTimeout(t.current); }; }, []);
      function fromTouch() { return Date.now() - touchAt.current < 800; }
      function show() {
        clearTimeout(t.current);
        var warm = Date.now() - lastTooltipClose < 400;
        if (warm || delay === 0) setOpen(true);
        else t.current = setTimeout(function () { setOpen(true); }, delay);
      }
      function hide() {
        clearTimeout(t.current);
        if (open) lastTooltipClose = Date.now();
        setOpen(false);
      }
      useDismiss(open, [anchorRef, boxRef], hide);
      function onPointerDown(e) {
        if (e.pointerType !== 'touch') return;
        touchAt.current = Date.now();
        clearTimeout(t.current);
        if (open) hide(); else setOpen(true);
      }
      /* Taps also send emulated mouseenter/mouseleave and focus; the tap toggle has already handled those. */
      function onEnter() { if (!fromTouch()) show(); }
      function onLeave() { if (!fromTouch()) hide(); }
      function onFocus() { if (!fromTouch()) show(); }
      function onKey(e) { if (e.key === 'Escape' && open) { e.stopPropagation(); hide(); } }
      var side = pos ? pos.side : position;
      var tipStyle = null;
      if (pos) tipStyle = side === 'top' || side === 'bottom' ? { left: pos.arrowX - 7 } : { top: pos.arrowY - 3.5 };
      var child = props.children;
      var trigger = React.isValidElement(child) && React.Children.count(child) === 1
        ? React.cloneElement(child, { 'aria-describedby': open ? id : undefined })
        : h('span', { tabIndex: 0, className: 'hy-tooltip__text', 'aria-describedby': open ? id : undefined }, child);
      return h('span', { ref: anchorRef, className: cx('hy-tooltip', props.className), onPointerDown: onPointerDown, onMouseEnter: onEnter, onMouseLeave: onLeave, onFocus: onFocus, onBlur: hide, onKeyDown: onKey },
        trigger,
        open ? portal(h('span', {
          ref: boxRef, role: 'tooltip', id: id,
          className: cx('hy-tooltip__box', 'hy-tooltip__box--' + side, type && 'hy-tooltip__box--' + type, props.center === false && 'hy-tooltip__box--start'),
          style: floatingStyle(pos, { zIndex: 'var(--z-tooltip)', maxWidth: 'min(250px, calc(100vw - 16px))' })
        }, props.text, props.tip === false ? null : h(TooltipTip, { style: tipStyle }))) : null);
    }

    define('Tooltip', Tooltip);
  })();

  /* ---- Collapse ---- */
  (function () {
    function Collapse(props) {
      var c = useControllable(props.expanded, !!props.defaultExpanded, props.onChange);
      var open = c[0], setOpen = c[1];
      var auto = useId();
      var base = props.id || auto;
      var btnId = base + '-trigger', panelId = base + '-panel';
      var panelRef = useRef(null);
      var locked = !!props.__locked;
      var setRef = useRef(setOpen);
      setRef.current = setOpen;

      useLayoutEffect(function () {
        var el = panelRef.current;
        if (!el) return;
        if (open) el.removeAttribute('hidden');
        else el.setAttribute('hidden', 'onbeforematch' in document.body ? 'until-found' : '');
      }, [open]);
      useEffect(function () {
        var el = panelRef.current;
        if (!el) return;
        function onMatch() { setRef.current(true); }
        el.addEventListener('beforematch', onMatch);
        return function () { el.removeEventListener('beforematch', onMatch); };
      }, []);

      var inline = props.variant === 'inline';
      /* The inline disclosure is not a section heading, so it has none unless headingLevel asks for one. */
      var Heading = inline && !props.headingLevel ? 'div' : 'h' + Math.min(6, Math.max(2, props.headingLevel || 3));
      var rest = omit(props, ['title', 'children', 'defaultExpanded', 'expanded', 'onChange', 'size', 'variant', 'id', 'className', 'headingLevel', '__locked', '__grouped']);
      return h('div', Object.assign({}, rest, {
        className: cx('hy-collapse', inline && 'hy-collapse--inline', props.size === 'small' && 'hy-collapse--small', props.__grouped && 'is-grouped', open && 'is-open', props.className)
      }),
        h(Heading, { className: 'hy-collapse__heading' },
          h('button', {
            type: 'button', id: btnId, className: 'hy-collapse__trigger',
            'aria-expanded': open, 'aria-controls': panelId, 'aria-disabled': locked || undefined,
            onClick: function () { if (!locked) setOpen(!open); }
          },
            inline ? h('span', { className: 'hy-collapse__chev', 'aria-hidden': 'true' }, h(Glyph, { name: 'chevron', size: 14 })) : null,
            h('span', { className: 'hy-collapse__title' }, props.title),
            inline ? null : h('span', { className: 'hy-collapse__chev', 'aria-hidden': 'true' }, h(Glyph, { name: 'chevron' })))),
        h('div', { ref: panelRef, id: panelId, role: 'region', 'aria-labelledby': btnId, className: 'hy-collapse__panel' },
          h('div', { className: 'hy-collapse__body' }, props.children)));
    }

    function CollapseGroup(props) {
      var kids = React.Children.toArray(props.children).filter(React.isValidElement);
      var st = useState(function () {
        var init = [];
        kids.forEach(function (k, i) { if (k.props.defaultExpanded && (props.multiple || !init.length)) init.push(i); });
        return init;
      });
      var openSet = st[0], setOpenSet = st[1];
      var rest = omit(props, ['children', 'multiple', 'className']);
      return h('div', Object.assign({}, rest, { className: cx('hy-collapse-group', props.className) }),
        kids.map(function (child, i) {
          var isOpen = openSet.indexOf(i) >= 0;
          return React.cloneElement(child, {
            key: child.key != null ? child.key : i,
            expanded: isOpen,
            __grouped: true,
            __locked: !props.multiple && isOpen,
            onChange: function (next) {
              setOpenSet(function (cur) {
                if (props.multiple) return next ? cur.concat([i]) : cur.filter(function (x) { return x !== i; });
                return next ? [i] : cur.filter(function (x) { return x !== i; });
              });
              if (child.props.onChange) child.props.onChange(next);
            }
          });
        }));
    }

    Collapse.Group = CollapseGroup;

    define('Collapse', Collapse);
    define('CollapseGroup', CollapseGroup);
  })();

  /* ---- Grid ---- */
  (function () {
    /* Responsive values are a scalar or { sm, md, lg }. Each breakpoint falls back to the one below it.
       Breakpoints are container widths of the Grid: md >= 600px, lg >= 960px. */
    function gridBp(v, fallback) {
      var o = v !== null && typeof v === 'object' ? v : { sm: v };
      var sm = o.sm !== undefined ? o.sm : (o.md !== undefined ? o.md : (o.lg !== undefined ? o.lg : fallback));
      var md = o.md !== undefined ? o.md : sm;
      var lg = o.lg !== undefined ? o.lg : md;
      return { sm: sm, md: md, lg: lg };
    }

    function GridSystem(props) {
      var w = props.guideWidth !== undefined ? props.guideWidth : 1;
      var style = Object.assign({ '--hy-guide-w': w + 'px' }, props.style);
      return h('div', {
        className: cx('hy-grid-system', props.dashedGuides && 'hy-grid-system--dashed', props.debug && 'hy-grid-system--debug', props.className),
        style: style
      }, props.children);
    }

    function GridGuides(p) {
      var cells = [];
      for (var r = 1; r <= p.rows; r++) {
        for (var c = 1; c <= p.columns; c++) {
          cells.push(h('div', {
            key: r + '-' + c,
            className: cx('hy-grid__guide', c === p.columns && 'is-last-col', r === p.rows && 'is-last-row')
          }));
        }
      }
      return h('div', {
        className: cx('hy-grid__guides', p.bp && 'hy-grid__guides--' + p.bp),
        style: { gridTemplateColumns: 'repeat(' + p.columns + ', minmax(0, 1fr))', gridTemplateRows: 'repeat(' + p.rows + ', 1fr)' }
      }, cells);
    }

    function Grid(props) {
      var cols = gridBp(props.columns, 1);
      var rows = gridBp(props.rows, 1);
      var same = cols.sm === cols.md && cols.md === cols.lg && rows.sm === rows.md && rows.md === rows.lg;
      var style = Object.assign({
        '--hy-cols-sm': cols.sm, '--hy-cols-md': cols.md, '--hy-cols-lg': cols.lg,
        '--hy-rows-sm': rows.sm, '--hy-rows-md': rows.md, '--hy-rows-lg': rows.lg
      }, props.style);
      var guides = same
        ? h(GridGuides, { columns: cols.sm, rows: rows.sm })
        : ['sm', 'md', 'lg'].map(function (b) { return h(GridGuides, { key: b, bp: b, columns: cols[b], rows: rows[b] }); });
      return h('div', {
        className: cx('hy-grid',
          props.height === 'preserve-aspect-ratio' && 'hy-grid--square',
          props.hideGuides === 'row' && 'hy-grid--hide-row',
          props.hideGuides === 'column' && 'hy-grid--hide-column',
          props.className),
        style: style
      },
        h('div', { className: 'hy-grid__inner' },
          h('div', { className: 'hy-grid__decor', 'aria-hidden': 'true' }, guides),
          props.children,
          h('div', { className: 'hy-grid__frame', 'aria-hidden': 'true' })));
    }

    function GridCell(props) {
      var col = gridBp(props.column, 'auto');
      var row = gridBp(props.row, 'auto');
      var style = Object.assign({
        '--hy-c-sm': String(col.sm), '--hy-c-md': String(col.md), '--hy-c-lg': String(col.lg),
        '--hy-r-sm': String(row.sm), '--hy-r-md': String(row.md), '--hy-r-lg': String(row.lg)
      }, props.style);
      return h('div', { className: cx('hy-grid__cell', props.solid && 'hy-grid__cell--solid', props.className), style: style }, props.children);
    }

    /* A cross marks a guide intersection. column/row are 1-based grid lines, so a 3-column grid has lines 1–4. */
    function GridCross(props) {
      return h('div', {
        className: cx('hy-grid__cross', props.className), 'aria-hidden': 'true',
        style: { '--hy-x': props.column || 1, '--hy-y': props.row || 1 }
      });
    }

    Grid.System = GridSystem;
    Grid.Cell = GridCell;
    Grid.Cross = GridCross;

    define('GridSystem', GridSystem);
    define('GridCell', GridCell);
    define('GridCross', GridCross);
    define('Grid', Grid);
  })();

  /* ---- Scroller ---- */
  (function () {
    function scrollerSize(v) { return typeof v === 'number' ? v + 'px' : v; }

    function Scroller(props) {
      var overflow = props.overflow || 'y';
      var horizontal = overflow === 'x';
      var viewport = useRef(null);
      var st = useState({ top: false, bottom: false, left: false, right: false, any: false });
      var edges = st[0];

      function measure() {
        var el = viewport.current;
        if (!el) return;
        var next = {
          top: el.scrollTop > 1,
          bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 1,
          left: el.scrollLeft > 1,
          right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1
        };
        next.any = next.top || next.bottom || next.left || next.right;
        st[1](function (prev) {
          return prev.top === next.top && prev.bottom === next.bottom && prev.left === next.left && prev.right === next.right ? prev : next;
        });
      }

      useEffect(function () {
        measure();
        var el = viewport.current;
        if (!el || typeof ResizeObserver === 'undefined') return;
        var ro = new ResizeObserver(measure);
        ro.observe(el);
        if (el.firstChild) ro.observe(el.firstChild);
        return function () { ro.disconnect(); };
      }, []);

      /* Buttons step to the previous or next direct child of the content container. */
      function step(dir) {
        var el = viewport.current;
        if (!el) return;
        var content = el.firstChild;
        var kids = Array.prototype.slice.call(content.children);
        var vr = el.getBoundingClientRect();
        var pos = horizontal ? el.scrollLeft : el.scrollTop;
        var offsets = kids.map(function (k) {
          var r = k.getBoundingClientRect();
          return horizontal ? r.left - vr.left + el.scrollLeft : r.top - vr.top + el.scrollTop;
        });
        var target = null;
        if (dir > 0) {
          for (var i = 0; i < offsets.length; i++) if (offsets[i] > pos + 1) { target = offsets[i]; break; }
        } else {
          for (var j = offsets.length - 1; j >= 0; j--) if (offsets[j] < pos - 1) { target = offsets[j]; break; }
          if (target === null) target = 0;
        }
        if (target === null) target = horizontal ? el.scrollWidth : el.scrollHeight;
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var opts = { behavior: reduce ? 'auto' : 'smooth' };
        opts[horizontal ? 'left' : 'top'] = target;
        el.scrollTo(opts);
      }

      var label = props['aria-label'];
      function btn(dir, name, icon, enabled) {
        return h('button', {
          type: 'button', className: 'hy-scroller__btn', onClick: function () { step(dir); }, disabled: !enabled,
          'aria-label': 'Scroll ' + (label ? label + ' ' : '') + name
        }, h(HY.Icon, { name: icon, size: 16 }));
      }
      var buttons = props.withButtons ? h('div', { className: 'hy-scroller__btns' },
        horizontal ? btn(-1, 'Left', 'chevron-left', edges.left) : btn(-1, 'Up', 'chevron-up', edges.top),
        horizontal ? btn(1, 'Right', 'chevron-right', edges.right) : btn(1, 'Down', 'chevron-down', edges.bottom)) : null;

      var style = Object.assign({}, props.style);
      if (props.width !== undefined) style.width = scrollerSize(props.width);
      if (props.height !== undefined) style.height = scrollerSize(props.height);

      return h('div', {
        className: cx('hy-scroller', 'hy-scroller--' + overflow, props.withButtons && 'hy-scroller--buttons', props.className),
        style: style
      },
        !horizontal ? buttons : null,
        h('div', { className: 'hy-scroller__frame' },
          h('div', {
            ref: viewport, className: 'hy-scroller__viewport', onScroll: measure,
            tabIndex: edges.any ? 0 : undefined,
            role: label ? 'region' : undefined, 'aria-label': label
          },
            h('div', { className: cx('hy-scroller__content', props.childrenContainerClassName) }, props.children)),
          h('div', { className: cx('hy-scroller__fade hy-scroller__fade--top', edges.top && 'is-on'), 'aria-hidden': 'true' }),
          h('div', { className: cx('hy-scroller__fade hy-scroller__fade--bottom', edges.bottom && 'is-on'), 'aria-hidden': 'true' }),
          h('div', { className: cx('hy-scroller__fade hy-scroller__fade--left', edges.left && 'is-on'), 'aria-hidden': 'true' }),
          h('div', { className: cx('hy-scroller__fade hy-scroller__fade--right', edges.right && 'is-on'), 'aria-hidden': 'true' })),
        horizontal ? buttons : null);
    }

    define('Scroller', Scroller);
  })();

  /* ---- Separator ---- */
  (function () {
    function Separator(props) {
      var vertical = props.orientation === 'vertical';
      var hidden = props['aria-hidden'] === true || props['aria-hidden'] === 'true' || props.decorative;
      var rest = omit(props, ['orientation', 'inset', 'decorative', 'className']);
      return h('div', Object.assign({
        role: hidden ? 'none' : 'separator',
        'aria-orientation': hidden || !vertical ? undefined : 'vertical',
        'data-orientation': vertical ? 'vertical' : 'horizontal'
      }, rest, {
        className: cx('hy-separator', vertical ? 'hy-separator--vertical' : 'hy-separator--horizontal', props.inset && 'hy-separator--inset', props.className)
      }));
    }

    define('Separator', Separator);
  })();

  /* ---- ShowMore ---- */
  (function () {
    function ShowMore(props) {
      var c = useControllable(props.expanded, !!props.defaultExpanded, props.onChange);
      var expanded = c[0], setExpanded = c[1];
      function onClick(e) {
        if (props.onClick) props.onClick(e);
        if (!e.defaultPrevented) setExpanded(!expanded);
      }
      var label = expanded ? (props.lessLabel || 'Show Less')
        : (props.moreLabel || (props.count ? 'Show ' + props.count + ' More' : 'Show More'));
      var rest = omit(props, ['expanded', 'defaultExpanded', 'onChange', 'onClick', 'noBorder', 'count', 'moreLabel', 'lessLabel', 'className', 'style']);
      return h('div', { className: cx('hy-showmore', props.noBorder && 'hy-showmore--plain', props.className), style: props.style },
        h('button', Object.assign({ type: 'button' }, rest, { className: 'hy-showmore__btn', 'aria-expanded': expanded, onClick: onClick }),
          h('span', null, label),
          h('span', { className: cx('hy-showmore__chev', expanded && 'is-up'), 'aria-hidden': 'true' }, h(Glyph, { name: 'chevron' }))));
    }

    define('ShowMore', ShowMore);
  })();

  /* ---- Avatar ---- */
  (function () {
    /* Avatars show an image you pass, initials, or a generated gradient shape: never a fetched photo. */
    var AVATAR_PAIRS = [['blue-700', 'purple-700'], ['teal-700', 'blue-700'], ['pink-700', 'amber-700'], ['green-700', 'teal-700'], ['purple-700', 'pink-700'], ['amber-700', 'red-700'], ['blue-700', 'teal-700'], ['pink-700', 'purple-700']];
    function avatarHash(s) {
      var n = 0;
      for (var i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) | 0;
      return Math.abs(n);
    }

    function Avatar(props) {
      var size = props.size || 32;
      var name = props.title || props.username || props.name;
      var letter = props.letter ? String(props.letter).toUpperCase().slice(0, size < 24 ? 1 : 2) : null;
      var kind = props.src ? 'image' : letter ? 'letter' : props.placeholder ? 'placeholder' : 'shape';
      var style = Object.assign({ width: size, height: size }, props.style);
      if (kind === 'letter') style.fontSize = Math.max(12, Math.round(size * 0.375));
      if (kind === 'shape') {
        var pair = AVATAR_PAIRS[avatarHash(String(name || 'hyprsh')) % AVATAR_PAIRS.length];
        style.backgroundImage = 'linear-gradient(135deg, var(--' + pair[0] + '), var(--' + pair[1] + '))';
      }
      var hidden = props['aria-hidden'] === true || props['aria-hidden'] === 'true' || (kind === 'placeholder' && !name);
      var label = name || (letter ? 'Avatar with initials: ' + letter : 'Avatar');
      var rest = omit(props, ['size', 'title', 'username', 'name', 'letter', 'placeholder', 'src', 'alt', 'style', 'className', 'aria-hidden']);
      return h('span', Object.assign({}, rest, {
        className: cx('hy-avatar', 'hy-avatar--' + kind, props.className), style: style,
        role: hidden || kind === 'image' ? undefined : 'img', 'aria-label': hidden || kind === 'image' ? undefined : label,
        'aria-hidden': hidden ? 'true' : undefined, title: name || undefined
      }),
        kind === 'image' ? h('img', { src: props.src, alt: props.alt !== undefined ? props.alt : (name || ''), width: size, height: size, draggable: false }) : null,
        kind === 'letter' ? h('span', { 'aria-hidden': 'true' }, letter) : null);
    }

    function AvatarGroup(props) {
      var size = props.size || 32;
      var members = props.members || [];
      var limit = props.limit && props.limit < members.length ? props.limit : members.length;
      var shown = members.slice(0, limit);
      var more = members.length - limit;
      var overlap = props.overlap === undefined || props.overlap === 'auto' ? Math.round(size * 0.3125) : props.overlap;
      var count = shown.length + (more > 0 ? 1 : 0);
      var names = members.map(function (m) { return m.title || m.username || m.name || m.letter; }).filter(Boolean);
      var label = props['aria-label'] || (names.length ? names.slice(0, limit).join(', ') + (more > 0 ? ' and ' + more + ' more' : '') : members.length + ' members');
      function z(i) { return props.reverse ? i + 1 : count - i; }
      return h('div', { role: 'group', 'aria-label': label, className: cx('hy-avatar-group', props.className), style: Object.assign({ '--hy-avatar-overlap': overlap + 'px' }, props.style) },
        shown.map(function (m, i) {
          return h('span', { key: (m.username || m.title || m.letter || '') + i, className: 'hy-avatar-group__item', style: { zIndex: z(i) }, 'aria-hidden': 'true' },
            h(Avatar, Object.assign({}, m, { size: size })));
        }),
        more > 0 ? h('span', { className: 'hy-avatar-group__item', style: { zIndex: z(shown.length) }, 'aria-hidden': 'true' },
          h('span', { className: 'hy-avatar hy-avatar-group__more', style: { minWidth: size + Math.round(overlap / 2), height: size, fontSize: size < 32 ? 12 : 13 } }, '+' + more)) : null);
    }

    function AvatarWithIcon(props) {
      var size = props.size || 32;
      var badge = Math.max(14, Math.round(size * 0.5));
      return h('span', { className: cx('hy-avatar-icon', props.className), style: { width: size, height: size } },
        h(Avatar, omit(props, ['icon', 'iconBackground', 'className'])),
        h('span', { className: cx('hy-avatar-icon__badge', props.iconBackground && 'hy-avatar-icon__badge--bg'), style: { width: badge, height: badge }, 'aria-hidden': 'true' }, props.icon));
    }

    Avatar.Group = AvatarGroup;
    Avatar.WithIcon = AvatarWithIcon;

    define('Avatar', Avatar);
    define('AvatarGroup', AvatarGroup);
    define('AvatarWithIcon', AvatarWithIcon);
  })();

  /* ---- Browser ---- */
  (function () {
    function browserHost(address) {
      return String(address || '').replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
    }

    function Browser(props) {
      var copied = useState(false);
      var timer = useRef(null);
      useEffect(function () { return function () { clearTimeout(timer.current); }; }, []);
      function copy() {
        copyText(props.address).then(function () {
          copied[1](true);
          clearTimeout(timer.current);
          timer.current = setTimeout(function () { copied[1](false); }, 2000);
        }, function () {});
      }
      var rest = omit(props, ['address', 'children', 'className']);
      return h('div', Object.assign({}, rest, { className: cx('hy-browser', props.className) }),
        h('div', { className: 'hy-browser__bar' },
          h('div', { className: 'hy-browser__side', 'aria-hidden': 'true' },
            h('span', { className: 'hy-browser__dots' },
              h('span', { className: 'hy-browser__dot hy-browser__dot--close' }),
              h('span', { className: 'hy-browser__dot hy-browser__dot--min' }),
              h('span', { className: 'hy-browser__dot hy-browser__dot--max' })),
            h('span', { className: 'hy-browser__controls' },
              h(HY.Icon, { name: 'arrow-left', size: 14 }),
              h(HY.Icon, { name: 'arrow-right', size: 14 }),
              h(HY.Icon, { name: 'rotate-cw', size: 14 }))),
          h('div', { className: 'hy-browser__center' },
            props.address ? h('div', { className: 'hy-browser__address' },
              h('span', { className: 'hy-browser__url', title: props.address, translate: 'no' }, browserHost(props.address)),
              h('button', { type: 'button', className: 'hy-browser__copy', onClick: copy, 'aria-label': copied[0] ? 'Copied URL' : 'Copy URL' },
                h(Glyph, { name: copied[0] ? 'check' : 'copy', size: 14 })),
              h('span', { className: 'hy-sr', 'aria-live': 'polite' }, copied[0] ? 'URL copied' : '')) : null),
          h('div', { className: 'hy-browser__side hy-browser__side--end', 'aria-hidden': 'true' })),
        h('div', { className: 'hy-browser__view' }, props.children));
    }

    define('Browser', Browser);
  })();

  /* ---- Logo ---- */
  (function () {
    /* Logo: the hyprsh delta starship, alone or with the wordmark.
       tone 'accent' (default; 'nebula' is its old name) fills the mark with the blue accent; 'mono' uses currentColor. */
    var LOGO_PATH = 'M12 1.5 L22.5 20 L15 16.5 L12 22 L9 16.5 L1.5 20 Z M12 7 L10.7 12.5 L12 14.5 L13.3 12.5 Z';

    function Logo(props) {
      var variant = props.variant === 'mark' || props.variant === 'wordmark' ? props.variant : 'lockup';
      var size = props.size || 24;
      var mono = props.tone === 'mono';
      var label = props['aria-label'] || 'hyprsh';
      var rest = omit(props, ['variant', 'size', 'tone', 'className', 'style', 'aria-label']);
      var mark = variant === 'wordmark' ? null : h('svg', { className: 'hy-logo__mark', viewBox: '0 0 24 24', width: size, height: size, 'aria-hidden': 'true', focusable: 'false' },
        h('path', { d: LOGO_PATH, fill: mono ? 'currentColor' : 'var(--accent-700)' }));
      var word = variant === 'mark' ? null : h('span', { className: 'hy-logo__word', 'aria-hidden': 'true' }, 'hyprsh');
      return h('span', Object.assign(rest, {
        role: 'img', 'aria-label': label,
        className: cx('hy-logo', 'hy-logo--' + variant, mono && 'hy-logo--mono', props.className),
        style: Object.assign({ '--hy-logo-size': size + 'px' }, props.style)
      }), mark, word);
    }

    define('Logo', Logo);
  })();

  /* ---- Phone ---- */
  (function () {
    function phoneHost(address) {
      return String(address || '').replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
    }

    /* A phone-shaped frame for a mobile screenshot or recording. Everything but the screen content is aria-hidden. */
    function Phone(props) {
      var rest = omit(props, ['address', 'children', 'className']);
      return h('div', Object.assign({}, rest, { className: cx('hy-phone', props.className) }),
        h('div', { className: 'hy-phone__body' },
          h('div', { className: 'hy-phone__screen' },
            props.children !== undefined && props.children !== null
              ? h('div', { className: 'hy-phone__content' }, props.children)
              : h('div', { className: 'hy-phone__placeholder', 'aria-hidden': 'true' }),
            props.address ? h('div', { className: 'hy-phone__shade', 'aria-hidden': 'true' }) : null),
          h('span', { className: 'hy-phone__island', 'aria-hidden': 'true' }),
          props.address ? h('div', { className: 'hy-phone__toolbar', 'aria-hidden': 'true' },
            h('span', { className: 'hy-phone__pill hy-phone__pill--round' }, h(HY.Icon, { name: 'chevron-left', size: 16 })),
            h('span', { className: 'hy-phone__pill hy-phone__pill--address', translate: 'no' }, phoneHost(props.address)),
            h('span', { className: 'hy-phone__pill hy-phone__pill--round' }, h(HY.Icon, { name: 'ellipsis', size: 16 }))) : null,
          h('span', { className: 'hy-phone__home', 'aria-hidden': 'true' })),
        h('span', { className: 'hy-phone__key hy-phone__key--action', 'aria-hidden': 'true' }),
        h('span', { className: 'hy-phone__key hy-phone__key--up', 'aria-hidden': 'true' }),
        h('span', { className: 'hy-phone__key hy-phone__key--down', 'aria-hidden': 'true' }),
        h('span', { className: 'hy-phone__key hy-phone__key--power', 'aria-hidden': 'true' }));
    }

    define('Phone', Phone);
  })();

  /* ---- Video ---- */
  (function () {
    function videoTime(s) {
      s = isFinite(s) && s > 0 ? Math.floor(s) : 0;
      var hrs = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
      var ss = (sec < 10 ? '0' : '') + sec;
      return hrs ? hrs + ':' + (m < 10 ? '0' : '') + m + ':' + ss : m + ':' + ss;
    }
    function videoSize(v) { return typeof v === 'number' ? v + 'px' : v; }
    function videoReduced() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }

    /* A muted, looping product clip with a small play/seek bar. The file loads only once the player nears the viewport
       (lazy), and it never autoplays when the reader prefers reduced motion. Without src it draws a placeholder poster. */
    function Video(props) {
      var rootRef = useRef(null), vidRef = useRef(null);
      var lazy = props.lazy !== false;
      var inView = useState(!lazy);
      var playing = useState(false);
      var time = useState(0);
      var dur = useState(0);
      var src = props.src;
      var showControls = props.controls !== false;

      useEffect(function () {
        if (inView[0] || !src) return;
        var el = rootRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') { inView[1](true); return; }
        var io = new IntersectionObserver(function (entries) {
          if (entries.some(function (e) { return e.isIntersecting; })) { inView[1](true); io.disconnect(); }
        }, { rootMargin: '200px' });
        io.observe(el);
        return function () { io.disconnect(); };
      }, [inView[0], src]);

      useEffect(function () {
        var v = vidRef.current;
        if (!v || !inView[0] || !src) return;
        if (props.autoPlay !== false && !videoReduced()) {
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        }
      }, [inView[0], src]);

      var ready = !!(src && inView[0]);
      function toggle() {
        var v = vidRef.current;
        if (!v || !ready) return;
        if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      }
      function seek(e) {
        var v = vidRef.current, t = Number(e.target.value);
        if (v) v.currentTime = t;
        time[1](t);
      }

      var w = props.width, ht = props.height;
      var style = {};
      if (w !== undefined) style.width = videoSize(w);
      if (typeof w === 'number' && typeof ht === 'number') style.aspectRatio = w + ' / ' + ht;
      else if (ht !== undefined) style.height = videoSize(ht);
      Object.assign(style, props.style);

      var pct = dur[0] ? Math.min(100, (time[0] / dur[0]) * 100) : 0;
      var label = props['aria-label'];
      var rest = omit(props, ['src', 'width', 'height', 'lazy', 'loop', 'controls', 'muted', 'autoPlay', 'poster', 'playsInline', 'className', 'style', 'aria-label']);

      return h('div', Object.assign({}, rest, {
        ref: rootRef, style: style,
        className: cx('hy-video', playing[0] && 'is-playing', !src && 'is-empty', props.className)
      }),
        ready ? h('video', {
          ref: vidRef, className: 'hy-video__media', src: src, poster: props.poster,
          loop: props.loop !== false, muted: props.muted !== false, playsInline: props.playsInline !== false,
          preload: 'metadata', 'aria-label': label,
          onClick: toggle,
          onPlay: function () { playing[1](true); },
          onPause: function () { playing[1](false); },
          onTimeUpdate: function (e) { time[1](e.target.currentTime); },
          onLoadedMetadata: function (e) { dur[1](e.target.duration); },
          onDurationChange: function (e) { dur[1](e.target.duration); }
        }) : props.poster
          ? h('img', { className: 'hy-video__media', src: props.poster, alt: '', 'aria-hidden': 'true' })
          : h('div', { className: 'hy-video__poster', role: label ? 'img' : undefined, 'aria-label': label, 'aria-hidden': label ? undefined : 'true' }),
        showControls ? h('div', { className: 'hy-video__bar' },
          h('button', {
            type: 'button', className: 'hy-video__play', onClick: toggle, disabled: !ready,
            'aria-label': playing[0] ? 'Pause' : 'Play'
          }, h(HY.Icon, { name: playing[0] ? 'pause' : 'play', size: 16 })),
          h('span', { className: 'hy-video__time' }, videoTime(time[0])),
          h('input', {
            type: 'range', className: 'hy-video__seek', min: 0, max: dur[0] || 0, step: 0.1, value: Math.min(time[0], dur[0] || 0),
            disabled: !ready || !dur[0], onChange: seek, style: { '--p': pct + '%' },
            'aria-label': 'Seek', 'aria-valuetext': videoTime(time[0]) + ' of ' + videoTime(dur[0])
          }),
          h('span', { className: 'hy-video__time' }, videoTime(dur[0]))) : null);
    }

    define('Video', Video);
  })();

  window.Hyprsh = Object.assign(window.Hyprsh || {}, HY);
})();
