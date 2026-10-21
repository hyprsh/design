/*
 * Breadcrumbs: the path from the top of the app to the current page.
 * Geist calls it Breadcrumb (type 'text' | 'menu') with BreadcrumbItem children; both names work.
 */
function Breadcrumbs(props) {
  var type = props.type === 'menu' ? 'menu' : 'text';
  var kids = React.Children.toArray(props.children).filter(Boolean);
  return h('nav', { 'aria-label': props['aria-label'] || 'Breadcrumb', className: cx('hy-breadcrumbs', 'hy-breadcrumbs--' + type, props.className), style: props.style },
    h('ol', { className: 'hy-breadcrumbs__list' }, kids.map(function (child, i) {
      var last = i === kids.length - 1;
      return h('li', { key: child.key || i, className: 'hy-breadcrumbs__li' }, child,
        !last && type === 'text' ? h('span', { className: 'hy-breadcrumbs__sep', 'aria-hidden': 'true' }, h(HY.Icon, { name: 'chevron-right', size: 14 })) : null);
    })));
}

/* One step. `active` marks the current page; `disabled` shows a step that can't be opened. */
function BreadcrumbItem(props) {
  var rest = omit(props, ['active', 'disabled', 'href', 'className', 'children', 'prefix']);
  var cls = cx('hy-breadcrumbs__item', props.active && 'is-active', props.disabled && 'is-disabled', props.className);
  var inner = [
    props.prefix ? h('span', { key: 'p', className: 'hy-breadcrumbs__affix', 'aria-hidden': 'true' }, props.prefix) : null,
    h('span', { key: 't', className: 'hy-breadcrumbs__text' }, props.children)
  ];
  var current = props.active ? 'page' : undefined;
  if (props.href !== undefined && !props.disabled) {
    return h('a', Object.assign(rest, { href: props.href, className: cls, 'aria-current': current }), inner);
  }
  return h('span', Object.assign(rest, { className: cls, 'aria-current': current, 'aria-disabled': props.disabled || undefined }), inner);
}

Breadcrumbs.Item = BreadcrumbItem;

define('Breadcrumbs', Breadcrumbs);
define('Breadcrumb', Breadcrumbs);
define('BreadcrumbItem', BreadcrumbItem);
