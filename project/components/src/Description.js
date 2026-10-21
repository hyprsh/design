function Description(props) {
  var rest = omit(props, ['title', 'content', 'tooltip', 'right', 'ellipsis', 'className', 'children']);
  var content = props.content !== undefined ? props.content : props.children;
  var tipLabel = 'About ' + (typeof props.title === 'string' ? props.title : 'this field');
  return h('dl', Object.assign({}, rest, { className: cx('hy-description', props.right && 'hy-description--right', props.ellipsis && 'hy-description--ellipsis', props.className) }),
    h('dt', { className: 'hy-description__title' },
      h('span', null, props.title),
      props.tooltip ? h(HY.Tooltip, { text: props.tooltip },
        h('button', { type: 'button', className: 'hy-description__tip', 'aria-label': tipLabel }, h(HY.Icon, { name: 'info', size: 14 }))) : null),
    h('dd', { className: 'hy-description__content', title: props.ellipsis && typeof content === 'string' ? content : undefined }, content));
}

define('Description', Description);
