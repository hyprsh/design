function Bubble(props) {
  var direction = props.direction === 'sent' ? 'sent' : 'received';
  var position = props.position === 'first' || props.position === 'middle' || props.position === 'last' ? props.position : 'single';
  var rest = omit(props, ['direction', 'position', 'time', 'children', 'className']);
  return h('div', Object.assign({}, rest, {
    className: cx('hy-bubble', 'hy-bubble--' + direction, 'hy-bubble--' + position, props.className)
  }),
    h('div', { className: 'hy-bubble__body' }, props.children),
    props.time != null && props.time !== false ? h('div', { className: 'hy-bubble__time' }, props.time) : null);
}

define('Bubble', Bubble);
