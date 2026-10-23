/* Select: a native select. Three sizes, prefix, a suffix that replaces the chevron, placeholder, label, hint and error. */
function setRef(ref, el) {
  if (typeof ref === 'function') ref(el);
  else if (ref) ref.current = el;
}

function isMessage(v) { return v != null && v !== false && v !== true && v !== ''; }
function has(node) { return node != null && node !== false; }

var Select = React.forwardRef(function Select(props, ref) {
  var auto = useId();
  var id = props.id || auto;
  var ids = fieldIds(id);
  var size = props.size || 'medium';
  var errText = isMessage(props.error) ? props.error : null;
  var placeholder = props.placeholder;
  var controlled = props.value !== undefined;
  var initial = props.defaultValue !== undefined ? props.defaultValue : (placeholder ? '' : undefined);
  var st = useState(initial);
  var current = controlled ? props.value : st[0];
  var empty = !!placeholder && !props.multiple && (current === '' || current == null);
  var rest = omit(props, ['label', 'hint', 'error', 'options', 'size', 'className', 'wrapperClassName', 'labelPosition', 'id', 'children', 'placeholder', 'prefix', 'suffix', 'value', 'defaultValue', 'onChange']);

  var opts = props.options ? props.options.map(function (o) {
    var v = typeof o === 'string' ? o : o.value;
    return h('option', { key: v, value: v, disabled: o.disabled }, typeof o === 'string' ? o : o.label);
  }) : props.children;

  function onChange(e) {
    if (!controlled) st[1](e.target.value);
    if (props.onChange) props.onChange(e);
  }

  return h('div', { className: cx('hy-field', 'hy-field--' + size, props.label && props.labelPosition === 'inline' && 'hy-field--inline-label', props.className) },
    props.label ? h('label', { className: 'hy-field__label', htmlFor: id }, props.label) : null,
    h('div', {
      className: cx('hy-select', 'hy-input--' + size, 'hy-select--' + size, props.error && 'hy-select--error', props.disabled && 'hy-select--disabled',
        has(props.prefix) && 'hy-select--prefix', empty && 'hy-select--placeholder', props.wrapperClassName)
    },
      has(props.prefix) ? h('span', { className: 'hy-select__prefix', 'aria-hidden': 'true' }, props.prefix) : null,
      h('select', Object.assign({ id: id }, rest, controlled ? { value: props.value } : { defaultValue: initial }, {
        ref: function (el) { setRef(ref, el); },
        onChange: onChange,
        'aria-invalid': props.error ? 'true' : undefined,
        'aria-describedby': cx(props['aria-describedby'], errText ? ids.error : (props.hint ? ids.hint : null)) || undefined
      }), placeholder ? h('option', { value: '', disabled: true }, placeholder) : null, opts),
      has(props.suffix)
        ? h('span', { className: 'hy-select__suffix', 'aria-hidden': 'true' }, props.suffix)
        : h(Glyph, { name: 'chevron', className: 'hy-select__chevron' })
    ),
    errText
      ? h('div', { role: 'alert', className: 'hy-field__alert' }, h(FieldMessage, { ids: ids, error: errText }))
      : h(FieldMessage, { ids: ids, hint: props.hint })
  );
});

define('Select', Select);
