function skeletonPx(v) { return typeof v === 'number' ? v + 'px' : v; }

/* A shimmering placeholder. Wrapping real children sizes it to them, and show={false} swaps them in. */
function Skeleton(props) {
  if (props.show === false) return props.children === undefined ? null : h(React.Fragment, null, props.children);
  var hasKids = props.children !== undefined && props.children !== null;
  var style = Object.assign({}, props.style);
  if (props.width !== undefined) style.width = skeletonPx(props.width);
  var height = props.height !== undefined ? props.height : (hasKids ? undefined : 24);
  if (height !== undefined) style.minHeight = skeletonPx(height);
  if (typeof props.boxHeight === 'number' && typeof height === 'number' && props.boxHeight > height) style.marginBottom = props.boxHeight - height;
  return h('span', {
    className: cx('hy-skeleton', props.pill && 'hy-skeleton--pill', props.rounded && 'hy-skeleton--rounded', props.squared && 'hy-skeleton--squared',
      props.button && 'hy-skeleton--button', props.animated === false ? 'hy-skeleton--static' : null, hasKids && 'hy-skeleton--wrap', props.className),
    style: style, 'aria-hidden': 'true'
  }, hasKids ? h('span', { className: 'hy-skeleton__content' }, props.children) : null);
}

define('Skeleton', Skeleton);
