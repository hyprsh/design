/* A centred announcement line with one link button. On a narrow container the whole banner becomes that button. */
function Banner(props) {
  var button = props.button;
  var chevron = h(HY.Icon, { name: 'chevron-right', size: 16 });
  var rest = omit(props, ['button', 'children', 'className']);
  var linkProps = button ? omit(button, ['content']) : null;
  return h('div', Object.assign({}, rest, { className: cx('hy-banner', button && 'hy-banner--has-button', props.className) }),
    h('div', { className: 'hy-banner__row' },
      h('p', { className: 'hy-banner__text' }, props.children),
      button ? h(HY.Button, Object.assign({}, linkProps, { variant: 'secondary', size: 'small', shape: 'rounded', suffix: chevron, href: button.href || (button.onClick ? undefined : '#') }), button.content) : null),
    button ? h(HY.Button, Object.assign({}, linkProps, {
      className: 'hy-banner__compact', variant: 'secondary', size: 'small', shape: 'rounded', suffix: chevron,
      href: button.href || (button.onClick ? undefined : '#')
    }), props.children) : null);
}

define('Banner', Banner);
