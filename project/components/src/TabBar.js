/*
 * TabBar: a hyprsh original, the floating pill tab bar for phones (no Geist page). Fixed to the bottom, takes no layout
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
  if (badge === true) badgeNode = h('span', { className: 'hy-tabbar__badge hy-tabbar__badge--dot' });
  else if (typeof badge === 'number') {
    if (badge > 0) badgeNode = h('span', { className: 'hy-tabbar__badge hy-tabbar__badge--count' }, badge > 99 ? '99+' : String(badge));
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
