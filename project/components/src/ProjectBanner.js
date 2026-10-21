var PB_GLYPH = { gray: 'info', success: 'success', warning: 'warning', error: 'error' };
var PB_NAME = { gray: 'Notice', success: 'Notice', warning: 'Warning', error: 'Error' };

/* A full-width strip under the header about the project as a whole, with one call to action. */
function ProjectBanner(props) {
  var variant = PB_GLYPH[props.variant] ? props.variant : 'gray';
  var cta = props.callToAction;
  var icon = props.icon === null ? null
    : props.icon !== undefined ? h('span', { className: 'hy-pbanner__icon', 'aria-hidden': 'true' }, props.icon)
    : h(Glyph, { name: PB_GLYPH[variant], className: 'hy-pbanner__icon' });
  var action = null;
  if (cta) {
    action = cta.href !== undefined || !cta.onClick
      ? h('a', { className: 'hy-pbanner__cta', href: cta.href || '#', onClick: cta.onClick }, cta.label)
      : h('button', { type: 'button', className: 'hy-pbanner__cta', onClick: cta.onClick }, cta.label);
  }
  return h('aside', {
    className: cx('hy-pbanner', 'hy-pbanner--' + variant, props.className), style: props.style,
    'aria-label': props['aria-label'] || PB_NAME[variant]
  },
    h('div', { className: 'hy-pbanner__inner' },
      h('div', { className: 'hy-pbanner__message' }, icon, h('span', { className: 'hy-pbanner__label' }, props.label || props.children)),
      action));
}

define('ProjectBanner', ProjectBanner);
