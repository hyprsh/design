/* An inline text link in the design's link colour: <a> by default, <button> with as="button" for an action that reads as a link. */
var Link = React.forwardRef(function Link(props, ref) {
  var isButton = props.as === 'button';
  var rest = omit(props, ['as', 'children', 'className', 'disabled']);
  var cls = cx('hy-link', props.className);
  if (isButton) {
    return h('button', Object.assign({ type: 'button' }, rest, { ref: ref, disabled: props.disabled, className: cls }), props.children);
  }
  if (props.disabled) rest.href = undefined;
  return h('a', Object.assign(rest, { ref: ref, 'aria-disabled': props.disabled || undefined, className: cls }), props.children);
});

define('Link', Link);
