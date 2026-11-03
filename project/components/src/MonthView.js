/* MonthView: a month of days that each list their entries, for browsing what happens when (not a date picker: that is Calendar).
   `entries` is data ({ key, date, label, tone?, href?, onOpen? }); a day shows up to `maxPerDay` and then "+N more".
   The days are a role="grid" with one roving Tab stop on a day cell; Tab from that cell walks its entries. When the component's
   own width is under `sm` (640px) each day shows dots, a day selects instead of opening, and the selected day's entries list
   below the grid. The layout, grouping and names are pure functions at the top so they can be tested without the DOM. */
var MV_TONES = ['success', 'info', 'warning', 'error', 'neutral'];
var MV_NARROW = 640;

function mvDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function mvAddDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
function mvAddMonths(d, n) {
  var t = new Date(d.getFullYear(), d.getMonth() + n, 1);
  var last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
  return new Date(t.getFullYear(), t.getMonth(), Math.min(d.getDate(), last));
}
function mvKey(d) { return d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate(); }
function mvSame(a, b) { return !!a && !!b && mvKey(a) === mvKey(b); }
function mvPad(n) { return (n < 10 ? '0' : '') + n; }
function mvIso(d) { return d.getFullYear() + '-' + mvPad(d.getMonth() + 1) + '-' + mvPad(d.getDate()); }
function mvParseIso(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}
function mvMonthStart(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function mvToneClass(tone) { return 'hy-month-view__mark hy-month-view__mark--' + (MV_TONES.indexOf(tone) >= 0 ? tone : 'none'); }
/* Page Up/Down: the shown month moves by n, whatever month the focused day belongs to (a leading or trailing day does not),
   and focus lands on the same day number, clamped to the new month's length. */
function mvPage(month, focus, n) {
  var next = mvMonthStart(mvAddMonths(mvMonthStart(month), n));
  var last = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  return { month: next, focus: new Date(next.getFullYear(), next.getMonth(), Math.min(focus.getDate(), last)) };
}
function mvStart(first) { return ((Math.floor(+first) || 0) % 7 + 7) % 7; }

/* The weeks shown for `month`: rows of seven { date, inMonth }, from the week start on or before the 1st to the end of the
   week with the last day (4 to 6 rows, as Calendar draws them). */
function mvLayout(month, firstDayOfWeek) {
  var first = new Date(month.getFullYear(), month.getMonth(), 1);
  var lead = (first.getDay() - mvStart(firstDayOfWeek) + 7) % 7;
  var days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  var weeks = Math.ceil((lead + days) / 7);
  var start = mvAddDays(first, -lead), out = [];
  for (var w = 0; w < weeks; w++) {
    var row = [];
    for (var c = 0; c < 7; c++) {
      var d = mvAddDays(start, w * 7 + c);
      row.push({ date: d, inMonth: d.getMonth() === month.getMonth() });
    }
    out.push(row);
  }
  return out;
}
/* Seven dates, one per weekday, starting at firstDayOfWeek, for the column headers. 7 January 2024 is a Sunday, so adding
   the week start to its date gives the weekday that starts the row. */
function mvWeekdays(firstDayOfWeek) {
  var s = mvStart(firstDayOfWeek), out = [];
  for (var i = 0; i < 7; i++) out.push(new Date(2024, 0, 7 + s + i));
  return out;
}
/* Entries by local day, each day's list in the order given. */
function mvGroup(entries) {
  var map = {};
  (entries || []).forEach(function (e) {
    if (!e || !e.date) return;
    var k = mvKey(e.date);
    (map[k] || (map[k] = [])).push(e);
  });
  return map;
}
function mvVisible(list, max) {
  list = list || [];
  var m = max >= 0 ? Math.floor(max) : 3;
  return { shown: list.slice(0, m), more: Math.max(0, list.length - m) };
}
function mvDayName(fmt, date, count, today) {
  return fmt.format(date) + ', ' + count + (count === 1 ? ' entry' : ' entries') + (today ? ', today' : '');
}

function mvEntry(e, tab, onActivate) {
  var cls = 'hy-month-view__entry';
  var mark = h('span', { className: mvToneClass(e.tone), 'aria-hidden': 'true' });
  var label = h('span', { className: 'hy-month-view__entry-label' }, e.label);
  if (e.href) return h('a', { className: cls + ' is-link', href: e.href, tabIndex: tab ? 0 : -1, onClick: e.onOpen ? function (ev) { e.onOpen(ev); } : undefined }, mark, label);
  if (e.onOpen) return h('button', { type: 'button', className: cls + ' is-button', tabIndex: tab ? 0 : -1, onClick: function (ev) { e.onOpen(ev); } }, mark, label);
  return h('span', { className: cls }, mark, label);
}

function MonthView(props) {
  var auto = useId();
  var locale = props.locale;
  var fmt = useMemo(function () {
    return {
      title: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
      short: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      long: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
      full: new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' })
    };
  }, [locale]);
  var firstDay = mvStart(props.firstDayOfWeek != null ? props.firstDayOfWeek : 0);
  var max = props.maxPerDay != null ? props.maxPerDay : 3;

  var ms = useControllable(props.month, props.defaultMonth !== undefined ? props.defaultMonth : new Date(), props.onMonthChange);
  var month = mvMonthStart(ms[0]);
  var setMonth = ms[1];
  var ss = useControllable(props.selectedDate, props.defaultSelectedDate !== undefined ? props.defaultSelectedDate : null, props.onSelectedDateChange);
  var selected = ss[0] ? mvDay(ss[0]) : null;
  var setSelected = ss[1];
  var fs = useState(null);
  var focus = fs[0], setFocus = fs[1];
  var ns = useState(false);
  var narrow = ns[0], setNarrow = ns[1];
  var root = useRef(null), grid = useRef(null), pending = useRef(null);

  useLayoutEffect(function () {
    var el = root.current;
    if (!el) return;
    /* The one source of "narrow": the content-box width (padding excluded), also what the styles key on via .is-narrow. */
    function set(width) { setNarrow(width > 0 && width < MV_NARROW); }
    function measure() {
      var cs = getComputedStyle(el);
      set(el.getBoundingClientRect().width - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0) - (parseFloat(cs.borderLeftWidth) || 0) - (parseFloat(cs.borderRightWidth) || 0));
    }
    measure();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', measure); return function () { window.removeEventListener('resize', measure); }; }
    var ro = new ResizeObserver(function (entries) { set(entries[0].contentRect.width); });
    ro.observe(el);
    return function () { ro.disconnect(); };
  }, []);

  var weeks = mvLayout(month, firstDay);
  var byDay = mvGroup(props.entries);
  var today = mvDay(new Date());
  var gridFirst = weeks[0][0].date, gridLast = weeks[weeks.length - 1][6].date;
  function visible(d) { return d >= gridFirst && d <= gridLast; }
  /* The Tab stop: the focused day while it is on the grid, else today, else the 1st. */
  var tabDay = focus && visible(focus) ? focus : (today.getMonth() === month.getMonth() && today.getFullYear() === month.getFullYear() ? today : month);

  /* Moving the focus to a day that a month change has just drawn. */
  useEffect(function () {
    if (!pending.current) return;
    var d = pending.current;
    pending.current = null;
    var el = grid.current && grid.current.querySelector('[data-day="' + mvIso(d) + '"]');
    if (el) el.focus();
  });

  function goTo(d) {
    setFocus(d);
    var el = visible(d) && grid.current && grid.current.querySelector('[data-day="' + mvIso(d) + '"]');
    if (el) { el.focus(); return; }
    /* Off the drawn weeks: change the month and focus the day once it is drawn. */
    pending.current = d;
    setMonth(mvMonthStart(d));
  }
  function shift(n) { setMonth(mvAddMonths(month, n)); }
  function activate(d) {
    if (narrow) setSelected(d);
    else if (props.onDayOpen) props.onDayOpen(d);
  }
  function dayOf(e) {
    var cell = e.target.closest ? e.target.closest('[data-day]') : null;
    return cell ? mvParseIso(cell.getAttribute('data-day')) : null;
  }
  function onKeyDown(e) {
    if (!e.target.getAttribute || !e.target.hasAttribute('data-day')) return;
    var d = mvParseIso(e.target.getAttribute('data-day'));
    if (!d || e.altKey || e.ctrlKey || e.metaKey) return;
    var k = e.key, to = null;
    var col = (d.getDay() - firstDay + 7) % 7;
    if (k === 'ArrowRight') to = mvAddDays(d, 1);
    else if (k === 'ArrowLeft') to = mvAddDays(d, -1);
    else if (k === 'ArrowDown') to = mvAddDays(d, 7);
    else if (k === 'ArrowUp') to = mvAddDays(d, -7);
    else if (k === 'Home') to = mvAddDays(d, -col);
    else if (k === 'End') to = mvAddDays(d, 6 - col);
    else if (k === 'PageUp' || k === 'PageDown') {
      var page = mvPage(month, d, k === 'PageUp' ? -1 : 1);
      e.preventDefault();
      pending.current = page.focus;
      setFocus(page.focus);
      setMonth(page.month);
      return;
    }
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); activate(d); return; }
    if (!to) return;
    e.preventDefault();
    goTo(to);
  }
  function onCellClick(e) {
    /* Entries and "+N more" act on their own. */
    if (e.target.closest && e.target.closest('a, button')) return;
    var d = dayOf(e);
    if (d) { setFocus(d); activate(d); }
  }
  function onCellFocus(e) {
    var d = dayOf(e);
    if (d && !mvSame(d, focus)) setFocus(d);
  }

  var titleId = auto + '-title';
  var title = fmt.title.format(month);
  var heads = mvWeekdays(firstDay).map(function (d, i) {
    return h('div', { key: i, role: 'columnheader', className: 'hy-month-view__head' },
      h('span', { 'aria-hidden': 'true' }, fmt.short.format(d)), h('span', { className: 'hy-sr' }, fmt.long.format(d)));
  });

  var rows = weeks.map(function (week, w) {
    return h('div', { key: w, role: 'row', className: 'hy-month-view__week' }, week.map(function (cell) {
      var d = cell.date, list = byDay[mvKey(d)] || [];
      var isToday = mvSame(d, today), isTab = mvSame(d, tabDay), isSel = mvSame(d, selected);
      var v = mvVisible(list, max);
      return h('div', {
        key: mvIso(d), role: 'gridcell', 'data-day': mvIso(d), tabIndex: isTab ? 0 : -1,
        'aria-label': mvDayName(fmt.full, d, list.length, isToday), 'aria-selected': narrow ? (isSel ? 'true' : 'false') : undefined, 'aria-current': isToday ? 'date' : undefined,
        className: cx('hy-month-view__day', !cell.inMonth && 'is-outside', isToday && 'is-today', isSel && 'is-selected'),
        onClick: onCellClick, onFocus: onCellFocus
      },
        h('span', { className: 'hy-month-view__num', 'aria-hidden': 'true' }, d.getDate()),
        v.shown.length || v.more ? h('ul', { className: 'hy-month-view__entries' },
          v.shown.map(function (e) { return h('li', { key: e.key }, mvEntry(e, isTab)); }),
          v.more ? h('li', { key: '__more' }, h('button', {
            type: 'button', className: 'hy-month-view__more', tabIndex: isTab ? 0 : -1,
            'aria-label': '+' + v.more + ' more, ' + fmt.full.format(d), onClick: function () { if (props.onDayOpen) props.onDayOpen(d); }
          }, '+' + v.more + ' more')) : null) : null,
        list.length ? h('span', { className: 'hy-month-view__dots', 'aria-hidden': 'true' }, list.slice(0, 3).map(function (e) {
          return h('span', { key: e.key, className: mvToneClass(e.tone) });
        })) : null);
    }));
  });

  var below = null;
  if (narrow) {
    var sel = selected ? (byDay[mvKey(selected)] || []) : [];
    below = h('div', { className: 'hy-month-view__list' },
      selected ? h('h3', { className: 'hy-month-view__list-title' }, fmt.full.format(selected)) : null,
      selected ? (sel.length ? h('ul', { className: 'hy-month-view__list-entries' }, sel.map(function (e) {
        return h('li', { key: e.key }, mvEntry(e, true));
      })) : h('p', { className: 'hy-month-view__list-empty' }, 'No entries')) : h('p', { className: 'hy-month-view__list-empty' }, 'Select a day to see its entries'));
  }

  var gridName = (props.label ? props.label + ', ' : '') + title;
  return h('div', { ref: root, className: cx('hy-month-view', narrow && 'is-narrow', props.className), style: props.style },
    h('div', { className: 'hy-month-view__inner' },
      h('div', { className: 'hy-month-view__bar' },
        h('h2', { id: titleId, className: 'hy-month-view__title', 'aria-live': 'polite' }, title),
        h('div', { className: 'hy-month-view__nav' },
          h(HY.Button, { variant: 'tertiary', size: 'small', 'aria-label': 'Previous Month', onClick: function () { shift(-1); } }, h(HY.Icon, { name: 'chevron-left', size: 16 })),
          h(HY.Button, { variant: 'tertiary', size: 'small', 'aria-label': 'Next Month', onClick: function () { shift(1); } }, h(HY.Icon, { name: 'chevron-right', size: 16 })),
          h(HY.Button, { variant: 'secondary', size: 'small', onClick: function () { setFocus(today); setMonth(mvMonthStart(today)); } }, 'Today'))),
      h('div', { ref: grid, role: 'grid', className: 'hy-month-view__grid', 'aria-label': gridName, onKeyDown: onKeyDown },
        h('div', { role: 'row', className: 'hy-month-view__week hy-month-view__week--head' }, heads),
        rows),
      below));
}

define('MonthView', MonthView);
