/* Local name is ErrorMessage so the global Error constructor is never shadowed. */
function ErrorMessage(props) {
  var size = props.size || 'medium';
  var err = props.error;
  var label = props.label === false ? null : (props.label || 'Error');
  var rest = omit(props, ['size', 'label', 'error', 'className', 'children']);
  var external = err && err.link && /^https?:\/\//.test(err.link);
  var body = err ? h(React.Fragment, null, err.message,
    err.action && err.link ? h(React.Fragment, null, ' ', h('a', { className: 'hy-error__link', href: err.link, target: external ? '_blank' : undefined, rel: external ? 'noopener noreferrer' : undefined },
      err.action, external ? h(HY.Icon, { name: 'external-link', size: 12, className: 'hy-error__ext' }) : null,
      external ? h('span', { className: 'hy-sr' }, ' (opens in a new tab)') : null)) : null) : props.children;
  return h('div', Object.assign({}, rest, { className: cx('hy-error', 'hy-error--' + size, props.className) }),
    h(HY.Icon, { name: 'circle-alert', size: size === 'small' ? 14 : 16, className: 'hy-error__glyph' }),
    h('div', { className: 'hy-error__text' }, label && !err ? h('strong', { className: 'hy-error__label' }, label + ':') : (err ? h('span', { className: 'hy-sr' }, (label || 'Error') + ': ') : null),
      label && !err ? ' ' : null, body));
}

define('Error', ErrorMessage);
