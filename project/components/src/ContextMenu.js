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

/* The reaction row: a role="group" of menuitem buttons with a roving tabindex. Menu leaves a [data-menu-row] to its own keys
   (and puts focus on its tab stop when it opens to the first item), so Left/Right stay in the row, Up/Down hop to the items,
   and Home/End and typeahead, which Menu handles, reach the items only. */
function ContextMenuReactions(props) {
  var menu = React.useContext(HY.MenuContainer.Context);
  var list = props.reactions;
  var st = useState(0), cur = st[0], setCur = st[1];
  var rowRef = useRef(null);
  var stop = Math.min(cur, list.length - 1);
  function buttons() { return rowRef.current ? Array.prototype.slice.call(rowRef.current.querySelectorAll('button')) : []; }
  function onKeyDown(e) {
    var go = null, i = buttons().indexOf(e.target.closest('button'));
    var key = e.key;
    if (key === 'ArrowRight' || key === 'ArrowLeft') {
      e.preventDefault(); e.stopPropagation();
      go = buttons()[i + (key === 'ArrowRight' ? 1 : -1)]; /* no wrap */
      if (go) go.focus();
    } else if (key === 'ArrowDown' || key === 'ArrowUp') {
      e.preventDefault(); e.stopPropagation();
      var items = Array.prototype.filter.call(menu && menu.listRef.current ? menu.listRef.current.querySelectorAll('[role^="menuitem"]') : [], function (el) {
        return !el.closest('[data-menu-row]') && el.getAttribute('aria-disabled') !== 'true';
      });
      go = key === 'ArrowDown' ? items[0] : items[items.length - 1];
      if (go) go.focus();
    }
  }
  return h('li', { role: 'none', className: 'hy-context-menu__row-li' },
    h('div', { ref: rowRef, role: 'group', 'aria-label': 'Reactions', 'data-menu-row': '', className: 'hy-context-menu__reactions', onKeyDown: onKeyDown },
      list.map(function (r, i) {
        return h('button', {
          key: r.value, type: 'button', role: 'menuitem', tabIndex: i === stop ? 0 : -1, 'aria-label': r.label, title: r.label,
          className: 'hy-context-menu__reaction',
          onFocus: function () { setCur(i); },
          onMouseEnter: function (e) { e.currentTarget.focus({ preventScroll: true }); },
          onClick: function () {
            if (props.onReact) props.onReact(r.value);
            if (menu) menu.close(true);
          }
        }, h('span', { className: 'hy-context-menu__emoji', 'aria-hidden': 'true' }, r.emoji));
      })));
}

/* The list is portalled and placed by Menu (useFloating at the pointer), which keeps it 8px inside the screen. */
function ContextMenuContent(props) {
  var reactions = props.reactions && props.reactions.length ? props.reactions : null;
  var rest = Object.assign({}, omit(props, ['reactions', 'onReact', 'children']), {
    'aria-label': props['aria-label'] || 'Context Menu', className: cx('hy-context-menu__list', props.className)
  });
  if (!reactions) return h(HY.Menu, Object.assign(rest, { children: props.children }));
  return h(HY.Menu, rest,
    h(ContextMenuReactions, { reactions: reactions, onReact: props.onReact }),
    h(HY.MenuDivider),
    props.children);
}

function ContextMenuItem(props) { return h(HY.MenuItem, props); }

ContextMenu.Trigger = ContextMenuTrigger;
ContextMenu.Content = ContextMenuContent;
ContextMenu.Item = ContextMenuItem;

define('ContextMenu', ContextMenu);
define('ContextMenuTrigger', ContextMenuTrigger);
define('ContextMenuContent', ContextMenuContent);
define('ContextMenuItem', ContextMenuItem);
