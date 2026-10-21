/* Calendar: a date or date-range picker. A trigger shows the chosen dates; its popover holds a month grid,
   Start/End date and time fields, an Apply button and an optional timezone menu. Presets ("Last 7 Days")
   sit in a select joined to the trigger. Month, weekday and date names come from Intl in the user's locale.
   Values are Date objects: { start, end } for mode="range" (default), a Date for mode="single". */
function calDay(d) { return d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : null; }
function calAddDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
function calAddMonths(d, n) {
  var t = new Date(d.getFullYear(), d.getMonth() + n, 1);
  var last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
  return new Date(t.getFullYear(), t.getMonth(), Math.min(d.getDate(), last));
}
function calSame(a, b) { return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function calKey(d) { return d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate(); }
function calPad(n) { return (n < 10 ? '0' : '') + n; }
function calIso(d) { return d ? d.getFullYear() + '-' + calPad(d.getMonth() + 1) + '-' + calPad(d.getDate()) : ''; }
function calParseIso(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}
function calTime(d, fallback) { return d && (d.getHours() || d.getMinutes()) ? calPad(d.getHours()) + ':' + calPad(d.getMinutes()) : fallback; }
function calWithTime(d, t) {
  if (!d) return null;
  var m = /^(\d{1,2}):(\d{2})/.exec(t || '');
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), m ? +m[1] : 0, m ? +m[2] : 0, m && +m[1] === 23 && +m[2] === 59 ? 59 : 0);
}
function calToDate(v) { return v == null ? null : (v instanceof Date ? v : new Date(v)); }
function calNorm(v, mode) {
  if (mode === 'single') return { start: calToDate(v), end: null };
  return { start: calToDate(v && v.start), end: calToDate(v && v.end) };
}
function calPresetList(p) {
  if (!p) return [];
  if (Array.isArray(p)) return p.map(function (x, i) { return Object.assign({ key: x.key || String(i) }, x); });
  return Object.keys(p).map(function (k) { return Object.assign({ key: k }, p[k]); });
}
function calLocalZone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local'; } catch (e) { return 'Local'; }
}

function CalendarMonth(p) {
  var fmt = p.fmt;
  var month = p.month;
  var first = new Date(month.getFullYear(), month.getMonth(), 1);
  var lead = (first.getDay() - p.weekStart + 7) % 7;
  var start = calAddDays(first, -lead);
  var days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  var weeks = Math.ceil((lead + days) / 7);
  var today = calDay(new Date());
  var lo = p.range.start, hi = p.range.end || (p.mode === 'range' && p.range.start && p.hover ? p.hover : null);
  if (lo && hi && hi < lo) { var t = lo; lo = hi; hi = t; }
  var heads = [];
  for (var i = 0; i < 7; i++) {
    var wd = calAddDays(start, i);
    heads.push(h('th', { key: i, scope: 'col', abbr: fmt.weekdayLong.format(wd) }, h('span', { 'aria-hidden': 'true' }, fmt.weekdayNarrow.format(wd)), h('span', { className: 'hy-sr' }, fmt.weekdayLong.format(wd))));
  }
  var rows = [];
  for (var w = 0; w < weeks; w++) {
    var cells = [];
    for (var c = 0; c < 7; c++) {
      var d = calAddDays(start, w * 7 + c);
      var outside = d.getMonth() !== month.getMonth();
      var disabled = (p.min && d < calDay(p.min)) || (p.max && d > calDay(p.max));
      var isStart = calSame(d, lo), isEnd = calSame(d, hi);
      var inBand = lo && hi && d >= calDay(lo) && d <= calDay(hi);
      var selected = isStart || isEnd || (p.mode === 'range' && inBand && !!p.range.end);
      var label = (calSame(d, today) ? 'Today, ' : '') + fmt.full.format(d) + (isStart || isEnd ? ' selected' : '');
      cells.push(h('td', {
        key: c, role: 'gridcell', 'aria-selected': selected ? 'true' : undefined,
        className: cx('hy-calendar__cell', inBand && !calSame(lo, hi) && 'is-band', isStart && 'is-band-start', isEnd && 'is-band-end',
          c === 0 && 'is-row-start', c === 6 && 'is-row-end')
      },
        h('button', {
          type: 'button', 'data-day': calIso(d), tabIndex: calSame(d, p.focus) ? 0 : -1, disabled: disabled, 'aria-label': label,
          className: cx('hy-calendar__day', outside && 'is-outside', (isStart || isEnd) && 'is-edge', calSame(d, today) && 'is-today',
            (d.getDay() === 0 || d.getDay() === 6) && 'is-weekend'),
          onClick: (function (day) { return function () { p.onPick(day); }; })(d),
          onMouseEnter: (function (day) { return function () { p.onHover(day); }; })(d),
          onFocus: (function (day) { return function () { if (!calSame(day, p.focus)) p.onFocusDay(day); }; })(d)
        }, d.getDate())));
    }
    rows.push(h('tr', { key: w }, cells));
  }
  return h('table', { role: 'grid', className: 'hy-calendar__grid', 'aria-labelledby': p.titleId, onKeyDown: p.onKeyDown, onMouseLeave: function () { p.onHover(null); } },
    h('thead', null, h('tr', null, heads)),
    h('tbody', null, rows));
}

function Calendar(props) {
  var auto = useId();
  var mode = props.mode === 'single' ? 'single' : 'range';
  var locale = props.locale;
  var showTime = props.showTimeInput !== false && mode === 'range';
  var fmt = useMemo(function () {
    return {
      title: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
      weekdayNarrow: new Intl.DateTimeFormat(locale, { weekday: 'narrow' }),
      weekdayLong: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
      full: new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      short: new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }),
      shortYear: new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' })
    };
  }, [locale]);
  var weekStart = props.firstDayOfWeek != null ? props.firstDayOfWeek : 0;
  var min = calToDate(props.minValue), max = calToDate(props.maxValue);

  var vs = useControllable(props.value, props.defaultValue !== undefined ? props.defaultValue : null, props.onChange);
  var value = calNorm(vs[0], mode);
  var os = useControllable(props.open, !!props.defaultOpen, props.onOpenChange);
  var open = os[0];
  var ds = useState(value);
  var draft = ds[0], setDraft = ds[1];
  var ts = useState({ start: calTime(value.start, '00:00'), end: calTime(value.end, '23:59') });
  var times = ts[0], setTimes = ts[1];
  var fs = useState(calDay(value.start || value.end || new Date()));
  var focus = fs[0], setFocus = fs[1];
  var hs = useState(null);
  var hover = hs[0], setHover = hs[1];
  var zs = useControllable(props.timezone, props.defaultTimezone || props.pinnedTimezone || 'local', props.onTimezoneChange);
  var msg = useState('');
  var root = useRef(null), pop = useRef(null), trigger = useRef(null), anchor = useRef(null), byUser = useRef(false);
  var titleId = auto + '-title';
  var presets = calPresetList(props.presets);

  function say(r) {
    if (!r.start) return msg[1]('');
    msg[1](mode === 'single' ? fmt.full.format(r.start) : 'From ' + fmt.shortYear.format(r.start) + (r.end ? ' to ' + fmt.shortYear.format(r.end) : ''));
  }
  function openPopover() {
    setDraft(value);
    setTimes({ start: calTime(value.start, '00:00'), end: calTime(value.end, '23:59') });
    setFocus(calDay(value.start || value.end || new Date()));
    byUser.current = true;
    os[1](true);
  }
  function closePopover(restore) {
    os[1](false);
    setHover(null);
    if (restore && trigger.current) trigger.current.focus();
  }
  useDismiss(open, [root, pop], function (reason) { closePopover(reason === 'escape'); });
  var align = props.popoverAlignment === 'center' || props.popoverAlignment === 'end' ? props.popoverAlignment : 'start';
  var pos = useFloating(open, anchor, pop, { side: 'bottom', align: align });
  useEffect(function () {
    if (!open || !byUser.current) return;
    byUser.current = false;
    /* wait a frame: the popover stays hidden until useFloating has measured it, and hidden boxes can't take focus */
    var raf = requestAnimationFrame(function () {
      var b = pop.current && pop.current.querySelector('.hy-calendar__day[tabindex="0"]');
      if (b) b.focus({ preventScroll: true });
    });
    return function () { cancelAnimationFrame(raf); };
  }, [open]);
  /* the grid can grow a row when the month changes: let useFloating re-measure (it listens to any scroll) */
  useLayoutEffect(function () {
    if (open && pop.current) pop.current.dispatchEvent(new Event('scroll'));
  }, [open, focus.getFullYear(), focus.getMonth()]);

  function commit(r) {
    var out = mode === 'single' ? (r.start ? calWithTime(r.start, '00:00') : null)
      : { start: r.start ? (showTime ? calWithTime(r.start, times.start) : calDay(r.start)) : null,
          end: r.end ? (showTime ? calWithTime(r.end, times.end) : calWithTime(r.end, '23:59')) : null };
    vs[1](out);
    say(r);
  }
  function pick(day) {
    setFocus(day);
    if (mode === 'single') { var r1 = { start: day, end: null }; setDraft(r1); commit(r1); closePopover(true); return; }
    var r;
    if (!draft.start || draft.end) r = { start: day, end: null };
    else if (day < calDay(draft.start)) r = { start: day, end: draft.start };
    else r = { start: draft.start, end: day };
    setDraft(r);
    say(r);
    if (r.end) { commit(r); closePopover(true); }
  }
  function onGridKey(e) {
    var d = focus, k = e.key;
    if (k === 'ArrowLeft') d = calAddDays(focus, -1);
    else if (k === 'ArrowRight') d = calAddDays(focus, 1);
    else if (k === 'ArrowUp') d = calAddDays(focus, -7);
    else if (k === 'ArrowDown') d = calAddDays(focus, 7);
    else if (k === 'PageUp') d = calAddMonths(focus, e.shiftKey ? -12 : -1);
    else if (k === 'PageDown') d = calAddMonths(focus, e.shiftKey ? 12 : 1);
    else if (k === 'Home') d = calAddDays(focus, -((focus.getDay() - weekStart + 7) % 7));
    else if (k === 'End') d = calAddDays(focus, 6 - ((focus.getDay() - weekStart + 7) % 7));
    else return;
    e.preventDefault();
    if (min && d < calDay(min)) d = calDay(min);
    if (max && d > calDay(max)) d = calDay(max);
    setFocus(d);
    if (draft.start && !draft.end) setHover(d);
    setTimeout(function () {
      var b = pop.current && pop.current.querySelector('[data-day="' + calIso(d) + '"]');
      if (b) b.focus({ preventScroll: true });
    }, 0);
  }
  function shiftMonth(n) { setFocus(calAddMonths(focus, n)); }
  function clear(e) {
    if (e) e.stopPropagation();
    var r = { start: null, end: null };
    setDraft(r);
    vs[1](mode === 'single' ? null : r);
    msg[1]('Dates cleared');
    if (trigger.current) trigger.current.focus();
  }
  function apply() { commit(draft); closePopover(true); }
  function pickPreset(key) {
    var p = presets.filter(function (x) { return x.key === key; })[0];
    if (!p) return;
    var r = { start: calToDate(p.start), end: calToDate(p.end) };
    vs[1](mode === 'single' ? r.start : r);
    say(r);
    if (props.onPresetChange) props.onPresetChange(key);
  }

  var hasValue = !!(value.start || value.end);
  var text;
  if (!hasValue) text = props.placeholder || (mode === 'single' ? 'Select Date' : 'Select Date Range');
  else if (mode === 'single' || !value.end) text = fmt.shortYear.format(value.start || value.end);
  else {
    var thisYear = value.start.getFullYear() === new Date().getFullYear() && value.end.getFullYear() === value.start.getFullYear();
    var rf = thisYear ? fmt.short : fmt.shortYear;
    text = rf.formatRange ? rf.formatRange(value.start, value.end) : rf.format(value.start) + ' – ' + rf.format(value.end);
  }
  var activePreset = '';
  presets.forEach(function (p) {
    if (calSame(calToDate(p.start), value.start) && calSame(calToDate(p.end), value.end)) activePreset = p.key;
  });
  if (props.presetIndex != null && !hasValue && presets[props.presetIndex]) activePreset = presets[props.presetIndex].key;
  var size = props.size === 'small' ? 'small' : 'medium';
  var layout = props.stacked ? 'stacked' : props.compact ? 'compact' : 'joined';

  var presetSelect = presets.length ? h('label', { className: cx('hy-calendar__presets', 'hy-calendar__presets--' + layout) },
    h('span', { className: 'hy-calendar__presets-icon', 'aria-hidden': 'true' }, h(HY.Icon, { name: 'clock', size: 16 })),
    h('select', {
      className: 'hy-calendar__presets-select', value: activePreset, disabled: props.disabled, 'aria-label': 'Select Period',
      onChange: function (e) { pickPreset(e.target.value); }
    },
      h('option', { value: '', disabled: true }, 'Select Period'),
      presets.map(function (p) { return h('option', { key: p.key, value: p.key }, p.text); })),
    h('span', { className: 'hy-calendar__presets-chevron', 'aria-hidden': 'true' }, h(Glyph, { name: 'chevron', size: 16 }))) : null;

  var triggerEl = h('div', {
    className: cx('hy-calendar__trigger', 'hy-calendar__trigger--' + size, props.disabled && 'is-disabled', open && 'is-open', presets.length && layout === 'joined' && 'is-joined')
  },
    h('button', {
      ref: trigger, type: 'button', className: 'hy-calendar__button', disabled: props.disabled,
      'aria-haspopup': 'dialog', 'aria-expanded': open, 'aria-label': props['aria-label'] ? props['aria-label'] + ': ' + text : undefined,
      onClick: function () { if (open) closePopover(false); else openPopover(); }
    },
      h('span', { className: 'hy-calendar__button-icon', 'aria-hidden': 'true' }, h(HY.Icon, { name: 'calendar', size: 16 })),
      h('span', { className: cx('hy-calendar__value', !hasValue && 'is-placeholder') }, text)),
    props.allowClear && hasValue && !props.disabled ? h('button', {
      type: 'button', className: 'hy-calendar__clear', 'aria-label': 'Clear dates', onClick: clear
    }, h(Glyph, { name: 'x', size: 16 })) : null);

  function field(which) {
    var d = draft[which];
    return h('div', { className: 'hy-calendar__field' },
      h('span', { className: 'hy-calendar__field-label', id: auto + '-' + which }, which === 'start' ? 'Start' : 'End'),
      h('input', {
        type: 'date', className: 'hy-calendar__input hy-calendar__input--date', value: calIso(d), 'aria-labelledby': auto + '-' + which,
        min: min ? calIso(min) : undefined, max: max ? calIso(max) : undefined,
        onChange: function (e) {
          var nd = calParseIso(e.target.value);
          var r = Object.assign({}, draft); r[which] = nd;
          setDraft(r);
          if (nd) setFocus(nd);
        }
      }),
      showTime ? h('input', {
        type: 'time', className: 'hy-calendar__input hy-calendar__input--time', value: times[which],
        'aria-label': (which === 'start' ? 'Start' : 'End') + ' time',
        onChange: function (e) { var t = Object.assign({}, times); t[which] = e.target.value; setTimes(t); }
      }) : null);
  }

  var zones = [{ value: 'utc', label: 'UTC' }, { value: 'local', label: 'Local (' + calLocalZone() + ')' }];
  if (props.pinnedTimezone) zones.push({ value: props.pinnedTimezone, label: props.pinnedTimezone.replace(/_/g, ' ') });
  var showZone = showTime && props.showTimezone !== false;

  var popover = open ? portal(h('div', {
    ref: pop, role: 'dialog', 'aria-label': mode === 'single' ? 'Choose a date' : 'Choose a date range',
    className: cx('hy-calendar__popover', props.horizontalLayout && 'hy-calendar__popover--horizontal', 'hy-calendar__popover--' + align, pos && 'hy-calendar__popover--' + pos.side),
    style: floatingStyle(pos),
    onKeyDown: function (e) { trapTab(e, pop.current); if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); apply(); } }
  },
    h('div', { className: 'hy-calendar__month' },
      h('div', { className: 'hy-calendar__head' },
        h('h2', { className: 'hy-calendar__title', id: titleId, 'aria-live': 'polite' }, fmt.title.format(focus)),
        h('div', { className: 'hy-calendar__nav' },
          h('button', { type: 'button', className: 'hy-calendar__navbtn', 'aria-label': 'Previous month', onClick: function () { shiftMonth(-1); } }, h(HY.Icon, { name: 'chevron-left', size: 16 })),
          h('button', { type: 'button', className: 'hy-calendar__navbtn', 'aria-label': 'Next month', onClick: function () { shiftMonth(1); } }, h(HY.Icon, { name: 'chevron-right', size: 16 })))),
      h(CalendarMonth, {
        month: focus, focus: focus, fmt: fmt, weekStart: weekStart, mode: mode, range: draft, hover: hover, min: min, max: max,
        titleId: titleId, onPick: pick, onHover: setHover, onFocusDay: setFocus, onKeyDown: onGridKey
      })),
    mode === 'range' ? h('div', { className: 'hy-calendar__side' },
      field('start'),
      field('end'),
      h(HY.Button, { variant: 'primary', size: 'small', className: 'hy-calendar__apply', onClick: apply, disabled: !draft.start, suffix: h(HY.KeyboardInput, { small: true }, '↵') }, 'Apply'),
      showZone ? h('label', { className: 'hy-calendar__zone' },
        h('span', { className: 'hy-sr' }, 'Timezone'),
        h(HY.Icon, { name: 'globe', size: 16 }),
        h('select', { value: zs[0], onChange: function (e) { zs[1](e.target.value); } },
          zones.map(function (z) { return h('option', { key: z.value, value: z.value }, z.label); })),
        h(Glyph, { name: 'chevron', size: 16 })) : null) : null)) : null;

  return h('div', { ref: root, className: cx('hy-calendar', 'hy-calendar--' + layout, props.className), style: props.style },
    layout === 'stacked' ? presetSelect : null,
    h('div', { ref: anchor, className: 'hy-calendar__bar' },
      layout === 'joined' ? presetSelect : null,
      triggerEl,
      layout === 'compact' ? presetSelect : null),
    popover,
    h('span', { className: 'hy-sr', 'aria-live': 'polite' }, msg[0]));
}

define('Calendar', Calendar);
