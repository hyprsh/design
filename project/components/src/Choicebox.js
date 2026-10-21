/* Choicebox: a group of large selectable tiles (title + description) with radio or checkbox semantics.
   <ChoiceboxGroup label type value onChange><ChoiceboxGroupItem title description value>{shown when selected}</ChoiceboxGroupItem></ChoiceboxGroup>
   Choicebox is the group; Choicebox.Group and Choicebox.Item are aliases for the two parts.
   A fieldset/legend names the group; each tile is a <label> around a native radio or checkbox. */
var ChoiceboxContext = React.createContext(null);

function choiceboxList(v) {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v.map(String) : [String(v)];
}

function ChoiceboxGroup(props) {
  var auto = useId();
  var type = props.type === 'checkbox' ? 'checkbox' : 'radio';
  var st = useState(props.defaultValue !== undefined ? props.defaultValue : (type === 'checkbox' ? [] : undefined));
  var controlled = props.value !== undefined;
  var value = controlled ? props.value : st[0];
  var selected = choiceboxList(value);
  var row = props.direction === 'row' || /\bflex-row\b/.test(props.listClassName || '');
  function select(itemValue, checked, e) {
    var next;
    if (type === 'radio') next = itemValue;
    else next = checked
      ? selected.concat([itemValue]).filter(function (v, i, a) { return a.indexOf(v) === i; })
      : selected.filter(function (v) { return v !== itemValue; });
    if (!controlled) st[1](next);
    if (props.onChange) props.onChange(next, e);
  }
  var ctx = { type: type, name: props.name || 'hy-choicebox' + auto, selected: selected, select: select, disabled: props.disabled };
  var listClass = (props.listClassName || '').replace(/\bflex-row\b/, '').trim();
  return h(ChoiceboxContext.Provider, { value: ctx },
    h('fieldset', {
      className: cx('hy-choicebox', props.className), disabled: props.disabled, style: props.style,
      'aria-describedby': props['aria-describedby']
    },
      props.label ? h('legend', { className: props.showLabel ? 'hy-choicebox__legend' : 'hy-sr' }, props.label) : null,
      h('div', { className: cx('hy-choicebox__list', row && 'hy-choicebox__list--row', listClass || null) }, props.children)));
}

function ChoiceboxGroupItem(props) {
  var ctx = React.useContext(ChoiceboxContext) || { type: 'radio', selected: [], select: function () {} };
  var id = useId();
  var value = String(props.value);
  var checked = ctx.selected.indexOf(value) >= 0;
  var disabled = !!(props.disabled || ctx.disabled);
  var descId = props.description ? id + '-desc' : undefined;
  return h('div', {
    className: cx('hy-choicebox__item', checked && 'is-checked', disabled && 'is-disabled', props.className),
    style: props.style, title: props.tooltip
  },
    h('label', { className: 'hy-choicebox__header', htmlFor: id },
      h('input', {
        id: id, type: ctx.type, name: ctx.name, value: value, className: 'hy-choicebox__input',
        checked: checked, disabled: disabled, 'aria-describedby': descId,
        onChange: function (e) { ctx.select(value, e.target.checked, e); }
      }),
      h('span', { className: 'hy-choicebox__text' },
        h('span', { className: 'hy-choicebox__title' }, props.title),
        props.description ? h('span', { className: 'hy-choicebox__desc', id: descId }, props.description) : null),
      h('span', { className: cx('hy-choicebox__indicator', 'hy-choicebox__indicator--' + ctx.type), 'aria-hidden': 'true' },
        ctx.type === 'checkbox' ? h(Glyph, { name: 'check', size: 12 }) : null)),
    checked && props.children != null && props.children !== false
      ? h('div', { className: 'hy-choicebox__content' }, props.children)
      : null);
}

var Choicebox = ChoiceboxGroup;
Choicebox.Group = ChoiceboxGroup;
Choicebox.Item = ChoiceboxGroupItem;

define('Choicebox', Choicebox);
define('ChoiceboxGroup', ChoiceboxGroup);
define('ChoiceboxGroupItem', ChoiceboxGroupItem);
