/*
 * SplitButton: a default action plus a chevron that opens related actions.
 * Built from MenuContainer, Button, MenuButton and Menu, so keyboard and dismiss behaviour match Menu.
 */
var SPLIT_VARIANTS = { secondary: 1 };

/* One menu entry: a title, an optional description below it, and an optional icon. */
function SplitButtonMenuItem(props) {
  var ip = props.menuItemProps || {};
  var body = h('span', { className: 'hy-split__item-body' },
    h('span', { className: 'hy-split__item-title' }, props.title),
    props.description ? h('span', { className: 'hy-split__item-desc' }, props.description) : null);
  return h(HY.MenuItem, Object.assign({}, ip, {
    disabled: props.disabled || ip.disabled,
    prefix: props.icon,
    className: cx('hy-split__item', ip.className)
  }), body);
}

function splitItems(items) {
  if (!Array.isArray(items)) return items;
  return items.map(function (it, i) {
    if (React.isValidElement(it) || it == null) return it;
    return h(SplitButtonMenuItem, Object.assign({ key: it.key || i }, it));
  });
}

function SplitButton(props) {
  var bp = props.buttonProps || {};
  var variant = SPLIT_VARIANTS[bp.variant || props.variant] ? 'secondary' : 'default';
  var size = bp.size || props.size;
  var mp = props.menuProps || {};
  var disabled = !!props.disabled;
  return h(HY.MenuContainer, {
    position: props.menuAlignment === 'bottom-end' ? 'bottom-end' : 'bottom-start',
    open: props.open, defaultOpen: props.defaultOpen, onOpenChange: props.onOpenChange,
    className: cx('hy-split', 'hy-split--' + variant, props.className), style: props.style
  },
    h(HY.Button, Object.assign({}, omit(bp, ['variant', 'size', 'className']), {
      variant: variant, size: size, disabled: disabled || bp.disabled, className: cx('hy-split__main', bp.className)
    }), props.children),
    h(HY.MenuButton, {
      variant: variant, size: size, svgOnly: true, disabled: disabled,
      'aria-label': props.menuButtonLabel || 'More Options', className: 'hy-split__toggle'
    }, h(Glyph, { name: 'chevron' })),
    h(HY.Menu, Object.assign({}, omit(mp, ['className']), { className: cx('hy-split__menu', mp.className) }), splitItems(props.menuItems)));
}

SplitButton.MenuItem = SplitButtonMenuItem;

define('SplitButton', SplitButton);
define('SplitButtonMenuItem', SplitButtonMenuItem);
