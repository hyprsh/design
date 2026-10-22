/* Textarea: Geist's multi-line field. Three sizes, label, hint and error, matching Input. */
function setRef(ref, el) {
  if (typeof ref === 'function') ref(el);
  else if (ref) ref.current = el;
}

function isMessage(v) { return v != null && v !== false && v !== true && v !== ''; }

var Textarea = React.forwardRef(function Textarea(props, ref) {
  var auto = useId();
  var id = props.id || auto;
  var ids = fieldIds(id);
  var size = props.size || 'medium';
  var errText = isMessage(props.error) ? props.error : null;
  var rest = omit(props, ['label', 'hint', 'error', 'size', 'className', 'wrapperClassName', 'mono', 'id']);
  return h('div', { className: cx('hy-field', 'hy-field--' + size, props.mono && 'hy-field--mono', props.className) },
    props.label ? h('label', { className: 'hy-field__label', htmlFor: id }, props.label) : null,
    h('div', { className: cx('hy-textarea', 'hy-textarea--' + size, props.error && 'hy-textarea--error', props.disabled && 'hy-textarea--disabled', props.wrapperClassName) },
      h('textarea', Object.assign({ id: id, rows: 4 }, rest, {
        ref: function (el) { setRef(ref, el); },
        'aria-invalid': props.error ? 'true' : undefined,
        'aria-describedby': cx(props['aria-describedby'], errText ? ids.error : (props.hint ? ids.hint : null)) || undefined
      }))
    ),
    errText
      ? h('div', { role: 'alert', className: 'hy-field__alert' }, h(FieldMessage, { ids: ids, error: errText }))
      : h(FieldMessage, { ids: ids, hint: props.hint })
  );
});

define('Textarea', Textarea);
