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

/* Every role an item can have; the roving focus, Home/End and typeahead find all of them. */
var ITEM_SELECTOR = '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]';
/* The items the arrow keys reach: enabled ones, and disabled ones that carry a description (data-focusable). */
function menuItems(list, enabledOnly) {
  if (!list) return [];
  return Array.prototype.filter.call(list.querySelectorAll(ITEM_SELECTOR), function (el) {
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
  function hover(e) { if (!disabled) e.currentTarget.focus({ preventScroll: true }); }
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
    onKeyDown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(e); } }
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

define('Menu', Menu);
define('MenuContainer', MenuContainer);
define('MenuButton', MenuButton);
define('MenuItem', MenuItem);
define('MenuLink', MenuLink);
define('MenuItemLocked', MenuItemLocked);
define('MenuSection', MenuSection);
define('MenuDivider', MenuDivider);
