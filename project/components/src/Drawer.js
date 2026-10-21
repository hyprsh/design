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
