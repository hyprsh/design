/* A vertical list of destinations for a sidebar or settings page, one marked current.
   NavList is a <nav> around a <ul>; NavGroup is an <li> with a heading and its own labelled <ul>; NavItem is an <li>
   holding an <a> (with href) or a <button>. The app decides which item is current. */
function NavList(props) {
  var rest = omit(props, ['className', 'children']);
  var warned = useRef(false);
  if (!warned.current && !props['aria-label'] && !props['aria-labelledby']) {
    warned.current = true;
    var prod = false;
    try { prod = process.env.NODE_ENV === 'production'; } catch (e) { /* no process: not a production build */ }
    if (!prod && typeof console !== 'undefined') console.warn('hyprsh: NavList needs an accessible name. Pass aria-label or aria-labelledby.');
  }
  return h('nav', Object.assign({}, rest, { className: cx('hy-nav-list', props.className) }),
    h('ul', { className: 'hy-nav-list__list', role: 'list' }, props.children));
}

function NavGroup(props) {
  var id = useId();
  var rest = omit(props, ['title', 'className', 'children']);
  return h('li', Object.assign({}, rest, { className: cx('hy-nav-group', props.className) }),
    h('div', { id: id, className: 'hy-nav-group__title' }, props.title),
    h('ul', { className: 'hy-nav-list__list', role: 'list', 'aria-labelledby': id }, props.children));
}

function NavItem(props) {
  var isLink = props.href !== undefined;
  var rest = omit(props, ['icon', 'trailing', 'trailingLabel', 'current', 'disabled', 'className', 'children', 'onClick']);
  var count = typeof props.trailing === 'number';
  var spoken = count ? String(props.trailing) : props.trailingLabel;
  var current = props.current ? (props.current === true ? 'page' : props.current) : undefined;
  var attrs = Object.assign({}, rest, {
    className: cx('hy-nav-item', props.current && 'is-current', props.disabled && !isLink && 'is-disabled', props.className),
    'aria-current': current
  });
  if (isLink) {
    attrs.onClick = props.onClick;
  } else {
    attrs.type = 'button';
    attrs.onClick = props.disabled ? function (e) { e.preventDefault(); } : props.onClick;
    if (props.disabled) attrs['aria-disabled'] = 'true';
  }
  var hasTrailing = props.trailing !== undefined && props.trailing !== null && props.trailing !== false;
  return h('li', { className: 'hy-nav-item-row' },
    h(isLink ? 'a' : 'button', attrs,
      props.icon ? h('span', { className: 'hy-nav-item__icon', 'aria-hidden': 'true' }, props.icon) : null,
      h('span', { className: 'hy-nav-item__label' }, props.children),
      spoken ? h('span', { className: 'hy-sr' }, ', ') : null,
      hasTrailing ? h('span', Object.assign({ className: cx('hy-nav-item__trailing', count && 'hy-nav-item__count') }, count ? {} : { 'aria-hidden': 'true' }), props.trailing) : null,
      spoken && !count ? h('span', { className: 'hy-sr' }, spoken) : null));
}

NavList.Group = NavGroup;
NavList.Item = NavItem;

define('NavList', NavList);
define('NavGroup', NavGroup);
define('NavItem', NavItem);
