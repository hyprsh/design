/*
 * Pane: one region of a screen. A column that fills its container's height: an optional header and footer that never
 * scroll, and a body that is the pane's own scroll container (a focusable region, named by `label`). A sticky
 * ActionBar placed at the end of the body stays at the pane's foot.
 */
function Pane(props) {
  var label = props.label;
  return h('div', { className: cx('hy-pane', props.className), style: props.style },
    props.header ? h('div', { className: 'hy-pane__header' }, props.header) : null,
    h('div', { className: 'hy-pane__body', tabIndex: 0, role: label ? 'region' : undefined, 'aria-label': label || undefined }, props.children),
    props.footer ? h('div', { className: 'hy-pane__footer' }, props.footer) : null);
}

define('Pane', Pane);
