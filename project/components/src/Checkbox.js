/* Checkbox: Geist's 16px checkbox with a label. Checked, indeterminate (a dash in an empty box) and disabled. */
function Checkbox(props) {
  var ref = useRef(null);
  var indeterminate = !!props.indeterminate || props.checked === 'indeterminate';
  useEffect(function () { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  var rest = omit(props, ['children', 'className', 'checked', 'onChange', 'indeterminate', 'style']);
  return h('label', { className: cx('hy-check', props.disabled && 'hy-check--disabled', indeterminate && 'hy-check--indeterminate', props.className), style: props.style },
    h('input', Object.assign({ ref: ref, type: 'checkbox', className: 'hy-check__input' }, rest, {
      checked: props.checked === undefined ? undefined : props.checked === true,
      onChange: props.onChange || (props.checked !== undefined ? function () {} : undefined)
    })),
    h('span', { className: 'hy-check__box', 'aria-hidden': 'true' },
      h(Glyph, { name: indeterminate ? 'minus' : 'check', size: 12, className: 'hy-check__mark' })),
    props.children != null && props.children !== false ? h('span', { className: 'hy-check__label' }, props.children) : null
  );
}

define('Checkbox', Checkbox);
