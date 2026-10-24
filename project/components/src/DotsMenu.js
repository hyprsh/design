/* DotsMenu: a compact "more actions" Menu behind a three-dot icon button. Children are MenuItems. */
function DotsIcon(p) {
  var s = p.size;
  return h('svg', { className: 'hy-dots-menu__icon', width: s, height: s, style: { width: s, height: s }, viewBox: '0 0 18 18', fill: 'currentColor', 'aria-hidden': 'true', focusable: 'false' },
    h('circle', { cx: 3.5, cy: 9, r: 1.5 }), h('circle', { cx: 9, cy: 9, r: 1.5 }), h('circle', { cx: 14.5, cy: 9, r: 1.5 }));
}

function DotsMenu(props) {
  var size = props.iconSize === 10 || props.iconSize === 12 ? props.iconSize : 18;
  return h(HY.MenuContainer, {
    position: props.position || 'bottom-end',
    open: props.open, defaultOpen: props.defaultOpen, onOpenChange: props.onOpenChange,
    className: cx('hy-dots-menu', props.className), style: props.style
  },
    h(HY.MenuButton, {
      variant: 'tertiary', size: props.size || 'small', svgOnly: true, disabled: props.disabled, tabIndex: props.tabIndex, onFocus: props.onFocus,
      'aria-label': props['aria-label'] || props.label || 'More Actions', className: 'hy-dots-menu__button'
    }, h(DotsIcon, { size: size })),
    h(HY.Menu, { width: props.width, 'aria-label': props.menuLabel }, props.children));
}

define('DotsMenu', DotsMenu);
