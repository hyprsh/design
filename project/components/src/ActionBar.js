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
  var barRef = useRef(null);
  var labelRef = useRef(null);
  var errorRef = useRef(null);
  var announcementState = useState('');
  var announced = announcementState[0], setAnnounced = announcementState[1];
  /* prevFocus: the element that had focus before it entered the bar. scroller: the fallback. wasOpen and restoreFocus
     carry the closing from render to effect. */
  var focusMemory = useRef({ prevFocus: null, scroller: null, wasOpen: false, restoreFocus: false });
  var memory = focusMemory.current;

  /* Closing with focus inside: read it now, while the bar is still in the DOM. A removed node drops focus to the body. */
  if (!open && memory.wasOpen && barRef.current && typeof document !== 'undefined' && barRef.current.contains(document.activeElement)) memory.restoreFocus = true;

  /* Remember the element that had focus before it entered the bar, and the scroll container as the fallback. */
  useEffect(function () {
    if (!open) return;
    var bar = barRef.current;
    var active = document.activeElement;
    memory.prevFocus = active && active !== document.body && !bar.contains(active) ? active : null;
    memory.scroller = actionBarScroller(bar);
    function onFocusIn(e) { if (!bar.contains(e.target)) memory.prevFocus = e.target; }
    document.addEventListener('focusin', onFocusIn);
    return function () { document.removeEventListener('focusin', onFocusIn); };
  }, [open]);

  useEffect(function () {
    memory.wasOpen = open;
    if (open || !memory.restoreFocus) return;
    memory.restoreFocus = false;
    var target = memory.prevFocus && memory.prevFocus.isConnected ? memory.prevFocus : (memory.scroller && memory.scroller.isConnected ? memory.scroller : null);
    memory.prevFocus = null;
    actionBarFocus(target);
  }, [open]);

  /* The live region stays mounted, empty, while the bar is closed, so opening only changes its text. */
  useEffect(function () {
    if (!open) { if (announced) setAnnounced(''); return; }
    var parts = [];
    if (labelRef.current) parts.push(labelRef.current.textContent);
    if (errorRef.current) parts.push('Error: ' + errorRef.current.textContent);
    var text = parts.join('. ');
    if (text !== announced) setAnnounced(text);
  });

  var liveRegion = h('div', { key: 'live', className: 'hy-sr', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' }, announced);
  if (!open) return h(React.Fragment, null, null, liveRegion);

  var sel = props.selection;
  var label = sel ? sel.count + ' selected' : props.label;
  var selectionButtons = sel ? [
    sel.onSelectAll && sel.count < sel.total
      ? h(HY.Button, { key: 'all', variant: 'tertiary', size: 'small', onClick: sel.onSelectAll }, 'Select All') : null,
    h(HY.Button, { key: 'clear', variant: 'tertiary', size: 'small', onClick: sel.onClear }, 'Clear')
  ] : null;
  var hasError = props.error !== undefined && props.error !== null && props.error !== false;

  return h(React.Fragment, null, h('div', { key: 'bar', ref: barRef, className: cx('hy-action-bar', props.opaque && 'hy-action-bar--opaque', props.className) },
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
        : null)),
    liveRegion);
}

define('ActionBar', ActionBar);
