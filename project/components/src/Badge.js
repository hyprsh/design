/* Geist sizes are sm | md | lg; the older small | medium | large still work. */
var BADGE_SIZE = { sm: 'small', md: 'medium', lg: 'large', small: 'small', medium: 'medium', large: 'large' };

function Badge(props) {
  var variant = props.variant || 'gray';
  /* 'blue-subtle' and variant="blue" contrast="low" are the same badge. */
  if (props.contrast === 'low' && !/-subtle$/.test(variant) && ['inverted', 'trial', 'turbo', 'pill'].indexOf(variant) < 0) variant += '-subtle';
  var size = BADGE_SIZE[props.size] || 'medium';
  return h('span', {
    className: cx('hy-badge', 'hy-badge--' + variant, 'hy-badge--' + size, props.className),
    title: props.title, translate: props.translate, style: props.style
  },
    props.icon ? h('span', { className: 'hy-badge__icon', 'aria-hidden': 'true' }, props.icon) : null,
    props.children);
}

define('Badge', Badge);
