/*
 * Menu uses a compound API:
 *   MenuContainer > MenuButton + Menu > MenuItem | MenuLink | MenuItemLocked | MenuSection | MenuDivider | MenuSub
 *   MenuSub > MenuSubTrigger + Menu (the same parts again, to any depth): a submenu opens beside its parent, or under
 *   touch sizing replaces the open list's contents in place under a Back row.
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

/* Every role an item can have; the roving focus, Home/End and typeahead find all of them. */
var ITEM_SELECTOR = '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]';
/* The items the arrow keys reach: enabled ones, and disabled ones that carry a description (data-focusable).
   A row of its own (data-menu-row, which handles its keys itself) is not among them; menuRowStop() is its roving tab stop. */
function menuItems(list, enabledOnly) {
  if (!list) return [];
  return Array.prototype.filter.call(list.querySelectorAll(ITEM_SELECTOR), function (el) {
    if (el.closest('[data-menu-row]')) return false;
    return el.getAttribute('aria-disabled') !== 'true' || (!enabledOnly && el.hasAttribute('data-focusable'));
  });
}
function menuRowStop(list) { return list ? list.querySelector('[data-menu-row] [tabindex="0"]') : null; }
/* Keys the menu handles itself; they never reach the page's own handlers through the React tree or the document. */
var MENU_MAX_WIDTH = 'min(320px, calc(100vw - 16px))';
var MENU_KEYS = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' ', 'Escape', 'Tab'];

function MenuContainer(props) {
  var st = useState(!!props.defaultOpen);
  var controlled = props.open !== undefined;
  var open = controlled ? !!props.open : st[0];
  var rootRef = useRef(null), triggerRef = useRef(null), listRef = useRef(null);
  var focusOnOpen = useRef(null);
  /* The submenu lists are portalled like the list itself: a pointer-down in one is not an outside click. */
  var subEls = useRef([]);
  var subsRef = useMemo(function () {
    return { current: { contains: function (t) { return subEls.current.some(function (el) { return el.contains(t); }); } } };
  }, []);
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
  useDismiss(open, [triggerRef, listRef, subsRef], function (why) { close(why === 'escape'); });

  var ctx = {
    open: open, openMenu: openMenu, close: close, rootRef: rootRef, triggerRef: triggerRef, listRef: listRef, focusOnOpen: focusOnOpen, subEls: subEls,
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
  var ctx = React.useContext(MenuCtx), sub = React.useContext(SubCtx);
  if (!ctx || props.items) return h(LegacyMenu, props);
  if (sub) return h(SubList, props);
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
    var el = which === 'last' ? items[items.length - 1] : which === 'first' ? (menuRowStop(list) || items[0]) : null;
    (el || list).focus({ preventScroll: true });
  }, [placed]);

  var lvl = useLevel(useTouchSizing());
  function onKeyDown(e) { menuKeyDown(e, typed, ctx.listRef.current, ctx, null); }
  var side = pos ? pos.side : (anchor ? 'bottom' : ctx.side);
  var align = anchor ? 'start' : ctx.align;
  var style = floatingStyle(pos, Object.assign({ maxWidth: MENU_MAX_WIDTH },
    props.width !== undefined ? { width: props.width } : null, props.style));
  return portal(h('ul', {
    ref: ctx.listRef, id: ctx.menuId, role: 'menu', tabIndex: -1, 'aria-labelledby': anchor ? undefined : ctx.buttonId,
    'aria-label': props['aria-label'], onKeyDown: onKeyDown, onFocus: lvl.focusIn, onMouseMove: lvl.move, style: style,
    className: cx('hy-menu__list', 'hy-menu__list--' + side, 'hy-menu__list--' + align, anchor && 'hy-menu__list--point', lvl.drilled && 'hy-menu__list--drilled', props.className)
  }, h(LevelCtx.Provider, { value: lvl }, props.children)));
}

/* The keys of an open list: roving focus, Home/End, typeahead. `back` is set for a submenu: Left and Escape close it. */
function menuKeyDown(e, typed, list, ctx, back) {
  var typeahead = e.key.length === 1 && /\S/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey;
  if (MENU_KEYS.indexOf(e.key) >= 0 || typeahead) e.stopPropagation();
  /* Escape is closed here: the document listener in useDismiss no longer hears a stopped key. */
  if (e.key === 'Escape') { if (back) back(); else ctx.close(true); return; }
  if (back && e.key === 'ArrowLeft') { e.preventDefault(); back(); return; }
  var items = menuItems(list);
  if (!items.length) { if (e.key === 'Tab') ctx.close(false); return; }
  var i = items.indexOf(document.activeElement);
  var next = null;
  if (e.key === 'ArrowDown') next = items[(i + 1) % items.length];
  else if (e.key === 'ArrowUp') next = i === 0 && menuRowStop(list) || items[(i - 1 + items.length) % items.length];
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

/* ---- submenus ---- */
var SubCtx = React.createContext(null);    /* the MenuSub that a trigger and its Menu belong to */
var LevelCtx = React.createContext(null);  /* the open list an item sits in: which of its submenus is open, hover intent */

var SUB_DELAY = 120;   /* ms the pointer rests on a trigger before its submenu opens */
var INTENT_WAIT = 300; /* ms before a row the pointer crossed on its way to the submenu counts as hovered */
var TOUCH_QUERY = '(pointer: coarse), (max-width: 639px)';

/* Touch sizing, as the stylesheets define it. */
function useTouchSizing() {
  var st = useState(function () { return !!(window.matchMedia && window.matchMedia(TOUCH_QUERY).matches); });
  useEffect(function () {
    var mql = window.matchMedia && window.matchMedia(TOUCH_QUERY);
    if (!mql) return;
    function on() { st[1](mql.matches); }
    on();
    if (mql.addEventListener) mql.addEventListener('change', on); else mql.addListener(on);
    return function () { if (mql.removeEventListener) mql.removeEventListener('change', on); else mql.removeListener(on); };
  }, []);
  return st[0];
}

/* Is the pointer, now at p, inside the triangle from where it was (a) to the near edge of the submenu's box r? Then it is on its way there. */
function towardSub(a, p, r) {
  if (a.x > r.left && a.x < r.right) return false;
  var ex = a.x <= r.left ? r.left : r.right;
  var v = [a, { x: ex, y: r.top }, { x: ex, y: r.bottom }];
  function side(p1, p2) { return (p.x - p2.x) * (p1.y - p2.y) - (p1.x - p2.x) * (p.y - p2.y); }
  var d1 = side(v[0], v[1]), d2 = side(v[1], v[2]), d3 = side(v[2], v[0]);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
}

/* State of one open list (the top one or a submenu's): which submenu is open (one per level) and the pointer's last position.
   `touch` is the touch sizing, read once by the root list and passed down, so a menu with submenus has one media-query subscription. */
function useLevel(touch) {
  var st = useState(null), openId = st[0], setOpenId = st[1];
  /* Hover intent: the pointer's last position, the timer of a row that waits for it, and the open submenus' boxes. */
  var intent = useRef({ pointer: null, timer: null, boxes: {} }).current;
  useEffect(function () { return function () { clearTimeout(intent.timer); }; }, []);
  return {
    openId: openId, setOpenId: setOpenId, touch: touch, drilled: touch && openId !== null,
    move: function (e) { intent.pointer = { x: e.clientX, y: e.clientY }; },
    /* The pointer entered the open submenu's own box: nothing is on its way there any more. */
    settle: function () { intent.pointer = null; clearTimeout(intent.timer); },
    /* A submenu's box, for the pointer-heading-there test; returns the function that forgets it. */
    registerBox: function (id, el) {
      intent.boxes[id] = el;
      return function () { if (intent.boxes[id] === el) delete intent.boxes[id]; };
    },
    /* A row of this list was entered. With a submenu open and the pointer heading for it, the row waits: apply runs
       only if the pointer is still on it after INTENT_WAIT. Otherwise the open submenu closes and apply runs. */
    hover: function (el, e, apply) {
      clearTimeout(intent.timer);
      if (openId === null || el.id === openId + '-trigger') { apply(); return; }
      var box = intent.boxes[openId], from = intent.pointer;
      if (box && from && towardSub(from, { x: e.clientX, y: e.clientY }, box.getBoundingClientRect())) {
        intent.timer = setTimeout(function () { if (el.matches(':hover')) { setOpenId(null); apply(); } }, INTENT_WAIT);
        return;
      }
      setOpenId(null);
      apply();
    },
    /* Focus reaching another row of this list (the arrow keys) closes the open submenu. */
    focusIn: function (e) {
      var el = e.target;
      if (openId !== null && el.closest && el.closest('[role="menu"]') === e.currentTarget && el.id !== openId + '-trigger') setOpenId(null);
    }
  };
}

/* Enter or Space on a row. */
function onActivateKey(fn) {
  return function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e); } };
}

function focusFirst(list) {
  var items = menuItems(list, true).filter(function (el) { return !el.classList.contains('hy-menu__back'); });
  if (!items.length) items = menuItems(list);
  (menuRowStop(list) || items[0] || list).focus({ preventScroll: true });
}

/* MenuSub wraps a MenuSubTrigger and the Menu it opens. */
function MenuSub(props) {
  var lv = React.useContext(LevelCtx);
  var id = useId();
  var trigRef = useRef(null), listRef = useRef(null), focusOn = useRef(null), label = useRef(null), refocus = useRef(false);
  var open = !!lv && lv.openId === id;
  useEffect(function () { if (props.defaultOpen && lv) lv.setOpenId(id); }, []);
  /* Back on the trigger once it is drawn again (under touch sizing it is hidden while its items replace the list). */
  useLayoutEffect(function () {
    if (!open && refocus.current) { refocus.current = false; if (trigRef.current) trigRef.current.focus({ preventScroll: true }); }
  }, [open]);
  function close(focusTrigger) {
    refocus.current = !!focusTrigger;
    if (lv) lv.setOpenId(null);
  }
  function openSub(which) {
    if (!lv) return;
    if (open && listRef.current) { which === 'list' ? listRef.current.focus({ preventScroll: true }) : focusFirst(listRef.current); return; }
    focusOn.current = which;
    lv.setOpenId(id);
  }
  var value = {
    id: id, open: open, touch: !!lv && lv.touch, lv: lv, trigRef: trigRef, listRef: listRef, focusOn: focusOn, label: label,
    triggerId: id + '-trigger', menuId: id + '-menu', openSub: openSub, close: close
  };
  return h(SubCtx.Provider, { value: value }, props.children);
}

/* MenuSubTrigger: the item row that opens its submenu, with a trailing chevron. */
function MenuSubTrigger(props) {
  var sub = React.useContext(SubCtx);
  var lv = sub && sub.lv;
  var descId = useId();
  var timer = useRef(null);
  var disabled = !!props.disabled;
  useEffect(function () { return function () { clearTimeout(timer.current); }; }, []);
  /* The drilled list's Back row is headed by this label. */
  useEffect(function () { if (sub) sub.label.current = props.children; });
  if (!sub) return null;
  function onClick(e) {
    clearTimeout(timer.current);
    if (disabled) { e.preventDefault(); return; }
    sub.openSub(sub.touch || e.detail === 0 ? 'first' : 'list');
  }
  function onKeyDown(e) {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
      e.preventDefault(); e.stopPropagation();
      sub.openSub('first');
    }
  }
  function onMouseEnter(e) {
    var el = e.currentTarget;
    function apply() {
      if (disabled) return;
      el.focus({ preventScroll: true });
      if (!sub.touch && !sub.open) timer.current = setTimeout(function () { sub.openSub(null); }, SUB_DELAY);
    }
    if (lv) lv.hover(el, e, apply); else apply();
  }
  return h('li', {
    ref: sub.trigRef, id: sub.triggerId, role: 'menuitem', tabIndex: -1, 'aria-haspopup': 'menu', 'aria-expanded': sub.open,
    'aria-controls': sub.open ? sub.menuId : undefined, 'aria-disabled': disabled || undefined,
    'aria-describedby': props.description ? descId : undefined, 'data-focusable': disabled && props.description ? '' : undefined,
    className: cx('hy-menu__item', 'hy-menu__item--sub', sub.open && 'is-open', props.className),
    onClick: onClick, onKeyDown: onKeyDown, onMouseEnter: onMouseEnter, onMouseLeave: function () { clearTimeout(timer.current); }
  }, itemInner({
    children: props.children, prefix: props.prefix, description: props.description,
    suffix: h('span', { className: 'hy-menu__chev' }, h(Glyph, { name: 'chevron', size: 16 }))
  }, descId, false));
}

/* The submenu's list: beside its trigger on desktop, in place of the parent's contents under touch sizing. */
function SubList(props) {
  var sub = React.useContext(SubCtx);
  if (!sub.open) return null;
  return h(sub.touch ? DrillList : SubPopup, props);
}

function useSubFocus(sub, ready) {
  useLayoutEffect(function () {
    if (!ready) return;
    var which = sub.focusOn.current, list = sub.listRef.current;
    sub.focusOn.current = null;
    if (!which || !list) return;
    if (which === 'list') list.focus({ preventScroll: true }); else focusFirst(list);
  }, [ready]);
}

function SubPopup(props) {
  var ctx = React.useContext(MenuCtx), sub = React.useContext(SubCtx);
  var typed = useRef({ text: '', at: 0 });
  var lvl = useLevel(sub.touch);
  /* Beside the parent list (so it flips to the left of it), its top level with the trigger's: the list's own 6px
     padding is taken off, so that the first item, not the box, lines up. */
  var anchorRef = useMemo(function () {
    return { get current() {
      var trig = sub.trigRef.current;
      if (!trig) return null;
      var parent = trig.closest('[role="menu"]') || trig;
      return { getBoundingClientRect: function () {
        var p = parent.getBoundingClientRect(), t = trig.getBoundingClientRect();
        return { left: p.left, right: p.right, top: t.top - 6, bottom: t.bottom, width: p.width, height: t.height };
      } };
    } };
  }, []);
  var pos = useFloating(true, anchorRef, sub.listRef, { side: 'right', align: 'start', offset: 2 });
  useSubFocus(sub, !!pos);
  /* Registered, so that a pointer-down inside is not an outside click, and as the box the pointer is heading for. */
  useLayoutEffect(function () {
    var el = sub.listRef.current, subs = ctx.subEls.current;
    subs.push(el);
    var forget = sub.lv && sub.lv.registerBox(sub.id, el);
    return function () {
      subs.splice(subs.indexOf(el), 1);
      if (forget) forget();
    };
  }, []);
  var side = pos ? pos.side : 'right';
  var style = floatingStyle(pos, Object.assign({ maxWidth: MENU_MAX_WIDTH },
    props.width !== undefined ? { width: props.width } : null, props.style));
  return portal(h('ul', {
    ref: sub.listRef, id: sub.menuId, role: 'menu', tabIndex: -1, 'aria-labelledby': sub.triggerId, 'aria-label': props['aria-label'],
    onKeyDown: function (e) { menuKeyDown(e, typed, sub.listRef.current, ctx, function () { sub.close(true); }); },
    onFocus: lvl.focusIn, onMouseMove: lvl.move, style: style,
    onMouseEnter: function () { if (sub.lv) sub.lv.settle(); },
    className: cx('hy-menu__list', 'hy-menu__list--sub', 'hy-menu__list--' + side, 'hy-menu__list--start', props.className)
  }, h(LevelCtx.Provider, { value: lvl }, props.children)));
}

/* Touch sizing: the items replace the open list's contents, under a Back row headed by the trigger's label. */
function DrillList(props) {
  var ctx = React.useContext(MenuCtx), sub = React.useContext(SubCtx);
  var typed = useRef({ text: '', at: 0 });
  var lvl = useLevel(sub.touch);
  useSubFocus(sub, true);
  function back() { sub.close(true); }
  return h('li', { role: 'none', className: 'hy-menu__drill' },
    h('ul', {
      ref: sub.listRef, id: sub.menuId, role: 'menu', tabIndex: -1, 'aria-labelledby': sub.triggerId, 'aria-label': props['aria-label'],
      onKeyDown: function (e) { menuKeyDown(e, typed, sub.listRef.current, ctx, back); },
      onFocus: lvl.focusIn, className: cx('hy-menu__list', 'hy-menu__list--drill', lvl.drilled && 'hy-menu__list--drilled', props.className)
    },
      h('li', {
        role: 'menuitem', tabIndex: -1, className: 'hy-menu__item hy-menu__back', onClick: back, onKeyDown: onActivateKey(back)
      },
        h('span', { className: 'hy-menu__affix hy-menu__chev hy-menu__chev--back', 'aria-hidden': 'true' }, h(Glyph, { name: 'chevron', size: 16 })),
        h('span', { className: 'hy-menu__text' }, sub.label.current)),
      h(LevelCtx.Provider, { value: lvl }, props.children)));
}

/* Typeahead matches the label, not the description. */
function itemText(el) {
  var t = el.querySelector('.hy-menu__text');
  return (t || el).textContent.trim().toLowerCase();
}

function itemInner(props, descId, checkable) {
  return [
    checkable ? h('span', { key: 'c', className: 'hy-menu__check', 'aria-hidden': 'true' }, props.checked ? h(Glyph, { name: 'check', size: 16 }) : null) : null,
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
  /* Links can't be checked; `checked` and `role` are ignored on them. */
  var isLink = props.href !== undefined;
  var checkable = !isLink && props.checked !== undefined;
  var radio = checkable && props.role === 'radio';
  var itemRole = checkable ? (radio ? 'menuitemradio' : 'menuitemcheckbox') : 'menuitem';
  var cls = cx('hy-menu__item', props.type === 'error' && 'hy-menu__item--error', props.className);
  function activate(e) {
    if (disabled) { e.preventDefault(); return; }
    if (props.onClick) props.onClick(e);
    if (props.onSelect) props.onSelect(props.value);
    /* A checkbox item stays open, with focus where it was, so several can be toggled. */
    if (ctx && !(checkable && !radio)) ctx.close(true);
  }
  var lv = React.useContext(LevelCtx);
  function hover(e) {
    var el = e.currentTarget;
    function apply() { if (!disabled) el.focus({ preventScroll: true }); }
    if (lv) lv.hover(el, e, apply); else apply();
  }
  if (isLink) {
    return h('li', { role: 'none', className: 'hy-menu__li' },
      h('a', Object.assign({
        role: 'menuitem', tabIndex: -1, href: disabled ? undefined : props.href, target: props.target, rel: props.rel,
        'aria-disabled': disabled || undefined, className: cls, onClick: activate, onMouseEnter: hover,
        onKeyDown: function (e) { if (e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }
      }, hint), itemInner(props, descId, false)));
  }
  return h('li', Object.assign({
    role: itemRole, tabIndex: -1, 'aria-checked': checkable ? !!props.checked : undefined,
    'aria-disabled': disabled || undefined, className: cls, style: props.style,
    onClick: activate, onMouseEnter: hover,
    onKeyDown: onActivateKey(activate)
  }, hint), itemInner(props, descId, checkable));
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

function MenuDivider() {
  return h('li', { role: 'separator', className: 'hy-menu__sep' });
}

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
      return h(MenuItem, { key: it.label + i, onSelect: it.onSelect, shortcut: it.shortcut, prefix: it.prefix, disabled: it.disabled, type: it.danger ? 'error' : it.type, href: it.href, description: it.description, title: it.title, checked: it.checked, role: it.role }, it.label);
    }));
}

Menu.Container = MenuContainer;
Menu.Button = MenuButton;
Menu.Item = MenuItem;
Menu.Link = MenuLink;
Menu.ItemLocked = MenuItemLocked;
Menu.Section = MenuSection;
Menu.Divider = MenuDivider;
Menu.Sub = MenuSub;
Menu.SubTrigger = MenuSubTrigger;

define('Menu', Menu);
define('MenuContainer', MenuContainer);
define('MenuButton', MenuButton);
define('MenuItem', MenuItem);
define('MenuLink', MenuLink);
define('MenuItemLocked', MenuItemLocked);
define('MenuSection', MenuSection);
define('MenuDivider', MenuDivider);
define('MenuSub', MenuSub);
define('MenuSubTrigger', MenuSubTrigger);
