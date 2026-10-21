/* Toggle: a single on/off setting that takes effect immediately.
   A native checkbox with role="switch" inside a <label>, so the label toggles it and forms see it.
   Geist API: checked, onChange, size (small default | medium | large), color, icon {checked, unchecked},
   direction ('label-first' default | 'switch-first'), labelCasing ('title' | 'normal'), disabled, children.
   Old hyprsh props still work: defaultChecked (uncontrolled) and onChange(next) with the new boolean. */
var TOGGLE_HUES = ['accent', 'blue', 'amber', 'red', 'green', 'teal', 'purple', 'pink', 'gray'];

function Toggle(props) {
  var auto = useId();
  var id = props.id || auto;
  var controlled = props.checked !== undefined;
  var st = useState(!!props.defaultChecked);
  var on = controlled ? !!props.checked : st[0];
  var size = props.size === 'medium' || props.size === 'large' ? props.size : 'small';
  var hue = TOGGLE_HUES.indexOf(props.color) >= 0 && props.color !== 'accent' ? props.color : null;
  var icon = props.icon ? (on ? props.icon.checked : props.icon.unchecked) : null;
  var label = props.children;
  var rest = omit(props, ['checked', 'defaultChecked', 'onChange', 'size', 'color', 'icon', 'direction', 'labelCasing', 'children', 'className', 'id', 'style', 'disabled']);
  function change(e) {
    if (props.disabled) return;
    var next = e.target.checked;
    if (!controlled) st[1](next);
    if (props.onChange) props.onChange(next, e);
  }
  var track = h('span', { className: 'hy-toggle__track', 'aria-hidden': 'true' },
    h('span', { className: 'hy-toggle__thumb' }, icon ? h('span', { className: 'hy-toggle__icon' }, icon) : null));
  var text = label != null && label !== false
    ? h('span', { className: cx('hy-toggle__label', props.labelCasing !== 'normal' && 'hy-toggle__label--title') }, label)
    : null;
  return h('label', {
    htmlFor: id, style: props.style,
    className: cx('hy-toggle', 'hy-toggle--' + size, hue && 'hy-toggle--' + hue, props.disabled && 'hy-toggle--disabled', on && 'is-on', props.className)
  },
    props.direction === 'switch-first' ? null : text,
    h('input', Object.assign({}, rest, {
      id: id, type: 'checkbox', role: 'switch', className: 'hy-toggle__input',
      checked: on, disabled: props.disabled, onChange: change,
      'aria-checked': on
    })),
    track,
    props.direction === 'switch-first' ? text : null
  );
}

define('Toggle', Toggle);
