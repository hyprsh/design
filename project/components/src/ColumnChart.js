/* ColumnChart: stacked columns on one y scale, with a legend, hover and focus tooltips, one Tab stop with roving keys,
   and a table view. Drawn from plain elements and tokens (ADR 0004). The pure parts (ticks, segment geometry, label
   thinning, names) are module-private functions: tests read them from the vm context. */
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
  var rootRef = useRef(null), plotRef = useRef(null), tipRef = useRef(null);
  var named = { 'aria-label': props['aria-label'], 'aria-labelledby': props['aria-labelledby'] };

  var n = data.length;
  var ticks = ccTicks(Math.max.apply(null, [0].concat(data.map(function (d) { return ccTotal(series, d); }))));
  var max = ticks[ticks.length - 1];
  var active = hovered !== null ? hovered : focused;
  /* The Tab stop stays on a column that exists when `data` shrinks. */
  var tabStop = Math.min(rovingIndex, n - 1);
  if (active !== null && active >= n) active = null;
  var showLegend = props.legend !== false && series.length >= 2;

  useLayoutEffect(function () {
    var el = plotRef.current;
    if (!el || view !== 'chart') return;
    function measure() { setPlotWidth(el.clientWidth); }
    measure();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', measure); return function () { window.removeEventListener('resize', measure); }; }
    var ro = new ResizeObserver(measure);
    ro.observe(el);
    return function () { ro.disconnect(); };
  }, [view, n]);

  /* The tooltip sits above the column, clamped inside the chart's bounds. */
  useLayoutEffect(function () {
    if (active === null || !tipRef.current || !plotRef.current || !rootRef.current) { setTipPos(null); return; }
    var tip = tipRef.current, pr = plotRef.current.getBoundingClientRect(), cr = rootRef.current.getBoundingClientRect();
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var center = pr.left - cr.left + (active + 0.5) / n * pr.width;
    var colTop = pr.top - cr.top + height - ccTotal(series, data[active]) / max * height;
    var next = { left: Math.round(Math.max(0, Math.min(center - tw / 2, cr.width - tw))), top: Math.round(Math.max(0, colTop - 8 - th)) };
    setTipPos(function (p) { return p && p.left === next.left && p.top === next.top ? p : next; });
  }, [active, plotWidth, height, n, view, data]);

  function focusColumn(i) {
    var el = plotRef.current && plotRef.current.querySelector('[data-index="' + i + '"]');
    if (el) el.focus();
  }
  function onKeyDown(e) {
    var raw = e.target.getAttribute && e.target.getAttribute('data-index');
    if (raw === null || raw === undefined) return;
    var i = Number(raw);
    var to = e.key === 'ArrowRight' ? Math.min(n - 1, i + 1) : e.key === 'ArrowLeft' ? Math.max(0, i - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : null;
    if (to === null) return;
    e.preventDefault();
    focusColumn(to);
  }

  if (!n) return h('div', { className: cx('hy-column-chart', props.className), style: props.style }, h('div', { className: 'hy-column-chart__empty' }, props.empty !== undefined ? props.empty : 'No Data'));

  var toggle = h(HY.Button, { variant: 'tertiary', size: 'small', className: 'hy-column-chart__toggle', onClick: function () { setView(view === 'chart' ? 'table' : 'chart'); } },
    view === 'chart' ? 'View as Table' : 'View as Chart');
  var legend = showLegend ? h('ul', { className: 'hy-column-chart__legend' }, series.map(function (s) {
    return h('li', { key: s.key, className: 'hy-column-chart__legend-item' },
      h('span', { className: cx('hy-column-chart__swatch', ccToneClass('hy-column-chart__swatch', s)), 'aria-hidden': 'true' }), s.label);
  })) : null;

  var table = h('div', { className: view === 'table' ? 'hy-column-chart__tablewrap' : 'hy-sr' }, h('table', Object.assign({ className: 'hy-column-chart__table' }, named),
    h('thead', null, h('tr', null,
      h('th', { scope: 'col' }, 'Label'),
      series.map(function (s) { return h('th', { key: s.key, scope: 'col' }, s.label); }),
      h('th', { scope: 'col' }, 'Total'))),
    h('tbody', null, data.map(function (d, i) {
      return h('tr', { key: i },
        h('th', { scope: 'row' }, d.label),
        series.map(function (s) { return h('td', { key: s.key }, fmt(ccValue(d, s))); }),
        h('td', null, ccTotalText(d, series, fmt)));
    }))));

  var tickChars = Math.max.apply(null, ticks.map(function (t) { return ccTickLabel(t).length; }));
  var labelChars = Math.max.apply(null, data.map(function (d) { return String(d.label).length; }));
  var step = ccThinStep(plotWidth / n, labelChars);

  var plot = h('div', { className: 'hy-column-chart__body', style: { gridTemplateColumns: (tickChars * 7 + 12) + 'px minmax(0, 1fr)' } },
    h('div', { className: 'hy-column-chart__yaxis', style: { height: height }, 'aria-hidden': 'true' }, ticks.map(function (t) {
      return h('span', { key: t, className: 'hy-column-chart__tick', style: { bottom: (t / max * 100) + '%' } }, ccTickLabel(t));
    })),
    h('div', Object.assign({ ref: plotRef, className: 'hy-column-chart__plot', role: 'group', style: { height: height }, onKeyDown: onKeyDown }, named),
      ticks.map(function (t, i) {
        return h('span', { key: 'g' + t, className: cx('hy-column-chart__grid', i === 0 && 'is-baseline'), style: { bottom: (t / max * 100) + '%' }, 'aria-hidden': 'true' });
      }),
      h('div', { className: 'hy-column-chart__cols' }, data.map(function (d, i) {
        return h('div', {
          key: i, role: 'img', 'data-index': i, tabIndex: tabStop === i ? 0 : -1,
          'aria-label': ccColumnName(d, series, fmt),
          className: cx('hy-column-chart__slot', active === i && 'is-active'),
          onMouseEnter: function () { setHovered(i); }, onMouseLeave: function () { setHovered(null); },
          onFocus: function () { setFocused(i); setRovingIndex(i); }, onBlur: function () { setFocused(null); }
        },
          h('div', { className: 'hy-column-chart__col', 'aria-hidden': 'true' }, ccSegments(series, d, max, height).map(function (g) {
            return h('span', {
              key: g.key, className: cx('hy-column-chart__seg', ccToneClass('hy-column-chart__seg', g), g.top && 'is-top'),
              style: { bottom: g.bottom, height: g.height }
            });
          })));
      }))),
    h('div', { className: 'hy-column-chart__xaxis', 'aria-hidden': 'true' }, data.map(function (d, i) {
      return h('span', { key: i, className: 'hy-column-chart__xslot' }, i % step === 0 ? h('span', { className: 'hy-column-chart__xlabel' }, d.label) : null);
    })));

  var tip = view === 'chart' && active !== null ? h('div', {
    ref: tipRef, className: 'hy-tooltip__box hy-tooltip__box--start hy-column-chart__tip', 'aria-hidden': 'true',
    style: { left: tipPos ? tipPos.left : 0, top: tipPos ? tipPos.top : 0, visibility: tipPos ? 'visible' : 'hidden' }
  },
    h('div', { className: 'hy-column-chart__tip-title' }, data[active].label),
    ccTooltipRows(data[active], series, fmt).map(function (r) {
      return h('div', { key: r.key, className: 'hy-column-chart__tip-row' },
        h('span', { className: cx('hy-column-chart__swatch', ccToneClass('hy-column-chart__swatch', r)) }),
        h('span', { className: 'hy-column-chart__tip-label' }, r.label),
        h('span', { className: 'hy-column-chart__tip-value' }, r.value));
    }),
    h('div', { className: 'hy-column-chart__tip-row hy-column-chart__tip-total' },
      h('span', { className: 'hy-column-chart__tip-label' }, 'Total'),
      h('span', { className: 'hy-column-chart__tip-value' }, ccTotalText(data[active], series, fmt)))) : null;

  return h('div', { ref: rootRef, className: cx('hy-column-chart', props.className), style: props.style },
    h('div', { className: 'hy-column-chart__toolbar' }, legend, toggle),
    view === 'chart' ? plot : null,
    table,
    tip);
}

define('ColumnChart', ColumnChart);
