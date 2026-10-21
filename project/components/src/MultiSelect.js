/* MultiSelect: a button that opens a checklist; each row has a checkbox and a quick action
   ("Only" to pick just that row, "Select All" to pick everything again).
   Parts: MultiSelectRoot > MultiSelectTrigger + MultiSelectContent > MultiSelectRow.
   Shortcut: <MultiSelect label items value onChange/> renders the whole thing. */
var MultiSelectContext = React.createContext(null);

function MultiSelectRoot(props) {
  var auto = useId();
  var os = useControllable(props.open, !!props.defaultOpen, props.onOpenChange);
  var trigger = useRef(null);
  var root = useRef(null);
  var ctx = { open: !!os[0], setOpen: os[1], trigger: trigger, root: root, contentId: auto + '-content' };
  return h(MultiSelectContext.Provider, { value: ctx },
    h('div', { ref: root, className: cx('hy-multiselect', props.className), style: props.style }, props.children));
}

function MultiSelectTrigger(props) {
  var ctx = React.useContext(MultiSelectContext);
  var rest = omit(props, ['children', 'className', 'size', 'variant']);
  return h(HY.Button, Object.assign({}, rest, {
    variant: props.variant || 'secondary', size: props.size || 'small',
    ref: ctx.trigger,
    className: cx('hy-multiselect__trigger', props.className),
    'aria-haspopup': 'dialog', 'aria-expanded': ctx.open, 'aria-controls': ctx.open ? ctx.contentId : undefined,
    suffix: h('span', { className: cx('hy-multiselect__chevron', ctx.open && 'is-open') }, h(Glyph, { name: 'chevron', size: 16 })),
    onClick: function (e) { ctx.setOpen(!ctx.open); if (props.onClick) props.onClick(e); }
  }), props.children);
}

function multiSelectCells(content) {
  return Array.prototype.slice.call(content.querySelectorAll('.hy-multiselect__row')).map(function (row) {
    return [row.querySelector('[data-ms-col="0"]'), row.querySelector('[data-ms-col="1"]')];
  });
}

function MultiSelectContent(props) {
  var ctx = React.useContext(MultiSelectContext);
  var ref = useRef(null);
  /* The panel is portalled to <body> and placed by useFloating, so it flips and stays on screen. */
  var pos = useFloating(ctx.open, ctx.root, ref, { side: 'bottom', align: props.align === 'end' ? 'end' : 'start', offset: 8 });
  var placed = !!pos;
  useDismiss(ctx.open, [ctx.root, ref], function (reason) {
    ctx.setOpen(false);
    if (reason === 'escape' && ctx.trigger.current) ctx.trigger.current.focus();
  });
  /* Focus the first checkbox once the panel is placed (it is hidden until then), if opened from the trigger. */
  useEffect(function () {
    if (!ctx.open || !placed || !ref.current || props.autoFocus === false) return;
    var first = ref.current.querySelector('[data-ms-col="0"]');
    if (first && document.activeElement && ctx.root.current && ctx.root.current.contains(document.activeElement)) first.focus({ preventScroll: true });
  }, [ctx.open, placed]);
  if (!ctx.open) return null;
  function onKeyDown(e) {
    if (e.key === 'Tab') {
      /* Tabbing off either end closes the panel and continues from the trigger, as if it sat right after it. */
      var tabbable = Array.prototype.filter.call(ref.current.querySelectorAll('input:not([disabled]),button:not([disabled])'), function (el) { return el.tabIndex >= 0; });
      var at = tabbable.indexOf(document.activeElement);
      var t = ctx.trigger.current;
      if (t && ((e.shiftKey && at === 0) || (!e.shiftKey && at === tabbable.length - 1))) {
        if (e.shiftKey) e.preventDefault();
        t.focus();
        ctx.setOpen(false);
      }
      return;
    }
    var grid = multiSelectCells(ref.current);
    var r = -1, c = -1;
    grid.forEach(function (cells, i) { var k = cells.indexOf(document.activeElement); if (k >= 0) { r = i; c = k; } });
    if (r < 0) return;
    var nr = r, nc = c;
    if (e.key === 'ArrowDown') nr = Math.min(grid.length - 1, r + 1);
    else if (e.key === 'ArrowUp') nr = Math.max(0, r - 1);
    else if (e.key === 'ArrowLeft') nc = 0;
    else if (e.key === 'ArrowRight') nc = 1;
    else if (e.key === 'Home') nr = 0;
    else if (e.key === 'End') nr = grid.length - 1;
    else if (e.key === 'Enter' && c === 0) { e.preventDefault(); document.activeElement.click(); return; }
    else return;
    e.preventDefault();
    if (grid[nr][nc]) grid[nr][nc].focus();
  }
  return portal(h('div', {
    ref: ref, id: ctx.contentId, role: 'dialog', 'aria-label': props['aria-label'] || 'Options',
    className: cx('hy-multiselect__content', (pos ? pos.side === 'top' : false) && 'hy-multiselect__content--top', props.align === 'end' && 'hy-multiselect__content--end', props.className),
    style: floatingStyle(pos, Object.assign({ width: props.width }, props.style)),
    onKeyDown: onKeyDown
  }, props.children));
}

function MultiSelectRow(props) {
  var all = props.totalCount != null && props.selectedCount === props.totalCount;
  var action = !all && props.checked ? 'Select All' : 'Only';
  function act() {
    if (action === 'Only') { if (props.onSelectOnly) props.onSelectOnly(); }
    else if (props.onSelectAll) props.onSelectAll();
  }
  return h('div', { className: cx('hy-multiselect__row', props.disabled && 'is-disabled', props.className) },
    h('span', { className: 'hy-multiselect__checkcell' },
      h(HY.Checkbox, {
        checked: !!props.checked, disabled: props.disabled, 'aria-label': props.name, 'data-ms-col': '0',
        onChange: function (e) { if (props.onChange) props.onChange(e.target.checked); }
      })),
    h('button', {
      type: 'button', className: 'hy-multiselect__name', 'data-ms-col': '1', disabled: props.disabled,
      'aria-label': props.name + '. ' + action, onClick: act
    },
      h('span', { className: 'hy-multiselect__text' }, props.label || props.name),
      h('span', { className: 'hy-multiselect__action', 'aria-hidden': 'true' }, action)));
}

function multiSelectItems(items) {
  return (items || []).map(function (it) {
    return typeof it === 'object' ? { value: String(it.value), label: it.label != null ? it.label : String(it.value), disabled: it.disabled } : { value: String(it), label: String(it) };
  });
}

/* The shortcut: a trigger that names the selection, and one row per item. */
function MultiSelect(props) {
  return props.items ? h(MultiSelectQuick, props) : h(MultiSelectRoot, props);
}

function MultiSelectQuick(props) {
  var items = multiSelectItems(props.items);
  var all = items.map(function (i) { return i.value; });
  var vs = useControllable(props.value, props.defaultValue !== undefined ? props.defaultValue : all, props.onChange);
  var value = (vs[0] || []).map(String);
  function set(next) { vs[1](all.filter(function (v) { return next.indexOf(v) >= 0; })); }
  var label = props.label || 'Items';
  var count = value.length;
  var text = count === 1
    ? items.filter(function (i) { return i.value === value[0]; })[0].label
    : count === 0 ? 'No ' + label : count === all.length ? 'All ' + label : label;
  return h(MultiSelectRoot, { open: props.open, defaultOpen: props.defaultOpen, onOpenChange: props.onOpenChange, className: props.className, style: props.style },
    h(MultiSelectTrigger, { size: props.size, disabled: props.disabled },
      h('span', { className: 'hy-multiselect__summary' }, text,
        count > 1 && count < all.length ? h('span', { className: 'hy-multiselect__count' }, count) : null)),
    h(MultiSelectContent, { align: props.align, 'aria-label': label, width: props.width },
      items.map(function (it) {
        var on = value.indexOf(it.value) >= 0;
        return h(MultiSelectRow, {
          key: it.value, name: it.label, checked: on, disabled: it.disabled,
          selectedCount: count, totalCount: all.length,
          onChange: function (c) { set(c ? value.concat([it.value]) : value.filter(function (v) { return v !== it.value; })); },
          onSelectOnly: function () { set([it.value]); },
          onSelectAll: function () { set(all); }
        });
      })));
}

MultiSelect.Root = MultiSelectRoot;
MultiSelect.Trigger = MultiSelectTrigger;
MultiSelect.Content = MultiSelectContent;
MultiSelect.Row = MultiSelectRow;

define('MultiSelect', MultiSelect);
define('MultiSelectRoot', MultiSelectRoot);
define('MultiSelectTrigger', MultiSelectTrigger);
define('MultiSelectContent', MultiSelectContent);
define('MultiSelectRow', MultiSelectRow);
