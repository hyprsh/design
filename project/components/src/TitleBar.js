/*
 * TitleBar: the header of a phone-width screen. A centred, truncating title (the screen's heading), an optional
 * back button on the leading side and an actions slot on the trailing side. Sticky at the top of its scroll
 * container, with a translucent surface like TabBar's (solid with `opaque`).
 */
function TitleBar(props) {
  var back = props.back;
  var level = props.headingLevel === 2 || props.headingLevel === 3 ? props.headingLevel : 1;
  /* Both side slots are always drawn, and each holds a hidden copy of the other's content, so the two are as wide as the wider side:
     the title stays on the bar's centre line, and truncates symmetrically, when only one side has content. */
  function mirror(node, cls) { return node ? h('span', { className: cx('hy-titlebar__mirror', cls), 'aria-hidden': 'true' }, node) : null; }
  var lead = back
    ? h(HY.Button, {
      className: 'hy-titlebar__back', variant: 'tertiary', svgOnly: true,
      'aria-label': back.label || 'Back', onClick: back.onClick, href: back.href
    }, h(Glyph, { name: 'chevron', size: 20, className: 'hy-titlebar__chevron' }))
    : null;
  return h('header', {
    className: cx('hy-titlebar', props.hideFrom !== false && 'hy-titlebar--hide-sm', props.opaque && 'hy-titlebar--opaque', props.className),
    style: props.style
  },
    h('div', { className: 'hy-titlebar__bar' },
      h('div', { className: 'hy-titlebar__leading' }, lead, mirror(props.actions, 'hy-titlebar__actions')),
      h('h' + level, { className: 'hy-titlebar__title' }, props.title),
      h('div', { className: 'hy-titlebar__trailing' }, h('div', { className: 'hy-titlebar__actions' }, props.actions), mirror(lead))));
}

define('TitleBar', TitleBar);
