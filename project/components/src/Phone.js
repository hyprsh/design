function phoneHost(address) {
  return String(address || '').replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
}

/* A phone-shaped frame for a mobile screenshot or recording. Everything but the screen content is aria-hidden. */
function Phone(props) {
  var rest = omit(props, ['address', 'children', 'className']);
  return h('div', Object.assign({}, rest, { className: cx('hy-phone', props.className) }),
    h('div', { className: 'hy-phone__body' },
      h('div', { className: 'hy-phone__screen' },
        props.children !== undefined && props.children !== null
          ? h('div', { className: 'hy-phone__content' }, props.children)
          : h('div', { className: 'hy-phone__placeholder', 'aria-hidden': 'true' }),
        props.address ? h('div', { className: 'hy-phone__shade', 'aria-hidden': 'true' }) : null),
      h('span', { className: 'hy-phone__island', 'aria-hidden': 'true' }),
      props.address ? h('div', { className: 'hy-phone__toolbar', 'aria-hidden': 'true' },
        h('span', { className: 'hy-phone__pill hy-phone__pill--round' }, h(HY.Icon, { name: 'chevron-left', size: 16 })),
        h('span', { className: 'hy-phone__pill hy-phone__pill--address', translate: 'no' }, phoneHost(props.address)),
        h('span', { className: 'hy-phone__pill hy-phone__pill--round' }, h(HY.Icon, { name: 'ellipsis', size: 16 }))) : null,
      h('span', { className: 'hy-phone__home', 'aria-hidden': 'true' })),
    h('span', { className: 'hy-phone__key hy-phone__key--action', 'aria-hidden': 'true' }),
    h('span', { className: 'hy-phone__key hy-phone__key--up', 'aria-hidden': 'true' }),
    h('span', { className: 'hy-phone__key hy-phone__key--down', 'aria-hidden': 'true' }),
    h('span', { className: 'hy-phone__key hy-phone__key--power', 'aria-hidden': 'true' }));
}

define('Phone', Phone);
