/* ClearableInput: an Input that shows an Esc key once it has a value. The key, or Escape, clears it. */
function setRef(ref, el) {
  if (typeof ref === 'function') ref(el);
  else if (ref) ref.current = el;
}

/* Set the value the way typing would, so React fires onChange with a real event. */
function clearField(el) {
  var desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
  desc.set.call(el, '');
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

var ClearableInput = React.forwardRef(function ClearableInput(props, ref) {
  var inner = useRef(null);
  var controlled = props.value !== undefined;
  var st = useState(props.defaultValue != null ? String(props.defaultValue) : '');
  var value = controlled ? (props.value == null ? '' : String(props.value)) : st[0];
  var dirty = value !== '';
  var rest = omit(props, ['onClear', 'cmdk', 'onChange', 'onKeyDown', 'suffix', 'suffixStyling', 'className']);

  function clear() {
    var el = inner.current;
    if (!el) return;
    clearField(el);
    if (props.onClear) props.onClear();
    el.focus();
  }
  function onChange(e) {
    if (!controlled) st[1](e.target.value);
    if (props.onChange) props.onChange(e);
  }
  function onKeyDown(e) {
    if (props.onKeyDown) props.onKeyDown(e);
    if (e.defaultPrevented || e.key !== 'Escape' || !dirty || props.readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    clear();
  }

  var custom = props.suffix !== undefined;
  var suffix = custom ? props.suffix
    : dirty && !props.disabled && !props.readOnly
      ? h('button', { type: 'button', className: 'hy-clearable__clear', 'aria-label': 'Clear', onClick: clear },
          h(HY.KeyboardInput, { small: true }, 'Esc'),
          h('span', { className: 'hy-clearable__x', 'aria-hidden': 'true' }, h(Glyph, { name: 'x', size: 14 })))
      : props.cmdk
        ? h('span', { className: 'hy-clearable__cmdk', 'aria-hidden': 'true' },
            h(HY.KeyboardInput, { small: true, meta: true }), h(HY.KeyboardInput, { small: true }, 'K'))
        : null;

  return h(HY.Input, Object.assign({}, rest, {
    ref: function (el) { inner.current = el; setRef(ref, el); },
    className: cx('hy-clearable', props.className),
    onChange: onChange,
    onKeyDown: onKeyDown,
    suffix: suffix,
    suffixStyling: custom ? props.suffixStyling : false
  }));
});

define('ClearableInput', ClearableInput);
