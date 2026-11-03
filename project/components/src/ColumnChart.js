/* ColumnChart: stacked columns on one y scale, with a legend, hover and focus tooltips, one Tab stop with roving keys,
   and a table view. Drawn from plain elements and tokens (ADR 0004). The pure parts (ticks, segment geometry, label
   thinning, fitting, names) are module-private functions: tests read them from the vm context. */
var CC_TONES = ['success', 'info', 'warning', 'error', 'neutral'];
var CC_GAP = 2, CC_MIN = 2, CC_MAX_TICKS = 5;

function ccAmount(v) { v = Number(v); return v > 0 && isFinite(v) ? v : 0; }
/* One series' value in a column, never negative: 0 when missing or invalid. */
function ccValue(datum, series) { return ccAmount(datum.values && datum.values[series.key]); }

/* Clean ticks from 0 (steps of 1, 2 or 5 times a power of ten), at most 5, the last at or above `max`. */
function ccTicks(max) {
  max = ccAmount(max);
  if (!max) return [0, 1];
  var mag = Math.pow(10, Math.floor(Math.log(max) / Math.LN10 + 1e-9));
  var steps = [0.1, 0.2, 0.5, 1, 2, 5, 10], step = 10 * mag;
  for (var i = 0; i < steps.length; i++) {
    if (Math.ceil(max / (steps[i] * mag) - 1e-9) <= CC_MAX_TICKS - 1) { step = steps[i] * mag; break; }
  }
  var count = Math.ceil(max / step - 1e-9), out = [];
  for (var n = 0; n <= count; n++) out.push(Number((n * step).toPrecision(12)));
  return out;
}

/* Axis labels: plain below 1,000, compact (1K, 1.5K, 2M) from there. */
function ccTickLabel(v) {
  var opts = v >= 1000 ? { notation: 'compact', maximumFractionDigits: 1 } : { maximumFractionDigits: 3 };
  try { return new Intl.NumberFormat(undefined, opts).format(v); } catch (e) { return String(v); }
}

function ccTotal(series, datum) {
  var t = 0;
  series.forEach(function (s) { t += ccValue(datum, s); });
  return t;
}

/* Where each non-zero segment goes: `bottom` and `height` in px up a plot `height` px tall for 0 to `max`.
   A segment that touches one below it leaves a 2px gap under it, and none is under 2px. Each carries its series' `tone`,
   and `top` marks the last one. */
function ccSegments(series, datum, max, height) {
  var out = [], cursor = 0;
  series.forEach(function (s) {
    var v = ccValue(datum, s);
    if (!v) return;
    var slice = max > 0 ? v / max * height : 0;
    var gap = out.length ? CC_GAP : 0;
    var h = Math.max(CC_MIN, slice - gap);
    out.push({ key: s.key, tone: s.tone, bottom: cursor + gap, height: h, top: false });
    cursor += Math.max(slice, h + gap);
  });
  if (out.length) out[out.length - 1].top = true;
  return out;
}

/* Show every nth x label so they never collide: a label needs about 7px a character plus 8px of air. */
function ccThinStep(slotWidth, chars) {
  if (!(slotWidth > 0) || !(chars > 0)) return 1;
  return Math.max(1, Math.ceil((chars * 7 + 8) / slotWidth));
}
/* Thinning counts back from the last column, so the latest one is always labelled. */
function ccLabelShown(i, n, step) { return (n - 1 - i) % Math.max(1, step) === 0; }
/* The columns that get an x label. Every label is kept inside the plot, shifted inward at an edge, so one near the start
   can come to touch its neighbour: walking back from the last label (always kept), a label that would is dropped. */
function ccXLabels(n, slotWidth, chars) {
  var step = ccThinStep(slotWidth, chars), out = [];
  for (var i = n - 1; i >= 0; i--) if (ccLabelShown(i, n, step)) out.unshift(i);
  if (!(slotWidth > 0) || !(chars > 0) || out.length < 2) return out;
  var w = chars * 7, total = n * slotWidth;
  function lo(j) { return Math.max(0, Math.min((j + 0.5) * slotWidth - w / 2, total - w)); }
  var kept = [out[out.length - 1]], edge = lo(out[out.length - 1]);
  for (var k = out.length - 2; k >= 0; k--) {
    if (lo(out[k]) + w + 8 <= edge) { kept.unshift(out[k]); edge = lo(out[k]); }
  }
  return kept;
}

/* Fitting. A column is a direct target only when its slot is at least the target size: 24px, or the touch target under
   touch sizing. An openable chart with narrower slots fits its width and switches to pick, then open: the plot is the
   target and the pinned tooltip opens. It fits down to 4px a slot (a 2px mark and a 2px gap) and scrolls below that.
   A chart that opens nothing never scrolls. Until the width is measured the chart stays as it is. */
var CC_TARGET = 24, CC_PICK_MIN = 4, CC_TOUCH_QUERY = '(pointer: coarse), (max-width: 639px)';
function ccTargetSize(touch, touchTarget) { return touch ? (touchTarget > 0 ? touchTarget : 44) : CC_TARGET; }
function ccSlotWidth(width, n) { return n > 0 && width > 0 ? width / n : 0; }
/* { pick, scroll, minWidth } for `n` columns in `width` px. */
function ccFit(width, n, openable, target) {
  var slot = ccSlotWidth(width, n);
  if (!openable || !slot || slot >= target) return { pick: false, scroll: false, minWidth: 0 };
  var scroll = slot < CC_PICK_MIN;
  return { pick: true, scroll: scroll, minWidth: scroll ? n * CC_PICK_MIN : 0 };
}
/* The column under a pointer `x` px from the plot's left edge, clamped to the ends. */
function ccPickIndex(x, width, n) {
  if (!(n > 0) || !(width > 0)) return 0;
  return Math.max(0, Math.min(n - 1, Math.floor(x / width * n)));
}

/* "Oct 28: 25 ready, 1 canceled, 0 error" */
function ccColumnName(datum, series, fmt) {
  return datum.label + ': ' + series.map(function (s) { return fmt(ccValue(datum, s)) + ' ' + s.label; }).join(', ');
}

/* Tooltip rows from the top of the stack down, and the total's text. */
function ccTooltipRows(datum, series, fmt) {
  return series.slice().reverse().map(function (s) {
    return { key: s.key, label: s.label, tone: s.tone, value: fmt(ccValue(datum, s)) };
  });
}
/* The total, formatted: the tooltip's last row and the table's Total column. */
function ccTotalText(datum, series, fmt) { return fmt(ccTotal(series, datum)); }

/* Opening. A column or a mark is a target when `onOpen` is set or `href` returns a URL for it: a link with a URL, else a
   button. Returns null when it is no target, else { href } (href undefined for a button). `key` is the series key of a mark. */
function ccTarget(props, datum, key) {
  var url = typeof props.href !== 'function' ? undefined : key === undefined ? props.href(datum) : props.href(datum, key);
  if (typeof url === 'string' && url) return { href: url };
  return typeof props.onOpen === 'function' ? { href: undefined } : null;
}
/* "Open Oct 28: 25 ready, 1 canceled, 0 error" */
function ccOpenColumnName(datum, series, fmt) { return 'Open ' + ccColumnName(datum, series, fmt); }
/* "Open Oct 28 canceled: 1" */
function ccOpenMarkName(datum, s, fmt) { return 'Open ' + datum.label + ' ' + s.label + ': ' + fmt(ccValue(datum, s)); }
/* The column that Right, Left, Home and End lead to from column `i` of `n`, or null for any other key. */
function ccStepTo(key, i, n) {
  return key === 'ArrowRight' ? Math.min(n - 1, i + 1) : key === 'ArrowLeft' ? Math.max(0, i - 1) : key === 'Home' ? 0 : key === 'End' ? n - 1 : null;
}
/* The series keys of a column's marks that can open: a non-zero value whose own target exists, with two or more series. */
function ccOpenMarks(props, series, datum) {
  if (series.length < 2) return [];
  return series.filter(function (s) { return ccValue(datum, s) && ccTarget(props, datum, s.key); }).map(function (s) { return s.key; });
}
/* A mark drawn under 8px isn't a separate pointer target: a click there opens the column. */
var CC_MIN_MARK = 8;
function ccMarkPointer(height) { return height >= CC_MIN_MARK; }

/* A tone's colour, as Progress segments map it; a series without one is the single-series colour. */
function ccToneClass(prefix, s) { return prefix + '--' + (CC_TONES.indexOf(s.tone) >= 0 ? s.tone : 'series'); }

function ColumnChart(props) {
  var series = props.series || [], data = props.data || [];
  var height = props.height > 0 ? props.height : 200;
  var warned = useRef(false);
  if (!warned.current && !props['aria-label'] && !props['aria-labelledby']) {
    warned.current = true;
    var prod = false;
    try { prod = process.env.NODE_ENV === 'production'; } catch (e) { /* no process: not a production build */ }
    if (!prod && typeof console !== 'undefined') console.warn('hyprsh: ColumnChart needs an accessible name. Pass aria-label or aria-labelledby.');
  }
  var viewState = useControllable(props.view, props.defaultView || 'chart', props.onViewChange);
  var view = viewState[0] === 'table' ? 'table' : 'chart', setView = viewState[1];
  var fmt = useMemo(function () {
    if (props.valueFormatter) return props.valueFormatter;
    try { var nf = new Intl.NumberFormat(undefined); return function (v) { return nf.format(v); }; } catch (e) { return String; }
  }, [props.valueFormatter]);
  var hoverState = useState(null), hovered = hoverState[0], setHovered = hoverState[1];
  var focusState = useState(null), focused = focusState[0], setFocused = focusState[1];
  var rovingState = useState(0), rovingIndex = rovingState[0], setRovingIndex = rovingState[1];
  var widthState = useState(0), plotWidth = widthState[0], setPlotWidth = widthState[1];
  var tipState = useState(null), tipPos = tipState[0], setTipPos = tipState[1];
  /* The room the plot has (the scroll area's width) and the target size, measured together. */
  var roomState = useState({ width: 0, target: CC_TARGET }), room = roomState[0], setRoom = roomState[1];
  var pickState = useState(null), picked = pickState[0], setPicked = pickState[1];
  var scrollState = useState(0), scrollTick = scrollState[0], setScrollTick = scrollState[1];
  var rootRef = useRef(null), plotRef = useRef(null), tipRef = useRef(null), scrollRef = useRef(null);
  var atEnd = useRef(true), drag = useRef(null), pickedRef = useRef(null), ghost = useRef(null);
  var named = { 'aria-label': props['aria-label'], 'aria-labelledby': props['aria-labelledby'] };

  var n = data.length;
  /* Marks are only separate targets when there is more than one series to tell apart. */
  var marksOn = series.length >= 2;
  var anyOpen = data.some(function (d) { return ccTarget(props, d) || ccOpenMarks(props, series, d).length; });
  var fit = ccFit(room.width, n, anyOpen, room.target);
  var ticks = ccTicks(Math.max.apply(null, [0].concat(data.map(function (d) { return ccTotal(series, d); }))));
  var max = ticks[ticks.length - 1];
  /* A pick holds only in pick mode and on a column that exists. */
  var pinned = fit.pick && view === 'chart' && picked !== null && picked < n ? picked : null;
  pickedRef.current = pinned;
  var active = pinned !== null ? pinned : hovered !== null ? hovered : focused;
  /* The Tab stop stays on a column that exists when `data` shrinks. */
  var tabStop = Math.min(rovingIndex, n - 1);
  if (active !== null && active >= n) active = null;
  var showLegend = props.legend !== false && series.length >= 2;

  useLayoutEffect(function () {
    var el = scrollRef.current, plot = plotRef.current;
    if (!el || !plot || view !== 'chart') return;
    var mql = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(CC_TOUCH_QUERY) : null;
    function measure() {
      var touch = !!(mql && mql.matches), token = 0;
      if (touch && rootRef.current) token = parseFloat(getComputedStyle(rootRef.current).getPropertyValue('--touch-target'));
      var next = { width: el.clientWidth, target: ccTargetSize(touch, token) };
      setRoom(function (p) { return p.width === next.width && p.target === next.target ? p : next; });
      setPlotWidth(plot.clientWidth);
    }
    measure();
    if (mql) { if (mql.addEventListener) mql.addEventListener('change', measure); else if (mql.addListener) mql.addListener(measure); }
    var ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    if (ro) { ro.observe(el); ro.observe(plot); } else window.addEventListener('resize', measure);
    return function () {
      if (ro) ro.disconnect(); else window.removeEventListener('resize', measure);
      if (mql) { if (mql.removeEventListener) mql.removeEventListener('change', measure); else if (mql.removeListener) mql.removeListener(measure); }
    };
  }, [view, n]);

  /* A scrolling plot opens at the last column, and stays at the end when `data` changes unless the reader scrolled away. */
  useLayoutEffect(function () { atEnd.current = true; }, [view]);
  useLayoutEffect(function () {
    var el = scrollRef.current;
    if (el && fit.scroll && atEnd.current) el.scrollLeft = el.scrollWidth;
  }, [fit.scroll, fit.minWidth, data, view]);

  /* The tooltip sits above the column, clamped inside the chart's bounds. */
  useLayoutEffect(function () {
    if (active === null || !tipRef.current || !plotRef.current || !rootRef.current) { setTipPos(null); return; }
    var tip = tipRef.current, pr = plotRef.current.getBoundingClientRect(), cr = rootRef.current.getBoundingClientRect();
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var center = pr.left - cr.left + (active + 0.5) / n * pr.width;
    var colTop = pr.top - cr.top + height - ccTotal(series, data[active]) / max * height;
    var next = { left: Math.round(Math.max(0, Math.min(center - tw / 2, cr.width - tw))), top: Math.round(Math.max(0, colTop - 8 - th)) };
    setTipPos(function (p) { return p && p.left === next.left && p.top === next.top ? p : next; });
  }, [active, pinned, plotWidth, height, n, view, data, scrollTick]);

  function closePin() { setPicked(null); setHovered(null); }
  /* Escape or a pointer down outside the chart closes the pinned tooltip. Escape from inside it returns focus to its column. */
  useDismiss(pinned !== null, [rootRef], function (reason) {
    var at = pickedRef.current, inTip = tipRef.current && tipRef.current.contains(document.activeElement);
    closePin();
    if (reason === 'escape' && inTip && at !== null) focusColumn(at, true);
  });
  /* Focus moving to anything outside the chart closes it too. (A tap can drop focus to the page for a moment, so focus
     merely leaving the chart doesn't count: a tap outside is caught as a pointer down.) */
  useEffect(function () {
    if (pinned === null) return;
    function onFocusIn(e) { if (rootRef.current && !rootRef.current.contains(e.target)) closePin(); }
    document.addEventListener('focusin', onFocusIn);
    return function () { document.removeEventListener('focusin', onFocusIn); };
  }, [pinned === null]);

  function focusColumn(i, quiet) {
    var el = plotRef.current && plotRef.current.querySelector('[data-index="' + i + '"]');
    if (el) el.focus(quiet ? { preventScroll: true } : undefined);
  }
  /* A link or button for a target: a link calls onOpen too, so an app can preventDefault and route in-app. */
  function openEl(target, attrs, children, datum, key, after) {
    var onClick = function (e) { if (props.onOpen) props.onOpen(datum, key, e); if (after) after(); };
    return target.href !== undefined
      ? h('a', Object.assign({ href: target.href, onClick: onClick }, attrs), children)
      : h('button', Object.assign({ type: 'button', onClick: onClick }, attrs), children);
  }
  function onKeyDown(e) {
    var attr = function (name) { return e.target.getAttribute && e.target.getAttribute(name); };
    var mark = attr('data-mark'), raw = mark !== null && mark !== undefined ? attr('data-col') : attr('data-index');
    if (raw === null || raw === undefined) return;
    var i = Number(raw);
    var slot = e.target.closest('.hy-column-chart__slot');
    var marks = slot ? Array.prototype.slice.call(slot.querySelectorAll('[data-mark]')) : [];
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      /* Up goes from a column into its marks, bottom to top, and Down comes back down to the column. */
      var at = mark !== null && mark !== undefined ? marks.indexOf(e.target) : -1;
      var next = e.key === 'ArrowUp' ? marks[at + 1] : at > 0 ? marks[at - 1] : null;
      if (next) { e.preventDefault(); next.focus(); }
      else if (e.key === 'ArrowDown' && at === 0) { e.preventDefault(); focusColumn(i); }
      else if (e.key === 'ArrowUp' && at >= 0) e.preventDefault();
      return;
    }
    var to = ccStepTo(e.key, i, n);
    if (to === null) return;
    e.preventDefault();
    focusColumn(to);
  }

  /* Pick, then open: a press on the plot picks the nearest column, a drag moves the pick, and focus goes to the picked
     column so the keyboard carries on from there. */
  function pickAt(e) {
    var r = plotRef.current.getBoundingClientRect(), i = ccPickIndex(e.clientX - r.left, r.width, n);
    setPicked(i); setRovingIndex(i); focusColumn(i, true);
  }
  function onPointerDown(e) {
    if (!fit.pick || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    drag.current = e.pointerId;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) { /* capture is a nicety */ }
    pickAt(e);
  }
  function onPointerMove(e) { if (drag.current === e.pointerId) pickAt(e); }
  function onPointerEnd(e) {
    if (drag.current !== e.pointerId) return;
    drag.current = null;
    /* A tap's click lands on whatever is under the finger once it lifts, which can be the tooltip it just pinned. */
    if (e.type === 'pointerup' && e.pointerType !== 'mouse') ghost.current = { t: Date.now(), x: e.clientX, y: e.clientY };
  }
  function onTipClick(e) {
    var g = ghost.current;
    ghost.current = null;
    if (g && Date.now() - g.t < 800 && Math.abs(e.clientX - g.x) < 12 && Math.abs(e.clientY - g.y) < 12) { e.preventDefault(); e.stopPropagation(); }
  }
  function onScroll(e) {
    var el = e.currentTarget;
    atEnd.current = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
    if (active !== null) setScrollTick(function (t) { return t + 1; });
  }

  if (!n) return h('div', { className: cx('hy-column-chart', props.className), style: props.style }, h('div', { className: 'hy-column-chart__empty' }, props.empty !== undefined ? props.empty : 'No Data'));

  var toggle = h(HY.Button, { variant: 'tertiary', size: 'small', className: 'hy-column-chart__toggle', onClick: function () { setView(view === 'chart' ? 'table' : 'chart'); } },
    view === 'chart' ? 'View as Table' : 'View as Chart');
  var legend = showLegend ? h('ul', { className: 'hy-column-chart__legend' }, series.map(function (s) {
    return h('li', { key: s.key, className: 'hy-column-chart__legend-item' },
      h('span', { className: cx('hy-column-chart__swatch', ccToneClass('hy-column-chart__swatch', s)), 'aria-hidden': 'true' }), s.label);
  })) : null;

  /* Chart view keeps its hidden table plain, so its links and buttons are not a second set of Tab stops. */
  var tableOpen = view === 'table';
  var table = h('div', { className: view === 'table' ? 'hy-column-chart__tablewrap' : 'hy-sr' }, h('table', Object.assign({ className: 'hy-column-chart__table' }, named),
    h('thead', null, h('tr', null,
      h('th', { scope: 'col' }, 'Label'),
      series.map(function (s) { return h('th', { key: s.key, scope: 'col' }, s.label); }),
      h('th', { scope: 'col' }, 'Total'))),
    h('tbody', null, data.map(function (d, i) {
      return h('tr', { key: i },
        h('th', { scope: 'row' }, tableOpen && ccTarget(props, d)
          ? openEl(ccTarget(props, d), { className: 'hy-column-chart__tablelink', 'aria-label': ccOpenColumnName(d, series, fmt) }, d.label, d)
          : d.label),
        series.map(function (s) {
          var v = ccValue(d, s), t = tableOpen && marksOn && v ? ccTarget(props, d, s.key) : null;
          return h('td', { key: s.key }, t ? openEl(t, { className: 'hy-column-chart__tablelink', 'aria-label': ccOpenMarkName(d, s, fmt) }, fmt(v), d, s.key) : fmt(v));
        }),
        h('td', null, ccTotalText(d, series, fmt)));
    }))));

  var tickChars = Math.max.apply(null, ticks.map(function (t) { return ccTickLabel(t).length; }));
  var labelChars = Math.max.apply(null, data.map(function (d) { return String(d.label).length; }));
  var slotW = plotWidth / n, shown = ccXLabels(n, slotW, labelChars);

  var cols = h('div', { className: 'hy-column-chart__cols' }, data.map(function (d, i) {
    var target = ccTarget(props, d), markKeys = ccOpenMarks(props, series, d);
    var segs = ccSegments(series, d, max, height);
    var visual = h('div', { className: 'hy-column-chart__col', 'aria-hidden': 'true' }, segs.map(function (g) {
      return h('span', {
        key: g.key, className: cx('hy-column-chart__seg', ccToneClass('hy-column-chart__seg', g), g.top && 'is-top'),
        style: { bottom: g.bottom, height: g.height }
      });
    }));
    var enter = function () { setHovered(i); }, leave = function () { setHovered(null); };
    /* While a tooltip is pinned, the pick follows keyboard focus. */
    var focusIn = function () { setFocused(i); setRovingIndex(i); setPicked(function (p) { return p === null ? p : i; }); };
    var focusOut = function () { setFocused(null); };
    if (!target && !markKeys.length) {
      return h('div', {
        key: i, role: 'img', 'data-index': i, tabIndex: tabStop === i ? 0 : -1,
        'aria-label': ccColumnName(d, series, fmt),
        className: cx('hy-column-chart__slot', active === i && 'is-active'),
        onMouseEnter: enter, onMouseLeave: leave, onFocus: focusIn, onBlur: focusOut
      }, visual);
    }
    /* An openable column or mark: the slot wraps the picture, a full-slot link or button (a plain image when only marks
       open) and a layer of mark targets. In pick mode they stay in the keyboard path but take no pointer. */
    var marks = markKeys.length ? segs.map(function (g) {
      var s = series.filter(function (x) { return x.key === g.key; })[0], t = markKeys.indexOf(g.key) >= 0 ? ccTarget(props, d, g.key) : null;
      if (!t) return null;
      return openEl(t, {
        key: g.key, 'data-col': i, 'data-mark': g.key, tabIndex: -1, 'aria-label': ccOpenMarkName(d, s, fmt),
        className: cx('hy-column-chart__mark', !ccMarkPointer(g.height) && 'is-thin'), style: { bottom: g.bottom, height: g.height }
      }, null, d, g.key);
    }) : null;
    return h('div', {
      key: i, className: cx('hy-column-chart__slot', 'hy-column-chart__slot--open', active === i && 'is-active'),
      onMouseEnter: enter, onMouseLeave: leave, onFocus: focusIn, onBlur: focusOut
    },
      visual,
      target
        ? openEl(target, { 'data-index': i, tabIndex: tabStop === i ? 0 : -1, 'aria-label': ccOpenColumnName(d, series, fmt), className: 'hy-column-chart__open' }, null, d)
        : h('div', { role: 'img', 'data-index': i, tabIndex: tabStop === i ? 0 : -1, 'aria-label': ccColumnName(d, series, fmt), className: 'hy-column-chart__open is-static' }),
      marks ? h('div', { className: 'hy-column-chart__marks' }, marks) : null);
  }));

  /* Each label is centred under its column but never reaches past the plot: it knows how far its centre is from each edge. */
  var xaxis = h('div', { className: 'hy-column-chart__xaxis', 'aria-hidden': 'true' }, data.map(function (d, i) {
    var label = shown.indexOf(i) >= 0 ? h('span', {
      className: 'hy-column-chart__xlabel', style: { '--hy-to-start': ((i + 0.5) * slotW) + 'px', '--hy-to-end': ((n - i - 0.5) * slotW) + 'px' }
    }, d.label) : null;
    return h('span', { key: i, className: 'hy-column-chart__xslot' }, label);
  }));

  /* The y axis sits outside the scroll area, so it stays in view when the plot scrolls. */
  var plot = h('div', { className: cx('hy-column-chart__body', fit.pick && 'is-pick', fit.scroll && 'is-scroll'), style: { gridTemplateColumns: (tickChars * 7 + 12) + 'px minmax(0, 1fr)' } },
    h('div', { className: 'hy-column-chart__yaxis', style: { height: height }, 'aria-hidden': 'true' }, ticks.map(function (t) {
      return h('span', { key: t, className: 'hy-column-chart__tick', style: { bottom: (t / max * 100) + '%' } }, ccTickLabel(t));
    })),
    h('div', { ref: scrollRef, className: 'hy-column-chart__scroll', onScroll: onScroll },
      h('div', { className: 'hy-column-chart__inner', style: fit.minWidth ? { minWidth: fit.minWidth } : undefined },
        h('div', Object.assign({
          ref: plotRef, className: 'hy-column-chart__plot', role: 'group', style: { height: height }, onKeyDown: onKeyDown,
          onPointerDown: fit.pick ? onPointerDown : undefined, onPointerMove: fit.pick ? onPointerMove : undefined,
          onPointerUp: fit.pick ? onPointerEnd : undefined, onPointerCancel: fit.pick ? onPointerEnd : undefined
        }, named),
          ticks.map(function (t, i) {
            return h('span', { key: 'g' + t, className: cx('hy-column-chart__grid', i === 0 && 'is-baseline'), style: { bottom: (t / max * 100) + '%' }, 'aria-hidden': 'true' });
          }),
          cols),
        xaxis)));

  /* The tooltip. Picked in pick mode, it is pinned and holds Open and, with two or more series, a control per mark. */
  var tip = null;
  if (view === 'chart' && active !== null) {
    var td = data[active], isPinned = pinned !== null;
    var colTarget = isPinned ? ccTarget(props, td) : null, tipMarks = isPinned ? ccOpenMarks(props, series, td) : [];
    var after = function () { var at = pickedRef.current; closePin(); if (at !== null) focusColumn(at, true); };
    tip = h('div', {
      ref: tipRef, className: cx('hy-tooltip__box hy-tooltip__box--start hy-column-chart__tip', isPinned && 'is-pinned'),
      'aria-hidden': isPinned ? undefined : 'true', role: isPinned ? 'group' : undefined, 'aria-label': isPinned ? td.label : undefined,
      /* A press inside keeps focus where it is, so it doesn't count as focus leaving the chart; the click still lands. */
      onPointerDown: isPinned ? function (e) { e.preventDefault(); } : undefined, onClickCapture: isPinned ? onTipClick : undefined,
      style: { left: tipPos ? tipPos.left : 0, top: tipPos ? tipPos.top : 0, visibility: tipPos ? 'visible' : 'hidden' }
    },
      h('div', { className: 'hy-column-chart__tip-title' }, td.label),
      ccTooltipRows(td, series, fmt).map(function (r) {
        var cells = [
          h('span', { key: 's', className: cx('hy-column-chart__swatch', ccToneClass('hy-column-chart__swatch', r)) }),
          h('span', { key: 'l', className: 'hy-column-chart__tip-label' }, r.label),
          h('span', { key: 'v', className: 'hy-column-chart__tip-value' }, r.value)];
        var t = tipMarks.indexOf(r.key) >= 0 ? ccTarget(props, td, r.key) : null;
        if (!t) return h('div', { key: r.key, className: 'hy-column-chart__tip-row' }, cells);
        var s = series.filter(function (x) { return x.key === r.key; })[0];
        return openEl(t, { key: r.key, 'data-mark': r.key, className: 'hy-column-chart__tip-row hy-column-chart__tip-action', 'aria-label': ccOpenMarkName(td, s, fmt) }, cells, td, r.key, after);
      }),
      h('div', { className: 'hy-column-chart__tip-row hy-column-chart__tip-total' },
        h('span', { className: 'hy-column-chart__tip-label' }, 'Total'),
        h('span', { className: 'hy-column-chart__tip-value' }, ccTotalText(td, series, fmt))),
      colTarget ? openEl(colTarget, { className: 'hy-column-chart__tip-open', 'aria-label': ccOpenColumnName(td, series, fmt) }, 'Open', td, undefined, after) : null);
  }

  return h('div', { ref: rootRef, className: cx('hy-column-chart', props.className), style: props.style },
    h('div', { className: 'hy-column-chart__toolbar' }, legend, toggle),
    view === 'chart' ? plot : null,
    table,
    tip);
}

define('ColumnChart', ColumnChart);
