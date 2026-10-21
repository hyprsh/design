/*
 * Menu follows Geist's compound API:
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
var FLIP = { bottom: 'top', top: 'bottom', left: 'right', right: 'left' };

function menuItems(list) {
  if (!list) return [];
  return Array.prototype.filter.call(list.querySelectorAll('[role="menuitem"]'), function (el) {
    return el.getAttribute('aria-disabled') !== 'true';
  });
}

function MenuContainer(props) {
  var st = useState(!!props.defaultOpen);
  var controlled = props.open !== undefined;
  var open = controlled ? !!props.open : st[0];
  var triggerRef = useRef(null), listRef = useRef(null);
  var focusOnOpen = useRef(null);
  var base = useId();
  var pos = parsePosition(props.position);
  var placed = useState(pos.side);
  var side = placed[0];

  function setOpen(next) {
    if (!controlled) st[1](next);
    if (props.onOpenChange) props.onOpenChange(next);
  }
  function openMenu(which) { focusOnOpen.current = which || 'first'; setOpen(true); }
  function close(refocus) {
    setOpen(false);
    if (refocus && triggerRef.current && triggerRef.current.focus) triggerRef.current.focus();
  }

  useDismiss(open, [triggerRef, listRef], function (why) { close(why === 'escape'); });

  /* After opening: flip to the other side if this one overflows the window, then move focus in. */
  useLayoutEffect(function () {
    if (!open) { placed[1](pos.side); return; }
    var list = listRef.current;
    if (list && !props.anchorPoint) {
      var r = list.getBoundingClientRect(), t = triggerRef.current ? triggerRef.current.getBoundingClientRect() : null;
      var next = pos.side;
      if (t) {
        if (pos.side === 'bottom' && r.bottom > window.innerHeight && t.top - r.height - 8 > 0) next = 'top';
        else if (pos.side === 'top' && r.top < 0 && t.bottom + r.height + 8 < window.innerHeight) next = 'bottom';
        else if (pos.side === 'right' && r.right > window.innerWidth && t.left - r.width - 8 > 0) next = 'left';
        else if (pos.side === 'left' && r.left < 0 && t.right + r.width + 8 < window.innerWidth) next = 'right';
      }
      if (next !== side) placed[1](next);
    }
    var which = focusOnOpen.current;
    focusOnOpen.current = null;
    if (list && props.anchorPoint) {
      /* Context menus open at the pointer; shift back inside the window if they would overflow. */
      var b = list.getBoundingClientRect();
      /* Open towards the other side of the point, or pin to the window edge if neither side fits. */
      var ax = props.anchorPoint.x, ay = props.anchorPoint.y;
      if (b.right > window.innerWidth) list.style.left = (ax - b.width >= 0 ? ax - b.width : Math.max(0, window.innerWidth - b.width)) + 'px';
      if (b.bottom > window.innerHeight) list.style.top = (ay - b.height >= 0 ? ay - b.height : Math.max(0, window.innerHeight - b.height)) + 'px';
    }
    if (which && list) {
      var items = menuItems(list);
      var el = which === 'last' ? items[items.length - 1] : which === 'first' ? items[0] : null;
      (el || list).focus({ preventScroll: true });
    }
  }, [open, props.anchorPoint]);

  var ctx = {
    open: open, openMenu: openMenu, close: close, triggerRef: triggerRef, listRef: listRef,
    menuId: base + '-menu', buttonId: base + '-button',
    side: side, align: pos.align, anchorPoint: props.anchorPoint
  };
  return h(MenuCtx.Provider, { value: ctx },
    h(props.as || 'div', { className: cx('hy-menu', props.className), style: props.style }, props.children));
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
  var typed = useRef({ text: '', at: 0 });
  if (!ctx.open) return null;
  function onKeyDown(e) {
    var items = menuItems(ctx.listRef.current);
    if (!items.length) return;
    var i = items.indexOf(document.activeElement);
    var next = null;
    if (e.key === 'ArrowDown') next = items[(i + 1) % items.length];
    else if (e.key === 'ArrowUp') next = items[(i - 1 + items.length) % items.length];
    else if (e.key === 'Home') next = items[0];
    else if (e.key === 'End') next = items[items.length - 1];
    else if (e.key === 'Tab') { ctx.close(false); return; }
    else if (e.key.length === 1 && /\S/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      var now = Date.now();
      typed.current.text = (now - typed.current.at > 600 ? '' : typed.current.text) + e.key.toLowerCase();
      typed.current.at = now;
      var q = typed.current.text;
      var order = items.slice(i + 1).concat(items.slice(0, i + 1));
      if (q.length > 1) order = items.slice(i).concat(items.slice(0, i));
      next = order.filter(function (el) { return el.textContent.trim().toLowerCase().indexOf(q) === 0; })[0] || null;
    }
    if (next) { e.preventDefault(); next.focus(); }
  }
  var anchor = ctx.anchorPoint;
  var style = Object.assign({}, props.width !== undefined ? { width: props.width } : null,
    anchor ? { position: 'fixed', left: anchor.x, top: anchor.y } : null, props.style);
  var list = h('ul', {
    ref: ctx.listRef, id: ctx.menuId, role: 'menu', tabIndex: -1, 'aria-labelledby': anchor ? undefined : ctx.buttonId,
    'aria-label': props['aria-label'], onKeyDown: onKeyDown, style: style,
    className: cx('hy-menu__list', !anchor && 'hy-menu__list--' + ctx.side, !anchor && 'hy-menu__list--' + ctx.align, anchor && 'hy-menu__list--point', props.className)
  }, props.children);
  return anchor ? portal(list) : list;
}

function itemInner(props) {
  return [
    props.prefix ? h('span', { key: 'p', className: 'hy-menu__affix', 'aria-hidden': 'true' }, props.prefix) : null,
    h('span', { key: 't', className: 'hy-menu__text' }, props.children),
    props.shortcut ? h('span', { key: 'k', className: 'hy-menu__shortcut' }, props.shortcut) : null,
    props.suffix ? h('span', { key: 's', className: 'hy-menu__affix hy-menu__affix--end', 'aria-hidden': 'true' }, props.suffix) : null
  ];
}

/* MenuItem: an action. With `href` it is a link (same as MenuLink). type="error" for destructive items. */
function MenuItem(props) {
  var ctx = React.useContext(MenuCtx);
  var disabled = !!props.disabled;
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
      h('a', {
        role: 'menuitem', tabIndex: -1, href: disabled ? undefined : props.href, target: props.target, rel: props.rel,
        'aria-disabled': disabled || undefined, className: cls, onClick: activate, onMouseEnter: hover,
        onKeyDown: function (e) { if (e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }
      }, itemInner(props)));
  }
  return h('li', {
    role: 'menuitem', tabIndex: -1, 'aria-disabled': disabled || undefined, className: cls, style: props.style,
    onClick: activate, onMouseEnter: hover,
    onKeyDown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(e); } }
  }, itemInner(props));
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
      return h(MenuItem, { key: it.label + i, onSelect: it.onSelect, shortcut: it.shortcut, prefix: it.prefix, disabled: it.disabled, type: it.danger ? 'error' : it.type, href: it.href }, it.label);
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
