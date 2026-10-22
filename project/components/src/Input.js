/* Input: Geist's text field. Prefix/suffix slots (styled, plain or bare), three sizes, label, hint and error. */
function setRef(ref, el) {
  if (typeof ref === 'function') ref(el);
  else if (ref) ref.current = el;
}

function isMessage(v) { return v != null && v !== false && v !== true && v !== ''; }

var Input = React.forwardRef(function Input(props, ref) {
  var auto = useId();
  var id = props.id || auto;
  var ids = fieldIds(id);
  var size = props.size || 'medium';
  var inner = useRef(null);
  var errText = isMessage(props.error) ? props.error : null;
  var plainPrefix = props.prefixStyling === false || props.prefixContainer === false;
  var plainSuffix = props.suffixStyling === false || props.suffixContainer === false;
  var rest = omit(props, ['label', 'hint', 'error', 'prefix', 'suffix', 'prefixStyling', 'suffixStyling', 'prefixContainer', 'suffixContainer', 'size', 'rounded', 'className', 'wrapperClassName', 'labelPosition', 'mono', 'id', 'type', 'typeName']);

  function affix(node, side, styling, container) {
    if (node == null || node === false) return null;
    if (container === false) return h(React.Fragment, { key: side }, node);
    return h('span', { key: side, className: cx('hy-input__' + side, styling === false && 'hy-input__' + side + '--plain') }, node);
  }
  /* Clicking the frame or an affix focuses the field, as a label would. */
  function onFrameDown(e) {
    var el = inner.current;
    if (!el || props.disabled || e.target === el) return;
    if (e.target.closest && e.target.closest('button,a,input,select,textarea,[tabindex]')) return;
    e.preventDefault();
    el.focus();
  }

  return h('div', { className: cx('hy-field', 'hy-field--' + size, props.label && props.labelPosition === 'inline' && 'hy-field--inline-label', props.mono && 'hy-field--mono', props.className) },
    props.label ? h('label', { className: 'hy-field__label', htmlFor: id }, props.label) : null,
    h('div', {
      className: cx('hy-input', 'hy-input--' + size, props.error && 'hy-input--error', props.disabled && 'hy-input--disabled', props.rounded && 'hy-input--rounded',
        props.prefix != null && plainPrefix && 'hy-input--plain-prefix', props.suffix != null && plainSuffix && 'hy-input--plain-suffix', props.wrapperClassName),
      onMouseDown: onFrameDown
    },
      affix(props.prefix, 'prefix', props.prefixStyling, props.prefixContainer),
      h('input', Object.assign({ id: id, type: props.typeName || props.type || 'text' }, rest, {
        ref: function (el) { inner.current = el; setRef(ref, el); },
        'aria-invalid': props.error ? 'true' : undefined,
        'aria-describedby': cx(props['aria-describedby'], errText ? ids.error : (props.hint ? ids.hint : null)) || undefined
      })),
      affix(props.suffix, 'suffix', props.suffixStyling, props.suffixContainer)
    ),
    errText
      ? h('div', { role: 'alert', className: 'hy-field__alert' }, h(FieldMessage, { ids: ids, error: errText }))
      : h(FieldMessage, { ids: ids, hint: props.hint })
  );
});

define('Input', Input);
