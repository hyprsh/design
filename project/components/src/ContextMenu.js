/*
 * ContextMenu: a Menu that opens at the pointer on right-click or long-press, or at the trigger with
 * Shift+F10 / the Menu key. ContextMenu > ContextMenuTrigger + ContextMenuContent > ContextMenuItem.
 * Reuses MenuContainer (with anchorPoint) so focus, typeahead and dismissal match Menu.
 */
var ContextMenuCtx = React.createContext(null);

/* When the app opens the menu (controlled `open`), no gesture set the focus target: take the first item, as Menu does. */
function ContextMenuFocus() {
  var menu = React.useContext(HY.MenuContainer.Context);
  var open = !!(menu && menu.open);
  useLayoutEffect(function () {
    if (open && !menu.focusOnOpen.current) menu.focusOnOpen.current = 'first';
  }, [open]);
  return null;
}

function ContextMenu(props) {
  var st = useState(null), point = st[0], setPoint = st[1];
  var triggerEl = useRef(null);
  var api = useRef({});
  api.current.setPoint = setPoint;
  /* Controlled by `open`, or held here; the gestures only ask via set(), which calls onOpenChange either way. */
  var oc = useControllable(props.open, !!props.defaultOpen, props.onOpenChange), open = oc[0], set = oc[1];
  var anchor = props.anchorPoint || point;

  /* defaultOpen (docs and previews): open near the top middle of the trigger area. */
  useLayoutEffect(function () {
    if (!props.defaultOpen || props.open !== undefined || !triggerEl.current) return;
    var r = triggerEl.current.getBoundingClientRect();
    setPoint({ x: Math.round(r.left + r.width / 2), y: Math.round(r.top + Math.min(32, r.height / 2)) });
  }, []);
  /* Open without a point from the app: 8px in from the trigger's top-left corner, as Shift+F10 does. */
  useLayoutEffect(function () {
    if (!open || anchor || !triggerEl.current) return;
    var r = triggerEl.current.getBoundingClientRect();
    setPoint({ x: Math.round(r.left + 8), y: Math.round(r.top + 8) });
  }, [open, anchor]);
  /* A closed menu forgets its point, also one from a gesture the app declined (controlled, `open` still false after
     the render that followed it), so the next open starts from its own gesture or the fallback. */
  useEffect(function () { if (!open && point) setPoint(null); }, [open, point]);
  /* A menu pinned to the viewport would drift from its target, so close when the page scrolls under it. */
  useEffect(function () {
    if (!open) return;
    function shut(e) {
      var t = e.target;
      if (t && t.nodeType === 1 && t.closest && t.closest('.hy-menu__list')) return;
      set(false);
    }
    window.addEventListener('scroll', shut, true);
    return function () { window.removeEventListener('scroll', shut, true); };
  }, [open, props.onOpenChange]);

  return h(ContextMenuCtx.Provider, { value: { api: api, triggerEl: triggerEl } },
    h(HY.MenuContainer, {
      open: open && !!anchor, onOpenChange: set, anchorPoint: anchor || undefined,
      className: cx('hy-context-menu', props.className), style: props.style
    }, h(ContextMenuFocus), props.children));
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
