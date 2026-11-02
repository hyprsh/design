/*
 * ActionBar: the bar at the foot of a scrolling area while there is something to act on (ticked rows, unsaved changes).
 * Renders only while `open`. It is sticky in the flow of its scroll container, never takes focus, announces its text in a
 * polite live region, and gives focus back when it closes with focus inside.
 */

/* The nearest ancestor that scrolls vertically, or null. */
function actionBarScroller(el) {
  for (var p = el && el.parentElement; p; p = p.parentElement) {
    var oy = getComputedStyle(p).overflowY;
    if (oy === 'auto' || oy === 'scroll' || oy === 'overlay') return p;
  }
  return null;
}

/* Focuses an element that may not be focusable by Tab (a scroll container), without scrolling it. */
function actionBarFocus(el) {
  if (!el || !el.focus) return;
  if (el.tabIndex < 0 && !el.hasAttribute('tabindex')) {
    el.setAttribute('tabindex', '-1');
    el.addEventListener('blur', function () { el.removeAttribute('tabindex'); }, { once: true });
  }
  el.focus({ preventScroll: true });
}

function ActionBar(props) {
  var open = !!props.open;
  var root = useRef(null);
  var labelRef = useRef(null);
  var errorRef = useRef(null);
  var spoken = useState('');
  var track = useRef({ prev: null, scroller: null, wasOpen: false, restore: false });
  var t = track.current;

  /* Closing with focus inside: read it now, while the bar is still in the DOM. A removed node drops focus to the body. */
  if (!open && t.wasOpen && root.current && typeof document !== 'undefined' && root.current.contains(document.activeElement)) t.restore = true;

  /* Remember the element that had focus before it entered the bar, and the scroll container as the fallback. */
  useEffect(function () {
    if (!open) return;
    var bar = root.current;
    var active = document.activeElement;
    t.prev = active && active !== document.body && !bar.contains(active) ? active : null;
    t.scroller = actionBarScroller(bar);
    function onFocusIn(e) { if (!bar.contains(e.target)) t.prev = e.target; }
    document.addEventListener('focusin', onFocusIn);
    return function () { document.removeEventListener('focusin', onFocusIn); };
  }, [open]);

  useEffect(function () {
    t.wasOpen = open;
    if (open || !t.restore) return;
    t.restore = false;
    var to = t.prev && t.prev.isConnected ? t.prev : (t.scroller && t.scroller.isConnected ? t.scroller : null);
    t.prev = null;
    actionBarFocus(to);
  }, [open]);

  /* The live region exists empty first and gets its text afterwards, so the appearance is announced too. */
  var say = spoken[0], setSay = spoken[1];
  useEffect(function () {
    if (!open) { if (say) setSay(''); return; }
    var parts = [];
    if (labelRef.current) parts.push(labelRef.current.textContent);
    if (errorRef.current) parts.push('Error: ' + errorRef.current.textContent);
    var next = parts.join('. ');
    if (next === say) return;
    if (!say) {
      var timer = setTimeout(function () { setSay(next); }, 100);
      return function () { clearTimeout(timer); };
    }
    setSay(next);
  });

  if (!open) return null;

  var sel = props.selection;
  var label = sel ? sel.count + ' selected' : props.label;
  var selectionButtons = sel ? [
    sel.onSelectAll && sel.count < sel.total
      ? h(HY.Button, { key: 'all', variant: 'tertiary', size: 'small', onClick: sel.onSelectAll }, 'Select All') : null,
    h(HY.Button, { key: 'clear', variant: 'tertiary', size: 'small', onClick: sel.onClear }, 'Clear')
  ] : null;
  var hasError = props.error !== undefined && props.error !== null && props.error !== false;

  return h('div', { ref: root, className: cx('hy-action-bar', props.opaque && 'hy-action-bar--opaque', props.className) },
    h('div', { className: 'hy-action-bar__surface' },
      h('div', { className: 'hy-action-bar__row' },
        label ? h('div', { ref: labelRef, className: 'hy-action-bar__label' }, label) : null,
        selectionButtons || props.actions ? h('div', { className: 'hy-action-bar__actions' }, selectionButtons, props.actions) : null,
        props.onClose
          ? h(HY.Button, { className: 'hy-action-bar__close', variant: 'tertiary', size: 'small', svgOnly: true, 'aria-label': props.closeLabel || 'Close', onClick: props.onClose },
              h(Glyph, { name: 'x', size: 16 }))
          : null),
      hasError
        ? h('p', { className: 'hy-action-bar__error' },
            h(Glyph, { name: 'error', size: 14 }),
            h('span', { ref: errorRef }, props.error))
        : null),
    h('div', { className: 'hy-sr', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' }, say));
}

define('ActionBar', ActionBar);
