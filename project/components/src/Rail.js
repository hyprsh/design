/*
 * Rail: the vertical strip of icon-only destinations at the edge of an app, from `sm` up. It is TabBar's counterpart at
 * wider widths and takes the same items: Rail.Item has TabBar.Item's props and rules (value or current, aria-current="page",
 * links, actions with haspopup, badges), and each item's label is its accessible name and a Tooltip on its right.
 * Rail.Spacer pushes what follows it to the bottom. Up/Down and Home/End move between the items only.
 */
var RailCtx = React.createContext(null);

function RailItem(props) {
  var ctx = React.useContext(RailCtx) || {};
  /* An item with `current` takes the selection, so the value match stands down while one is set. */
  var selected = props.current !== undefined ? !!props.current : (!ctx.anyCurrent && props.value !== undefined && props.value === ctx.value);
  var badge = props.badge;
  var badgeNode = null;
  /* The tone only recolours dots and counts; a node badge is rendered as given. */
  var toneClass = props.badgeTone === 'error' || props.badgeTone === 'warning' ? ' hy-rail__badge--' + props.badgeTone : '';
  if (badge === true) badgeNode = h('span', { className: 'hy-rail__badge hy-rail__badge--dot' + toneClass });
  else if (typeof badge === 'number') {
    if (badge > 0) badgeNode = h('span', { className: 'hy-rail__badge hy-rail__badge--count' + toneClass }, badge > 99 ? '99+' : String(badge));
  } else if (badge !== undefined && badge !== null && badge !== false) badgeNode = h('span', { className: 'hy-rail__badge' }, badge);
  function onClick(e) {
    if (props.value !== undefined && ctx.select) ctx.select(props.value);
    if (props.onClick) props.onClick(e);
  }
  var common = {
    className: cx('hy-rail__item', selected && 'is-selected', props.className),
    style: props.style,
    'aria-current': selected ? 'page' : undefined,
    'aria-haspopup': props.haspopup ? 'dialog' : undefined,
    /* Icon-only, so the label is the name; the badge label joins it. */
    'aria-label': props.badgeLabel ? props.label + ', ' + props.badgeLabel : props.label,
    onClick: onClick
  };
  var inner = h('span', { className: 'hy-rail__icon', 'aria-hidden': 'true' }, props.icon, badgeNode);
  var control = props.href
    ? h('a', Object.assign({ href: props.href }, common), inner)
    : h('button', Object.assign({ type: 'button' }, common), inner);
  return h(HY.Tooltip, { text: props.label, position: 'right' }, control);
}
RailItem.displayName = 'RailItem';

function RailSpacer() {
  return h('div', { className: 'hy-rail__spacer', 'aria-hidden': 'true' });
}
RailSpacer.displayName = 'RailSpacer';

function Rail(props) {
  var val = useControllable(props.value, props.defaultValue, function (v) {
    if (props.onChange) props.onChange(v);
    if (props.onValueChange) props.onValueChange(v);
  });
  var navRef = useRef(null);
  var kids = React.Children.toArray(props.children);
  var anyCurrent = kids.some(function (k) { return React.isValidElement(k) && k.type === RailItem && !!k.props.current; });

  /* Up/Down/Home/End move between the items; any other child is reached by Tab only. */
  function onKey(e) {
    var k = e.key;
    if (k !== 'ArrowUp' && k !== 'ArrowDown' && k !== 'Home' && k !== 'End') return;
    var items = Array.prototype.slice.call(navRef.current.querySelectorAll('.hy-rail__item'));
    var at = items.indexOf(document.activeElement);
    if (at < 0) return;
    e.preventDefault();
    var to = k === 'Home' ? 0 : k === 'End' ? items.length - 1 : (at + (k === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[to].focus();
  }

  var ctx = { value: val[0], anyCurrent: anyCurrent, select: function (v) { val[1](v); } };
  return h('nav', {
    ref: navRef, 'aria-label': props.label, onKeyDown: onKey,
    className: cx('hy-rail', props.showFrom !== false && 'hy-rail--show-sm', props.className), style: props.style
  }, h(RailCtx.Provider, { value: ctx }, props.children));
}

Rail.Item = RailItem;
Rail.Spacer = RailSpacer;
define('Rail', Rail);
define('RailItem', RailItem);
define('RailSpacer', RailSpacer);
