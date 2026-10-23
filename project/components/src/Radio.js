/* Radio: a radio. A standalone Radio, or RadioGroup with RadioGroupItem (or useRadio) sharing one name and value. */
var RadioContext = React.createContext(null);

function RadioGroup(props) {
  var auto = useId();
  var name = props.name || auto;
  var labelId = auto + '-label';
  var state = useControllable(props.value, props.defaultValue, props.onChange);
  var ctx = { name: name, value: state[0], onChange: state[1], disabled: !!props.disabled, required: !!props.required };
  var rest = omit(props, ['label', 'name', 'value', 'defaultValue', 'onChange', 'disabled', 'required', 'children', 'className', 'horizontal']);
  return h(RadioContext.Provider, { value: ctx },
    h('div', Object.assign({}, rest, {
      role: 'radiogroup',
      className: cx('hy-radio-group', props.horizontal && 'hy-radio-group--horizontal', props.className),
      'aria-labelledby': props.label && !props['aria-label'] ? labelId : props['aria-labelledby'],
      'aria-required': props.required ? 'true' : undefined,
      'aria-disabled': props.disabled ? 'true' : undefined
    }),
      props.label ? h('span', { id: labelId, className: 'hy-sr' }, props.label) : null,
      props.children)
  );
}

function Radio(props) {
  var ctx = React.useContext(RadioContext);
  var inGroup = !!ctx && props.checked === undefined;
  var checked = inGroup ? ctx.value !== undefined && ctx.value === props.value : props.checked;
  var disabled = !!props.disabled || (!!ctx && ctx.disabled);
  var rest = omit(props, ['children', 'className', 'checked', 'onChange', 'disabled', 'name', 'required', 'style']);
  function onChange(e) {
    if (inGroup) ctx.onChange(props.value);
    if (props.onChange) props.onChange(e);
  }
  return h('label', { className: cx('hy-radio', disabled && 'hy-radio--disabled', props.className), style: props.style },
    h('input', Object.assign({ type: 'radio', className: 'hy-radio__input' }, rest, {
      name: inGroup ? ctx.name : props.name,
      checked: checked === undefined ? undefined : !!checked,
      disabled: disabled,
      required: inGroup ? ctx.required : props.required,
      onChange: inGroup || props.onChange ? onChange : (checked !== undefined ? function () {} : undefined)
    })),
    h('span', { className: 'hy-radio__circle', 'aria-hidden': 'true' }),
    props.children != null && props.children !== false ? h('span', { className: 'hy-radio__label' }, props.children) : null
  );
}

function RadioGroupItem(props) { return h(Radio, props); }

/* For custom item layouts inside a RadioGroup: returns the bare radio and whether it is selected. */
function useRadio(opts) {
  var ctx = React.useContext(RadioContext);
  var o = opts || {};
  return {
    checked: !!ctx && ctx.value !== undefined && ctx.value === o.value,
    component: h(Radio, { value: o.value, disabled: o.disabled, 'aria-label': o['aria-label'], id: o.id })
  };
}

Radio.Group = RadioGroup;
Radio.GroupItem = RadioGroupItem;
Radio.useRadio = useRadio;

define('Radio', Radio);
define('RadioGroup', RadioGroup);
define('RadioGroupItem', RadioGroupItem);
define('useRadio', useRadio);
