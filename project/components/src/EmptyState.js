/* A bordered, centred block for a view with nothing in it yet: icon, title, description, then actions. */
function EmptyStateIcon(props) {
  var icon = typeof props.icon === 'string' ? h(HY.Icon, { name: props.icon, size: 24 }) : props.icon;
  return h('div', { className: cx('hy-empty-state__icon', props.className), 'aria-hidden': 'true' }, icon || props.children);
}

function EmptyState(props) {
  var rest = omit(props, ['title', 'description', 'icon', 'className', 'children', 'headingLevel']);
  var Heading = 'h' + (props.headingLevel || 3);
  return h('div', Object.assign({}, rest, { className: cx('hy-empty-state', props.className) }),
    props.icon ? h(EmptyStateIcon, { icon: props.icon }) : null,
    (props.title || props.description) ? h('div', { className: 'hy-empty-state__text' },
      props.title ? h(Heading, { className: 'hy-empty-state__title' }, props.title) : null,
      props.description ? h('p', { className: 'hy-empty-state__description' }, props.description) : null) : null,
    props.children ? h('div', { className: 'hy-empty-state__actions' }, props.children) : null);
}

EmptyState.Icon = EmptyStateIcon;

define('EmptyState', EmptyState);
define('EmptyStateIcon', EmptyStateIcon);
