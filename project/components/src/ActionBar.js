/*
 * ActionBar: the bar at the foot of a scrolling area while there is something to act on (ticked rows, unsaved changes).
 * Renders only while `open`, as an inverted capsule that hugs its content and is centred in its scroll container. It is
 * sticky in the flow of that container, never takes focus, announces its text in a polite live region, and gives focus
 * back when it closes with focus inside. Below 480px of container width it spans the width and folds Select All and the
 * secondary actions into a More menu.
 */

var ACTION_BAR_TONES = ['success', 'info', 'warning', 'error', 'neutral'];
/* The container width below which the capsule spans the width and folds its quiet buttons into a More menu. */
var ACTION_BAR_NARROW = 480;

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

/* True for an element inside the bar's own More menu, which is portalled out of the bar. */
function actionBarOwnMenu(bar, el) {
  var menu = el && el.closest ? el.closest('[role="menu"]') : null;
  return !!(menu && menu.id && bar.querySelector('[aria-controls="' + menu.id + '"]'));
}

/* Narrow form only: true when the controls wrapped onto their own line below the lead. Hiding the separator then uses
   visibility, which keeps its width, so the answer doesn't flip back and forth. */
function actionBarStacked(bar, lead, controls) {
  if (!bar || !lead || !controls || bar.className.indexOf('hy-action-bar--narrow') < 0) return false;
  return controls.getBoundingClientRect().top >= lead.getBoundingClientRect().bottom - 1;
}

/* A string error gets its first sentence in bold; anything else is shown as given. */
function actionBarErrorText(error) {
  if (typeof error !== 'string') return error;
  var m = error.match(/^(.+?[.!?])\s+(\S[\s\S]*)$/);
  return m ? [h('b', { key: 'lead' }, m[1]), ' ' + m[2]] : error;
}

function ActionBar(props) {
  var open = !!props.open;
  var barRef = useRef(null);
  var labelRef = useRef(null);
  var errorRef = useRef(null);
  var announcementState = useState('');
  var announced = announcementState[0], setAnnounced = announcementState[1];
  var narrowState = useState(false);
  var narrow = narrowState[0], setNarrow = narrowState[1];
  /* Narrow only: the controls didn't fit beside the lead and wrapped onto a line of their own. */
  var stackedState = useState(false);
  var stacked = stackedState[0], setStacked = stackedState[1];
  var leadRef = useRef(null);
  var controlsRef = useRef(null);
  /* prevFocus: the element that had focus before it entered the bar. scroller: the fallback. wasOpen and restoreFocus
     carry the closing from render to effect. */
  var focusMemory = useRef({ prevFocus: null, scroller: null, wasOpen: false, restoreFocus: false });
  var memory = focusMemory.current;

  /* Closing with focus inside: read it now, while the bar is still in the DOM. A removed node drops focus to the body. */
  if (!open && memory.wasOpen && barRef.current && typeof document !== 'undefined' && barRef.current.contains(document.activeElement)) memory.restoreFocus = true;

  /* The narrow form follows the width of the bar's container, not the viewport. */
  useLayoutEffect(function () {
    if (!open) return;
    var parent = barRef.current && barRef.current.parentElement;
    if (!parent) return;
    function measure() {
      setNarrow(parent.clientWidth < ACTION_BAR_NARROW);
      setStacked(actionBarStacked(barRef.current, leadRef.current, controlsRef.current));
    }
    measure();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', measure); return function () { window.removeEventListener('resize', measure); }; }
    var ro = new ResizeObserver(measure);
    ro.observe(parent);
    return function () { ro.disconnect(); };
  }, [open]);

  /* After every render (a new label, the narrow form switching on): did the controls wrap below the lead? */
  useLayoutEffect(function () {
    if (open) setStacked(actionBarStacked(barRef.current, leadRef.current, controlsRef.current));
  });

  /* Remember the element that had focus before it entered the bar, and the scroll container as the fallback. */
  useEffect(function () {
    if (!open) return;
    var bar = barRef.current;
    var active = document.activeElement;
    memory.prevFocus = active && active !== document.body && !bar.contains(active) ? active : null;
    memory.scroller = actionBarScroller(bar);
    function onFocusIn(e) { if (!bar.contains(e.target) && !actionBarOwnMenu(bar, e.target)) memory.prevFocus = e.target; }
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
  var hasError = props.error !== undefined && props.error !== null && props.error !== false;
  var tone = hasError ? 'error' : (ACTION_BAR_TONES.indexOf(props.tone) >= 0 ? props.tone : null);

  /* The lead: the count chip with its clear button, or the tone dot and the label. */
  var lead = null;
  if (sel) {
    lead = h('span', { key: 'lead', ref: leadRef, className: 'hy-action-bar__count' },
      h('span', { ref: labelRef, className: 'hy-action-bar__count-text' }, sel.count + ' selected'),
      h(HY.Button, { className: 'hy-action-bar__clear', variant: 'tertiary', size: 'tiny', svgOnly: true, 'aria-label': 'Clear selection', onClick: sel.onClear },
        h(Glyph, { name: 'x', size: 14 })));
  } else if (props.label || tone) {
    lead = h('span', { key: 'lead', ref: leadRef, className: 'hy-action-bar__label' },
      tone ? h('span', { className: 'hy-action-bar__dot hy-action-bar__dot--' + tone, 'aria-hidden': 'true' }) : null,
      props.label ? h('span', { ref: labelRef, className: 'hy-action-bar__label-text' }, props.label) : null);
  }

  /* Select All and the secondary actions: quiet buttons when wide, items of the More menu when narrow. */
  var selectAll = sel && sel.onSelectAll && sel.count < sel.total ? { label: 'Select all ' + sel.total, onSelect: sel.onSelectAll } : null;
  var secondary = (props.secondaryActions || []).filter(Boolean);
  function quiet(item, key) {
    return h(HY.Button, { key: key, className: 'hy-action-bar__quiet', variant: 'tertiary', size: 'small', disabled: item.disabled, onClick: function () { item.onSelect(); } }, item.label);
  }
  var folded = narrow ? (selectAll ? [selectAll] : []).concat(secondary) : [];
  var more = folded.length
    ? h(HY.MenuContainer, { key: 'more', position: 'top-end' },
        h(HY.MenuButton, { className: 'hy-action-bar__more', variant: 'tertiary', size: 'small', svgOnly: true, 'aria-label': 'More actions' },
          h(HY.Icon, { name: 'ellipsis', size: 16 })),
        h(HY.Menu, null, folded.map(function (item, i) {
          return h(HY.MenuItem, { key: i, disabled: item.disabled, onSelect: function () { item.onSelect(); } }, item.label);
        })))
    : null;

  var before = [lead, !narrow && selectAll ? quiet(selectAll, 'all') : null].filter(Boolean);
  var after = [
    more,
    narrow ? null : secondary.map(function (item, i) { return quiet(item, 'secondary-' + i); }),
    props.actions ? h('div', { key: 'actions', className: 'hy-action-bar__actions' }, props.actions) : null
  ].filter(function (x) { return x && (!Array.isArray(x) || x.length); });
  var close = props.onClose
    ? h(HY.Button, { key: 'close', className: 'hy-action-bar__close', variant: 'tertiary', size: 'small', svgOnly: true, 'aria-label': props.closeLabel || 'Close', onClick: props.onClose },
        h(Glyph, { name: 'x', size: 16 }))
    : null;

  /* The controls after the lead, in one group: it lays out flat when wide, and when narrow it wraps as a whole onto its
     own line, right-aligned, if it doesn't fit beside the lead. */
  var controls = after.length || close
    ? h('div', { key: 'controls', ref: controlsRef, className: 'hy-action-bar__controls' },
        before.length && after.length ? h('span', { key: 'sep', className: 'hy-action-bar__sep', 'aria-hidden': 'true' }) : null,
        after,
        close)
    : null;

  return h(React.Fragment, null, h('div', { key: 'bar', ref: barRef, className: cx('hy-action-bar', narrow && 'hy-action-bar--narrow', narrow && stacked && 'hy-action-bar--stacked', props.className) },
    h('div', { className: 'hy-action-bar__surface' },
      hasError
        ? h('p', { className: 'hy-action-bar__error' },
            h('span', { ref: errorRef }, actionBarErrorText(props.error)))
        : null,
      h('div', { className: 'hy-action-bar__row' },
        before,
        controls))),
    liveRegion);
}

define('ActionBar', ActionBar);
