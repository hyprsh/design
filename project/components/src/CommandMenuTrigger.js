/* A <button> that looks like a search field and opens a command menu. Not a read-only input, so
   screen readers announce a button that opens a dialog. */
var CMT_OWN = ['children', 'size', 'prefix', 'shortcut', 'className', 'type', 'aria-haspopup'];

var CommandMenuTrigger = React.forwardRef(function CommandMenuTrigger(props, ref) {
  var size = props.size === 'small' ? 'small' : 'medium';
  var rest = omit(props, CMT_OWN);
  var label = props.children == null || props.children === false ? 'Search…' : props.children;
  var showDefaultShortcut = props.shortcut === undefined || props.shortcut === true;
  var prefix = props.prefix === undefined || props.prefix === true
    ? h(HY.Icon, { name: 'search', size: 16 })
    : props.prefix;
  var shortcut = showDefaultShortcut
    ? h(HY.KeyboardInput, { small: true, meta: true }, 'K')
    : props.shortcut;
  var hasPrefix = prefix != null && prefix !== false;
  var hasShortcut = shortcut != null && shortcut !== false;
  return h('button', Object.assign({
    ref: ref,
    'aria-keyshortcuts': showDefaultShortcut ? 'Meta+K Control+K' : undefined
  }, rest, {
    type: 'button',
    'aria-haspopup': 'dialog',
    className: cx('hy-cmdk-trigger', 'hy-cmdk-trigger--' + size, props.className)
  }),
    hasPrefix && h('span', { className: 'hy-cmdk-trigger__prefix', 'aria-hidden': 'true' }, prefix),
    h('span', { className: 'hy-cmdk-trigger__label' }, label),
    hasShortcut && h('span', { className: 'hy-cmdk-trigger__shortcut', 'aria-hidden': 'true' }, shortcut));
});

define('CommandMenuTrigger', CommandMenuTrigger);
