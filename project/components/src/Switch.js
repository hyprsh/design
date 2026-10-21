/* Switch: a segmented control that picks one of 2–3 options (radio semantics).
   <Switch name size value defaultValue onChange disabled><SwitchControl label value icon defaultChecked disabled/></Switch>
   Each control is a native radio inside a <label>, so arrow keys, forms and screen readers work as for any radio group.
   Uncontrolled by default: put defaultChecked on exactly one control (or defaultValue on Switch). */
var SwitchContext = React.createContext(null);

function Switch(props) {
  var auto = useId();
  var hasValue = props.value !== undefined || props.defaultValue !== undefined;
  var st = useState(props.defaultValue);
  var value = props.value !== undefined ? props.value : st[0];
  var size = props.size === 'small' || props.size === 'large' ? props.size : 'medium';
  var rest = omit(props, ['name', 'size', 'value', 'defaultValue', 'onChange', 'disabled', 'children', 'className']);
  var ctx = {
    name: props.name || 'hy-switch' + auto,
    size: size,
    disabled: props.disabled,
    hasValue: hasValue,
    value: value,
    select: function (next, e) {
      if (props.value === undefined) st[1](next);
      if (props.onChange) props.onChange(next, e);
    }
  };
  return h(SwitchContext.Provider, { value: ctx },
    h('div', Object.assign({ role: 'radiogroup' }, rest, {
      className: cx('hy-switch', 'hy-switch--' + size, props.disabled && 'hy-switch--disabled', props.className)
    }), props.children));
}

function SwitchControl(props) {
  var ctx = React.useContext(SwitchContext) || { name: undefined, size: 'medium', hasValue: false, select: function () {} };
  var value = props.value !== undefined ? String(props.value) : String(props.label);
  var disabled = !!(props.disabled || ctx.disabled);
  var size = props.size || ctx.size;
  var inputProps = {
    type: 'radio', className: 'hy-switch__input', name: ctx.name, value: value, disabled: disabled,
    'aria-describedby': props['aria-describedby'],
    onChange: function (e) {
      if (!e.target.checked) return;
      ctx.select(value, e);
      if (props.onChange) props.onChange(e);
    }
  };
  if (props.checked !== undefined) inputProps.checked = !!props.checked;
  else if (ctx.hasValue) inputProps.checked = ctx.value !== undefined && String(ctx.value) === value;
  else inputProps.defaultChecked = props.defaultChecked;
  var iconOnly = props.icon && props.hideLabel !== false;
  return h('label', {
    className: cx('hy-switch__control', 'hy-switch__control--' + size, props.icon && 'hy-switch__control--icon', disabled && 'is-disabled', props.className),
    style: props.style, title: props.title
  },
    h('input', inputProps),
    h('span', { className: 'hy-switch__face' },
      props.icon ? h('span', { className: 'hy-switch__icon', 'aria-hidden': 'true' }, props.icon) : null,
      h('span', { className: iconOnly ? 'hy-sr' : 'hy-switch__label' }, props.label)));
}

Switch.Control = SwitchControl;

define('Switch', Switch);
define('SwitchControl', SwitchControl);
