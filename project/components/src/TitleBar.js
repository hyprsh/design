/*
 * TitleBar: the header of a phone-width screen. A centred, truncating title (the screen's heading), an optional
 * back button on the leading side and an actions slot on the trailing side. Sticky at the top of its scroll
 * container, with a translucent surface like TabBar's (solid with `opaque`).
 */
function TitleBar(props) {
  var back = props.back;
  var level = props.headingLevel === 2 || props.headingLevel === 3 ? props.headingLevel : 1;
  /* Both side slots are always drawn, so the title stays centred when only one has content. */
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
      h('div', { className: 'hy-titlebar__leading' }, lead),
      h('h' + level, { className: 'hy-titlebar__title' }, props.title),
      h('div', { className: 'hy-titlebar__trailing hy-titlebar__actions' }, props.actions)));
}

define('TitleBar', TitleBar);
