function ErrorCard(props) {
  var rest = omit(props, ['title', 'message', 'className', 'children']);
  return h('div', Object.assign({ role: 'alert' }, rest, { className: cx('hy-error-card', props.className) }),
    h(HY.Icon, { name: 'circle-alert', className: 'hy-error-card__glyph' }),
    props.title ? h('h3', { className: 'hy-error-card__title' }, props.title) : null,
    props.message ? h('p', { className: 'hy-error-card__message' }, props.message) : null,
    props.children ? h('div', { className: 'hy-error-card__actions' }, props.children) : null);
}

define('ErrorCard', ErrorCard);
