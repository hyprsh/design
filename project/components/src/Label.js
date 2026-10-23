/* Label: a form label. 13px gray text, Title Case by default, optionally wrapping its control. */
function Label(props) {
  var text = props.value != null ? props.value : (props.withInput ? null : props.children);
  var control = props.value != null || props.withInput ? props.children : null;
  var rest = omit(props, ['value', 'children', 'withInput', 'bypassCasing', 'className', 'id', 'htmlFor']);
  return h('label', Object.assign({}, rest, {
    htmlFor: props.htmlFor || props.id,
    className: cx('hy-label', props.withInput && 'hy-label--with-input', props.bypassCasing && 'hy-label--bypass-casing', props.className)
  }),
    text != null ? h('span', { className: 'hy-label__text' }, text) : null,
    control
  );
}

define('Label', Label);
