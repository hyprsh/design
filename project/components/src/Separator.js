function Separator(props) {
  var vertical = props.orientation === 'vertical';
  var hidden = props['aria-hidden'] === true || props['aria-hidden'] === 'true' || props.decorative;
  var rest = omit(props, ['orientation', 'inset', 'decorative', 'className']);
  return h('div', Object.assign({
    role: hidden ? 'none' : 'separator',
    'aria-orientation': hidden || !vertical ? undefined : 'vertical',
    'data-orientation': vertical ? 'vertical' : 'horizontal'
  }, rest, {
    className: cx('hy-separator', vertical ? 'hy-separator--vertical' : 'hy-separator--horizontal', props.inset && 'hy-separator--inset', props.className)
  }));
}

define('Separator', Separator);
