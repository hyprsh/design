/*
 * Tabs: WAI-ARIA tabs. Geist's API (`selected` + `setSelected`, `tabs` with title/value/icon/disabled/tooltip,
 * `disabled`, `variant="secondary"`) plus our `onChange`, `defaultSelected` and per-tab `content` panels.
 * A list wider than the screen scrolls sideways; tab tooltips are portalled, so the scroll doesn't clip them.
 */
function Tabs(props) {
  var tabs = props.tabs || [];
  var controlled = props.selected !== undefined;
  var st = useState(props.defaultSelected !== undefined ? props.defaultSelected : (tabs[0] && tabs[0].value));
  var sel = controlled ? props.selected : st[0];
  var base = useId();
  var refs = useRef({});
  var allDisabled = !!props.disabled;
  var variant = props.variant === 'secondary' ? 'secondary' : 'primary';
  function isOff(t) { return allDisabled || !!t.disabled; }
  function choose(v) {
    if (!controlled) st[1](v);
    if (props.setSelected) props.setSelected(v);
    if (props.onChange) props.onChange(v);
  }
  function onKey(e) {
    var enabled = tabs.filter(function (t) { return !isOff(t); });
    if (!enabled.length) return;
    var i = enabled.findIndex(function (t) { return t.value === sel; });
    var next = null;
    if (e.key === 'ArrowRight') next = enabled[(i + 1) % enabled.length];
    else if (e.key === 'ArrowLeft') next = enabled[(i - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled[enabled.length - 1];
    if (next) { e.preventDefault(); choose(next.value); var el = refs.current[next.value]; if (el) el.focus(); }
  }
  /* The selected tab takes the tab stop; if it is disabled (or none is selected), the first enabled tab does. */
  var focusable = tabs.filter(function (t) { return t.value === sel && !isOff(t); })[0] || tabs.filter(function (t) { return !isOff(t); })[0];
  var active = tabs.filter(function (t) { return t.value === sel; })[0];
  return h('div', { className: cx('hy-tabs', 'hy-tabs--' + variant, props.className), style: props.style },
    h('div', { role: 'tablist', 'aria-label': props['aria-label'], className: 'hy-tabs__list', onKeyDown: onKey },
      tabs.map(function (t) {
        var on = t.value === sel;
        var btn = h('button', {
          key: t.value, type: 'button', role: 'tab', id: base + '-tab-' + t.value, 'aria-selected': on,
          'aria-controls': t.content !== undefined ? base + '-panel-' + t.value : undefined,
          tabIndex: focusable && focusable.value === t.value ? 0 : -1, disabled: isOff(t), className: 'hy-tabs__tab',
          ref: function (el) { refs.current[t.value] = el; }, onClick: function () { choose(t.value); }
        }, t.icon ? h('span', { className: 'hy-tabs__icon', 'aria-hidden': 'true' }, t.icon) : null, t.title);
        return t.tooltip ? h(HY.Tooltip, { key: t.value, text: t.tooltip, position: 'bottom', className: 'hy-tabs__tip' }, btn) : btn;
      })),
    active && active.content !== undefined ? h('div', { role: 'tabpanel', id: base + '-panel-' + active.value, 'aria-labelledby': base + '-tab-' + active.value, tabIndex: 0, className: 'hy-tabs__panel' }, active.content) : null);
}

define('Tabs', Tabs);
