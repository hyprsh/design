/* Combobox: a text field that filters a list of options as you type (ARIA 1.2 combobox + listbox).
   <Combobox aria-label placeholder value onChange><ComboboxInput/><ComboboxList emptyMessage><ComboboxOption value>Label</ComboboxOption></ComboboxList></Combobox>
   The parts only carry props: Combobox reads them and renders the field and popover itself.
   `options` ([{ value, label }] or strings) can stand in for the parts. */
function ComboboxInput() { return null; }
function ComboboxList() { return null; }
function ComboboxOption() { return null; }

function comboboxText(node) {
  if (node == null || node === false || node === true) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(comboboxText).join('');
  if (node.props) return comboboxText(node.props.children);
  return '';
}

function comboboxParts(props) {
  var parts = { input: {}, list: {}, options: [] };
  (props.options || []).forEach(function (o) {
    var opt = typeof o === 'object' ? o : { value: o, label: o };
    parts.options.push({ value: String(opt.value), label: opt.label != null ? String(opt.label) : String(opt.value), node: opt.label != null ? opt.label : opt.value, prefix: opt.prefix, suffix: opt.suffix, disabled: opt.disabled });
  });
  function walk(children) {
    React.Children.forEach(children, function (c) {
      if (!c || !c.type) return;
      if (c.type === React.Fragment) walk(c.props.children);
      else if (c.type === ComboboxInput) parts.input = c.props;
      else if (c.type === ComboboxList) { parts.list = c.props; walk(c.props.children); }
      else if (c.type === ComboboxOption) {
        var label = c.props.textValue || comboboxText(c.props.children) || String(c.props.value);
        parts.options.push({ value: String(c.props.value), label: label, node: c.props.children != null ? c.props.children : label, prefix: c.props.prefix, suffix: c.props.suffix, disabled: c.props.disabled });
      }
    });
  }
  walk(props.children);
  return parts;
}

function Combobox(props) {
  var auto = useId();
  var id = props.id || auto;
  var listId = id + '-list';
  var parts = comboboxParts(props);
  var options = parts.options;
  var vs = useControllable(props.value, props.defaultValue !== undefined ? props.defaultValue : null, props.onChange);
  var value = vs[0] == null ? null : String(vs[0]);
  function labelOf(v) {
    for (var i = 0; i < options.length; i++) if (options[i].value === v) return options[i].label;
    return v == null ? '' : v;
  }
  var qs = useState(labelOf(value));
  var query = qs[0], setQuery = qs[1];
  var os = useState(!!props.defaultOpen);
  var open = os[0], setOpen = os[1];
  var ts = useState(false);
  var typed = ts[0], setTyped = ts[1];
  var as = useState(-1);
  var active = as[0], setActive = as[1];
  var root = useRef(null);
  var input = useRef(null);
  var listRef = useRef(null);
  var field = useRef(null);
  var size = props.size === 'small' || props.size === 'large' ? props.size : 'medium';

  /* keep the text in sync when the value changes from outside */
  useEffect(function () { if (!open) setQuery(labelOf(value)); }, [value]);

  var q = typed ? query.trim().toLowerCase() : '';
  var shown = q ? options.filter(function (o) { return o.label.toLowerCase().indexOf(q) >= 0; }) : options;

  useEffect(function () {
    if (!open) return;
    var i = -1;
    for (var k = 0; k < shown.length; k++) if (shown[k].value === value) { i = k; break; }
    if (i < 0 && typed) for (k = 0; k < shown.length; k++) if (!shown[k].disabled) { i = k; break; }
    setActive(i);
  }, [open, query]);

  useEffect(function () {
    if (!open || active < 0 || !listRef.current) return;
    var el = listRef.current.querySelector('[data-index="' + active + '"]');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  /* useFloating re-measures on any scroll: nudge it when filtering changes the list's height */
  var fieldWidth = open && field.current ? field.current.offsetWidth : undefined;
  useLayoutEffect(function () {
    if (open && listRef.current) listRef.current.dispatchEvent(new Event('scroll'));
  }, [open, shown.length, props.loading, fieldWidth]);

  function close() { setOpen(false); setTyped(false); setQuery(labelOf(value)); }
  useDismiss(open, [root, listRef], close);
  var pos = useFloating(open, field, listRef, { side: 'bottom', align: 'start' });

  function pick(o) {
    if (!o || o.disabled) return;
    vs[1](o.value);
    setQuery(o.label);
    setTyped(false);
    setOpen(false);
  }
  function move(dir) {
    if (!shown.length) return;
    var i = active < 0 ? (dir > 0 ? -1 : shown.length) : active;
    for (var n = 0; n < shown.length; n++) {
      i = (i + dir + shown.length) % shown.length;
      if (!shown[i].disabled) { setActive(i); return; }
    }
  }
  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) setOpen(true); else move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (!open) setOpen(true); else move(-1); }
    else if (e.key === 'Home' && open) { e.preventDefault(); setActive(0); }
    else if (e.key === 'End' && open) { e.preventDefault(); setActive(shown.length - 1); }
    else if (e.key === 'Enter') { if (open) { e.preventDefault(); if (active >= 0) pick(shown[active]); } }
    else if (e.key === 'Escape') { if (open) { e.preventDefault(); e.stopPropagation(); close(); } else if (props.clearable && value != null) clear(); }
    else if (e.key === 'Tab') { if (open) close(); }
    if (props.onKeyDown) props.onKeyDown(e);
  }
  function onInput(e) {
    setQuery(e.target.value);
    setTyped(true);
    setOpen(true);
    if (parts.input.onChange) parts.input.onChange(e);
    if (props.onInputChange) props.onInputChange(e.target.value);
  }
  function clear() {
    vs[1](null);
    setQuery('');
    setTyped(false);
    if (input.current) input.current.focus();
  }
  function onBlur(e) {
    var t = e.relatedTarget;
    if (t && ((root.current && root.current.contains(t)) || (listRef.current && listRef.current.contains(t)))) return;
    if (open) close();
    else setQuery(labelOf(value));
  }

  var activeId = open && active >= 0 && shown[active] ? id + '-opt-' + options.indexOf(shown[active]) : undefined;
  var empty = parts.list.emptyMessage || props.emptyMessage || 'No results.';
  var width = props.width != null ? props.width : undefined;
  var showClear = props.clearable && value != null && !props.disabled;
  var rest = omit(props, ['id', 'value', 'defaultValue', 'onChange', 'options', 'children', 'size', 'width', 'clearable', 'errored', 'disabled', 'placeholder', 'className', 'style', 'defaultOpen', 'emptyMessage', 'onInputChange', 'onKeyDown', 'loading', 'aria-label', 'aria-labelledby', 'name']);

  return h('div', Object.assign({}, rest, {
    ref: root, className: cx('hy-combobox', open && 'is-open', props.className),
    style: Object.assign({ width: width }, props.style)
  }),
    h('div', { ref: field, className: cx('hy-input', 'hy-input--' + size, 'hy-combobox__field', props.errored && 'hy-input--error', props.disabled && 'hy-input--disabled') },
      h('span', { className: 'hy-combobox__icon', 'aria-hidden': 'true' }, h(Glyph, { name: 'search', size: 16 })),
      h('input', {
        ref: input, id: id, type: 'text', role: 'combobox', autoComplete: 'off', spellCheck: false,
        'aria-label': props['aria-label'], 'aria-labelledby': props['aria-labelledby'],
        'aria-expanded': open, 'aria-controls': listId, 'aria-autocomplete': 'list',
        'aria-activedescendant': activeId, 'aria-invalid': props.errored ? 'true' : undefined,
        placeholder: props.placeholder, disabled: props.disabled, value: query,
        onChange: onInput, onKeyDown: onKeyDown, onBlur: onBlur,
        onClick: function () { if (!props.disabled) setOpen(true); }
      }),
      props.name ? h('input', { type: 'hidden', name: props.name, value: value == null ? '' : value }) : null,
      showClear ? h('button', {
        type: 'button', className: 'hy-combobox__btn', 'aria-label': 'Clear',
        onMouseDown: function (e) { e.preventDefault(); }, onClick: clear
      }, h(Glyph, { name: 'x', size: 16 })) : null,
      h('button', {
        type: 'button', tabIndex: -1, className: 'hy-combobox__btn hy-combobox__chevron', 'aria-label': open ? 'Hide options' : 'Show options',
        disabled: props.disabled,
        onMouseDown: function (e) { e.preventDefault(); },
        onClick: function () { if (open) close(); else { setOpen(true); if (input.current) input.current.focus(); } }
      }, h(Glyph, { name: 'chevron', size: 16 }))),
    open ? portal(h('ul', {
      ref: listRef, id: listId, role: 'listbox', 'aria-label': props['aria-label'], 'aria-labelledby': props['aria-labelledby'],
      className: cx('hy-combobox__list', pos && 'hy-combobox__list--' + pos.side),
      style: floatingStyle(pos, {
        width: parts.list.width != null ? parts.list.width : fieldWidth,
        maxWidth: parts.list.maxWidth != null ? 'min(' + (typeof parts.list.maxWidth === 'number' ? parts.list.maxWidth + 'px' : parts.list.maxWidth) + ', calc(100vw - 16px))' : 'calc(100vw - 16px)'
      }),
      onMouseDown: function (e) { e.preventDefault(); }
    },
      props.loading
        ? h('li', { className: 'hy-combobox__empty', role: 'presentation' }, h(HY.Spinner, { size: 16 }), 'Loading…')
        : shown.length === 0
          ? h('li', { className: 'hy-combobox__empty', role: 'presentation' }, typeof empty === 'function' ? empty(query) : empty)
          : shown.map(function (o, i) {
            var selected = o.value === value;
            return h('li', {
              key: o.value, id: id + '-opt-' + options.indexOf(o), role: 'option', 'data-index': i,
              'aria-selected': selected, 'aria-disabled': o.disabled ? 'true' : undefined,
              className: cx('hy-combobox__option', i === active && 'is-active', selected && 'is-selected', o.disabled && 'is-disabled'),
              onMouseMove: function () { if (!o.disabled && active !== i) setActive(i); },
              onClick: function () { pick(o); }
            },
              o.prefix ? h('span', { className: 'hy-combobox__affix' }, o.prefix) : null,
              h('span', { className: 'hy-combobox__label' }, o.node),
              o.suffix ? h('span', { className: 'hy-combobox__affix' }, o.suffix) : null,
              h('span', { className: 'hy-combobox__check', 'aria-hidden': 'true' }, selected ? h(Glyph, { name: 'check', size: 16 }) : null));
          }))) : null,
    h('span', { className: 'hy-sr', 'aria-live': 'polite' },
      open && typed ? (props.loading ? 'Loading' : shown.length + (shown.length === 1 ? ' result' : ' results')) : ''));
}

Combobox.Input = ComboboxInput;
Combobox.List = ComboboxList;
Combobox.Option = ComboboxOption;

define('Combobox', Combobox);
define('ComboboxInput', ComboboxInput);
define('ComboboxList', ComboboxList);
define('ComboboxOption', ComboboxOption);
