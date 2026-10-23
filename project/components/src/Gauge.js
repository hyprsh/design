var GAUGE_PX = { tiny: 20, small: 32, medium: 64, large: 128 };
var GAUGE_GAP = { tiny: 9, small: 6, medium: 5, large: 5 };
var GAUGE_ICON = { tiny: 10, small: 16, medium: 32, large: 64 };
var GAUGE_DEFAULT_COLORS = { 0: 'var(--red-800)', 34: 'var(--amber-700)', 67: 'var(--green-700)' };

function gaugeThreshold(colors, value) {
  var keys = Object.keys(colors).map(Number).filter(function (k) { return !isNaN(k); }).sort(function (a, b) { return a - b; });
  var pick = keys.length ? colors[keys[0]] : undefined;
  keys.forEach(function (k) { if (value >= k) pick = colors[k]; });
  return pick;
}

/* One arc on a circle whose length is normalised to 100, starting `start` percent clockwise from 12 o'clock. */
function gaugeArc(r, sw, start, len, color, cls, key) {
  if (len <= 0) return null;
  return h('circle', {
    key: key, className: cls, cx: 50, cy: 50, r: r, fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round',
    pathLength: 100, strokeDasharray: len + ' ' + (100 - len), strokeDashoffset: -start, transform: 'rotate(-90 50 50)'
  });
}

/* A circular meter for a single 0–100 value. */
function Gauge(props) {
  var size = GAUGE_PX[props.size] ? props.size : 'medium';
  var px = GAUGE_PX[size];
  var tiny = size === 'tiny';
  var r = tiny ? 42.5 : 45, sw = tiny ? 15 : 10;
  var value = Math.max(0, Math.min(100, Number(props.value) || 0));
  var colors = props.colors || GAUGE_DEFAULT_COLORS;
  var primary = colors.primary !== undefined ? colors.primary : gaugeThreshold(colors, value);
  var secondary = colors.secondary !== undefined ? colors.secondary : 'var(--gray-alpha-400)';
  var fmt = useMemo(function () {
    try { return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }); } catch (e) { return { format: function (n) { return String(Math.round(n)); } }; }
  }, []);

  var arcs, centre = null;
  if (props.indeterminate) {
    arcs = gaugeArc(r, sw, 0, 100, 'var(--gray-alpha-400)', 'hy-gauge__track');
    centre = h(HY.Icon, { name: 'activity', size: GAUGE_ICON[size], className: 'hy-gauge__icon' });
  } else {
    var gap = value >= 100 || value <= 0 ? 0 : GAUGE_GAP[size];
    if (props.arcPriority === 'equal') {
      arcs = [gaugeArc(r, sw, gap / 2, value - gap, primary, 'hy-gauge__value', 'value'),
        gaugeArc(r, sw, value + gap / 2, 100 - value - gap, secondary, 'hy-gauge__track', 'track')];
    } else {
      arcs = [gaugeArc(r, sw, 0, value, primary, 'hy-gauge__value', 'value'),
        gaugeArc(r, sw, value + gap, 100 - value - 2 * gap, secondary, 'hy-gauge__track', 'track')];
    }
    if (props.children) centre = props.children;
    else if (props.showValue && !tiny) centre = h('span', { className: 'hy-gauge__number', 'aria-hidden': 'true' }, fmt.format(value));
  }

  return h('div', {
    className: cx('hy-gauge', 'hy-gauge--' + size, props.indeterminate && 'is-indeterminate', props.className),
    style: Object.assign({ width: px, height: px }, props.style),
    role: 'progressbar', 'aria-label': props['aria-label'] || 'Score', 'aria-valuemin': 0, 'aria-valuemax': 100,
    'aria-valuenow': props.indeterminate ? undefined : value, 'aria-busy': props.indeterminate || undefined
  },
    h('svg', { className: 'hy-gauge__svg', viewBox: '0 0 100 100', width: px, height: px, 'aria-hidden': 'true', focusable: 'false' }, arcs),
    centre ? h('span', { className: 'hy-gauge__centre' }, centre) : null);
}

define('Gauge', Gauge);
