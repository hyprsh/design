var PILL_SIZE = { sm: 'small', md: 'medium', lg: 'large', small: 'small', medium: 'medium', large: 'large' };

/* A link styled like a Badge: lighter than a button. Renders <a> with href, <button> with onClick only. */
function Pill(props) {
  var size = PILL_SIZE[props.size] || 'medium';
  var rest = omit(props, ['size', 'icon', 'children', 'className']);
  var tag = props.href ? 'a' : (props.onClick ? 'button' : 'span');
  if (tag === 'button' && !rest.type) rest.type = 'button';
  return h(tag, Object.assign(rest, { className: cx('hy-pill', 'hy-pill--' + size, props.className) }),
    props.icon ? h('span', { className: 'hy-pill__icon', 'aria-hidden': 'true' }, props.icon) : null,
    h('span', { className: 'hy-pill__label' }, props.children));
}

define('Pill', Pill);
