/* Checkbox: Geist's 16px checkbox with a label. Checked, indeterminate (a dash in an empty box) and disabled. */
function Checkbox(props) {
  var ref = useRef(null);
  var indeterminate = !!props.indeterminate || props.checked === 'indeterminate';
  useEffect(function () { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  var descId = useId();
  var hasDesc = props.description != null && props.description !== false && props.description !== '';
  var rest = omit(props, ['children', 'className', 'checked', 'onChange', 'indeterminate', 'style', 'description']);
  var cls = cx('hy-check', props.disabled && 'hy-check--disabled', indeterminate && 'hy-check--indeterminate', !hasDesc && props.className);
  var label = h('label', { className: cls, style: hasDesc ? undefined : props.style },
    h('input', Object.assign({ ref: ref, type: 'checkbox', className: 'hy-check__input' }, rest, {
      checked: props.checked === undefined ? undefined : props.checked === true,
      onChange: props.onChange || (props.checked !== undefined ? function () {} : undefined),
      'aria-describedby': cx(props['aria-describedby'], hasDesc && descId) || undefined
    })),
    h('span', { className: 'hy-check__box', 'aria-hidden': 'true' },
      h(Glyph, { name: indeterminate ? 'minus' : 'check', size: 12, className: 'hy-check__mark' })),
    props.children != null && props.children !== false ? h('span', { className: 'hy-check__label' }, props.children) : null
  );
  if (!hasDesc) return label;
  /* The hint sits beside the label, not inside it, so it isn't part of the accessible name; a click on it still toggles. */
  return h('div', { className: cx('hy-check-field', props.disabled && 'hy-check-field--disabled', props.className), style: props.style },
    label,
    h('div', {
      id: descId, className: 'hy-check__description',
      onClick: function () { if (!props.disabled && ref.current) ref.current.click(); }
    }, props.description));
}

define('Checkbox', Checkbox);
